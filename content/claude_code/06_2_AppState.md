# 6.2 AppState — 세션의 모든 것을 담는 그릇 — 단, 메시지는 빼고

---

## 이 챕터에서 배우는 것

- 5.2에서 본 **35줄 store**가 진짜로 들고 있는 것은 무엇인가
- AppState의 약 85개 필드를 카테고리로 묶어 머릿속에 정리하기
- 놀라운 사실 — **대화 메시지는 AppState에 들어 있지 않다**. 그게 무엇을 의미하는가
- 그 예외가 알려주는 **AppState의 진짜 정체** — **세션의 컨트롤 상태**
- 6.3과 6.4의 권한 시스템이 왜 **AppState 위에서** 사는지

---

## 사용자 경험에서 출발

세션을 한 시간쯤 진행했다. 입력창에 친다 — 자동완성이 뜬다. 푸터를 보면 — 모델 이름, 비용, 토큰 사용량, 모드(`plan`), 내가 지금 어떤 작업을 하는지가 다 보인다. `/permissions`를 누르면 — 권한 다이얼로그가 이 세션의 권한 룰을 보여준다. 백그라운드에서 도는 네 개의 서브 에이전트가 푸터에 표시된다. 

생각해보면 — 이 모든 정보가 어딘가에 있다. 그리고 어딘가가 같은 곳에 있다. 한 화면에서 모순 없이 모든 정보가 일치한다. 

그 어딘가가 **AppState**다. 5.2에서 본 35줄짜리 store가 들고 있는 단 한 객체. 이번 챕터에서는 그 객체의 내용물을 본다. 그리고 — 거기에 안 들어 있는 것이 무엇인지도.

---

## 본문

### `AppState` 타입 — 약 85개 필드

`src/state/AppStateStore.ts:89`에 진짜 타입이 있다.

:::tabs

```typescript
// (축약: 실제 ~86개 top-level 필드 중 12개만 발췌. DeepImmutable 안 ~32개 + & 뒤 ~54개)
export type AppState = DeepImmutable<{
  settings: SettingsJson
  verbose: boolean
  mainLoopModel: ModelSetting
  toolPermissionContext: ToolPermissionContext
  // ... ~33개 더
}> & {
  tasks: { [taskId: string]: TaskState }
  agentNameRegistry: Map<string, AgentId>
  mcp: { clients, tools, commands, resources, pluginReconnectKey }
  plugins: { enabled, disabled, commands, errors, installationStatus, needsRefresh }
  fileHistory: FileHistoryState
  notifications: { current, queue }
  speculation: SpeculationState
  // ... ~44개 더
}
```

```python
# Python 등가 — AppState를 dataclass로 표현하면
from dataclasses import dataclass, field

@dataclass
class AppState:
    """전체 세션 상태 — 약 85개 필드를 5개 카테고리로."""
    # 1️⃣ 설정/모델
    settings: dict = field(default_factory=dict)
    verbose: bool = False
    main_loop_model: str = "claude-opus-4-6"

    # 2️⃣ 도구/플러그인
    mcp_tools: list = field(default_factory=list)
    plugins: dict = field(default_factory=dict)

    # 3️⃣ 권한/안전
    tool_permission_context: dict = field(default_factory=dict)

    # 4️⃣ 실행 상태
    tasks: dict = field(default_factory=dict)

    # 5️⃣ UI 상태 (Textual에서는 reactive로 처리)
    # ...
```

:::

**약 85개** top-level 필드. 다 외울 필요 없다. **5개 카테고리**로 묶으면 머릿속에 들어온다.

![AppState 의 5 카테고리 (~85 필드)](/content/claude_code/images/06_2/appstate_categories.svg)

5개 카테고리. 3.2에서 Tool 인터페이스를 5개 카테고리로 묶었던 것과 같은 사고. 큰 객체는 카테고리로 나눠야 다룰 수 있다.

### 카테고리별로 무엇이 사는지

**1️⃣ 설정/모델** — 사용자 설정, 현재 모델, verbose 플래그, thinking 모드 등. 거의 변하지 않는 필드. 사용자가 `/model`을 누를 때 정도만 바뀐다.

