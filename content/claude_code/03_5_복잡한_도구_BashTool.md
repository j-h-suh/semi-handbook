# 3.5 복잡한 도구 BashTool — 셸 인젝션과 싸우는 법

---

## 이 챕터에서 배우는 것

- 같은 3단계 패턴인데 BashTool이 왜 1,144줄이나 되는지
- 입력이 하나의 문자열인데 실행은 여러 명령인 도구의 본질적 어려움
- `ls && rm -rf /` 같은 합성 명령(compound command)을 권한 룰에 어떻게 매칭시키는가
- "fail-safe" — 파서가 못 알아먹으면 권한을 묻는 쪽으로 fall back하는 방어선
- `isReadOnly`가 입력에 따라 달라지는 유일한 도구라는 사실, 그리고 그 의미

---

## 사용자 경험에서 출발

`Read`는 단순했다. 입력 `{file_path: "foo.ts"}`이 들어오면, 하나의 파일을 읽는다. 끝.

근데 `Bash`는 다르다. 입력 `{command: "ls && git push origin main"}`이 들어왔다고 하자. 이건 하나의 작업인가, 둘인가?

![Bash 합성 명령 — 부분별 안전성 분리](/content/claude_code/images/03_5/bash_command_split.svg)

둘이다. 그리고 권한 시스템은 둘 다 검사해야 한다. 만약 문자열 통째로 매칭하면? 사용자가 `Bash(git *)` 룰로 **git 명령은 매번 묻기**로 설정해뒀어도, `ls && git push`는 그 룰을 우회한다. 룰의 패턴이 첫 글자 `l`에 안 맞으니까. 보안이 통째로 무너진다.

이 챕터의 본질이다. **Bash는 문자열을 받는데 코드를 실행한다.** 그 둘 사이의 갭이 복잡함의 원천이다.

---

## 본문

### `BashTool.tsx`도 같은 3단계로 시작한다

`src/tools/BashTool/BashTool.tsx` 420줄에 `buildTool({...})`이 있다. 골격은 `FileRead`와 똑같다.

:::tabs

```typescript
export const BashTool = buildTool({
  name: 'Bash',
  inputSchema,                       // command: string
  isConcurrencySafe(input) { ... },  // 동적
  isReadOnly(input) { ... },         // 동적
  toAutoClassifierInput(input) {
    return input.command             // 분류기에 명령 통째로 전달
  },
  preparePermissionMatcher({command}) { ... },  // 핵심
  validateInput(input) { ... },      // 1단계
  checkPermissions(input, ctx) {     // 2단계
    return bashToolHasPermission(input, context)
  },
  call(input, ctx) { ... },          // 3단계
})
```

```python
# Python 등가 — BashTool의 골격. FileRead와 다른 점: 동적 속성
class BashInput(BaseModel):
    command: str
    timeout: int | None = None

class BashTool(ToolBase[BashInput]):
    name = "Bash"
    input_model = BashInput

    def is_read_only(self, input: BashInput) -> bool:
        # ⭐ 동적 — 입력 명령에 따라 달라진다 (유일한 케이스)
        return is_read_only_command(input.command)

    def is_concurrency_safe(self, input: BashInput) -> bool:
        return self.is_read_only(input)  # 읽기면 동시 OK

    async def validate_input(self, args, ctx): ...
    async def check_permissions(self, args, ctx): ...
    async def call(self, args, ctx): ...
```

:::

3단계 패턴은 그대로다. 차이는 — 각 단계 안의 코드가 비교할 수 없이 복잡하다. 그리고 새로 등장한 게 하나 있다: **`preparePermissionMatcher`**. 이게 셸 인젝션 방어의 중심이다.

### `preparePermissionMatcher` — 합성 명령을 쪼개는 일

`BashTool.tsx` 445줄.

:::tabs

