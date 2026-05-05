# 6.5 Hook 시스템 — 이벤트 기반 확장의 내부 구조

---

## 이 챕터에서 배우는 것

- Hook이 권한 시스템(6.3/6.4)과 어떤 관계인지 — 같은 레이어, 다른 축
- `executePreToolHooks`가 도구 실행 직전에 어떤 경로를 타는지 — 실제 코드 추적
- 4가지 Hook 타입(`command`, `prompt`, `agent`, `http`)의 스키마가 어떻게 생겼는지
- stdin으로 들어가는 JSON(`createBaseHookInput`)과 stdout으로 나오는 JSON(`syncHookResponseSchema`)의 실제 구조
- **`if` 조건이 6.4의 권한 룰 매칭 코드를 그대로 재활용한다**는 사실

---

## 사용자 경험에서 출발

`.claude/settings.json`에 이런 설정이 있다고 하자.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "python3 ~/.claude/guard.py" }
        ]
      }
    ]
  }
}
```

이제 Claude가 `Bash(rm -rf /tmp/test)`를 호출하려 하면 — 실행 직전에 `guard.py`가 먼저 돈다. 스크립트가 `{"decision": "block"}`을 출력하면 도구가 실행되지 않는다. 권한 모드가 뭐든 간에.

6.3/6.4의 권한 시스템은 "이 도구를 써도 되나?"를 **정적 룰**로 판단했다. Hook은 같은 질문을 **사용자 코드 실행**으로 판단한다. 그리고 그 이상을 할 수 있다 — 도구 입력을 수정하거나, Claude에게 컨텍스트를 주입하거나, 외부 서비스에 알림을 보내거나.

어떻게 돌아가는지 코드를 따라가보자.

---

## 본문

### 진입점: `executePreToolHooks` — `hooks.ts:3394`

도구가 실행되기 직전, Claude Code는 이 함수를 부른다.

```typescript
// src/utils/hooks.ts:3394
export async function* executePreToolHooks<ToolInput>(
  toolName: string,
  toolUseID: string,
  toolInput: ToolInput,
  toolUseContext: ToolUseContext,
  permissionMode?: string,
  signal?: AbortSignal,
  timeoutMs: number = TOOL_HOOK_EXECUTION_TIMEOUT_MS,
  // ...
): AsyncGenerator<AggregatedHookResult> {
  const appState = toolUseContext.getAppState()
  const sessionId = toolUseContext.agentId ?? getSessionId()
  if (!hasHookForEvent('PreToolUse', appState, sessionId)) {
    return  // ← Hook 설정 없으면 즉시 리턴. 성능 가드.
  }

  const hookInput: PreToolUseHookInput = {
    ...createBaseHookInput(permissionMode, undefined, toolUseContext),
    hook_event_name: 'PreToolUse',
    tool_name: toolName,
    tool_input: toolInput,
    tool_use_id: toolUseID,
  }

  yield* executeHooks({
    hookInput,
    toolUseID,
    matchQuery: toolName,  // ← matcher 매칭에 쓰이는 값 = 도구 이름
    signal,
    timeoutMs,
    toolUseContext,
  })
}
```

```python
# Python 등가 — PreToolUse Hook 실행
import subprocess, json
from typing import AsyncIterator

async def execute_pre_tool_hooks(
    tool_name: str,
    tool_input: dict,
    hooks: list[dict],
) -> AsyncIterator[dict]:
    """도구 실행 직전에 등록된 Hook 스크립트를 실행한다."""
    # 성능 가드: Hook 설정 없으면 즉시 리턴
    matching = [h for h in hooks if matches(h.get("matcher"), tool_name)]
    if not matching:
        return

    # stdin으로 보낼 JSON
    hook_input = {
        "hook_event_name": "PreToolUse",
        "tool_name": tool_name,
        "tool_input": tool_input,
    }

    for hook in matching:
        result = subprocess.run(
            hook["command"],
            input=json.dumps(hook_input),
            capture_output=True, text=True, timeout=10,
        )
        yield {
            "exit_code": result.returncode,  # 0=통과, 2=차단
            "stdout": result.stdout,
        }
