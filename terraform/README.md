# semi-handbook — Cloud Run 배포 (Terraform)

Cloud Run + IAP 전사 게이트 + Vertex keyless, **DB 기본 off**(옵션으로 *이 프로젝트 전용* Cloud SQL).
이미지는 Cloud Build 로 빌드하고 Terraform 이 레지스트리·런타임 SA·Secret Manager·IAM·IAP·
(옵션)Cloud SQL·Cloud Run 서비스를 관리한다.

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

## Cloud SQL (게시판/Q&A 로그) — 이 프로젝트 전용 인스턴스, 기본 off
기본은 DB 없이(dormant) 뜬다. **이 프로젝트 안에** Postgres 를 새로 띄워 환경을 깔아두려면
`enable_cloudsql = true` 한 줄이면 된다.

`enable_cloudsql=true` 가 한 번에 만드는 것:
- `${service_name}-pg` Postgres 16 인스턴스(이 프로젝트, `var.region`)
- `handbook` DB + `handbook` 유저 (**비밀번호는 Terraform 이 생성** — 수동 관리 없음)
- 런타임 SA 에 `roles/cloudsql.client`
- `DATABASE_URL`(소켓 형식) 을 조립해 Secret Manager 에 저장 → Cloud Run 에 주입 + 소켓 마운트

```hcl
# terraform.tfvars
enable_cloudsql              = true
cloudsql_tier                = "db-f1-micro"  # 최소. 여유 두려면 db-g1-small 등
cloudsql_disk_size           = 10
cloudsql_deletion_protection = true           # 실수 삭제 방지
```
```bash
terraform apply
terraform output cloudsql_connection_name   # project:region:instance
```

### 스키마 적용 (인스턴스가 뜬 뒤 1회)
DB 는 비어 있으므로 [db/schema.sql](../db/schema.sql) 을 한 번 적용해야 게시판/로그 테이블이 생긴다.
공인 IP 에 authorized_networks 가 없어 직접 접속은 막혀 있으니, **Cloud SQL Auth Proxy** 로 붙는다:

```bash
# 비밀번호는 Terraform 이 생성 → 시크릿에서 확인
gcloud secrets versions access latest --secret=semi-handbook-database-url --project <proj>

# Auth Proxy 로 로컬 5432 에 터널 후 스키마 적용
cloud-sql-proxy <project:region:instance> &
psql "postgres://handbook:<pw>@127.0.0.1:5432/handbook" -f ../db/schema.sql
```
> 또는 `gcloud sql connect ${service_name}-pg --user=handbook --database=handbook` 후 스키마 붙여넣기.

### 끄기
- `enable_cloudsql = false` → Cloud Run 은 다시 dormant. 단 인스턴스를 실제로 **삭제**하려면
  먼저 `cloudsql_deletion_protection = false` 로 apply 한 뒤 false 로 내려야 한다.
- ⚠️ 인스턴스를 지우면 같은 이름은 **약 1주일간 재사용 불가**.

## 참고
- **콜드스타트**: `min_instances = 1` 로 제거 가능(소액 상시 비용).
- **조직 정책 (DRS)**: 이 구성은 `allUsers` 바인딩을 쓰지 않으므로 *domain restricted sharing* 과 충돌하지 않는다. 접근은 `iap_members`(자사 도메인/그룹)로만 부여 — DRS 가 허용하는 주체다.
