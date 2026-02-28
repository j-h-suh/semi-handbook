# 프로젝트 메모리

이 문서는 세션 간 유지해야 할 프로젝트 규칙, 결정사항, 주의점을 기록합니다.

---

## 1. 다이어그램 디자인 토큰

모든 다이어그램 컴포넌트는 `src/components/diagrams/diagramTokens.ts`에서 `FONT`, `COLOR`를 import하여 사용한다. **하드코딩 금지.**

```
FONT.title      = 18px   (차트 제목)
FONT.cardHeader = 15px   (카드/툴팁 헤더)
FONT.subtitle   = 14px   (영문 부제)
FONT.body       = 14px   (축 라벨, 보조 텍스트)
FONT.small      = 13px   (본문, 스펙)
FONT.min        = 12px   (최소 허용 — 이보다 작은 텍스트 금지)
```

## 2. 다이어그램 컴포넌트 등록 방법

1. `src/components/diagrams/` 에 컴포넌트 생성
2. `diagramRegistry.ts`에 dynamic import + 경로 매핑 추가
3. 마크다운에서 `![alt](/content/images/XX_XX/filename.svg)` 형태로 참조
4. `MarkdownViewer.tsx`가 `<img>` 태그를 찾아 해당 React 컴포넌트로 교체

## 3. 등록된 다이어그램 목록

| 경로 | 컴포넌트 | 챕터 |
|------|----------|------|
| `01_01/mosfet_cross_section.svg` | `MOSFETCrossSection` | 1.1 |
| `01_01/transistor_growth.png` | `TransistorGrowth` | 1.1 |
| `01_01/chip_process_flow.svg` | `ChipProcessFlow` | 1.1 |
| `01_02/silicon_purity_comparison.png` | `SiliconPurity` | 1.2 |
| `01_02/ingot_to_wafer_process.svg` | `IngotToWafer` | 1.2 |
| `01_02/crystal_orientation.svg` | `CrystalOrientation` | 1.2 |

## 4. 마크다운 작성 규칙

- `##` 섹션 사이에 `---` 수평선 넣지 않음 — heading의 margin-top으로 충분
- `---`는 대주제 전환(챕터 개요 → 본문 시작) 또는 마지막 정리 구분에만 사용
- 빈 줄은 heading과 이미지 사이에 최대 1줄

## 5. Next.js 한글 파일명 주의사항

- `params.id`는 URL 인코딩 상태(`%EC%9B%A8...`)로 들어옴
- `allChapters[].id`는 원본 한글(`웨이퍼_...`)
- **반드시 `decodeURIComponent(params.id)` 후 비교**해야 함
- 이 버그로 챕터 네비게이션 버튼이 사라졌던 이력 있음

## 6. AI 사이드바 (QnAPanel)

- 너비 리사이즈 가능 (320~700px, 기본 420px) — 왼쪽 가장자리 드래그
- KaTeX 수식 렌더링 지원 (`$...$` 인라인, `$$...$$` 블록)
- `### 제목` 마크다운 헤더 지원
- `ClientLayout.tsx`에서 전역 렌더링 (페이지 이동해도 유지)
- API 키는 `localStorage`에 저장

## 7. MarkdownViewer 렌더링 타이밍

- `dangerouslySetInnerHTML` → `requestAnimationFrame` → DOM 쿼리 순서
- `<img>` 교체를 다음 프레임으로 지연시켜 hydration 타이밍 이슈 방지
- cleanup 시 `cancelAnimationFrame` 호출 필수

## 8. 기술 스택 & 의존성

- Next.js 16 (Turbopack)
- React, Framer Motion (애니메이션)
- Recharts (차트)
- KaTeX (수식)
- Mermaid (다이어그램)
- Vercel 배포

## 9. 다이어그램 스타일 가이드

### 공통 규칙
- `'use client'` 선언 필수
- `diagramTokens.ts`의 `FONT`, `COLOR` import (하드코딩 금지)
- 래퍼에 `className="my-8"` 상하 여백
- **다크 테마** 기반: 배경 `rgba(255,255,255,0.02~0.06)`, zinc 계열 텍스트

### 제목 구조
```
<h3> 한글 제목   → FONT.title (18px), COLOR.textBright, bold
<p>  영문 부제   → FONT.subtitle (14px), COLOR.textDim (선택)
```

### 두 가지 렌더링 유형

| 유형 | 사용 시점 | 의존성 |
|------|----------|--------|
| SVG 인터랙티브 | 구조도, 프로세스 플로우 | Framer Motion (`motion.div`, `motion.g`) |
| 차트형 | 데이터 비교, 시계열 | Recharts (`BarChart`, `ScatterChart` 등) |

### 인터랙션 패턴
- **hover dimming**: 비호버 요소 `opacity: 0.35`
- **hover scale**: 호버 요소 `scale: 1.02~1.05`
- **floating tooltip**: `AnimatePresence` + 마우스 좌표 추적
  - 배경: `rgba(24,24,27,0.95)` + `backdrop-blur(8px)`
  - 보더: `rgba(255,255,255,0.1)`, `borderRadius: 8`
  - 제목: 엑센트 색상, `FONT.cardHeader`, bold
  - 본문: `COLOR.textMuted`, `FONT.small`

### 색상 팔레트
- 툴팁 제목 엑센트: `#22d3ee`(cyan) 또는 `#818cf8`(indigo)
- 데이터 엑센트: `#ef4444`(red), `#3b82f6`(blue), `#22c55e`(green), `#f59e0b`(amber), `#8b5cf6`(purple)
- 보조 요소: zinc 계열 (`#a1a1aa`, `#71717a`, `#4b5563`)

## 10. 다이어그램 SVG 작성 필수 규칙

### 좌표계
- **모든 좌표는 상수로 정의** 후 계산식으로 사용 (매직 넘버 금지)
- 기판 위치, 트렌치 크기, 코팅 두께 등을 상단에 `const`로 선언
- 요소 간 간격(gap)도 상수로 정의하고 대칭 배치 시 중심 기준 계산

### 폰트
- SVG 내부 텍스트 포함, **모든 텍스트에 FONT 토큰 사용** (예외 없음)
- `FONT.min(12px)` 이하의 폰트 크기는 절대 사용 금지
- DimLabel, 주석, 범례 등 보조 텍스트도 최소 `FONT.min`

### 텍스트 배치
- 텍스트와 도형 사이 최소 간격: 6px 이상
- 주석 라벨은 가리키는 대상과 같은 x 또는 y 좌표 정렬 필수
- 여러 주석이 같은 높이에 있을 때 y좌표 통일

### 완성도 체크리스트 (코드 작성 후 셀프 검증)
- [ ] 모든 fontSize가 `FONT.*` 토큰을 사용하는가?
- [ ] 좌표가 상수 기반 계산식인가? (매직 넘버 없는가?)
- [ ] 좌우/상하 대칭이 필요한 곳에서 gap이 동일한가?
- [ ] 텍스트가 도형과 겹치지 않는가? (최소 6px 간격)
- [ ] 제목 순서와 시각적 배치 순서가 일치하는가?
