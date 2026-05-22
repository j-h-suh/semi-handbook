"""메시지 큐 — query() 가 매 iteration 에서 확인하는 외부 입력 채널.

2.2 의 Deep Dive 에서 본 ``messageQueueManager.ts:53`` 의 *모듈 싱글턴 큐* 의
mini 버전. 진짜 코드는 4 입력자 (사용자 / task 완료 / 프로액티브 / 고아 퍼미션)
+ 3 우선순위 (now / next / later). 미니는 *우선순위 없이 순서대로* 처리.

향후 확장의 공통 인프라:
- 10.8 에이전트 팀: 팀원의 idle 알림이 이 큐의 한 인스턴스 (메일박스)
- 백그라운드 task: 완료 통지가 큐에 push → 다음 LLM 호출에 attachment
- 프로액티브: 외부 트리거 (크론·webhook) 가 push 하는 자리
- 인터럽트: 사용자가 도구 실행 중 새 입력 추가
"""
from __future__ import annotations
from collections import deque
from dataclasses import dataclass


@dataclass
class QueueItem:
    """큐 한 항목.

    Attributes:
        content: 다음 LLM 호출에 *텍스트 블록* 으로 들어갈 내용.
        source: 디버깅/로깅용 표지 — ``"background_task"``, ``"proactive_tick"``,
          ``"teammate_idle"`` 등.
    """

    content: str
    source: str = "unknown"


# ── 모듈 싱글턴 — 진짜 코드의 messageQueueManager 와 같은 정신 ─────
_queue: deque[QueueItem] = deque()


def push(content: str, source: str = "unknown") -> None:
    """큐에 항목 추가. 모듈 어디서든 호출 가능."""
    _queue.append(QueueItem(content=content, source=source))


def drain() -> list[QueueItem]:
    """큐 전체를 한 번에 빼낸다 (순서 유지). 다음 LLM 호출 *직전* 에 호출되는 자리.

    *우선순위 없음* — 모두 ``next`` 로 취급. 진짜 코드의 ``now`` (현재 도구 abort)
    와 ``later`` (턴 끝) 는 mini OUT.
    """
    items = list(_queue)
    _queue.clear()
    return items


def size() -> int:
    """큐에 쌓인 항목 수 (테스트·디버깅용)."""
    return len(_queue)


def clear() -> None:
    """큐 전체 비움 (테스트·세션 리셋용)."""
    _queue.clear()
