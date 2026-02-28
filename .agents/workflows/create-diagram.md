---
description: 새 인터랙티브 다이어그램 컴포넌트를 생성할 때 사용하는 워크플로우
---

# 다이어그램 생성 워크플로우

## 1. 규칙 확인
// turbo
`.gemini/GEMINI.md`의 **섹션 1 (디자인 토큰)**, **섹션 9 (스타일 가이드)**, **섹션 10 (SVG 작성 필수 규칙)**을 읽고 규칙을 숙지한다.

## 2. 토큰 확인
// turbo
`src/components/diagrams/diagramTokens.ts`를 열어 `FONT`, `COLOR` 값을 확인한다.

## 3. 기존 컴포넌트 참조
// turbo
`src/components/diagrams/` 내 기존 다이어그램 중 구조가 유사한 컴포넌트를 하나 선택하여 패턴을 참조한다.

## 4. 좌표 상수 설계
컴포넌트 작성 전에 **먼저 좌표 상수를 정의**한다:
- viewBox 크기, 기판 위치, 각 요소의 크기/간격을 `const`로 선언
- 대칭 배치가 필요한 경우 중심 좌표 기준으로 계산
- 매직 넘버 사용 금지 — 모든 좌표는 상수 기반 계산식

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
- 호버 인터랙션: `AnimatePresence` + `motion` 사용

## 6. 셀프 검증 체크리스트
코드 작성 완료 후, 아래 항목을 **하나씩 검증**한다:
- [ ] 모든 `fontSize`가 `FONT.*` 토큰을 사용하는가?
- [ ] 좌표가 상수 기반 계산식인가? (매직 넘버 없는가?)
- [ ] 좌우/상하 대칭이 필요한 곳에서 gap이 동일한가?
- [ ] 텍스트가 도형과 겹치지 않는가? (최소 6px 간격)
- [ ] 제목 순서와 시각적 배치 순서가 일치하는가?
- [ ] `h3` 제목에 `FONT.title`, 부제에 `FONT.subtitle` 사용했는가?
- [ ] 다크 테마 기반 색상을 사용했는가?

## 7. Registry 등록
// turbo
`src/components/diagrams/diagramRegistry.ts`에 dynamic import와 경로 매핑을 추가한다.

## 8. TypeScript 검증
// turbo
`npx tsc --noEmit --skipLibCheck` 를 실행하여 타입 에러가 없는지 확인한다.