```typescript
async preparePermissionMatcher({ command }) {
  // 사용자의 권한 룰 (예: Bash(git *)) 과 매칭하기 위해 명령을 파싱
  const parsed = await parseForSecurity(command)
  if (parsed.kind !== 'simple') {
    // 파싱 실패 / 너무 복잡 → fail-safe: 모든 룰에 매칭된다고 본다 (권한 묻기)
    return () => true
  }
  
  // 합성 명령을 *각 하위 명령*으로 쪼갠다
  // (예: "FOO=bar git push" → 환경 변수 떼고 → "git push")
  const subcommands = parsed.commands.map(c => c.argv.join(' '))
  
  return pattern => {
    const prefix = permissionRuleExtractPrefix(pattern)
    return subcommands.some(cmd => {
      if (prefix !== null) {
        return cmd === prefix || cmd.startsWith(`${prefix} `)
      }
      return matchWildcardPattern(pattern, cmd)
    })
  }
}
```

```python
# Python 등가 — 합성 명령을 쪼개서 권한 룰과 매칭하는 로직
import shlex
from fnmatch import fnmatch

def prepare_permission_matcher(command: str):
    """셸 명령을 파싱해서 권한 룰 매칭 함수를 반환한다."""
    try:
        # 진짜 코드는 tree-sitter 파서 사용. 여기선 shlex로 단순화.
        subcommands = parse_subcommands(command)
    except ValueError:
        # 파싱 실패 → fail-safe: "모든 룰에 매칭" → 사용자에게 묻기
        return lambda pattern: True

    def matcher(pattern: str) -> bool:
        """어느 하위 명령이라도 패턴에 매칭되면 True."""
        return any(fnmatch(cmd, pattern) for cmd in subcommands)

    return matcher
```

:::

읽어보면 — 세 가지 결정이 깔려 있다.

**(1) 입력 문자열을 AST 로 파싱한다.** **AST(Abstract Syntax Tree, 추상 구문 트리)** 는 코드를 *텍스트가 아니라 트리 구조* 로 본 결과 — 문법 단위 (명령/인자/연산자) 가 노드가 되고, 부모-자식 관계로 의미가 담긴다. 예: `ls && git push` → `[and: [ls], [git push]]` 같은 트리. 정규식이 아니라 진짜 셸 파서를 쓴다. `parseForSecurity`는 tree-sitter 기반인데, 추측이 아니라 같은 모듈 안의 코멘트가 직접 증명한다 (`bashPermissions.ts:97`): "Each subcommand then runs tree-sitter parse + ~20 validators". 정규식으로 셸을 파싱하면 백 가지 우회를 놓친다. `git$IFS\$9push`, `g\it push`, `$(echo git) push` 같은 변형들. 진짜 파서가 필요하다.

**(2) 각 하위 명령에 대해 룰 매칭을 OR로 묶는다.** `subcommands.some(...)`. 즉 어느 하나라도 매칭되면 그 룰이 적용된다. `ls && git push`에서 `git push` 부분이 `Bash(git *)`에 매칭되면, 전체 명령이 그 룰의 영향권에 들어온다. 첫 챕터의 사고가 여기서 막힌다.

**(3) 매칭하기 전에 `argv.join(' ')`로 정규화한다.** 환경 변수 prefix(`FOO=bar`)를 떼고 본다. `FOO=bar git push`는 `git push`로 정규화된다. 그래서 `Bash(git *)` 룰에 제대로 매칭된다. 코멘트가 친절하게 설명한다 — "Match on argv (strips leading VAR=val) so `FOO=bar git push` still matches `Bash(git *)`".

> ⚠️ **함정 — 정규식으로 셸 파싱하지 마라.** 본 적이 한두 번이 아니다. `git\s+push` 같은 정규식으로 권한을 거른다. 다음 버전에서 LLM이 `g""it push`를 던진다. 통과한다. 셸은 문법이 풍부한 언어라서 정규식으로 막을 수 없다. 진짜 파서를 써야 한다. 그리고 파서가 못 알아먹는 입력이 오면 — 다음 결정으로 넘어간다.

