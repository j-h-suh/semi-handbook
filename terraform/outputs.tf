output "service_url" {
  value       = google_cloud_run_v2_service.handbook.uri
  description = "Cloud Run 서비스 URL — 이 도메인의 /api/auth/callback/microsoft-entra-id 를 Entra Redirect URI 에 추가할 것"
}

output "runtime_service_account" {
  value       = google_service_account.run.email
  description = "Vertex keyless 용 런타임 SA (roles/aiplatform.user 부여됨)"
}

output "artifact_registry" {
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.handbook.repository_id}"
  description = "이미지 푸시 대상 레지스트리 경로"
}
