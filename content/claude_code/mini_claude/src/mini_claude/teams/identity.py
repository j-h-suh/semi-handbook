"""팀원의 정체성 — Node 의 ``AsyncLocalStorage`` 에 해당하는 Python ``contextvars``.

8.4 의 핵심 디자인: 같은 프로세스 안에서 N 명의 팀원이 *동시* 에 일할 때,
각자의 ``agent@team`` 정체성이 _async 호출 트리를 따라 자동으로_ 따라간다.
모듈 전역 변수를 쓰면 race condition. ``ContextVar`` 는 *비동기판 thread-local*.

PEP 567 (2018) 의 ``contextvars`` 는 Node 의 ``AsyncLocalStorage`` 와 _같은 디자인_.
- 모듈은 한 벌, 실행 컨텍스트는 N 벌
- ``asyncio.create_task`` 가 부모 컨텍스트를 *copy* 해서 자식에 전달
- 자식이 ``set()`` 하면 *자식 트리에만* 보임 — 부모는 영향 없음

10.7 에서는 ``TeammateIdentity`` 한 객체가 _팀원 한 명의 신원_ 을 들고 다닌다.
"""
from __future__ import annotations
from contextvars import ContextVar
from dataclasses import dataclass


@dataclass(frozen=True)
class TeammateIdentity:
    """팀원 한 명의 신원. ``ContextVar`` 에 담겨 async 트리를 따라간다.

    Attributes:
        agent_id: ``"researcher@my-team"`` 형식 — Slack/Discord 핸들 컨벤션.
        agent_name: ``"researcher"`` (팀 내 이름).
        team_name: ``"my-team"`` (팀 식별자).
        is_lead: 팀 lead 여부. lead 는 *수신 허브* — 자기 자신한테는 idle 알림 안 보냄.
    """

    agent_id: str
    agent_name: str
    team_name: str
    is_lead: bool = False


# 비동기 작업별 격리된 변수 — Node 의 AsyncLocalStorage 와 같은 디자인.
# default=None 이면 *팀 컨텍스트 밖* (단독 실행 또는 lead 의 메인 루프).
_identity: ContextVar[TeammateIdentity | None] = ContextVar(
    "teammate_identity", default=None,
)


def get_identity() -> TeammateIdentity | None:
    """현재 async 컨텍스트의 팀원 신원. 팀 밖이면 None.

    *모듈 어디서든 호출 가능* — query() 의 Stop 자리, 도구 호출 자리,
    어디서 불려도 _자기 컨텍스트의 신원_ 을 돌려준다.
    """
    return _identity.get()


def is_lead() -> bool:
    """현재 컨텍스트가 팀 lead 인지. 팀 밖이면 False."""
    identity = _identity.get()
    return identity.is_lead if identity else False


def set_identity(identity: TeammateIdentity) -> object:
    """팀원 신원 설정. 반환된 토큰은 ``reset()`` 에 넘기면 _이전 값_ 복원.

    *trap*: try/finally 로 reset 안 하면 _현재 컨텍스트_ 에 남는다. 보통은
    ``asyncio.create_task`` 안에서 호출되므로 자동 격리되지만, 같은 task 안에서
    여러 번 호출할 때는 명시적 reset 필요. ``run_with_identity()`` 사용 권장.
    """
    return _identity.set(identity)


def reset_identity(token: object) -> None:
    """``set_identity()`` 로 받은 토큰을 다시 들이밀어 이전 값 복원."""
    _identity.reset(token)  # type: ignore[arg-type]