### Fail-safe — 알아먹지 못하면 묻는다

위 코드 452줄.

:::tabs

```typescript
if (parsed.kind !== 'simple') {
  return () => true   // 모든 룰에 매칭된다고 본다 → 권한 묻기 발동
}
```

```python
# Python 등가 — 알아먹지 못하면 모두 매칭된다고 가정
if parsed.kind != "simple":
    return lambda: True  # → ask 발동, fail-safe
```

:::

파서가 너무 복잡한 입력을 만나면? 예를 들어 50개가 넘는 하위 명령으로 쪼개지는 케이스. `bashPermissions.ts:103`에 제한이 있다.

```typescript
export const MAX_SUBCOMMANDS_FOR_SECURITY_CHECK = 50
```

코멘트가 어떤 사고를 겪었는지 친절하게 적혀 있다 (`bashPermissions.ts:95-102`, 축약 인용).

> "On complex compound commands, `splitCommand_DEPRECATED` can produce a very large subcommands array (possible exponential growth; #21405's ReDoS fix may have been incomplete). Each subcommand then runs tree-sitter parse + ~20 validators + logEvent ... starves the event loop — REPL freeze at 100% CPU, strace showed /proc/self/stat reads at ~127Hz with no epoll_wait."

쪼개기가 지수적으로 폭발하는 케이스가 있었다. REPL이 100% CPU로 멈췄다. 사고 분석 후 — "50개 넘으면 ask로 fall back". 그 fall-back이 발동되는 조건문은 같은 파일 line 2162-2164:

:::tabs

```typescript
if (astSubcommands === null && subcommands.length > MAX_SUBCOMMANDS_FOR_SECURITY_CHECK) {
  // ... → returning ask
}
```

```python
# Python 등가 — 50개 넘는 하위 명령은 ask로 fall back
if ast_subcommands is None and len(subcommands) > MAX_SUBCOMMANDS_FOR_SECURITY_CHECK:
    return "ask"  # tree-sitter 폭주로 REPL이 100% CPU 멈추던 사고
```

:::

**알아먹지 못하면 묻는다**. 모든 안전 결정이 덜 위험한 쪽으로 향한다. 3.3에서 본 fail-closed 철학이 여기서 더 큰 형태로 다시 나온다.

### `isReadOnly`가 동적이다 — 유일한 케이스

3.4에서 `FileRead.isReadOnly: () => true` 였다. 항상 `true`. 입력과 무관.

`Bash`는 다르다.

:::tabs

```typescript
isReadOnly(input) {
  const compoundCommandHasCd = commandHasAnyCd(input.command)
  const result = checkReadOnlyConstraints(input, compoundCommandHasCd)
  return result.behavior === 'allow'
}
```

```python
# Python 등가 — 입력에 따라 읽기/쓰기를 동적으로 판단
WRITE_COMMANDS = {"rm", "mv", "cp", "mkdir", "chmod", "chown", "dd", "tee"}

def is_read_only_command(command: str) -> bool:
    """명령이 읽기 전용인지 판단. 하나라도 쓰기면 False."""
    subcommands = parse_subcommands(command)
    return all(
        shlex.split(cmd)[0] not in WRITE_COMMANDS
        for cmd in subcommands
        if cmd.strip()
    )
```

:::

입력을 보고 결정한다. `ls`면 `true`. `rm`이면 `false`. `ls && rm`이면 — `false` (둘 중 하나라도 쓰기면 전체가 쓰기). 

이게 유일한 케이스다. `Read`, `Glob`, `Grep`, `LSP` 같은 다른 도구는 고정으로 read-only다. **Bash만이 입력에 따라 자기 정체를 바꾼다**. 셸이라는 게 본질적으로 임의 코드 실행이라서 — 도구 자체가 읽기인지 쓰기인지를 미리 말할 수 없다.

그리고 그 다음 줄.

:::tabs

```typescript
isConcurrencySafe(input) {
  return this.isReadOnly?.(input) ?? false
}
```

