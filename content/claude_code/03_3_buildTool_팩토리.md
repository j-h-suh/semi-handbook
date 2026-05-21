# 3.3 buildTool 팩토리 — 안전 기본값을 한 곳에 모으기

---

## 이 챕터에서 배우는 것

- 47개짜리 인터페이스인데도 도구 하나 만들기가 왜 별로 안 어려운지
- `buildTool` 팩토리가 **한 줄짜리 spread**로 빠진 메서드를 채우는 메커니즘
- "fail-closed where it matters" — 안전한 기본값이 어디까지 안전하고 어디서 일부러 비안전인지
- 기본값을 한 곳에 모은다는 게 단순히 코드 중복 제거 이상이라는 사실

---

## 사용자 경험에서 출발

3.2에서 **47개 필드짜리 Tool 인터페이스**를 봤다. 그리고 핵심 5개만 채우면 된다고 했다 — 단, 그 중 `checkPermissions` 는 사실 기본값 (`"allow"`) 이 있어 진짜 mandatory 는 4개. 근데 좀 이상하다.

> "4개만 채워도 도구가 완성된다고? 나머지 43개는 어디서 오는데? TypeScript가 컴파일 시점에 채워주는 게 아니잖아."

맞다. TypeScript는 타입을 검사할 뿐이다. 런타임에 객체에 메서드가 진짜로 있어야 도구가 동작한다. 그럼 누가 채우는가?

답: **`buildTool` 팩토리**가 채운다. 정확히는 — 43개 중 7개는 안전한 기본값을 채우고 (`TOOL_DEFAULTS`, `checkPermissions` 포함), 15개는 렌더링 시스템이 따로 기본값을 가지고 있고 (Part 5), 나머지 21개는 옵셔널이라 비워둬도 됨. 즉 *진짜 기본값이 있는 건 7개*, 나머지는 "안 써도 OK" 일 뿐.

:::tabs

```typescript
// 도구 작성자가 쓰는 코드
export const myTool = buildTool({
  name: 'MyTool',
  description: () => 'Does something useful',
  inputSchema: z.object({ x: z.number() }),
  call: async (input) => `Got ${input.x}`,
})
```

```python
# Python 등가 — 도구 작성자가 쓰는 코드 (dict 팩토리 스타일)
from pydantic import BaseModel

class MyToolInput(BaseModel):
    x: int

async def my_tool_call(input: MyToolInput) -> str:
    return f"Got {input.x}"

my_tool = build_tool(
    name="MyTool",
    description=lambda: "Does something useful",
    input_schema=MyToolInput,
    call=my_tool_call,
)
# 나머지 43개는 사용자가 안 써도 됨 (7개는 TOOL_DEFAULTS, 15개는 렌더링 시스템, 21개는 옵셔널)
```

:::

4개만 썼다 (5번째 핵심인 `checkPermissions` 도 default `"allow"` 가 있어 생략 가능). 그런데 `myTool`을 출력해보면 — `isEnabled`, `isReadOnly`, `checkPermissions`, ... 가 다 들어 있다. 마법이다. 이 마법이 바로 `buildTool`의 일이다.

> 💡 **잠깐 — 3.2 와 무엇이 다른가? (Python 표현 차이)** 3.2 도 3.3 도 **같은 TypeScript 코드** (`buildTool({...})`) 를 *Python 으로 옮긴 표현*. 둘은 Tool 자체가 다른 게 아니라 **Python 표현 방식의 선택** 이 다름. 3.2 는 `ToolBase` 추상 클래스 + 자식 상속 패턴, 3.3 은 `Tool` dataclass + 팩토리 함수 패턴. **결과는 둘 다 같다** — 47개 메서드가 다 채워진 완성된 도구 객체.
>
> 왜 두 가지 표현? Python 에는 TypeScript 의 객체 리터럴 + 매핑 타입 트릭이 없어서, 같은 발상을 옮기는 데 두 가지 자연스러운 방법이 있음. 이 챕터가 dict 팩토리 패턴을 쓰는 이유는 — TypeScript 의 spread 메커니즘 (`{...TOOL_DEFAULTS, ...def}`) 과 직접 대응시키기 위해서. **어느 Python 표현이 production 에 더 적합한지에 대한 권장은 챕터 끝에서.**

---

## 본문

### `buildTool`은 한 줄짜리 함수다

