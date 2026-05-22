# mini_claude 학습자 환경 설정 — Vertex AI

Anthropic API 키 없이 mini_claude 를 GCP Vertex AI 의 Claude 모델로 실행하려면 _Service Account JSON 키_ 한 개와 환경변수 네 개만 있으면 됩니다.

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

```bash
mkdir -p ~/.config/gcp
mv ~/Downloads/your-sa-key.json ~/.config/gcp/mini-claude-sa.json
chmod 600 ~/.config/gcp/mini-claude-sa.json
```

## 2. 환경변수 네 개

`.env` 또는 shell rc (`~/.zshrc`, `~/.bashrc`) 에:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcp/mini-claude-sa.json
export VERTEX_PROJECT_ID=your-gcp-project       # SA JSON 의 project_id 와 같아야 함
export VERTEX_LOCATION=global                    # 기본값. global / us-east5 / europe-west1 등
export MINI_LLM_MODEL=claude-opus-4-7            # Model Garden 에서 enable 한 alias
```

> 💡 **JSON 의 `project_id` 와 `VERTEX_PROJECT_ID` 가 다르면 403/404**. JSON 파일을 열어 `project_id` 필드를 확인하세요. `MINI_LLM_PROVIDER` 는 미설정 시 `vertex` 가 기본값이라 생략해도 됩니다.

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

자세한 내용은 핸드북 **10.8 API 클라이언트** 챕터.
