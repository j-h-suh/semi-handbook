# 4.3 `allowedTools` — 명령이 도구 사용을 화이트리스트로 제한하는 이유

---

## 이 챕터에서 배우는 것

- `/commit`을 칠 때 권한 다이얼로그가 안 뜨는 이유
- `allowedTools`가 제한인지 허용인지 — 둘 다라는 사실
- 턴이 끝나면 권한이 사라지는 스코프 메커니즘
- 슬래시 명령이 프롬프트 + 권한 + 도구 집합의 **번들**이라는 통찰
- 6장(권한 시스템)에 깔리는 **layer 구조**의 첫 등장

---

## 사용자 경험에서 출발

`Bash` 도구를 수동으로 호출시키면 — 사용자에게 권한 다이얼로그가 뜬다.

```
> ls -la
   ┌─ Permission required ──────────────┐
   │  Run shell command?                 │
   │  > Bash: ls -la                     │
   │   [Y]es  [N]o  [A]lways            │
   └────────────────────────────────────┘
```

매번 묻는다. 안전 메커니즘이다.

근데 `/commit`을 치면 — 안 묻는다. `git status`가 돌고, `git diff`가 돌고, `git commit`이 도는데 — 다이얼로그가 한 번도 안 뜬다. 사용자는 그냥 결과를 본다.

```
> /commit
   ⠋ creating commit
   ✓ git status
   ✓ git diff HEAD
   ✓ git commit -m "..."
   Created commit abc123
```

뭔가 우회가 된 느낌이다. 보안이 약해진 건가? 아니다. 이 챕터의 핵심 — **`allowedTools`라는 작은 필드 하나**가 정확히 이 경험을 만든다.

---

## 본문

### `allowedTools`는 권한 패키지다

4.1에서 본 `commit.ts`를 다시 펼치자.

```typescript
const ALLOWED_TOOLS = [
  'Bash(git add:*)',
  'Bash(git status:*)',
  'Bash(git commit:*)',
]

const command = {
  type: 'prompt',
  name: 'commit',
  allowedTools: ALLOWED_TOOLS,   // ← 이거
  // ...
}
```

세 줄짜리 배열. 이게 명령에 동봉된 권한 패키지다. 의미는 **"이 명령이 도는 동안, 이 세 가지 Bash 패턴은 자동으로 허용된다 — 사용자에게 묻지 마라".**

`/commit`이 LLM에게 "git status를 돌려라"라고 시키면 — 권한 시스템이 알아본다: "이건 commit 명령이 동봉한 패턴 중 하나야". 다이얼로그를 생략한다. 도구가 바로 실행된다.

사용자 입장에서는 마법처럼 매끄럽다. 시스템 입장에서는 명시적인 사전 승인이다. 마법이 아니다.

### 어디서 적용되는가 — `QueryEngine.ts:483`

진짜 코드는 어디 있나? `QueryEngine.ts:477-486` 의 setAppState 블록. 핵심은 line 483 (`command: allowedTools`).

:::tabs

```typescript
// processSlashCommand가 명령의 allowedTools를 추출해서 넘겨준다
setAppState(prev => ({
  ...prev,
  toolPermissionContext: {
    ...prev.toolPermissionContext,
    alwaysAllowRules: {
      ...prev.toolPermissionContext.alwaysAllowRules,
      command: allowedTools,   // ← 이 자리에 박힌다
    },
  },
}))
```

```python
# Python 등가 — 명령의 allowedTools를 권한 시스템에 주입
class PermissionEngine:
    def __init__(self):
        self.always_allow_rules = {
            "user": [],       # 사용자가 "항상 허용" 누른 것
            "settings": [],   # settings.json에 적힌 것
            "command": [],    # ⭐ 슬래시 명령이 동봉한 것 (한 턴만 산다)
        }

    def inject_command_tools(self, allowed_tools: list[str]):
        """명령 시작 시 호출 — command 슬롯에 주입."""
        self.always_allow_rules["command"] = allowed_tools

    def clear_command_tools(self):
        """턴 끝나면 호출 — command 슬롯 리셋."""
        self.always_allow_rules["command"] = []
```

:::

"항상 허용 룰의 command 슬롯에 `allowedTools`를 대입한다."

여기서 두 가지가 중요하다.

