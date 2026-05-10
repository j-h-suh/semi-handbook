# 0.4 TypeScript 판별 유니온과 타입 가드 — 잘못된 상태를 표현 불가능하게

---

## 이 챕터에서 배우는 것

- "잘못된 상태를 표현 불가능하게" 라는 타입 시스템 설계 발상
- 판별 유니온(discriminated union) — 상태와 데이터를 한 묶음으로 표현하기
- 타입 가드 — 분기 한 줄이 그 안의 타입을 좁힌다
- Python 의 `isinstance` 체크 / Pydantic Discriminator 와의 비교

---

## 사용자 경험에서 출발

Claude Code 코드를 읽다 보면 이런 패턴이 자주 등장한다.

```typescript
if (state.status === 'connected') {
  state.session.send(message)
}
```

`state` 가 `'connected'` 일 때만 `state.session.send(...)` 를 호출. 이 코드가 안전하다는 보장은 어디서 오는가? `state` 가 다른 상태인데 `state.session` 이 없으면 런타임 에러가 날 텐데, 컴파일러가 그것을 어떻게 막는가?

답은 한 줄로 — **TypeScript 의 두 가지 도구를 쓰면 잘못된 상태 자체를 코드에서 표현할 수 없게 만들 수 있다**. 두 도구는 **판별 유니온(discriminated union)** 과 **타입 가드(type guard)**. 이 챕터의 진짜 주제는 그 두 도구가 아니라 그것이 가능하게 하는 설계 발상이다 — 잘못된 상태가 코드에 나타나지조차 못하게 막는다는 발상.

7.2(MCP 5단계 상태 머신), 6.5(Hook 입출력), 3.3(buildTool) 같은 곳에서 이 패턴이 핵심이라, 미리 익혀두면 본문이 한결 가벼워진다.

---

## 잘못된 상태를 표현 불가능하게

연결 상태를 표현해보자. 직관적인 첫 시도는 이렇다.

```typescript
interface ConnectionState {
  status: 'idle' | 'connecting' | 'connected' | 'error'
  session?: Session         // connected 일 때만 의미 있음
  errorMessage?: string     // error 일 때만 의미 있음
  attempt?: number          // connecting 일 때만 의미 있음
}
```

깔끔해 보이지만 조용한 함정이 있다. 이 타입은 다음 같은, 의미상 유효하지 않은 상태들을 모두 허용한다.

- `{ status: 'idle', session: ..., errorMessage: '...' }` — idle 인데 session 도 있고 에러도 있다
- `{ status: 'connected' }` — connected 인데 session 이 없다
- `{ status: 'error' }` — error 인데 메시지가 없다

코드는 컴파일된다. 런타임에서야 잘못된 조합이 들통난다 — `if (state.session) state.session.send()` 같은 방어 코드를 곳곳에 깔아야 하고, 한 곳이라도 빠뜨리면 버그.

함수형 프로그래밍 커뮤니티에 오래된 격언이 있다 — **"잘못된 상태를 표현 불가능하게 만들어라" (make illegal states unrepresentable)**. 발상은 단순하다. 잘못된 조합이 표현만 안 되게 막아라. 그러면 그 조합은 코드에 등장할 수 없다. 방어 코드가 사라지고, 빠뜨릴 검사가 없어지고, "절대 일어나지 않을" 분기를 다룰 필요가 없어진다.

문제는 — 어떻게? 위 첫 시도는 분명히 잘못된 조합을 허용하고 있다. 답이 다음 절이다.

---

## 도구 1 — 판별 유니온

해법은 상태와 그 상태의 데이터를 한 묶음으로 표현하는 것. 각 상태마다 별개의 객체 모양을 정의하고, 그것들의 union 으로 묶는다.

```typescript
type ConnectionState =
  | { status: 'idle' }
  | { status: 'connecting'; attempt: number }
  | { status: 'connected'; session: Session }
  | { status: 'error'; errorMessage: string }
```

네 가지 변형. 각 변형마다 그 상태에서만 의미 있는 필드를 갖는다. 공통은 `status` 라는 한 필드 — 이게 어느 변형인지 알려주는 **판별자(discriminant)** 다. 이 패턴이 **판별 유니온(discriminated union)** 또는 tagged union 이라 불린다.

이제 잘못된 조합을 만들어보자.

```typescript
const x: ConnectionState = { status: 'idle', session: ... }      // 에러
const y: ConnectionState = { status: 'connected' }               // 에러
const z: ConnectionState = { status: 'error' }                   // 에러
```

위에 있던 모든 잘못된 조합이 컴파일 시점에 에러. 유효한 조합만 만들 수 있다. 잘못된 상태가 표현 불가능해진 것이다 — 처음에 말한 격언이 정확히 실현된 모습.

> **변형마다 별개의 모양을 정의하고 union 으로 묶으면, 잘못된 조합은 어떤 변형에도 속하지 않으므로 자동으로 차단된다.**

---

## 도구 2 — 타입 가드

판별 유니온 자체로 절반은 끝. 나머지 절반은 받았을 때 안전하게 다루기. 만들 때 잘못된 조합을 막는 게 판별 유니온이라면, 다룰 때 잘못된 접근을 막는 게 타입 가드.

```typescript
function handle(state: ConnectionState) {
  if (state.status === 'connected') {
    state.session.send(message)         // ✓ 안전
  } else if (state.status === 'error') {
    console.error(state.errorMessage)   // ✓ 안전
  }
  // state.session 을 if 밖에서 접근하려 하면? 컴파일 에러.
}
```

