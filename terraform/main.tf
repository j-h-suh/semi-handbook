# ─── 필요한 API 활성화 ───
locals {
  apis = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "aiplatform.googleapis.com",
    "cloudbuild.googleapis.com",
    "iap.googleapis.com", # 전사 게이트 (Cloud Run 직접 IAP)
  ]
}

resource "google_project_service" "enabled" {
  for_each           = toset(local.apis)
  service            = each.value
  disable_on_destroy = false
}

# 프로젝트 번호 (IAP 서비스 에이전트 이메일 구성에 필요)
data "google_project" "this" {}

# IAP 서비스 에이전트 (service-<num>@gcp-sa-iap...) 를 미리 생성 — 첫 apply 의
# run.invoker 부여 경합을 막는다. (자동 생성되지만 타이밍 보장용)
resource "google_project_service_identity" "iap" {
  provider   = google-beta
  service    = "iap.googleapis.com"
  depends_on = [google_project_service.enabled]
}

# ─── Artifact Registry (이미지 저장소) ───
resource "google_artifact_registry_repository" "handbook" {
  location      = var.region
  repository_id = "handbook"
  format        = "DOCKER"
  description   = "semi-handbook 컨테이너 이미지"
  depends_on    = [google_project_service.enabled]
}

# ─── Cloud Run 런타임 서비스 계정 (Vertex keyless 인증) ───
resource "google_service_account" "run" {
  account_id   = "${var.service_name}-run"
  display_name = "semi-handbook Cloud Run runtime"
}

resource "google_project_iam_member" "vertex_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.run.email}"
}

# ─── Secret Manager ───
# Bedrock 토큰 (Claude 챗봇) — GCP 에서 AWS 는 keyless 불가라 시크릿으로 주입
resource "google_secret_manager_secret" "bedrock_token" {
  secret_id = "${var.service_name}-bedrock-token"
  replication {
    auto {}
  }
  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_version" "bedrock_token" {
  count       = var.bedrock_bearer_token == "" ? 0 : 1
  secret      = google_secret_manager_secret.bedrock_token.id
  secret_data = var.bedrock_bearer_token
}

resource "google_secret_manager_secret_iam_member" "bedrock_token_access" {
  secret_id = google_secret_manager_secret.bedrock_token.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.run.email}"
}

# ─── Cloud SQL 연결 (게시판/Q&A 로그) — 기본 off ───
# 공용 DB(크로스 프로젝트 가능)가 준비되면 enable_cloudsql=true + connection name/project 채우고 apply.
# 커넥터(소켓) 방식이라 VPC 불필요 — 인터넷 API(Bedrock/Vertex) egress 와 충돌 없음.
resource "google_project_service" "sqladmin" {
  count              = var.enable_cloudsql ? 1 : 0
  service            = "sqladmin.googleapis.com"
  disable_on_destroy = false
}

# 크로스 프로젝트: 런타임 SA 에 Cloud SQL 이 있는 프로젝트의 cloudsql.client 부여
# (TF 주체가 그 프로젝트 IAM admin 이 아니면 데이터 프로젝트 소유자가 대신 부여)
resource "google_project_iam_member" "cloudsql_client" {
  count   = var.enable_cloudsql ? 1 : 0
  project = var.cloudsql_project
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.run.email}"
}

resource "google_secret_manager_secret" "database_url" {
  count     = var.enable_cloudsql ? 1 : 0
  secret_id = "${var.service_name}-database-url"
  replication {
    auto {}
  }
  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_version" "database_url" {
  count       = var.enable_cloudsql && var.database_url != "" ? 1 : 0
  secret      = google_secret_manager_secret.database_url[0].id
  secret_data = var.database_url
}

resource "google_secret_manager_secret_iam_member" "database_url_access" {
  count     = var.enable_cloudsql ? 1 : 0
  secret_id = google_secret_manager_secret.database_url[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.run.email}"
}

# ─── Cloud Run 서비스 (전사 게이트는 IAP 가 담당) ───
resource "google_cloud_run_v2_service" "handbook" {
  name        = var.service_name
  location    = var.region
  ingress     = "INGRESS_TRAFFIC_ALL"
  iap_enabled = true # 모든 요청은 IAP 인증을 통과해야 함

  template {
    service_account = google_service_account.run.email

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    # Cloud SQL 소켓 볼륨 (enable_cloudsql=true 일 때만)
    dynamic "volumes" {
      for_each = var.enable_cloudsql ? [1] : []
      content {
        name = "cloudsql"
        cloud_sql_instance {
          instances = [var.cloudsql_instance_connection_name]
        }
      }
    }

    containers {
      image = var.image

      ports {
        container_port = 3000 # Dockerfile EXPOSE 와 일치, Cloud Run 이 PORT=3000 주입
      }

      # 비-시크릿 env
      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }
      env {
        name  = "CLOUD_ML_REGION"
        value = var.cloud_ml_region
      }
      env {
        name  = "GEMINI_MODEL"
        value = var.gemini_model
      }
      # Bedrock(Claude) — 토큰은 시크릿, 나머지는 비-시크릿
      env {
        name  = "AWS_REGION"
        value = var.aws_region
      }
      env {
        name  = "OPUS_MODEL"
        value = var.opus_model
      }
      env {
        name  = "HAIKU_MODEL"
        value = var.haiku_model
      }

      # 시크릿 env (Secret Manager 참조)
      env {
        name = "AWS_BEARER_TOKEN_BEDROCK"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.bedrock_token.secret_id
            version = "latest"
          }
        }
      }

      # Cloud SQL (enable_cloudsql=true 일 때만): 소켓 마운트 + DATABASE_URL
      dynamic "volume_mounts" {
        for_each = var.enable_cloudsql ? [1] : []
        content {
          name       = "cloudsql"
          mount_path = "/cloudsql"
        }
      }
      dynamic "env" {
        for_each = var.enable_cloudsql ? [1] : []
        content {
          name = "DATABASE_URL"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.database_url[0].secret_id
              version = "latest"
            }
          }
        }
      }
    }
  }

  depends_on = [
    google_secret_manager_secret_iam_member.bedrock_token_access,
    google_secret_manager_secret_iam_member.database_url_access,
    google_project_service.enabled,
  ]
}

# ─── IAP 게이트 ───
# allUsers 바인딩이 없으므로 'domain restricted sharing' 조직 정책과 충돌하지 않는다.
# 1) IAP 서비스 에이전트가 Cloud Run 을 호출(invoke)하도록 run.invoker 부여
resource "google_cloud_run_v2_service_iam_member" "iap_invoker" {
  project  = google_cloud_run_v2_service.handbook.project
  location = google_cloud_run_v2_service.handbook.location
  name     = google_cloud_run_v2_service.handbook.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:service-${data.google_project.this.number}@gcp-sa-iap.iam.gserviceaccount.com"

  depends_on = [google_project_service_identity.iap]
}

# 2) 실제 접근 주체(전사 도메인 또는 그룹)에게 IAP 접근 권한 부여.
#    member 는 Google 신원 기준 — domain:<workspace 도메인> 또는 group:<그룹 메일>.
resource "google_iap_web_cloud_run_service_iam_member" "members" {
  for_each               = toset(var.iap_members)
  project                = google_cloud_run_v2_service.handbook.project
  location               = google_cloud_run_v2_service.handbook.location
  cloud_run_service_name = google_cloud_run_v2_service.handbook.name
  role                   = "roles/iap.httpsResourceAccessor"
  member                 = each.value

  depends_on = [google_project_service.enabled]
}
