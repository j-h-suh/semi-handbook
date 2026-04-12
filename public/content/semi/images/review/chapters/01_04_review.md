### 01_04 산화와 증착 — [ALL PASS]

**SVG 코드 검증:**

#### 1. thermal_oxidation_furnace.svg — [PASS]
- **요소 확인:** Quartz Tube(#e8e0d0), Heating Coil(#f5a030), Wafer Boat, Gas Inlet(#a0d0a0), Exhaust 등 모든 요소 존재 확인.
- **화살표 연결:**
  - Inlet Arrow: x=95(Inlet 끝) → x=130(Tube 내부). 방향 Right. (연결 논리 적절)
  - Exhaust Arrow: x=670(Tube 내부) → x=705(Exhaust 시작). 방향 Right. (정확히 연결됨)
- **텍스트 정렬:**
  - 가스 유입구(x=62), 배기구(x=737) 등 각 rect의 중심에 텍스트 align 잘 됨.
  - "로딩 도어" 텍스트(x=78)가 도어 rect(x=90)보다 약간 좌측이나, 화살표/지시선 간섭 없으므로 허용.
- **반응식:** 건식/습식 산화 반응식 오타 없음.

#### 2. ald_vs_cvd_conformality.svg — [PASS]
- **ALD (좌측) 코드 분석:**
  - Substrate와 ALD Film의 좌표 차이(offset)가 상단(y: 100 vs 90), 측면(x: 120 vs 130), 하단(y: 300 vs 290) 모두 10px로 일정함.
  - Conformal 특성(균일 두께)이 코드로 증명됨.
- **CVD (우측) 코드 분석:**
  - 상단 두께 20px (y: 100 vs 80), 하단 두께 5px (y: 300 vs 295)로 Non-conformal 특성 구현됨.
  - Overhang 구조: 코너에서 x=135로 돌출되어 입구(x=120)보다 좁아짐. 정확함.
  - Void: 타원(cx=175)이 트렌치 내부 중앙에 위치함.
- **텍스트:** "~10 nm", "~20 nm", "~5 nm" 등 수치 라벨이 시각적 비례와 일치함.

**PNG 시각 검증:**

#### 3. deal_grove_oxidation.png — [PASS]
- **데이터 정확성:**
  - Wet(청색): 60분일 때 200nm, 480분일 때 700nm 라인에 정확히 위치함.
  - Dry(적색): 60분일 때 약 35nm, 480분일 때 약 130nm로 데이터 스펙과 일치함.
- **텍스트/라벨:**
  - 축 제목, 범례, 타이틀 모두 선명함.
  - "선형 영역", "포물선 영역" annotation 위치 적절함.
  - Deal-Grove 수식 ($x^2 + Ax...$) 포함됨.
- **가독성:** 글자가 뭉개지거나 깨짐 없이 깔끔함.

**판정 사유:** 3장 모두 스펙의 핵심 요구사항(좌표 정밀도, 데이터 일치, 구성 요소)을 완벽히 충족함. SVG의 경우 좌표 계산 결과 Conformal/Non-conformal 특성이 수학적으로 정확히 구현되었음을 확인함.
