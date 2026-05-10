# 0.3 React 훅과 함수형 컴포넌트 — 상태, 리렌더, 그리고 부수효과

---

## 이 챕터에서 배우는 것

- 명령형 UI 와 선언형 UI 의 패러다임 차이
- 함수형 컴포넌트의 본질 — "상태가 입력, UI 가 출력"
- `useState` / `useEffect` 가 무엇이고 왜 등장했나
- 터미널에 React 를 올린다는 것 (Ink) 의 의미

---

## 사용자 경험에서 출발

Claude Code 의 터미널 UI 를 가만히 보고 있으면 좀 이상하다. 옛날 CLI 는 명령 친 후 결과를 한 번 출력하고 끝났다. 입력이 진행 중이면 그저 기다림. 진행 표시? 회색 카운터를 단순히 갱신하는 정도.

근데 Claude Code 는 다르다 — 텍스트가 흘러나오는 동안 진행 표시가 갱신되고, 화살표 키로 메시지를 위아래로 스크롤하고, ESC 로 중간 취소하고, 슬래시 명령으로 자동완성이 뜬다. 마치 화면이 살아 있는 것 같다.

이게 어떻게 가능한가? 뒷판은 보통 GUI 와 같은 도구를 쓴다 — **React**.

근데 React 는 보통 브라우저의 것이다. 터미널에서 React 를 어떻게? 그것이 무슨 의미가 있나?

답을 풀어보면 React 의 본질이 DOM 이나 브라우저가 아니라는 게 드러난다. React 의 본질은 **선언형 UI** 라는 패러다임이다. 이 챕터는 그 패러다임을 짚는다 — 5장에서 본격적으로 살아 움직이는 Claude Code 의 UI 코드를 읽기 위해서.

---

## 명령형 UI vs 선언형 UI

전통적인 GUI 는 명령형(imperative) 이다. "버튼이 클릭되면, 라벨의 텍스트를 'Hello' 로 바꿔라." 변경의 방법을 코드에 적는다.

```python
# Tkinter 스타일 (명령형)
def on_click():
    label.config(text="Hello")     # 라벨을 직접 수정

button = Button(text="Click", command=on_click)
```

문제는 상태가 늘어날수록 변경 코드가 폭발한다는 것. 사용자 정보 화면이 5개 필드 있고 각각이 3가지 모드(로딩 / 정상 / 에러) 라면, 5×3 = 15가지 조합마다 "이 필드를 어떻게 바꿀지" 코드가 필요하다. 어느 한 곳을 빠뜨리면 화면이 불일치 상태에 빠진다.

선언형(declarative) 은 정반대 접근이다. "현재 상태가 X 면, 화면은 이렇게 보인다." 그게 전부.

```typescript
// React 스타일 (선언형)
function UserCard({ user, status }) {
  if (status === 'loading') return <Spinner />
  if (status === 'error')   return <ErrorMessage />
  return <div>{user.name}</div>
}
```

상태가 바뀌면? 함수가 다시 호출되어 새 UI 가 만들어진다. 어디를 어떻게 바꿀지 신경 쓰지 않는다. 그냥 "지금 상태에서는 이렇게 그린다" 만 적는다. 변화 처리는 React 가 알아서 한다 — 함수가 반환한 새 UI 트리를 직전 트리와 비교해서, 차이 난 부분만 실제 DOM 에 반영한다 (이 비교/반영 과정을 **재조정(reconciliation)** 이라고 부른다).

이게 React 가 이긴 패러다임이다 — **상태와 UI 를 함수 하나로 묶고, 변화 처리는 라이브러리에 맡긴다**.

> 💡 **Streamlit 을 써본 적 있다면** 비슷한 직관을 이미 갖고 있다. 위젯 값이 바뀌면 스크립트 전체가 다시 실행되어 새 화면이 만들어진다. React 는 "전체 스크립트" 가 아닌 "컴포넌트 함수" 단위라는 것만 다르다 (그리고 변화한 DOM 만 똑똑하게 갱신한다는 효율 추가). 본질은 같다 — 상태에서 화면으로 가는 함수.

---

## 함수형 컴포넌트 — 상태가 입력, UI가 출력

위 섹션의 React 예시 (`function UserCard(...)`) 를 다시 보자. 그냥 평범한 함수다. React 는 컴포넌트를 함수로 정의한다 — 그래서 **함수형 컴포넌트(functional component)** 라고 부른다. (클래스로도 정의할 수 있지만 지금은 함수형이 사실상 표준.)