`Tool.ts`를 783줄로 스크롤하면 진짜 구현이 있다.

:::tabs

```typescript
export function buildTool<D extends AnyToolDef>(def: D): BuiltTool<D> {
  return {
    ...TOOL_DEFAULTS,
    userFacingName: () => def.name,
    ...def,
  } as BuiltTool<D>
}
```

```python
# Python 등가 — dict 병합으로 같은 일을 한다
TOOL_DEFAULTS = {
    "is_enabled": lambda: True,
    "is_read_only": lambda: False,        # fail-closed
    "is_concurrency_safe": lambda: False,  # fail-closed
    "is_destructive": lambda: False,
}

def build_tool(user_def: dict) -> dict:
    return TOOL_DEFAULTS | {"user_facing_name": user_def["name"]} | user_def
    # Python 3.9+ 의 dict 병합 연산자 — JS 의 spread (...) 와 같음
```

:::

진짜로 **한 줄짜리 spread**다. JavaScript의 `...` 연산자로 두 객체를 합친다. Python의 `dict1 | dict2` 와 같다 (3.9+).

순서가 중요하다.

1. 먼저 `TOOL_DEFAULTS`를 펼친다 → 모든 기본값이 깔린다.
2. 그다음 `userFacingName: () => def.name` → 이름 기반 기본값을 덮어쓴다.
3. 마지막으로 `...def` → 사용자가 작성한 것을 덮어쓴다.

**나중에 펼친 게 이긴다.** 그래서 사용자가 작성한 메서드는 그대로 유지되고, 작성하지 않은 메서드는 기본값으로 채워진다. 겨우 이 정도가 마법의 정체다.

> 💡 **Python 비유:** `TOOL_DEFAULTS | user_def` (Python 3.9+) 와 같다. dict 병합의 마지막이 이긴다는 규칙.

### `TOOL_DEFAULTS` — 일곱 개의 기본값

이제 기본값 자체를 보자. `Tool.ts` 757줄.

:::tabs

```typescript
const TOOL_DEFAULTS = {
  isEnabled: () => true,
  isConcurrencySafe: (_input?: unknown) => false,
  isReadOnly: (_input?: unknown) => false,
  isDestructive: (_input?: unknown) => false,
  checkPermissions: (input, _ctx?) =>
    Promise.resolve({ behavior: 'allow', updatedInput: input }),
  toAutoClassifierInput: (_input?: unknown) => '',
  userFacingName: (_input?: unknown) => '',
}
```

```python
# Python 등가 — TOOL_DEFAULTS dict 자체
# 47개 중 7개만 기본값. 나머지는 도구마다 달라야 한다.

TOOL_DEFAULTS = {
    "is_enabled": lambda: True,
    "is_concurrency_safe": lambda _input=None: False,   # fail-closed
    "is_read_only": lambda _input=None: False,          # fail-closed
    "is_destructive": lambda _input=None: False,
    "check_permissions": lambda input, _ctx=None: {"behavior": "allow", "updated_input": input},
    "to_auto_classifier_input": lambda _input=None: "",
    "user_facing_name": lambda _input=None: "",
}
```

:::

7개. 47개 중에 7개만 기본값을 가진다는 게 이상해 보일 수 있는데, 나머지 40개는 다음 셋 중 하나로 처리된다:

- **4개 mandatory** (도구 정체성): `name`, `description`, `inputSchema`, `call` — 도구마다 정말 달라야 해서 기본값을 줄 수 없음. (`checkPermissions` 도 핵심이지만 보수적 default `"allow"` 가 7개 안에 들어 있음.)
- **15개 렌더링**: 별도의 다른 시스템이 더 똑똑한 기본값을 가지고 있음 (Part 5에서 본다).
- **21개 옵셔널** (`?` 마크): 안 채우면 `undefined`. 호출자가 옵셔널 체이닝으로 처리.

7개 각각의 의미:

| 메서드 | 기본값 | 안전 방향 |
|---|---|---|
| `isEnabled` | `true` | "활성화"가 기본 |
| `isConcurrencySafe` | `false` | **보수적** — 동시 실행 불가로 가정 |
| `isReadOnly` | `false` | **보수적** — 쓰기로 가정 |
| `isDestructive` | `false` | 비파괴로 가정 |
| `checkPermissions` | `allow` | **사용자에게 안 묻고 자동 허용** (위험 도구는 `'ask'` 로 옵트인) |
| `toAutoClassifierInput` | `''` (빈 문자열) | 분류기 건너뜀 |
| `userFacingName` | `name` (위에서 덮어씀) | 도구 이름 그대로 |