**(1) `alwaysAllowRules`는 여러 슬롯을 가진 객체다.** `command`는 그 중 하나의 슬롯. 다른 슬롯도 있다 — 사용자가 "앞으로도 항상 허용"을 누른 룰, 프로젝트 settings.json에 적힌 룰, CLI 옵션으로 넘긴 룰 등. 각자 자기 슬롯이 있고, 권한 체크 시점에 전부 합쳐서 매칭한다. 6.4(권한 룰 매칭)에서 본격적으로 본다. 지금은 "`command` 슬롯 = 슬래시 명령이 동봉한 권한"이라고 알고 가자.

**(2) `command` 슬롯은 덮어씌워진다.** `...prev.alwaysAllowRules`로 다른 슬롯은 보존되지만, `command` 슬롯은 **새 명령의 allowedTools로 대체**된다. 이게 다음 항목의 핵심이다.

### 턴이 끝나면 증발한다

`REPL.tsx` 2700줄에 결정적인 코멘트가 있다.

```typescript
// Apply slash-command-scoped allowedTools (from skill frontmatter) to the
// store once per turn. This also covers the reset: the next non-skill turn
// passes [] and clears it.
```

"이번 턴 한 번에 적용한다. 다음 비-skill 턴은 빈 배열을 넘겨서 자동으로 비운다."

번역하면 — **`command` 슬롯은 한 턴만 산다**. `/commit` 턴 동안에는 git 패턴들이 박혀 있고, 다음에 사용자가 일반 채팅을 치는 순간 — 그 슬롯은 빈 배열로 리셋된다. 다음 번 일반 채팅에서 LLM이 갑자기 `git push`를 시도해도 — 권한 다이얼로그가 다시 뜬다.

```
턴 1: /commit            → command 슬롯: ['Bash(git add:*)', ...]
턴 2: "이 함수 리팩토링"  → command 슬롯: []   ← 자동 리셋
턴 3: /commit-push-pr    → command 슬롯: ['Bash(git push:*)', ...]
```

이게 **capability-based security**의 작은 형태다. 권한이 주어진 자리, 주어진 시간에만 산다. 다른 곳으로 흘러나가지 않는다. 사용자는 한 명령에 권한을 위임했고, 그 명령이 끝나면 권한도 같이 끝난다.

> ⚙️ **턴 스코프뿐만 아니라 forked agent까지 격리한다 (8장 떡밥).** `command` 슬롯을 비우는 시점이 중요하다 — 서브 에이전트(8장의 AgentTool)가 시작될 때 자기 권한 컨텍스트에 부모 턴의 슬롯을 읽어들이기 때문에, 리셋이 너무 늦으면 부모의 권한이 그대로 누수된다. 그래서 슬롯 리셋은 forked agent의 권한 체크가 일어나기 *전*에 와야 한다. **capability-based security가 부모-자식 에이전트 경계까지 닿는다는 뜻**. 8장에서 본격적으로 본다.

### 더 큰 예시 — `commit-push-pr.ts`

`commit.ts`는 3개 패턴이었다. `commit-push-pr.ts`는 13개다.

```typescript
const ALLOWED_TOOLS = [
  'Bash(git checkout --branch:*)',
  'Bash(git checkout -b:*)',
  'Bash(git add:*)',
  'Bash(git status:*)',
  'Bash(git push:*)',           // ← 푸시도 허용
  'Bash(git commit:*)',
  'Bash(gh pr create:*)',       // ← gh도
  'Bash(gh pr edit:*)',
  'Bash(gh pr view:*)',
  'Bash(gh pr merge:*)',
  'ToolSearch',
  'mcp__slack__send_message',  // ← MCP 도구도
  'mcp__claude_ai_Slack__slack_send_message',
]
```

세심하게 최소 필요 권한만 골라 두었다. `git rebase`도 없고, `git reset`도 없고, `git config`도 없다. 명령의 목적에 정확히 필요한 것만.

이게 보안 원칙 **least privilege**(최소 권한)의 적용이다. 명령 작성자가 "내가 무엇을 해야 하는가"를 미리 생각해서, 정확히 그 만큼만 동봉한다. 명령이 자기가 필요한 것을 안다. 사용자가 매번 결정할 필요가 없다.

### Skill도 같은 패턴 — frontmatter

