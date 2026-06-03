# 4.3 데이터 모델 — nodes와 events

## 이 챕터에서 배우는 것

- 4.2의 "이벤트 누적"을 실제로 담는 **두 개의 테이블** — `nodes`와 `events`
- 왜 한 테이블이 아니라 둘인가 — *공간 축*(어느 갈래)과 *시간 축*(그 갈래에서 무슨 순서)
- 이벤트를 끝에만 덧붙이는(append-only) 저장소 인터페이스 — `create_node` · `append_event`
- 루트에서 현재 노드까지 거슬러 올라가는 길을 SQL 한 번으로 얻는 법 (재귀 CTE)
- 이 모델이 4.4 `replay`와 5장 분기·롤백의 *공통 토대*라는 것

---

## 두 가지를 따로 묻는다

4.2에서 우리는 상태를 "이벤트의 누적"으로 표현하기로 했다. 그럼 그 이벤트들을 어디에, 어떻게 담아야 할까.

이벤트를 그냥 한 줄로 죽 쌓으면 될 것 같지만, 분기가 있는 순간 두 가지를 *따로* 물어야 한다.

- **공간**: 지금 나는 어느 갈래에 있나? B에서 갈라진 C 갈래인가, D 갈래인가?
- **시간**: 이 갈래에서 무슨 일이, 무슨 순서로 일어났나?

이 둘은 다른 질문이다. 그래서 우리는 데이터 모델도 둘로 나눈다. **갈래의 구조를 담는 `nodes` 테이블(공간)과, 각 갈래에서 벌어진 일을 순서대로 담는 `events` 테이블(시간).** 데이터 상태 하나가 이렇게 공간 축과 시간 축, 두 테이블로 갈린다.

> 💡 **4.2의 git을 이어서**: `nodes`는 git의 *커밋 그래프*(부모 포인터로 잇는 DAG)와 같은 꼴이다. 다만 4.2에서 봤듯 git은 각 지점에 *스냅샷*을 두는 반면 우리는 그 지점에 *변경 이벤트*를 쌓고, 그 그래프도 git의 객체 저장소가 아니라 평범한 관계형 테이블에 직접 그린다 — 우리 손으로, 우리 도메인의 연산 단위로.

## 공간 축 — `nodes` 트리

먼저 갈래의 구조다. 노드 하나가 트리의 한 지점이고, `parent_id`로 부모를 가리킨다. 루트만 부모가 없다(`NULL`).

```sql
-- 공간 축: 갈래의 트리
CREATE TABLE nodes (
    id          TEXT PRIMARY KEY,
    parent_id   TEXT REFERENCES nodes(id),   -- 루트는 NULL
    session_id  TEXT,                         -- 이 갈래에 묶인 대화 세션 (5.2)
    created_at  TEXT NOT NULL
);
```

`parent_id` 하나가 트리의 전부다. B에서 C와 D 두 갈래를 치면, C와 D는 둘 다 `parent_id = B`를 가리킨다 — 같은 부모를 보는 형제다. 이게 4.2에서 "분기는 형제 삽입"이라고 한 말의 실체다. 새 갈래는 거대한 사본이 아니라 `parent_id` 하나가 박힌 행 하나다.

`session_id`는 잠깐 눈여겨 두자. 5.2에서 대화 축(`fork()`로 만든 세션)과 데이터 축(이 노드)을 *하나로 묶을* 때, 그 끈이 바로 이 칸이다. 지금은 빈칸으로 두고, 노드가 곧 대화 세션과 짝지어진다는 것만 기억하면 된다.

## 시간 축 — `events` 로그

다음은 각 노드에서 벌어진 일이다. 한 노드 안에서 이벤트는 `seq` 순서로 쌓인다.

```sql
-- 시간 축: 각 노드에 쌓이는 변경 이벤트
CREATE TABLE events (
    node_id   TEXT    NOT NULL REFERENCES nodes(id),
    seq       INTEGER NOT NULL,               -- 노드 안에서의 순서
    op        TEXT    NOT NULL,               -- 'merge', 'drop_nulls', ...
    payload   TEXT    NOT NULL,               -- JSON: 연산의 인자
    PRIMARY KEY (node_id, seq)
);
```

이벤트 하나가 의미 단위 연산 하나다. `op`는 무슨 연산인지(`merge`), `payload`는 그 연산의 인자(어떤 키로, 어떤 테이블을)다. 예컨대 "lot_id로 공정 파라미터 테이블을 머지했다"는 이렇게 한 행이 된다 — `op="merge"`, `payload={"on": "lot_id", "table": "process_params"}`.

핵심은 이 테이블에 **`UPDATE`도 `DELETE`도 쓰지 않는다**는 것이다. 오직 `INSERT`만. 한번 쌓인 이벤트는 고쳐지지 않는다. 저장소 인터페이스도 그 규율을 그대로 드러낸다.

