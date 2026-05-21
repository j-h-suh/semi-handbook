"""Hook 외부 프로세스 실행 + stdin/stdout JSON 프로토콜.

핵심 디자인 — *fail-open*. Hook 자체가 깨져도 mini_claude 는 계속 동작.
``exit code != 0`` 만 명시적 deny 로 해석.
"""
from __future__ import annotations
import asyncio
import json

from pydantic import ValidationError

from .events import HookInput, HookResponse
from .registry import HookSpec


async def execute_hook(spec: HookSpec, hook_input: HookInput) -> HookResponse | None:
    """Hook spec 을 실행하고 응답을 반환.

    Returns:
        ``HookResponse``: Hook 이 의사 표시를 한 경우.
        ``None``: 출력 없음 / 비-JSON / 스키마 불일치 / 타임아웃 / 예외 —
          모두 *결정에 개입하지 않음* 으로 해석.
    """
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

    # exit code != 0 = 차단 의도. 진짜 코드는 exit 2 를 특수 신호로 쓰지만
    # mini 는 단순화 — 0 이 아니면 deny.
    if proc.returncode != 0:
        reason = stderr_data.decode("utf-8", errors="replace").strip()[:200]
        return HookResponse(
            permission_decision="deny",
            permission_decision_reason=reason or f"hook exited with code {proc.returncode}",
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
