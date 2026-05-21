# 10.4 Hook 만들기 — 도구 실행 흐름에 끼어드는 사용자 코드

---

## 이 챕터에서 배우는 것

- 9.4 의 *정적 권한 규칙* 만으로 막을 수 없는 자리가 있다 — 컨텍스트 의존 결정, 동적 입력 변조, 외부 시스템 통합.
- Hook 은 **이벤트 + 외부 프로세스 + stdin/stdout JSON** 세 가지 부품으로 그 자리를 채운다.
- 6.4 의 와일드카드 매칭 코드(`matches_rule`)를 그대로 재활용해서 *matcher + if* 두 단계 필터링을 만든다.
- mini_claude 에 5 개 이벤트(`PreToolUse`·`PostToolUse`·`Stop`·`SessionStart`·`UserPromptSubmit`)를 *약 280줄* 로 얹는다.
- Hook 이 9.4 권한 게이트와 *어떻게 합산되는지* — `deny` 가 절대 우선, `updatedInput` 이 입력을 교체.

---

## 9.4 가 못 푸는 자리

9.4 권한 시스템은 *정적 규칙* 으로 도구 호출을 막거나 통과시킨다. `Bash:rm -rf *` 를 deny 룰에 박아두면 모델이 `rm -rf /` 를 시도해도 즉시 차단된다. 단순하고 강력하다.

그런데 *정적 규칙* 으로는 표현이 안 되는 자리가 셋 있다.

**첫째, 컨텍스트 의존 결정.** "`git push` 는 보통 허용하지만, `main` 브랜치에 force-push 는 막아라" 같은 규칙. *현재 브랜치* 와 *명령 옵션* 을 둘 다 봐야 한다. 정규식 한 줄로는 표현 불가능 — 실행 환경을 봐야 하는 결정.

**둘째, 동적 입력 변조.** "에이전트가 `Edit` 호출할 때 `file_path` 가 상대 경로면 절대 경로로 바꿔라." 막는 게 아니라 *교체*. 정적 규칙으로는 표현할 수 없는 동작.

**셋째, 외부 시스템과의 통합.** "`Write` 가 호출될 때마다 외부 lint 서버에 보내서 컨벤션을 검사. 위반이면 차단." mini_claude 내부에 lint 로직을 박을 게 아니라 *외부 프로세스* 가 결정을 내려야 한다.

세 자리 모두 *사용자 코드가 도구 실행 흐름에 끼어드는* 자리다. 그게 Hook 이다.

> 💡 **Hook 의 한 줄 정의**: 이벤트가 발생할 때 외부 프로세스를 호출하고, 그 프로세스의 stdout JSON 으로 *결정 / 입력 교체 / 컨텍스트 보강* 을 받는 메커니즘. 도구 실행의 *전·후·세션 전이* 같은 자리에 끼어든다.

진짜 Claude Code 의 Hook 시스템은 6.5 에서 본 그대로 — `executeHooks` (`hooks.ts:2143`) 가 async generator 로 매칭된 hook 들을 *병렬* 로 돌리고, 첫 결과를 즉시 흘려보내고, `permissionDecision` / `updatedInput` / `additionalContext` 같은 필드로 결정을 합산한다. mini 는 이걸 *축약* 해서 가져온다.

---

## 완성된 모습 먼저 보기

세 파일로 끝난다.

### ① `~/.mini_claude/hooks.json` (설정)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "python ~/.mini_claude/guard.py",
        "timeout": 5
      }
    ],
    "Stop": [
      {
        "command": "echo $(date) >> ~/.mini_claude/session.log"
      }
    ]
  }
}
```

`matcher` 는 도구 이름 fnmatch 패턴 — `"Bash"` 는 Bash 만, `"*"` 는 모든 도구. `command` 는 셸이 실행하는 명령. `timeout` 은 초.

### ② `~/.mini_claude/guard.py` (Hook 스크립트 — Python 예시)

```python
#!/usr/bin/env python3
"""mini_claude 의 PreToolUse hook. Bash 명령 안에 secret 패턴이 있으면 차단."""
import json
import re
import sys

# stdin 으로 JSON 받음
payload = json.load(sys.stdin)
command = payload["tool_input"].get("command", "")

# 위험 패턴 검사
patterns = [
    (r"AKIA[0-9A-Z]{16}", "AWS access key"),
    (r"sk-ant-[a-zA-Z0-9-]{20,}", "Anthropic API key"),
    (r"BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY", "private key"),
]
for pattern, name in patterns:
    if re.search(pattern, command):
        # stdout 으로 JSON 반환 → mini_claude 가 차단
        print(json.dumps({
            "permissionDecision": "deny",
            "permissionDecisionReason": f"blocked: {name} in command",
        }))
        sys.exit(0)

# 통과 — 아무것도 출력 안 하면 hook 이 결정에 개입 안 함
sys.exit(0)
```

세 줄짜리 패턴 매칭에 한 줄 JSON 응답. 그 줄을 mini_claude 가 *덱시전 으로* 해석한다.

### ③ 실행 흐름

```text
> echo MY_AWS_KEY=AKIAIOSFODNN7EXAMPLE

