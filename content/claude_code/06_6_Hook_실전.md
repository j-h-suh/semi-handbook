# 6.6 Hook 실전 — 설정 구조, 실행 흐름, 사용 사례

---

## 이 챕터에서 배우는 것

- `getAllHooks`가 3곳의 settings에서 Hook을 어떻게 모아오는지
- `processHookJSONOutput`이 stdout JSON을 권한 판단으로 바꾸는 과정
- `decision: "block"`과 `hookSpecificOutput.permissionDecision: "deny"`의 관계 — 같은 결과, 다른 경로
- 실무 사용 사례 3가지를 코드 흐름 위에서 추적
- Hook의 중복 제거(dedup) 로직이 왜 필요한지 — 같은 Hook이 여러 소스에서 올 때
- 디버깅: `--verbose`에서 무엇이 보이는지

---

## 사용자 경험에서 출발

6.5에서 Hook의 내부 메커니즘을 봤다. 이번에는 실제로 Hook을 설정하고 실행하는 과정을 코드 레벨에서 따라간다.

Claude Code에서 `Bash(git push --force)`를 호출하려 한다. 다음이 일어난다:

```
1. executePreToolHooks 호출 (hooks.ts:3394)
2. getMatchingHooks → settings 3곳에서 Hook 수집 (hooksSettings.ts:92)
3. matcher + if 필터링 → 매칭된 Hook만 남김
4. execCommandHook → 셸 스크립트 실행 (hooks.ts:747)
5. parseHookOutput → stdout JSON 파싱 (hooks.ts:399)
6. processHookJSONOutput → 권한 결정으로 변환 (hooks.ts:489)
7. 결과가 도구 실행 판단에 합산
```

이 7단계를 하나씩 뜯어보자.

---

## 본문

### 설정 구조 — `getAllHooks` (`hooksSettings.ts:92`)

Hook이 어디에서 오는지부터 보자. `src/utils/hooks/hooksSettings.ts:92`:

:::tabs

```typescript
// src/utils/hooks/hooksSettings.ts:92 (축약)
export function getAllHooks(appState: AppState): IndividualHookConfig[] {
  const hooks: IndividualHookConfig[] = []

  const policySettings = getSettingsForSource('policySettings')
  const restrictedToManagedOnly = policySettings?.allowManagedHooksOnly === true

  if (!restrictedToManagedOnly) {
    const sources = [
      'userSettings',       // ~/.claude/settings.json
      'projectSettings',    // .claude/settings.json (프로젝트 루트)
      'localSettings',      // .claude/settings.local.json
    ] as EditableSettingSource[]

    // 같은 물리 파일을 두 번 읽지 않도록 중복 방지
    const seenFiles = new Set<string>()

    for (const source of sources) {
      const filePath = getSettingsFilePathForSource(source)
      if (filePath) {
        const resolvedPath = resolve(filePath)
        if (seenFiles.has(resolvedPath)) continue
        seenFiles.add(resolvedPath)
      }

      const sourceSettings = getSettingsForSource(source)
      if (!sourceSettings?.hooks) continue

      for (const [event, matchers] of Object.entries(sourceSettings.hooks)) {
        for (const matcher of matchers as HookMatcher[]) {
          for (const hookCommand of matcher.hooks) {
            hooks.push({
              event: event as HookEvent,
              config: hookCommand,
              matcher: matcher.matcher,
              source,
            })
          }
        }
      }
    }
  }

  // Session hooks (메모리에 동적 등록된 것들)
  const sessionId = getSessionId()
  const sessionHooks = getSessionHooks(appState, sessionId)
  for (const [event, matchers] of sessionHooks.entries()) { ... }

  return hooks
}
```

```python
# Python 등가 — 여러 설정 파일에서 Hook을 수집
import json
from pathlib import Path
from dataclasses import dataclass

@dataclass
class HookConfig:
    event: str            # "PreToolUse", "PostToolUse", ...
    command: list[str]    # 실행할 명령
    matcher: str | None   # 도구 이름 매칭 패턴 (None이면 전체)
    source: str           # 어디서 온 설정인지

def get_all_hooks(settings_files: list[Path]) -> list[HookConfig]:
    """여러 설정 파일에서 Hook을 수집한다."""
    hooks = []
    seen_files: set[str] = set()  # 같은 파일 두 번 안 읽기

    for file in settings_files:
        resolved = str(file.resolve())
        if resolved in seen_files:
            continue
        seen_files.add(resolved)

        if not file.exists():
            continue
        settings = json.loads(file.read_text(encoding="utf-8"))

        for event, matchers in settings.get("hooks", {}).items():
            for m in matchers:
                for cmd in m.get("hooks", []):
                    hooks.append(HookConfig(
                        event=event,
                        command=cmd["command"],
                        matcher=m.get("matcher"),
                        source=str(file),
                    ))
    return hooks
```