**2️⃣ 도구/플러그인** — `mcp.tools` (MCP 서버에서 가져온 도구들), `plugins.commands` (플러그인이 등록한 슬래시 명령), `agentDefinitions` (서브 에이전트 정의). 시작 시점에 한 번 채워지고, **MCP 재연결**이나 **/reload-plugins** 시에 다시 채워진다.

**3️⃣ 권한/안전** — `toolPermissionContext`. 4.3에서 본 그 권한 슬롯들이 사는 자리. 6.3과 6.4에서 본격적으로 다룬다. 세션 동안 가장 자주 바뀌는 필드 중 하나. 사용자가 *"항상 허용"* 을 누를 때마다, `/permissions` 룰을 편집할 때마다, 슬래시 명령이 시작/끝날 때마다 — 이 필드가 갱신된다.

**4️⃣ 실행 상태** — 지금 무엇이 돌고 있나. `tasks` (백그라운드 태스크), `todos` (TODO 리스트), `speculation` (preview 추론 진행 상황), `agentNameRegistry` (서브 에이전트 이름 → ID). 매 순간 변한다.

**5️⃣ UI/네트워크 상태** — 가장 큰 카테고리. 어느 푸터 항목이 선택됐나, status line 텍스트는 무엇인가, 원격 세션 연결 상태는, 알림 큐에 뭐가 있나, ... 각 컴포넌트가 자기 슬라이스만 구독해서(5.2의 selector 패턴) 자기 부분만 다시 그린다.

### 놀라움: 메시지는 AppState에 없다

자, 여기서 검사. AppState 안에 대화 메시지는 어디 있나? `messages: Message[]` 같은 필드를 찾아보자.

```bash
grep "^\s*messages:" src/state/AppStateStore.ts
```

결과:
```
53:  messages: Message[]              ← SpeculationResult 안 (sub-type)
352:    messages: Array<{...}>        ← inbox.messages (팀원 알림 메시지)
543:      messages: [],                ← inbox.messages 초기값
```

세 개 다 대화 메시지가 아니다. 53줄은 speculation의 결과 타입, 352줄은 **팀원 inbox**(다른 시스템). **AppState에 사용자-LLM 대화 메시지를 담는 필드가 없다.**

그러면 어디에? `REPL.tsx:1182-1183`에 답이 있다.

```typescript
const [messages, rawSetMessages] = useState<MessageType[]>(initialMessages ?? [])
const messagesRef = useRef(messages)
```

**두 줄이 한 쌍**이다. `useState` 가 **React 의 reconciliation**을 거치는 **render projection**, `useRef` 는 그것의 동기 사본. **AppState store 의 selector 옵저버 시스템 (5.2 에서 본 것) 밖에 있다.** AppState 의 `setState` 가 일으키는 알림 폭발을 피한다.

같은 파일 코멘트 (`REPL.tsx:1189-1197`) 가 정확히 왜 인지를 말해준다 — verbatim:

> **"Wrap setMessages so messagesRef is always current the instant the call returns — not when React later processes the batch. ... This is the Zustand pattern: ref is source of truth, React state is the render projection. Without this, paths that queue functional updaters then synchronously read the ref (e.g. handleSpeculationAccept → onQuery) see stale data."**

**Zustand 패턴** — **ref 가 진실의 원천**, **React state 는 그 투영**. 5.2 의 **35 줄짜리 store**가 정확히 이 패턴이다 (`useSyncExternalStore` + 외부 ref). 메시지도 같은 패턴을 복사했다 — 단, AppState 의 옵저버 시스템 밖에 따로 살게.

### 왜 메시지는 분리됐나

이게 이 챕터의 진짜 통찰이다. 모든 게 한 곳에 있어야 하는데, 왜 메시지만 예외인가?

**이유 1: 양이 너무 크다.** 한 세션에 수천 개 메시지가 쌓인다. 각 메시지는 텍스트 + tool_use 블록 + tool_result 블록을 가진 복잡한 객체. AppState에 넣으면 — 매 `setState`마다 **전체 메시지 배열을 spread해야** 한다 (immutable update). 5.3에서 본 27,000개 메시지 케이스를 떠올려보자. 1,000번 spread하면 — 메모리도, GC 압력도 폭발.

