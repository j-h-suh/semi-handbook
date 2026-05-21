"""Hook 설정 파일 로드 + 이벤트·도구별 매칭.

설정 위치: ``~/.mini_claude/hooks.json``. 진짜 Claude Code 는 ``settings.json`` 의
``hooks`` 키지만 mini 는 전용 파일로 분리해서 단순화.

설정 포맷::

    {
      "hooks": {
        "PreToolUse": [
          {"matcher": "Bash", "command": "python ~/guard.py", "timeout": 10}
        ],
        "Stop": [
          {"command": "echo done >> ~/.mini_claude/log"}
        ]
      }
    }

``matcher`` 는 도구 이름 fnmatch 패턴 (``"*"`` = 모든 도구). PreToolUse / PostToolUse
에서만 의미. 다른 이벤트는 무조건 매칭.
"""
from __future__ import annotations
import fnmatch
import json
from dataclasses import dataclass
from pathlib import Path

from .events import HookEventName


@dataclass
class HookSpec:
    """Hook 한 개의 정의 — JSON 한 줄에 대응."""

    event: HookEventName
    matcher: str
    command: str
    timeout: float = 60.0


@dataclass
class HookRegistry:
    """모든 Hook spec 보관 + 이벤트·도구별 매칭."""

    specs: list[HookSpec]

    @classmethod
    def load(cls, path: Path) -> "HookRegistry":
        """파일 없으면 빈 registry (= Hook 비활성)."""
        if not path.exists():
            return cls(specs=[])

        data = json.loads(path.read_text(encoding="utf-8"))
        specs: list[HookSpec] = []
        for event_name, event_specs in data.get("hooks", {}).items():
            for spec_dict in event_specs:
                specs.append(
                    HookSpec(
                        event=event_name,  # type: ignore[arg-type]
                        matcher=spec_dict.get("matcher", "*"),
                        command=spec_dict["command"],
                        timeout=float(spec_dict.get("timeout", 60.0)),
                    )
                )
        return cls(specs=specs)

    def find_matching(
        self, event: HookEventName, tool_name: str | None = None
    ) -> list[HookSpec]:
        """매칭된 spec 들을 순서대로 반환 (mini 는 *첫 번째* 결과만 쓴다)."""
        matched: list[HookSpec] = []
        for spec in self.specs:
            if spec.event != event:
                continue
            if event in ("PreToolUse", "PostToolUse") and tool_name is not None:
                if not fnmatch.fnmatchcase(tool_name, spec.matcher):
                    continue
            matched.append(spec)
        return matched
