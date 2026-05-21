from __future__ import annotations
from pathlib import Path
from typing import Any
from pydantic import BaseModel, Field
from .base import ToolContext


class ReadInput(BaseModel):
    file_path: str = Field(
        ...,
        description="The absolute or relative path to the file to read.",
    )


class ReadTool:
    name = "Read"
    description = (
        "Read the contents of a file from disk. Returns the full text. "
        "Use this when you need to see the actual content of a file."
    )
    input_model = ReadInput

    def is_read_only(self) -> bool:
        return True

    def is_destructive(self) -> bool:
        return False

    async def call(self, args: dict[str, Any], context: ToolContext) -> str:
        # ① 검증 — Pydantic이 한다
        validated = ReadInput.model_validate(args)

        # ② 경로 해석 — 상대 경로면 cwd 기준
        path = Path(validated.file_path)
        if not path.is_absolute():
            path = Path(context.cwd) / path
        path = path.resolve()

        # ③ 존재 확인
        if not path.exists():
            return f"Error: File not found: {path}"
        if not path.is_file():
            return f"Error: Not a file: {path}"

        # ④ 읽기
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            return f"Error: File is not UTF-8: {path}"

        # ⑤ 읽은 파일 등록 — EditTool의 Read-before-Edit 게이트에 사용
        context.read_files.add(str(path))
        return text
