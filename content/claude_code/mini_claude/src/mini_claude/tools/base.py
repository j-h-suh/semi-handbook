from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Protocol


@dataclass
class ToolContext:
    """도구 실행 시 주변 컨텍스트. 9.4에서 permissions 추가."""
    cwd: str


class Tool(Protocol):
    """Tool 인터페이스 — 9.3에서 Pydantic으로 정식화."""
    name: str
    description: str
    input_schema: dict[str, Any]   # JSONSchema dict (9.3에서 자동 생성)

    async def call(self, args: dict[str, Any], context: ToolContext) -> str:
        ...


def find_tool(tools: list[Tool], name: str) -> Tool:
    """이름으로 도구 찾기. 못 찾으면 에러."""
    for t in tools:
        if t.name == name:
            return t
    raise ValueError(f"Unknown tool: {name}")