이름이 자연스러운 이유 — 선언형 UI 와 함수가 같은 모양이기 때문이다. 선언형 UI 는 "상태가 정해지면 화면이 결정된다", 함수는 "입력이 정해지면 출력이 결정된다" — 한쪽을 정하면 다른 쪽이 결정되는 같은 구조다.

```typescript
function Greeting({ name }) {
  return <h1>안녕, {name}</h1>
}
```

입력은 상태와 속성(props), 출력은 UI 트리(가상 DOM 노드). 이론상 순수 함수 — 같은 입력이면 같은 출력, side effect 없음.

> **컴포넌트 함수 = 상태에서 UI 를 만들어 내는 함수. 호출은 React 가 한다 — 마운트 시 한 번, 이후 입력이 바뀔 때마다.**

근데 한 가지 의문 — "함수는 호출이 끝나면 지역 변수가 사라진다. 그럼 상태는 어디에 사는가?" 답은 다음 섹션이다.

---

## useState — 상태가 곧 리렌더 트리거

함수형 컴포넌트는 호출이 끝나면 지역 변수가 사라진다. 그런데 카운터 같은 컴포넌트에는 상태가 있어야 한다 — 0 에서 시작해서 클릭마다 1씩 증가하는 숫자.

이 모순을 푸는 게 **`useState`** 다.

```typescript
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

`useState(0)` 의 의미를 풀면 — "이 컴포넌트에 0 으로 시작하는 상태를 하나 등록해주세요. 현재 값과 setter 를 돌려주세요." React 가 컴포넌트 외부에 그 상태를 보관한다. 컴포넌트 함수가 매번 재호출되어도 같은 상태를 다시 들고 들어온다.

setter (`setCount`) 호출 시 일어나는 일을 그림으로 그리면:

```
setCount(count + 1)
        ↓
React 가 보관하던 상태 갱신
        ↓
React 가 "이 컴포넌트 다시 호출해야 함" 표시
        ↓
다음 렌더 사이클에서 컴포넌트 함수 재호출 (새 상태로)
        ↓
새 UI 트리 반환
        ↓
