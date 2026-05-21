"""팀원 추적 + polling 없는 fan-in.

8.4 본문의 ``waitForTeammatesToBecomeIdle()`` 의 Python 등가:
- ``onIdleCallbacks`` 배열 → 콜백 리스트
- *등록 직전 isIdle 재체크* — race 처리. 이걸 안 하면 _이미 끝난 팀원_ 에 등록된
  콜백이 영원히 안 불려서 deadlock.

``TeamCoordinator`` 는 *모듈 싱글턴*. 10.6 ``message_queue`` 와 같은 패턴 —
프로세스 안의 어디서든 ``coordinator.mark_idle(...)`` 호출 가능.
"""
from __future__ import annotations
import asyncio
from dataclasses import dataclass, field
from typing import Callable

from .identity import TeammateIdentity


@dataclass
class TeammateTaskState:
    """팀원 한 명의 *실행 상태*. idle 콜백 리스트가 핵심.

    Attributes:
        identity: 팀원 신원.
        task: ``asyncio.Task`` 객체. ``wait_all_idle()`` 후 ``await task`` 로 결과 회수.
        is_idle: 현재 idle 상태인지. ``mark_idle()`` 이 True 로 바꿈.
        on_idle_callbacks: idle 이 됐을 때 호출될 콜백들. *fire-once* (호출 후 비움).
        result: 팀원이 반환한 최종 텍스트. ``mark_idle(result=...)`` 으로 설정.
    """

    identity: TeammateIdentity
    task: asyncio.Task | None = None
    is_idle: bool = False
    on_idle_callbacks: list[Callable[[], None]] = field(default_factory=list)
    result: str | None = None


class TeamCoordinator:
    """팀원 추적 + lead 의 idle 대기 — *모듈 싱글턴 사용 가정*.

    8.4 의 ``TeamCoordinator`` 와 같은 형. 다만 mini 는 디스크 mailbox 가 없어서
    *콜백 + ``asyncio.Event``* 만으로 fan-in.
    """

    def __init__(self) -> None:
        self.tasks: dict[str, TeammateTaskState] = {}

    def register(self, identity: TeammateIdentity, task: asyncio.Task) -> None:
        """팀원 task 등록. ``spawn()`` 직후 호출."""
        self.tasks[identity.agent_id] = TeammateTaskState(
            identity=identity,
            task=task,
        )

    def mark_idle(self, agent_id: str, result: str | None = None) -> None:
        """팀원이 idle 상태가 됐을 때 — 등록된 콜백들 *fire-once*.

        진짜 코드 (8.4) 에서는 Stop 훅이 mailbox 에 push 하고 lead 가 그걸 받아서
        부르지만, mini 는 _같은 프로세스_ 라 직접 호출. lead 의 query() 의 Stop
        자리에서 ``identity = get_identity()`` → not lead 면 이걸 호출.
        """
        state = self.tasks.get(agent_id)
        if not state or state.is_idle:
            return
        state.is_idle = True
        if result is not None:
            state.result = result
        # 콜백 호출 — *이벤트 기반 fan-in*. 호출 후 비워서 *fire-once* 보장
        for cb in state.on_idle_callbacks:
            cb()
        state.on_idle_callbacks.clear()

    async def wait_all_idle(self, agent_ids: list[str] | None = None) -> None:
        """주어진 팀원들이 모두 idle 될 때까지 *polling 없이* 대기.

        ``agent_ids=None`` 이면 등록된 모든 팀원. *race 처리* — 콜백 등록 시점에
        이미 idle 이면 즉시 호출 — 이걸 안 하면 _이미 끝난 팀원_ 에 등록된
        콜백이 영원히 안 불려서 deadlock.
        """
        if agent_ids is None:
            agent_ids = list(self.tasks.keys())

        working = [
            self.tasks[a] for a in agent_ids
            if a in self.tasks and not self.tasks[a].is_idle
        ]
        if not working:
            return  # 모두 이미 idle

        event = asyncio.Event()
        remaining = len(working)

        def on_idle() -> None:
            nonlocal remaining
            remaining -= 1
            if remaining == 0:
                event.set()

        for state in working:
            if state.is_idle:
                # race: 콜백 등록 직전에 이미 idle 됐다면 즉시 호출
                on_idle()
            else:
                state.on_idle_callbacks.append(on_idle)

        await event.wait()

    def get_results(self, agent_ids: list[str] | None = None) -> dict[str, str | None]:
        """팀원들의 최종 결과를 ``{agent_id: result_text}`` 로 회수.

        ``wait_all_idle()`` 후 호출하는 게 정석. 결과가 없으면 None.
        """
        if agent_ids is None:
            agent_ids = list(self.tasks.keys())
        return {
            a: self.tasks[a].result
            for a in agent_ids if a in self.tasks
        }

    def clear(self) -> None:
        """모든 task state 비움 — 테스트/세션 리셋용."""
        self.tasks.clear()


# 모듈 싱글턴 — 10.6 message_queue 와 같은 패턴
_coordinator: TeamCoordinator = TeamCoordinator()


def get_coordinator() -> TeamCoordinator:
    """프로세스 전역 ``TeamCoordinator`` 인스턴스. 모듈 어디서든 호출 가능."""
    return _coordinator
