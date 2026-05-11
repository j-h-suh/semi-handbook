# 5.2 AppState 스토어 — Redux 없이 만든 단순 옵저버

---

## 이 챕터에서 배우는 것

- Claude Code의 모든 공유 상태를 담는 그릇이 어떻게 생겼는지
- 35줄짜리 `store.ts` 파일이 Redux를 통째로 대체하는 메커니즘
- React 18의 `useSyncExternalStore` 훅이 외부 스토어를 React에 어떻게 묶는지
- **selector 패턴**으로 부분 구독을 만들어 불필요한 리렌더를 막는 법
- **왜 Redux를 안 쓰는가** — 작은 도구 하나면 충분한 케이스

---

## 사용자 경험에서 출발

5.1에서 **터미널에 React**가 있다는 걸 봤다. 그러면 자연스러운 다음 질문 — 컴포넌트들이 공유하는 상태는 어디에 사는가?

생각해보면 화면에 동시에 보이는 게 많다.

```
┌────────────────────────────────────────────┐
│  > 이 함수 리팩토링해줘            (입력)    │
│                                            │
│  ⠋ Bash: ls -la                  (스피너)   │  
│                                            │
│  Model: opus-4-6  ●●○○○ 12% used   (푸터)   │
│  Mode: plan       Cost: $0.42              │
└────────────────────────────────────────────┘
```

이 정보들 — 현재 모델, 남은 토큰, 모드, 비용, 돌고 있는 도구, 권한 정책 — 은 각자 다른 컴포넌트가 그린다. 입력창은 입력창대로, 푸터는 푸터대로, 스피너는 스피너대로. 그런데 서로 같은 데이터를 봐야 한다. 모드가 바뀌면 푸터도 바뀌고, 메시지 입력도 영향을 받고, 권한 시스템도 바뀐다.

이 공유 상태를 어디에 두는가? 답은 — **`AppState`** 라는 한 객체에. 그리고 그 객체를 다루는 35줄짜리 스토어에. 이 챕터의 주제다.

---

## 본문

### `store.ts` 전체 — 35줄

`src/state/store.ts` 파일을 통째로 가져와도 35줄이다.

:::tabs

```typescript
type Listener = () => void
type OnChange<T> = (args: { newState: T; oldState: T }) => void

export type Store<T> = {
  getState: () => T
  setState: (updater: (prev: T) => T) => void
  subscribe: (listener: Listener) => () => void
}

export function createStore<T>(
  initialState: T,
  onChange?: OnChange<T>,
): Store<T> {
  let state = initialState
  const listeners = new Set<Listener>()

  return {
    getState: () => state,

    setState: (updater: (prev: T) => T) => {
      const prev = state
      const next = updater(prev)
      if (Object.is(next, prev)) return       // ← 변화 없으면 no-op
      state = next
      onChange?.({ newState: next, oldState: prev })
      for (const listener of listeners) listener()   // ← 모두에게 알림
    },

    subscribe: (listener: Listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
```

```python
# Python 등가 — 옵저버 패턴의 가장 작은 형태
from dataclasses import dataclass, field
from typing import Callable, TypeVar, Generic

T = TypeVar("T")

@dataclass
class Store(Generic[T]):
    """35줄짜리 store.ts의 Python 등가."""
    _state: T
    _listeners: set[Callable] = field(default_factory=set)

    def get_state(self) -> T:
        return self._state

    def set_state(self, updater: Callable[[T], T]) -> None:
        prev = self._state
        next_state = updater(prev)
        if next_state is prev:  # ← Object.is 등가 — 같은 객체면 no-op
            return
        self._state = next_state
        for listener in self._listeners:
            listener()  # 모두에게 알림

    def subscribe(self, listener: Callable) -> Callable:
        self._listeners.add(listener)
        return lambda: self._listeners.discard(listener)
```

:::

이게 전부다. 진짜로. 다른 파일은 안 본다. 

세 가지 메서드, 한 줄짜리 조기 종료(early-out), 한 줄짜리 알림 루프. **옵저버 패턴의 가장 작은 형태**다.

> 💡 **GoF의 옵저버 패턴 그대로다.** 학교에서 배우는 그 패턴 — **Subject가 상태를 들고 있고, Observer들이 구독하고, 상태가 바뀌면 모두에게 통지**. 35줄. 추상 클래스도 인터페이스도 없다. 함수 하나다.

### `Object.is` 조기 종료가 본질적인 이유

23줄을 다시 보자.

```typescript
if (Object.is(next, prev)) return
```

업데이터가 같은 객체를 돌려주면 — 아무것도 하지 않는다. 알림도 안 보낸다.

