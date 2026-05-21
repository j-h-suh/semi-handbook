from __future__ import annotations
from typing import Any
from .base import ToolContext


class EchoTool:
    """테스트용 stub 도구 — 입력을 그대로 돌려준다.

    9.3에서 Read/Write/Bash로 대체된다.
    """
    name = "Echo"
    description = "Echoes the input message back. Useful for testing."
    input_schema = {
        "type": "object",
        "properties": {
            "message": {
                "type": "string",
                "description": "The message to echo back.",
            },
        },
        "required": ["message"],
    }

    async def call(self, args: dict[str, Any], context: ToolContext) -> str:
        return f"echo: {args['message']}"
