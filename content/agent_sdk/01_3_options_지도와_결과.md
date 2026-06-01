# 1.3 Options 지도와 결과 처리

## 이 챕터에서 배우는 것

- `ClaudeAgentOptions`의 자주 쓰는 손잡이들을 *의사결정 축*으로 읽는 법
- 흘러나오는 메시지를 타입별로 가려 받는 법
- 한 메시지 안에 든 여러 *블록*(텍스트·도구 호출)을 다루는 법
- 옵션 전체를 외우는 대신 "어느 손잡이가 어느 질문에 답하나"로 기억하기

---

## 다이얼과 계기판

1.1과 1.2에서 우리는 `query()`와 `ClaudeSDKClient`를 불렀지만, `options`와 흘러나오는 메시지는 슬쩍 넘겼다. 이제 그 둘을 지도로 편다.

둘은 한 **계기판**의 양면이다. `options`는 출발 전에 *돌려놓는 다이얼* — 보내기 전에 내가 고르는 것이다. 메시지는 비행 중에 *읽는 게이지* — 받을 때 분류하는 것이다. 하나는 입력, 하나는 출력. 같은 패널의 두 방향이다.

> 💡 **비유의 한계 — 게이지는 한눈에 보이지만 메시지는 흘러간다**: 진짜 계기판은 모든 바늘이 *동시에* 보이는 정지 화면이다. 메시지 스트림은 그렇지 않다 — 시간 순으로 *하나씩 흘러나오는 피드*다. 그래서 게이지를 "읽는다"기보다 흐름을 *받아 분류한다*에 가깝다. 다이얼(보내기 전 고정)과 게이지(받으며 변함)의 비대칭을 염두에 두자.

## 자주 쓰는 다이얼 — options

`ClaudeAgentOptions`엔 손잡이가 많지만, 다 외울 필요는 없다. *어느 손잡이가 어느 질문에 답하나*로 기억하면 된다.

| 손잡이 | 답하는 질문 | 다룬 곳 |
|---|---|---|
| `model` | 어느 모델로 돌릴까 | — |
| `system_prompt` | 에이전트의 역할은 | — |
| `allowed_tools` / `disallowed_tools` | 무슨 도구를 쥐어줄까 | 2.1 |
| `permission_mode` / `can_use_tool` | 위험한 행동을 어떻게 막을까 | 2.1 · 7.3 |
| `mcp_servers` | 외부 시스템을 어떻게 붙일까 | 2.2 · 2.3 |
| `max_turns` | 폭주를 어디서 끊을까 | — |
| `resume` / `fork_session` | 세션을 잇거나 가를까 | 1.2 · 5.2 |

```python
options = ClaudeAgentOptions(
    model="claude-opus-4-8",
    system_prompt="너는 반도체 wafer 수율 분석가다. 머지 전 키를 항상 확인한다.",
    allowed_tools=["mcp__analysis__merge_tables"],
    permission_mode="default",
    max_turns=20,            # 한 호출이 20턴을 넘으면 끊는다
)
```

손잡이 대부분은 이 책의 다른 장에서 *왜 그렇게 돌리는지*까지 다룬다. 1.3에선 "이 패널에 이런 다이얼들이 있다"는 지도만 쥐면 된다.

> ⚙️ **`max_turns`는 싼 안전벨트다**: 에이전트가 같은 자리를 맴돌면 비용(6.2)이 샌다. `max_turns`로 상한을 두면 폭주가 자동으로 끊긴다 — 거의 공짜인 안전장치다.

## 받는 우편을 분류한다 — 메시지 타입

이제 게이지 쪽. 스트림에서 흘러나오는 메시지는 한 종류가 아니다. 우편함에 청구서·엽서·소포가 섞여 오듯, 종류별로 다른 정보를 싣고 온다. `isinstance`로 분류해 받는다.

```python
from claude_agent_sdk import AssistantMessage, ResultMessage, SystemMessage

async for msg in client.receive_response():
    if isinstance(msg, SystemMessage):
        ...                          # init 등 시스템 신호 (예: session_id, 1.2)
    elif isinstance(msg, AssistantMessage):
        ...                          # 에이전트의 말과 도구 호출 (아래)
    elif isinstance(msg, ResultMessage):
        print(f"끝. 비용 ${msg.total_cost_usd:.4f}")   # 최종 결과·사용량 (6.2)
```

주요한 셋만 쥐면 된다. **`SystemMessage`**는 초기화 같은 시스템 신호(1.2에서 `session_id`를 여기서 꺼냈다), **`AssistantMessage`**는 에이전트의 말과 행동, **`ResultMessage`**는 맨 끝의 최종 결과와 사용량이다.

## 한 메시지 안에도 블록이 여럿

`AssistantMessage` 하나에도 여러 **블록(block)**이 들어 있다. 에이전트가 "lot_id로 머지하겠습니다"라고 *말하면서*(텍스트 블록) 동시에 머지 도구를 *부르는*(도구 호출 블록) 식이다. 1.1에서 "결과만 골라낸다"며 넘긴 그 안쪽이 여기다.

```python
from claude_agent_sdk import TextBlock, ToolUseBlock

if isinstance(msg, AssistantMessage):
    for block in msg.content:
        if isinstance(block, TextBlock):
            print("말:", block.text)
        elif isinstance(block, ToolUseBlock):
            print("도구 호출:", block.name, block.input)   # 예: merge_tables {"on": "lot_id"}
```

`msg.content`를 돌며 블록 타입으로 가른다. 텍스트는 화면에 보여주고, 도구 호출은 로그나 트레이스로 흘린다(6.1). 무엇을 어디로 보낼지는 앱 설계의 몫이고, 그 본격적인 소비는 3.1에서 다룬다.

## 이제 본 게임으로

여기까지가 Part 1이다. 호출하는 두 방식(`query()`·`ClaudeSDKClient`)과, 보내기 전 다이얼(`options`)·받을 때 게이지(메시지 타입)를 손에 쥐었다. 에이전트를 *부르고 결과를 받는* 법은 갖춰졌다.

다음 Part는 방향을 튼다. 부르기만 하던 에이전트에게 *능력*을 쥐어준다 — 무슨 도구를 줄지 고르고, 내 로직을 도구로 노출하고, 외부 시스템을 연결한다.

> ⚠️ **코드 미검증 — 검증 레포 실행 필요**: 위 옵션 손잡이 이름·메시지 타입(`SystemMessage`/`AssistantMessage`/`ResultMessage`)·블록 타입(`TextBlock`/`ToolUseBlock`)·필드는 설계 초안이다. 정확한 타입명과 속성은 검증 레포에서 실제 SDK 버전으로 확인해야 한다.

---

## 핵심 정리

- **옵션은 외우지 말고 "어느 손잡이가 어느 질문에 답하나"로 읽는다.** 모델·역할·도구·권한·MCP·턴 상한·세션 — 각 손잡이는 이 책 어딘가에서 *왜 그렇게 돌리는지*까지 다룬다.
- **`max_turns`는 거의 공짜인 안전벨트다.** 폭주를 자동으로 끊어 비용 누수를 막는다.
- **메시지는 타입별로 분류해 받는다.** `SystemMessage`(시스템 신호)·`AssistantMessage`(말·행동)·`ResultMessage`(최종·사용량) 셋이 핵심이다.
- **한 `AssistantMessage`에도 블록이 여럿이다.** `content`를 돌며 `TextBlock`(말)과 `ToolUseBlock`(도구 호출)을 갈라 다룬다 — 본격 소비는 3.1.

---

*다음 챕터: 2.1 내장 도구 고르기 — 가용성 vs 권한*