왜 중요한가? **불필요한 리렌더를 막기 때문**이다. React 컴포넌트가 100개 구독하고 있는데 상태가 사실 안 바뀌었다면, 알림 한 번에 100번의 리렌더가 트리거된다. 모든 컴포넌트가 "바뀐 거 없네, 그대로 그리자"를 결정하느라 CPU가 돈다. `Object.is` 한 줄로 그 사이클 전체가 안 일어난다.

이게 정확히 같은 패턴이 React 자체와 5.1의 Ink diff에도 들어 있다. **"안 바뀐 건 건드리지 않는다"** 가 React 생태계 전반의 핵심 원칙이다. `store.ts`에서도, Ink의 셀 diff에서도, React의 가상 DOM에서도.

### 어떻게 React와 연결되나 — `useSyncExternalStore`

`store.ts`는 React에 대해 모른다. 함수 하나, generic 하나. **순수 TypeScript**다. 그럼 React 컴포넌트가 어떻게 이걸 구독하는가?

`AppState.tsx`의 142줄.

:::tabs

```typescript
export function useAppState(selector) {
  const store = useAppStore()
  
  const get = () => {
    const state = store.getState()
    return selector(state)
  }
  
  return useSyncExternalStore(store.subscribe, get, get)
}
```

```python
# Python 등가 — Textual의 reactive가 같은 역할을 한다
from textual.reactive import reactive

class MyWidget(Widget):
    # reactive 속성 — 값이 바뀌면 자동으로 위젯이 다시 그려진다
    model: reactive[str] = reactive("opus")
    verbose: reactive[bool] = reactive(False)

    def watch_model(self, new_value: str) -> None:
        """model이 바뀔 때만 호출된다 (selector + 자동 구독)."""
        self.update(f"Model: {new_value}")
    # verbose가 바뀌어도 이 위젯은 영향 안 받음 — 부분 구독
```

:::

핵심은 **`useSyncExternalStore`** — React 18에 들어온 훅. "외부 스토어를 React에 안전하게 연결한다"라는 한 줄짜리 목적의 훅이다. 세 가지 인자를 받는다.

1. **`store.subscribe`** — **알림이 오면 React가 다시 렌더하라**는 신호. 우리 `store.ts`의 그 `subscribe`. 정확히 맞는다.
2. **`get`** — 현재 값을 어떻게 가져오나. 우리 `getState()`를 호출하고 **selector를 통과시킨** 결과.
3. **`get`** (서버 사이드 렌더링용) — 같은 함수 또 한 번.

이 셋이 들어가면 — React는 "이 컴포넌트는 이 외부 스토어를 구독한다"를 알게 된다. 스토어가 알림을 보내면, React가 이 컴포넌트만 다시 렌더한다.

> 🔬 **Deep Dive — 왜 `useState` + `useEffect`로는 안 되나?** 옛날에는 `useState` + `useEffect`로 외부 스토어를 묶곤 했다. 근데 **concurrent rendering**에 들어가면서 문제가 생긴다 — React가 컴포넌트를 여러 번 시뮬레이션하면서 렌더링하는 경우, 외부 상태가 렌더링 도중에 바뀌면 tearing(일부 컴포넌트는 옛 상태, 일부는 새 상태로 그려지는 현상)이 일어난다. `useSyncExternalStore`는 동기적으로 외부 상태를 끌어와서 그 tearing을 원천 차단한다. 이래서 React 18에 전용 훅으로 들어왔다. "외부 스토어를 React에 묶으라"는 한 가지 일을 정확히 잘 한다.

### selector 패턴 — 부분 구독

`useAppState`의 시그니처를 보자.

```typescript
const verbose = useAppState(s => s.verbose)
const model = useAppState(s => s.mainLoopModel)
```

한 컴포넌트가 두 개의 슬라이스만 본다. `s => s.verbose`가 selector. AppState 객체 전체에서 그 한 필드만 골라낸다. 

핵심은 — **그 필드가 안 바뀌면 컴포넌트는 안 다시 그려진다**. AppState의 다른 100개 필드가 바뀌어도 — 이 컴포넌트의 selector는 같은 값을 돌려준다. `useSyncExternalStore`가 **Object.is로 비교**해서 변화 없음을 알아챈다. 리렌더 안 일어남.

이게 거대한 단일 스토어가 효율적일 수 있는 이유다. AppState는 수십 개 필드를 가진 거대한 객체지만, 각 컴포넌트는 자기에게 관심 있는 슬라이스만 구독한다. 푸터는 `model`만, 권한 다이얼로그는 `toolPermissionContext`만, 토큰 카운터는 `mainLoopModel.usage`만.