[Bash] {'command': 'echo MY_AWS_KEY=AKIAIOSFODNN7EXAMPLE'}
Permission denied by hook: blocked: AWS access key in command
```

9.4 의 권한 게이트는 *통과* 한다 (`Bash:echo *` 는 deny 룰에 없으니까). Hook 이 *그 뒤에서 한 번 더* 검사해서 차단했다. **정적 규칙으로는 잡을 수 없는 secret 노출** 을 외부 스크립트가 잡아낸 자리.

> ⚙️ **왜 fail-open 디자인인가**: `guard.py` 가 깨지거나 timeout 나거나 비-JSON 을 뱉어도 mini_claude 는 *통과* 시킨다. Hook 이 시스템의 *부속물* 이라는 뜻 — 깨져도 본체는 살아 있어야 한다. 명시적 차단(`exit code != 0` 또는 `permissionDecision: "deny"`) 만 deny 로 해석.

이걸 어떻게 만들지가 챕터의 나머지다.

---

## Hook 의 생명주기 — 3 단계

이벤트 한 개가 발생하면 *세 단계* 가 순차적으로 일어난다.

```text
  ┌─────────────────────────────────────────────┐
  │  Event triggered                             │
  │  (PreToolUse / PostToolUse / Stop / …)      │
  └────────────────────┬────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────┐
  │  1. 매칭 — registry.find_matching()         │
  │     event + (도구 이름) → 매칭된 spec 들    │
  └────────────────────┬────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────┐
  │  2. 실행 — execute_hook()                    │
  │     subprocess.shell + stdin JSON →          │
  │       wait_for(timeout) → stdout JSON        │
  └────────────────────┬────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────┐
  │  3. 반영 — agent.py / main.py 의 자리        │
  │     permissionDecision: deny ⇒ 차단         │
  │     updatedInput: 입력 교체                  │
  │     additionalContext: 결과 보강            │
  └─────────────────────────────────────────────┘
```

**1 단계 매칭** 은 *두 축* 으로 본다. 이벤트 이름 (`PreToolUse`, `Stop` 등) + 도구 이름 (PreToolUse / PostToolUse 에 한해). 둘 다 만족하는 spec 만 살아남는다.

**2 단계 실행** 은 비동기 subprocess 한 번. stdin 으로 JSON 을 보내고 stdout 에서 JSON 을 받는다. 타임아웃은 spec 별로 설정 (기본 60초). 예외·타임아웃·비-JSON 은 모두 *None 반환* 으로 통일 — fail-open.

**3 단계 반영** 은 응답의 어떤 필드가 채워졌느냐로 분기. `permissionDecision: "deny"` 면 도구 실행 자체를 건너뛴다. `updatedInput` 이면 도구 입력을 교체. `additionalContext` 면 도구 결과에 추가 텍스트를 붙인다.

> 💡 **mini 가 단순화한 것**: 진짜 코드는 매칭된 hook *여러 개* 를 병렬로 돌리고 `Promise.race` 로 가장 빠른 응답을 받는다 (6.5 의 Deep Dive). mini 는 *순차 실행* + *첫 번째 결정 응답만 사용*. 한 hook 이 deny 를 반환하면 나머지는 아예 실행되지 않는다.

---

## 구현 — 4 단계

`src/mini_claude/hooks/` 디렉토리에 *네 파일* 을 만든다. 총 *약 280줄*.

```text
hooks/
├── events.py     — stdin / stdout 의 Pydantic 스키마
├── registry.py   — 설정 파일 로드 + 매칭
├── runner.py     — subprocess + JSON 파싱
└── __init__.py   — HookEngine (facade)
```

### 1 단계: `events.py` — stdin / stdout 스키마

Hook 스크립트가 받는 JSON 과 반환하는 JSON 의 *모양* 부터 못 박는다. Pydantic 으로 스키마 + 검증 한 번에.

```python
# src/mini_claude/hooks/events.py
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field


HookEventName = Literal[
    "PreToolUse", "PostToolUse",
    "Stop", "SessionStart", "UserPromptSubmit",
]


class BaseHookInput(BaseModel):
    """모든 이벤트 공통 필드."""
    session_id: str
    transcript_path: str
    cwd: str
    hook_event_name: HookEventName


class PreToolUseInput(BaseHookInput):
    hook_event_name: Literal["PreToolUse"] = "PreToolUse"
    tool_name: str
    tool_input: dict[str, Any]


class PostToolUseInput(BaseHookInput):
    hook_event_name: Literal["PostToolUse"] = "PostToolUse"
    tool_name: str
    tool_input: dict[str, Any]
    tool_response: str


class StopInput(BaseHookInput):
    hook_event_name: Literal["Stop"] = "Stop"
    stop_reason: str
