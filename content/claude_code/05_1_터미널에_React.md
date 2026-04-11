# 5.1 "터미널에 React?" — Ink가 정확히 무엇을 해주는가

---

## 이 챕터에서 배우는 것

- **터미널 안에 React가 있다**는 말이 왜 이상하지 않은지
- React가 사실은 **DOM과 무관한 트리 조정기(reconciler)**라는 사실
- Ink가 **DOM 대신 ANSI 셀**을 그리는 React 렌더러라는 것
- 진짜 코드: `Box`, `Text`, `useInput`이 어떻게 **flexbox 같은 터미널 UI**를 만드는가
- **왜 굳이 React인가** — `printf` 루프 대비 얻는 것

---

## 사용자 경험에서 출발

`/config`를 친다.

```
┌─ Settings ───────────────────────┐
│  > Theme: Dark                   │
│    Model: claude-opus-4-6        │
│    Notifications: On             │
└──────────────────────────────────┘
```

화살표 키를 누른다 — 현재 선택된 항목이 부드럽게 옮겨간다. 엔터를 친다 — 서브 메뉴가 슬라이드처럼 뜬다. 'q'를 누른다 — 원래 채팅 화면으로 돌아온다.

이게 터미널이다. 옛날 같으면 "화면을 다 지우고, 다시 그리고, 깜빡이고" 했을 그런 UI가 — 부드럽게 갱신된다. 깜빡임도 없다.

근데 뒷마당을 들춰보면 더 이상하다. `src/commands/config/config.tsx`.

```typescript
export const call: LocalJSXCommandCall = async (onDone, context) => {
  return <Settings onClose={onDone} context={context} defaultTab="Config" />
}
```

**`<Settings />` JSX다.** React 컴포넌트. 웹 브라우저에서나 보던 그것이 터미널 안에 있다. 

> **"잠깐. React는 DOM에 그리는 거잖아. 터미널에는 DOM이 없는데?"**

이 질문이 이 챕터의 출발점이다. **React는 사실 DOM이 아니다.** 그게 뭔지 보면 — **터미널에 React**가 전혀 이상하지 않다.

---

## 본문

### React의 진짜 본질 — 트리 조정기

대부분 사람들이 React를 "웹 컴포넌트 라이브러리"로 안다. 틀린 건 아니다. 근데 더 정확히 말하면 — **React는 트리(tree) 자료구조를 효율적으로 조정(reconcile)해주는 라이브러리**다.

```
입력: 현재 트리 + 새로 그려야 할 트리
출력: "트리의 어디가 어떻게 바뀌어야 하는지"의 diff
```

이 **diff**를 어떤 종류의 노드에 적용할지는 — React 자체는 모른다. 렌더러가 안다.

| 렌더러 | 트리의 노드는 무엇인가 |
|---|---|
| `react-dom` | 브라우저 DOM 노드 |
| `react-native` | iOS/Android 네이티브 뷰 |
| `react-three-fiber` | Three.js 3D 메시 |
| **`ink`** | **터미널 화면의 ANSI 셀** |

전부 **같은 React**다. 같은 `useState`, 같은 `useEffect`, 같은 JSX. 목표가 다를 뿐. React는 "이 트리가 저 트리로 바뀐다"를 계산하고, 렌더러는 "그 변화를 자기 매체에 어떻게 적용할지"를 안다.

> 💡 **Python 비유:** SQLAlchemy가 SQL을 만들지만, **어떤 DB**에 보낼지는 **dialect**가 정한다. PostgreSQL dialect, MySQL dialect, SQLite dialect. 같은 SQLAlchemy, 다른 백엔드. React도 같다 — 같은 React, 다른 렌더러.

### Ink는 터미널용 React 렌더러다

`src/ink/reconciler.ts`. 그 안에 한 줄.

```typescript
import createReconciler from 'react-reconciler'
```

React 팀이 공식적으로 제공하는 패키지다. 새 렌더러를 만들 때 쓰라고. Ink는 이걸 가져다가 "트리의 노드는 터미널 셀이고, 노드 추가/삭제/속성변경은 이렇게 처리한다" 라고 알려준다. 그게 끝이다.

`reconciler.ts`에 정의된 동작들.

```typescript
{
  createInstance,         // <Box> 같은 노드를 만들어라
  appendChild,            // 자식을 트리에 붙여라
  removeChild,            // 자식을 떼라
  commitUpdate,           // 노드 속성을 갱신해라
  // ... 30개쯤 더
}
```

