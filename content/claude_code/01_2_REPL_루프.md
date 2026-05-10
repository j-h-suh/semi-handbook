# 1.2 REPL 루프 — React 컴포넌트로 만든 터미널 대화창

---

## 이 챕터에서 배우는 것

- 부트스트랩이 끝난 후 마운트되는 "REPL"이 정확히 어떤 모양인가
- "터미널 안에 React 컴포넌트가 있다"는 게 실제로 무슨 뜻인가
- Claude Code의 메인 화면(`src/screens/REPL.tsx`)이 들고 있는 책임의 범위
- Python의 `Textual`과 어떻게 비슷하고 어떻게 다른가

> 이 챕터는 **큰 그림만** 잡는다. UI 계층의 디테일(`Ink`, 가상 스크롤, 스트리밍 부분 업데이트 등)은 **Part 5**에서 본격적으로 다룬다. 여기서는 "REPL은 사실 React 컴포넌트구나" 정도의 충격(?)만 받고 넘어가면 된다.

---

## 사용자 경험에서 출발

1.1에서 부트스트랩이 끝났다. import도 끝났고, `init()`도 끝났고, MDM과 Keychain도 준비됐다. 이제 화면에 REPL이 떠야 한다.

뜨면 이런 모습이다.

```
╭─────────────────────────────────────────────╮
│ ✻ Welcome to Claude Code!                   │
│   /help for help, /status for your status   │
│                                             │
│   cwd: /Users/me/projects/playground         │
╰─────────────────────────────────────────────╯

> _
```

여기서 메시지를 친다. 엔터. 응답이 토큰 단위로 흘러나온다. Claude가 도구를 부르면 작은 spinner와 함께 "Reading file..." 같은 표시가 뜬다. 결과가 들어오면 spinner가 사라지고 결과 박스가 나타난다. 위 화살표로 이전 입력을 끌어올 수 있다. `Esc`로 도중에 멈출 수 있다. `Shift+Tab`으로 권한 모드를 바꾼다.

이게 다 **단순한 `input()` / `print()` 루프가 아니다**. **진짜 UI**다. 박스 테두리가 있고, 색깔이 있고, 영역이 분리되어 있고, 스크롤이 되고, 동시에 여러 곳이 업데이트된다.

그리고 그 **진짜 UI**를 만든 도구가 — 놀랍게도 — **React**다.

---

## 본문

### REPL이 React 컴포넌트라는 의미

`src/screens/REPL.tsx`. **약 5,000줄짜리 거대한 파일**. 이 한 파일 안에 거의 모든 대화 관련 로직이 들어 있다. 그리고 이 파일은 **React 함수형 컴포넌트**다.

:::tabs

```typescript
// REPL.tsx 5,006 줄을 한 화면에 보여주려고 심하게 단순화한 모형
export function REPL({
  initialMessages,
  initialTools,
  systemPrompt,
  // ... 20+ 개의 prop
}: Props): React.ReactNode {
  // 지역 상태 — useState (이 컴포넌트 안에만, unmount 시 사라짐)
  const [messages, setMessages] = useState<MessageType[]>(initialMessages ?? [])
  const [streamMode, setStreamMode] = useState<SpinnerMode>('responding')
  // ... 수십 개의 useState, useEffect, useCallback

  // 앱 전역 상태 — useAppState (외부 store에 보관, 여러 컴포넌트가 공유) — Part 5.2 의 주제
  const toolPermissionContext = useAppState(s => s.toolPermissionContext)
  const mcp = useAppState(s => s.mcp)
  const tasks = useAppState(s => s.tasks)
  // ... 20+ 개의 useAppState

  return (
    <KeybindingSetup>
      <GlobalKeybindingHandlers ... />
      <CancelRequestHandler ... />
      <FullscreenLayout
        scrollable={<Messages messages={messages} tools={tools} ... />}
        bottom={<PromptInput onSubmit={handleSubmit} ... />}
      />
    </KeybindingSetup>
  )
}
```