```

눈에 띄는 것 세 가지.

**첫째, async generator다.** `async function*` — `yield*`로 결과를 흘려보낸다. 2.2에서 본 비동기 제너레이터 파이프라인과 같은 패턴이다. Hook 결과가 도구 실행 판단에 실시간으로 반영된다.

**둘째, `hasHookForEvent` 가드.** Hook 설정이 아예 없으면 즉시 리턴한다. 대부분의 사용자는 Hook을 안 쓰니까, 설정 없을 때의 오버헤드를 0으로 만드는 빠른 경로.

**셋째, `matchQuery: toolName`.** 이 값이 나중에 matcher와 비교된다. PreToolUse에서는 도구 이름("Bash", "Write" 등)이 매칭 대상이다.

### `createBaseHookInput` — stdin JSON의 정체

Hook 스크립트의 stdin으로 들어가는 JSON은 `createBaseHookInput`(`hooks.ts:301`)이 만든다.

```typescript
// src/utils/hooks.ts:301
export function createBaseHookInput(
  permissionMode?: string,
  sessionId?: string,
  agentInfo?: { agentId?: string; agentType?: string },
): {
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode?: string
  agent_id?: string
  agent_type?: string
} {
  const resolvedSessionId = sessionId ?? getSessionId()
  return {
    session_id: resolvedSessionId,
    transcript_path: getTranscriptPathForSession(resolvedSessionId),
    cwd: getCwd(),
    permission_mode: permissionMode,
    agent_id: agentInfo?.agentId,
    agent_type: agentInfo?.agentType,
  }
}
```

```python
# Python 등가 — Hook stdin JSON 공통 필드
def create_base_hook_input(
    permission_mode: str | None = None,
    session_id: str | None = None,
    agent_info: dict | None = None,
) -> dict:
    resolved_session_id = session_id or get_session_id()
    return {
        "session_id": resolved_session_id,
        "transcript_path": get_transcript_path_for_session(resolved_session_id),
        "cwd": get_cwd(),
        "permission_mode": permission_mode,
        "agent_id": agent_info.get("agent_id") if agent_info else None,
        "agent_type": agent_info.get("agent_type") if agent_info else None,
    }
```

이게 공통 필드다. PreToolUse에서는 여기에 `tool_name`, `tool_input`, `tool_use_id`가 추가된다. **Hook 스크립트가 `transcript_path`를 받는다**는 점이 강력하다 — 대화 전체를 읽어서 판단에 활용할 수 있다는 뜻이다.

### `getMatchingHooks` — 매칭의 핵심 로직

`executeHooks`(`hooks.ts:1952`) 안에서 가장 먼저 하는 일이 매칭이다. `getMatchingHooks`(`hooks.ts:1603`)를 보자.

```typescript
// src/utils/hooks.ts:1603 (축약)
export async function getMatchingHooks(
  appState: AppState | undefined,
  sessionId: string,
  hookEvent: HookEvent,
  hookInput: HookInput,
  tools?: Tools,
): Promise<MatchedHook[]> {
  const hookMatchers = getHooksConfig(appState, sessionId, hookEvent)

  let matchQuery: string | undefined = undefined
  switch (hookInput.hook_event_name) {
    case 'PreToolUse':
    case 'PostToolUse':
    case 'PostToolUseFailure':
    case 'PermissionRequest':
    case 'PermissionDenied':
      matchQuery = hookInput.tool_name    // ← 도구 이벤트: 도구 이름으로 매칭
      break
    case 'SessionStart':
      matchQuery = hookInput.source       // ← 세션 시작: 소스로 매칭
      break
    case 'Notification':
      matchQuery = hookInput.notification_type
      break
    case 'FileChanged':
      matchQuery = basename(hookInput.file_path)  // ← 파일 변경: 파일명으로 매칭
      break
    // ... 20개 이상의 이벤트 분기
  }

  const filteredMatchers = matchQuery
    ? hookMatchers.filter(
        matcher => !matcher.matcher || matchesPattern(matchQuery, matcher.matcher),
      )
    : hookMatchers
  // ...
}
```

```python
# Python 등가 — 이벤트마다 매칭 축이 다르다
async def get_matching_hooks(
    app_state: AppState | None,
    session_id: str,
    hook_event: HookEvent,
    hook_input: dict,
    tools: Tools | None = None,
) -> list[MatchedHook]:
    hook_matchers = get_hooks_config(app_state, session_id, hook_event)

    match hook_input["hook_event_name"]:
        case "PreToolUse" | "PostToolUse" | "PostToolUseFailure" \
             | "PermissionRequest" | "PermissionDenied":
            match_query = hook_input["tool_name"]   # 도구 이름으로 매칭
        case "SessionStart":
            match_query = hook_input["source"]      # 소스로 매칭
        case "Notification":
            match_query = hook_input["notification_type"]
        case "FileChanged":
            match_query = Path(hook_input["file_path"]).name  # 파일명으로 매칭
        case _:
            match_query = None

    return [
        m for m in hook_matchers
        if not match_query
        or not m.matcher
        or matches_pattern(match_query, m.matcher)
    ]
    # matcher 생략 = 글로벌 Hook (모든 발생에 반응)