```
                    ┌───────────────────────┐
                    │      AppState         │
                    │  ┌──────────────────┐ │
                    │  │ verbose: false   │ │
                    │  │ model: opus-4-6  │ │
                    │  │ tasks: {...}     │ │
                    │  │ permissions: {}  │ │
                    │  │ ... 50개 더       │ │
                    │  └──────────────────┘ │
                    └─────┬──────┬──────┬───┘
                          │      │      │
              selector ┌──┘      │      └──┐
                       │         │         │
              s=>s.verbose  s=>s.model  s=>s.permissions
                       │         │         │
                       ▼         ▼         ▼
              ┌──────────┐ ┌─────────┐ ┌──────────────┐
              │ Header   │ │ Footer  │ │ PermDialog   │
              └──────────┘ └─────────┘ └──────────────┘
```

푸터의 `model`이 바뀌어도 — **Header와 PermDialog는 안 다시 그려진다**. 각자 자기 selector가 같은 값을 돌려주니까.

> ⚠️ **함정 — selector 안에서 새 객체 만들지 말 것.** `AppState.tsx:136-140` 의 docstring 이 직접 경고한다: **"Do NOT return new objects from the selector — Object.is will always see them as changed. Instead, select an existing sub-object reference"**. 매번 새 객체 (`s => ({ a: s.a, b: s.b })`) 를 돌려주면 — `Object.is` 가 항상 다르다고 판단해서 매 알림마다 리렌더가 일어난다. 부분 구독의 핵심이 무력화된다. 대신 **기존 sub-object 참조** (`s => s.promptSuggestion`) 를 골라라. 위 다이어그램의 효율성은 **selector가 새 객체를 만들지 않는다는 가정 위에 서 있다**.

### 더 나아가 — `useSetAppState()`

170줄에 또 영리한 게 하나 있다.

```typescript
export function useSetAppState() {
  return useAppStore().setState
}
```

이건 **setter만** 돌려준다. 구독은 안 한다. 즉 — 이 훅을 쓰는 컴포넌트는 상태 변화에 영향을 안 받는다. 다시 그려지지도 않는다.

언제 쓰는가? **"읽지는 않고 쓰기만 하는"** 컴포넌트. 예: 자동완성 다이얼로그. 사용자가 항목을 고르면 `setState`로 AppState에 반영해야 하지만, **AppState 자체는 안 본다**. 그러면 `useSetAppState()` 한 번만 쓰면 된다 — 리렌더 0회.

이 두 훅의 분리 (`useAppState` + `useSetAppState`)가 **읽기/쓰기 권한 분리**의 가장 단순한 형태다. 읽는 컴포넌트만 구독하고, 쓰는 컴포넌트는 구독 안 한다. 잘 짜면 화면 전체에서 최소한의 컴포넌트만 다시 그려진다.

### 왜 Redux를 안 썼나

Redux도 충분히 좋은 도구다. 근데 Redux를 쓰면 그에 따라오는 것이 많다.

| Redux | `store.ts` |
|---|---|
| Action 타입 정의 | 없음 |
| Reducer 함수 | 없음 — `setState((prev) => next)` 한 줄 |
| Action creator | 없음 |
| Middleware | 없음 |
| DevTools 통합 | 없음 |
| 의존성 추가 | 없음 |
| 학습 곡선 | 없음 |
| 코드 줄 수 | **35줄** |

진짜 본질만 남기면 35줄이 끝이다. Claude Code 정도 규모의 터미널 앱에는 — 다른 것 다 필요 없다. 상태 들고 있고, 알림 보내는 그 한 가지만 잘 하면 된다. 

이게 **over-engineering의 반대**다. 충분히 작은 도구를 골라서, 충분히 작은 표면적으로 쓰는 것. Redux의 모든 기능이 필요하면 — 그땐 Redux를 쓰면 된다. 안 필요하면 — 35줄로 끝낸다.

> ⚠️ **함정 — 큰 앱에는 큰 도구가 필요하지 않을까?** 직관에 반하지만, 이 35줄이 Claude Code의 수십 개 필드, 수백 개 컴포넌트를 다 받친다. 핵심은 — **selector 패턴이 부분 구독을 보장**해서, 단일 거대 스토어가 곧 수십 개의 작은 구독처럼 동작하기 때문이다. 도구가 작다고 해서 표현력이 작은 게 아니다. 작은 도구 + 좋은 패턴이면, 큰 도구의 기능을 대부분 흉내낼 수 있다.

---

## Python으로 옮기면

같은 패턴을 Python으로 옮기면 거의 한 줄씩 대응한다.