명령뿐만 아니라 **skill**도 같은 메커니즘을 쓴다. 사용자가 만드는 skill은 `.md` 파일에 frontmatter 헤더 + 본문이 들어 있고, `allowed-tools`가 그 헤더에 적힌다. 빌트인 `security-review`는 흥미로운 변종 — `.md` 파일을 안 쓰고 **TS 코드 안에 같은 형식의 마크다운 문자열을 박아 둔다** (`security-review.ts:6-9`):

```typescript
const SECURITY_REVIEW_MARKDOWN = `---
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git show:*), Bash(git remote show:*), Read, Glob, Grep, LS, Task
description: Complete a security review of the pending changes on the current branch
---

You are a senior security engineer conducting a focused security review...
`
```

`.md` 파일이든 코드 안의 문자열이든 — **같은 파서**(`parseFrontmatter` + `parseSlashCommandToolsFromFrontmatter`)가 처리해서 같은 `command` 슬롯에 들어간다. 빌트인과 사용자 정의가 하나의 데이터 모델을 공유하는 것.

이 모델의 핵심은 — **한 덩어리의 마크다운에 프롬프트(본문) + 권한(`allowed-tools`) + 설명(`description`)이 응축돼 있다**는 것. `commit.ts`처럼 TS 코드 곳곳에 흩어져 있던 셋이 한 텍스트로 묶인 형태다. 10.2에서 직접 SKILL.md를 만들 때 이 응축을 손으로 다시 한다.

> 🔬 **Deep Dive — `claude -p ... --allowedTools`와는 정반대다.** Headless 모드(`claude -p`)의 `--allowedTools`는 **화이트리스트 필터**다 — 목록에 없는 도구는 아예 사용 불가. 슬래시 명령의 `allowedTools`는 반대로 **자동 허용 목록**이다 — 거기 있으면 다이얼로그를 건너뛰고, 없는 도구도 권한이 있다면 여전히 쓸 수 있다. 같은 키워드가 실행 환경(headless vs interactive)에 따라 정반대 방향으로 동작한다는 걸 알면 정리된다.

### 4장 통합 — 명령 = 번들

이 챕터로 4장이 끝난다. 4장 전체를 한 줄로 정리하면 이렇다.

> **슬래시 명령은 프롬프트 + 권한 + 도구 집합을 한 객체에 패키징한 것이다.**

- **프롬프트** (4.1): `getPromptForCommand`가 만드는 거대한 문자열
- **명령 종류** (4.2): `prompt` / `local` / `local-jsx` 중 하나
- **권한** (4.3): `allowedTools`로 턴 스코프 자동 허용

이 셋을 한 군데에 묶었다는 게 슬래시 명령의 본질이다. 사용자는 `/commit`을 치고 — 프롬프트도, 안전 정책도, 어떤 도구를 쓸지도 한 번에 따라온다. 명령 작성자는 셋을 같이 설계한다. 권한이 빠진 프롬프트는 위험하고, 프롬프트가 빠진 권한은 무의미하니까.

이 번들 사고가 6장(권한 시스템)에서 더 큰 형태로 확장된다. 그리고 10장에서 — 직접 슬래시 명령을 만들고, **직접 SKILL.md를 만들고**, **직접 MCP 서버를 만들 때** 이 통찰이 다 회수된다.

---

## Python으로 옮기면

권한 슬롯 모델을 Python으로 옮기면 이렇게 생겼다.

