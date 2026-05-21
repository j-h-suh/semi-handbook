from __future__ import annotations
import asyncio
from dataclasses import dataclass
from typing import Any, AsyncIterator
from anthropic import AsyncAnthropic
from .tools.base import Tool, ToolContext, find_tool, tool_to_anthropic_schema
from .permissions import PermissionEngine, prompt_user
from .messages import ConversationState
from .hooks import HookEngine
from . import message_queue
from . import teams


# 위로 흘려보낼 청크 종류 ─────────────────────────────────
@dataclass
class TextDelta:
    """진행 중인 텍스트 한 조각."""
    text: str


@dataclass
class ToolUseStarted:
    """도구 호출이 시작됐다는 알림."""
    name: str
    input: dict[str, Any]


@dataclass
class TurnDone:
    """한 턴이 끝났다는 신호."""
    stop_reason: str


# 위로 흘려보내는 청크의 union
QueryChunk = TextDelta | ToolUseStarted | TurnDone


async def query(
    *,
    user_input: str,
    tools: list[Tool],
    permissions: PermissionEngine,
    cwd: str,
    state: ConversationState,
    system_prompt: str = "You are a helpful coding assistant.",
    client: AsyncAnthropic | None = None,
    hooks: HookEngine | None = None,
) -> AsyncIterator[QueryChunk]:
    """*async generator*. 각 청크를 부모에게 흘려보낸다.

    9.4 에서는 `async def query(...) -> None` 이었다. 이제 yield 가
    들어가서 *generator 함수*로 변신. *호출자는 `async for` 로 받는다*.

    10.4 에서 `hooks` 인자가 추가됐다. None 이면 hook 비활성 — 9.5 동작과 동일.
    """
    client = client or AsyncAnthropic()
    state.add_user(user_input)
    context = ToolContext(cwd=cwd, permissions=permissions)

    while True:
        # 9.2 의 messages.create() → stream() 으로 교체
        async with client.messages.stream(
            model="claude-opus-4-6",
            max_tokens=4096,
            system=system_prompt,
            messages=state.to_api_format(),
            tools=[tool_to_anthropic_schema(t) for t in tools],
        ) as stream:
            async for event in stream:
                # 진짜 코드의 switch (part.type) 에 해당
                if event.type == "content_block_delta":
                    delta = event.delta
                    if delta.type == "text_delta":
                        # ⭐ += 한 줄에 해당 — SDK 가 누적해 두지만 우리는
                        # *조각 자체* 를 부모에게 흘려보낸다.
                        yield TextDelta(text=delta.text)
                # content_block_start / content_block_stop / message_delta
                # 는 미니에서는 *그냥 흘려보낸다*. SDK 가 알아서 final
                # message 에 다 박아 준다.

            # 스트림이 끝나면 SDK 의 누적된 *완성된* 메시지를 가져온다.
            response = await stream.get_final_message()

        # 9.2 의 stop_reason 분기 — 변한 게 없다.
        # assistant 메시지를 그대로 history 에 박는다.
        content_blocks = [b.model_dump() for b in response.content]
        state.add_assistant(content_blocks)

        if response.stop_reason == "end_turn":
            # ── Hook (10.4) — Stop ──────────────
            if hooks:
                await hooks.stop(cwd=cwd, stop_reason="end_turn")
            # ── 10.7 — 팀원이면 lead 메일박스에 idle 알림 + coordinator.mark_idle ──
            await _notify_lead_on_idle(state, stop_reason="end_turn")
            yield TurnDone(stop_reason="end_turn")
            return

        if response.stop_reason != "tool_use":
            if hooks:
                await hooks.stop(cwd=cwd, stop_reason=response.stop_reason)
            await _notify_lead_on_idle(state, stop_reason=response.stop_reason)
            yield TurnDone(stop_reason=response.stop_reason)
            return

        # tool_use 분기 — 9.4 의 권한 게이트는 *한 줄도 안 바뀜*.
        tool_results: list[dict] = []
        for block in content_blocks:
            if block["type"] != "tool_use":
                continue

            tool = find_tool(tools, block["name"])
            yield ToolUseStarted(name=tool.name, input=block["input"])

            # ── Hook (10.4) — PreToolUse: deny 면 차단, updatedInput 이면 교체 ─
            if hooks:
                pre_resp = await hooks.pre_tool_use(
                    cwd=cwd, tool_name=tool.name, tool_input=block["input"]
                )
                if pre_resp and pre_resp.permission_decision == "deny":
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block["id"],
                        "content": (
                            "Permission denied by hook: "
                            f"{pre_resp.permission_decision_reason or '(no reason)'}"
                        ),
                        "is_error": True,
                    })
                    continue
                if pre_resp and pre_resp.updated_input is not None:
                    block["input"] = pre_resp.updated_input

            # ── 9.4 의 권한 게이트 (그대로) ─────────────
            decision = permissions.check(tool, block["input"])
            if decision == "deny":
                result_text = "Permission denied by deny rule."
                is_error = True
            elif decision == "ask":
                allowed, new_rule = await prompt_user(tool, block["input"])
                if new_rule:
                    permissions.add_allow(new_rule)
                if allowed:
                    try:
                        result_text = await tool.call(block["input"], context)
                        is_error = False
                    except Exception as e:
                        result_text = f"Error: {e}"
                        is_error = True
                else:
                    result_text = "Permission denied by user."
                    is_error = True
            else:  # "allow"
                try:
                    result_text = await tool.call(block["input"], context)
                    is_error = False
                except Exception as e:
                    result_text = f"Error: {e}"
                    is_error = True

            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block["id"],
                "content": result_text,
                **({"is_error": True} if is_error else {}),
            })

            # ── Hook (10.4) — PostToolUse: additional_context 누적 ─────
            if hooks and not is_error:
                post_resp = await hooks.post_tool_use(
                    cwd=cwd,
                    tool_name=tool.name,
                    tool_input=block["input"],
                    tool_response=result_text,
                )
                if post_resp and post_resp.additional_context:
                    # tool_result.content 에 보강 (진짜는 system msg 를 더한다)
                    tool_results[-1]["content"] = (
                        f"{result_text}\n\n[hook_context]\n"
                        f"{post_resp.additional_context}"
                    )

        # ── 메시지 큐 (10.6) — 외부에서 push 된 항목을 다음 LLM 호출에 attachment ──
        queued = message_queue.drain()
        for item in queued:
            tool_results.append({
                "type": "text",
                "text": f"[queued/{item.source}] {item.content}",
            })

        state.add_user(tool_results)
        # while 루프의 다음 iteration → 다음 LLM 호출


