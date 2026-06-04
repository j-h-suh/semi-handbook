terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
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