각 함수는 **Ink의 자료구조**(yoga 레이아웃 노드 + 셀 버퍼)를 조작한다. React는 "이 노드를 갱신해라"만 호출하고, 어떻게 갱신되는지는 모른다.

### 진짜 컴포넌트는 어떻게 생겼나

`commands/install.tsx`에서 한 조각 가져와 보자 (단순화).

```tsx
import { Box, Text, useState } from '../ink.js'

function Install({ onDone }) {
  const [state, setState] = useState({ type: 'checking' })
  
  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="cyan">Claude Code Installer</Text>
      
      {state.type === 'checking' && (
        <Text>⠋ Checking your environment...</Text>
      )}
      {state.type === 'success' && (
        <Box marginTop={1}>
          <Text color="green">✓ Installed!</Text>
        </Box>
      )}
    </Box>
  )
}
```

**완전히 React다**. `useState`, JSX, 조건부 렌더링. 차이는 태그뿐.

- `<div>` 대신 `<Box>` (컨테이너)
- `<span>` 대신 `<Text>` (텍스트)
- `style={{display:'flex', flexDirection:'column'}}` 대신 **prop으로 직접** (`flexDirection="column"`)

웹 React를 한 번이라도 써본 사람이면 3분 안에 읽힌다. **그게 Ink의 핵심 가치다.** 새 모델을 배울 필요 없이, 기존 멘탈 모델을 그대로 가져다 쓴다.

### 그래서 화면에 어떻게 그려지나

React가 "이 트리"를 만들었다. Ink가 그걸 받아서 — 어떻게 화면에 찍는가? 4단계 파이프라인이 있다. 메인 프레임 갱신은 `renderer.ts` 가 담당하고, 검색용 single-message rendering 은 `render-to-screen.ts` 가 따로 한다.

```
1. Reconcile     : React 트리 → Ink DOM 트리 (Yoga 노드 부착)
2. Layout        : Yoga가 flexbox 계산 → 각 노드의 (x, y, width, height)
3. Paint         : 노드 트리 → Screen 버퍼 (셀별 char + style)
4. Diff & flush  : 이전 Screen과 비교 → 바뀐 셀만 ANSI escape로 stdout에
```

> ⚙️ **추측이 아니라 코드 안의 timing 카운터가 직접 증거.** `render-to-screen.ts:45` 에 한 줄로 박혀 있다: `const timing = { reconcile: 0, yoga: 0, paint: 0, scan: 0, calls: 0 }`. **reconcile / yoga(=layout) / paint / scan(=diff)** — 위 4단계가 프로파일링용 카운터의 키 이름이라는 사실 자체가 디자인 결정의 흔적이다.

**Yoga가 핵심**이다. Facebook이 만든 **flexbox 레이아웃 엔진**. 웹의 flexbox와 같은 알고리즘으로 터미널의 셀 위치를 계산한다. 그래서 `<Box flexDirection="column" gap={1}>` 같은 웹스러운 표현이 터미널에서 정확히 같은 의미로 동작한다.

```tsx
<Box flexDirection="row" justifyContent="space-between">
  <Text>왼쪽</Text>
  <Text>오른쪽</Text>
</Box>
```

→ 화면 좌측 끝과 우측 끝에 텍스트가 정확히 정렬된다. 사람이 공백을 세서 채울 필요가 없다.

### 4단계 중 가장 영리한 곳 — Diff & flush

진짜 frame diff 는 `renderer.ts:38-130` 의 `createRenderer` 함수에 있다. **front frame** (이전에 화면에 찍혀 있는 것) 과 **back frame** (새로 그릴 것) 두 buffer 를 비교한다.

```typescript
// renderer.ts (단순화)
return options => {
  const { frontFrame, backFrame, ... } = options
  const prevScreen = frontFrame.screen
  const backScreen = backFrame.screen
  // ... yoga 레이아웃 → renderNodeToOutput 으로 backScreen 칠하기
  // ... prevFrameContaminated 검사 후 prevScreen 대비 셀 단위 blit
}
```

번역하면 — **이전 프레임의 Screen과 새 프레임의 Screen을 셀 단위로 비교**해서, 바뀐 셀만 `\x1b[...m...` 같은 ANSI escape sequence로 stdout에 쓴다. 안 바뀐 셀은 건드리지 않는다.