직전 트리와 비교(diff) → 변화한 부분만 실제 DOM 에 반영
```

이 과정의 핵심 한 줄: **상태 변화는 곧 리렌더 트리거**. 상태를 바꾸는 다른 방법은 없다 — 모두 setter 를 통해서. 그래서 React 는 언제 다시 그려야 할지를 항상 안다. 명령형의 "어느 라벨을 어떻게 바꿔라" 가 사라진다.

`useState` 같은 함수를 **훅(Hook)** 이라고 부른다. 일반 함수는 호출이 끝나면 지역 변수가 사라지는데, 훅은 React 에 "이 상태 외부에 보관해 주세요" 같은 부탁을 해서 매 호출마다 같은 상태를 돌려받게 한다. 즉, 원래 함수에는 없던 능력 (상태 보관, 부수효과 등록 등) 을 컴포넌트에 끼워 넣는 게 훅의 역할.

> ⚠️ **이름 충돌 주의**: 6장에 등장하는 Claude Code 의 **Hook 시스템** 은 이름만 같고 완전히 다른 개념이다. 거기 Hook 은 도구 실행 전후 같은 특정 이벤트에 끼어드는 사용자 정의 셸 명령(`settings.json` 에 정의). 이 챕터의 React Hook 과 헷갈리지 말 것.

> 💡 **왜 클래스 컴포넌트를 버리고 훅으로 갔나** — 옛날 React 는 `class Counter extends React.Component` 형태였다. `this.state`, `this.setState`, lifecycle method (`componentDidMount`, `componentDidUpdate`, ...) 같은 별도 어휘가 필요했다. 훅은 그것들을 일반 함수 호출로 풀어냈다. 컴포넌트의 상태 + 부수효과 + 정리가 모두 일반 함수 호출 시퀀스로 표현되어, 합성하기 쉬워졌다. 두 컴포넌트가 같은 로직을 공유하고 싶으면? 그 로직을 **커스텀 훅(custom hook)** 으로 빼서 각자에서 호출하면 끝. 클래스에서는 mixin 이나 HOC 같은 우회로가 필요했다.

---

## useEffect — 외부 세계와의 동기화

컴포넌트 함수는 순수 함수여야 한다 — 같은 입력에 같은 출력. 그런데 현실에서는 순수하지 않은 일이 필요하다 — 네트워크 호출, 타이머 시작, 외부 이벤트 구독, 콘솔 로그.

이런 부수효과를 컴포넌트 본문에 그냥 넣으면? 매 렌더마다 실행되어 폭발한다. 클릭 한 번에 네트워크 호출 100번 같은 사고.

해법은 **`useEffect`** — "이 부수효과를, 어떤 상태가 바뀔 때마다 실행해주세요" 라고 React 에 위임.

```typescript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`/users/${userId}`).then(r => r.json()).then(setUser)
  }, [userId])   // ← 의존성 배열: userId 가 바뀔 때만 effect 재실행

  return user ? <div>{user.name}</div> : <Spinner />
}
```

핵심 두 가지:

1. **의존성 배열** — "이 effect 는 어떤 값에 의존하는가" 명시. React 는 그 값이 바뀔 때만 effect 를 다시 실행한다. 빈 배열 (`[]`) 이면 마운트 시 단 한 번. 배열을 빼면 매 렌더마다 실행 (보통 실수).
2. **cleanup** — effect 가 반환하는 함수가 해제 코드. 다음 effect 실행 직전 또는 컴포넌트 언마운트 시 호출됨. 구독 해제, 타이머 클리어, 네트워크 요청 취소 같은 뒷정리.

```typescript
useEffect(() => {
  const timer = setInterval(tick, 1000)
  return () => clearInterval(timer)   // cleanup
}, [])
```

`useEffect` 의 본질을 한 줄로 요약하면 — **컴포넌트의 순수한 렌더 로직과 부수효과를 분리하고, 부수효과의 발화 시점을 React 에 맡긴다**. "언제 effect 를 실행할지" 를 직접 적지 않는다 — 의존성 배열이 그것을 결정한다.

---

## 터미널에 React — Ink

여기까지의 모든 얘기는 DOM 이나 브라우저와 무관하다. 그저 "상태 → UI 함수 + 변화 처리는 라이브러리" 라는 패러다임 얘기.

그래서 **Ink** 같은 게 가능하다. Ink 는 React 의 패러다임을 그대로 가져오되, 출력을 HTML/DOM 대신 터미널 텍스트로 만든다. React 의 렌더러는 갈아끼울 수 있는 부품이고, Ink 는 그 부품 중 하나다 (브라우저용 `react-dom` 의 자리).

```typescript
import { Box, Text, useInput } from 'ink'

function Counter() {
  const [count, setCount] = useState(0)
  useInput((input) => {
    if (input === '+') setCount(count + 1)
  })
  return <Box><Text>Count: {count}</Text></Box>
}
```

`useState`, `useEffect`, 컴포넌트, JSX — 다 그대로. 차이는 그려지는 출력뿐 — `<div>` 대신 `<Box>`, `<span>` 대신 `<Text>`. 그리고 그 출력이 ANSI escape sequence 를 통해 터미널에 그려진다.

Claude Code 의 모든 터미널 UI 는 Ink 컴포넌트로 짜여 있다. 메시지 패널, 입력 프롬프트, 진행 표시, 슬래시 명령 자동완성 — 전부 React 컴포넌트와 훅이다. 본격 분석은 5장 (특히 5.1 터미널에 React) 에서 한다.

---

## 핵심 정리

- **선언형 UI 는 "상태 → 화면" 함수.** 명령형이 "어떻게 바꿀지" 를 적는다면, 선언형은 "지금 상태에서 어떻게 보이는지" 만 적는다. 변화 처리는 라이브러리(React) 가 한다.
- **함수형 컴포넌트는 순수 함수, 호출은 React 가 한다.** 함수 본문은 그릴 줄만 알고, 호출 시점은 외부(React) 가 결정.
- **`useState` 는 상태를 컴포넌트 외부에 보관한다.** setter 호출 = 상태 갱신 + 리렌더 트리거. 상태를 바꾸는 다른 길은 없다 — 그래서 React 는 항상 "언제 다시 그려야 할지" 를 안다.
- **`useEffect` 는 부수효과의 발화 시점을 React 에 위임한다.** 의존성 배열로 어떤 상태에 의존하는지 명시, cleanup 으로 뒷정리. 순수 렌더 로직과 부수효과를 분리.
- **Ink 는 React 의 렌더러를 갈아끼운 것 — 출력이 HTML 대신 터미널 텍스트.** 패러다임은 그대로, 그래서 Claude Code 의 모든 UI 가 컴포넌트와 훅으로 짜여 있다.