**이유 2: 매 토큰마다 변한다.** LLM 스트리밍에서 마지막 메시지가 매 토큰마다 갱신된다. 그때마다 **전체 AppState를 새 객체로** 만든다고? **초당 30~60번** 일어난다. 다른 카테고리(설정, 권한, ...)는 몇 분에 한 번 바뀌는데 메시지만 초당 60번 바뀌면 — 옵저버 알림이 폭발하고, **모든 selector가 다 호출**된다 (selector는 **전체 state 객체**에 대해 호출). CPU가 폭발한다.

**이유 3: 부분 업데이트가 자연스럽다.** 대화 메시지는 **append-mostly** 한다. 추가가 절대 다수, 수정은 가끔. 가변 ref(`useRef`)로 **직접 push**하면 — 뭐 하나도 다시 만들 필요 없이 끝난다. immutable update의 이점이 여기서는 없다.

이 셋이 합쳐져서 — **메시지는 옵저버 패턴 밖으로 빼낸다**. AppState는 컨트롤 상태만, 메시지는 **별도 ref**. 컴포넌트가 메시지를 보고 싶으면 — `messagesRef.current`를 직접 읽는다. 옵저버 알림 대신 — 명시적인 리렌더 트리거로 다시 그린다.

### 그러면 AppState는 무엇인가

이 예외가 알려준다. **AppState는 대화가 아니다. 대화의 컨테이너다.**

```
대화 = messagesRef (별도, 가변, 빠른 추가)
컨테이너 = AppState (모든 *나머지*)
   - 어떤 모델로?
   - 어떤 권한으로?
   - 어떤 도구가 등록돼 있나?
   - 어떤 모드로?
   - 어느 태스크가 백그라운드로 도나?
   - 어떤 알림이 큐에 있나?
   - 푸터의 어디가 선택됐나?
```

대화의 내용은 분리되고, 대화의 환경은 한 군데. 

이 분리가 **왜 6장의 권한 시스템이 AppState 위에 있는지**를 설명한다. 권한 결정은 지금 어떤 모드인가, 어떤 룰이 있나, 어느 명령이 도는 중인가 같은 환경 정보에 의존한다. 메시지의 내용에는 의존하지 않는다. 그래서 권한 시스템은 **AppState만 보면 충분**하다 — 메시지를 안 봐도 된다. 분리가 자연스럽다.

<details>
<summary>🔬 Deep Dive — 왜 이게 깊은 패턴인가</summary>

> 큰 시스템을 짤 때 모든 상태를 한 곳에 모으자는 충동이 든다 (Redux의 single source of truth). 근데 진짜로 모으면 — 변경 빈도가 다른 상태들이 한 객체에 섞인다. 자주 바뀌는 부분이 모든 옵저버를 깨운다. 캐시가 깨진다. CPU가 폭발한다. **해결: 변경 빈도가 비슷한 것끼리 묶고, 극단으로 자주 바뀌는 것은 옵저버 밖으로 뺀다.** Claude Code는 이걸 명시적으로 한다. AppState (안), messagesRef (밖). 둘이 역할이 다르다. 한 곳에 모으는 게 항상 옳지는 않다.

</details>

### `getDefaultAppState()` — 시작 모양

`AppStateStore.ts:456`. 새 세션이 시작될 때 **AppState의 초기값**. **약 114줄짜리 함수**.

:::tabs

