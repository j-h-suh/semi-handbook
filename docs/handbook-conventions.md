# 핸드북 표기 규칙

> 이 문서는 핸드북 콘텐츠의 세부 표기 규칙을 모은 곳이다. 챕터 구조·톤 같은 상위 가이드는 `/CLAUDE.md` 의 "핸드북 콘텐츠 작성 스타일 가이드" 섹션을 참조.

## 1. 인라인 코드 (`backtick`) 사용 규칙

### 원칙

**그대로 에디터/터미널에 입력했을 때 의미가 통하는 문자열** 만 백틱으로 감싼다. 그 외(개념·제품명·자연어)는 평문.

> 한 줄로: **"코드로 타이핑할 수 있는 것"** 만 백틱.

### ✅ 인라인 코드로 표시 (`backtick`)

| 카테고리 | 예시 |
|----------|------|
| 함수/메서드 | `init()`, `gather()`, `asyncio.run()` |
| 변수/속성 | `mdm_task`, `userOverride`, `chapter.title` |
| 언어 키워드/구문 | `async def`, `await`, `import`, `if __name__` |
| 타입/클래스 (코드 식별자) | `MessageType`, `asyncio.Task`, `FastAPI()` |
| 모듈/패키지 (import 대상) | `asyncio`, `numpy`, `@shikijs/transformers` |
| 파일/디렉토리 경로 | `main.tsx`, `src/lib/markdown.ts`, `~/.claude/` |
| CLI 명령/플래그 | `claude --version`, `npm run dev`, `/commit` |
| 설정 키/값 | `allowedTools`, `tracking-tight`, `NODE_ENV=production` |
| HTTP/API 엔드포인트 | `POST /v1/messages`, `text/event-stream` |

### ❌ 평문으로 표시 (백틱 없음)

| 카테고리 | 예시 |
|----------|------|
| 개념/추상 명사 | 에이전트 루프, 스트리밍, 권한 체크, 백프레셔 |
| 제품/플랫폼 이름 (일반 언급) | Claude Code, Bun, TypeScript, Python (언어 자체) |
| 자연어 인용 | "잘 만들어졌네" |
| 약어 한국어 풀이 | 만남점(rendezvous), 메모이제이션(memoization) |

### ⚠️ 헷갈리는 경계 케이스

| 표현 | 권장 |
|------|------|
| Python 을 쓴다 (언어 자체) | 평문 |
| `python main.py` (CLI 명령) | 백틱 |
| FastAPI 는 빠르다 (제품 언급) | 평문 |
| `from fastapi import FastAPI` (import 문) | 백틱 |
| `FastAPI()` (생성자 호출) | 백틱 |
| Anthropic API 를 호출 (개념) | 평문 |
| `anthropic.beta.messages.create()` (실제 호출) | 백틱 |

### 용어 도입 형식과의 관계

새 용어를 처음 도입할 때는 **`**한국어(영어)**` + 한 줄 정의** 형식 (CLAUDE.md 의 "용어 도입" 절). 이건 백틱이 아니라 굵게 처리. 백틱은 "코드 식별자" 용, 굵게는 "처음 도입한 용어" 용으로 명확히 분리.

```markdown
**메모이제이션(memoization)** 은 같은 인자로 여러 번 불려도 실제 계산은 첫 호출에만
하는 기법이다. lodash 의 `memoize()` 가 그 구현이다.
```

위 예시에서:
- **메모이제이션(memoization)** — 굵게 (개념 도입)
- `memoize()` — 백틱 (실제 함수 호출)
