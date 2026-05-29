# 10.3 Hook 만들기 — 도구 실행 흐름에 끼어드는 사용자 코드

---

## 이 챕터에서 배우는 것

- 9.5 까지의 미니 클로드에 **사용자 코드가 도구 흐름에 끼어드는 자리** 를 5 이벤트로 연다 — lint·typecheck·컨텍스트 주입·세션 로드·알림·위험 매처.
- Hook 은 **이벤트 + 외부 프로세스 + stdin/stdout JSON** 세 가지 부품으로 그 자리를 채운다.
- 6.4 의 와일드카드 매칭 코드(`matches_rule`)를 그대로 재활용해서 *matcher + if* 두 단계 필터링을 만든다.
- 미니 클로드에 5 개 이벤트(`PreToolUse`·`PostToolUse`·`Stop`·`SessionStart`·`UserPromptSubmit`)를 *약 280줄* 로 얹는다.
- **fail-open** 디자인 — 깨진 hook 은 통과, 명시적 deny 만 차단. Hook 이 시스템의 부속물.

---

## Hook 의 자리 — 도구 흐름에 끼어드는 사용자 코드

9.5 까지의 미니 클로드는 _내부 코드_ 가 모든 결정을 한다. 모델이 도구를 부르면 9.4 권한 게이트가 통과 / 거절 / 묻기, 답을 받으면 `state.add_assistant` 가 누적. 깔끔하지만 — _사용자 코드_ 가 _개입할 자리_ 가 없다.

**실무는 그 자리가 필요하다**. 흔한 여섯 가지:

- **Edit/Write 끝나면 자동 lint + 포맷** — `ruff format`, `eslint --fix`, `prettier` (PostToolUse)
- **Edit 끝나면 즉시 타입 검사** — `mypy`, `pyright`, `tsc --noEmit` (PostToolUse)
- **사용자가 발화하면 컨텍스트 자동 주입** — 메모리, 최근 git log, 미해결 TODO (UserPromptSubmit)
- **세션 시작 시 프로젝트 상태 로드** — 활성 PR, 현재 브랜치, 최근 작업 (SessionStart)
- **턴 종료 시 작업 알림** — 테스트 결과, Slack notification (Stop)
- **도구 실행 전 위험 매처** — secret guard, branch 보호 (PreToolUse) — _권한 매처의 한 변형_

여섯 자리 모두 _사용자 코드가 도구 실행 흐름에 끼어드는_ 자리. 그게 Hook 이다.

> 💡 **Hook 의 한 줄 정의**: 이벤트가 발생할 때 외부 프로세스를 호출하고, 그 프로세스의 stdout JSON 으로 _컨텍스트 보강 / 입력 교체 / 결정_ 을 받는 메커니즘. 도구 실행의 _전·후·세션 전이·사용자 입력_ 같은 자리에 끼어든다.

진짜 Claude Code 의 Hook 시스템은 6.5 에서 본 그대로 — `executeHooks` 가 async generator 로 매칭된 hook 들을 _병렬_ 로 돌리고 결과 필드 (`additionalContext` / `updatedInput` / `permissionDecision`) 로 합산한다. 미니 클로드는 _순차 실행 + 첫 응답 사용_ 으로 축약.

---

## 완성된 모습 먼저 보기

세 파일로 끝난다. 가장 흔한 자리 — _Edit/Write 후 자동 포맷_ — 으로 시작한다.

### ① `hooks.json` (설정, 프로젝트 루트)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "command": "python ./format_hook.py",
        "timeout": 10
      }
    ]
  }
}
```

`matcher` 는 도구 이름 fnmatch 패턴 — `"*"` 는 모든 도구 (스크립트가 안에서 분기). `command` 는 셸이 실행하는 명령. `timeout` 은 초.

### ② `format_hook.py` (Hook 스크립트, 프로젝트 루트)

```python
#!/usr/bin/env python3
"""Edit/Write 끝나면 .py 파일을 ruff format 으로 자동 포맷."""
import json
import subprocess
import sys

payload = json.load(sys.stdin)
tool_name = payload.get("tool_name", "")
file_path = payload["tool_input"].get("file_path", "")

# matcher 의 두 번째 단계 — _스크립트 안의 if_
if tool_name not in ("Edit", "Write") or not file_path.endswith(".py"):
    sys.exit(0)

subprocess.run(["ruff", "format", file_path], check=False)

# additionalContext — 모델이 다음 turn 에 함께 본다
print(json.dumps({
    "additionalContext": f"ruff format applied to {file_path}"
}))
```

JSON 한 줄 응답이 미니 클로드의 _다음 turn 컨텍스트_ 에 합류.

### ③ 실행 흐름

```text
> src/users.py 에 get_user 함수 추가해줘