```python
# Python 등가 — Textual로 같은 구조를 표현하면
from textual.app import App, ComposeResult
from textual.widgets import Static, Input, Footer
from textual.reactive import reactive
from textual.containers import VerticalScroll


class REPL(App):
    """Claude Code의 REPL.tsx에 대응하는 Textual 앱."""

    # 지역 상태 — React의 useState에 해당 (이 컴포넌트 안에만)
    messages: reactive[list[str]] = reactive(list)
    stream_mode: reactive[str] = reactive("idle")

    # 앱 전역 상태 — React의 useAppState에 해당 (여러 컴포넌트가 공유)
    # Textual에서는 App 레벨 속성 또는 별도 store로 관리
    tool_permission_context: dict = {}
    mcp_connections: list = []

    def compose(self) -> ComposeResult:
        """React의 return JSX에 해당 — UI 트리를 선언한다."""
        yield VerticalScroll(Static(id="messages"))  # 스크롤 가능한 메시지 영역
        yield Input(placeholder="> ")                # 하단 입력창
        yield Footer()                               # 키바인딩 안내

    async def on_input_submitted(self, event: Input.Submitted) -> None:
        """React의 handleSubmit에 해당."""
        self.messages = [*self.messages, f"User: {event.value}"]
        # LLM API 호출 시작 → 스트리밍 응답 처리
        await self.query_engine.submit(event.value)
```

:::

처음 보면 "잠깐, 이거 웹 페이지 만드는 코드 아니야?" 싶다. `<Box>`, `<Text>`, `useState`, `useEffect` — 다 React 문법 그대로다. 그런데 화면에 뜨는 건 브라우저의 DOM이 아니라 **터미널의 박스와 글자**다.

> 💡 **두 가지 디테일을 미리 짚어둔다:**
> 1. 상태가 두 종류로 나뉜다.
>    - **`useState`** — 이 컴포넌트(REPL) 안에서만 쓰이고 밖으로 공유되지 않는 상태. 컴포넌트가 unmount 되면 사라진다. 예: 메시지 리스트, 현재 스트리밍 모드.
>    - **`useAppState`** — 여러 컴포넌트가 함께 보는 앱 전역 상태. 세션이 살아 있는 동안 외부 store(Zustand 같은) 에 유지된다. 예: 권한 컨텍스트, MCP 연결, task 리스트. **Part 5.2** 에서 본격적으로 다룬다.
> 2. return JSX가 `<KeybindingSetup>`, `<FullscreenLayout>`, `<AlternateScreen>` 같은 wrapper들로 여러 겹 감싸여 있다. 키 입력 라우팅, 대체 화면 버퍼, 가상 스크롤 — 모두 React 컴포넌트로 표현되어 있다. **Part 5**에서 풀어본다.

