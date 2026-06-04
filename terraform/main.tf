# ─── 필요한 API 활성화 ───
locals {
  apis = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "aiplatform.googleapis.com",
    "cloudbuild.googleapis.com",
  ]
}

resource "google_project_service" "enabled" {
  for_each           = toset(local.apis)
  service            = each.value
  disable_on_destroy = false
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
resource "google_secret_manager_secret" "auth_secret" {
  secret_id = "${var.service_name}-auth-secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_version" "auth_secret" {
  count       = var.auth_secret == "" ? 0 : 1
  secret      = google_secret_manager_secret.auth_secret.id
  secret_data = var.auth_secret
}

resource "google_secret_manager_secret" "entra_secret" {
  secret_id = "${var.service_name}-entra-secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_version" "entra_secret" {
  count       = var.entra_client_secret == "" ? 0 : 1
  secret      = google_secret_manager_secret.entra_secret.id
  secret_data = var.entra_client_secret
}

# 런타임 SA 에 시크릿 읽기 권한
resource "google_secret_manager_secret_iam_member" "auth_secret_access" {
  secret_id = google_secret_manager_secret.auth_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.run.email}"
}

resource "google_secret_manager_secret_iam_member" "entra_secret_access" {
  secret_id = google_secret_manager_secret.entra_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.run.email}"
}

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
# 커넥터(소켓) 방식이라 VPC 불필요 — 인터넷 API(Bedrock/Vertex/Entra) egress 와 충돌 없음.
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

# ─── Cloud Run 서비스 ───
resource "google_cloud_run_v2_service" "handbook" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

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
        name  = "AUTH_MICROSOFT_ENTRA_ID_ID"
        value = var.entra_client_id
      }
      env {
        name  = "AUTH_MICROSOFT_ENTRA_ID_ISSUER"
        value = var.entra_issuer
      }
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
        name = "AUTH_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.auth_secret.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "AUTH_MICROSOFT_ENTRA_ID_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.entra_secret.secret_id
            version = "latest"
          }
        }
      }
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
    google_secret_manager_secret_iam_member.auth_secret_access,
    google_secret_manager_secret_iam_member.entra_secret_access,
    google_secret_manager_secret_iam_member.bedrock_token_access,
    google_secret_manager_secret_iam_member.database_url_access,
    google_project_service.enabled,
  ]
}

# ─── 공개 ingress (인증은 앱 내 Entra SSO 가 담당) ───
# ⚠️ 조직 정책 'domain restricted sharing' 이 켜져 있으면 allUsers 바인딩이 거부될 수 있음.
#    그 경우 IAP 대신 정책 예외 또는 내부 LB 경로를 IT 와 협의.
resource "google_cloud_run_v2_service_iam_member" "public" {
  count    = var.allow_unauthenticated ? 1 : 0
  location = google_cloud_run_v2_service.handbook.location
  name     = google_cloud_run_v2_service.handbook.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