```typescript
// (축약: 약 70개 필드 중 12개만 발췌. mcp/plugins 의 sub-필드도 일부 생략)
export function getDefaultAppState(): AppState {
  // teammate 인 경우 plan 모드, 아니면 default
  const initialMode: PermissionMode =
    teammateUtils.isTeammate() && teammateUtils.isPlanModeRequired()
      ? 'plan'
      : 'default'

  return {
    settings: getInitialSettings(),     // settings.json 읽음
    tasks: {},                          // 빈 맵
    agentNameRegistry: new Map(),
    verbose: false,
    mainLoopModel: null,
    toolPermissionContext: { ...getEmptyToolPermissionContext(), mode: initialMode },
    mcp: { clients: [], tools: [], commands: [], resources: {}, pluginReconnectKey: 0 },
    plugins: { enabled: [], disabled: [], commands: [], errors: [], installationStatus: {...}, needsRefresh: false },
    notifications: { current: null, queue: [] },
    elicitation: { queue: [] },
    inbox: { messages: [] },
    // ... 약 60개 더 다 빈 값
  }
}
```

```python
# Python 등가 — 시작 모양: 거의 모든 게 빈 값
def get_default_app_state() -> AppState:
    initial_mode = (
        "plan"
        if teammate_utils.is_teammate() and teammate_utils.is_plan_mode_required()
        else "default"
    )
    return AppState(
        settings=get_initial_settings(),  # settings.json 읽음
        tasks={},
        agent_name_registry={},
        verbose=False,
        main_loop_model=None,
        tool_permission_context=ToolPermissionContext(mode=initial_mode),
        mcp=MCPState(),
        plugins=PluginState(),
        # ... 약 60개 더 다 빈 값 — 부트스트랩이 비동기로 채운다
    )
```

:::

거의 모든 게 빈 값. 시작 시점엔 — 아무것도 없다. 부트스트랩(1.1)이 진행되면서 하나씩 채워진다. 사용자가 첫 명령을 칠 때쯤이면 — 100개 필드가 대부분 채워져 있다. 

이 점진적 채움이 1장에서 본 **부트스트랩의 30ms**가 가능한 이유 중 하나다. **시작 시점엔 빈 객체 하나**, 그 위에 다른 시스템이 비동기로 자기 부분을 채운다. 어느 시스템이 늦어도 — 다른 시스템의 시작을 막지 않는다. 빈 값으로 기다린다.

---

## Python으로 옮기면

같은 구조를 Python으로 옮기면 이렇게 생겼다.

```python
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any


# ─── 5개 카테고리로 묶은 AppState ────────────────
@dataclass
class Settings:
    model: str = "claude-opus-4-6"
    verbose: bool = False
    thinking_enabled: bool = False


@dataclass
class ToolsAndPlugins:
    mcp_tools: list[Any] = field(default_factory=list)
    plugin_commands: list[Any] = field(default_factory=list)
    agent_definitions: list[Any] = field(default_factory=list)


@dataclass
class PermissionContext:
    # 외부 5가지: acceptEdits / bypassPermissions / default / dontAsk / plan
    # 추가 내부 2가지: auto (TRANSCRIPT_CLASSIFIER feature flag 뒤), bubble
    mode: str = "default"
    always_allow_rules: dict[str, list[str]] = field(default_factory=dict)
    deny_rules: dict[str, list[str]] = field(default_factory=dict)


@dataclass
class ExecutionState:
    tasks: dict[str, Any] = field(default_factory=dict)
    todos: dict[str, list[str]] = field(default_factory=dict)
    foregrounded_task_id: str | None = None


@dataclass
class UIState:
    footer_selection: str | None = None
    status_line_text: str | None = None
    expanded_view: str = "none"
    notifications_queue: list[str] = field(default_factory=list)


@dataclass
class AppState:
    """모든 컨트롤 상태가 여기 산다. 단, 메시지는 빼고."""
    settings: Settings = field(default_factory=Settings)
    tools: ToolsAndPlugins = field(default_factory=ToolsAndPlugins)
    permissions: PermissionContext = field(default_factory=PermissionContext)
    execution: ExecutionState = field(default_factory=ExecutionState)
    ui: UIState = field(default_factory=UIState)


# ─── 메시지는 별도 — 가변 ref 같은 패턴 ────────────────
class MessagesRef:
    """옵저버 패턴 밖에 사는 메시지 컨테이너. 직접 mutate."""
    def __init__(self) -> None:
        self.current: list[dict] = []
    
    def append(self, msg: dict) -> None:
        self.current.append(msg)  # 그냥 mutate, 알림 안 보냄
    
    def stream_append_to_last(self, token: str) -> None:
        """매 토큰마다 호출 — 마지막 메시지에 토큰 덧붙이기."""
        if self.current:
            self.current[-1]["content"] += token
        # 옵저버 알림 없음. UI는 명시적인 리렌더 트리거로 다시 그림.


# ─── 사용 ────────────────
from src.state.store import Store  # 5.2의 35줄 store

app_state_store = Store(AppState())  # 컨트롤 상태 — 옵저버 패턴 안
messages_ref = MessagesRef()         # 메시지 — 옵저버 패턴 밖

# 권한 모드 변경 → 옵저버 알림 → /permissions 다이얼로그가 다시 그림
app_state_store.set_state(
    lambda s: AppState(
        settings=s.settings,
        tools=s.tools,
        permissions=PermissionContext(mode="plan", **vars(s.permissions)),
        execution=s.execution,
        ui=s.ui,
    )
)

# 토큰 도착 → ref에 직접 append → 옵저버 알림 없음
for token in stream_llm_response():
    messages_ref.stream_append_to_last(token)
    # UI는 별도 메커니즘으로 다시 그림 (예: requestAnimationFrame)
```

