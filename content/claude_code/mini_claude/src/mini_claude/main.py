from __future__ import annotations
import argparse
import asyncio
import os
from pathlib import Path
from .agent import query
from .messages import ConversationState
from .permissions import PermissionEngine
from .tools import default_tool_pool


async def main_async() -> None:
    parser = argparse.ArgumentParser(prog="mini-claude")
    parser.add_argument("--cwd", type=Path, default=Path.cwd())
    args = parser.parse_args()

    if "ANTHROPIC_API_KEY" not in os.environ:
        raise SystemExit(
            "ANTHROPIC_API_KEY 환경 변수가 필요해.\n"
            "  https://console.anthropic.com 에서 키 발급 후 "
            "`export ANTHROPIC_API_KEY=sk-ant-...` 로 설정."
        )

    state = ConversationState()
    permissions = PermissionEngine(
        deny_rules={
            "Bash:rm -rf *",
            "Bash:sudo *",
        },
    )
    tools = default_tool_pool()

    print("mini-claude 시작 (Ctrl+D로 종료)")
    while True:
        try:
            user_input = input("> ")
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if not user_input.strip():
            continue

        await query(
            user_input=user_input,
            tools=tools,
            permissions=permissions,
            cwd=str(args.cwd),
            state=state,
        )


def main() -> None:
    asyncio.run(main_async())