> 💡 **왜 boolean 이 아니라 함수인가?** 위 표의 기본값들이 `true`/`false` 같은 단순 boolean 이 아니라 `() => true`, `(_input) => false` 같은 **함수** 인 게 처음엔 의아할 수 있다. 세 가지 이유:
>
> 1. **입력 컨텍스트 의존** — 대부분 `input` 을 받는다 (`isReadOnly(input)`, `isConcurrencySafe(input)`, `isDestructive(input)`). 같은 `Bash` 도구라도 `Bash.isReadOnly("ls -la")` 는 `true`, `Bash.isReadOnly("rm -rf /")` 는 `false`. 입력이 결정.
> 2. **시스템 컨텍스트 의존** — input 을 안 받는 `isEnabled()` 도 feature flag, API provider, 현재 모델 등 시스템 상태에 따라 달라짐. 실제 `WebSearchTool.isEnabled()` 는 `getAPIProvider()`, `getMainLoopModel()` 을 확인. boolean 이면 정의 시점의 값으로 고정되어 동적 반응 불가.
> 3. **다형성 + lazy evaluation** — 각 도구가 자기 로직으로 override (polymorphism). 함수라 호출 시점에만 평가 — 안 쓰는 도구의 `isEnabled` 검사는 비용 0. 또 stale state 도 안 생김 (boolean 으로 미리 계산해두면 feature flag 바뀐 뒤에도 옛날 값 들고 있음).

### "fail-closed where it matters" — 진짜 의미

`buildTool`의 docstring에는 "fail-closed where it matters"라고 쓰여 있다. 중요한 곳에서는 안전 쪽으로 fail. 어디가 중요한 곳인가?

**`isConcurrencySafe`와 `isReadOnly`가 그 자리다.**

- `isConcurrencySafe = false`가 기본 → 도구 작성자가 깜빡 잊으면, 시스템은 "동시에 돌리면 안 되는 도구"로 취급한다. 직렬로 실행한다. 안전한 쪽이다. 만약 기본값이 `true`였다면? 작성자가 동시 안전성을 검토하지도 않은 도구가 갑자기 병렬로 돌면서 경합 조건을 만들 수 있다. 큰 사고.
- `isReadOnly = false`가 기본 → 도구 작성자가 깜빡 잊으면, 시스템은 "쓰기 작업"으로 취급한다. 권한 체크가 더 엄격하게 들어간다. plan 모드에서는 차단된다. 안전한 쪽이다.

이게 "fail-closed where it matters"의 정체다. **잊어버렸을 때의 결과가 덜 위험한 쪽으로 향하도록 기본값을 정한다.** 이 철학이 6장(권한 시스템)에서 더 큰 형태로 다시 나온다.

> ⚠️ **함정:** `isDestructive = false`는 fail-closed가 아니다. 깜빡 잊으면 "파괴적이지 않다"로 취급된다. 왜 이렇게 했을까? 대부분의 도구는 진짜로 파괴적이지 않기 때문이다 (`Read`, `Glob`, `Grep` 등). 파괴적인 도구는 명시적으로 옵트인해야 한다. 자주 발생하는 케이스를 기본값으로 잡고, 드문 케이스는 작성자에게 강제로 표시하게 만드는 트레이드오프.

### `toAutoClassifierInput`은 옵트인

**자동 분류기** = Claude Code 의 `auto` permission mode (`--permission-mode auto`) 에서 매 도구 호출을 **LLM 이 transcript 보고 allow/deny 자동 결정** 하는 시스템 (`yoloClassifier.ts`). 매번 사용자에게 권한 묻지 않으려는 모드. 이 LLM 은 **로컬 모델이 아니라 Anthropic API 호출** (`sideQuery` 경유) — 도구 호출 1회마다 분류기 API 호출 1회가 추가로 든다.

흥미로운 케이스는 `toAutoClassifierInput`이다. 기본값이 빈 문자열 — 즉 "자동 분류기는 이 도구를 건너뛴다". 도구 작성자가 명시하지 않으면 분류기가 보지도 않는다.

근데 docstring에 "security-relevant tools must override"라고 쓰여 있다. 보안에 관련된 도구는 반드시 이걸 채워야 한다. 즉:

- 기본값은 안전한 쪽으로 비활성
- 보안 영향이 있는 도구는 직접 켜야 함

이건 "잊어버리면 안 도는" 패턴이다. 만약 기본값이 `(input) => JSON.stringify(input)`이었다면, 도구 작성자가 분류기 동작에 대해 생각하지 않은 도구도 모두 분류기에 입력으로 들어간다. 잘못된 입력이 분류기를 망가뜨릴 수 있다. 안전한 쪽은 기본 비활성, 명시적 활성이다.

### 한 곳에 모은 효과

`TOOL_DEFAULTS`가 한 곳에 있다는 게 왜 중요한가?

만약 기본값이 각 도구마다 흩어져 있다고 상상해보자.

```typescript
// 흩어진 버전 (실제 코드 아님)
export const fileReadTool = {
  name: 'FileRead',
  // ...
  isEnabled: () => true,
  isReadOnly: () => true,
  isConcurrencySafe: () => true,
  // 60개 이상의 도구가 다 이렇게 반복...
}
```

문제 1: **반복이다.** 60개 이상의 도구가 같은 7개 줄을 다시 쓴다.

문제 2: **수정이 어렵다.** `isReadOnly`의 기본값을 다른 의미로 바꾸고 싶다면? 60군데 이상을 고쳐야 한다.

문제 3: **누락이 위험하다.** 새 도구를 만들면서 깜빡 `isConcurrencySafe`를 안 썼다. 호출자가 `tool.isConcurrencySafe?.() ?? false`로 안전하게 처리하면 OK. 근데 다른 호출자가 `tool.isConcurrencySafe()`를 그냥 호출하면 — 런타임 에러. 호출자마다 기본값을 안다는 보장이 없다.

`buildTool`은 이 셋을 다 해결한다. **기본값은 한 군데. 도구는 항상 완전. 호출자는 항상 그냥 호출.** 47개짜리 인터페이스를 7개 기본값으로 안전하게 채우는 제일 단순한 방법이다.

<details>
<summary>🔬 Deep Dive — TypeScript의 타입 매직</summary>

> 위 코드의 진짜 어려운 부분은 런타임이 아니라 타입이다. `Tool.ts:707-714`에 `DefaultableToolKeys`라는 union type이 있어서 **어떤 7개가 default로 채워지는지**가 타입 레벨에 못 박혀 있다. 그리고 `Tool.ts:735-741`의 `BuiltTool<D>` 매핑 타입이 — 작성자가 채운 키는 그 타입을 그대로 유지하고, 안 채운 키는 기본값 타입을 가져온다. 그래서 `myTool.isReadOnly`를 호출하면 컴파일러가 "이건 무조건 함수다"라고 알게 된다. 작성자가 안 썼는데도. 이 타입 매직 덕분에 호출자는 옵셔널 체이닝(`?.`)이나 nullish 병합(`??`)을 전혀 안 써도 된다. 코드가 더 짧고 더 안전해진다. **즉, 7개의 기본값은 런타임에도 한 곳 (`TOOL_DEFAULTS`, `Tool.ts:757`), 타입에도 한 곳 (`DefaultableToolKeys`, `Tool.ts:707`) 에 산다.** Python에는 이런 매핑 타입이 없어서 같은 효과를 내려면 mypy plugin이나 TypedDict 트릭이 필요하다. (그래서 다음 챕터의 Python 버전은 더 단순하다.)

</details>

---

## Python으로 옮기면

Python에는 `Tool` 같은 거대한 인터페이스가 없으니 — `dataclass`와 dict 병합으로 같은 패턴을 만든다.

> 💡 **위 코드의 Python 문법 — 최소한:**
>
> - **`@dataclass`**: 필드 선언만 적으면 `__init__`/`__repr__` 등이 자동 생성. 아래 `Tool` 클래스가 짧은 이유.
> - **`Callable[[args], return]`**: 함수를 값으로 다룰 때의 타입 힌트. `Callable[[], str]` = "인자 없이 str 반환", `Callable[..., Awaitable[str]]` = "임의 인자 → 비동기 str". 메서드를 dict 로 모아 합치는 패턴이라 메서드가 *값처럼* 다뤄짐 — 그래서 Callable 로 명시.
>
> (`from __future__ import annotations`, `field()` 함정, `dataclass vs Pydantic`, 타입 힌트 일반론은 코드 *아래* 에서 풀어 본다.)