:::

여기서 눈에 띄는 것 세 가지.

**첫째, `seenFiles` 중복 방지.** 홈 디렉토리에서 Claude Code를 실행하면 `userSettings`와 `projectSettings`가 같은 파일(`~/.claude/settings.json`)을 가리킨다. 이걸 두 번 읽으면 같은 Hook이 두 번 등록된다. `resolve(filePath)`로 물리 경로를 비교해서 방지. 6.4의 권한 룰 수집에서도 같은 패턴이 쓰인다.

**둘째, `allowManagedHooksOnly` 정책 잠금.** 이게 `true`면 user/project/local Hook이 전부 무시된다. 기업 IT가 보안 Hook만 허용하고 사용자가 임의로 Hook을 추가하지 못하게 하는 장치.

**셋째, 구조가 3중 중첩이다.** `settings.hooks[event] → matchers[] → matcher.hooks[]`. 하나의 이벤트에 여러 matcher가 올 수 있고, 하나의 matcher에 여러 Hook이 달릴 수 있다. 이 구조 때문에:

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [훅A, 훅B] },
      { "matcher": "Write", "hooks": [훅C] },
      { "hooks": [훅D] }
    ]
  }
}
```

Bash 호출 시: 훅A, 훅B, 훅D가 실행된다 (matcher "Bash" + 글로벌). Write 호출 시: 훅C, 훅D.

---

### 중복 제거 — 왜 필요한가

`getMatchingHooks`(`hooks.ts:1735-1798`)에는 이상할 정도로 긴 dedup 로직이 있다.

:::tabs

```typescript
// src/utils/hooks.ts:1735 (축약)
const uniqueCommandHooks = Array.from(
  new Map(
    matchedHooks
      .filter(m => m.hook.type === 'command')
      .map(m => [
        hookDedupKey(m, `${m.hook.shell ?? DEFAULT_HOOK_SHELL}\0${m.hook.command}\0${getIfCondition(m.hook)}`),
        m,
      ]),
  ).values(),
)
// prompt, agent, http에도 각각 같은 패턴...
```

```python
# Python 등가 — dict 키 충돌로 마지막 값만 남기는 dedup 트릭
unique_command_hooks = list({
    hook_dedup_key(
        m,
        f"{m.hook.shell or DEFAULT_HOOK_SHELL}\x00"
        f"{m.hook.command}\x00"
        f"{get_if_condition(m.hook)}",
    ): m
    for m in matched_hooks
    if m.hook.type == "command"
}.values())
# settings 3곳(user/project/local)의 같은 명령은 하나로 — plugin/skill은 보존
```

:::

**Map의 키 충돌로 마지막 값만 남기는 트릭.** 같은 command + shell + if 조건이면 하나만 남긴다.

왜 이게 필요할까? `userSettings`와 `projectSettings`에 같은 Hook이 중복 정의될 수 있다. 예를 들어 팀 `.claude/settings.json`에 포맷터 Hook이 있는데, 개인 `~/.claude/settings.json`에도 같은 걸 넣었다면 — dedup 없으면 포맷터가 두 번 돈다. 코드 코멘트가 설명한다: **"Settings-file hooks share the '' prefix so the same command defined in user/project/local still collapses to one"** (`hooks.ts:1447`).

그런데 **plugin/skill 소스의 Hook은 같은 명령이어도 dedup하지 않는다.** `hookDedupKey`가 `pluginRoot`/`skillRoot`를 네임스페이스로 쓰기 때문이다. 코멘트: **"cross-plugin template collisions don't drop hooks (gh-29724)"**. 서로 다른 플러그인이 우연히 같은 명령을 쓸 수 있으니까.

---

### `processHookJSONOutput` — stdout를 권한 판단으로 변환

Hook 실행이 끝나면 stdout JSON을 해석한다. `hooks.ts:489`:

:::tabs

```typescript
// src/utils/hooks.ts:489 (축약)
function processHookJSONOutput({ json, command, hookName, ... }): Partial<HookResult> {
  const result: Partial<HookResult> = {}

  // continue: false → 턴 전체 중단
  if (json.continue === false) {
    result.preventContinuation = true
    if (json.stopReason) result.stopReason = json.stopReason
  }

  // decision 필드 → 권한 판단으로 변환
  if (json.decision) {
    switch (json.decision) {
      case 'approve':
        result.permissionBehavior = 'allow'
        break
      case 'block':
        result.permissionBehavior = 'deny'
        result.blockingError = {
          blockingError: json.reason || 'Blocked by hook',
          command,
        }
        break
    }
  }

  // hookSpecificOutput.permissionDecision → 더 정밀한 제어
  if (json.hookSpecificOutput?.hookEventName === 'PreToolUse' &&
      json.hookSpecificOutput.permissionDecision) {
    switch (json.hookSpecificOutput.permissionDecision) {
      case 'allow': result.permissionBehavior = 'allow'; break
      case 'deny':
        result.permissionBehavior = 'deny'
        result.blockingError = { ... }
        break
      case 'ask': result.permissionBehavior = 'ask'; break
    }
  }

  // updatedInput → 도구 입력 수정
  if (json.hookSpecificOutput?.updatedInput) {
    result.updatedInput = json.hookSpecificOutput.updatedInput
  }

  return result
}
```

```python
# Python 등가 — Hook stdout JSON을 권한 판단으로 변환
def process_hook_json_output(json: dict, command: str, hook_name: str) -> dict:
    result: dict = {}

    # continue: False → 턴 전체 중단
    if json.get("continue") is False:
        result["prevent_continuation"] = True
        if "stopReason" in json:
            result["stop_reason"] = json["stopReason"]

    # decision 필드 → 권한 판단으로 변환
    match json.get("decision"):
        case "approve":
            result["permission_behavior"] = "allow"
        case "block":
            result["permission_behavior"] = "deny"
            result["blocking_error"] = {
                "blocking_error": json.get("reason", "Blocked by hook"),
                "command": command,
            }

    # hookSpecificOutput.permissionDecision → 더 정밀한 제어 (PreToolUse 전용)
    hso = json.get("hookSpecificOutput", {})
    if hso.get("hookEventName") == "PreToolUse" and hso.get("permissionDecision"):
        match hso["permissionDecision"]:
            case "allow":
                result["permission_behavior"] = "allow"
            case "deny":
                result["permission_behavior"] = "deny"
                result["blocking_error"] = {"blocking_error": "...", "command": command}
            case "ask":
                result["permission_behavior"] = "ask"

    # updatedInput → 도구 입력 수정
    if "updatedInput" in hso:
        result["updated_input"] = hso["updatedInput"]

    return result
    # hookSpecificOutput이 decision을 덮어씀 (나중에 처리됨)
