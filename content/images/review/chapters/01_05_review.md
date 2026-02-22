### 01_05 식각과 세정 — [전체 통과]

**SVG 코드 검증:**

**1. wet_vs_dry_etch_profile.svg — [✅ 통과]**
- **화살표 방향**:
  - `marker id="arrowGreen"` (습식): `refX="10"`, `orient="auto"`. path `M0,0 L10,5 L0,10` (정방향).
  - 습식 화살표 사용: `M 175,110 L 175,155` (하향), `M 140,110 ... 120,155` (좌하향) → 올바름.
  - `marker id="arrowBlue"` (건식): 동일 스펙. `x1="495" y1="110" x2="495" y2="175"` (수직 하향) → 올바름.
- **화살표 연결**:
  - 습식: 화살표 끝 `y=155`. 마스크 시작 `y=160`. 5px 간격으로 적절히 지시.
  - 건식: 화살표 끝 `y=175`. 타겟 표면 `y=180`. 5px 간격 적절.
- **텍스트 정렬**:
  - Title `x=350`. Subtitles `x=175` (Wet), `x=525` (Dry). 대칭 구조 정확함.
- **구조/좌표**:
  - Wet: `path d="M 85,180 ..."` (Bowl shape). Mask gap 115~235. Undercut 30px (85 vs 115). 등방성 형상 구현됨.
  - Dry: `rect x="465" ...`. Mask gap 465~585. 수직 형상 구현됨.
- **색상**: Resist `#f5c0c0`, Target `#fff3b0` 등 스펙 일치.

**2. rie_chamber_cross_section.svg — [✅ 통과]**
- **화살표 방향**:
  - Gas(Green), Ion(Red), Radical(Purple), RF(Brown) 마커 모두 `orient="auto"` 및 정방향 path 확인.
  - Ion Arrow: `y1=282` to `y2=312` (수직 하향) → 시스 영역 내 가속 표현 정확.
- **요소 겹침**:
  - "Sheath" 라벨 `x=460` (end-anchor). Sheath rect `width=320` (`x=140`~`460`). 텍스트가 rect 우측 끝 내부에 위치하나, 배경이 반투명(`opacity=0.5`)이고 다른 요소와 겹치지 않음.
- **구조 완전성**:
  - Chamber, Electrodes, RF Power, Plasma, Gas Inlet, Pump 등 모든 요소 코드 내 존재.
  - Pump 위치 `y=400`, Exhaust 라인 연결 확인.

**3. etch_profile_defects.svg — [✅ 통과]**
- **프로파일 형상**:
  - Ideal (`x=100`): Vertical rect trench. 90도 마커 존재.
  - Bowing (`x=300`): `path ... Q253,180` (Left curve, control < start), `Q347,180` (Right curve, control > start). 볼록 형상(Bowing) 정확히 구현.
  - Taper (`x=500`): Trench Top width 60 (530-470), Bottom width 30 (515-485). 아래로 갈수록 좁아지는 경사(Positive Taper) 확인.
  - Notching (`x=700`): `path ... Q655,230 ...`. 바닥 모서리 파임(Notch) 형상 구현.
- **텍스트 정렬**: 각 컬럼 `x=100, 300, 500, 700` 중심 정렬 일관됨.

**PNG 시각 검증:**

**4. oes_endpoint_detection.png — [✅ 통과]**
- **텍스트 가독성**: Title, Axis Labels, Legend, Annotations 모두 선명하고 뭉개짐 없음.
- **데이터 정확성**:
  - x=57 지점에서 급격한 하강(Endpoint) 확인.
  - 그래프 형태가 스펙(Plateau -> Drop -> Low)과 일치.
  - 빨간 점선(Trigger) 위치 x=57 정확.
- **요소 겹침**: Annotation 박스가 데이터 곡선을 가리지 않으며 적절한 여백에 배치됨.
- **구성**: 파란색/빨간색 음영 영역(식각 중/식각 완료) 구분 명확.

**판정 사유:**
모든 이미지가 스펙 문서의 요구사항(좌표, 색상, 텍스트, 화살표 방향)을 코드 레벨(SVG) 및 시각적(PNG)으로 완벽히 준수하고 있음. 좌표 계산 결과 논리적 오류 없음.
