"""에이전트 팀 — in-process 메일박스로 협력하는 동등한 팀원들.

Part 8.4 의 회수 — 10.4 (Hook), 10.5 (사용자 정의 에이전트), 10.6 (메시지 큐)
*세 토대 위에 얹은 완성*. 핵심 구성요소:

1. ``identity`` — ``TeammateIdentity`` + ``ContextVar``. Node 의 ``AsyncLocalStorage``
   에 해당하는 Python ``contextvars`` 로 *async 트리를 따라 자동 격리*.
2. ``mailbox`` — 팀원별 ``asyncio.Queue`` 인스턴스. 10.6 ``message_queue`` 의
   *격리된 응용*. ``put``/``await get()`` 으로 polling 없음.
3. ``coordinator`` — ``TeamCoordinator``. ``mark_idle`` + ``wait_all_idle()`` 로
   _이벤트 기반 fan-in_.

OUT — mini 가 가져오지 않은 것:
- 3 단계 게이트 (GrowthBook) — mini 는 항상 활성
- 공유 팀 메모리 + secret guard — 별도 챕터급 작업
- 디스크 mailbox jsonl — mini 는 in-process 만 (asyncio.Queue 로 충분)

10.7 의 진입점: ``tools/team.py`` 의 ``TeamTool`` 이 lead 가 명시적으로 호출.
"""
from __future__ import annotations

from .coordinator import TeamCoordinator, TeammateTaskState, get_coordinator
from .identity import (
    TeammateIdentity,
    get_identity,
    is_lead,
    reset_identity,
    set_identity,
)
from .mailbox import (
    MailboxMessage,
    clear_all as clear_mailboxes,
    deliver,
    drain as drain_mailbox,
    ensure_mailbox,
    history as mailbox_history,
    receive,
)


__all__ = [
    # identity
    "TeammateIdentity",
    "get_identity",
    "is_lead",
    "set_identity",
    "reset_identity",
    # mailbox
    "MailboxMessage",
    "deliver",
    "receive",
    "drain_mailbox",
    "ensure_mailbox",
    "mailbox_history",
    "clear_mailboxes",
    # coordinator
    "TeamCoordinator",
    "TeammateTaskState",
    "get_coordinator",
]
