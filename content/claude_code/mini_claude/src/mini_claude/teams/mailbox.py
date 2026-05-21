"""팀원별 격리된 메일박스 — 10.6 ``message_queue`` 의 _격리된 응용_.

10.6 은 *모듈 싱글턴 큐* 한 벌 — 9.5 의 서브에이전트가 push 하면 부모도 본다.
10.6 본문이 명시적으로 이 한계를 _10.7 에서 해결될 자리_ 라고 적었다.

여기서는 *팀원별 ``asyncio.Queue`` 인스턴스* 의 dict — agent_id → Queue.
- ``put()`` 은 즉시 깨움; ``await get()`` 은 polling 없음.
- 8.4 의 디스크 jsonl mailbox 는 OUT — *같은 프로세스 안의 N 팀원* 만 다룬다.

진짜 코드는 디스크 ``~/.claude/teams/<team>/<name>.jsonl`` 에 append-only —
out-of-process 팀원과 in-process 팀원이 _같은 매체_ 로 통신할 수 있도록. mini 는
*in-process 만* 다루므로 메모리 큐로 충분.
"""
from __future__ import annotations
import asyncio
from dataclasses import dataclass, field


@dataclass
class MailboxMessage:
    """메일박스 한 항목.

    Attributes:
        sender: 보낸 팀원의 agent_name. ``"system"`` 이면 idle 알림 등 시스템 메시지.
        text: 본문. JSON 직렬화된 dict 일 수도, 그냥 텍스트일 수도.
        kind: ``"idle"`` (팀원이 idle 됐다는 신호) | ``"dm"`` (peer-to-peer 메시지).
    """

    sender: str
    text: str
    kind: str = "dm"


@dataclass
class _MailboxState:
    """팀원 한 명의 메일박스. ``asyncio.Queue`` 는 lazy 생성 — 이벤트 루프 안에서만 만들 수 있음."""

    queue: asyncio.Queue[MailboxMessage] | None = None
    history: list[MailboxMessage] = field(default_factory=list)

    def ensure_queue(self) -> asyncio.Queue[MailboxMessage]:
        """이벤트 루프 안에서 처음 호출되면 큐 생성."""
        if self.queue is None:
            self.queue = asyncio.Queue()
        return self.queue


# 모듈 싱글턴 — agent_id 키, _MailboxState 값.
# *team_name* 차원은 agent_id 가 이미 ``name@team`` 형식이라 자연 격리.
_mailboxes: dict[str, _MailboxState] = {}


def ensure_mailbox(agent_id: str) -> None:
    """팀원 메일박스 등록. 이미 있으면 무시."""
    if agent_id not in _mailboxes:
        _mailboxes[agent_id] = _MailboxState()


async def deliver(recipient_id: str, message: MailboxMessage) -> None:
    """``recipient_id`` 의 메일박스에 메시지 push.

    *polling 없는 깨움*: 받는 쪽이 ``await receive()`` 하고 있으면 즉시 깨어남.
    아직 없으면 큐에 쌓여 있다가 다음 ``receive()`` 가 가져간다.
    """
    state = _mailboxes.setdefault(recipient_id, _MailboxState())
    queue = state.ensure_queue()
    state.history.append(message)
    await queue.put(message)


async def receive(recipient_id: str) -> MailboxMessage:
    """``recipient_id`` 의 메일박스에서 한 항목을 *기다림*.

    *polling 없음* — ``asyncio.Queue.get()`` 이 ``put()`` 시 자동 깨움.
    같은 ``agent_id`` 의 ``deliver()`` / ``receive()`` 가 짝지어 작동.
    """
    state = _mailboxes.setdefault(recipient_id, _MailboxState())
    queue = state.ensure_queue()
    return await queue.get()


def drain(recipient_id: str) -> list[MailboxMessage]:
    """*non-blocking* — 현재 쌓인 모든 항목을 한 번에 꺼냄. 비어 있으면 빈 리스트.

    lead 가 ``wait_all_idle()`` 후 _쌓인 알림을 한꺼번에 검토_ 할 때 쓴다.
    """
    state = _mailboxes.get(recipient_id)
    if state is None or state.queue is None:
        return []
    items: list[MailboxMessage] = []
    while not state.queue.empty():
        try:
            items.append(state.queue.get_nowait())
        except asyncio.QueueEmpty:
            break
    return items


def history(recipient_id: str) -> list[MailboxMessage]:
    """``recipient_id`` 의 *전체 수신 기록* — drain 후에도 남아 있다. 디버깅·UI 용."""
    state = _mailboxes.get(recipient_id)
    return list(state.history) if state else []


def clear_all() -> None:
    """모든 메일박스 비움 — 테스트/세션 리셋용."""
    _mailboxes.clear()