```

다섯 이벤트가 *공통 필드 + 이벤트별 추가 필드* 라는 *판별 유니온(0.4)* 의 정직한 응용이다. `hook_event_name` 으로 분기.

> ⚙️ **나머지 두 이벤트 + `HookInput` 별칭**: 본문은 `PreToolUseInput / PostToolUseInput / StopInput` 세 개만 보였지만 — `SessionStartInput`, `UserPromptSubmitInput` 도 같은 `BaseHookInput` 상속 + 이벤트별 필드 한 줄 추가 패턴. 그리고 다섯을 묶는 `HookInput = PreToolUseInput | PostToolUseInput | StopInput | SessionStartInput | UserPromptSubmitInput` 별칭이 `runner.py` / `__init__.py` 에서 _공통 타입_ 으로 쓰인다. 완전한 코드는 `content/claude_code/mini_claude/src/mini_claude/hooks/events.py` 참고.

stdout 응답은 *모든 필드가 옵션*. 채워진 것만 동작한다.

```python
class HookResponse(BaseModel):
    """Hook 의 stdout JSON. 모든 필드가 옵션."""
    model_config = ConfigDict(populate_by_name=True)

    permission_decision: Literal["allow", "deny", "ask"] | None = Field(
        default=None, alias="permissionDecision"
    )
    permission_decision_reason: str | None = Field(
        default=None, alias="permissionDecisionReason"
    )
    updated_input: dict[str, Any] | None = Field(
        default=None, alias="updatedInput"
    )
    additional_context: str | None = Field(
        default=None, alias="additionalContext"
    )
    system_message: str | None = Field(
        default=None, alias="systemMessage"
    )
```

> 💡 **camelCase alias 동시 지원**: Pydantic 의 `populate_by_name` 옵션 + `Field(alias=...)` 가 한 모델이 `permission_decision` (Python 스타일) 과 `permissionDecision` (Anthropic 진짜 코드 스타일) 을 동시에 받아들이게 한다. Bash 로 hook 을 쓰든 Python 으로 쓰든 익숙한 표기로 만들면 둘 다 통과.

### 2 단계: `registry.py` — 설정 로드 + 매칭

설정 파일을 읽고, *매칭 함수* 를 제공한다. 매칭의 *두 축* 은 (a) 이벤트 이름 (b) 도구 이름 fnmatch 패턴.

```python
# src/mini_claude/hooks/registry.py
import fnmatch
import json
from dataclasses import dataclass
from pathlib import Path

from .events import HookEventName


@dataclass
class HookSpec:
    """Hook 한 개의 정의 — JSON 한 줄에 대응."""
    event: HookEventName
    matcher: str             # 도구 이름 fnmatch 패턴
    command: str             # 셸이 실행하는 명령
    timeout: float = 60.0


@dataclass
class HookRegistry:
    specs: list[HookSpec]

    @classmethod
    def load(cls, path: Path) -> "HookRegistry":
        """파일 없으면 빈 registry (= Hook 비활성)."""
        if not path.exists():
            return cls(specs=[])

        data = json.loads(path.read_text(encoding="utf-8"))
        specs = []
        for event_name, event_specs in data.get("hooks", {}).items():
            for spec_dict in event_specs:
                specs.append(HookSpec(
                    event=event_name,
                    matcher=spec_dict.get("matcher", "*"),
                    command=spec_dict["command"],
                    timeout=float(spec_dict.get("timeout", 60.0)),
                ))
        return cls(specs=specs)

    def find_matching(
        self, event: HookEventName, tool_name: str | None = None
    ) -> list[HookSpec]:
        """매칭된 spec 들을 순서대로 반환."""
        matched = []
        for spec in self.specs:
            if spec.event != event:
                continue
            if event in ("PreToolUse", "PostToolUse") and tool_name is not None:
                if not fnmatch.fnmatchcase(tool_name, spec.matcher):
                    continue
            matched.append(spec)
        return matched
```

핵심은 `find_matching` 의 *두 축 필터*. `event != spec.event` 면 거른다. `PreToolUse` / `PostToolUse` 일 때만 `tool_name` 도 본다 (다른 이벤트는 도구 이름 의미 없음). 통과한 것들이 매칭된 spec.

> ⚙️ **6.4 와의 관계**: 6.4 의 `matches_rule` 은 *권한 룰* 의 두 부분 (`Tool` + `:input pattern`) 을 처리한다. Hook 의 matcher 는 그중 *앞 절반 (도구 이름) 만*. 더 단순. mini 에서는 `fnmatch.fnmatchcase` 한 줄로 충분.

### 3 단계: `runner.py` — subprocess + JSON

매칭된 spec 을 받아 *실행 + 결과 파싱* 까지 한 함수에서. fail-open 이 강조점.

```python
# src/mini_claude/hooks/runner.py
import asyncio
import json
from pydantic import ValidationError

from .events import HookInput, HookResponse
from .registry import HookSpec


