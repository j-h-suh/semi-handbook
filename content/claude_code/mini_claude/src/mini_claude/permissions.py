from __future__ import annotations
from dataclasses import dataclass, field
from typing import Literal


PermissionDecision = Literal["allow", "deny", "ask"]


@dataclass
class PermissionEngine:
    """6.3의 권한 모드와 6.4의 매칭을 3가지로 압축."""
    allow_rules: set[str] = field(default_factory=set)  # ["Bash:git *", "Read"]
    deny_rules: set[str] = field(default_factory=set)

    def check(self, tool_name: str, input_summary: str) -> PermissionDecision:
        # 9.4에서 구현
        return "ask"
