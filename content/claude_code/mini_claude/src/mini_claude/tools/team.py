"""10.7 — N 명의 팀원을 *같은 프로세스* 에서 동시에 일하게 하는 도구.

8.4 의 ``TeamCreateTool`` 의 mini 단순화. 핵심 차이는 _AgentTool 과의 분리_:
- ``Agent`` (10.5): 1 명 *동기* spawn. lead 가 *await* 로 자식 끝까지 기다림.
- ``Team`` (10.7): N 명 *동시* spawn. ``asyncio.create_task`` 로 평행 실행 후
  ``coordinator.wait_all_idle()`` 로 _polling 없는 fan-in_.

진짜 코드 (8.4) 와의 압축:
- 디스크 jsonl mailbox → in-memory ``asyncio.Queue``
- 3 단계 게이트 → 항상 활성
- 팀 메모리 + secret guard → OUT (향후 확장)
- 13 개 컨텍스트 격리 슬라이더 → ``messages=[]`` + contextvars 한 줄
"""
from __future__ import annotations
import asyncio
from dataclasses import dataclass, field
from typing import Any
from pydantic import BaseModel, Field

from .base import Tool, ToolContext
from ..agents import AgentSpec
from ..messages import ConversationState
from ..teams import (
    MailboxMessage,
    TeammateIdentity,
    deliver,
    ensure_mailbox,
    get_coordinator,
    reset_identity,
    set_identity,
)


class TeamToolInput(BaseModel):
    team_name: str = Field(
        description=(
            "팀 식별자. ``agent@team`` 형식의 정체성에서 ``@team`` 부분이 됨. "
            "예: ``doc-review``."
        ),
    )
    assignments: dict[str, str] = Field(
        description=(
            "팀원별 할 일. 키는 ``.claude/agents/<name>/AGENT.md`` 의 이름, "
            "값은 그 팀원에게 줄 prompt. 모든 팀원이 *동시에* 일함."
        ),
    )


def _query_lazy():
    """순환 import 회피 — query 가 query 를 부르는 구조 (10.5 AgentTool 과 같은 트릭)."""
    from ..agent import query
    return query


TEAM_MEMBER_SYSTEM = """You are a teammate in a small focused team. Do your
assigned task and return a concise text summary. You can use your tools to
gather information and produce work. Keep your response self-contained — your
lead will read it after you finish."""