async def execute_hook(
    spec: HookSpec, hook_input: HookInput
) -> HookResponse | None:
    stdin_bytes = hook_input.model_dump_json(by_alias=True).encode("utf-8")

    try:
        proc = await asyncio.create_subprocess_shell(
            spec.command,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout_data, stderr_data = await asyncio.wait_for(
            proc.communicate(input=stdin_bytes),
            timeout=spec.timeout,
        )
    except asyncio.TimeoutError:
        return None
    except Exception:
        return None

    # exit code != 0 = 명시적 차단
    if proc.returncode != 0:
        reason = stderr_data.decode("utf-8", errors="replace").strip()[:200]
        return HookResponse(
            permission_decision="deny",
            permission_decision_reason=(
                reason or f"hook exited with code {proc.returncode}"
            ),
        )

    if not stdout_data:
        return None

    try:
        parsed = json.loads(stdout_data.decode("utf-8"))
    except json.JSONDecodeError:
        return None

    try:
        return HookResponse.model_validate(parsed)
    except ValidationError:
        return None
```

세 가지 *명시적 결과* + 한 가지 *암묵적 결과*.

- *명시적 deny*: `exit code != 0` → `HookResponse(permission_decision="deny", ...)`
- *명시적 응답*: stdout 에 유효한 JSON → 그대로 파싱한 `HookResponse`
- *암묵적 통과*: 출력 없음 / 비-JSON / 스키마 불일치 → `None`
- *fail-open*: timeout / 예외 → `None`

`None` 은 *Hook 이 결정에 개입하지 않는다* 의 의미. 그 자리는 9.4 권한 게이트가 평소대로 결정.

> 💡 **`asyncio.subprocess.PIPE` 의 정체**: subprocess 의 stdin / stdout / stderr 를 *Python 의 비동기 파이프* 로 연결. `proc.communicate()` 가 양방향으로 데이터를 흘려보내고, 프로세스가 끝날 때까지 비동기로 기다린다. `asyncio.wait_for(...)` 로 감싸면 외부 타임아웃 추가. SDK 내부 타임아웃이 안 걸리는 *드문 자리* 를 외부에서 한 번 더 봉합.

### 4 단계: `__init__.py` — `HookEngine` facade

세 모듈을 묶는 *한 객체*. agent.py / main.py 는 이거만 알면 된다.

```python
# src/mini_claude/hooks/__init__.py
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .events import (
    HookInput, HookResponse,
    PreToolUseInput, PostToolUseInput,
    StopInput, SessionStartInput, UserPromptSubmitInput,
)
from .registry import HookRegistry
from .runner import execute_hook


DEFAULT_CONFIG_PATH = Path.home() / ".mini_claude" / "hooks.json"


@dataclass
class HookEngine:
    registry: HookRegistry
    session_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    transcript_path: str = ""

    @classmethod
    def from_file(cls, path: Path | None = None) -> "HookEngine":
        return cls(registry=HookRegistry.load(path or DEFAULT_CONFIG_PATH))

    async def pre_tool_use(
        self, *, cwd: str, tool_name: str, tool_input: dict[str, Any]
    ) -> HookResponse | None:
        return await self._fire_first(
            "PreToolUse",
            PreToolUseInput(
                session_id=self.session_id,
                transcript_path=self.transcript_path,
                cwd=cwd,
                tool_name=tool_name,
                tool_input=tool_input,
            ),
            tool_name=tool_name,
        )

    # post_tool_use / stop / session_start / user_prompt_submit 도 같은 패턴 —
    # 이벤트 이름 + 해당 입력 dataclass 만 다르고 내부는 _fire_first 호출 한 줄.
    # 완전한 구현은 mini_claude/src/mini_claude/hooks/__init__.py 참고.

    async def _fire_first(
        self, event: str, hook_input: HookInput,
        tool_name: str | None = None,
    ) -> HookResponse | None:
        """매칭된 spec 들 중 결정을 내린 첫 응답을 반환."""
        for spec in self.registry.find_matching(event, tool_name):
            response = await execute_hook(spec, hook_input)
            if response is not None:
                return response
        return None
```

다섯 이벤트가 각자의 *입력 dataclass* 를 만들고 `_fire_first` 에 넘긴다. 매칭된 spec 을 순서대로 돌리되, *첫 번째로 결정을 낸 응답* 만 살린다. mini 는 단순화 — *fast-fail* 가까운 정신.

이 네 파일로 hook 시스템의 *서비스 레이어* 가 끝난다. 다음은 그 레이어를 agent.py 의 *세 자리* 에 어떻게 끼우는지.

---

## agent.py 에 연결 — 세 자리

`query()` 안에 hook 호출을 끼울 *세 자리* 가 있다. 9.5 의 흐름을 깨지 않으면서 추가.

### 자리 ①: 도구 실행 *직전* (PreToolUse)

`yield ToolUseStarted` 직후, 9.4 의 권한 게이트 직전.

```python
# src/mini_claude/agent.py — tool_use 분기 안
tool = find_tool(tools, block["name"])
yield ToolUseStarted(name=tool.name, input=block["input"])

# ── Hook (10.4) — PreToolUse ──────────────
if hooks:
    pre_resp = await hooks.pre_tool_use(
        cwd=cwd, tool_name=tool.name, tool_input=block["input"]
    )
    if pre_resp and pre_resp.permission_decision == "deny":
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": block["id"],
            "content": (
                "Permission denied by hook: "
                f"{pre_resp.permission_decision_reason or '(no reason)'}"
            ),
            "is_error": True,
        })
        continue
    if pre_resp and pre_resp.updated_input is not None:
        block["input"] = pre_resp.updated_input

