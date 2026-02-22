# 02_06 이미지 검수 보고서

## 개요
- **검수 대상**: 02_06 (해상도와 DOF)
- **검수 시각**: 2026-02-18
- **총 대상**: SVG 1장, PNG 3장
- **결과**: 3장 ✅, 1장 ❌

---

### dof_concept_diagram.svg — [✅ 통과]

**SVG 코드 검증:**
- **viewBox/크기**: `viewBox="0 0 600 500"`, `width="600"`, `height="500"` → 스펙(600x500)과 일치.
- **색상**: 
  - Lens: `stop-color="#87CEEB"` (Gradient stop) → 스펙(#87CEEB) 일치.
  - Light: `stroke="#FFD700"` → 스펙(#FFD700) 일치.
  - DOF Region: `fill="#90EE90"` → 스펙(#90EE90) 일치.
  - Wafer: `fill="#C0C0C0"` → 스펙(#C0C0C0) 일치.
  - Focal Plane: `stroke="#FF4444"` → 스펙(#FF4444) 일치.
- **텍스트 정렬**: 
  - "Low NA" (x=150), "High NA" (x=150, translated 300 → effective 450). 대칭 구조 확인.
  - "Best Focus" (y=253) text above line (y=260). 겹침 없음.
- **요소 겹침**:
  - Wafer Surface rect (y=290) vs Wafer Text (y=312). 겹침 없음.
  - High NA warning text (y=335) clearly separated.
- **구조 완전성**:
  - Comparison (Low vs High NA) 구현됨.
  - DOF Range (Dimension lines) 구현됨 (Low: height 120, High: height 40).
  - Wafer Surface 구현됨 (High NA에서 DOF 범위 밖 위치 확인: Wafer y=282~290 vs DOF y=240~280).
- **라벨 정확성**: "초점 심도(DOF) 개념도", "DOF = k₂ × λ / NA²" 등 스펙 텍스트 일치 확인.

**판정 사유:** 
SVG 코드 상 좌표, 색상, 텍스트가 스펙을 준수하며, High NA에서의 DOF 문제(Wafer 벗어남)를 논리적으로 올바르게 구현함.

---

### process_window_dose_focus.png — [✅ 통과]

**PNG 시각 검증:**
- **텍스트 가독성**: 모든 라벨 및 축 눈금 선명함.
- **데이터 정확성**:
  - X축 Focus: -150 ~ 150 범위 확인.
  - Y축 Dose: 25 ~ 45 범위 확인.
  - Ellipses: 
    - Blue (65nm): 가장 큼 (Focus 폭 약 ±120).
    - Red (7nm): 중간 (Focus 폭 약 ±50).
    - Purple (3nm): 가장 작음 (Focus 폭 약 ±30).
- **구성 일치**: "Best Focus/Best Dose" 화살표 및 별 마커, 범례(65/7/3nm), 공정 축소 주석 박스 등 모든 요소 존재.
- **요소 겹침**: 텍스트와 그래프 라인 간 겹침 없음.
- **전문성**: Matplotlib 스타일로 깔끔하게 렌더링됨.

**판정 사유:** 
스펙에 정의된 공정 윈도우 타원 3개와 주석들이 시각적으로 정확히 구현됨.

---

### bossung_curve.png — [✅ 통과]

**PNG 시각 검증:**
- **텍스트 정확성**: 타이틀 "Bossung 곡선 (Focus vs CD)" 일치.
- **데이터 정확성**:
  - Dense Curves (Solid): 역U자 형태 (Low Dose/Blue가 가장 높고, High Dose/Red가 가장 낮음). Peak Focus = 0.
  - Iso Curve (Dashed): U자 형태 (Orange). Min Focus ≈ 5.
  - CD 규격 상한(21)/하한(19) 라인 및 범위(Green shade) 표시 확인.
- **축 라벨/범례**: Focus (-100~100), CD (16~26) 범위 준수. 범례 내용 일치.
- **요소 겹침**: 주석 박스(Dense/Isolated 설명)가 곡선을 가리지 않도록 배치됨.

**판정 사유:** 
Bossung 곡선의 특징(Dense/Iso 거동 차이)과 CD 규격 범위가 스펙대로 정확히 시각화됨.

---

### na_resolution_dof_tradeoff.png — [❌ 수정 필요]

**PNG 시각 검증:**
- **텍스트 정확성 (불일치)**:
  - 좌측 Y축 라벨: 이미지에는 "**해상도 R (nm)**"만 표기됨.
  - 스펙 요구사항: "**해상도 R (nm), k₁=0.3**". ("k₁=0.3" 누락)
- **데이터 정확성 (축 범위 불일치)**:
  - 스펙: y1_axis range `[0, 50]`.
  - 이미지: y1_axis range `[0, 200]`.
  - *참고: 스펙의 데이터 포인트(예: 77.2nm)를 표현하기 위해 이미지가 범위를 200으로 늘린 것은 논리적으로 타당하나, 스펙의 `range: [0, 50]` 설정값과 충돌함. 차후 스펙 수정 권장.*
- **구성 일치**: 이중축 그래프, 데이터 시리즈 분리(DUV/EUV), 화살표 주석 등은 잘 구현됨.

**판정 사유:** 
좌측 Y축 라벨 텍스트가 스펙("해상도 R (nm), k₁=0.3")과 일치하지 않음. 