```python
# Python 등가 — concurrency_safe는 read_only에 위임
def is_concurrency_safe(self, input: dict) -> bool:
    """읽기면 동시에, 쓰기면 직렬로 — 일관성을 한 곳에서 보장."""
    return self.is_read_only(input) if hasattr(self, "is_read_only") else False
```

:::

**`isConcurrencySafe`가 `isReadOnly`에 위임한다.** 영리하다. 읽기 작업이면 동시에 돌려도 안전, 쓰기 작업이면 직렬로. 두 메서드가 연결되어 있다. 일관성도 한 곳에서 보장된다.

### 1단계 `validateInput`: 또 다른 사고를 막는 자리

:::tabs

```typescript
async validateInput(input) {
  if (feature('MONITOR_TOOL') && !input.run_in_background) {
    const sleepPattern = detectBlockedSleepPattern(input.command)
    if (sleepPattern !== null) {
      return { result: false, message: `Blocked: ${sleepPattern}. ...` }
    }
  }
  return { result: true }
}
```

```python
# Python 등가 — blocking sleep 거부 (행동 교정)
async def validate_input(self, input: dict) -> dict:
    if feature("MONITOR_TOOL") and not input.get("run_in_background"):
        sleep_pattern = detect_blocked_sleep_pattern(input["command"])
        if sleep_pattern is not None:
            return {"result": False, "message": f"Blocked: {sleep_pattern}. ..."}
    return {"result": True}
    # 2초 이상 sleep 거부 — REPL이 멈추는 사고를 막는다
```

:::

`sleep 5 && check`처럼 **blocking sleep**을 거른다. LLM이 "5초 기다렸다가 결과 보자" 같은 폴링을 짜면, 그 5초 동안 모든 게 멈춘다. 다른 도구도 못 돈다. 사용자도 못 친다. 그래서 **2초 이상 sleep은 거부**하고 "Monitor 도구를 쓰라"고 메시지를 돌려준다.

이건 보안 검증이 아니라 행동 교정이다. LLM에게 "이렇게 쓰면 안 됨, 저렇게 써"라고 가르친다. validateInput의 자리는 — 모든 "이건 진행하면 안 된다"가 모이는 곳이다. 이유는 보안일 수도, 성능일 수도, 행동 가이드일 수도 있다.

### 그래서 1,144줄

`Read`는 1,184줄, `Bash`는 1,144줄. 비슷하다. 차이는 — `Read`의 분량은 **PDF/이미지/노트북 파싱** 같은 파일 형식의 다양함에서 나오고, `Bash`의 분량은 셸 명령의 적대성에서 나온다.

| | FileRead | BashTool |
|---|---|---|
| 입력 | 경로 한 개 | 임의 코드 한 줄 |
| 적이 누구냐 | UNC NTLM 사고 (한 가지) | 합성 명령, 환경변수 prefix, 인용 변형, ReDoS, 폴링, ... |
| 검증의 목적 | 디스크 만지기 전에 거른다 | 권한 매칭이 정확하도록 파싱한다 + 행동 교정 |
| isReadOnly | 항상 `true` | 입력에 따라 동적 |

같은 3단계 패턴이 다른 적과 만나면 다른 모양이 된다. 패턴은 같고, 그 안의 채움이 다르다. 이게 인터페이스의 힘이다.

<details>
<summary>🔬 Deep Dive — `parseForSecurity`가 tree-sitter를 쓰는 진짜 이유</summary>

> tree-sitter는 부분 파싱과 에러 복구가 강하다. 셸 입력은 문법이 깨진 채로 도착할 수 있다 — LLM이 토큰 한 개를 빼먹거나, 인용을 잘못 닫거나. 일반 파서는 그 자리에서 throw한다. 근데 보안 결정을 **throw 한 번**에 맡길 수는 없다 — 그러면 파싱 실패 = 런타임 에러가 되고, 사용자는 권한 다이얼로그조차 못 본다. tree-sitter는 **깨진 입력에서도 부분 AST**를 돌려준다. 그 부분 AST에서 최대한 많은 하위 명령을 추출하고, **나머지는 fail-safe로 ask**. 정규식이나 일반 파서로는 못 하는 일이다.

