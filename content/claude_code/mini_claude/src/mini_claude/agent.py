from __future__ import annotations
from typing import AsyncGenerator
from anthropic import AsyncAnthropic
from .messages import ConversationState, Message
from .permissions import PermissionEngine
from .tools.base import Tool, ToolContext


async def query(
    *,
    user_input: str,
    tools: list[Tool],
    permissions: PermissionEngine,
    cwd: str,
    state: ConversationState,
    system_prompt: str = "You are a helpful coding assistant.",
) -> AsyncGenerator[str, None]:
    """에이전트 루프 — 0.1의 50줄 챗봇 + 권한 + 스트리밍 + 도구.

    9.2에서 구현. 이 함수가 Part 9 전체의 심장.
    """
    raise NotImplementedError("9.2에서 구현")
    yield  # type: ignore[unreachable]  # async generator로 인식시키기 위한 stub
