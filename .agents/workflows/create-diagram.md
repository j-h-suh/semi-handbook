---
description: 새 인터랙티브 다이어그램 컴포넌트를 생성할 때 사용하는 워크플로우
---

# 다이어그램 생성 워크플로우

## 0. 챕터 분석 (일괄 생성 시)
// turbo
챕터의 마크다운 파일을 읽고 **모든 이미지 레퍼런스**(`![alt](/content/images/XX_XX/...)`)를 목록화한다.
- 각 이미지의 유형(Recharts 차트 / SVG 인터랙티브 / 3D Interactive / 좌우 비교 / 이미지+스펙 오버레이)을 결정
- 유사한 기존 컴포넌트를 패턴 참조 대상으로 선택
- **Mermaid 차트(`flowchart`, `sequenceDiagram` 등)가 있으면 인터랙티브 컴포넌트 교체 대상에 추가**
- **공식이 코드 블록으로 되어 있으면 KaTeX 변환 대상에 추가**
  - 블록 수식: `$$` 를 **별도 줄**에 배치 (한 줄에 쓰면 중앙 정렬 안 됨)
  - 인라인 수식: `$...$` 로 감싼다
  - 참고: 1.4장 `$$` 포맷 참조 — 3줄 구성 (`$$` / 수식 / `$$`)
- 모든 다이어그램을 한번에 작성하고, 한번에 등록하고, 한번에 TypeScript 검증한다

## 1. 규칙 확인
// turbo
`.gemini/GEMINI.md`의 **섹션 1 (디자인 토큰)**, **섹션 9 (스타일 가이드)**, **섹션 10 (SVG 작성 필수 규칙)**을 읽고 규칙을 숙지한다.

## 2. 토큰 확인
// turbo
`src/components/diagrams/diagramTokens.ts`를 열어 `FONT`, `COLOR` 값을 확인한다.

## 3. 기존 컴포넌트 참조
// turbo
`src/components/diagrams/` 내 기존 다이어그램 중 구조가 유사한 컴포넌트를 하나 선택하여 패턴을 참조한다.
- **Recharts 차트**: `OESEndpointDetection.tsx`, `DopingProfileEnergy.tsx`
- **좌우 비교 SVG**: `WetVsDryEtchProfile.tsx`, `ChannelingEffect.tsx`
- **구조도 SVG**: `RIEChamber.tsx`, `ThermalOxidationFurnace.tsx`
- **세로 플로우 SVG**: `StepperOperation.tsx`, `ReductionProjectionOptics.tsx`
- **3D Interactive**: `ScannerSlitScanning.tsx` (`@react-three/fiber` + `three`)
- **이미지+스펙 오버레이**: `ASMLTwinscanScanner.tsx`, `TrackScannerSystem.tsx`
- **4패널 비교**: `IlluminationShapes.tsx`

## 4. 좌표 상수 설계
컴포넌트 작성 전에 **먼저 좌표 상수를 정의**한다:
- viewBox 크기, 기판 위치, 각 요소의 크기/간격을 `const`로 선언
- 대칭 배치가 필요한 경우 중심 좌표 기준으로 계산
- 매직 넘버 사용 금지 — 모든 좌표는 상수 기반 계산식

### ⚠️ 좌우 비교 레이아웃 패딩 공식
격자/블록 크기는 반드시 다음 공식으로 계산한다:
```typescript
// ✅ 올바른 계산 — 좌우/상하 패딩이 대칭
const BLOCK_W = (GRID_COLS - 1) * GRID_GAP_X + 2 * PADDING_X;
const BLOCK_H = (GRID_ROWS - 1) * GRID_GAP_Y + 2 * PADDING_Y;

// ❌ 틀린 계산 — 우측/하단에 여분 공백 발생
const BLOCK_W = GRID_COLS * GRID_GAP + PADDING;
```
viewBox 높이는 **하단 텍스트(라벨, 범례)까지 포함**하여 충분히 확보한다.