```python
from __future__ import annotations
from dataclasses import dataclass, field
import fnmatch


# ─── 권한 컨텍스트: 여러 슬롯을 가진 객체 ────────────────
@dataclass
class PermissionContext:
    # 영구 룰 (settings.json에서 옴)
    user_rules: list[str] = field(default_factory=list)
    project_rules: list[str] = field(default_factory=list)
    # 임시 룰 — 명령 스코프, 한 턴만 산다
    command_rules: list[str] = field(default_factory=list)
    
    def is_always_allowed(self, tool_name: str, input_str: str) -> bool:
        """모든 슬롯을 *합쳐서* 매칭."""
        all_rules = self.user_rules + self.project_rules + self.command_rules
        return any(
            fnmatch.fnmatch(f"{tool_name}({input_str})", pattern)
            for pattern in all_rules
        )


# ─── 슬래시 명령 정의 ────────────────
@dataclass
class PromptCommand:
    name: str
    allowed_tools: list[str]
    get_prompt: callable


commit_command = PromptCommand(
    name="commit",
    allowed_tools=[
        "Bash(git add:*)",
        "Bash(git status:*)",
        "Bash(git commit:*)",
    ],
    get_prompt=lambda args: build_commit_prompt(args),
)


# ─── 디스패처: 명령의 권한을 슬롯에 *대입* ────────────────
async def dispatch_slash_command(cmd: PromptCommand, args: str, ctx: PermissionContext):
    # 1. command 슬롯을 *덮어쓴다* (이전 명령의 권한은 사라짐)
    ctx.command_rules = cmd.allowed_tools
    
    # 2. 프롬프트 생성 → LLM으로
    prompt = await cmd.get_prompt(args)
    try:
        await run_agent_loop(prompt, ctx)  # 이 안에서 도구 호출 시 권한 체크
    finally:
        # 3. 턴이 끝나면 *비운다* — 이 명령이 동봉한 권한은 증발
        ctx.command_rules = []


# ─── 사용 ────────────────
ctx = PermissionContext()

# /commit 턴
await dispatch_slash_command(commit_command, "", ctx)
# 이 안에서 LLM이 "Bash(git status)" 호출 → ctx.is_always_allowed → True → 다이얼로그 없이 실행

# 일반 채팅 턴 (다음 턴)
# 이제 LLM이 "Bash(git push)" 호출 → ctx.is_always_allowed → False → 다이얼로그 뜸
```

> 💡 **`fnmatch`는 셸 와일드카드로 문자열을 매칭한다.** Python 표준 라이브러리 모듈로, 정규식보다 단순하고 셸에서 익숙한 패턴을 그대로 쓴다 — `*`(임의 길이), `?`(한 글자), `[abc]`(문자 클래스). 위 코드에서는 `fnmatch.fnmatch("Bash(git status)", "Bash(git*)")`처럼 도구 호출 문자열을 룰 패턴에 매칭한다. 룰 자체가 셸 스타일로 적혀 있기 때문에(`Bash(git add:*)`, `mcp__slack__*` 등) `fnmatch`가 권한 룰 시스템에 자연스럽게 들어맞는다.

핵심 세 줄.

1. **`ctx.command_rules = cmd.allowed_tools`** — 명령 시작 시 대입.
2. **권한 체크 시 모든 슬롯을 합쳐서 매칭** — `user_rules + project_rules + command_rules`.
3. **`finally: ctx.command_rules = []`** — 턴이 끝나면 증발.

이 셋이 capability-based security의 가장 단순한 표현이다. 진짜 Claude Code의 `toolPermissionContext`는 슬롯이 더 많고, 룰 매칭이 더 정교하지만(6장에서) — 본질은 같다.

> 💡 **6장과의 연결.** "슬롯이 여러 개 있고, 합쳐서 매칭한다"가 6장의 권한 시스템 전체를 관통하는 패턴이다. 4.3은 그 패턴의 작은 첫 등장이다 — 하나의 슬롯 (`command:`) 만 봤다. 6장에서는 모든 슬롯과 룰 매칭의 정교함까지 본다.

---

## 핵심 정리

- `allowedTools`는 슬래시 명령에 동봉된 권한 패키지다. 명령 코드와 같이 들어 있다.
- 명령이 시작되면 `toolPermissionContext.alwaysAllowRules.command` 슬롯에 대입된다. 그 슬롯에 매칭되는 도구 호출은 권한 다이얼로그를 거치지 않는다.
- **턴이 끝나면 자동으로 비워진다**. 다음 일반 채팅 턴에서는 같은 도구 호출이 다시 다이얼로그를 띄운다. 권한이 명령의 수명과 같이 산다.
- **Least privilege** 적용: `commit.ts`는 git 명령 세 개만, `commit-push-pr.ts`는 13개만. 명령 작성자가 정확히 필요한 것을 미리 골라 둔다.
- Skill도 같은 패턴 — 마크다운 frontmatter의 `allowed-tools` 필드. 명령과 skill이 같은 슬롯을 쓴다.
- **4장 통합**: 슬래시 명령 = 프롬프트 + 종류 + 권한의 번들. 셋을 한 곳에 묶은 게 본질. 6장에서 권한 시스템 전체가, 10장에서 직접 만들기가 이 통찰을 회수한다.

