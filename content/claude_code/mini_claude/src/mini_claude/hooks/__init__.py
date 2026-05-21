"""Hook 시스템의 진입점 (facade).

agent.py / main.py 는 ``HookEngine`` 만 알면 된다. 내부의 ``HookRegistry`` /
``execute_hook`` 은 숨김.

진짜 Claude Code 의 ``executePreToolHooks`` / ``executePostToolHooks`` / ``executeStopHooks``
류 함수들의 *facade* 버전이다 — mini 는 5 개 이벤트 모두를 한 객체가 처리.
"""
from __future__ import annotations
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .events import (
    HookInput,
    HookResponse,
    PostToolUseInput,
    PreToolUseInput,
    SessionStartInput,
    StopInput,
    UserPromptSubmitInput,
)
from .registry import HookRegistry
from .runner import execute_hook


DEFAULT_CONFIG_PATH = Path.home() / ".mini_claude" / "hooks.json"


@dataclass
class HookEngine:
    """5 가지 이벤트 진입점을 제공한다. agent.py 의 3 자리 + main.py 의 2 자리."""

    registry: HookRegistry
    session_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    transcript_path: str = ""  # 진짜는 ~/.claude/projects/<hash>/<sid>.jsonl

    @classmethod
    def from_file(cls, path: Path | None = None) -> "HookEngine":
        """``~/.mini_claude/hooks.json`` 에서 자동 로드."""
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
        self,
        *,
        cwd: str,
        tool_name: str,
        tool_input: dict[str, Any],
        tool_response: str,
    ) -> HookResponse | None:
        return await self._fire_first(
            "PostToolUse",
            PostToolUseInput(
                session_id=self.session_id,
                transcript_path=self.transcript_path,
                cwd=cwd,
                tool_name=tool_name,
                tool_input=tool_input,
                tool_response=tool_response,
            ),
            tool_name=tool_name,
        )

    async def stop(self, *, cwd: str, stop_reason: str) -> HookResponse | None:
        return await self._fire_first(
            "Stop",
            StopInput(
                session_id=self.session_id,
                transcript_path=self.transcript_path,
                cwd=cwd,
                stop_reason=stop_reason,
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
        self, *, cwd: str, prompt: str
    ) -> HookResponse | None:
        return await self._fire_first(
            "UserPromptSubmit",
            UserPromptSubmitInput(
                session_id=self.session_id,
                transcript_path=self.transcript_path,
                cwd=cwd,
                prompt=prompt,
            ),
        )

    async def _fire_first(
        self, event: str, hook_input: HookInput, tool_name: str | None = None
    ) -> HookResponse | None:
        """매칭된 spec 들 중 *결정을 내린 첫 응답* 을 반환. 단순화 — 병렬 머지 없음."""
        for spec in self.registry.find_matching(event, tool_name):  # type: ignore[arg-type]
            response = await execute_hook(spec, hook_input)
            if response is not None:
                return response
        return None


__all__ = ["HookEngine", "HookResponse"]