```python
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable
from pydantic import BaseModel


# ─── 기본값을 한 곳에 ────────────────
TOOL_DEFAULTS: dict[str, Any] = {
    "is_enabled": lambda: True,
    "is_concurrency_safe": lambda _input=None: False,  # fail-closed
    "is_read_only": lambda _input=None: False,         # fail-closed
    "is_destructive": lambda _input=None: False,
    "check_permissions": lambda input, _ctx=None: {
        "behavior": "allow",
        "updated_input": input,
    },
    "to_auto_classifier_input": lambda _input=None: "",  # 옵트인
}


@dataclass
class Tool:
    """완성된 도구. 호출자는 항상 모든 메서드가 있다고 가정해도 된다."""
    name: str
    description: Callable[[], str]
    input_schema: type[BaseModel]
    call: Callable[..., Awaitable[str]]
    is_enabled: Callable[..., bool]
    is_concurrency_safe: Callable[..., bool]
    is_read_only: Callable[..., bool]
    is_destructive: Callable[..., bool]
    check_permissions: Callable[..., Any]
    to_auto_classifier_input: Callable[..., str]
    user_facing_name: Callable[..., str]


def build_tool(**def_: Any) -> Tool:
    """부분 정의를 받아 안전 기본값으로 채워서 완성된 Tool을 돌려준다."""
    merged = (
        TOOL_DEFAULTS
        | {"user_facing_name": lambda _input=None: def_["name"]}
        | def_
    )
    return Tool(**merged)


# ─── 사용 ────────────────
class ReadInput(BaseModel):
    file_path: str


async def _read_call(input: ReadInput) -> str:
    return open(input.file_path).read()


read_tool = build_tool(
    name="Read",
    description=lambda: "Read a file from disk",
    input_schema=ReadInput,
    call=_read_call,
    is_read_only=lambda _input=None: True,  # Read만의 옵트인
)

# 작성자는 5개만 썼는데, read_tool은 11개 메서드를 다 가지고 있다.
# read_tool.is_concurrency_safe()  → False (기본값)
# read_tool.is_read_only()         → True  (덮어씀)
# read_tool.user_facing_name()     → "Read" (이름 기반 기본값)
```

**핵심은 `build_tool` 함수의 dict 병합 한 줄이다.** TypeScript의 `{...TOOL_DEFAULTS, ...def}`와 정확히 대응한다. 나중에 펼친 게 이긴다는 규칙이 두 언어에서 똑같이 동작한다.

> 💡 **위 코드의 Python 디테일 — 더 풀어보기:**
>
> **`from __future__ import annotations`**
>
> 모든 타입 힌트를 즉시 평가하지 않고 **문자열로 저장** (PEP 563). 두 가지 효과:
> - **자기 참조 가능**: `class Node: next: Node` 처럼 정의 중인 클래스가 자기 자신을 참조할 수 있음. 어노테이션이 즉시 평가되면 `Node` 가 아직 정의 중이라 에러, 문자열이면 OK.
> - **런타임 비용 감소**: 타입 표현식을 즉시 객체로 만들지 않아 import 가 빠름.
>
> **`field(default_factory=...)` — mutable default 함정**
>
> mutable default (list, dict) 는 `field(default_factory=...)` 로 써야 함:
>
> ```python
> @dataclass
> class Bad:
>     items: list = []                          # ✗ 모든 인스턴스가 같은 list 공유
>
> @dataclass
> class Good:
>     items: list = field(default_factory=list)  # ✓ 인스턴스마다 새 list
> ```
>
> 위 코드의 import 에 `field` 가 들어 있는 건 이 함정에 대비해서 (현재 코드에선 mutable default 가 없어 직접 안 쓰지만).
>
> **`dataclass` vs `pydantic.BaseModel`**
>
> 둘 다 "필드 선언 → `__init__` 자동 생성" 도구. **차이는 검증**.
>
> | | dataclass | Pydantic BaseModel |
> |---|---|---|
> | 런타임 타입 검증 | ✗ 없음 | ✓ 있음 |
> | 직렬화/역직렬화 | 수동 (`asdict` 등) | 자동 (`model_dump`, `model_validate`) |
> | 용도 | 내부 단순 struct | 외부 입력 검증, API 모델 |
>
> 위 코드는 두 개를 같이 씀: `Tool` 은 시스템 내부 객체라 검증 불필요 → dataclass. `input_schema` 는 LLM 이 생성한 인자를 받아 검증해야 함 → Pydantic.
>
> **Python 타입 힌트 일반론 — 왜 동적 언어에 타입을?**
>
> Python 의 타입 힌트는 런타임 동작을 직접 바꾸지 않음 (CPython 은 무시). 그럼 왜 쓰나? 4가지 용도:
>
> - **정적 체커** (mypy, pyright): 코드 실행 전에 타입 오류 발견. CI 에서 돌리면 PR 머지 전에 잡힘.
> - **IDE 자동완성**: VSCode/PyCharm 이 타입 정보로 더 정확한 제안. 객체에 점 찍으면 메서드 목록.
> - **런타임 검증** (Pydantic, FastAPI): 어노테이션을 *런타임에 읽어* 검증/직렬화. Pydantic 의 `BaseModel` 이 대표.
> - **사람/협업**: 함수 시그니처를 보고 무엇을 받고 무엇을 반환하는지 즉시 이해. 사실상 inline 문서.

