# 9.0 학습자 환경 설정 — Vertex 첫 호출까지의 최소 셋업

Anthropic API 키 없이 미니 클로드를 GCP Vertex AI 의 Claude 모델로 실행하려면 _Service Account JSON 키_ 한 개와 환경변수 네 개만 있으면 됩니다.

## 왜 Vertex 의 Claude 인가 — 큰 그림

LLM API 는 _공급자_ (Anthropic / GCP / AWS / Azure / OpenAI / Google) 와 _인터페이스 모양_ (Anthropic / OpenAI / Google 세 가족) 두 레이어가 따로 움직입니다. 미니 클로드는 _GCP Vertex AI 의 Claude 모델_ — _공급자는 Google Cloud_, _인터페이스는 Anthropic 가족_ — 을 _기본_ 으로 씁니다. 학습자가 _Anthropic 직접 API 키_ 없이도 _GCP project + Service Account JSON_ 만 있으면 시작 가능하기 때문.

> 💡 **다른 옵션의 전체 매트릭스** (Bedrock / Azure Foundry / vLLM 자체 호스팅 / Gemini / OpenAI 직접 등) 와 _3 인터페이스 가족 비교_ 는 [§10.5 §0 "LLM API 가족 — 한 장 정리"](/claude/10_5_API_클라이언트) 참조. 이번 9.0 은 _미니 클로드의 기본 자리_ — Vertex 의 Claude — 셋업에 집중.

## 전제

학습자가 _이미 갖추고 있어야_ 하는 것은 **GCP 자격증명** 한 묶음뿐입니다:

