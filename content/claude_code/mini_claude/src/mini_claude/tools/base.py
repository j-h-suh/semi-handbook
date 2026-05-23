from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Protocol, runtime_checkable
from pydantic import BaseModel


@dataclass
class ToolContext:
    """도구 호출 시 주변 컨텍스트."""

    cwd: str
    permissions: Any = None  # 9.4에서 채워짐
    read_files: set[str] = field(default_factory=set)  # Read-before-Edit 추적


@runtime_checkable
class Tool(Protocol):
    """5개로 압축된 Tool 인터페이스. 3.2의 47개를 정신적으로 회수."""

    # ── 정적 메타 ────────────────
    name: str  # 도구 이름 (LLM API 노출용 — Anthropic 형식, Vertex/vLLM 동일)
    description: str  # 모델한테 보이는 자연어 설명
    input_model: type[BaseModel]  # Pydantic 모델 = 스키마 + 검증

    # ── 메서드 ────────────────
    async def call(self, args: dict[str, Any], context: ToolContext) -> str:
        """실제 동작. 결과는 문자열 (LLM API가 받는 형식)."""
        ...

    def is_read_only(self) -> bool:
        """Fail-safe 기본값: 모르면 False (위험하다고 가정).

        9.4의 권한 시스템과 9.5의 병렬 실행 결정에 사용.
        """
        ...

    def is_destructive(self) -> bool:
        """파일을 지우거나 덮어쓸 수 있는가? 모르면 True."""
        ...

    def permission_summary(self, args: dict[str, Any]) -> str:
        """*권한 매칭에 쓸 한 줄 문자열* (9.4)."""
        ...


def find_tool(tools: list[Tool], name: str) -> Tool:
    """이름으로 도구 찾기."""
    for t in tools:
        if t.name == name:
            return t
    raise ValueError(f"Unknown tool: {name}")


def tool_to_anthropic_schema(tool: Tool) -> dict[str, Any]:
    """Pydantic → LLM API 도구 스키마 변환 (Anthropic 형식; Vertex/vLLM 동일)."""
    return {
        "name": tool.name,
        "description": tool.description,
        "input_schema": tool.input_model.model_json_schema(),
    }