핵심 셋이 다 있다.

1. **5개 카테고리**로 묶인 AppState — 컨트롤 상태만.
2. **MessagesRef**는 옵저버 패턴 밖 — 매 토큰마다 mutate해도 다른 곳을 깨우지 않음.
3. **두 시스템의 역할 분리** — AppState는 환경, MessagesRef는 대화.

> 💡 **Redux도 이 패턴을 추천한다.** 큰 Redux 앱에서는 **normalizr** 같은 라이브러리로 상태를 정규화해서 큰 컬렉션을 분리한다. 가장 큰 컬렉션은 **별도 store** 또는 외부 캐시에 두는 게 흔하다. **"single source of truth"의 진짜 의미는 한 객체가 아니라 명확하게 책임이 분리된 곳**이다.

---

## 핵심 정리

- **AppState는 약 85개 필드**를 가진 한 객체. 5개 카테고리로 묶으면 머리에 들어옴: 설정/모델, 도구/플러그인, 권한/안전, 실행 상태, **UI/네트워크**.
- 5.2에서 본 35줄 store가 들고 있는 게 바로 이 객체. selector 패턴 덕분에 ~85개 필드짜리 거대 객체가 효율적으로 부분 구독된다.
- **놀라운 사실**: **대화 메시지는 AppState에 없다**. `useState<MessageType[]>` (render projection) + `useRef(messages)` (source of truth) — **Zustand 패턴**으로 **AppState store의 selector 옵저버 시스템 밖**에 산다 (`REPL.tsx:1182-1183`).
- 왜 분리했나: 메시지는 너무 크고, 너무 자주 바뀌고, **append-mostly**. AppState 안에 넣으면 매 토큰마다 **전체 객체 spread** + **모든 selector 호출** → CPU 폭발. 분리하면 **AppState 옵저버는 깨지 않은 채** 메시지만 mutate.
- 이 분리가 **AppState의 진짜 정체**를 드러낸다 — **세션의 컨트롤 상태**. 대화의 내용이 아니라 대화의 환경. 모델, 권한, 도구, 모드, 실행 중인 태스크, UI 위젯 상태.
- **왜 6장 권한 시스템이 AppState 위에 있는지**: 권한 결정은 환경 정보(어떤 모드, 어떤 룰, 어느 명령)에 의존하고 메시지 내용에는 의존하지 않는다. AppState만 보면 충분 → 자연스럽게 거기 산다.
- "Single source of truth"의 진짜 의미는 한 객체가 아니라 명확하게 책임이 분리된 곳. 변경 빈도가 극단으로 다르면 분리하는 게 옳다.
- 다음 챕터(6.3): AppState 안의 `toolPermissionContext.mode` — **외부 권한 모드 5가지** (`acceptEdits` / `bypassPermissions` / `default` / `dontAsk` / `plan`). 내부 모드 (`auto`, `bubble`) 까지 합치면 7가지. (`types/permissions.ts:16-28`)