</details>

---

## Python으로 옮기면

Python으로 BashTool의 권한 매칭 핵심만 골라 옮기면 이렇게 생겼다.

```python
from __future__ import annotations
import shlex
from dataclasses import dataclass
from fnmatch import fnmatch


# ─── 환경 변수 prefix 패턴 ────────────────
def strip_env_prefix(argv: list[str]) -> list[str]:
    """`FOO=bar git push` → `git push` 로 정규화."""
    i = 0
    while i < len(argv) and "=" in argv[i] and argv[i].split("=", 1)[0].isidentifier():
        i += 1
    return argv[i:]


# ─── 합성 명령 쪼개기 ────────────────
@dataclass
class SubCommand:
    argv: list[str]


def parse_for_security(command: str) -> list[SubCommand] | None:
    """합성 명령을 하위 명령들로 쪼갠다. 못 알아먹으면 None."""
    try:
        # shlex는 진짜 셸 파서가 아니지만 예시로 충분
        # 실제로는 tree-sitter나 bashlex를 써야 한다
        parts: list[list[str]] = [[]]
        for token in shlex.split(command, posix=True):
            if token in ("&&", "||", ";", "|"):
                parts.append([])
            else:
                parts[-1].append(token)
        
        return [SubCommand(argv=strip_env_prefix(p)) for p in parts if p]
    except ValueError:
        return None  # 파싱 실패 → 호출자가 fail-safe 처리


MAX_SUBCOMMANDS = 50


def prepare_permission_matcher(command: str):
    """권한 룰과 매칭할 함수를 만든다."""
    parsed = parse_for_security(command)
    
    # Fail-safe: 못 알아먹거나 너무 복잡하면 *모든 룰에 매칭*
    if parsed is None or len(parsed) > MAX_SUBCOMMANDS:
        return lambda pattern: True   # → 권한 묻기 발동
    
    subcommands = [" ".join(sub.argv) for sub in parsed]
    
    def matcher(pattern: str) -> bool:
        # 한 하위 명령이라도 패턴에 맞으면 True (셸 와일드카드 매칭)
        return any(fnmatch(cmd, pattern) for cmd in subcommands)
    
    return matcher


# ─── 사용 ────────────────
matcher = prepare_permission_matcher("FOO=bar ls && git push origin main")
print(matcher("git*"))        # True  ← git push가 매칭 (와일드카드)
print(matcher("ls"))          # True  ← ls는 완전 일치
print(matcher("rm*"))         # False
print(matcher("docker"))      # False

# 적대적 입력 — 파싱 실패
matcher_broken = prepare_permission_matcher("'unclosed quote && rm -rf")
print(matcher_broken("anything"))  # True  ← fail-safe로 권한 묻기
```

핵심 세 가지가 다 들어 있다.

1. **합성 명령을 하위 명령으로 쪼갠다** (`parse_for_security`).
2. **환경 변수 prefix를 떼어 정규화한다** (`strip_env_prefix`).
3. **파싱 실패면 fail-safe로 항상 매칭한다** → 권한 묻기 발동.

<details>
<summary>🔬 Deep Dive — `strip_env_prefix` 동작 추적</summary>

