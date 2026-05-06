# 3.3 buildTool 팩토리 — 안전 기본값을 한 곳에 모으기

---

## 이 챕터에서 배우는 것

- 47개짜리 인터페이스인데도 도구 하나 만들기가 왜 별로 안 어려운지
- `buildTool` 팩토리가 **한 줄짜리 spread**로 빠진 메서드를 채우는 메커니즘
- "fail-closed where it matters" — 안전한 기본값이 어디까지 안전하고 어디서 일부러 비안전인지
- 기본값을 한 곳에 모은다는 게 단순히 코드 중복 제거 이상이라는 사실

---

## 사용자 경험에서 출발

3.2에서 **47개 필드짜리 Tool 인터페이스**를 봤다. 그리고 핵심 5개만 채우면 된다고 했다. 근데 좀 이상하다.

> "5개만 채워도 도구가 완성된다고? 나머지 42개는 어디서 오는데? TypeScript가 컴파일 시점에 채워주는 게 아니잖아."

맞다. TypeScript는 타입을 검사할 뿐이다. 런타임에 객체에 메서드가 진짜로 있어야 도구가 동작한다. 그럼 누가 채우는가?

답: **`buildTool` 팩토리**가 채운다.

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
# Python 등가 — 도구 작성자가 쓰는 코드
from pydantic import BaseModel

class MyToolInput(BaseModel):
    x: int

class MyTool(ToolBase):
    name = "MyTool"
    input_model = MyToolInput

    def description(self) -> str:
        return "Does something useful"

    async def call(self, args: dict, context) -> str:
        return f"Got {args['x']}"
    # 나머지 42개는 ToolBase의 기본값이 채운다
```

:::

5개만 썼다. 그런데 `myTool`을 출력해보면 — `isEnabled`, `isReadOnly`, `checkPermissions`, ... 가 다 들어 있다. 마법이다. 이 마법이 바로 `buildTool`의 일이다.

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
    return {**TOOL_DEFAULTS, "user_facing_name": user_def["name"], **user_def}
    # Python 3.9+: TOOL_DEFAULTS | {"user_facing_name": ...} | user_def
```

:::

진짜로 **한 줄짜리 spread**다. JavaScript의 `...` 연산자로 두 객체를 합친다. Python의 `{**dict1, **dict2}`와 같다.

순서가 중요하다.

1. 먼저 `TOOL_DEFAULTS`를 펼친다 → 모든 기본값이 깔린다.
2. 그다음 `userFacingName: () => def.name` → 이름 기반 기본값을 덮어쓴다.
3. 마지막으로 `...def` → 사용자가 작성한 것을 덮어쓴다.

**나중에 펼친 게 이긴다.** 그래서 사용자가 작성한 메서드는 그대로 유지되고, 작성하지 않은 메서드는 기본값으로 채워진다. 겨우 이 정도가 마법의 정체다.

> 💡 **Python 비유:** `{**TOOL_DEFAULTS, **user_def}`와 같다. dict 병합의 마지막이 이긴다는 규칙. Python 3.9+에서는 `TOOL_DEFAULTS | user_def`로도 같은 일을 한다.

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
# Python 등가 — ToolBase 클래스의 기본 메서드들
class ToolBase(ABC):
    """47개 중 7개는 기본값을 가진다. 나머지는 도구마다 달라야 한다."""

    def is_enabled(self) -> bool: return True
    def is_concurrency_safe(self) -> bool: return False   # fail-closed
    def is_read_only(self) -> bool: return False          # fail-closed
    def is_destructive(self) -> bool: return False
    async def check_permissions(self, args): return "allow"
    def to_auto_classifier_input(self, args) -> str: return ""
    def user_facing_name(self) -> str: return self.name
