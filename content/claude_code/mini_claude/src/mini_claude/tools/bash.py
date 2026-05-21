from __future__ import annotations
import asyncio
from typing import Any
from pydantic import BaseModel, Field
from .base import ToolContext


# 기본 타임아웃 — 진짜 Claude Code는 2분, 우리도 같음
DEFAULT_TIMEOUT_SEC = 120
MAX_OUTPUT_BYTES = 64 * 1024  # 64KB로 자름


class BashInput(BaseModel):
    command: str = Field(
        ...,
        description="The shell command to execute.",
    )
    timeout_sec: int | None = Field(
        default=None,
        description=f"Timeout in seconds (default: {DEFAULT_TIMEOUT_SEC}).",
    )


class BashTool:
    name = "Bash"
    description = (
        "Execute a shell command. Returns combined stdout/stderr. "
        f"Default timeout {DEFAULT_TIMEOUT_SEC}s, output capped at {MAX_OUTPUT_BYTES // 1024}KB."
    )
    input_model = BashInput

    def is_read_only(self) -> bool:
        # Fail-safe: 명령어 분석 안 함, 그냥 위험하다고 가정
        return False

    def is_destructive(self) -> bool:
        return True

    def permission_summary(self, args: dict[str, Any]) -> str:
        return args.get("command", "")

    async def call(self, args: dict[str, Any], context: ToolContext) -> str:
        validated = BashInput.model_validate(args)
        timeout = validated.timeout_sec or DEFAULT_TIMEOUT_SEC

        # asyncio subprocess — shell=True로 한 명령
        proc = await asyncio.create_subprocess_shell(
            validated.command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,  # stderr를 stdout에 합침
            cwd=context.cwd,
        )

        try:
            stdout_bytes, _ = await asyncio.wait_for(
                proc.communicate(),
                timeout=timeout,
            )
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
            return f"Error: Command timed out after {timeout}s"

        # 출력 자르기
        truncated = ""
        if len(stdout_bytes) > MAX_OUTPUT_BYTES:
            stdout_bytes = stdout_bytes[:MAX_OUTPUT_BYTES]
            truncated = f"\n[Output truncated to {MAX_OUTPUT_BYTES} bytes]"

        output = stdout_bytes.decode("utf-8", errors="replace") + truncated

        if proc.returncode != 0:
            return f"Exit code: {proc.returncode}\n{output}"

        return output if output else "(no output)"