```

:::

여기서 중요한 설계 선택이 보인다.

**`decision`과 `hookSpecificOutput.permissionDecision`은 같은 일을 다른 경로로 한다.** `decision: "block"`은 단순하고 직관적 — 어떤 이벤트에서든 쓸 수 있다. `hookSpecificOutput.permissionDecision`은 PreToolUse 전용이고 더 정밀하다 — `'ask'`(사용자에게 물어봐)까지 가능하다.

코드를 보면 `hookSpecificOutput`이 `decision`보다 나중에 처리된다. **`hookSpecificOutput`이 `decision`을 덮어쓴다.** 둘 다 있으면 hookSpecificOutput이 이긴다.

---

### 실행 흐름 종합 — PreToolUse의 전체 경로

이제 처음부터 끝까지 추적해보자. Claude가 `Bash(git push --force)`를 호출하려 한다.

```
[1] executePreToolHooks(toolName="Bash", toolInput={command:"git push --force"}, ...)
    │   ▸ 도구 실행 직전 Hook 진입점 (PreToolUse 이벤트 전용)
    │
    ├─ hasHookForEvent('PreToolUse') → true (설정 있음)
    │   ▸ 이 이벤트에 등록된 hook 이 하나라도 있는지 빠른 가드 체크
    │
    ├─ createBaseHookInput() → { session_id, cwd, transcript_path, permission_mode }
    │   + { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: {...} }
    │   ▸ Hook 스크립트의 stdin 으로 보낼 JSON (공통 필드 + 이벤트별 필드) 조립
    │
    └─ yield* executeHooks({ hookInput, matchQuery: "Bash", ... })
         │   ▸ 매칭과 실제 실행을 위임받는 메인 함수
         │
         ├─ shouldSkipHookDueToTrust() → false (workspace 신뢰됨)
         │   ▸ workspace trust 미수락 시 모든 hook 무시 (보안 가드)
         │
         ├─ getMatchingHooks(appState, sessionId, 'PreToolUse', hookInput)
         │   │   ▸ 1차 매칭 — settings 에서 hook 후보 추리기 (도구 이름 기반)
         │   ├─ getHooksConfig() → settings 3곳에서 수집
         │   ├─ matchQuery = "Bash"
         │   ├─ filteredMatchers: matcher가 "Bash"이거나 undefined인 것만
         │   ├─ dedup: 같은 command+shell+if 정의는 하나로
         │   └─ return [{ hook: {type:'command', command:'python3 guard.py', if:'Bash(git push *)'} }]
         │
         ├─ prepareIfConditionMatcher()
         │   │   ▸ 2차 매칭 — if 패턴이 현재 도구 호출에 맞는지 검사하는 매처 생성 (6.4 재활용)
         │   ├─ permissionRuleValueFromString("Bash(git push *)") → { toolName: "Bash", ruleContent: "git push *" }
         │   │   ▸ 룰 문자열을 도구 이름 / 패턴 부분으로 분리하는 파서
         │   ├─ tool.preparePermissionMatcher("git push *") → 정규식 매처
         │   │   ▸ BashTool 이 6.4 의 matchWildcardPattern (7단계 변환) 을 호출해 매처 생성
         │   └─ "git push --force" matches "git push *" → true!
         │
         ├─ execCommandHook(hook, jsonInput=JSON.stringify(hookInput), ...)
         │   │   ▸ 매칭된 한 hook 의 셸 명령을 subprocess 로 spawn
         │   ├─ stdin으로 JSON 파이프
         │   ├─ `python3 guard.py` 실행
         │   └─ stdout: '{"decision":"block","reason":"force push는 금지됨"}'
         │
         ├─ parseHookOutput(stdout)
         │   │   ▸ stdout 텍스트를 JSON 객체로 파싱 (실패 시 plain text 처리)
         │   └─ JSON 파싱 성공 → { json: { decision: "block", reason: "..." } }
         │
         └─ processHookJSONOutput({ json, ... })
             │   ▸ JSON 을 내부 HookResult (권한 판단/입력 수정/컨텍스트 주입 등) 로 변환
             ├─ decision === "block"
             ├─ result.permissionBehavior = 'deny'
             └─ result.blockingError = { blockingError: "force push는 금지됨", ... }

