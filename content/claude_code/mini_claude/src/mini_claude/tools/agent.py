from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any
from pydantic import BaseModel, Field
from .base import Tool, ToolContext
from ..agents import AgentSpec
from ..messages import ConversationState


class AgentToolInput(BaseModel):
    subagent_type: str = Field(
        default="default",
        description=(
            "에이전트 종류. `.claude/agents/<name>/AGENT.md` 에 정의된 이름. "
            "비워두거나 'default' 를 주면 기본 read-only 서브에이전트."
        ),
    )
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

    10.5 에서 ``user_agents`` 필드가 추가됐다. ``.claude/agents/<name>/AGENT.md``
    한 파일이 새 에이전트를 만든다 — 코드 한 줄 없이.
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
    # 10.5 — ``.claude/agents/`` 에서 로드된 사용자 정의 에이전트들
    user_agents: list[AgentSpec] = field(default_factory=list)

    def __post_init__(self) -> None:
        """user_agents 가 있으면 description 에 *메뉴* 를 prepend.

        8.1 의 *attachment 패턴* 의 단순화 — 진짜 코드는 메뉴를 메시지 슬롯의
        attachment 에 넣지만 (캐시 hit 유지), 미니는 description 에 그냥 박는다.
        """
        if not self.user_agents:
            return
        menu_lines = ["", "", "사용 가능한 에이전트 (subagent_type 값으로 지정):"]
        for spec in self.user_agents:
            line = f"- {spec.name}: {spec.description}"
            if spec.when_to_use:
                line += f" (트리거: {spec.when_to_use})"
            menu_lines.append(line)
        self.description = self.description + "\n".join(menu_lines)

    def is_read_only(self) -> bool:
        return False  # 자식이 뭘 할지 모르므로 fail-closed

    def is_destructive(self) -> bool:
        return False

    def permission_summary(self, args: dict[str, Any]) -> str:
        sub = args.get("subagent_type", "default")
        prompt = args.get("prompt", "")[:60]
        return f"{sub}:{prompt}" if sub != "default" else prompt

    def _find_spec(self, subagent_type: str) -> AgentSpec | None:
        """``subagent_type`` 으로 user_agents 에서 spec 조회."""
        for spec in self.user_agents:
            if spec.name == subagent_type:
                return spec
        return None

    def _filter_tools(self, spec: AgentSpec | None) -> list[Tool]:
        """자식에게 넘길 도구 풀. spec 이 있으면 allowed/disallowed 적용,
        없으면 *읽기 전용 + Agent 자기 제외* 의 기본 정책."""
        if spec is None:
            return [
                t for t in self.parent_tools
                if t.is_read_only() and t.name != self.name
            ]

        disallowed = set(spec.disallowed_tools)
        allowed = set(spec.allowed_tools) if spec.allowed_tools else None

        result: list[Tool] = []
        for tool in self.parent_tools:
            if tool.name == self.name:
                continue                                    # 무한 재귀 방지
            if tool.name in disallowed:
                continue                                    # 명시적 차단
            if allowed is not None and tool.name not in allowed:
                continue                                    # 화이트리스트
            result.append(tool)
        return result

    async def call(self, args: dict[str, Any], context: ToolContext) -> str:
        prompt = args["prompt"]
        subagent_type = args.get("subagent_type", "default")

        # ── ① user agent spec 조회 (없으면 기본) ──
        spec = self._find_spec(subagent_type) if subagent_type != "default" else None

        # ── ② 격리: *새 conversation state*. 13 개 override 의 압축 ──
        child_state = ConversationState()

        # ── ③ 도구 필터링 — user agent 면 allowed/disallowed, 아니면 read-only 기본 ──
        child_tools = self._filter_tools(spec)

        # ── ④ 시스템 프롬프트 — user agent 면 AGENT.md 본문, 아니면 기본 ──
        system_prompt = spec.system_prompt if spec else SUB_AGENT_SYSTEM

        # ── ⑤ ⭐ 재귀 — query() 가 query() 를 부른다 ──
        # runAgent.ts:748 의 정수.
        query = _query_lazy()
        async for chunk in query(
            user_input=prompt,
            tools=child_tools,
            permissions=self.permissions,  # 부모와 공유
            cwd=context.cwd,
            state=child_state,             # ⭐ 격리된 새 그릇
            system_prompt=system_prompt,
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
