variable "project_id" {
  type        = string
  description = "GCP 프로젝트 ID"
}

variable "region" {
  type        = string
  description = "Cloud Run / Artifact Registry 리전"
  default     = "asia-northeast3" # 서울
}

variable "service_name" {
  type    = string
  default = "semi-handbook"
}

variable "image" {
  type        = string
  description = "배포할 컨테이너 이미지 전체 경로 (build_and_push.sh 로 먼저 푸시)."
  # 예: asia-northeast3-docker.pkg.dev/<proj>/handbook/semi-handbook:v1
}

variable "min_instances" {
  type        = number
  description = "최소 인스턴스 (0=scale-to-zero, 1=콜드스타트 제거)"
  default     = 0
}

variable "max_instances" {
  type    = number
  default = 4
}

variable "allow_unauthenticated" {
  type        = bool
  description = "공개 ingress (인증은 앱 내 Entra SSO 가 담당). 전사 SSO 면 true."
  default     = true
}

# ─── 비-시크릿 런타임 env ───
variable "entra_client_id" {
  type        = string
  description = "AUTH_MICROSOFT_ENTRA_ID_ID"
}

variable "entra_issuer" {
  type        = string
  description = "AUTH_MICROSOFT_ENTRA_ID_ISSUER (https://login.microsoftonline.com/<tenant>/v2.0)"
}

variable "cloud_ml_region" {
  type    = string
  default = "global"
}

variable "gemini_model" {
  type    = string
  default = "gemini-3.5-flash"
}

# ─── AWS Bedrock (Claude Opus/Haiku 챗봇) ───
# GCP 에서 AWS 는 keyless 가 안 되므로 Bedrock 토큰을 시크릿으로 주입한다.
variable "aws_region" {
  type        = string
  description = "Bedrock 호출 기점 region"
  default     = "ap-northeast-2"
}

variable "opus_model" {
  type    = string
  default = "global.anthropic.claude-opus-4-8"
}

variable "haiku_model" {
  type    = string
  default = "global.anthropic.claude-haiku-4-5-20251001-v1:0"
}

# ─── 시크릿 (Secret Manager 로 주입) ───
# ⚠️ 값을 tfvars 로 넣으면 Terraform 상태에 평문 저장됨.
#    - 권장 A: 값은 gcloud 로 직접 버전 추가하고, 여기선 비워둠("") → 아래 secret_version 은 생성 스킵.
#    - 권장 B: GCS 백엔드 + 접근 제한 상태에서 sensitive 변수로 주입(gitignore 된 secrets.auto.tfvars).
variable "auth_secret" {
  type        = string
  description = "AUTH_SECRET"
  sensitive   = true
  default     = ""
}

variable "entra_client_secret" {
  type        = string
  description = "AUTH_MICROSOFT_ENTRA_ID_SECRET"
  sensitive   = true
  default     = ""
}

variable "bedrock_bearer_token" {
  type        = string
  description = "AWS_BEARER_TOKEN_BEDROCK (Bedrock API key)"
  sensitive   = true
  default     = ""
}

# ─── Cloud SQL (게시판/Q&A 로그) — 기본 off, 공용 DB 준비되면 켜기 ───
variable "enable_cloudsql" {
  type        = bool
  description = "공용 Cloud SQL 연결 활성화. true 면 connection name·project 필요."
  default     = false
}

variable "cloudsql_instance_connection_name" {
  type        = string
  description = "크로스 프로젝트 가능 — 'dataProject:region:instance'"
  default     = ""
}

variable "cloudsql_project" {
  type        = string
  description = "Cloud SQL 이 있는 프로젝트 ID (cloudsql.client IAM 부여 대상; 크로스 프로젝트면 데이터 프로젝트)"
  default     = ""
}

variable "database_url" {
  type        = string
  description = "DATABASE_URL (소켓: postgres://u:p@/db?host=/cloudsql/<conn>). 비우면 gcloud 로 직접 버전 추가."
  sensitive   = true
  default     = ""
}