> 위 코드의 `strip_env_prefix` 가 어떻게 환경 변수 prefix 를 떼어내는지 한 줄씩 본다.
>
> ```python
> def strip_env_prefix(argv: list[str]) -> list[str]:
>     i = 0
>     while i < len(argv) and "=" in argv[i] and argv[i].split("=", 1)[0].isidentifier():
>         i += 1
>     return argv[i:]
> ```
>
> **핵심 — `.isidentifier()`** 는 Python 문자열 메서드로, 그 문자열이 **valid Python identifier 형식** (letter/underscore 로 시작, 나머지 letter/digit/underscore) 인지 판정. 환경 변수 이름 (`FOO`, `MY_VAR`) 은 모두 이 규칙을 따르므로, `=` 앞 부분이 identifier 면 "env var prefix" 로 인정.
>
> ```python
> "FOO".isidentifier()         # True
> "_PRIVATE".isidentifier()    # True
> "FOO123".isidentifier()      # True
> "123foo".isidentifier()      # False (숫자로 시작)
> "foo-bar".isidentifier()     # False (하이픈)
> ```
>
> **트레이스 — `argv = ["FOO=bar", "Baz=gux", "git", "push"]` (len = 4):**
>
> | iter | `i` | `argv[i]` | `i < 4` | `"=" in argv[i]` | `split("=",1)[0]` | `.isidentifier()` | 결과 |
> |---|---|---|---|---|---|---|---|
> | 1 | 0 | `"FOO=bar"` | ✓ | ✓ | `"FOO"` | ✓ | `i=1` |
> | 2 | 1 | `"Baz=gux"` | ✓ | ✓ | `"Baz"` | ✓ | `i=2` |
> | 3 | 2 | `"git"` | ✓ | ✗ | (skip) | (skip) | **종료** |
>
> → `return argv[2:]` = `["git", "push"]`. env prefix 두 개 떼고 진짜 명령만 남음.
>
> **참고 — short-circuit 평가:** `while a and b and c` 에서 `a` 가 False 면 `b`, `c` 는 평가 안 됨. iteration 3 에서 `"=" in "git"` 이 False 가 나오자마자 `.split(...).isidentifier()` 는 호출 안 됨 — `=` 없는 명령에서 `KeyError` 같은 부작용 없음.

</details>

진짜 BashTool은 여기에 진짜 셸 파서, **tree-sitter**, 50개 검증기, 분류기, 샌드박스 결정, 백그라운드 작업, **sed 시뮬레이션**까지 더해진 게 1,144줄이다. 본질은 위 50줄. **나머지는 같은 본질의 더 정교한 적용**일 뿐이다.

> 💡 **두 도구가 보여주는 것.** `Read`(3.4)와 `Bash`(이 챕터)는 같은 3단계 패턴의 양 극단이다. 하나는 친절한 입력(파일 경로), 하나는 적대적 입력(임의 코드). 같은 인터페이스가 두 케이스를 다 담는다. **이게 47개 필드짜리 Tool 인터페이스가 정당화되는 이유**다 — 도구 하나하나가 자기 모양대로 채우면서, 시스템(에이전트 루프)은 동일한 방식으로 호출할 수 있다. Part 3가 여기서 끝난다.

---

## 핵심 정리

- BashTool은 `FileRead`와 같은 3단계 패턴을 쓴다. 차이는 — 입력이 적대적이라서 각 단계 안의 코드가 비교할 수 없이 복잡하다.
- 핵심은 **`preparePermissionMatcher`**: `ls && git push` 같은 합성 명령을 하위 명령으로 쪼개고, 각 하위 명령을 진짜 셸 파서로 정규화하고(`FOO=bar git push` → `git push`), 권한 룰을 OR로 매칭한다.
- **Fail-safe**: 파서가 못 알아먹거나 50개 넘게 쪼개지면 모든 룰에 매칭된다고 본다 — 권한 묻기 발동. 알아먹지 못하면 묻는 쪽으로 fall back. 3.3의 fail-closed 철학이 더 큰 스케일에서 반복.
- **`isReadOnly`가 동적인 유일한 도구**. `ls`면 `true`, `rm`이면 `false`. 그리고 `isConcurrencySafe`가 `isReadOnly`에 위임 — **읽기는 동시에 OK, 쓰기는 직렬**.
- 같은 인터페이스가 친절한 입력(`Read`)과 적대적 입력(`Bash`)을 둘 다 담는다. 이게 47개 필드짜리 Tool 인터페이스가 정당화되는 이유. **Part 3 끝.**

