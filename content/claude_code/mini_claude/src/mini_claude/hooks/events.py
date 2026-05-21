"""Hook 의 stdin/stdout JSON 스키마.

진짜 Claude Code 의 ``createBaseHookInput`` (`hooks.ts:301`) + ``syncHookResponseSchema``
를 mini 버전으로 축약. 5 개 이벤트만 지원 — PreToolUse / PostToolUse / Stop /
SessionStart / UserPromptSubmit.
"""
from __future__ import annotations
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field


HookEventName = Literal[
    "PreToolUse",
    "PostToolUse",
    "Stop",
    "SessionStart",
    "UserPromptSubmit",
]


# ── stdin (Hook 스크립트가 받음) ─────────────────────


class BaseHookInput(BaseModel):
    """모든 이벤트 공통 필드. ``hook_event_name`` 으로 분기."""

    session_id: str
    transcript_path: str
    cwd: str
    hook_event_name: HookEventName


class PreToolUseInput(BaseHookInput):
    hook_event_name: Literal["PreToolUse"] = "PreToolUse"
    tool_name: str
    tool_input: dict[str, Any]


class PostToolUseInput(BaseHookInput):
    hook_event_name: Literal["PostToolUse"] = "PostToolUse"
    tool_name: str
    tool_input: dict[str, Any]
    tool_response: str


class StopInput(BaseHookInput):
    hook_event_name: Literal["Stop"] = "Stop"
    stop_reason: str


class SessionStartInput(BaseHookInput):
    hook_event_name: Literal["SessionStart"] = "SessionStart"


class UserPromptSubmitInput(BaseHookInput):
    hook_event_name: Literal["UserPromptSubmit"] = "UserPromptSubmit"
    prompt: str


HookInput = (
    PreToolUseInput
    | PostToolUseInput
    | StopInput
    | SessionStartInput
    | UserPromptSubmitInput
)


# ── stdout (Hook 스크립트가 반환) ─────────────────────


class HookResponse(BaseModel):
    """Hook 이 stdout 으로 반환하는 JSON. 모든 필드 옵션 — 채워진 것만 동작.

    *camelCase alias 동시 지원* — Bash 든 Python 이든 익숙한 표기로 쓰면 둘 다 받는다.
    """

    model_config = ConfigDict(populate_by_name=True)

    permission_decision: Literal["allow", "deny", "ask"] | None = Field(
        default=None, alias="permissionDecision"
    )
    permission_decision_reason: str | None = Field(
        default=None, alias="permissionDecisionReason"
    )
    updated_input: dict[str, Any] | None = Field(
        default=None, alias="updatedInput"
    )
    additional_context: str | None = Field(
        default=None, alias="additionalContext"
    )
    system_message: str | None = Field(
        default=None, alias="systemMessage"
    )