```

여기서 핵심 패턴이 보인다. **`matcher`가 없으면 무조건 통과**(`!matcher.matcher`). 이게 글로벌 Hook이다 — matcher를 생략하면 해당 이벤트의 모든 발생에 반응한다.

그리고 이벤트별로 `matchQuery`가 다르다. PreToolUse에서는 도구 이름, FileChanged에서는 파일명, Notification에서는 알림 타입. **이벤트마다 "무엇에 대한 것인가"의 축이 다르다.**

### 놀라움 — `if` 조건은 6.4의 코드를 재활용한다

`getMatchingHooks` 뒤에 2차 필터링이 있다. `prepareIfConditionMatcher`(`hooks.ts:1390`):

```typescript
// src/utils/hooks.ts:1390
async function prepareIfConditionMatcher(
  hookInput: HookInput,
  tools: Tools | undefined,
): Promise<IfConditionMatcher | undefined> {
  if (
    hookInput.hook_event_name !== 'PreToolUse' &&
    hookInput.hook_event_name !== 'PostToolUse' &&
    hookInput.hook_event_name !== 'PostToolUseFailure' &&
    hookInput.hook_event_name !== 'PermissionRequest'
  ) {
    return undefined  // ← 도구 관련 이벤트만 if 조건 지원
  }

  const toolName = normalizeLegacyToolName(hookInput.tool_name)
  const tool = tools && findToolByName(tools, hookInput.tool_name)
  const input = tool?.inputSchema.safeParse(hookInput.tool_input)
  const patternMatcher =
    input?.success && tool?.preparePermissionMatcher
      ? await tool.preparePermissionMatcher(input.data)
      : undefined

  return ifCondition => {
    const parsed = permissionRuleValueFromString(ifCondition)  // ← 6.4의 함수!
    if (normalizeLegacyToolName(parsed.toolName) !== toolName) {
      return false
    }
    if (!parsed.ruleContent) {
      return true
    }
    return patternMatcher ? patternMatcher(parsed.ruleContent) : false
  }
}
```

```python
# Python 등가 — Hook의 if 조건은 6.4의 권한 룰 코드를 100% 재활용
async def prepare_if_condition_matcher(
    hook_input: dict,
    tools: Tools | None,
):
    # 도구 관련 이벤트만 if 조건 지원
    if hook_input["hook_event_name"] not in (
        "PreToolUse", "PostToolUse", "PostToolUseFailure", "PermissionRequest",
    ):
        return None

    tool_name = normalize_legacy_tool_name(hook_input["tool_name"])
    tool = find_tool_by_name(tools, hook_input["tool_name"]) if tools else None
    parsed = tool.input_schema.safe_parse(hook_input["tool_input"]) if tool else None
    pattern_matcher = (
        await tool.prepare_permission_matcher(parsed.data)
        if parsed and parsed.success and tool and tool.prepare_permission_matcher
        else None
    )

    def matcher(if_condition: str) -> bool:
        rule = permission_rule_value_from_string(if_condition)  # 6.4의 함수!
        if normalize_legacy_tool_name(rule.tool_name) != tool_name:
            return False
        if not rule.rule_content:
            return True
        return pattern_matcher(rule.rule_content) if pattern_matcher else False

    return matcher
