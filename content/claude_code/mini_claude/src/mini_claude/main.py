from __future__ import annotations
import argparse
import asyncio
import os
from pathlib import Path
from .agent import query, TextDelta, ToolUseStarted, TurnDone
from .agents import discover_agents
from .hooks import HookEngine
from .messages import ConversationState
from .permissions import PermissionEngine
from .tools import default_tool_pool
from .tools.agent import AgentTool
from .tools.team import TeamTool


async def main_async(args: argparse.Namespace) -> None:
    state = ConversationState()
    permissions = PermissionEngine(
        deny_rules={"Bash:rm -rf *", "Bash:sudo *"},
    )

    # ── Hook (10.4) ─── ~/.mini_claude/hooks.json 자동 로드 (없으면 비활성)
    hooks = HookEngine.from_file()
    session_start_resp = await hooks.session_start(cwd=str(args.cwd))
    session_context = (
        session_start_resp.additional_context
        if session_start_resp and session_start_resp.additional_context
        else None
    )

    # 10.5 — .claude/agents/ 에서 사용자 정의 에이전트 발견
    user_agents = discover_agents(args.cwd)

    # 9.4 의 도구 풀 + AgentTool 추가
    parent_tools = default_tool_pool()
    agent_tool = AgentTool(
        parent_tools=parent_tools,
        permissions=permissions,
        user_agents=user_agents,
    )
    parent_tools.append(agent_tool)
    # 10.7 — TeamTool: N 명의 팀원을 동시 spawn. AgentTool 과 같은 user_agents 풀 공유
    team_tool = TeamTool(
        parent_tools=parent_tools,
        permissions=permissions,
        user_agents=user_agents,
    )
    parent_tools.append(team_tool)

    print("mini-claude 시작 (Ctrl+D로 종료)")
    if user_agents:
        names = ", ".join(a.name for a in user_agents)
        print(f"[agents] 사용자 정의 에이전트 {len(user_agents)} 개 로드: {names}")
    if session_context:
        print(f"[hook] SessionStart context: {session_context[:120]}...")
    while True:
        try:
            user_input = await asyncio.to_thread(input, "> ")
        except EOFError:
            print("\nbye.")
            return

        if not user_input.strip():
            continue

        # ── Hook (10.4) — UserPromptSubmit ──────────────
        ups_resp = await hooks.user_prompt_submit(
            cwd=str(args.cwd), prompt=user_input
        )
        if ups_resp and ups_resp.permission_decision == "deny":
            print(
                f"[hook] Prompt rejected: "
                f"{ups_resp.permission_decision_reason or '(no reason)'}"
            )
            continue
        if ups_resp and ups_resp.additional_context:
            user_input = (
                f"{user_input}\n\n[context]\n{ups_resp.additional_context}"
            )

        # ⭐ 9.5 의 핵심 변화: async for 로 청크를 받아 즉시 출력
        async for chunk in query(
            user_input=user_input,
            tools=parent_tools,
            permissions=permissions,
            cwd=str(args.cwd),
            state=state,
            hooks=hooks,
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
