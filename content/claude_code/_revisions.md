# 핸드북 수정 사항 로그

> 목적: 대화 중 발견되는 핸드북/코드 수정 사항을 모아두는 작업 노트.
> 챕터가 아니므로 언더스코어 prefix. 반영 완료 항목은 하단 "반영 완료" 섹션으로 이동.

## 진행 규칙

- **큰 수정** (개념 재정리, 섹션 추가/이동): 로그 → 합의 → 반영
- **작은 수정** (오탈자, 용어 교체): 즉시 반영 + 로그에 한 줄만 기록
- 각 항목은 **현상 / 원인 / 코드 수정 / 핸드북 수정** 구조로 작성
- 상태 라벨: `[pending]` `[decision-needed]` `[in-progress]` `[done]`

---

## 9.1 설계 — 미니 에이전트의 골격

### [code-done / handbook-pending] pyproject.toml에 [build-system] 섹션 누락

- **현상**: `uv run mini-claude` 실행 실패 — `error: Failed to spawn: mini-claude / No such file or directory`
- **근본 원인**: `[build-system]`이 없으면 uv가 **프로젝트 본체를 설치하지 않음** (dependencies만 설치). 따라서 `[project.scripts]`에 선언된 entry point도 `.venv/bin/`에 생성되지 않음.
- **코드 수정**: `pyproject.toml`에 추가
  ```toml
  [build-system]
  requires = ["hatchling"]
  build-backend = "hatchling.build"
  ```
- **핸드북 수정**: 9.1 챕터에 최종 `pyproject.toml` 예시 포함 시 `[build-system]` 섹션 명시. "왜 필요한가"는 아래 [공통 개념] "패키지 설치란 무엇인가" 항목과 연결.

### [code-done / handbook-pending] `__init__.py` 파일 누락

- **대상 파일**: `src/mini_claude/__init__.py`, `src/mini_claude/tools/__init__.py`
- **현상**: 빌드 시 hatchling이 패키지를 찾지 못함. `main.py`의 `from .tools import default_tool_pool` 도 실패.
- **코드 수정**: 빈 `__init__.py` 두 개 추가 (또는 tools/__init__.py에는 `default_tool_pool` stub 포함)
- **핸드북 수정**: 9.1 디렉토리 도식에 상위 `mini_claude/__init__.py` 명시. 현재는 `tools/__init__.py`만 언급되어 있음.

### [code-done / handbook-pending] `tools/__init__.py`의 `default_tool_pool` 처리 방침

- **현상**: `main.py`가 `from .tools import default_tool_pool`을 import하지만 9.1 스캐폴드 단계에는 구현이 없음.
- **실제 확인 (2026-04-21)**: 앞 두 항목 수정 후 `uv run mini-claude --help` 시도 → 예상대로 `ImportError: cannot import name 'default_tool_pool'` 발생.
- **코드 조치**: `tools/__init__.py`에 stub 적용 — `def default_tool_pool() -> list[Tool]: return []`. 이후 `--help` 정상 출력 확인.
- **핸드북 수정**: 9.1 챕터의 `tools/__init__.py` 예시에 `default_tool_pool` stub 포함 필요. `main.py`가 이 심볼을 import하므로 스캐폴드 단계에서도 존재해야 실행 가능. 실제 도구 등록 로직은 9.3 (도구 시스템)에서 채움.
  ```python
  # src/mini_claude/tools/__init__.py
  from __future__ import annotations
  from .base import Tool

  def default_tool_pool() -> list[Tool]:
      return []
  ```

### [code-done / handbook-pending] `main.py` 에러 메시지 친절화

- **현상**: 기존 메시지 `"ANTHROPIC_API_KEY 환경 변수가 필요해."`는 원인만 알려주고 해결 방법이 없어서 독자가 첫 실행에서 막힘.
- **코드 조치** (2026-04-21): `main.py`의 SystemExit 메시지에 `export ANTHROPIC_API_KEY=...` 안내 한 줄 추가.
  ```python
  if "ANTHROPIC_API_KEY" not in os.environ:
      raise SystemExit(
          "ANTHROPIC_API_KEY가 설정되지 않았어.\n"
          "  export ANTHROPIC_API_KEY=sk-ant-... 후 다시 실행."
      )
  ```
- **핸드북 수정**: 9.1 챕터의 `main.py` 예시 코드를 위 버전으로 갱신.

### [code-done / handbook-pending] `agent.py`의 `query()`가 async generator로 인식되지 않음

- **현상**: API 키 설정 후 대화 시도 시 `TypeError: 'async for' requires an object with __aiter__ method, got coroutine`. 의도했던 `NotImplementedError("9.2에서 구현")` 에 도달하기 전에 실패.
- **원인**: `async def query(...) -> AsyncGenerator[str, None]:` 는 **타입 힌트만으로는 async generator가 되지 않음**. 함수 본문에 `yield`가 최소 하나 있어야 Python이 async generator로 인식. 기존 stub은 `raise NotImplementedError`만 있어서 coroutine으로 취급됨.
- **코드 조치** (2026-04-21): stub에 unreachable `yield` 한 줄 추가 → 의도대로 `NotImplementedError` 발생 확인.
  ```python
  raise NotImplementedError("9.2에서 구현")
  yield  # async generator로 인식시키기 위한 unreachable yield
  ```
- **핸드북 수정**: 9.1 챕터의 `agent.py` stub 예시에 이 `yield` 라인 포함. 간단한 설명 ("stub이라도 `yield`가 있어야 `async for`에 쓸 수 있는 async generator가 된다") 추가 고려.

---

## 9.2 핵심 루프

### [handbook-pending] "첫 실행" 단락 추가 (API 키 설정 안내)

- **현상**: 9.2 챕터는 "안녕"이라는 입력으로 대화 예시를 시작하지만, 실제 `uv run mini-claude` 실행 시 `ANTHROPIC_API_KEY` 미설정으로 SystemExit → 독자가 첫 실행에서 막힘.
- **결정**: 9.1은 정적 설계, 9.2는 첫 실행 챕터이므로 **9.2에서 다루는 것이 흐름상 자연스러움**.
- **핸드북 수정**: "안녕" 입력 예시 **직전에** "API 키 설정 후 실행" 단락 추가.
  - 환경 변수 설정 (`export ANTHROPIC_API_KEY=sk-ant-...`)
  - 실행 명령 (`uv run mini-claude`)
  - 첫 프롬프트 예시 (`> 안녕`)
- **비채택 대안**:
  - 9.1에서 처리 → 설계 주제에서 이탈
  - `.env` 파일 지원 → 의존성 증가, 스캐폴드 미니멀리즘 훼손
  - 별도 "환경 준비" 섹션 → 흐름 단절

---

## 반영 완료

(아직 없음)
