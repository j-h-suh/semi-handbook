# 9.0 학습자 환경 설정 — Vertex 첫 호출까지의 최소 셋업

Anthropic API 키 없이 mini_claude 를 GCP Vertex AI 의 Claude 모델로 실행하려면 _Service Account JSON 키_ 한 개와 환경변수 네 개만 있으면 됩니다.

## 왜 Vertex 의 Claude 인가 — 큰 그림

LLM API 는 _공급자_ (Anthropic / GCP / AWS / Azure / OpenAI / Google) 와 _인터페이스 모양_ (Anthropic / OpenAI / Google 세 가족) 두 레이어가 따로 움직입니다. mini 는 _GCP Vertex AI 의 Claude 모델_ — _공급자는 Google Cloud_, _인터페이스는 Anthropic 가족_ — 을 _기본_ 으로 씁니다. 학습자가 _Anthropic 직접 API 키_ 없이도 _GCP project + Service Account JSON_ 만 있으면 시작 가능하기 때문.

> 💡 **다른 옵션의 전체 매트릭스** (Bedrock / Azure Foundry / vLLM 자체 호스팅 / Gemini / OpenAI 직접 등) 와 _3 인터페이스 가족 비교_ 는 [§10.5 §0 "LLM API 가족 — 한 장 정리"](/claude/10_5_API_클라이언트) 참조. 이번 9.0 은 _mini 의 기본 자리_ — Vertex 의 Claude — 셋업에 집중.

## 전제

학습자가 _이미 갖추고 있어야_ 하는 것:

- **GCP project** + 결제(billing) 활성화
- **Vertex AI API** 가 enable 된 project
- **Model Garden 에서 Claude 모델 opt-in** ([Vertex Model Garden](https://console.cloud.google.com/vertex-ai/model-garden) → Claude → Enable)
- **Service Account JSON 키** — 팀에서 받았거나, GCP Console 의 IAM → Service Accounts 에서 발급
- 해당 SA 에 **`roles/aiplatform.user`** 역할 부여

> 위 전제가 안 갖춰져 있으면 _그것부터_ 해결하세요. project 부터 시작한다면 [GCP 공식 가이드 — Use Claude](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude) 의 _Before you begin_ 절을 따르면 됩니다.

---

## 1. JSON 키 안전한 자리에 두기

프로젝트 디렉토리 안에 `secrets/` 폴더를 만들어 키를 옮깁니다:

```bash
cd content/claude_code/mini_claude
mkdir -p secrets
mv ~/Downloads/your-sa-key.json secrets/
chmod 600 secrets/your-sa-key.json
```

> 💡 **`secrets/` 는 저장소 `.gitignore` 에 등록되어 있어 commit 안 됨**. _프로젝트와 키가 같이 묶이는_ 인지적 명확함을 위해 HOME (`~/.config/gcp/`) 이 아닌 프로젝트 내에 둡니다. 단 _프로젝트 폴더를 압축해 공유_ 하거나 _백업 도구가 통째로 백업_ 할 때 키도 같이 가니, _공유 전 반드시 `secrets/` 제외_.

> ⚠️ **`chmod 600` 의 역할**: 파일 권한을 _본인만 읽기·쓰기_ 로 좁힙니다 (`rw-------`). SA JSON 은 자격증명이라 _시스템의 다른 사용자_ 가 못 읽게 막아야 합니다. google-auth 라이브러리도 권한이 넓으면 경고를 띄웁니다.

## 2. `.env` 파일 만들기

`mini_claude/` 디렉토리의 `.env.example` 을 복사:

```bash
cd content/claude_code/mini_claude
cp .env.example .env
```

`.env` 파일을 본인 값으로 편집:

```bash
# .env
GOOGLE_APPLICATION_CREDENTIALS=secrets/your-sa-key.json   # §1 에서 옮긴 키 (mini_claude/ cwd 기준 상대 경로)
VERTEX_PROJECT_ID=your-gcp-project       # SA JSON 의 project_id 와 같아야 함
VERTEX_LOCATION=global                    # 기본값. global / us-east5 / europe-west1 등
MINI_LLM_MODEL=claude-opus-4-7            # Model Garden 에서 enable 한 alias
```

> 💡 **JSON 의 `project_id` 와 `VERTEX_PROJECT_ID` 가 다르면 403/404**. JSON 파일을 열어 `project_id` 필드를 확인하세요.

> 💡 **`.env` 는 git 에 안 올라감** — `.gitignore` 의 `.env*` + `!.env.example` 패턴 덕에 _학습자 본인의 `.env`_ 만 무시되고 _`.env.example` 템플릿_ 은 추적됩니다. `mini-claude` 가 시작할 때 `python-dotenv` 가 `.env` 를 자동으로 읽어 환경변수로 올립니다. `MINI_LLM_PROVIDER` 는 미설정 시 `vertex` 가 기본값이라 `.env` 에 안 적어도 됩니다.

## 3. 첫 실행

```bash
cd content/claude_code/mini_claude
uv sync                          # pyproject.toml + anthropic[vertex] extra 설치
uv run mini-claude
```

기대 출력:

```
mini-claude 시작 (Ctrl+D로 종료)
> 안녕
안녕하세요! 무엇을 도와드릴까요?
```

---

## 흔한 막힘 자리

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
- _짧은 prompt + 짧은 max_tokens_ 권장 (mini_claude 기본 `max_tokens=4096`)
- 사용량은 GCP Console → Billing 에서 확인

---

## 다른 백엔드

vLLM (OpenAI 호환, 로컬) 로 가려면:

```bash
export MINI_LLM_PROVIDER=vllm
export MINI_LLM_MODEL=meta-llama/Llama-3.1-70B-Instruct
export VLLM_BASE_URL=http://localhost:8000/v1
```

자세한 내용은 핸드북 **10.5 API 클라이언트** 챕터.