```

**여기가 이 챕터의 보석이다.** `permissionRuleValueFromString`은 6.4에서 본 바로 그 함수다. `"Bash(git *)"` 같은 권한 룰 문법을 파싱해서 도구 이름과 패턴을 분리하는 함수. 그리고 `tool.preparePermissionMatcher`도 6.4에서 BashTool이 `git *` 와일드카드를 정규식으로 변환하던 바로 그 메서드다.

**Hook의 `if` 조건은 권한 룰 매칭 코드를 100% 재활용한다.** 같은 패턴 문법, 같은 변환 로직, 같은 와일드카드 규칙. 6.4에서 `Bash(git *)` 룰이 `git` 단독도 매칭하도록 트레일링 옵셔널화를 하던 그 7단계 변환이 — Hook의 `if` 조건에서도 그대로 작동한다.

이게 의미하는 것: Hook 설정에 `"if": "Bash(rm *)"` 이라고 쓰면, 6.4에서 배운 모든 패턴이 그대로 적용된다. null-byte sentinel, 짝수 백슬래시, 트레일링 옵셔널화 — 전부.

---

### 이벤트 목록 — `HOOK_EVENTS`

이벤트의 전체 목록은 `src/entrypoints/sdk/coreTypes.ts:25`에 있다.

```typescript
// src/entrypoints/sdk/coreTypes.ts:25
export const HOOK_EVENTS = [
  'PreToolUse',
  'PostToolUse',
  'PostToolUseFailure',
  'Notification',
  'UserPromptSubmit',
  'SessionStart',
  'SessionEnd',
  'Stop',
  'StopFailure',
  'SubagentStart',
  'SubagentStop',
  'PreCompact',
  'PostCompact',
  'PermissionRequest',
  'PermissionDenied',
  'Setup',
  'TeammateIdle',
  'TaskCreated',
  'TaskCompleted',
  'Elicitation',
  'ElicitationResult',
  'ConfigChange',
  'WorktreeCreate',
  'WorktreeRemove',
  'InstructionsLoaded',
  'CwdChanged',
  'FileChanged',
] as const
```

27개. 처음 Hook이 만들어졌을 때는 5~6개였을 거다. 기능이 추가될 때마다 이벤트가 하나씩 붙었다. 중요한 건 — 이 배열에 값을 추가하는 것만으로 새 이벤트를 만들 수 있다는 점이다. 설정 스키마(`HooksSchema`)가 `z.enum(HOOK_EVENTS)`를 참조하므로, 배열에 추가하면 자동으로 settings.json에서 쓸 수 있게 된다.

실무에서 90%를 차지하는 건 `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `SessionStart` 네 개다. 나머지는 특수 목적.

---

### Hook 타입 4가지 — `HookCommandSchema`

이벤트가 "언제"라면, 타입은 "뭘 실행하나"다. `src/schemas/hooks.ts:31`의 `buildHookSchemas()`:

```typescript
// src/schemas/hooks.ts:31 (축약)
const BashCommandHookSchema = z.object({
  type: z.literal('command'),
  command: z.string(),
  if: IfConditionSchema(),
  shell: z.enum(SHELL_TYPES).optional(),  // 'bash' | 'powershell'
  timeout: z.number().positive().optional(),
  statusMessage: z.string().optional(),
  once: z.boolean().optional(),
  async: z.boolean().optional(),
  asyncRewake: z.boolean().optional(),
})

const PromptHookSchema = z.object({
  type: z.literal('prompt'),
  prompt: z.string(),  // $ARGUMENTS 플레이스홀더 지원
  if: IfConditionSchema(),
  model: z.string().optional(),  // 기본: small fast model
  timeout: z.number().positive().optional(),
})

const AgentHookSchema = z.object({
  type: z.literal('agent'),
  prompt: z.string(),
  if: IfConditionSchema(),
  model: z.string().optional(),  // 기본: Haiku
  timeout: z.number().positive().optional(),
})

const HttpHookSchema = z.object({
  type: z.literal('http'),
  url: z.string().url(),
  if: IfConditionSchema(),
  headers: z.record(z.string(), z.string()).optional(),
  allowedEnvVars: z.array(z.string()).optional(),  // ← 보안 설계
})
```

**discriminated union** (`z.discriminatedUnion('type', [...])`) 으로 묶여 있다. `type` 필드가 어떤 스키마를 따르는지 결정한다. JSON 파싱 시 `type`을 먼저 보고 나머지 필드를 검증.

`command` 타입이 가장 풍부하다 — `shell`, `async`, `asyncRewake`, `once` 같은 옵션이 여기만 있다. 셸 명령이 가장 많은 시나리오를 커버하니까.

**`allowedEnvVars`가 http에만 있는 이유**: http 훅은 외부 서버에 요청을 보낸다. 헤더에 `"Authorization": "Bearer $MY_TOKEN"` 같은 걸 쓰고 싶은데, 아무 환경 변수나 치환되면 `$HOME`이나 `$AWS_SECRET_KEY` 같은 것도 외부로 새어나간다. 그래서 **화이트리스트 방식** — `allowedEnvVars`에 명시한 것만 치환되고 나머지는 빈 문자열로 처리된다.

