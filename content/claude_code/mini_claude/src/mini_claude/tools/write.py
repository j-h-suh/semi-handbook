from __future__ import annotations
from pathlib import Path
from typing import Any
from pydantic import BaseModel, Field
from .base import ToolContext


class WriteInput(BaseModel):
    file_path: str = Field(
        ...,
        description="The absolute or relative path to write to.",
    )
    content: str = Field(
        ...,
        description="The full text content to write. Overwrites existing files.",
    )


class WriteTool:
    name = "Write"
    description = (
        "Write text content to a file, creating it if necessary. "
        "Overwrites existing files. Creates parent directories if needed."
    )
    input_model = WriteInput

    def is_read_only(self) -> bool:
        return False

    def is_destructive(self) -> bool:
        return True  # 덮어쓰기 가능

    def permission_summary(self, args: dict[str, Any]) -> str:
        return args.get("file_path", "")

    async def call(self, args: dict[str, Any], context: ToolContext) -> str:
        validated = WriteInput.model_validate(args)

        path = Path(validated.file_path)
        if not path.is_absolute():
            path = Path(context.cwd) / path
        path = path.resolve()

        # 부모 디렉토리 보장 — 없으면 생성
        path.parent.mkdir(parents=True, exist_ok=True)

        # 쓰기
        try:
            path.write_text(validated.content, encoding="utf-8")
        except OSError as e:
            return f"Error: Failed to write {path}: {e}"

        line_count = validated.content.count("\n") + 1
        return f"Wrote {len(validated.content)} chars ({line_count} lines) to {path}"