[Edit] {'file_path': 'src/users.py', 'old_string': '...', 'new_string': '...'}
[hook_context] ruff format applied to src/users.py

함수를 추가하고 ruff format 으로 정렬했다.
```

모델이 `Edit` 호출 → mini 가 도구 실행 → 결과를 `tool_result` 에 담음 → **Hook 이 그 뒤에서 `ruff format` 실행 + `additionalContext` 응답** → 모델이 다음 turn 에 _포맷 적용됨_ 을 알고 응답을 마무리.

> ⚙️ **왜 fail-open 디자인인가**: `format_hook.py` 가 깨지거나 timeout 나거나 비-JSON 을 뱉어도 미니 클로드는 _그대로_ 진행. Hook 이 시스템의 _부속물_ 이라는 뜻 — 깨져도 본체는 살아 있어야 한다. 명시적 결정 (`permissionDecision: "deny"`) 만 deny 로 해석.

이걸 어떻게 만들지가 챕터의 나머지다.

---

## Hook 의 생명주기 — 3 단계

이벤트 한 개가 발생하면 *세 단계* 가 순차적으로 일어난다.

![Hook 의 생명주기 — 3 단계](/content/claude_code/images/10_3/hook_lifecycle.svg)

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
from __future__ import annotations

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


class SessionStartInput(BaseHookInput):
    hook_event_name: Literal["SessionStart"] = "SessionStart"


class UserPromptSubmitInput(BaseHookInput):
    hook_event_name: Literal["UserPromptSubmit"] = "UserPromptSubmit"
    prompt: str


# 5 이벤트를 묶는 union — runner.py / __init__.py 에서 *공통 타입* 으로 쓴다.
HookInput = (
    PreToolUseInput
    | PostToolUseInput
    | StopInput
    | SessionStartInput
    | UserPromptSubmitInput
)
```

다섯 이벤트가 *공통 필드 + 이벤트별 추가 필드* 라는 *판별 유니온(0.4)* 의 정직한 응용이다. `hook_event_name` 으로 분기.

> ⚙️ **`HookInput` union 별칭**: 다섯 이벤트의 입력 dataclass 를 묶는 *공통 타입*. `runner.py` 의 `execute_hook(spec, hook_input: HookInput)` 시그니처와 `__init__.py` 의 `_fire_first` 가 이 별칭으로 5 이벤트를 한 형태로 받는다. *판별 유니온(0.4)* 의 정수.

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
from __future__ import annotations

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
    def load(cls, path: Path) -> HookRegistry:
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
from __future__ import annotations

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
from __future__ import annotations

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


# 학습용: src/mini_claude/hooks/__init__.py 의 3 단계 상위가 프로젝트 루트
DEFAULT_CONFIG_PATH = Path(__file__).resolve().parents[3] / "hooks.json"


@dataclass
class HookEngine:
    registry: HookRegistry
    session_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    transcript_path: str = ""

    @classmethod
    def from_file(cls, path: Path | None = None) -> HookEngine:
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

    async def post_tool_use(
        self, *, cwd: str, tool_name: str,
        tool_input: dict[str, Any], tool_response: str,
    ) -> HookResponse | None:
        return await self._fire_first(
            "PostToolUse",
            PostToolUseInput(
                session_id=self.session_id,
                transcript_path=self.transcript_path,
                cwd=cwd, tool_name=tool_name,
                tool_input=tool_input, tool_response=tool_response,
            ),
            tool_name=tool_name,
        )

    async def stop(self, *, cwd: str, stop_reason: str) -> HookResponse | None:
        return await self._fire_first(
            "Stop",
            StopInput(
                session_id=self.session_id,
                transcript_path=self.transcript_path,
                cwd=cwd, stop_reason=stop_reason,
            ),
        )

    async def session_start(self, *, cwd: str) -> HookResponse | None:
        return await self._fire_first(
            "SessionStart",
            SessionStartInput(
                session_id=self.session_id,
                transcript_path=self.transcript_path,
                cwd=cwd,
            ),
        )

    async def user_prompt_submit(
        self, *, cwd: str, prompt: str,
    ) -> HookResponse | None:
        return await self._fire_first(
            "UserPromptSubmit",
            UserPromptSubmitInput(
                session_id=self.session_id,
                transcript_path=self.transcript_path,
                cwd=cwd, prompt=prompt,
            ),
        )

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

먼저 `query()` *시그니처에 한 파라미터 추가*:

```python
# src/mini_claude/agent.py — query() 시그니처
from .hooks import HookEngine   # ← *10.3 에서 추가*


async def query(
    *,
    # ... 9.5 의 기존 인자들 ...
    hooks: HookEngine | None = None,   # ← *10.3 에서 추가*. None 이면 hook 비활성 (9.5 동작 동일)
) -> AsyncIterator[QueryChunk]:
    ...
```

