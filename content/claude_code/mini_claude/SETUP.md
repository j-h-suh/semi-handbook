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

### 0-2. 작업 디렉토리 만들기

학습자 본인의 빈 디렉토리에서 시작합니다:

```bash
mkdir -p ~/mini-claude
cd ~/mini-claude
```

이 디렉토리가 _이번 챕터 내내 작업 cwd_ 입니다. 이후의 `secrets/` / `.env` / `uv sync` 모두 여기 기준.

> 💡 **`pyproject.toml` 이나 소스 코드는 _복사해 오는 것이 아닙니다_.** 9.1 부터 디렉토리 구조 / `pyproject.toml` / Python 파일을 _하나씩 손으로_ 작성하면서 미니 클로드를 완성해 갑니다. 9.0 (지금) 은 _코드를 쓰기 전 환경만 준비_ 하는 단계.

---

## 1. JSON 키 안전한 자리에 두기

작업 cwd 에 `secrets/` 폴더를 만들어 키를 옮깁니다:

```bash
mkdir -p secrets
mv ~/Downloads/your-sa-key.json secrets/
chmod 600 secrets/your-sa-key.json
```

> 💡 **`secrets/` 는 저장소 `.gitignore` 에 등록되어 있어 commit 안 됨**. _프로젝트와 키가 같이 묶이는_ 인지적 명확함을 위해 HOME (`~/.config/gcp/`) 이 아닌 프로젝트 내에 둡니다. 단 _프로젝트 폴더를 압축해 공유_ 하거나 _백업 도구가 통째로 백업_ 할 때 키도 같이 가니, _공유 전 반드시 `secrets/` 제외_.

> ⚠️ **`chmod 600` 의 역할**: 파일 권한을 _본인만 읽기·쓰기_ 로 좁힙니다 (`rw-------`). SA JSON 은 자격증명이라 _시스템의 다른 사용자_ 가 못 읽게 막아야 합니다. google-auth 라이브러리도 권한이 넓으면 경고를 띄웁니다.

## 2. `.env` 파일 만들기

작업 cwd 의 `.env.example` 을 복사:

```bash
cp .env.example .env
```

`.env` 파일을 본인 값으로 편집:

```bash
# .env
GOOGLE_APPLICATION_CREDENTIALS=secrets/your-sa-key.json   # §1 에서 옮긴 키 (작업 cwd 기준 상대 경로)
VERTEX_PROJECT_ID=your-gcp-project       # SA JSON 의 project_id 와 같아야 함
VERTEX_LOCATION=global                    # 기본값. global / us-east5 / europe-west1 등
MINI_LLM_MODEL=claude-opus-4-7            # Model Garden 에서 enable 한 alias
```

> 💡 **JSON 의 `project_id` 와 `VERTEX_PROJECT_ID` 가 다르면 403/404**. JSON 파일을 열어 `project_id` 필드를 확인하세요.

> 💡 **`.env.example` 자체는 9.1 에서 직접 작성합니다.** 9.0 (지금) 단계에서는 _아직 파일이 없으니_ 위 `cp` 명령은 _9.1 에서 `.env.example` 을 작성한 뒤_ 에 다시 돌아와 실행하면 됩니다. `python-dotenv` 가 `mini-claude` 시작 시 `.env` 를 자동으로 읽어 환경변수로 올립니다. `MINI_LLM_PROVIDER` 는 미설정 시 `vertex` 가 기본값.

## 3. 첫 실행

> ⚠️ **9.1 / 9.2 코드가 작성된 뒤에야 실행됩니다.** 9.0 단계만 끝낸 상태에서는 `pyproject.toml` / `main.py` / `agent.py` 가 존재하지 않아 `uv sync` 와 `uv run mini-claude` 가 실패합니다. 9.1 에서 디렉토리 구조 + `pyproject.toml` + 스캐폴드를 작성하고, 9.2 에서 핵심 루프를 채우면 그제서야 아래 두 줄로 _첫 응답_ 을 받습니다.
>
> **최소 요구 — `uv sync` 만 통과시키려면**: `pyproject.toml` + `src/mini_claude/__init__.py` (빈 파일이라도) 두 개만 있으면 됩니다. hatchling 이 `name = "mini-claude"` 를 `mini_claude` 결로 normalize 해 `src/mini_claude/` 디렉토리를 wheel 콘텐츠로 찾기 때문. 둘 중 하나라도 빠지면 `ValueError: Unable to determine which files to ship inside the wheel` 로 막힙니다.

```bash
uv sync                          # pyproject.toml + anthropic[vertex] extra 설치
uv run mini-claude
```

`uv sync` 가 처음 실행되면 `.venv/` 가 생성되고 `pyproject.toml` + `uv.lock` 에 명시된 의존성 (`anthropic[vertex]` + `pydantic` + `rich` + `python-dotenv`) 이 설치됩니다. 이후 실행은 `uv run mini-claude` 한 줄.

기대 출력:

```
mini-claude 시작 (Ctrl+D로 종료)
> 안녕
안녕하세요! 무엇을 도와드릴까요?
```

---

## 흔한 막힘

| 에러 | 원인 | 해결 |
|---|---|---|
| `DefaultCredentialsError` | `GOOGLE_APPLICATION_CREDENTIALS` 미설정 / 경로 오타 | §1·§2 다시 |
| `RuntimeError: Could not import google.auth` | `anthropic[vertex]` extra 미설치 | `uv sync` (또는 `uv add 'anthropic[vertex]'`) |
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
