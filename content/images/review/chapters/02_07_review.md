# 02_07 이미지 검수 보고서

### illumination_shapes_comparison.svg — [✅ 통과]

**SVG 코드 검증:**
- **viewBox/크기**: `viewBox="0 0 900 350"` → 스펙(900x350)과 일치.
- **색상**: Illuminated `fill="#FFD700"`, Dark `fill="#1a1a2e"`, Border `stroke="#CCCCCC"` → 스펙 색상 코드와 정확히 일치.
- **구조 완전성**: 4개 패널(Annular, Dipole, Quadrupole, Freeform) 모두 존재하며, x좌표 간격(225px)이 균일함.
- **텍스트 정렬**:
    - Title (`y="35"`), Sub-text (`y="210"`, `y="225"`), k1 Label (`y="252"`, `y="268"`) 모든 그룹에서 일관됨.
    - `text-anchor="middle"`로 중앙 정렬 확인.
- **요소 겹침**:
    - Title(y=35)과 Pupil Top(y=55) 간격 20px 확보.
    - Pupil Bottom(y=185)과 Sub-text Top(y~200) 간격 확보.
    - 겹침 없음 확인.
- **도형 정확성**:
    - Annular: Circle(r=60) - Circle(r=35) → 링 형태 확인.
    - Dipole: Ellipse(cy=80) + Ellipse(cy=160) → 수직 2극 확인.
    - Quadrupole: 45도 방향 4개 원(cx=±33, cy=87/153) → 4극 확인.
    - Freeform: Path 데이터 및 산발적 Circle 요소 → 비정형 패턴 확인.
- **라벨 정확성**:
    - 한글 "다방향 패턴", "수평 라인 패턴", "수직+수평 패턴", "SMO 최적화" 등 스펙 텍스트와 일치.
    - k1 값 (~0.4, ~0.3, ~0.35, ~0.28) 일치.

**판정 사유:** SVG 코드 상의 좌표, 색상, 텍스트 내용이 스펙과 완벽하게 일치하며 구조적 오류가 없음.

---

### opc_before_after.png — [✅ 통과]

**PNG 시각 검증:**
- **구성 일치**: 3단 구성 (Design Intent → OPC Mask → Wafer Result) 명확함.
- **데이터 정확성**:
    - 중앙 패널(OPC Mask)에 Serif(모서리 사각형)와 Hammerhead(끝단 확장) 특징이 뚜렷하게 묘사됨.
    - 좌/우 패널은 직사각형 형태 유지 (설계 의도와 결과의 일치성 표현).
- **텍스트 정확성**:
    - 상단 타이틀: Design Intent, OPC-corrected Mask, Wafer Result 정확함.
    - 하단 캡션: Ideal Pattern, Distorted Mask..., Printed Pattern... 가독성 좋음.
    - 주석: Serif, Hammerhead, Bias Adjustment 지시선이 정확한 위치를 가리킴.
- **화살표**: 좌에서 우로 흐르는 진행 화살표 존재 및 정방향.
- **가독성/전문성**: 텍스트 깨짐 없고, 배색(흰 배경, 짙은 파랑 패턴)이 깔끔함.

**판정 사유:** OPC의 개념(보정 전후 비교)을 스펙대로 충실히 시각화하였으며, 텍스트와 지시선의 위치가 적절함.

---

### ilt_mask_pattern.png — [✅ 통과]

**PNG 시각 검증:**
- **구성 일치**: 곡선형(Curvilinear)의 비정형 패턴이 화면 전체를 채움. 1:1 비율.
- **데이터 정확성**:
    - 전통적인 맨해튼(직각) 구조가 아닌, 유기적인 곡선 형태 확인 (ILT 특징).
    - 주 패턴 주변에 작은 SRAF(보조 패턴)들이 산재함.
- **전문성**: SEM/광학 현미경 이미지 느낌의 고해상도 렌더링.
- **텍스트**: 상단 타이틀 바 "ILT MASK PATTERN..." 및 우측 하단 스케일 바 "1 µm" 포함되어 교육 자료로서 완성도 높음.

**판정 사유:** ILT 기술의 특징인 비정형성을 잘 보여주는 고품질 이미지임.
