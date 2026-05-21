from __future__ import annotations
from pathlib import Path
from typing import Any
from pydantic import BaseModel, Field
from .base import ToolContext


class EditInput(BaseModel):
    file_path: str = Field(
        ...,
        description="The absolute or relative path to the file to modify.",
    )
    old_string: str = Field(
        ...,
        description="The text to replace (must be unique in the file).",
    )
    new_string: str = Field(
        ...,
        description="The text to replace it with (must differ from old_string).",
    )
    replace_all: bool = Field(
        default=False,
        description="Replace all occurrences of old_string (default false).",
    )


class EditTool:
    name = "Edit"
    description = (
        "Replace exact string occurrences in a file. "
        "The file must have been Read first. "
        "old_string must be unique unless replace_all is true."
    )
    input_model = EditInput

    def is_read_only(self) -> bool:
        return False

    def is_destructive(self) -> bool:
        return True

    async def call(self, args: dict[str, Any], context: ToolContext) -> str:
        validated = EditInput.model_validate(args)

        # 경로 해석
        path = Path(validated.file_path)
        if not path.is_absolute():
            path = Path(context.cwd) / path
        path = path.resolve()

        # ① Read-before-Edit 강제
        if str(path) not in context.read_files:
            return (
                "Error: File has not been read yet. "
                "Read it first before editing."
            )

        # ② 파일 존재 확인
        if not path.exists():
            return f"Error: File not found: {path}"

        content = path.read_text(encoding="utf-8")

        # ③ old_string == new_string 차단
        if validated.old_string == validated.new_string:
            return "Error: old_string and new_string are the same."

        # ④ old_string 존재 확인
        if validated.old_string not in content:
            return (
                f"Error: String to replace not found in file.\n"
                f"String: {validated.old_string}"
            )

        # ⑤ 유일성 검증
        match_count = content.count(validated.old_string)
        if match_count > 1 and not validated.replace_all:
            return (
                f"Error: Found {match_count} matches, but replace_all "
                f"is false. Provide more context to uniquely identify "
                f"the instance, or set replace_all to true.\n"
                f"String: {validated.old_string}"
            )

        # ⑥ 치환
        if validated.replace_all:
            new_content = content.replace(
                validated.old_string, validated.new_string
            )
        else:
            new_content = content.replace(
                validated.old_string, validated.new_string, 1
            )

        # ⑦ 쓰기
        path.write_text(new_content, encoding="utf-8")

        # read_files 타임스탬프 갱신 (편집 후에도 계속 편집 가능)
        context.read_files.add(str(path))

        if validated.replace_all and match_count > 1:
            return (
                f"Replaced all {match_count} occurrences in {path}."
            )
        return f"Successfully edited {path}."
