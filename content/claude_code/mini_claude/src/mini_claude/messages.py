from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Literal


# Anthropic API의 메시지 형식을 그대로 dataclass로
@dataclass
class Message:
    role: Literal["user", "assistant"]
    content: list[dict[str, Any]] | str


@dataclass
class ConversationState:
    """누적되는 대화 — 0.1의 messages 리스트의 살 붙은 버전."""
    messages: list[Message] = field(default_factory=list)

    def append(self, message: Message) -> None:
        self.messages.append(message)

    def to_api_format(self) -> list[dict[str, Any]]:
        """Anthropic API가 받는 형식으로 변환."""
        return [{"role": m.role, "content": m.content} for m in self.messages]
