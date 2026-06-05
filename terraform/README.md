# semi-handbook — Cloud Run 배포 (Terraform)

Cloud Run + IAP 전사 게이트 + Vertex keyless, **DB 없음**. 이미지는 Cloud Build 로 빌드하고
Terraform 이 레지스트리·런타임 SA·Secret Manager·IAM·IAP·Cloud Run 서비스를 관리한다.

> 게이트는 **Cloud Run 직접 IAP**(로드밸런서 없음)로 건다. `allUsers` 바인딩이 없으므로
> 조직 정책 *domain restricted sharing* 과 충돌하지 않는다. 접근 주체는 `iap_members` 로 지정.
> IAP 는 **Google 신원**으로 인증한다 — `@semiai.ai` 사용자가 Cloud Identity/Workspace 에
> 존재해야 한다(Entra 를 Google 로 페더레이션해 둔 경우 포함).

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
echo -n "<BEDROCK_TOKEN>" | gcloud secrets versions add semi-handbook-bedrock-token --data-file=- --project <proj>

# 4) 나머지 전체 배포 (terraform.tfvars 의 image 를 v1 으로, iap_members 채우고)
terraform apply
```

`terraform output service_url` 로 배포 URL 확인.

## IAP 게이트 (전사 접근 제어)
- **접근 주체**는 `terraform.tfvars` 의 `iap_members` 로 지정한다(Google 신원 기준):
  - 전사: `iap_members = ["domain:semiai.ai"]`
  - 그룹/개인: `["group:handbook-users@semiai.ai", "user:alice@semiai.ai"]`
- Terraform 이 `roles/iap.httpsResourceAccessor`(주체)와 IAP 서비스 에이전트의 `roles/run.invoker` 를 모두 부여한다.
- **로드밸런서·커스텀 도메인·SSL 인증서 불필요** — `run.app` URL 에 IAP 가 직접 붙는다.
- **OAuth 동의 화면**: IAP 최초 활성화 시 프로젝트에 OAuth consent(브랜딩)가 필요할 수 있다. 콘솔
  *Security → Identity-Aware Proxy* 에서 안내에 따라 1회 구성. 내부(Internal) 유형이면 도메인 사용자만 대상.
- IAP 는 **Google 신원**으로 인증한다. 회사 주 신원이 Microsoft Entra 라면 Entra↔Cloud Identity
  페더레이션이 돼 있어야 `@semiai.ai` 계정으로 로그인된다(IT 확인).

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
- **조직 정책 (DRS)**: 이 구성은 `allUsers` 바인딩을 쓰지 않으므로 *domain restricted sharing* 과 충돌하지 않는다. 접근은 `iap_members`(자사 도메인/그룹)로만 부여 — DRS 가 허용하는 주체다.