`if (state.status === 'connected')` 한 줄이 컴파일러에게 "그 블록 안에서 state 는 connected 변형" 이라고 알려준다. 그래서 `state.session` 접근이 안전해진다 — 다른 변형의 필드(`errorMessage`, `attempt`) 는 그 블록 안에서 존재하지 않는 것으로 처리된다.

이 동작 — 분기 조건이 그 분기 안의 타입을 좁힌다 — 을 **타입 narrowing** 이라고 부른다. 컴파일러가 control flow 를 분석해서, "어느 분기에 들어왔으면 어느 변형" 인지를 추적한다. 명시적인 캐스팅(`as Connected`) 같은 우회 없이, 평범한 `if` 문이 안전 보장을 자동으로 따라오게 한다.

> **`if` 한 줄이 런타임 분기와 타입 분기를 동시에 한다. 이게 판별 유니온과 만나면 안전 보장이 자동으로 따라온다.**

---

## Python 과의 비교

Python 에도 비슷한 도구가 있다 — `isinstance` 체크 + `match` 문 + Pydantic 의 `Discriminator`. 다만 메커니즘이 살짝 다르다.

```python
from dataclasses import dataclass

@dataclass
class Idle: pass

@dataclass
class Connected:
    session: "Session"

@dataclass
class Error:
    error_message: str

ConnectionState = Idle | Connected | Error

def handle(state: ConnectionState):
    if isinstance(state, Connected):
        state.session.send(message)         # mypy / pyright 가 narrowing
```

여러 변형을 한 곳에서 다룰 때는 Python 3.10+ 의 `match` 문이 자연스럽다. 클래스로 매칭하면서 필드 추출까지 한 번에.

```python
def handle(state: ConnectionState):
    match state:
        case Connected(session=s): s.send(message)
        case Error(error_message=msg): print(msg)
        case Idle(): pass
```

TypeScript 의 `switch (state.status) { case 'X': ... }` 와 같은 자리에 있는 도구다.

대응 관계의 핵심:

| | TypeScript | Python |
|--|-----------|--------|
| 변형 분기 키 | 객체 안의 값 (`status` 필드의 string) | 객체의 클래스 |
| 좁히기 트리거 (단일 분기) | `if (state.status === 'X')` | `if isinstance(state, X):` |
| 좁히기 트리거 (다중 분기) | `switch (state.status) { case 'X': ... }` | `match state: case X(...): ...` |
| 좁히기 주체 | TS 컴파일러 (본체) | mypy / pyright (외부 도구) |

차이의 핵심 — TypeScript 는 값으로 분기, Python 은 클래스 타입으로 분기. 그런데 Pydantic v2 의 `Discriminator` 는 값으로 분기 — TypeScript 판별 유니온과 가장 직접적인 매핑이다.

> 💡 **Pydantic v2 를 써봤다면** `Discriminator` 가 가장 가까운 매핑이다. JSON 파싱 시 `type` 필드를 보고 어느 변형인지 자동 결정.
>
> ```python
> from typing import Annotated, Literal
> from pydantic import BaseModel, Field
>
> class Idle(BaseModel):
>     type: Literal['idle']
>
> class Connected(BaseModel):
>     type: Literal['connected']
>     session: Session
>
> ConnectionState = Annotated[Idle | Connected, Field(discriminator='type')]
> ```

---

## Claude Code 에서의 활용

이 패턴이 본문에서 어디 나오는지 미리 짚어두자.

- **7.2 MCP 클라이언트** — 연결 상태가 5단계 판별 유니온. 각 단계마다 의미 있는 필드가 다르고, 잘못된 조합이 타입 차원에서 차단됨.
- **6.5 Hook 시스템** — Hook 의 입출력 페이로드가 `eventType` 으로 분기되는 판별 유니온.
- **에이전트 루프 이벤트** — `query.ts` 가 흘려보내는 이벤트가 `{ type: 'text' | 'tool_start' | 'tool_result' | ... }` 형태. UI 가 `if (event.type === 'X')` 분기로 안전하게 그린다.
- **3.3 buildTool 팩토리** — 도구 정의 옵션이 몇 가지 변형의 union.

각 위치에서 "아, 이게 0.4 에서 본 패턴이군" 하고 떠올리면 된다 — 잘못된 조합을 표현 불가능하게 만든 설계라고.

---

## 핵심 정리

- **이 챕터의 척추 — "잘못된 상태를 표현 불가능하게 만들어라".** 잘못된 조합이 표현조차 안 되면 그 조합은 코드에 등장할 수 없다. 방어 코드와 "절대 일어나지 않을" 분기가 사라진다.
- **판별 유니온은 그 발상의 도구.** 변형마다 별개의 모양을 정의하고 공통 필드(`type`, `status`) 로 묶는다 — 잘못된 조합은 어느 변형에도 속하지 않으므로 자동 차단.
- **타입 가드는 그 발상의 짝.** `if (state.type === 'X')` 한 줄이 런타임 분기와 타입 분기를 동시에 한다. 캐스팅 같은 우회 없이 안전한 필드 접근이 자동.
- **Python 의 `isinstance` + mypy 또는 Pydantic `Discriminator` 가 가장 가까운 매핑.** TypeScript 는 값 분기, Python 은 클래스 분기 (Pydantic 은 값 분기).
- **본문 곳곳에서 이 패턴이 등장한다.** 한 번 익혀두면 7.2, 6.5, 이벤트 union 의 핵심 코드가 빠르게 읽힌다.