단순한 비교가 아니라 **어떤 조건에서 fresh 하게 다시 그릴지**까지 결정한다. `prevFrameContaminated` 라는 플래그가 **selection overlay 가 prevScreen 을 mutate 했을 때**, **alt-screen 진입/SIGCONT/forceRedraw 로 리셋됐을 때**를 감지해서 — **blit 안 함, 처음부터 다시**. 안전한 경우에만 **O(unchanged) fast path**를 탄다 (스피너 tick, 텍스트 스트림 같은 정상 갱신).

> ⚠️ **검색용 함수와 헷갈리지 말 것.** `render-to-screen.ts:97-98` 에 `// Paint to a fresh Screen. Width = given, height = yoga's natural.\n// No alt-screen, no prevScreen (every call is fresh).` 라는 주석이 있는데 — 이건 **Diff & flush 가 아닌** 검색용 single-message rendering 함수 (`renderToScreen`) 다 (`render-to-screen.ts:48-58`: **"Used for search: render ONE message, scan its Screen for the query"**). 메인 프레임 갱신과 검색용 부분 렌더링이 다른 두 함수에 분리되어 있다.

이게 깜빡임 없는 UI의 비결이다. `clear` 명령으로 화면을 다 지우고 다시 그리면 — 깜빡인다. 사람 눈에 프레임이 잠깐 비었다 다시 채워지는 것이 보인다. 셀 단위 diff는 비는 순간이 없다. 안 바뀐 부분은 그대로 있고, 바뀐 부분만 덮어 쓴다.

> 🔬 **Deep Dive — DOM의 React diff와 정확히 같다.** React의 가상 DOM diff가 "이 노드와 이 노드만 바뀌었으니 그것만 patchDOM해라"라고 react-dom에게 알려주는 것과 — Ink의 Screen diff가 "이 셀과 이 셀만 바뀌었으니 ANSI escape로 그것만 덮어써라"라고 stdout에게 알려주는 것은 완전히 같은 패턴이다. **React의 핵심 가치 — 최소 변경을 최소 비용으로** — 이 터미널에서도 그대로 통한다. 30Hz로 갱신해도 CPU가 놀고 있다.

### `useInput`, `useStdin` — 키 입력도 React 스럽게

웹 React가 `onClick`, `onChange`로 이벤트를 처리하듯, Ink는 훅으로 입력을 다룬다.

```tsx
import { useInput } from 'ink'

function Menu() {
  const [selected, setSelected] = useState(0)
  
  useInput((input, key) => {
    if (key.upArrow) setSelected(s => Math.max(0, s - 1))
    if (key.downArrow) setSelected(s => s + 1)
    if (key.return) handleSelect(selected)
  })
  
  return <Box>...</Box>
}
```

`useInput`이 키 입력을 받는다. 받을 때마다 `setSelected`로 상태가 바뀌고, React가 자동으로 트리를 다시 그린다. 사용자가 화살표를 누르면 선택된 항목이 즉시 따라온다. 내가 직접 화면을 다시 그리는 코드는 한 줄도 없다. **상태 → UI의 단방향 데이터 흐름**이 터미널에서도 그대로 작동한다.

### 왜 굳이 React인가 — `printf` 루프 대비 얻는 것

옛날 방식을 생각해보자. C로 짜는 ncurses 같은 라이브러리. 화면을 매 프레임 직접 그린다.

```c
void draw_menu(int selected) {
  clear();                                    // 화면 비우기
  for (int i = 0; i < num_items; i++) {
    if (i == selected) attron(A_REVERSE);     // 선택된 거 강조
    mvprintw(i, 0, "%s", items[i]);           // 위치 계산해서 찍기
    if (i == selected) attroff(A_REVERSE);
  }
  refresh();
}
```

이게 명령형이다. 화면 상태를 내가 직접 관리한다. 항목이 늘면? `for` 루프 늘려야지. 스크롤이 필요하면? 오프셋 변수 만들어야지. 부분 업데이트? 어디가 바뀌었는지 내가 추적해야지.

Ink + React는 선언적이다.

```tsx
function Menu({ items, selected }) {
  return (
    <Box flexDirection="column">
      {items.map((item, i) => (
        <Text key={i} inverse={i === selected}>{item}</Text>
      ))}
    </Box>
  )
}
```

"메뉴는 이렇게 생겨야 한다" 만 선언한다. 화면을 어떻게 그리는지, 무엇이 바뀌었는지, 깜빡임 없이 어떻게 갱신할지 — **전부 React + Ink가 한다**. 항목이 늘면? `items` 배열이 늘면 끝. 스크롤이 필요하면? 별도 컴포넌트로 감싼다. 부분 업데이트? React diff가 알아서.

