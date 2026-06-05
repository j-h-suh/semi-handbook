terraform {
  required_version = ">= 1.5"

  required_providers {
    # Cloud Run 직접 IAP(iap_enabled)는 google provider 7.x 부터 지원
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
    # google_project_service_identity (IAP 서비스 에이전트 선생성) 용
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 7.0"
    }
    # Cloud SQL DB 유저 비밀번호 생성용
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # 상태를 팀과 공유하려면 GCS 백엔드 권장.
  # ⚠️ 시크릿이 상태에 평문으로 들어가므로 버킷 접근을 반드시 제한할 것.
  # backend "gcs" {
  #   bucket = "<tfstate-bucket>"
  #   prefix = "semi-handbook"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}