- **GCP project** + 결제(billing) 활성화
- **Vertex AI API** 가 enable 된 project
- **Model Garden 에서 Claude 모델 opt-in** ([Vertex Model Garden](https://console.cloud.google.com/vertex-ai/model-garden) → Claude → Enable)
- **Service Account JSON 키** — 팀에서 받았거나, GCP Console 의 IAM → Service Accounts 에서 발급
- 해당 SA 에 **`roles/aiplatform.user`** 역할 부여

> 위 전제가 안 갖춰져 있으면 _그것부터_ 해결하세요. project 부터 시작한다면 [GCP 공식 가이드 — Use Claude](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude) 의 _Before you begin_ 절을 따르면 됩니다.

_개발 환경 (Python / uv)_ 은 아래 §0 에서 처음부터 안내합니다.

---

## 0. 개발 환경 준비 — 빈 머신부터 시작하는 경우

이미 작업 디렉토리가 있고 `uv` 가 설치된 상태라면 §1 로 건너뛰어도 됩니다.

### 0-1. 필요한 도구 설치

| 도구 | 최소 버전 | 설치 (macOS / Linux) |
|---|---|---|
| Python | 3.12 | `brew install python@3.12` 또는 시스템 패키지 매니저 (`uv` 가 자동 관리 가능) |
| uv | 최신 | `curl -LsSf https://astral.sh/uv/install.sh \| sh` 또는 `brew install uv` |

> 💡 **Python 자체 설치가 부담스러우면 `uv` 만 깔아도 됩니다.** `uv sync` 가 `pyproject.toml` 의 `requires-python` 을 보고 _자동으로_ Python 3.12 를 download / pin 해줍니다 (`uv python install 3.12` 도 명시적으로 가능).

### 0-2. 작업 디렉토리 만들기 + uv 프로젝트 초기화

학습자 본인의 빈 디렉토리에서 `uv init` 으로 프로젝트 골격을 만듭니다:

```bash
mkdir -p ~/mini-claude
cd ~/mini-claude
uv init
```

이 디렉토리가 _이번 챕터 내내 작업 cwd_ 입니다. 이후의 `secrets/` / `.env` / `uv sync` 모두 여기 기준.

`uv init` 이 자동으로 만드는 파일은 여섯 개입니다:

| 파일 | 역할 | 9.1 에서 |
|---|---|---|
| `.git/` + `.gitignore` | git 초기화 + Python 표준 ignore (`.venv`, `__pycache__` 등) | `.gitignore` 에 두 줄 추가 (§1) |
| `pyproject.toml` | _빈 dependencies_ 의 프로젝트 manifest | _덮어쓰기_ — 4 의존성 + `[project.scripts]` + `[build-system]` 추가 |
| `main.py` | 빈 hello world | 사용 안 됨 (진짜 진입점은 `src/mini_claude/main.py`) |
| `README.md` | 빈 README | 학습자 자유 |
| `.python-version` | `requires-python` 의 Python 버전 pin | 그대로 유지 |

> 💡 **`uv init` 의 _뼈대_ 위에 _살을 붙이는_ 흐름**. 9.1 부터 디렉토리 구조 / `pyproject.toml` 내용 / Python 스캐폴드를 _하나씩_ 채워 갑니다 — `uv init` 이 준 빈 골격 일부 (`pyproject.toml`) 는 _덮어쓰기_, 나머지 (`src/mini_claude/agent.py`, `messages.py`, `tools/...`) 는 _새로 작성_, root `main.py` 는 _그대로 두거나 삭제_.

---

## 1. JSON 키 안전한 자리에 두기

작업 cwd 에 `secrets/` 폴더를 만들어 키를 옮깁니다 (HOME 이 아니라 프로젝트 내에 두는 이유는 _프로젝트와 키가 같이 묶이는_ 인지적 명확함):

```bash
mkdir -p secrets
mv ~/Downloads/your-sa-key.json secrets/
chmod 600 secrets/your-sa-key.json
```

`chmod 600` 으로 _파일 권한_ 은 본인만 읽기·쓰기로 좁혔지만, 학습자가 _프로젝트 폴더를 git 에 올리거나 압축해 공유_ 할 때 키가 같이 따라가는 사고는 별도로 막아야 합니다. §0-2 의 `uv init` 이 만든 `.gitignore` 에 _두 줄_ 을 추가합니다:

```bash
cat >> .gitignore <<'EOF'

# 학습 환경 추가분
secrets/
.env
EOF
```

이 두 줄로 `secrets/` 안의 SA JSON 과 9.1 에서 만들 `.env` 둘 다 _git add 대상에서 제외_ 됩니다. 같이 만들 `.env.example` 은 _정확 매칭이 아니라_ 그대로 git 에 들어갑니다 — 학습자/팀이 _어떤 변수가 필요한지_ 보는 _구조 문서_ 역할.

> ⚠️ **`chmod 600` 의 역할**: 파일 권한을 _본인만 읽기·쓰기_ 로 좁힙니다 (`rw-------`). SA JSON 은 자격증명이라 _시스템의 다른 사용자_ 가 못 읽게 막아야 합니다. google-auth 라이브러리도 권한이 넓으면 경고를 띄웁니다.

> 💡 **두 안전망의 역할 분담**: `chmod 600` 은 _시스템의 다른 사용자_ 로부터, `.gitignore` 는 _저장소 공유 사고_ 로부터 키를 보호합니다.

## 2. 환경 변수 — `.env` 가 받을 변수들의 의미

미니 클로드는 `python-dotenv` 가 시작 시 작업 cwd 의 `.env` 를 자동 로드해 아래 변수를 환경 변수로 올립니다. _실제 파일 작성과 첫 실행은 9.1 끝_ 에서 진행합니다. 여기서는 _각 변수가 무엇을 받는지_ 만 미리 알아둡니다.

| 변수 | 받는 값 | 예시 |
|---|---|---|
| `GOOGLE_APPLICATION_CREDENTIALS` | §1 에서 옮긴 SA JSON 의 _작업 cwd 기준 상대 경로_ | `secrets/your-sa-key.json` |
| `VERTEX_PROJECT_ID` | SA JSON 의 `project_id` 필드와 _동일한_ GCP project ID | `your-gcp-project` |
| `VERTEX_LOCATION` | Vertex region | `global` (기본) / `us-east5` / `europe-west1` |
| `MINI_LLM_MODEL` | Model Garden 에서 enable 한 모델 alias | `claude-opus-4-7` |
| `MINI_LLM_MAX_TOKENS` | 한 응답의 max_tokens (선택 — 미설정 시 4096) | `4096` |

> 💡 **JSON 의 `project_id` 와 `VERTEX_PROJECT_ID` 가 다르면 403/404**. SA JSON 파일을 열어 `project_id` 필드를 확인하세요.

> 💡 **vLLM 등 다른 백엔드를 쓰려면** `MINI_LLM_PROVIDER=vllm` 과 다른 변수 묶음이 필요합니다. 이 챕터의 _주 흐름은 Vertex_ 라 §"다른 백엔드" 절에 따로 안내합니다.

여기까지가 _코드를 쓰기 전 환경_ 입니다. 이어지는 **9.1 설계 — 미니 클로드의 골격** 에서 디렉토리 구조 / `pyproject.toml` / Python 스캐폴드를 손으로 작성한 뒤, 그 챕터 끝에서 `.env.example` 작성 → `cp .env.example .env` → 값 편집 → `uv sync` → `uv run mini-claude` 첫 실행까지 한 흐름으로 진행합니다.

---

## 흔한 막힘

> 아래 에러는 _9.1 끝 첫 실행_ 또는 _9.2 이후 진짜 응답 호출_ 시 만나는 것들. 실행 단계에서 막히면 이 표로 돌아와 참조하세요.

| 에러 | 원인 | 해결 |
|---|---|---|
| `DefaultCredentialsError` | `GOOGLE_APPLICATION_CREDENTIALS` 미설정 / 경로 오타 | §1·§2 다시 |
| `RuntimeError: Could not import google.auth` | `anthropic[vertex]` extra 미설치 | `uv sync` (또는 `uv add 'anthropic[vertex]'`) |
| `ValueError: Unable to determine which files to ship inside the wheel` | `src/mini_claude/__init__.py` 누락 — `pyproject.toml` 의 `name = "mini-claude"` 를 hatchling 이 `mini_claude` 디렉토리로 찾는데 없음 | `mkdir -p src/mini_claude && touch src/mini_claude/__init__.py` (스캐폴드 작성 전 우회) |
| `403 PERMISSION_DENIED` | SA 에 `roles/aiplatform.user` 없음 | _전제_ 의 IAM 역할 부여 |
| `404 model not found` (region) | region 불일치 | Model Garden 에서 enable 한 region 으로 `VERTEX_LOCATION` 수정 |
| `404 model not found` (model_id) | 모델 ID 부정확 | Model Garden 에서 본 정확한 alias 로 `MINI_LLM_MODEL` 수정 |
| `quota exceeded` | region 별 quota 초과 | 다른 region 또는 quota 증가 요청 |

---

## 비용 안내

- Vertex 의 Anthropic Claude 는 _per-token 과금_ — _free tier 없음_
- _짧은 prompt + 짧은 max_tokens_ 권장 (미니 클로드 기본 `max_tokens=4096`)
- 사용량은 GCP Console → Billing 에서 확인

---

## 다른 백엔드

vLLM (OpenAI 호환, 로컬) 로 가려면 `.env` 를 vLLM 모양으로 편집:

```bash
# .env (작업 cwd)
MINI_LLM_PROVIDER=vllm
MINI_LLM_MODEL=meta-llama/Llama-3.1-70B-Instruct
VLLM_BASE_URL=http://localhost:8000/v1
# VLLM_API_KEY=dummy           # 기본값 — vLLM 은 보통 키 검증 안 함
# VERTEX_PROJECT_ID / GOOGLE_APPLICATION_CREDENTIALS 는 제거 또는 주석 처리
```

`python-dotenv` 가 `mini-claude` 시작 시 `.env` 를 자동 로드 — 별도 `export` 불필요. 자세한 내용은 핸드북 **10.5 API 클라이언트** 챕터.
