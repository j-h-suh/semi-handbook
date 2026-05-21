from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Protocol
from pydantic import BaseModel


@dataclass
class ToolContext:
    """도구 호출 시 주변 컨텍스트 — 8.2의 createSubagentContext의 미니 버전."""
    cwd: str
    permissions: Any  # PermissionEngine — 9.4에서 정의
    read_files: set[str] = field(default_factory=set)  # Read-before-Edit 추적 (9.3 EditTool)


class Tool(Protocol):
    """Tool 인터페이스 — 3.2의 47개 필드를 5개로 압축."""
    name: str
    description: str
    input_model: type[BaseModel]   # Pydantic으로 스키마 자동 생성

    async def call(self, args: dict, context: ToolContext) -> str:
        """도구의 실제 동작. 결과는 문자열 (Anthropic API가 받는 형식)."""
        ...

    def is_read_only(self) -> bool:
        """Fail-safe: 모르면 False (위험하다고 가정)."""
        ...
