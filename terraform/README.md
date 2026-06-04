# semi-handbook — Cloud Run 배포 (Terraform)

Cloud Run + Entra SSO + Vertex keyless, **DB 없음**. 이미지는 Cloud Build 로 빌드하고
Terraform 이 레지스트리·런타임 SA·Secret Manager·IAM·Cloud Run 서비스를 관리한다.

## 사전 준비
- `gcloud auth login` + `gcloud auth application-default login`
- `terraform` ≥ 1.5
- `terraform.tfvars` 작성 (`terraform.tfvars.example` 복사)

## 배포 순서 (이미지가 먼저 있어야 Cloud Run 이 뜨므로 2단계)

```bash
cd terraform
terraform init

# 1) API + 레지스트리 먼저 생성
terraform apply \
  -target=google_project_service.enabled \
  -target=google_artifact_registry_repository.handbook

# 2) 이미지 빌드·푸시 (repo 루트 컨텍스트)
./build_and_push.sh <project_id> asia-northeast3 v1

# 3) 시크릿 값 주입 (방법 A — 상태에 평문 안 남김)
echo -n "<AUTH_SECRET>"   | gcloud secrets versions add semi-handbook-auth-secret   --data-file=- --project <proj>
echo -n "<ENTRA_SECRET>"  | gcloud secrets versions add semi-handbook-entra-secret  --data-file=- --project <proj>
echo -n "<BEDROCK_TOKEN>" | gcloud secrets versions add semi-handbook-bedrock-token --data-file=- --project <proj>

# 4) 나머지 전체 배포 (terraform.tfvars 의 image 를 v1 으로)
terraform apply
```

`terraform output service_url` 로 배포 URL 확인.

## 배포 후 — Entra Redirect URI 추가 (필수)
Entra 앱 등록 → **인증** → Redirect URI 에 추가:
```
https://<service_url>/api/auth/callback/microsoft-entra-id
```
커스텀 도메인을 매핑하면 그 도메인 기준으로도 추가.

## 갱신 (코드 수정 후 재배포)
```bash
./build_and_push.sh <project_id> asia-northeast3 v2
# terraform.tfvars image 태그를 v2 로 변경 후
terraform apply
```

## 챗봇 크리덴셜 (듀얼 클라우드)
- **Claude(Opus/Haiku) → AWS Bedrock**: `AWS_BEARER_TOKEN_BEDROCK`(시크릿) + `AWS_REGION`. AWS 콘솔에서 Claude 모델 access 신청 필요. GCP 에선 keyless 불가라 토큰 주입.
- **Gemini Flash → GCP Vertex**: Cloud Run 런타임 SA 로 keyless(`roles/aiplatform.user`). 키 불필요.

## Cloud SQL 연결 (게시판/Q&A 로그) — 기본 off
배포 시점엔 DB 없이(dormant) 뜨고, 공용 Cloud SQL 이 준비되면 **플래그만 켜서** 연결한다(코드는 이미 dormant-ready, 재배포 1회):

```hcl
# terraform.tfvars
enable_cloudsql                   = true
cloudsql_instance_connection_name = "data-project:asia-northeast3:handbook-pg"  # 크로스 프로젝트 OK
cloudsql_project                  = "data-project"
```
```bash
# DATABASE_URL 시크릿 주입 (소켓 형식)
echo -n "postgres://handbook:<pw>@/handbook?host=/cloudsql/data-project:asia-northeast3:handbook-pg" \
  | gcloud secrets versions add semi-handbook-database-url --data-file=- --project <handbook-proj>
terraform apply
```
- **크로스 프로젝트**: 커넥터(소켓) 방식이라 VPC 불필요. 런타임 SA 에 *데이터 프로젝트의* `roles/cloudsql.client` 가 필요 — TF 주체가 그 프로젝트 IAM admin 이 아니면 데이터 프로젝트 소유자가 부여.
- 끄려면 `enable_cloudsql = false` → 다시 dormant.

## 참고
- **콜드스타트**: `min_instances = 1` 로 제거 가능(소액 상시 비용).
- **조직 정책**: domain restricted sharing 이 켜져 있으면 `allow_unauthenticated`(allUsers) 바인딩이 막힐 수 있음 → IT 협의.
