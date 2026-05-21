from __future__ import annotations
import argparse
import asyncio
import os
from pathlib import Path
from .agent import query, TextDelta, ToolUseStarted, TurnDone
from .messages import ConversationState
from .permissions import PermissionEngine
from .tools import default_tool_pool
from .tools.agent import AgentTool


async def main_async(args: argparse.Namespace) -> None:
    state = ConversationState()
    permissions = PermissionEngine(
        deny_rules={"Bash:rm -rf *", "Bash:sudo *"},
    )

    # 9.4 의 도구 풀 + AgentTool 추가
    parent_tools = default_tool_pool()
    agent_tool = AgentTool(
        parent_tools=parent_tools,
        permissions=permissions,
    )
    parent_tools.append(agent_tool)

    print("mini-claude 시작 (Ctrl+D로 종료)")
    while True:
        try:
            user_input = await asyncio.to_thread(input, "> ")
        except EOFError:
            print("\nbye.")
            return

        if not user_input.strip():
            continue

        # ⭐ 9.5 의 핵심 변화: async for 로 청크를 받아 즉시 출력
        async for chunk in query(
            user_input=user_input,
            tools=parent_tools,
            permissions=permissions,
            cwd=str(args.cwd),
            state=state,
        ):
            if isinstance(chunk, TextDelta):
                print(chunk.text, end="", flush=True)
            elif isinstance(chunk, ToolUseStarted):
                print(f"\n[{chunk.name}] {chunk.input}", flush=True)
            elif isinstance(chunk, TurnDone):
                print()  # 마무리 줄 바꿈


def main() -> None:
    parser = argparse.ArgumentParser(prog="mini-claude")
    parser.add_argument("--cwd", type=Path, default=Path.cwd())
    args = parser.parse_args()

    if "ANTHROPIC_API_KEY" not in os.environ:
        raise SystemExit(
            "ANTHROPIC_API_KEY 환경 변수가 필요해.\n"
            "  https://console.anthropic.com 에서 키 발급 후 "
            "`export ANTHROPIC_API_KEY=sk-ant-...` 로 설정."
        )

    asyncio.run(main_async(args))
