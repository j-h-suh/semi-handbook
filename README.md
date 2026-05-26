# 세미에이아이 핸드북 시리즈

> AI/ML 엔지니어를 위한 인터랙티브 기술 핸드북 플랫폼

## 소개

AI/ML 엔지니어가 실무에 필요한 도메인 지식을 **소프트웨어 엔지니어의 관점**으로 학습할 수 있는 온라인 교재 시리즈입니다. 인터랙티브 다이어그램, 수식 렌더링, AI 어시스턴트가 내장되어 있습니다.

## 핸드북 시리즈

### 📘 반도체 핸드북 (`/semi`)

반도체 산업에 진입하는 AI/ML 엔지니어를 위해, 웨이퍼부터 칩까지의 제조 공정을 설명합니다.

| Part | 내용 | 챕터 수 |
|------|------|---------|
| 들어가며 | 이 책의 목적과 독자 | 1 |
| Part 1 | 반도체 제조 기초 | 10 |
| Part 2 | 포토리소그래피 심화 | 14 |
| Part 3 | 수율 공학과 결함 분석 | 9 |
| Part 4 | AI와 반도체 제조 | 10 |
| Part 5 | 실무 레퍼런스 | 4 |

### 📗 통계학 핸드북 (`/stats`)

sklearn은 쓸 줄 알지만 통계적 검증은 자신 없는 ML 엔지니어를 위한 실전 통계학 입문서입니다.

| Part | 내용 | 챕터 수 |
|------|------|---------|
| 들어가며 | 왜 이 핸드북을 썼는가 | 1 |
| Part 1 | 기술통계 | 5 |
| Part 2 | 확률과 분포 | 6 |
| Part 3 | 추론통계 | 6 |
| Part 4 | 회귀와 모델링 | 5 |
| Part 5 | 베이지안 통계 | 4 |
| Part 6 | 실전 응용 | 5 |

### 📕 클로드 핸드북 (`/claude`)

Claude Code의 내부 구조를 소스코드 레벨에서 해부하는 AI 코딩 에이전트 심층 분석서입니다.

| Part | 내용 | 챕터 수 |
|------|------|---------|
| 들어가며 | 왜 이 책을 썼는가 | 2 |
| Part 1 | 부트스트랩 | 2 |
| Part 2 | 에이전트 루프 | 3 |
| Part 3 | 도구 시스템 | 5 |
| Part 4 | 슬래시 명령 | 3 |
| Part 5 | 터미널 UI | 4 |
| Part 6 | 설정·권한·Hook | 6 |
| Part 7 | 외부 연결 | 4 |
| Part 8 | 멀티 에이전트 | 4 |
| Part 9 | 미니 Claude Code | 5 |
| Part 10 | 확장하기 | 3 |
| 에필로그 | 마무리 | 1 |

## 기술 스택

- **프레임워크**: Next.js 16 (Turbopack)
- **차트**: Recharts
- **애니메이션**: Framer Motion
- **수식**: KaTeX
- **다이어그램**: Mermaid + 커스텀 React SVG 컴포넌트
- **AI 채팅**: Vertex AI (Anthropic Claude Opus 4.7 / Google Gemini 3.5 Flash 선택, `@anthropic-ai/vertex-sdk` + `@google/genai`)
- **배포**: Vercel

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## AI 챗봇 설정 (Q&A 패널)

Q&A 패널은 Vertex AI 자격증명이 있는 환경에서만 작동합니다. 자격증명이 없어도 본문 / 다이어그램 / 용어 사전 등 다른 기능은 모두 정상 동작합니다 — **Service Account JSON 이 배치된 환경 (로컬 개발 또는 사내 배포 서버) 에서만 Q&A 가 활성화** 되는 구조입니다.

### 1. Google Cloud 사전 준비

Vertex AI 가 활성화된 GCP 프로젝트와 Service Account 가 필요합니다.

- IAM 역할: `Vertex AI User` (`roles/aiplatform.user`)
- 호출하는 모델 (예: `claude-opus-4-7@...`, `gemini-...`) 이 해당 프로젝트의 Model Garden 에서 활성화 / 구독되어 있어야 함

### 2. Service Account JSON 배치

발급받은 키 파일을 다음 위치에 둡니다 (이미 `.gitignore` 등재됨):

```
secrets/semi-handbook.json
```

`secrets/` 디렉토리 전체가 `.gitignore` 결로 보호되므로 실수로 commit 될 위험 없음. 다른 경로를 쓰려면 아래 `GOOGLE_APPLICATION_CREDENTIALS` 만 바꾸면 됩니다.

### 3. 환경변수 주입

서버 사이드 (API route) 에서 `process.env.*` 결로 다음 3 개 키를 읽습니다. 환경에 따라 주입 방식이 다릅니다.

| 키 | 의미 |
|---|---|
| `GOOGLE_CLOUD_PROJECT` | GCP 프로젝트 ID |
| `CLOUD_ML_REGION` | Vertex 리전 (`global` 권장 — 가장 넓은 가용성. `us-central1` 등 모델 가용성에 따라 변경) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Service Account JSON 의 _런타임 절대 / 상대 경로_ |

#### 3-A. 로컬 개발

프로젝트 루트에 `.env.local` 파일을 만들고 (`.env.example` 템플릿 참고):

