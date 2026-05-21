from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any
from pydantic import BaseModel, Field
from .base import Tool, ToolContext
from ..messages import ConversationState


class AgentToolInput(BaseModel):
    prompt: str = Field(
        description="서브 에이전트에게 시킬 작업 설명. 한 문장 이상."
    )


# 부모 query() 와의 순환 import 를 피하려고 *지연 import*.
# 진짜 코드도 같은 이유로 비슷한 트릭을 쓴다.
def _query_lazy():
    from ..agent import query
    return query


SUB_AGENT_SYSTEM = """You are a focused sub-agent. You have ONE task.
Use your read-only tools to gather information, then return a concise
text summary. Do NOT write files. Do NOT run shell commands that
change state."""


@dataclass
class AgentTool:
    """진짜 클로드 코드의 AgentTool 의 *기하학적 압축 버전*.

    진짜는 1398 줄. 미니는 ~30 줄. 빠진 것: teammate spawn,
    fork path, background async, MCP 통합, in-process teammate,
    11 가지 컨텍스트 격리 슬라이더. 남은 것: *query() 를 다시 부른다*.
    """

    name: str = "Agent"
    description: str = (
        "읽기 전용 서브 에이전트를 한 번 돌립니다. 코드 분석, 문서 요약, "
        "검색 같은 read-only 작업에 적합. 결과는 텍스트로 돌아옵니다."
    )
    input_model: type[BaseModel] = AgentToolInput

    # 부모가 가진 도구 풀에서 *읽기 전용* 만 자식에게 넘긴다.
    parent_tools: list[Tool] = field(default_factory=list)
    permissions: Any = None  # PermissionEngine

    def is_read_only(self) -> bool:
        return False  # 자식이 뭘 할지 모르므로 fail-closed

    def is_destructive(self) -> bool:
        return False

    def permission_summary(self, args: dict[str, Any]) -> str:
        return args.get("prompt", "")[:80]

    async def call(self, args: dict[str, Any], context: ToolContext) -> str:
        prompt = args["prompt"]

        # ── ① 격리: *새 conversation state*. 13 개 override 의 압축 ──
        child_state = ConversationState()

        # ── ② 자식이 쓸 수 있는 도구는 *읽기 전용 + Agent 자기 제외* ──
        # AgentTool 자기 자신을 자식에게 안 주는 이유: 무한 재귀 방지.
        # 진짜 코드는 fork-path 에선 자기를 *준다* (cache hit 유지).
        # 미니는 그런 거 없으므로 그냥 뺀다.
        child_tools = [
            t for t in self.parent_tools
            if t.is_read_only() and t.name != self.name
        ]

        # ── ③ ⭐ 재귀 — query() 가 query() 를 부른다 ──
        # runAgent.ts:748 의 정수.
        query = _query_lazy()
        async for chunk in query(
            user_input=prompt,
            tools=child_tools,
            permissions=self.permissions,  # 부모와 공유
            cwd=context.cwd,
            state=child_state,             # ⭐ 격리된 새 그릇
            system_prompt=SUB_AGENT_SYSTEM,
        ):
            # 자식의 청크는 그냥 *드롭*. 진짜 코드는 부모로 forwarding 해서
            # 진행률을 보여주지만, 미니는 *부모가 동기로 기다리는 단순 모드*.
            pass

        # ── ④ finalizeAgentTool 의 *되돌아가기 fallback* 그대로 옮기기 ──
        last_text_blocks: list[str] = []
        for msg in reversed(child_state.messages):
            if msg.get("role") != "assistant":
                continue
            text_blocks = [
                b.get("text", "") for b in msg.get("content", [])
                if isinstance(b, dict) and b.get("type") == "text"
            ]
            if text_blocks:
                last_text_blocks = text_blocks
                break

        if not last_text_blocks:
            return "(서브 에이전트가 텍스트 응답을 생성하지 못했다)"

        return "\n".join(last_text_blocks)
