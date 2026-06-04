#!/usr/bin/env bash
# 컨테이너 이미지 빌드 & Artifact Registry 푸시 (Terraform 은 이미지를 빌드하지 않음).
# 레지스트리(handbook)는 terraform apply 로 먼저 생성돼 있어야 한다.
#
# 사용:  ./build_and_push.sh <project_id> [region] [tag]
#   예:  ./build_and_push.sh my-proj asia-northeast3 v1
set -euo pipefail

PROJECT="${1:?project_id 필요 — 사용: ./build_and_push.sh <project_id> [region] [tag]}"
REGION="${2:-asia-northeast3}"
TAG="${3:-latest}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/handbook/semi-handbook:${TAG}"

# 빌드 컨텍스트는 repo 루트 (Dockerfile·.dockerignore 위치)
cd "$(dirname "$0")/.."

echo "▶ 빌드 & 푸시: ${IMAGE}"
gcloud builds submit --project "${PROJECT}" --tag "${IMAGE}" .

echo
echo "✅ pushed: ${IMAGE}"
echo "   → terraform.tfvars 의 image 변수를 위 값으로 설정 후 'terraform apply'"