---

### stdout 응답 스키마 — `syncHookResponseSchema`

Hook이 stdout에 JSON을 출력하면 Claude Code가 해석한다. 그 스키마가 `src/types/hooks.ts:50`:

```typescript
// src/types/hooks.ts:50 (축약)
export const syncHookResponseSchema = lazySchema(() =>
  z.object({
    continue: z.boolean().optional(),
    suppressOutput: z.boolean().optional(),
    stopReason: z.string().optional(),
    decision: z.enum(['approve', 'block']).optional(),
    reason: z.string().optional(),
    systemMessage: z.string().optional(),
    hookSpecificOutput: z.union([
      z.object({
        hookEventName: z.literal('PreToolUse'),
        permissionDecision: permissionBehaviorSchema().optional(),  // 'allow'|'deny'|'ask'
        permissionDecisionReason: z.string().optional(),
        updatedInput: z.record(z.string(), z.unknown()).optional(),
        additionalContext: z.string().optional(),
      }),
      z.object({
        hookEventName: z.literal('UserPromptSubmit'),
        additionalContext: z.string().optional(),
      }),
      z.object({
        hookEventName: z.literal('PostToolUse'),
        additionalContext: z.string().optional(),
        updatedMCPToolOutput: z.unknown().optional(),
      }),
      // ... 14개 이벤트별 스키마
    ]).optional(),
  }),
)
```

모든 필드가 optional이다. 빈 JSON `{}`이나 아무 출력 없음은 "통과"를 의미한다. **Hook은 기본적으로 fail-open이다.**

여기서 가장 강력한 필드 두 개:

- **`hookSpecificOutput.permissionDecision`** (PreToolUse): `'allow'`, `'deny'`, `'ask'` 중 하나. 이게 6.3/6.4의 권한 판단과 합쳐진다. Hook이 `'deny'`를 반환하면 — 권한 모드가 `bypassPermissions`여도 도구가 차단된다. **Hook의 deny는 절대적이다.**
- **`hookSpecificOutput.updatedInput`** (PreToolUse): 도구 입력을 **수정**할 수 있다. Claude가 `rm -rf /`를 실행하려 했는데, Hook이 `updatedInput: { command: "echo 'blocked'" }`를 반환하면 — 실행되는 건 `echo 'blocked'`다.

그리고 **비동기 응답**도 있다. `hookJSONOutputSchema`(`types/hooks.ts:169`)는 동기와 비동기의 union이다:

```typescript
// src/types/hooks.ts:169
export const hookJSONOutputSchema = lazySchema(() => {
  const asyncHookResponseSchema = z.object({
    async: z.literal(true),
    asyncTimeout: z.number().optional(),
  })
  return z.union([asyncHookResponseSchema, syncHookResponseSchema()])
})
```

`{ "async": true }`를 반환하면 — Claude Code는 Hook 완료를 기다리지 않고 진행한다. Hook은 백그라운드에서 돈다.

---

### 실행 — `execCommandHook`에서 실제로 일어나는 일

`hooks.ts:747`의 `execCommandHook`이 셸 명령을 진짜 실행하는 곳이다. 요점만:

```typescript
// src/utils/hooks.ts:747 (축약)
async function execCommandHook(
  hook: HookCommand & { type: 'command' },
  hookEvent: HookEvent,
  hookName: string,
  jsonInput: string,  // ← stdin으로 파이프됨
  signal: AbortSignal,
  // ...
) {
  const shellType = hook.shell ?? DEFAULT_HOOK_SHELL  // 'bash' 기본
  const isPowerShell = shellType === 'powershell'

  // Windows에서는 경로를 POSIX로 변환 (Git Bash 호환)
  const toHookPath = isWindows && !isPowerShell
    ? (p: string) => windowsPathToPosixPath(p)
    : (p: string) => p

  let command = hook.command
  // ${CLAUDE_PLUGIN_ROOT}, ${user_config.X} 치환
  // 환경 변수: CLAUDE_SESSION_ID, CLAUDE_CWD, CLAUDE_PROJECT_DIR 등 설정
  // ...

  // 실행: stdin에 jsonInput을 파이프, stdout/stderr를 수집
}
```