**터미널 UI가 복잡해질수록 React 모델의 이득이 커진다.** Claude Code는 — 메시지 목록, 스피너, 권한 다이얼로그, 자동완성, 스크롤 가능한 기록, 다중 패널 — 이 모든 게 동시에 그려지고 동시에 갱신된다. 명령형으로 짰으면 수천 줄의 화면 갱신 코드가 됐을 것을, React로는 컴포넌트 트리로 표현할 수 있다.

---

## Python으로 옮기면

Python에는 같은 패턴의 라이브러리가 있다 — **Textual**. **터미널용 Python 컴포넌트 프레임워크**. Ink와 본질이 같다.

```python
from textual.app import App, ComposeResult
from textual.widgets import Static, ListView, ListItem, Label
from textual.containers import Vertical


class MenuApp(App):
    """Ink의 컴포넌트와 정확히 대응."""
    
    CSS = """
    Vertical {
        border: solid cyan;
        padding: 1;
    }
    """
    
    def __init__(self, items: list[str]) -> None:
        super().__init__()
        self.items = items
        self.selected = 0
    
    def compose(self) -> ComposeResult:
        # JSX의 return과 같은 자리 — UI 트리를 선언
        yield Vertical(
            Static("[bold cyan]Settings[/]"),
            ListView(*[ListItem(Label(item)) for item in self.items]),
        )
    
    def on_key(self, event) -> None:
        # Ink의 useInput과 같은 자리
        if event.key == "up":
            self.selected = max(0, self.selected - 1)
        elif event.key == "down":
            self.selected = min(len(self.items) - 1, self.selected + 1)
        elif event.key == "enter":
            self.exit(self.items[self.selected])
        # 상태 변화 → 자동 리렌더
        self.refresh()


if __name__ == "__main__":
    app = MenuApp(["Theme: Dark", "Model: opus-4-6", "Notifications: On"])
    result = app.run()
    print(f"You picked: {result}")
```

**Textual = Python의 Ink**다. 컴포넌트 트리, 선언형 UI, 키 입력 훅, CSS 비슷한 스타일링. 내부 구현도 비슷하다 — 이벤트 루프, diff 기반 부분 갱신, ANSI escape sequence 출력.

> 💡 **Textual vs Ink — 같은 기원.** 둘 다 "브라우저가 한 일을 터미널로 가져온다"라는 같은 디자인 철학에서 출발한다. Textual은 CSS 스타일링까지 포함해서 더 웹스럽고, Ink는 React 친화성 때문에 더 컴포넌트 중심이다. 둘 중 어느 쪽으로 가도 — **선언형 + 부분 diff 갱신**이라는 핵심은 같다.

---

## 핵심 정리

- React는 **DOM 라이브러리가 아니다**. 트리를 효율적으로 조정해주는 라이브러리. 렌더러를 바꾸면 다른 매체에 그릴 수 있다.
- **Ink는 터미널용 React 렌더러**다. `react-reconciler` 패키지를 받아서 "트리의 노드 = 터미널 셀"이라고 알려준 결과물.
- `<Box>`, `<Text>`는 `<div>`, `<span>`의 터미널 버전. **flexbox 같은 props**를 그대로 쓴다 — 안에서 **Yoga 엔진**이 셀 위치를 계산한다.
- 4단계 파이프라인: **Reconcile → Layout(Yoga) → Paint(Screen) → Diff & flush(ANSI)**. 마지막 단계의 **셀 단위 diff**가 깜빡임 없는 UI의 비결.
- `useInput`/`useStdin`/`useApp` 같은 훅으로 입력을 받는다. 상태가 바뀌면 React가 자동으로 다시 그린다. **상태 → UI 단방향 흐름**이 터미널에서도 그대로 작동.
- **왜 굳이 React인가**: 명령형 ncurses는 "내가 직접 그린다", Ink는 "이렇게 생겨야 한다고 선언만 한다". 복잡해질수록 후자의 이득이 커진다. Claude Code 같은 수많은 동시 패널이 가능한 이유.
- 다음 챕터(5.2): 그 컴포넌트들이 공유하는 상태는 어떻게 관리하는가. **AppState 스토어** — Redux 없이 만든 단순 옵저버.

---

*다음 챕터: 5.2 AppState 스토어 — Redux 없이 만든 단순 옵저버*