> 💡 **dataclass 대신 dict로?** 그래도 된다. TypeScript의 `Tool` 객체는 본질적으로 **키가 정해진 dict**다. Python에서도 `Tool = dict[str, Any]`로 두고 그냥 dict로 다루면 더 단순하다. 단, IDE 자동완성과 타입 체크의 도움을 받으려면 `dataclass`나 `TypedDict`가 낫다.

> 💡 **두 패턴 중 어느 쪽이 production 에 더 맞나? — 권장**
>
> - **3.2 의 ABC + 상속**: Pythonic OOP 의 정통. `@abstractmethod` 가 인스턴스화 시 강제 검증 → 5개 핵심을 빠뜨리면 즉시 발견. IDE 자동완성/타입 체크 가장 강함. **LangChain `BaseTool` 같은 실제 production LLM 도구 라이브러리** 가 이 패턴을 채택.
> - **3.3 의 dict + 팩토리**: TypeScript spread 메커니즘과 직접 대응. 단순, 데이터/동작 분리 명확. 단, 5개 핵심을 빠뜨려도 인스턴스화 시 검증 안 됨 — 호출 시점에 `KeyError`/`AttributeError` 로 발견.
>
> **Python production 코드에서는 3.2 패턴 (ABC + 상속) 우선 권장.** 강제 검증과 IDE 지원이 협업에 도움. 3.3 의 dict 팩토리는 TypeScript 코드를 읽을 때 spread 메커니즘을 이해하기 위한 학습 도구로 활용.
>
> **단, 3.2 의 ToolBase 는 `is_*` 메서드들도 input 을 받게** 정의해야 진짜 production 형태 — 위 "왜 boolean 이 아니라 함수인가" 콜아웃에서 본 input 컨텍스트 의존성 때문. 즉 production = (ABC + 상속 + Generic[Input]) + (`is_read_only(self, input: I)`, `is_concurrency_safe(self, input: I)` 등 input-aware 메서드). 3.2 본문도 이 형태로 업데이트되어 있음.

---

## 핵심 정리

- `buildTool`은 **한 줄짜리 spread 함수**다. `{...TOOL_DEFAULTS, ...def}`. 사용자가 작성한 게 기본값을 덮어쓴다.
- `TOOL_DEFAULTS`는 7개의 안전 기본값을 한 곳에 모아둔 객체. 60개 이상의 도구가 공유한다. 수정도 한 곳, 검토도 한 곳. 런타임 (`TOOL_DEFAULTS`) 과 타입 (`DefaultableToolKeys`) 양쪽에서 7개가 한 곳에 산다.
- "fail-closed where it matters" — `isConcurrencySafe`와 `isReadOnly`는 잊으면 더 보수적인 쪽으로 기본값. 깜빡 잊은 코드가 자동으로 더 안전한 쪽으로 가게 만든다.
- `toAutoClassifierInput`는 옵트인. 보안 관련 도구는 명시적으로 켜야 한다. 잊으면 기능이 안 켜진다 — 잘못된 입력이 분류기를 망치는 사고가 안 난다.
- 47개짜리 인터페이스가 5개 작성으로 줄어드는 비밀: **호출자는 항상 완전한 객체를 본다** + **기본값은 한 곳에 산다**. 이 패턴이 6장(권한 시스템)에서 더 큰 스케일로 다시 나온다.