[결과] AggregatedHookResult.permissionBehavior = 'deny'
       → 도구 실행 차단
       → Claude에게 차단 사유 전달
       → Claude: "force push는 보안 정책에 의해 차단되었습니다."
```

---

### 사용 사례 1: 자동 포맷터

PostToolUse에서 파일 편집 후 포맷터를 돌리는 패턴.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'FILE=$(cat | jq -r .tool_input.file_path); [[ \"$FILE\" == *.py ]] && ruff format \"$FILE\" 2>/dev/null; echo \"{\\\"suppressOutput\\\": true}\"'",
            "if": "Write(*.py)"
          }
        ]
      }
    ]
  }
}
```

흐름: Write 도구 성공 → PostToolUse 발생 → matcher "Write" 매칭 → if 조건 `Write(*.py)` 검사 → `.py` 파일이면 Hook 실행 → stdin에서 `tool_input.file_path` 추출 → `ruff format` 실행 → `suppressOutput: true`로 stdout을 대화에 표시하지 않음.

**`if` 조건이 성능을 지킨다.** `.txt` 파일을 Write해도 Hook 프로세스가 아예 스폰되지 않는다. `if` 없이 스크립트 안에서 필터링하면 매번 프로세스를 만들어야 한다.

### 사용 사례 2: 컨텍스트 자동 주입