def _last_assistant_text(state: ConversationState) -> str:
    """대화 끝에서 가장 가까운 assistant 텍스트 블록을 합쳐 돌려준다.

    팀원이 turn 을 끝내면서 *지금까지 한 일* 의 요약을 lead 에게 전달하는 자리.
    AgentTool / TeamTool 의 마지막 텍스트 회수 로직과 같은 fallback.
    """
    for msg in reversed(state.messages):
        if msg.get("role") != "assistant":
            continue
        blocks = msg.get("content", [])
        texts = [
            b.get("text", "") for b in blocks
            if isinstance(b, dict) and b.get("type") == "text"
        ]
        if texts:
            return "\n".join(texts)
    return ""


async def _notify_lead_on_idle(state: ConversationState, stop_reason: str) -> None:
    """팀원의 turn 이 끝났을 때 lead 메일박스에 idle 알림 + coordinator.mark_idle.

    *팀 컨텍스트 밖* (단독 실행, 또는 lead 본인) 이면 no-op.
    """
    identity = teams.get_identity()
    if identity is None or identity.is_lead:
        return  # 팀 밖 또는 lead 본인 — 알림 불필요

    summary = _last_assistant_text(state)
    coordinator = teams.get_coordinator()
    # ① fan-in 콜백 트리거 — lead 의 wait_all_idle() 깨움
    coordinator.mark_idle(identity.agent_id, result=summary or None)
    # ② lead 메일박스에 idle 메시지 push — wait_all_idle 후 drain 으로 검토
    lead_id = f"lead@{identity.team_name}"
    await teams.deliver(
        lead_id,
        teams.MailboxMessage(
            sender=identity.agent_name,
            text=summary or f"(no text; stop_reason={stop_reason})",
            kind="idle",
        ),
    )