@dataclass
class TeamTool:
    """N 명의 팀원을 동시에 spawn — *parallel fan-out* + *polling 없는 fan-in*.

    8.4 의 ``TeamCreateTool`` 의 _개념 압축_. 진짜 코드는 ~1500 줄이지만 mini 는
    ~100 줄. 빠진 것: 디스크 mailbox watcher, 팀 메모리, secret guard, GrowthBook
    게이트, color 할당, plan mode 강제, OOM 캡 (``TEAMMATE_MESSAGES_UI_CAP=50``).
    남은 것: **격리 + 평행 spawn + idle fan-in** *셋만*.
    """

    name: str = "Team"
    description: str = (
        "N 명의 팀원을 같은 프로세스에서 동시에 일하게 합니다. 각 팀원은 "
        "``.claude/agents/<name>/AGENT.md`` 정의 그대로의 system prompt 와 도구 "
        "제한을 받고, 자기 ``agent@team`` 정체성을 contextvars 로 자동 격리합니다. "
        "모든 팀원이 끝나면 결과들을 합쳐 돌려줍니다."
    )
    input_model: type[BaseModel] = TeamToolInput

    parent_tools: list[Tool] = field(default_factory=list)
    permissions: Any = None
    user_agents: list[AgentSpec] = field(default_factory=list)
    lead_name: str = "lead"

    def __post_init__(self) -> None:
        """user_agents 가 있으면 description 에 팀원 메뉴 prepend.

        10.5 ``AgentTool.__post_init__`` 과 같은 패턴 — 모델이 *누가 팀원이 될 수
        있는지* description 한 번 읽고 알도록.
        """
        if not self.user_agents:
            return
        menu_lines = ["", "", "사용 가능한 팀원 (assignments 의 키로 지정):"]
        for spec in self.user_agents:
            line = f"- {spec.name}: {spec.description}"
            if spec.when_to_use:
                line += f" (트리거: {spec.when_to_use})"
            menu_lines.append(line)
        self.description = self.description + "\n".join(menu_lines)

    def is_read_only(self) -> bool:
        return False  # 팀원이 뭘 할지 모름 — fail-closed

    def is_destructive(self) -> bool:
        return False

    def permission_summary(self, args: dict[str, Any]) -> str:
        team_name = args.get("team_name", "?")
        assignments = args.get("assignments", {})
        names = ",".join(assignments.keys())
        return f"team={team_name} members=[{names}]"

    def _find_spec(self, agent_name: str) -> AgentSpec | None:
        """``agent_name`` 으로 user_agents 에서 spec 조회. 없으면 None (default 처리)."""
        for spec in self.user_agents:
            if spec.name == agent_name:
                return spec
        return None

    def _filter_tools(self, spec: AgentSpec | None) -> list[Tool]:
        """팀원 한 명에게 넘길 도구 풀. ``AgentTool._filter_tools`` 와 동일 정책 —
        spec 없으면 read-only + self 제외, spec 있으면 allowed/disallowed 적용.
        """
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
                continue  # 자기 자신 (팀이 팀 안에서 또 팀을 만드는 무한 재귀) 차단
            if tool.name in disallowed:
                continue
            if allowed is not None and tool.name not in allowed:
                continue
            result.append(tool)
        return result

    async def _run_member(
        self,
        identity: TeammateIdentity,
        spec: AgentSpec | None,
        prompt: str,
        child_tools: list[Tool],
        cwd: str,
    ) -> str:
        """팀원 한 명의 work cycle.

        *contextvar 설정* → child query → 마지막 assistant 텍스트 회수.
        ``set_identity()`` 를 ``asyncio.create_task`` 안에서 부르므로 _이 task 의
        contextvars copy 에만_ 설정 — 다른 팀원과 자동 격리.

        ``mark_idle`` 호출은 ``agent.py`` 의 Stop 자리에서 자동으로 일어남 — 여기서
        명시적으로 부르지 않는다. 다만 _예외가 나면_ Stop 자리에 안 닿을 수 있어
        finally 에서 한 번 더 보장.
        """
        token = set_identity(identity)
        coordinator = get_coordinator()
        last_text = ""
        try:
            child_state = ConversationState()
            system_prompt = spec.system_prompt if spec else TEAM_MEMBER_SYSTEM
            query = _query_lazy()
            async for _chunk in query(
                user_input=prompt,
                tools=child_tools,
                permissions=self.permissions,
                cwd=cwd,
                state=child_state,
                system_prompt=system_prompt,
            ):
                pass

            # 마지막 assistant 의 텍스트 블록을 회수 (AgentTool 과 같은 fallback)
            for msg in reversed(child_state.messages):
                if msg.get("role") != "assistant":
                    continue
                blocks = msg.get("content", [])
                texts = [
                    b.get("text", "") for b in blocks
                    if isinstance(b, dict) and b.get("type") == "text"
                ]
                if texts:
                    last_text = "\n".join(texts)
                    break
            return last_text or "(팀원이 텍스트 응답을 생성하지 못했다)"
        finally:
            # 정상 종료면 agent.py 의 Stop 자리에서 이미 호출됨 — idempotent
            coordinator.mark_idle(identity.agent_id, result=last_text or None)
            reset_identity(token)

    async def call(self, args: dict[str, Any], context: ToolContext) -> str:
        team_name = args["team_name"]
        assignments: dict[str, str] = args["assignments"]

        if not assignments:
            return "(팀원이 지정되지 않았다 — assignments 가 비어 있음)"

        lead_id = f"{self.lead_name}@{team_name}"
        ensure_mailbox(lead_id)

        coordinator = get_coordinator()
        coordinator.clear()  # 이 호출 한정 — 이전 팀의 잔여 상태 정리

        agent_ids: list[str] = []
        task_handles: list[tuple[str, asyncio.Task]] = []

        for member_name, prompt in assignments.items():
            spec = self._find_spec(member_name)
            identity = TeammateIdentity(
                agent_id=f"{member_name}@{team_name}",
                agent_name=member_name,
                team_name=team_name,
                is_lead=False,
            )
            ensure_mailbox(identity.agent_id)
            child_tools = self._filter_tools(spec)

            task = asyncio.create_task(
                self._run_member(identity, spec, prompt, child_tools, context.cwd),
                name=f"team:{identity.agent_id}",
            )
            coordinator.register(identity, task)
            agent_ids.append(identity.agent_id)
            task_handles.append((identity.agent_id, task))

        # ⭐ polling 없는 fan-in — 모든 팀원이 idle 될 때까지 한 줄로 대기
        await coordinator.wait_all_idle(agent_ids)

        # 각 task 의 반환값을 모아 합치기. 예외는 텍스트로 변환 — lead 가 읽도록.
        sections: list[str] = []
        for agent_id, task in task_handles:
            try:
                result = await task
            except Exception as e:
                result = f"(error: {type(e).__name__}: {e})"
            sections.append(f"=== {agent_id} ===\n{result}")

        # lead 메일박스에 도착한 idle 알림도 부록으로 — *어떤 순서로 끝났는지* 보여주기
        from ..teams import drain_mailbox  # 지연 import — 함수 내부에서만 필요
        lead_box = drain_mailbox(lead_id)
        if lead_box:
            notes = "\n".join(
                f"- [{m.kind}] {m.sender}: {m.text[:80]}"
                for m in lead_box
            )
            sections.append(f"=== mailbox (lead) ===\n{notes}")

        return "\n\n".join(sections)