`None` default 라 _9.5 까지의 호출은 변경 없음_. main.py 에서 `hooks=HookEngine.from_file()` 로 주입하면 활성화.

### 자리 ①: 도구 실행 *직전* (PreToolUse)

`yield ToolUseStarted` 직후, 9.4 의 권한 게이트 직전.

```python
# src/mini_claude/agent.py — tool_use 분기 안
tool = find_tool(tools, block["name"])
yield ToolUseStarted(name=tool.name, input=block["input"])

# ── Hook (10.3) — PreToolUse ──────────────
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

> ⚠️ **`updatedInput` 은 9.4 게이트 _앞_ 에 끼어든다**: 교체된 입력이 9.4 에 평가되므로 hook 이 _권한 우회_ 를 할 수 없다. 9.4 가 마지막 방어선.

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

# ── Hook (10.3) — PostToolUse: additional_context 누적 ─
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
# src/mini_claude/main.py — 10.2 위의 add-up
from .hooks import HookEngine   # ← *10.3 에서 추가*


async def main_async() -> None:
    # ... 9.5 / 10.1 / 10.2 의 초기화 (argparse / VERTEX 검사 / state / permissions /
    #     parent_tools / SkillTool / AgentTool / md_commands / skills) ...

    # ⭐ 추가 ①: HookEngine 생성 + SessionStart 발화
    hooks = HookEngine.from_file()   # 프로젝트 루트의 hooks.json
    await hooks.session_start(cwd=str(args.cwd))

    print("mini-claude 시작 (Ctrl+D로 종료)")
    while True:
        try:
            user_input = await asyncio.to_thread(input, "> ")
        except (EOFError, KeyboardInterrupt):
            print("\nbye.")
            return
        if not user_input.strip():
            continue

        # ⭐ 추가 ②: UserPromptSubmit — deny 면 입력 자체를 버림, additional_context 면 보강
        ups_resp = await hooks.user_prompt_submit(
            cwd=str(args.cwd), prompt=user_input
        )
        if ups_resp and ups_resp.permission_decision == "deny":
            print(f"[hook] Prompt rejected: {ups_resp.permission_decision_reason}")
            continue
        if ups_resp and ups_resp.additional_context:
            user_input = f"{user_input}\n\n[context]\n{ups_resp.additional_context}"

        # ... 10.2 의 슬래시 분기 (md_commands / skills 매칭 + active_permissions 임시 사본) ...

        async for chunk in query(
            user_input=user_input,
            tools=parent_tools,
            permissions=active_permissions,
            cwd=str(args.cwd),
            state=state,
            hooks=hooks,   # ← ⭐ 추가 ③: 10.3 의 query() 새 인자
        ):
            # ... TextDelta / ToolUseStarted / TurnDone 분기 (10.2 그대로) ...
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

*프로토콜 경계* 가 *프로세스 경계* 라서, 언어를 강요하지 않는다. 미니 클로드가 Python 으로 짜여 있어도 hook 은 Node 일 수 있고, Go 일 수도 있고, awk 한 줄일 수도 있다. 이게 Hook 의 *철학적 가치* — *내부* 와 *외부* 의 경계를 분명히 그어두는 디자인.

### Hook 응답 필드 — 세 가지

stdout JSON 에 어떤 필드를 채우느냐로 hook 의 자리가 결정된다.

| 필드 | 효과 | 흔한 자리 |
|---|---|---|
| `additionalContext` | 도구 결과 뒤에 텍스트 추가 — 모델이 다음 turn 에 함께 본다 | _가장 흔함_. lint 결과, 메모리 주입, 보강 정보 |
| `updatedInput` | 도구 입력 교체 — 9.4 게이트가 _교체된 입력_ 으로 평가 | 상대 경로 → 절대 경로 정규화, 인자 보정 |
| `permissionDecision: "deny"` | 도구 실행 차단 (`allow` / `ask` 도 가능하나 9.4 우회) | secret guard, 위험 명령 매처 |

응답 없으면 (`None` 또는 비-JSON) hook 이 결정에 개입 안 함 — fail-open 의 정수. 한 응답에 세 필드를 _섞을_ 수도 있지만, 보통 _한 자리에 한 필드_.

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

PostToolUse 의 `additionalContext` 는 *시스템 메시지* 로 추가된다 (`hooks.ts:1834`). 이게 *다음 LLM 호출의 messages 배열에* `{role: "system", content: "..."}` 형식으로 끼어든다. 진짜 messages 배열의 *중간* 에 끼는 게 가능한 건 LLM API (Anthropic 인터페이스) 의 *messages 배열에 system 역할이 허용되는 일부 모드* 가 있어서. mini 는 도구 결과 안에 prepend 하는 단순한 방식.

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
# 프로젝트 루트에서 두 파일을 만든다 — hooks.json + format_hook.py
cat > hooks.json << 'EOF'
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "command": "python3 ./format_hook.py",
        "timeout": 10
      }
    ]
  }
}
EOF

cat > format_hook.py << 'EOF'
#!/usr/bin/env python3
"""Edit/Write 끝나면 .py 파일을 ruff format 으로 자동 포맷."""
import json
import subprocess
import sys

payload = json.load(sys.stdin)
tool_name = payload.get("tool_name", "")
file_path = payload["tool_input"].get("file_path", "")

# matcher 의 두 번째 단계 — 스크립트 안의 if
if tool_name not in ("Edit", "Write") or not file_path.endswith(".py"):
    sys.exit(0)

subprocess.run(["ruff", "format", file_path], check=False)

print(json.dumps({
    "additionalContext": f"ruff format applied to {file_path}"
}))
EOF

chmod +x format_hook.py
```