이게 가능한 건 [**Ink**](https://github.com/vadimdemedes/ink)라는 라이브러리 덕분이다.

### Ink가 정확히 무엇을 해주는가

Ink는 한 문장으로 설명하면 이렇다.

> "React 컴포넌트 트리를 받아서, 터미널의 문자 격자에 그려준다."

내부적으로는 세 단계를 거친다.

```
[JSX 트리]                       ← React 가 반환 (= 가상 DOM)
   ↓
[Yoga 로 레이아웃 계산]           ← Ink 가 호출 (Yoga = React Native와 같은 layout 엔진)
   ↓
[2D 셀 배열 (문자 + ANSI 색)]     ← Ink 가 만듦
   ↓
[ANSI 코드로 stdout 출력]         ← Ink 가 출력
   ↓
[터미널 에뮬레이터가 화면에 그림]  ← OS / 터미널의 일
```

여기서 [JSX 트리] 는 0.3 에서 본 **가상 DOM** — 컴포넌트 함수가 반환한 객체 트리다 (JSX 가 빌드 타임에 `React.createElement(...)` 호출로 변환되어 평가된 결과).

**Ink 가 책임지는 범위는 [JSX 트리] 다음부터 [터미널 에뮬레이터] 직전까지** — Yoga 호출 → 셀 배열 생성 → ANSI 출력 세 단계가 모두 Ink 안에서 일어난다. Yoga 는 별도 라이브러리(Meta 의 cross-platform layout 엔진) 지만 Ink 가 의존성으로 가져와 안에서 쓰는 도구다.

`<Box flexDirection="column" padding={1}>` 같은 코드를 쓰면, Yoga가 "이 박스는 가로 80, 세로 5칸 차지하고, 안의 자식들을 세로로 정렬" 같은 좌표를 계산한다. 그 계산 결과를 ANSI 이스케이프 코드(`\x1b[31m` 같은 것)로 변환해서 stdout에 쓰면, 터미널 에뮬레이터가 그걸 보고 화면을 그린다.

**핵심 통찰**: Ink는 "JSX → 터미널" 변환기다. 그 외의 모든 것(상태 관리, 컴포넌트 라이프사이클, 이벤트 처리)은 **그냥 React 그대로**다. React 모르면 Ink도 어렵고, React 알면 Ink도 거의 무료다.

> 💡 **Python 비유:** Python에는 [`Textual`](https://textual.textualize.io/)이라는 비슷한 라이브러리가 있다. Rich의 자매 프로젝트. Textual도 컴포넌트, reactive 상태, 키 이벤트, CSS 스타일링을 한다. Ink와의 큰 차이점은 — Textual은 자체 컴포넌트 시스템인데, Ink는 React 위에 얹힌다는 것. React 생태계 전체를 그대로 쓸 수 있는 게 Ink의 강점이다.

### 그러면 `REPL.tsx` 안에는 뭐가 들어 있나

5,000줄짜리 거대한 파일이다. 카테고리만 훑어보자.

- **상태 관리**: 메시지 리스트, 스트리밍 텍스트, 로딩 플래그, 에러, 권한 모드, MCP 연결 상태, 검색 상태, 가상 스크롤 위치, 권한 다이얼로그 큐, 멀티 에이전트 task, ...
- **이벤트 처리**: 사용자 입력 제출, 키 단축키, 권한 다이얼로그 응답, 도구 호출 결과, 검색 키, 스크롤 키, 모드 전환, ...
- **LLM 쿼리 트리거**: `QueryEngine.submitMessage()` 호출 (`QueryEngine.ts:209`, **async generator**). 결과 스트림을 받아 상태 업데이트.
- **하위 컴포넌트**: `<Messages>`, `<PromptInput>`, `<SpinnerWithVerb>`, `<PermissionDialog>`, `<TranscriptSearchBar>`, `<FullscreenLayout>`, `<AlternateScreen>`, ...

**한 컴포넌트가 너무 많은 책임을 가진 것 아닌가?** 맞다. React 커뮤니티에서는 보통 "한 컴포넌트는 한 가지만"이라고 가르친다. REPL.tsx는 그 원칙을 좀 어긴다. 이유는 — 대화 흐름의 모든 상태가 서로 얽혀 있어서 분리하기가 까다롭기 때문이다. Part 5에서 이 트레이드오프를 다시 본다.

### 메시지 흐름의 골격

REPL이 마운트된 후, 한 사용자 입력에 대한 흐름은 다음과 같다.

```
[사용자가 메시지 타이핑 + 엔터]
       ↓
PromptInput의 onSubmit 콜백
       ↓
REPL의 handleSubmit
       ↓
setMessages([..., new UserMessage])    ← 화면에 즉시 반영
       ↓
QueryEngine.submitMessage(...)         ← LLM API 호출 시작
       ↓ (스트리밍 시작)
       │
       ├─→ 토큰 도착 → setStreamingText  ← 화면에 토큰 단위 업데이트
       │
       ├─→ 도구 호출 요청 → 도구 실행 → 결과 메시지 추가
       │
       └─→ 응답 종료 → setMessages([..., new AssistantMessage])
       ↓
[다음 입력 대기]
```

다이어그램에 등장하는 함수들의 역할을 한 줄씩 짚어두자.

- **`onSubmit`** — `PromptInput` 컴포넌트가 받는 콜백 prop. 사용자가 엔터를 누르면 호출됨.
- **`handleSubmit`** — REPL 이 그 콜백으로 등록한 함수. React 관례상 이벤트 핸들러는 `handle*` 접두사를 붙인다.
- **`setMessages` / `setStreamingText`** — `useState` 의 setter (0.3 에서 본 것). 호출하면 상태가 갱신되고 React 가 자동으로 컴포넌트를 다시 호출해 화면을 다시 그린다.

여기서 핵심 관찰이 있다. **LLM 응답이 흐르는 동안 set 함수가 계속 호출된다 — `setStreamingText` 가 매 토큰마다, `setMessages` 가 응답 종료 시.** 그때마다 React가 컴포넌트를 다시 렌더링하고, Ink가 변경된 부분만 ANSI로 다시 그린다. 매 토큰마다 화면 전체를 다시 그리는 게 아니라 **변경분만 diff해서 그린다.** 이 덕분에 1만 줄짜리 대화도 깜빡이지 않는다.

이 부분 업데이트 메커니즘은 Part 5.4에서 본격적으로 본다. 지금은 "React가 알아서 잘 한다" 정도로 받아들이고 가자.

---

## Python으로 옮기면

Python에서 가장 가까운 그림은 `Textual`이다. 같은 흐름을 Textual로 흉내 내면 이렇게 생겼다.

```python
from textual.app import App, ComposeResult
from textual.widgets import Static, Input
from textual.reactive import reactive

class ClaudeCodeREPL(App):
    messages: reactive[list[str]] = reactive([])
    streaming_text: reactive[str] = reactive("")

    def compose(self) -> ComposeResult:
        yield Static(id="messages")
        yield Input(placeholder="메시지를 입력하세요...")

    def watch_messages(self, messages: list[str]) -> None:
        # 상태가 바뀌면 자동으로 호출됨 (React의 useEffect와 비슷)
        self.query_one("#messages", Static).update("\n".join(messages))

    def watch_streaming_text(self, text: str) -> None:
        # 토큰 단위 스트리밍이 도착할 때마다 호출
        ...

    async def on_input_submitted(self, event: Input.Submitted) -> None:
        self.messages = [*self.messages, f"User: {event.value}"]
        await self.query_engine.submit(event.value)
        # LLM 응답이 흐르는 동안 self.streaming_text를 계속 갱신
```

핵심 장면이 그대로 있다.

- `reactive` 상태 → React의 `useState`
- `watch_*` 메서드 → `useEffect`
- `compose` → JSX 반환

다른 점은 Textual은 **자체 컴포넌트 시스템**을 쓴다는 것. Ink는 React 위에 얹혀 있어서 React 생태계의 훅, 라이브러리, 패턴을 그대로 가져다 쓸 수 있다. 반면 Textual은 자체적이라 일관성이 좋고 학습 곡선이 부드럽다. 트레이드오프다.

> 🔬 **Deep Dive — 왜 굳이 React인가?** Anthropic이 Ink를 선택한 이유는 "React를 아는 사람이 많아서"가 가장 크다고 본다. Claude Code가 처음 만들어질 때 Anthropic 내부 엔지니어 대부분이 React 경험이 있었을 거고, "새 UI 라이브러리 배워라"보다 "이미 아는 걸로 빠르게 만들어라"가 합리적이다. 그 결정이 지금 와서 보면 **터미널 UI에서 흔치 않은 풍부함**을 가능하게 했다. 권한 다이얼로그, 사이드 패널, 가상 스크롤, 모달 — 이게 다 React 패턴 그대로다.

---

## 핵심 정리

- 부트스트랩이 끝나면 마운트되는 "REPL"은 사실 **`src/screens/REPL.tsx`라는 React 함수형 컴포넌트**다. 단순한 input/output 루프가 아니다.
- React가 터미널에서 돌아가는 건 **Ink** 라이브러리 덕분. Ink의 역할 한 줄: "JSX 트리 → Yoga 레이아웃 → ANSI 코드 → stdout".
- REPL.tsx는 **약 5,000줄**의 거대한 파일이다 (`src/` 안에서 가장 큰 파일 중 하나). 메시지 상태, 키 입력, LLM 쿼리 트리거, 권한 다이얼로그, 스트리밍 업데이트, 검색, 가상 스크롤, 멀티 에이전트 view가 다 들어 있다. 한 컴포넌트에 책임이 집중된 건 의도적인 트레이드오프다.
- 상태가 두 종류로 나뉜다 — `useState` (한 컴포넌트만의 상태) vs `useAppState` (여러 컴포넌트가 공유하는 앱 전역 store). 후자는 Part 5.2의 주제.
- LLM 응답이 흐르는 동안 매 토큰마다 `setState`가 호출되고, React + Ink가 변경분만 다시 그린다. 깜빡임 없이 부드러운 스트리밍 표시가 가능한 이유.
- Python으로 비슷한 걸 만들면 **Textual**이 가장 가깝다. 다만 Textual은 자체 컴포넌트 시스템, Ink는 React 위에 얹힌다는 차이가 있다.
- **자세한 건 Part 5에서.** 여기서는 "REPL은 5,000줄짜리 React 컴포넌트구나"라는 충격(?)을 가지고 다음으로 가면 된다.

