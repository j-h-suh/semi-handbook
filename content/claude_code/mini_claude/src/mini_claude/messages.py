from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ConversationState:
    """누적되는 대화 — 0.1의 messages 리스트의 살 붙은 버전."""

    messages: list[dict[str, Any]] = field(default_factory=list)

    def add_user(self, content: str | list[dict[str, Any]]) -> None:
        """user 메시지 추가. content가 문자열이면 그대로, 리스트면 그대로."""
        self.messages.append({"role": "user", "content": content})

    def add_assistant(self, content: list[dict[str, Any]]) -> None:
        """assistant 메시지 추가. 반드시 content 블록 리스트로 들어가야 한다."""
        self.messages.append({"role": "assistant", "content": content})

    def to_api_format(self) -> list[dict[str, Any]]:
        """Anthropic API가 받는 형식 — 우리는 이미 그 형식으로 저장 중."""
        return self.messages

    def __len__(self) -> int:
        return len(self.messages)