UserPromptSubmit에서 매 프롬프트마다 환경 정보를 Claude 컨텍스트에 추가.

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'BRANCH=$(git branch --show-current); echo \"{\\\"hookSpecificOutput\\\":{\\\"hookEventName\\\":\\\"UserPromptSubmit\\\",\\\"additionalContext\\\":\\\"Current branch: $BRANCH\\\"}}\"'"
          }
        ]
      }
    ]
  }
}
```

`hookSpecificOutput.additionalContext`가 핵심이다. 이 문자열은 Claude에게 시스템 컨텍스트로 주입된다. 매번 "지금 feature/login 브랜치야"라고 말해줄 필요 없이, Hook이 자동으로 알려준다.

matcher가 없으므로 모든 프롬프트 제출에 반응한다. `async: true`를 추가하면 비동기로 돌아서 타이핑에 지연을 주지 않지만, 그러면 첫 턴에서 컨텍스트가 누락될 수 있다 — 트레이드오프.

### 사용 사례 3: HTTP 감사 로깅

모든 도구 호출을 외부 서버에 기록.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "http",
            "url": "https://audit.internal/claude-events",
            "headers": { "Authorization": "Bearer $AUDIT_TOKEN" },
            "allowedEnvVars": ["AUDIT_TOKEN"],
            "timeout": 3
          }
        ]
      }
    ]
  }
}
```

matcher 없음(글로벌) — 모든 도구 호출이 기록된다. `allowedEnvVars`에 `"AUDIT_TOKEN"`을 명시했으므로 이 변수만 헤더에 치환된다. 다른 환경 변수(`$HOME`, `$PATH` 등)는 빈 문자열로 처리.

HTTP hook은 요청 body로 `hookInput` JSON을 그대로 POST한다. 서버가 응답 body에 JSON을 주면 Hook 출력으로 해석되고, 빈 응답이면 통과.

---

### 디버깅

Hook이 의도대로 안 돌 때 볼 곳들.

**`--verbose` 플래그.** `executeHooks`(`hooks.ts:1952`) 곳곳에 `logForDebugging` 호출이 있다:

- `"Getting matching hook commands for PreToolUse with query: Bash"` — 매칭 시작
- `"Found 3 hook matchers in settings"` — 설정에서 찾은 수
- `"Skipping hook due to if condition"` — if 조건 불일치

이 로그들이 `claude --verbose`로 보인다.

**exit code.** command Hook이 0이 아닌 exit code로 끝나면 — Hook 자체가 에러 처리된다. 기본적으로 **non-blocking error** (경고만 표시, 도구는 실행됨). 단, `asyncRewake: true`면 exit code 2가 차단으로 작동한다.

**JSON 파싱 실패.** `parseHookOutput`(`hooks.ts:399`)는 stdout이 `{`로 시작하지 않으면 plain text로 취급한다. 실수로 디버그 출력(`print("debug")`)이 JSON 앞에 나오면 전체가 plain text가 되어 `decision`이 무시된다.

---

## 핵심 정리

- **Hook 설정은 3곳**(user/project/local settings)에서 수집되어 합산된다. `seenFiles`로 물리 파일 중복 방지. `allowManagedHooksOnly` 정책으로 전체 잠금 가능.
- **중복 제거**: 같은 command+shell+if 조건이면 하나만 실행. 단, 서로 다른 plugin/skill 소스의 동일 명령은 dedup하지 않는다 (네임스페이스 분리).
- **`processHookJSONOutput`**이 stdout JSON을 `HookResult`로 변환. `decision: "block"` → deny, `hookSpecificOutput.permissionDecision` → 더 정밀한 3-`way(allow/deny/ask)`. 후자가 전자를 덮어쓴다.
- **실전 패턴 3가지**: 보안 차단(PreToolUse + if 조건), 자동화(PostToolUse + suppressOutput), 컨텍스트 주입(UserPromptSubmit + additionalContext).
- **디버깅**: `--verbose`로 매칭 로그 확인. JSON 앞에 비-JSON 출력이 있으면 파싱 실패 — Hook 스크립트는 stdout에 JSON만 출력할 것.
- **Part 6 끝.** 컨텍스트(6.1) + 컨테이너(6.2) + 모드(6.3) + 룰(6.4) + Hook(6.5/6.6). 정적 룰에서 사용자 코드 실행까지, Claude Code의 권한 + 확장 레이어 전체를 봤다.

