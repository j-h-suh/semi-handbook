from __future__ import annotations
from anthropic import AsyncAnthropic
from .messages import ConversationState
from .tools.base import Tool, ToolContext, find_tool


# 모델 이름은 한 곳에서 관리
DEFAULT_MODEL = "claude-opus-4-6"
DEFAULT_MAX_TOKENS = 4096


async def query(
    *,
    user_input: str,
    tools: list[Tool],
    cwd: str,
    state: ConversationState,
    system_prompt: str = "You are a helpful coding assistant.",
    client: AsyncAnthropic | None = None,
    max_iterations: int = 50,
) -> None:
    """에이전트 루프 — 0.1의 50줄 챗봇 + 비동기 + 타입.

    스트리밍/권한/서브 에이전트는 9.4-9.5에서 추가.
    """
    client = client or AsyncAnthropic()
    context = ToolContext(cwd=cwd)

    # 사용자 입력을 메시지 히스토리에 추가
    state.add_user(user_input)

    for _ in range(max_iterations):
        # ── ① API 호출 ────────────────────────────
        response = await client.messages.create(
            model=DEFAULT_MODEL,
            max_tokens=DEFAULT_MAX_TOKENS,
            system=system_prompt,
            tools=[
                {
                    "name": t.name,
                    "description": t.description,
                    "input_schema": t.input_schema,
                }
                for t in tools
            ],
            messages=state.to_api_format(),
        )

        # ── ② assistant content를 그대로 저장 ──────
        content_blocks = [b.model_dump() for b in response.content]
        state.add_assistant(content_blocks)

        # ── ③ end_turn — 텍스트 출력 후 종료 ─────────
        if response.stop_reason == "end_turn":
            for block in content_blocks:
                if block["type"] == "text":
                    print(block["text"])
            return

        # ── ④ tool_use — 각 도구 실행, 결과 user 메시지로 ──
        if response.stop_reason == "tool_use":
            tool_results: list[dict] = []
            for block in content_blocks:
                if block["type"] != "tool_use":
                    continue

                tool = find_tool(tools, block["name"])
                print(f"[{tool.name}] {block['input']}")  # 임시 로그

                try:
                    result = await tool.call(block["input"], context)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block["id"],
                        "content": result,
                    })
                except Exception as e:
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block["id"],
                        "content": f"Error: {e}",
                        "is_error": True,    # ← 모델의 에러 회복 행동을 트리거
                    })

            state.add_user(tool_results)
            continue  # 루프 위로 — Claude한테 결과 보여주고 다음 결정

        raise RuntimeError(
            f"Unexpected stop_reason: {response.stop_reason}"
        )

    raise RuntimeError(
        f"max_iterations({max_iterations}) 초과 — Claude가 도구 호출 루프를 못 빠져나옴"
    )
