"""``AGENT.md`` 로더 + 디렉토리 walking.

발견 순서: 프로젝트 ``./.claude/agents/`` → 홈 ``~/.claude/agents/``.
같은 이름이면 *프로젝트 우선*. 10.1 의 슬래시 명령 walking 과 같은 정신.

frontmatter 파서는 *최소한* — ``key: value`` 한 줄 + ``- item`` 리스트만.
PyYAML 의존성을 피하려고 직접 작성.
"""
from __future__ import annotations
from pathlib import Path

from .spec import AgentSpec


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """``---`` 블록 추출. 미지원 케이스 (멀티라인 ``|``, 중첩 등) 는 무시."""
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---\n", 4)
    if end < 0:
        return {}, text

    fm_text = text[4:end]
    body = text[end + 5:]

    fm: dict[str, object] = {}
    current_list_key: str | None = None
    for raw_line in fm_text.split("\n"):
        line = raw_line.rstrip()

        # 리스트 항목 (``- item``) — current_list_key 가 있으면 그 키에 누적
        if current_list_key and line.lstrip().startswith("- "):
            fm.setdefault(current_list_key, []).append(  # type: ignore[union-attr]
                line.lstrip()[2:].strip().strip('"').strip("'")
            )
            continue
        # 빈 줄이나 들여쓰기 없는 줄이 오면 리스트 끝
        if not line or not line[0].isspace():
            current_list_key = None

        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()

        if not value:
            # 다음 줄들이 리스트로 이어진다고 가정
            current_list_key = key
            continue
        fm[key] = value.strip('"').strip("'")
    return fm, body


def _normalize_list(value: object) -> list[str]:
    """frontmatter 값을 도구 이름 리스트로 정규화. ``"Read, Bash(grep:*)"`` 도 OK."""
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    if isinstance(value, str) and value:
        return [t.strip() for t in value.split(",") if t.strip()]
    return []


def load_agent(agent_dir: Path) -> AgentSpec | None:
    """디렉토리 안 ``AGENT.md`` 한 파일을 spec 으로 변환. 없으면 None."""
    md_path = agent_dir / "AGENT.md"
    if not md_path.exists():
        return None

    text = md_path.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(text)

    name = str(fm.get("name") or agent_dir.name)
    return AgentSpec(
        name=name,
        description=str(fm.get("description", "")),
        when_to_use=str(fm.get("when_to_use", "")),
        system_prompt=body.strip(),
        allowed_tools=_normalize_list(fm.get("allowed-tools", [])),
        disallowed_tools=_normalize_list(fm.get("disallowed-tools", [])),
    )


def discover_agents(cwd: Path) -> list[AgentSpec]:
    """프로젝트 → 홈 순서로 ``.claude/agents/`` 발견. 같은 이름이면 프로젝트 우선."""
    agents: list[AgentSpec] = []
    seen: set[str] = set()

    for base in (cwd / ".claude" / "agents", Path.home() / ".claude" / "agents"):
        if not base.exists():
            continue
        for entry in sorted(base.iterdir()):
            if not entry.is_dir():
                continue
            spec = load_agent(entry)
            if spec and spec.name not in seen:
                agents.append(spec)
                seen.add(spec.name)
    return agents
