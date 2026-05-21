from __future__ import annotations
import asyncio
import fnmatch
from dataclasses import dataclass, field
from typing import Any, Literal
from .tools.base import Tool


PermissionDecision = Literal["allow", "deny", "ask"]


def matches_rule(rule: str, tool_name: str, summary: str) -> bool:
    """*규칙 매칭*. 6.4의 7단계 변환을 fnmatch 한 줄로."""
    if ":" not in rule:
        return rule == tool_name
    tool_part, _, pattern = rule.partition(":")
    if tool_part != tool_name:
        return False
    return fnmatch.fnmatchcase(summary, pattern)


@dataclass
class PermissionEngine:
    """*deny > allow > ask* 의 결정 엔진. 6.3의 5가지 모드를 3가지로 압축."""

    allow_rules: set[str] = field(default_factory=set)
    deny_rules: set[str] = field(default_factory=set)

    def check(self, tool: Tool, args: dict[str, Any]) -> PermissionDecision:
        summary = tool.permission_summary(args)

        # ① deny first — 보안 결정에서 deny는 항상 우선
        for rule in self.deny_rules:
            if matches_rule(rule, tool.name, summary):
                return "deny"

        # ② allow next — 명시적 허용 규칙
        for rule in self.allow_rules:
            if matches_rule(rule, tool.name, summary):
                return "allow"

        # ③ Read-only 휴리스틱 자동 허용
        if tool.is_read_only():
            return "allow"

        # ④ Fail-closed 기본값 — 모르는 건 물어본다
        return "ask"

    def add_allow(self, rule: str) -> None:
        self.allow_rules.add(rule)

    def add_deny(self, rule: str) -> None:
        self.deny_rules.add(rule)


async def prompt_user(
    tool: Tool, args: dict[str, Any]
) -> tuple[bool, str | None]:
    """사용자한테 묻고 (allowed, new_persistent_rule) 반환."""
    summary = tool.permission_summary(args)

    print(f"\n[Permission] Tool: {tool.name}")
    print(f"             Input: {summary or args}")
    print("  [a] allow once")
    print("  [A] always allow this exact input")
    print("  [t] always allow this tool (any input)")
    print("  [d] deny")

    choice = (await asyncio.to_thread(input, "> ")).strip()

    if choice == "a":
        return True, None
    if choice == "A":
        return True, f"{tool.name}:{summary}" if summary else tool.name
    if choice == "t":
        return True, tool.name
    return False, None