# ── 9.4 의 권한 게이트 (그대로) ─────────────
decision = permissions.check(tool, block["input"])
...
```

세 가지가 한꺼번에. `hooks` 가 None 이면 통째로 건너뛴다 (9.5 와 동일 동작). Hook 이 deny 면 `continue` 로 *다음 도구* 로 — 9.4 의 권한 게이트 자체를 건너뛴다. Hook 이 `updatedInput` 을 주면 *block 의 입력을 교체* 한 뒤 9.4 게이트로 넘어간다.

> ⚠️ **`updatedInput` 의 위험**: Hook 이 입력을 교체하면, 그 *교체된 입력* 으로 9.4 권한 게이트가 평가된다. 만약 모델이 `Bash:ls` 를 요청했는데 hook 이 `Bash:rm -rf /` 로 바꾸면 deny 룰 매칭이 일어나서 차단된다. *9.4 가 마지막 방어선* — Hook 이 권한을 *우회* 하는 게 아니라 *우회 시도를 9.4 가 잡는* 구조.

### 자리 ②: 도구 실행 *직후* (PostToolUse)

`tool_results.append({...})` 직후. 결과를 흘려보내고 다음 iteration 으로 가기 전.

```python
# src/mini_claude/agent.py — tool.call() 후
tool_results.append({
    "type": "tool_result",
    "tool_use_id": block["id"],
    "content": result_text,
    **({"is_error": True} if is_error else {}),
})

# ── Hook (10.4) — PostToolUse: additional_context 누적 ─
if hooks and not is_error:
    post_resp = await hooks.post_tool_use(
        cwd=cwd,
        tool_name=tool.name,
        tool_input=block["input"],
        tool_response=result_text,
    )
    if post_resp and post_resp.additional_context:
        tool_results[-1]["content"] = (
            f"{result_text}\n\n[hook_context]\n"
            f"{post_resp.additional_context}"
        )
```

PostToolUse 는 *결과를 바꾸지 않고 보강* 만 한다. `additional_context` 가 있으면 도구 결과 텍스트 뒤에 붙인다. 모델이 다음 턴에 이걸 *함께* 본다.

> 💡 **진짜 코드와 mini 의 차이**: 진짜는 `additionalContext` 를 *시스템 메시지* 로 추가한다 (`addToolResultSystemMessage`, `hooks.ts:1834`). mini 는 단순화 — 도구 결과 안에 prepend. 의미는 *다음 LLM 호출에 같이 들어간다* 로 같지만, 형식이 다르다.

### 자리 ③: 턴 종료 (Stop)

`stop_reason == "end_turn"` 또는 기타. `TurnDone` yield 직전.

```python
# src/mini_claude/agent.py — while 루프 종료 직전
if response.stop_reason == "end_turn":
    if hooks:
        await hooks.stop(cwd=cwd, stop_reason="end_turn")
    yield TurnDone(stop_reason="end_turn")
    return

if response.stop_reason != "tool_use":
    if hooks:
        await hooks.stop(cwd=cwd, stop_reason=response.stop_reason)
    yield TurnDone(stop_reason=response.stop_reason)
    return
```

Stop hook 의 응답은 *무시한다*. 턴이 이미 끝났으니 결정에 개입할 자리가 없다. *부수 효과* (로깅, 외부 알림 등) 만 의미.

main.py 쪽에도 *두 자리* 가 더 있다 — SessionStart (REPL 시작 직후) 와 UserPromptSubmit (사용자 입력 직후). agent 가 *턴 단위* 자리에 책임을 갖고, main 이 *세션 / 입력 단위* 자리에 책임을 갖는 분리.

```python
# src/mini_claude/main.py 의 핵심 변경
hooks = HookEngine.from_file()  # ~/.mini_claude/hooks.json
await hooks.session_start(cwd=str(args.cwd))   # SessionStart

while True:
    user_input = await asyncio.to_thread(input, "> ")
    if not user_input.strip():
        continue

    # UserPromptSubmit — deny 면 입력 자체를 버린다
    ups_resp = await hooks.user_prompt_submit(
        cwd=str(args.cwd), prompt=user_input
    )
    if ups_resp and ups_resp.permission_decision == "deny":
        print(f"[hook] Prompt rejected: {...}")
        continue
    if ups_resp and ups_resp.additional_context:
        user_input = f"{user_input}\n\n[context]\n{ups_resp.additional_context}"

    async for chunk in query(
        user_input=user_input, ...,
        hooks=hooks,  # ← agent 의 세 자리에 흘러간다
    ):
        ...