```

:::

7개. 47개 중에 7개만 기본값을 가진다는 게 이상해 보일 수 있는데, 나머지 40개는 진짜로 도구마다 달라야 하는 것들이다. `name`, `description`, `inputSchema`, `call` 같은 핵심 5개는 기본값을 줄 수가 없다 — 도구의 정체성 자체니까. 그리고 렌더링 메서드 15개는 별도의 다른 시스템이 더 똑똑한 기본값을 가지고 있다 (Part 5에서 본다).

7개 각각의 의미:

| 메서드 | 기본값 | 안전 방향 |
|---|---|---|
| `isEnabled` | `true` | "활성화"가 기본 |
| `isConcurrencySafe` | `false` | **보수적** — 동시 실행 불가로 가정 |
| `isReadOnly` | `false` | **보수적** — 쓰기로 가정 |
| `isDestructive` | `false` | 비파괴로 가정 |
| `checkPermissions` | `allow` | 일반 권한 시스템에 위임 |
| `toAutoClassifierInput` | `''` (빈 문자열) | 분류기 건너뜀 |
| `userFacingName` | `name` (위에서 덮어씀) | 도구 이름 그대로 |

### "fail-closed where it matters" — 진짜 의미

`buildTool`의 docstring에는 "fail-closed where it matters"라고 쓰여 있다. 중요한 곳에서는 안전 쪽으로 fail. 어디가 중요한 곳인가?

**`isConcurrencySafe`와 `isReadOnly`가 그 자리다.**

- `isConcurrencySafe = false`가 기본 → 도구 작성자가 깜빡 잊으면, 시스템은 "동시에 돌리면 안 되는 도구"로 취급한다. 직렬로 실행한다. 안전한 쪽이다. 만약 기본값이 `true`였다면? 작성자가 동시 안전성을 검토하지도 않은 도구가 갑자기 병렬로 돌면서 경합 조건을 만들 수 있다. 큰 사고.
- `isReadOnly = false`가 기본 → 도구 작성자가 깜빡 잊으면, 시스템은 "쓰기 작업"으로 취급한다. 권한 체크가 더 엄격하게 들어간다. plan 모드에서는 차단된다. 안전한 쪽이다.

이게 "fail-closed where it matters"의 정체다. **잊어버렸을 때의 결과가 덜 위험한 쪽으로 향하도록 기본값을 정한다.** 이 철학이 6장(권한 시스템)에서 더 큰 형태로 다시 나온다.

> ⚠️ **함정:** `isDestructive = false`는 fail-closed가 아니다. 깜빡 잊으면 "파괴적이지 않다"로 취급된다. 왜 이렇게 했을까? 대부분의 도구는 진짜로 파괴적이지 않기 때문이다 (`Read`, `Glob`, `Grep` 등). 파괴적인 도구는 명시적으로 옵트인해야 한다. 자주 발생하는 케이스를 기본값으로 잡고, 드문 케이스는 작성자에게 강제로 표시하게 만드는 트레이드오프.

### `toAutoClassifierInput`은 옵트인

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

> 🔬 **Deep Dive — TypeScript의 타입 매직.** 위 코드의 진짜 어려운 부분은 런타임이 아니라 타입이다. `Tool.ts:707-714`에 `DefaultableToolKeys`라는 union type이 있어서 **어떤 7개가 default로 채워지는지**가 타입 레벨에 못 박혀 있다. 그리고 `Tool.ts:735-741`의 `BuiltTool<D>` 매핑 타입이 — 작성자가 채운 키는 그 타입을 그대로 유지하고, 안 채운 키는 기본값 타입을 가져온다. 그래서 `myTool.isReadOnly`를 호출하면 컴파일러가 "이건 무조건 함수다"라고 알게 된다. 작성자가 안 썼는데도. 이 타입 매직 덕분에 호출자는 옵셔널 체이닝(`?.`)이나 nullish 병합(`??`)을 전혀 안 써도 된다. 코드가 더 짧고 더 안전해진다. **즉, 7개의 기본값은 런타임에도 한 곳 (`TOOL_DEFAULTS`, `Tool.ts:757`), 타입에도 한 곳 (`DefaultableToolKeys`, `Tool.ts:707`) 에 산다.** Python에는 이런 매핑 타입이 없어서 같은 효과를 내려면 mypy plugin이나 TypedDict 트릭이 필요하다. (그래서 다음 챕터의 Python 버전은 더 단순하다.)

---

## Python으로 옮기면

Python에는 `Tool` 같은 거대한 인터페이스가 없으니 — `dataclass`와 dict 병합으로 같은 패턴을 만든다.

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
    merged = {
        **TOOL_DEFAULTS,
        "user_facing_name": lambda _input=None: def_["name"],
        **def_,
    }
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

> 💡 **dataclass 대신 dict로?** 그래도 된다. TypeScript의 `Tool` 객체는 본질적으로 **키가 정해진 dict**다. Python에서도 `Tool = dict[str, Any]`로 두고 그냥 dict로 다루면 더 단순하다. 단, IDE 자동완성과 타입 체크의 도움을 받으려면 `dataclass`나 `TypedDict`가 낫다.

---

## 핵심 정리

- `buildTool`은 **한 줄짜리 spread 함수**다. `{...TOOL_DEFAULTS, ...def}`. 사용자가 작성한 게 기본값을 덮어쓴다.
- `TOOL_DEFAULTS`는 7개의 안전 기본값을 한 곳에 모아둔 객체. 60개 이상의 도구가 공유한다. 수정도 한 곳, 검토도 한 곳. 런타임 (`TOOL_DEFAULTS`) 과 타입 (`DefaultableToolKeys`) 양쪽에서 7개가 한 곳에 산다.
- "fail-closed where it matters" — `isConcurrencySafe`와 `isReadOnly`는 잊으면 더 보수적인 쪽으로 기본값. 깜빡 잊은 코드가 자동으로 더 안전한 쪽으로 가게 만든다.
- `toAutoClassifierInput`는 옵트인. 보안 관련 도구는 명시적으로 켜야 한다. 잊으면 기능이 안 켜진다 — 잘못된 입력이 분류기를 망치는 사고가 안 난다.
- 47개짜리 인터페이스가 5개 작성으로 줄어드는 비밀: **호출자는 항상 완전한 객체를 본다** + **기본값은 한 곳에 산다**. 이 패턴이 6장(권한 시스템)에서 더 큰 스케일로 다시 나온다.

