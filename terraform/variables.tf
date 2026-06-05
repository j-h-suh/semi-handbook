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

# ─── IAP 게이트 (전사 접근 제어) ───
# IAP 접근을 허용할 주체 목록. Google 신원 기준이다.
#   - 전사 허용: ["domain:<workspace 도메인>"]   예) ["domain:semiai.ai"]
#   - 그룹 제한: ["group:handbook-users@semiai.ai"]
#   - 개별 사용자: ["user:alice@semiai.ai"]
# ⚠️ domain restricted sharing 이 켜져 있어도, 자사 도메인/그룹은 정책상 허용된다.
variable "iap_members" {
  type        = list(string)
  description = "roles/iap.httpsResourceAccessor 를 부여할 주체 (domain:/group:/user:)"
}

# ─── 비-시크릿 런타임 env ───
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
variable "bedrock_bearer_token" {
  type        = string
  description = "AWS_BEARER_TOKEN_BEDROCK (Bedrock API key)"
  sensitive   = true
  default     = ""
}

# ─── Cloud SQL (게시판/Q&A 로그) — 이 프로젝트 전용 인스턴스, 기본 off ───
variable "enable_cloudsql" {
  type        = bool
  description = "이 프로젝트에 Postgres 인스턴스를 생성하고 Cloud Run 에 연결. true 면 상시 비용 발생."
  default     = false
}

variable "cloudsql_tier" {
  type        = string
  description = "Cloud SQL 머신 타입 (db-f1-micro=최소·공유코어, db-g1-small=조금 여유)"
  default     = "db-f1-micro"
}

variable "cloudsql_disk_size" {
  type        = number
  description = "데이터 디스크 크기(GB). 자동 증가(disk_autoresize) 켜짐."
  default     = 10
}

variable "cloudsql_db_name" {
  type    = string
  default = "handbook"
}

variable "cloudsql_db_user" {
  type    = string
  default = "handbook"
}

variable "cloudsql_deletion_protection" {
  type        = bool
  description = "true 면 terraform destroy 로 인스턴스가 지워지지 않음(실수 방지)."
  default     = true
}