```

다섯 자리 (PreToolUse·PostToolUse·Stop·SessionStart·UserPromptSubmit) 를 *두 파일* 이 책임 분할. 정리하면:

| 이벤트 | 자리 | 책임 |
|---|---|---|
| `PreToolUse` | agent.py | 도구 실행 전 권한·입력 변조 |
| `PostToolUse` | agent.py | 도구 결과 보강 |
| `Stop` | agent.py | 턴 종료 알림 |
| `SessionStart` | main.py | REPL 시작 직후 컨텍스트 부착 |
| `UserPromptSubmit` | main.py | 사용자 입력 차단·보강 |

---

## 핵심 디테일

### matcher vs if — 6.4 의 두 단계 회수

6.5 의 진짜 코드는 매칭이 *두 단계* 다. 첫째, hook spec 의 `matcher` 가 도구 이름과 fnmatch. 둘째, hook 안에 *if 조건* 이 또 있으면 거기서 컨텍스트(현재 디렉토리, 환경 변수, transcript 등) 를 추가 확인.

mini 는 *첫 단계* 만 코드로 처리한다. *두 번째 단계 (if)* 는 hook 스크립트 *안에서* 구현. 위 예시의 `guard.py` 가 `re.search` 로 패턴을 보는 게 바로 *if 조건* 의 자리다.

```python
# guard.py 의 if 조건
for pattern, name in patterns:
    if re.search(pattern, command):
        print(json.dumps({"permissionDecision": "deny", ...}))
        sys.exit(0)
```

mini 의 *두 축 매칭* (event + matcher) 이 *진짜 코드의 첫 단계* 와 동일. *두 번째 단계* 는 스크립트 자유. 핸드북의 6.4 코드가 한 번 더 살아난다.

### stdin / stdout JSON 의 단순성

Hook 스크립트는 *어떤 언어든* 가능하다. 표준 입력에서 JSON 받고 표준 출력에 JSON 쓰면 끝.

:::tabs

```python
# Python
import json, sys
payload = json.load(sys.stdin)
print(json.dumps({"permissionDecision": "deny", "permissionDecisionReason": "..."}))
```

```bash
# Bash + jq
payload=$(cat)
tool_name=$(echo "$payload" | jq -r '.tool_name')
if [ "$tool_name" = "Bash" ]; then
  echo '{"permissionDecision":"deny","permissionDecisionReason":"no bash here"}'
fi
```

:::

*프로토콜 경계* 가 *프로세스 경계* 라서, 언어를 강요하지 않는다. mini_claude 가 Python 으로 짜여 있어도 hook 은 Node 일 수 있고, Go 일 수도 있고, awk 한 줄일 수도 있다. 이게 Hook 의 *철학적 가치* — *내부* 와 *외부* 의 경계를 분명히 그어두는 디자인.

### `updatedInput` 의 입력 변조 능력

PreToolUse 의 가장 *재미있는* 기능. 도구 입력을 *부분 또는 전체 교체*. 예시:

```python
# guard.py — Edit 호출 시 상대 경로를 절대 경로로 정규화
import json, sys
from pathlib import Path

payload = json.load(sys.stdin)
if payload["tool_name"] == "Edit":
    file_path = payload["tool_input"].get("file_path", "")
    if file_path and not file_path.startswith("/"):
        abs_path = str(Path(payload["cwd"]) / file_path)
        # 입력을 교체 — 9.4 권한 게이트는 *교체된 입력* 으로 평가
        print(json.dumps({
            "updatedInput": {**payload["tool_input"], "file_path": abs_path}
        }))