두 파일이 다. `cat > heredoc` 두 번 + `chmod`. shell 세 줄.

### 2. 미니 클로드 실행

```bash
cd ~/mini-claude     # 학습자 작업 cwd (9.0 SETUP.md §0-2 에서 만든 디렉토리)
uv run mini-claude   # .env (VERTEX_PROJECT_ID + GOOGLE_APPLICATION_CREDENTIALS 등) 가 준비됐다고 가정 — SETUP.md 참조
```

시작하면 SessionStart hook 이 먼저 발동 (현재는 등록 안 했으니 아무 일 없음). 그 다음 프롬프트.

### 3. Hook 발동 시나리오

**시나리오 1: matcher 통과 + 스크립트 분기로 빠짐**

```text
> README.md 의 첫 줄 한 번 알려줘

[Read] {'file_path': 'README.md'}
README.md 의 첫 줄은 "# semi-handbook" 이야.
```

`matcher: "*"` 라 PostToolUse hook 이 _발화는 됨_. 스크립트의 `if tool_name not in ("Edit", "Write")` 에서 `sys.exit(0)`. 출력 없음 → `None` 반환 → _Hook 이 결정에 개입 안 함_. **출력에 `[hook_context]` 줄이 안 보이는 게 통과의 시각적 신호** — matcher 의 첫 단계 (도구 이름) 와 스크립트 안의 if (두 번째 단계) 가 살아 있는 자리.

**시나리오 2: `.py` 파일 자동 포맷**

```text
> src/mini_claude/messages.py 끝에 빈 줄 한 줄만 더해줘

[Edit] {'file_path': 'src/mini_claude/messages.py', 'old_string': '...', 'new_string': '...'}
[hook_context] ruff format applied to src/mini_claude/messages.py

빈 줄을 추가하고 ruff format 으로 줄 끝 공백도 정리됐어.
```

모델이 `Edit` 호출 → mini 가 도구 실행 → 결과를 `tool_result` 에 담음 → **PostToolUse hook 이 그 뒤에서 `ruff format` 실행 + `additionalContext` 응답** → 모델이 다음 turn 에 `[hook_context] ruff format applied to ...` 를 보고 응답을 마무리. _사용자가 _포맷해줘_ 라고 안 했는데도_ 자동 적용 — Hook 의 진짜 가치는 _보이지 않는 자동화_.

---

## 핵심 정리

- **Hook 은 9.4 의 정적 규칙으로 못 푸는 자리** 를 채운다 — 컨텍스트 의존 결정, 입력 변조, 외부 시스템 통합. *사용자 코드가 도구 실행 흐름에 끼어드는* 메커니즘.
- **3 단계 생명주기** — 매칭(event + matcher) → 실행(subprocess + stdin/stdout JSON) → 반영(decision/updatedInput/additionalContext). 단순하고 *언어 무관*.
- **5 개 이벤트로 압축** — PreToolUse / PostToolUse / Stop / SessionStart / UserPromptSubmit. 진짜 27 개의 약 *1/5*. 도구 주기 + 세션 경계만 챙긴 셈.
- **6.4 의 fnmatch 회수** — matcher 한 줄로 매칭의 *첫 단계*. *둘째 단계 (if 조건) 는 hook 스크립트 안* 으로 미뤄두는 디자인이 진짜 코드와 정신이 같다.
- **fail-open + deny 절대 우선** — Hook 깨져도 mini 는 살아남고 (None 반환), 명시적 deny (exit code 또는 permissionDecision) 만 차단으로 해석. 9.4 권한 게이트가 *마지막 방어선* — Hook 이 권한을 우회하려 해도 9.4 가 잡는다.
- **`hooks.ts` 3,400 줄을 280 줄로** — 12배 압축. 병렬 머지·if DSL·workspace trust·transcript·결과 캐싱이 OUT. 본질 (이벤트, matcher, JSON 프로토콜, 결정 합산) 은 *살아 있다*.