```python
from __future__ import annotations
from typing import Callable, Generic, TypeVar
from dataclasses import dataclass, field

T = TypeVar("T")
Listener = Callable[[], None]


# ─── 35줄 store ────────────────
class Store(Generic[T]):
    def __init__(
        self,
        initial_state: T,
        on_change: Callable[[T, T], None] | None = None,
    ):
        self._state = initial_state
        self._listeners: set[Listener] = set()
        self._on_change = on_change
    
    def get_state(self) -> T:
        return self._state
    
    def set_state(self, updater: Callable[[T], T]) -> None:
        prev = self._state
        next_state = updater(prev)
        if next_state is prev:                       # Object.is 와 같음
            return
        self._state = next_state
        if self._on_change:
            self._on_change(next_state, prev)
        for listener in list(self._listeners):       # 알림
            listener()
    
    def subscribe(self, listener: Listener) -> Callable[[], None]:
        self._listeners.add(listener)
        return lambda: self._listeners.discard(listener)


# ─── AppState 정의 ────────────────
@dataclass(frozen=True)  # 불변! → 새 객체로 set_state 해야 함
class AppState:
    verbose: bool = False
    model: str = "claude-opus-4-6"
    cost: float = 0.0
    tasks: dict[str, str] = field(default_factory=dict)
    # ... 수십 개 더


# ─── 사용 ────────────────
store = Store(AppState())

# 구독 (Python에는 useSyncExternalStore가 없으니 직접)
def on_state_change():
    s = store.get_state()
    print(f"Footer: model={s.model}, cost=${s.cost}")

unsubscribe = store.subscribe(on_state_change)

# 상태 변경 — 새 객체로
store.set_state(lambda s: AppState(
    verbose=s.verbose,
    model="claude-haiku-4-5",  # 모델만 변경
    cost=s.cost,
    tasks=s.tasks,
))
# → on_state_change가 호출됨
# → "Footer: model=claude-haiku-4-5, cost=$0.0"

# 같은 상태 — no-op
store.set_state(lambda s: s)
# → 아무 일도 안 일어남
```

핵심 셋이 다 있다.

1. **35줄 generic 옵저버** — `Store[T]` 클래스.
2. **불변 상태** — `@dataclass(frozen=True)`로 객체는 새로 만들어야만 갱신된다 (TypeScript의 spread `{...prev, model: ...}`와 같은 의미).
3. **`Object.is` 조기 종료** — `if next_state is prev: return`. Python의 `is`가 정확히 `Object.is`다.

> 💡 **selector 패턴은 어떻게?** Python에서는 `store.subscribe(lambda: callback(selector(store.get_state())))` 같은 식으로 selector를 직접 끼울 수 있지만 — **Object.is 비교를 어디서 할지**가 까다롭다. React + `useSyncExternalStore`는 훅의 책임으로 그걸 해주는데, Python에서는 수동이다. 작은 앱에서는 셀렉터 없이 **전체 상태 callback**으로도 충분하다. Textual 같은 큰 프레임워크는 **reactive attribute** 시스템으로 이걸 자동화한다.

---

## 핵심 정리

- Claude Code의 모든 공유 상태는 **`AppState`** 라는 한 객체에 산다 — 모델, 모드, 권한, 토큰, 태스크, 플러그인, MCP 상태, 100개 가까운 필드.
- 그 객체를 다루는 스토어는 **`store.ts` 단 35줄**. `getState`, `setState`, `subscribe` 세 메서드. 옵저버 패턴의 가장 작은 형태.
- `Object.is(next, prev)` 조기 종료가 불필요한 알림 사이클을 막는다. 안 바뀌면 아무것도 안 한다.
- React와의 연결은 **`useSyncExternalStore`** (React 18) — concurrent rendering 시대에 외부 스토어를 안전하게 React에 묶는 전용 훅.
- **Selector 패턴**으로 부분 구독. 컴포넌트는 자기 슬라이스만 구독, 나머지가 바뀌어도 안 다시 그려짐. 거대 단일 스토어가 수십 개 작은 구독처럼 동작하는 비결.
- `useSetAppState()` — 쓰기 전용 훅. 구독 안 함, 리렌더 0회. 읽기/쓰기 권한 분리의 가장 작은 형태.
- **Redux 안 쓴 이유**: 35줄로 충분했기 때문. 작은 도구 + 좋은 패턴이 큰 도구의 기능을 대부분 대체. "필요한 만큼만"의 본보기.
- 다음 챕터(5.3): 컴포넌트가 수만 개의 메시지를 어떻게 100줄로 그리는가 — **가상 스크롤**.