```

*9.4 가 마지막 방어선* 이라고 했었다. `updatedInput` 으로 입력을 교체해도 deny 룰이 매칭되면 차단된다. 그래서 hook 이 *권한을 우회* 할 수 없고 *권한 결정의 컨텍스트만 다듬는* 도구로 자리잡는다.

### `permissionDecision` 과 9.4 의 합산

세 결정값 — `allow` / `deny` / `ask` — 가 9.4 와 어떻게 합쳐지는지.

| Hook 응답 | 9.4 게이트 | 결과 |
|---|---|---|
| (응답 없음 / None) | 평소대로 | 9.4 의 결정 |
| `permissionDecision: deny` | 건너뜀 | **차단** (hook 의 reason 으로) |
| `permissionDecision: allow` | 건너뜀 | **통과** |
| `permissionDecision: ask` | 평소대로 | 9.4 가 ask 로 분기 (mini 는 prompt_user) |
| `updatedInput` 만 | 평소대로 | 9.4 가 *교체된 입력* 으로 결정 |

진짜 코드는 더 복잡하다 (정책 모드별 분기, ant-mode auto classifier 등). mini 는 *deny 절대 우선*, `allow` / `ask` 는 9.4 게이트 우회. 이게 *최소한의 합산* 인데도 충분한 표현력.

### `transcript_path` 로 맥락 기반 판단

진짜 코드의 stdin JSON 에는 `transcript_path` 가 들어간다 — 현재 세션의 *전체 대화 기록* 이 jsonl 파일로 저장되는 자리. Hook 이 이걸 열어서 *지난 도구 호출 / 모델 응답* 을 확인하고 결정에 쓸 수 있다.

mini 는 *빈 문자열* 로 채워둔다. transcript 저장이 9.x 에는 OUT 이었기 때문. 만약 추가하고 싶다면 `messages.py` 의 `ConversationState` 를 *세션마다 jsonl 로 dump* 하는 메서드를 더하고, 그 경로를 `HookEngine(transcript_path=...)` 에 넘기면 된다. 작은 확장.

---

## 진짜 코드에서는 — `hooks.ts` 의 구조

`src/utils/hooks.ts` 는 *약 3,400 줄*. mini 의 280 줄과 *12배 차이*. 어디서 그렇게 커졌는지.

### 진입점 — `executePreToolHooks`

진짜 코드의 PreToolUse 진입점 (`hooks.ts:1632`) 은 async generator 다 — mini 의 `pre_tool_use` 가 한 줄짜리 응답을 반환하는 대신.

```typescript
// src/utils/hooks.ts:1632 (압축 인용)
export async function* executePreToolHooks(
  context: HookContext,
  toolName: string,
  toolInput: unknown,
): AsyncIterable<PreToolUseHookResult> {
  const hookInput = createBaseHookInput(...)
  const matchingHooks = getMatchingHooks('PreToolUse', context, toolName)

  // 핵심: async generator 머지 — Promise.race 기반
  const hookPromises = matchingHooks.map(async function* (spec) {
    yield { type: 'hook_progress', spec }
    const result = await execCommandHook(spec, hookInput)
    yield { type: 'hook_result', spec, result }
  })

  for await (const event of all(hookPromises)) {
    yield event
    if (event.type === 'hook_result'
        && event.result.permissionBehavior === 'deny') {
      return  // 첫 deny 에서 즉시 종료 — 나머지는 abort
    }
  }
}
```

*async generator* 라는 점이 핵심. progress 이벤트가 *시작 시점* 에 흘러나오고 result 가 *완료 시점* 에 흘러나온다. 호출자(query 의 loop) 는 그걸 *for await* 로 받아서 UI 에 즉시 표시 — "guard.py 실행 중..." → 결과 결정. mini 는 이걸 *한 번의 await* 로 압축.

### 매칭 — `getMatchingHooks` + `prepareIfConditionMatcher`

진짜 코드의 매칭은 *세 단계* 다.

1. **Event + matcher** — mini 의 `find_matching` 과 동일
2. **If 조건 평가** — hook spec 의 `if` 필드가 있으면 *그 조건을 또 평가*. fnmatch + transcript 조회 + 환경 변수 모두 가능.
3. **Workspace trust** — 현재 워크스페이스가 신뢰된 상태인지 (`hooks.ts:1487`)

`prepareIfConditionMatcher` (`hooks.ts:1422`) 가 `if` 의 *세부 문법* 을 해석한다 — `{"tool_input.command": {"contains": "rm -rf"}}` 같은 *DSL* 비스무리한 표현. mini 는 *if 자체* 를 hook 스크립트 안으로 미뤘다.

### 실행 — `execCommandHook`

`execCommandHook` (`hooks.ts:1789`) 가 mini 의 `execute_hook` 에 대응. *세 가지가 더 있다*.

- **abort 친화적**: `AbortController.signal` 을 받아서 도중 취소 가능
- **stderr 스트리밍**: stderr 가 progress 메시지로 UI 에 흘러감 (`onProgress` 콜백)
- **결과 캐싱**: 같은 hook input 에 대한 결과를 *동일 턴 안에서 재사용*

mini 는 셋 다 OUT.

### 결과 머지 — `addToolResultSystemMessage`

PostToolUse 의 `additionalContext` 는 *시스템 메시지* 로 추가된다 (`hooks.ts:1834`). 이게 *다음 LLM 호출의 messages 배열에* `{role: "system", content: "..."}` 형식으로 끼어든다. 진짜 messages 배열의 *중간* 에 끼는 게 가능한 건 Anthropic API 의 *messages 배열에 system 역할이 허용되는 일부 모드* 가 있어서. mini 는 도구 결과 안에 prepend 하는 단순한 방식.

### 압축 비율 정리

| 진짜 코드 | mini | 비율 |
|---|---|---|
| `hooks.ts` 약 3,400 줄 | `hooks/` 4 파일 약 280 줄 | **12 : 1** |
| 27 개 이벤트 | 5 개 이벤트 | **5.4 : 1** |
| 병렬 머지 (`Promise.race`) | 순차 실행 | OUT |
| if 조건 DSL | hook 스크립트 안의 자유 코드 | 형태 변경 |
| transcript_path | 빈 문자열 | OUT |
| 결과 캐싱 | OUT | OUT |
| workspace trust | OUT | OUT |

*핵심 메커니즘* (이벤트, matcher, stdin/stdout JSON, decision/updatedInput/additionalContext) 은 *살아 있고*, 엔터프라이즈 기능 (병렬 머지, if DSL, workspace trust, transcript) 만 빠진다. **6.5 의 본질이 280 줄 안에 다 있다**.

---

## 진짜로 만들어 보기

세 단계로 끝난다.

### 1. 설정 파일과 hook 스크립트 만들기

```bash
mkdir -p ~/.mini_claude

