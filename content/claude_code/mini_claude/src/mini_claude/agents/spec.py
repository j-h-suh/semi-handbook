"""사용자 정의 에이전트의 spec — ``AGENT.md`` frontmatter 의 파싱 결과."""
from __future__ import annotations
from dataclasses import dataclass, field


@dataclass
class AgentSpec:
    """``.claude/agents/<name>/AGENT.md`` 한 파일이 만들어내는 에이전트 정의.

    8.1 의 ``runAgent`` 가 시스템 프롬프트·도구 필터를 *코드* 로 받았다면,
    여기서는 *마크다운* 으로 받는다. 사용자가 새 에이전트를 만들 때 코드는
    한 줄도 안 쓴다.
    """

    name: str                          # 디렉토리 이름 (또는 frontmatter name)
    description: str                   # 모델이 보는 한 줄 (도구 menu 에 노출)
    when_to_use: str = ""              # 자연어 발동 트리거 (10.2 스킬과 같은 정신)
    system_prompt: str = ""            # AGENT.md 본문 — 자식의 시스템 프롬프트가 됨
    allowed_tools: list[str] = field(default_factory=list)   # 도구 이름 / 패턴
    disallowed_tools: list[str] = field(default_factory=list)  # 명시적 차단