```bash
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
CLOUD_ML_REGION=global
GOOGLE_APPLICATION_CREDENTIALS=./secrets/semi-handbook.json
```

- `.env*` 패턴이 `.gitignore` 결로 보호됨 (commit 안 됨)
- Next.js 가 dev server 기동 시 자동으로 `process.env` 에 로드

#### 3-B. 사내 배포

`.env.local` 파일을 그대로 옮기는 결이 아니라, **동일 키들을 런타임 환경변수 결로 주입** 합니다. SA JSON 도 컨테이너 / 서버에 함께 배치해 `GOOGLE_APPLICATION_CREDENTIALS` 가 _배포된 경로_ 를 가리키도록 합니다.

| 배포 환경 | 주입 방식 (예시) |
|---|---|
| Docker | `docker run --env-file env.list -v /host/sa.json:/app/secrets/semi-handbook.json` |
| docker-compose | `environment:` + `volumes:` 결로 SA JSON 마운트 |
| Kubernetes | ConfigMap (project ID / region) + Secret (SA JSON) → `volumeMount` |
| PM2 / systemd | ecosystem 파일 또는 `Environment=` directive |

> 배포 인프라가 확정되면 이 절을 _구체 절차_ 로 보충합니다.

### 4. 모델 선택

- 우상단 Q&A 패널 헤더의 dropdown 결로 _Claude Opus 4.7_ / _Gemini 3.5 Flash_ 선택
- 선택은 `localStorage.chat-model` 에 저장됨

### 5. 모델 / 자격 추가

새 모델을 추가하거나 다른 region 결로 호출하려면:

- `src/lib/llm/models.ts` — UI dropdown 에 노출할 모델 ID / 라벨
- `src/lib/llm/index.ts` — 모델 ID prefix 결로 provider 분기 (`claude-` → `anthropic.ts`, `gemini-` → `gemini.ts`)
- `src/lib/llm/{anthropic,gemini}.ts` — 실제 Vertex SDK 호출 (region / baseURL 결로 커스터마이즈)

## 콘텐츠 디렉토리 구조

```
content/
├── semi/                        # 반도체 핸드북
│   ├── *.md                     #   챕터 마크다운
│   ├── handbook-review.md       #   리뷰 메타
│   └── 반도체_...pdf            #   원본 PDF
├── stats/                       # 통계학 핸드북
│   └── *.md                     #   챕터 마크다운
├── claude_code/                 # 클로드 핸드북
│   ├── *.md                     #   챕터 마크다운
│   └── code_repository/         #   QnA 참조용 소스코드
└── exec/                        # (보관용) 노출 중단된 임원 핸드북 원고

public/content/
└── semi/
    └── images/                  # 반도체 챕터 이미지 (정적 서빙)
        ├── 01_01/
        ├── 01_02/
        └── ...
```

각 핸드북의 이미지는 `public/content/{book}/images/` 에 위치하며, `markdown.ts`의 `imageRewrite` 설정으로 마크다운 내 상대 경로가 절대 경로로 변환됩니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 허브 랜딩 (책 선택)
│   ├── semi/[id]/            # 반도체 챕터 페이지
│   ├── stats/[id]/           # 통계 챕터 페이지
│   ├── claude/[id]/          # 클로드 챕터 페이지
│   ├── board/                # 통합 게시판
│   └── glossary/             # 용어 사전
├── components/
│   ├── diagrams/
│   │   ├── semi/             # 반도체 다이어그램
│   │   └── stats/            # 통계 다이어그램
│   ├── MarkdownViewer.tsx
│   ├── QnAPanel.tsx          # AI 사이드바 (공유)
│   └── Sidebar.tsx           # 책별 독립 TOC
└── lib/
    ├── markdown.ts           # 마크다운 파싱 (책별 분기)
    ├── glossary.ts           # 책별 통합 용어 사전
    └── llm/                  # Vertex AI 어댑터 (Q&A 백엔드)
        ├── anthropic.ts      #   Claude Opus 자리 (AnthropicVertex)
        ├── gemini.ts         #   Gemini Flash 자리 (GoogleGenAI vertexai)
        ├── models.ts         #   UI dropdown 노출 모델 목록 (client safe)
        └── index.ts          #   prefix 결로 provider 분기 + streamText
```

## 아키텍처 결정 사항

- **멀티북 라우팅**: `/semi/[id]`, `/stats/[id]`, `/claude/[id]` 형태로 책별 독립 URL
- **랜딩 페이지**: `/`에서 책 선택 허브, 각 책의 카드에 소개/진행률 표시
- **사이드바**: 현재 보고 있는 책의 TOC만 표시, 상단에 책 전환 탭 (반도체/통계학/클로드)
- **컴포넌트 공유**: MarkdownViewer, QnAPanel, Sidebar, SearchModal은 공유. 다이어그램 레지스트리와 파트 매핑은 책별 분리
- **게시판**: 통합 유지 + 책별 카테고리 태그
- **검색 (⌘K)**: 전체 핸드북 범위에서 검색, 결과에 책별 배지 표시
- **콘텐츠 디렉토리**: 각 핸드북은 `content/{book}/` 아래에 독립적으로 관리. 이미지는 `public/content/{book}/images/`에서 정적 서빙

## 라이선스

MIT