```python
class Store:
    """트리(nodes) + 이벤트(events)를 담는 append-only 상태 저장소."""

    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn

    def create_node(self, parent_id: str | None) -> str:
        """부모 아래 빈 노드를 하나 만든다 (분기점)."""
        node_id = uuid4().hex
        self._conn.execute(
            "INSERT INTO nodes(id, parent_id, created_at) VALUES (?, ?, ?)",
            (node_id, parent_id, datetime.now(UTC).isoformat()),
        )
        return node_id

    def append_event(self, node_id: str, op: str, payload: dict) -> None:
        """노드의 로그 끝에 이벤트 하나를 덧붙인다. 고쳐쓰기는 없다."""
        seq = self._next_seq(node_id)
        self._conn.execute(
            "INSERT INTO events(node_id, seq, op, payload) VALUES (?, ?, ?, ?)",
            (node_id, seq, op, json.dumps(payload)),
        )
```

`append_event`라는 이름이 곧 계약이다. 더한다(append)뿐, 바꾸지 않는다. 이 규율 하나가 4.2가 약속한 "과거가 사라지지 않는다"를 코드 수준에서 보증한다.

## 두 축을 잇기 — 루트까지 거슬러 오르기

이제 두 테이블을 합쳐 본다. "지금 노드의 상태"를 알려면, 4.2에서 말했듯 루트부터 이 노드까지의 이벤트를 순서대로 접어야 한다. 그 첫 단계가 **루트까지 거슬러 오르는 길**을 구하는 것이다 — 공간 축을 따라.

`parent_id`를 타고 올라가는 일이라, SQL의 **재귀 CTE(recursive CTE)**로 한 번에 끝난다.

```sql
WITH RECURSIVE ancestry(id, parent_id, depth) AS (
    SELECT id, parent_id, 0 FROM nodes WHERE id = :target
    UNION ALL
    SELECT n.id, n.parent_id, a.depth + 1
    FROM nodes n JOIN ancestry a ON n.id = a.parent_id
)
SELECT id FROM ancestry ORDER BY depth DESC;   -- 루트 → target 순서
```

이 쿼리가 돌려주는 건 루트에서 target까지의 노드 id 목록, 그것도 *위에서 아래 순서*다. 이 길을 따라 각 노드의 `events`를 `seq` 순으로 이어 붙이면, 루트부터 지금까지의 전체 이벤트 흐름이 된다 — 공간 축(노드 경로)과 시간 축(노드 안 `seq`)이 여기서 만난다.

그 이어 붙인 흐름을 *실제 테이블로 접는* 일이 다음 챕터, `replay`다. 4.3은 그 재료를 가지런히 깔아 두는 데까지다.

## 왜 한 테이블이 아닌가

마지막으로 못박자. 이벤트마다 `parent` 정보를 같이 넣어 한 테이블로 합칠 수도 있지 않나? 안 된다. 두 축을 섞으면 4.2가 공짜로 얻은 것을 도로 잃는다.

갈래가 갈라지는 지점을 떠올려 보자. C와 D는 B까지의 역사를 *공유*한다. 트리를 따로 두면 B는 노드 하나로 한 번만 존재하고, C·D는 그저 B를 가리킨다 — 공유가 공짜다. 그런데 이벤트에 경로를 통째로 박아 넣으면, B까지의 이벤트가 C용·D용으로 복제되기 시작한다. 스냅샷의 그 폭발이 다른 옷을 입고 돌아오는 것이다.

**`nodes`는 "어느 갈래"를, `events`는 "무슨 순서"를 답한다.** 두 질문을 두 테이블로 갈라 둔 덕분에 조상은 공유되고 갈래는 싸진다.

> ✅ **검증됨 (검증 레포)**: 위 두 테이블 스키마·append-only `Store`·재귀 CTE를 harness로 구현해 돌렸다 — `create_node`/`append_event`, 루트→target ancestry(루트 우선 순서), `parent_id` 외래키 강제(`PRAGMA foreign_keys=ON`), `payload` JSON 왕복까지 확인. 본문 스니펫은 *모델의 모양*에 집중하느라 스키마 초기화·`_next_seq` 같은 플러밍을 생략했고, 그 전체 구현은 검증 레포(`harness/store.py`)에 있다. 단 `_next_seq`는 *단일 스레드* 전제 — 동시 append의 경합은 아직 검증 밖이다.

---

## 핵심 정리

- **상태 모델은 두 테이블이다 — `nodes`(공간)와 `events`(시간).** 노드는 `parent_id`로 갈래의 트리를 그리고, 이벤트는 각 노드 안에서 `seq` 순으로 쌓인다.
- **`events`는 오직 `INSERT`다.** `append_event`라는 이름이 곧 계약 — 더하되 고치지 않는다. 4.2의 "과거가 사라지지 않는다"가 여기서 코드로 보증된다.
- **루트까지의 길은 재귀 CTE 한 번이다.** `parent_id`를 타고 올라 루트→현재 경로를 얻고, 그 길의 이벤트를 `seq` 순으로 이으면 전체 흐름이 된다 — 4.4 `replay`의 재료.
- **두 축을 섞지 않아 조상이 공짜로 공유된다.** 이벤트에 경로를 박으면 스냅샷의 복제 폭발이 되돌아온다. 트리와 로그를 갈라 둔 것이 분기를 싸게 만든다.

---

*다음 챕터: 4.4 replay — 로그를 접어 상태를 만들기*