## 5. 컴포넌트 작성
다음 규칙을 반드시 지킨다:
- `'use client'` 선언
- `FONT`, `COLOR`를 `diagramTokens.ts`에서 import
- 모든 `fontSize`는 `FONT.*` 토큰 사용 (하드코딩 절대 금지)
- `FONT.min(12px)` 미만의 폰트 크기 절대 사용 금지
- 텍스트와 도형 사이 최소 6px 간격
- 주석 라벨은 가리키는 대상과 x 또는 y 좌표 정렬
- 제목 순서와 시각적 배치 순서 일치
- 래퍼에 `className="my-8"` 상하 여백
- 부제(subtitle)의 `marginBottom`은 `8` (16은 공백이 너무 넓음)
- 호버 인터랙션: `AnimatePresence` + `motion` 사용
- **모든 컴포넌트에 기본 안내 툴팁 필수** — `hovered ? (...) : (<default 안내>)` 패턴
  - 예: "각 요소를 호버하여 상세 설명을 확인하세요."
  - 호버 안 된 상태에서 빈 공간 금지
- SVG에서 호버 히트 영역은 **보이는 오브젝트보다 넓게** — `fill="transparent"` 원/사각형 추가

### 광학 빔 경로 규칙
광학계 다이어그램에서 빔 경로를 그릴 때:
- **광원→조명광학계**: 좁은 빔 (광원은 집중된 빛)
- **조명광학계→마스크**: 넓어지는 빔 (조명이 균일하게 퍼뜨림)
- **마스크→투영렌즈**: 직사각형 (같은 폭, 축소 아직 안 됨)
- **투영렌즈→웨이퍼**: 좁아지는 빔 (4:1 축소)
- 빔 색상은 전구간 동일 (같은 빛이므로 색 변경 금지)
- 빔 opacity는 배경에서 충분히 보이도록 최소 0.2 이상

### 3D 컴포넌트 규칙 (`@react-three/fiber`)
- Y축이 높이 — 위에서 아래로: 마스크(최상) > 렌즈(중앙) > 웨이퍼(최하)
- 카메라 위치를 확인하여 **모든 오브젝트가 뷰포트 안에 있는지** 검증
- 오브젝트 투명도(transparent/opacity): 배경과 구분 가능한 수준으로 (너무 낮으면 안 보임)
- 호버 시 `emissive` + `emissiveIntensity`로 하이라이트 (색상 자체를 바꾸지 말 것)
- 물리적 구조물(마스크, 웨이퍼, 척)은 opaque 유지

### 마크다운 내 그림 배치
- 그림은 **관련 본문 단락 직후**에 배치 (섹션 상단에 몰아놓지 않음)
- 텍스트→그림→텍스트 흐름으로 연속성 유지

### Recharts 차트 주의사항
- log scale Y축: **명시적 ticks 배열 필수** + `allowDataOverflow`
- Y축 tickFormatter: `Math.log10()` + unicode 위첨자 변환
- X축에 깔끔한 숫자가 필요하면 **`ticks` 배열로 명시** (tickCount만으로는 불충분)

## 6. 셀프 검증 체크리스트
코드 작성 완료 후, 아래 항목을 **하나씩 검증**한다:
- [ ] 모든 `fontSize`가 `FONT.*` 토큰을 사용하는가?
- [ ] 좌표가 상수 기반 계산식인가? (매직 넘버 없는가?)
- [ ] 좌우/상하 대칭이 필요한 곳에서 패딩이 동일한가? (§4의 공식 사용)
- [ ] 텍스트가 도형과 겹치지 않는가? (최소 6px 간격)
- [ ] 제목 순서와 시각적 배치 순서가 일치하는가?
- [ ] `h3` 제목에 `FONT.title`, 부제에 `FONT.subtitle` 사용했는가?
- [ ] 다크 테마 기반 색상을 사용했는가?
- [ ] viewBox 높이가 하단 텍스트/범례까지 충분한가?
- [ ] 약어를 사용한 경우, 본문이나 툴팁에서 풀네임을 설명하는가?

## 7. Registry 등록
// turbo
`src/components/diagrams/diagramRegistry.ts`에 dynamic import와 경로 매핑을 추가한다.
챕터의 **모든 다이어그램을 한번에** 등록한다.

## 8. TypeScript 검증
// turbo
`npx tsc --noEmit --skipLibCheck` 를 실행하여 타입 에러가 없는지 확인한다.
