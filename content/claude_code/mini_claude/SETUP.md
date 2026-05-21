# mini_claude 학습자 환경 설정 — Vertex AI

Anthropic API 키 없이 mini_claude 를 실행하려면 GCP Vertex AI 의 Anthropic Claude 모델을 쓸 수 있습니다. 아래 6 가지가 _모두_ 통과해야 호출이 성공합니다.

## 전제

- GCP 계정 + project 가 있고 _결제(billing) 활성화_ 됨
- `gcloud` CLI 설치 ([설치 가이드](https://cloud.google.com/sdk/docs/install))
- mini_claude 의존성 설치됨 (`uv sync` 또는 `pip install -e .[vertex]`)

전제가 안 되어 있으면 _그것부터_ 해결하세요.

---

## 0. GCP 를 처음 쓰는 학습자라면

위 _전제_ 가 안 갖춰진 학습자를 위한 진입 가이드. 이미 GCP project + billing 이 있다면 §1 로 건너뛰세요.

### ① Google 계정 + GCP 가입

[console.cloud.google.com](https://console.cloud.google.com) 접속 → Google 계정으로 로그인. 처음이면 _Free Trial_ ($300 크레딧 90 일) 자동 활성화.

### ② Project 생성

GCP Console → 상단의 _project 선택 드롭다운_ → **New Project**. 이름은 자유 (예: `mini-claude-learn`). project ID 가 자동 생성됨 — 이게 `GOOGLE_CLOUD_PROJECT` 환경변수 값.

### ③ Billing 활성화 (필수)

- GCP Console → _Billing_ → _Link a billing account_
- 신용카드 등록 — Free Trial 크레딧 안에서는 _과금 안 됨_, 다만 카드 등록 자체는 필요
- _Vertex AI 의 Anthropic Claude_ 는 _per-token 과금_ — Free Trial $300 안에서 수십만 토큰 호출 가능

> ⚠️ **Billing 안 하면 Vertex AI API 활성화 단계에서 막힘**. `gcloud services enable aiplatform.googleapis.com` 가 `FAILED_PRECONDITION: Billing must be enabled` 로 거부됨.

### ④ gcloud CLI 설치 + 첫 로그인

- macOS: `brew install --cask google-cloud-sdk`
- Linux/Windows: [공식 설치 가이드](https://cloud.google.com/sdk/docs/install)
- 설치 후:
  ```bash
  gcloud auth login                          # 브라우저 로그인 (CLI 자체용)
  gcloud config set project <YOUR_PROJECT>   # 작업 project 지정
  gcloud auth application-default login      # ADC — 코드가 쓰는 인증
  ```

이제 §1 로.

---

## 1. GCP project 확인 + Vertex AI API 활성화

```bash
# 현재 project 확인
gcloud config get-value project

# 다른 project 로 바꾸려면
gcloud config set project YOUR_PROJECT_ID

# Vertex AI API 활성화 — 한 번만 하면 됨
gcloud services enable aiplatform.googleapis.com
```

확인:
```bash
gcloud services list --enabled | grep aiplatform
# aiplatform.googleapis.com  Vertex AI API
```

---

## 2. Vertex Model Garden 에서 Anthropic Claude 모델 활성화 (opt-in)

**가장 자주 놓치는 자리**. Anthropic Claude 모델은 _명시적 동의_ 후에만 사용 가능합니다.

1. [Vertex Model Garden — Claude](https://console.cloud.google.com/vertex-ai/model-garden) 페이지로 이동
2. **Claude Opus 4.7** (또는 사용할 모델) 선택
3. **Enable** 버튼 클릭 — Anthropic 의 _사용 약관 동의_ 절차
4. 활성화된 후 _Model 상세 페이지_ 에서 **모델 ID** 와 **사용 가능 region** 확인
   - region 옵션: `global` (다중 region 자동 라우팅 — 학습용 권장) 또는 `us-east5` / `europe-west1` 등 명시
   - 모델 ID 두 형식 — 둘 다 작동:
     - *alias*: `claude-opus-4-7` — Vertex 가 _최신 stable 버전_ 으로 자동 라우팅
     - *명시 버전*: `claude-opus-4-1@20250805` — 특정 release 고정

> 학습자 시점에 따라 _enable 된 모델 ID 와 region 이 다를 수 있으니_ Model Garden 에서 본 그대로 사용하세요. _alias 형식_ 이 버전 관리 부담 없어 학습용으로 편리합니다.

---

## 3. ADC (Application Default Credentials) 인증 설정

두 가지 길 — 학습자 환경에 맞게 선택:

### 길 A — gcloud 로 인증 (로컬 개발 권장)

```bash
gcloud auth application-default login
```

브라우저가 열려 Google 계정 로그인. ADC 파일이 자동으로 생성됨:
- macOS/Linux: `~/.config/gcloud/application_default_credentials.json`

### 길 B — Service Account JSON (CI/서버 환경)

1. GCP Console → IAM & Admin → Service Accounts
2. _Vertex AI User_ 역할의 SA 생성, JSON 키 다운로드
3. 환경변수로 경로 지정:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
   ```

확인:
```bash
gcloud auth application-default print-access-token | head -c 30
# ya29.A0AfH6...  (토큰이 나오면 OK)
```

---

## 4. IAM 권한 확인

호출하는 계정/SA 에 _Vertex AI 사용 권한_ 이 있어야 합니다.

```bash
# 현재 인증된 계정
gcloud auth list

# 그 계정에 Vertex AI User 역할 부여 (project owner 가 실행)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="user:YOUR_EMAIL@example.com" \
    --role="roles/aiplatform.user"
```

SA 의 경우 `--member="serviceAccount:NAME@PROJECT.iam.gserviceaccount.com"`.

---

## 5. 환경변수 설정

`.env` 파일 또는 shell rc 에:

```bash
export MINI_LLM_PROVIDER=vertex                        # 기본값이라 생략 가능
export VERTEX_PROJECT_ID=your-gcp-project              # 필수 (또는 GOOGLE_CLOUD_PROJECT)
export VERTEX_LOCATION=global                          # 기본값. global / us-east5 등
                                                       # (CLOUD_ML_REGION 도 fallback 으로 인식)
export MINI_LLM_MODEL=claude-opus-4-7                  # alias 또는 claude-opus-4-1@20250805
# (선택) Service Account 경로
# export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
```

> `MINI_LLM_MODEL` 미설정 시 `clients/__init__.py` 의 `get_default_model()` 이 _alias 형식_ default 를 돌려줌. 학습자 시점의 _Model Garden 에서 enable 된 alias_ 와 일치해야 자동으로 작동.


---

## 6. 첫 실행 + 검증

```bash
cd content/claude_code/mini_claude
uv sync
uv run mini-claude
```

기대 출력:
```
mini-claude 시작 (Ctrl+D로 종료)
> 안녕
안녕하세요! 무엇을 도와드릴까요?
```

---

## 흔한 막힘 자리 — 에러별 대응

| 에러 | 원인 | 해결 |
|---|---|---|
| `RuntimeError: Could not import google.auth` | 의존성 빠짐 | `uv add 'anthropic[vertex]'` (이미 추가됨 — `uv sync` 면 OK) |
| `DefaultCredentialsError` | ADC 미설정 | §3 의 길 A 또는 B |
| `403 PERMISSION_DENIED` | IAM 권한 없음 | §4 — `roles/aiplatform.user` 부여 |
| `404 model not found` (region) | region 불일치 | Model Garden 에서 enable 한 region 으로 `VERTEX_LOCATION` 수정 |
| `404 model not found` (model_id) | 모델 ID 부정확 | Model Garden 에서 본 _정확한 `name@version`_ 으로 `MINI_LLM_MODEL` 수정 |
| `quota exceeded` | region 별 quota 초과 | 다른 region 시도 또는 quota 증가 요청 |
| `SERVICE_DISABLED` | Vertex AI API 비활성 | §1 의 `gcloud services enable aiplatform.googleapis.com` |

---

## 비용 안내

- Vertex 의 Anthropic Claude 는 _per-token 과금_ — `gcloud billing` 또는 GCP Console 의 _Billing_ 에서 확인
- 학습용으로 _짧은 prompt + 짧은 max_tokens_ 권장 (기본 `max_tokens=4096` 은 mini_claude 의 query 인자)
- _free tier 없음_ — 호출하는 만큼 청구됨

---

## 다른 백엔드

vLLM (OpenAI 호환, 로컬) 로 가려면:
```bash
export MINI_LLM_PROVIDER=vllm
export MINI_LLM_MODEL=meta-llama/Llama-3.1-70B-Instruct
export VLLM_BASE_URL=http://localhost:8000/v1
```

자세한 내용은 핸드북 **10.8 API 클라이언트** 챕터.