cat > ~/.mini_claude/hooks.json << 'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "python3 ~/.mini_claude/guard.py",
        "timeout": 5
      }
    ]
  }
}
EOF

cat > ~/.mini_claude/guard.py << 'EOF'
#!/usr/bin/env python3
"""Bash 명령 안에 secret 패턴이 있으면 차단."""
import json
import re
import sys

payload = json.load(sys.stdin)
command = payload["tool_input"].get("command", "")

patterns = [
    (r"AKIA[0-9A-Z]{16}", "AWS access key"),
    (r"sk-ant-[a-zA-Z0-9-]{20,}", "Anthropic API key"),
]
for pattern, name in patterns:
    if re.search(pattern, command):
        print(json.dumps({
            "permissionDecision": "deny",
            "permissionDecisionReason": f"blocked: {name} in command",
        }))
        sys.exit(0)
EOF

chmod +x ~/.mini_claude/guard.py
```

세 파일이 다. `mkdir` + `cat > heredoc` + `chmod`. shell 다섯 줄.

### 2. mini_claude 실행

```bash
cd content/claude_code/mini_claude
export GOOGLE_CLOUD_PROJECT=<your-gcp-project>   # + gcloud auth application-default login
uv run mini-claude
```

시작하면 SessionStart hook 이 먼저 발동 (현재는 등록 안 했으니 아무 일 없음). 그 다음 프롬프트.

### 3. Hook 발동 시나리오

**시나리오 1: 정상 통과**

```text
> echo hello

[Bash] {'command': 'echo hello'}
hello
```

`guard.py` 가 secret 패턴 못 찾고 exit 0. 출력 없음 → `None` 반환 → 9.4 권한 게이트로 통과 → `Bash:echo *` 가 ask 분기 → 사용자 승인 → 실행.

**시나리오 2: Hook 이 차단**

```text
> echo MY_AWS_KEY=AKIAIOSFODNN7EXAMPLE

[Bash] {'command': 'echo MY_AWS_KEY=AKIAIOSFODNN7EXAMPLE'}
```

화면에 deny 메시지가 *모델에게 흘러간다*. 모델은 다음 턴에서 "AWS key 가 노출되면 안 됩니다" 같은 응답을 한다. **사용자가 권한 다이얼로그를 보기도 전에 hook 이 차단** — 9.4 의 deny 룰 (`Bash:rm -rf *` 같은) 과 같은 위치에 있다.

**시나리오 3: 입력 교체 시나리오**

`guard.py` 에 한 줄 더.

```python
# guard.py 끝에 추가
if payload["tool_name"] == "Edit":
    file_path = payload["tool_input"].get("file_path", "")
    if file_path and not file_path.startswith("/"):
        from pathlib import Path
        abs_path = str(Path(payload["cwd"]) / file_path)
        print(json.dumps({
            "updatedInput": {**payload["tool_input"], "file_path": abs_path}
        }))
```

모델이 `Edit` 호출 시 *상대 경로* 를 주면 hook 이 *절대 경로로 정규화*. 9.4 권한 게이트는 그 *정규화된 입력* 으로 평가된다. 같은 명령이 *다른 권한 룰* 에 매칭될 수 있다는 흥미로운 자리.

---

## 핵심 정리

- **Hook 은 9.4 의 정적 규칙으로 못 푸는 자리** 를 채운다 — 컨텍스트 의존 결정, 입력 변조, 외부 시스템 통합. *사용자 코드가 도구 실행 흐름에 끼어드는* 메커니즘.
- **3 단계 생명주기** — 매칭(event + matcher) → 실행(subprocess + stdin/stdout JSON) → 반영(decision/updatedInput/additionalContext). 단순하고 *언어 무관*.
- **5 개 이벤트로 압축** — PreToolUse / PostToolUse / Stop / SessionStart / UserPromptSubmit. 진짜 27 개의 약 *1/5*. 도구 주기 + 세션 경계만 챙긴 셈.
- **6.4 의 fnmatch 회수** — matcher 한 줄로 매칭의 *첫 단계*. *둘째 단계 (if 조건) 는 hook 스크립트 안* 으로 미뤄두는 디자인이 진짜 코드와 정신이 같다.
- **fail-open + deny 절대 우선** — Hook 깨져도 mini 는 살아남고 (None 반환), 명시적 deny (exit code 또는 permissionDecision) 만 차단으로 해석. 9.4 권한 게이트가 *마지막 방어선* — Hook 이 권한을 우회하려 해도 9.4 가 잡는다.
- **`hooks.ts` 3,400 줄을 280 줄로** — 12배 압축. 병렬 머지·if DSL·workspace trust·transcript·결과 캐싱이 OUT. 본질 (이벤트, matcher, JSON 프로토콜, 결정 합산) 은 *살아 있다*.

---

*다음 챕터: 10.5 사용자 정의 에이전트 — `.claude/agents/*.md` 한 파일이 새 에이전트가 된다*