```python
# Python 등가 — 셸 명령 실행 + stdin/stdout JSON 프로토콜
async def exec_command_hook(
    hook: dict,                # type='command'
    hook_event: HookEvent,
    hook_name: str,
    json_input: str,           # stdin으로 파이프됨
    signal,
):
    shell_type = hook.get("shell", DEFAULT_HOOK_SHELL)  # 'bash' 기본
    is_powershell = shell_type == "powershell"

    # Windows에서는 경로를 POSIX로 변환 (Git Bash 호환)
    to_hook_path = (
        windows_path_to_posix_path
        if is_windows and not is_powershell
        else lambda p: p
    )

    command = hook["command"]
    # ${CLAUDE_PLUGIN_ROOT}, ${user_config.X} 치환
    # 환경 변수: CLAUDE_SESSION_ID, CLAUDE_CWD, CLAUDE_PROJECT_DIR 설정

    # 실행: stdin에 json_input 파이프, stdout/stderr 수집 (asyncio.create_subprocess_exec)
```

**Hook 스크립트는 stdin으로 JSON을 받고, stdout으로 JSON을 뱉는다.** 이 단순한 프로토콜이 전부다. 어떤 언어로든 구현할 수 있다 — Python, Node, Go, 심지어 `jq` 한 줄로도. Unix 철학: 텍스트 스트림이 인터페이스.

---

### 보안 가드 — 신뢰 검사

`executeHooks`(`hooks.ts:1952`)의 가장 윗부분에 보안 검사가 두 개 있다:

```typescript
// src/utils/hooks.ts:1978-1998
if (shouldDisableAllHooksIncludingManaged()) {
  return  // 정책으로 완전 비활성화
}

if (isEnvTruthy(process.env.CLAUDE_CODE_SIMPLE)) {
  return  // 단순 모드에서는 Hook 무시
}

// SECURITY: ALL hooks require workspace trust in interactive mode
if (shouldSkipHookDueToTrust()) {
  logForDebugging(
    `Skipping ${hookName} hook execution - workspace trust not accepted`,
  )
  return
}
```

```python
# Python 등가 — Hook 실행 전 3단계 보안 가드
if should_disable_all_hooks_including_managed():
    return  # 정책으로 완전 비활성화

if is_env_truthy(os.environ.get("CLAUDE_CODE_SIMPLE")):
    return  # 단순 모드에서는 Hook 무시

# SECURITY: 모든 Hook은 workspace trust 필요 (interactive mode)
if should_skip_hook_due_to_trust():
    log_for_debugging(
        f"Skipping {hook_name} hook execution - workspace trust not accepted"
    )
    return
```

주석이 직접 말한다: **"ALL hooks require workspace trust"**. 프로젝트를 처음 열었을 때 "이 workspace를 신뢰합니까?" 대화상자에서 수락하지 않으면 — `.claude/settings.json`에 Hook이 있어도 실행되지 않는다. **악의적인 프로젝트를 clone했을 때 Hook이 자동으로 실행되는 걸 막는 장치.**

---

## 핵심 정리

- **Hook의 진입점**은 `executePreToolHooks`(`hooks.ts:3394`) 같은 이벤트별 함수다. 모두 async generator이고, 내부에서 `executeHooks`로 합류한다.
- **매칭은 2단계**: `matcher`로 도구 이름 필터링(단순 비교) → `if` 조건으로 입력 패턴 필터링(**6.4의 권한 룰 코드 재활용**). 같은 와일드카드 문법이 두 시스템에 걸쳐 쓰인다.
- **stdin/stdout JSON 프로토콜**: `createBaseHookInput`이 공통 필드(session_id, cwd, transcript_path) + 이벤트별 필드를 만들어 stdin으로 보낸다. Hook은 stdout에 `syncHookResponseSchema`에 맞는 JSON을 뱉는다.
- **Hook의 `permissionDecision`은 권한 시스템과 합산된다.** `'deny'`는 절대적 — 어떤 권한 모드도 이길 수 없다. 이게 Hook의 보안적 의미.
- **`updatedInput`으로 도구 입력을 수정**할 수 있다. 단순 차단이 아니라 입력 변조(sanitization)가 가능.
- **보안**: workspace trust 미수락 시 모든 Hook이 무시된다. `CLAUDE_CODE_SIMPLE` 환경변수로도 전체 비활성화 가능.

---

*다음 챕터: 6.6 Hook 실전 — 설정 구조, 실행 흐름, 사용 사례*
