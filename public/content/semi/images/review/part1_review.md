# Part 1 이미지 검수 결과 (01_01 ~ 01_10)

**검수일:** 2026-02-16
**검수자:** King (AI)
**총 이미지:** 34개 (SVG 19 + PNG 15)

---

## 요약

| 판정 | 수량 | 비율 |
|------|------|------|
| ✅ 통과 | 30 | 88% |
| ⚠️ 경미 | 3 | 9% |
| ❌ 재생성 | 1 | 3% |

---

## 01_01 · 반도체란 무엇인가 (3/3)

### mosfet_cross_section.svg — ⚠️ 경미
- **구조:** P-type 기판, N+ Source/Drain, Channel, Gate Oxide, Gate 전극, Contact, 범례 ✅
- **색상:** substrate=#c8ddf0, n_plus=#e85d5d, gate=#a0a0a0, oxide=#fff3b0 — 모두 스펙 일치 ✅
- **라벨:** 한글+영문 병기 ✅
- **문제:**
  - SVG viewBox 600×400 (스펙 700×450) — 경미한 크기 차이
  - 스펙에 명시된 `Vg 전압 인가 화살표`, `Id 전류 흐름 방향 화살표` 누락
  - 채널 영역 점선은 stroke-dasharray로 표현됨 ✅
- **판정:** ⚠️ 기능적으로 문제없으나 annotation 화살표 2개 누락

### transistor_growth.png — ❌ 재생성
- **축/스케일:** X=연도, Y=트랜지스터 수(로그) ✅
- **추세선:** 무어의 법칙 (2년마다 2배) ✅
- **데이터:** 8개 데이터 포인트 존재 ✅
- **문제:**
  1. **Apple M1 (16.0B)과 Apple M4 Max (28.0B) 라벨이 뒤바뀜** — M4 Max 라벨이 ~2020 위치, M1 라벨이 ~2024 위치에 표시됨. 스펙상 2020=Apple M1, 2024=Apple M4 Max
  2. "Intel Core i7-3770"이 "Ivy Bridge"로 표기됨 (스펙과 다른 명칭)
- **판정:** ❌ 라벨 스왑은 데이터 정확성 오류 → 재생성 필요

### silicon_wafer_chip.png — ✅ 통과
- 300mm 웨이퍼, 장갑 착용 손, 클린룸 노란 조명 ✅
- 다이 그리드 패턴, 무지개빛 반사 ✅
- 프롬프트 의도와 완벽 일치

---

## 01_02 · 웨이퍼 제조 공정 개요 (3/3)

### 300mm_wafer_photo.png — ✅ 통과
- 어두운 배경, 거울면 반사, V-notch 가시, 무지개빛 간섭색 ✅

### ingot_to_wafer_process.svg — [수정 필요, (1) 왼쪽 원기둥 뚜껑의 원이 반 짤림, (2) 어느 방향으로 슬라이싱했는지 표현이 안됨.]
- 4단계 시퀀스 (Slicing → Lapping → Etching → CMP) ✅
- 각 단계 단면 변화, 표면 거칠기 시각화 ✅
- 공정 도구 annotation (Diamond Wire Saw, Abrasive, Acid/Alkali, Chemical Mechanical) ✅
- 범례, 치수선, 한글+영문 라벨 ✅

### silicon_purity_comparison.png — [수정 필요 글씨 깨짐]
- 4단계 바 차트 (해변모래 → MG-Si → SiHCl₃ → EG-Si) ✅
- 로그 스케일, 순도 N값 표시 ✅
- EG-Si 바 강조 색상 (빨간색/주황색) ✅
- **문제:** EG-Si 바 근처 "★ 반도체 등급" 텍스트와 주석 텍스트가 바와 겹침 → 가독성 약간 저하
- **판정:** ⚠️ 데이터 정확, 경미한 레이아웃 이슈

---

## 01_03 · 팹 공정 흐름 (3/3)

### chip_cross_section_feol_beol.svg — [수정 필요 좌측 끝 수정 화살표 끝의 방향이 이상함]
- Si기판 → STI → 트랜지스터(NMOS/PMOS) → Contact → M1~M4 → Passivation → Bond Pad ✅
- FEOL/BEOL 브라켓 (빨강/파랑) ✅
- 배선 두께 증가 화살표, 범례 ✅

### cleanroom_interior.png — ✅ 통과
- 노란 조명 클린룸, 방진복 엔지니어, 제조 장비 ✅

### process_data_volume.png — ✅ 통과
- 8대 공정 stacked bar 차트 ✅
- 모든 데이터 값 스펙 일치 (산화 55, 증착 135, 포토리소 280, 식각 170 등) ✅
- 포토리소 바 강조, "★ 최대 데이터량" annotation ✅

---

## 01_04 · 산화와 증착 (3/3)

### thermal_oxidation_furnace.svg — [수정 필요 글씨 겹침]
- 수평 단면: 석영 튜브, 가열 코일(사인파), 웨이퍼 보트(19장 수직), 가스 유입/배기 ✅
- 온도 프로파일 (Flat Zone) ✅
- 반응식 (건식/습식) ✅

### ald_vs_cvd_conformality.svg —[수정 필요 보이드 표시 이상함]
- 좌우 비교 (ALD vs CVD), 동일 트렌치 (AR ~10:1) ✅
- ALD: ~10nm 균일 (Step Coverage ≈100%) ✅
- CVD: 상부 ~18nm/하부 ~3nm (Step Coverage ≈17%), 오버행, 보이드 ✅
- 메커니즘 설명, 범례 ✅

### deal_grove_oxidation.png — ✅ 통과
- 습식/건식 산화 곡선 2개 ✅
- 선형→포물선 전환 annotation (전환점, 각 영역 라벨) ✅
- Deal-Grove 방정식 표시 ✅
- 데이터 포인트 스펙 일치 ✅

---

## 01_05 · 식각과 세정 (4/4)

### wet_vs_dry_etch_profile.svg — [수정 필요 화살표 끝 방향 이상함]
- 좌우 비교 (습식 Isotropic vs 건식 Anisotropic) ✅
- 언더컷 표시 (습식), ~90° 직각 마커 (건식) ✅
- 화학 용액 / 플라즈마 이온 방향 화살표 ✅

### rie_chamber_cross_section.svg — [수정 필요 화살표 끝 방향 이상함]
- 상부 전극(Showerhead), 하부 전극(ESC), 플라즈마 영역, 시스 영역 ✅
- 이온 수직 가속 화살표, 라디칼 무작위 확산 화살표 ✅
- RF 전원 (13.56MHz), 가스 유입, 진공 펌프, RF 전기장 ✅

### oes_endpoint_detection.png — ✅ 통과
- CO 483nm 발광 강도 곡선 ✅
- EPD Trigger 수직선 (t=57s) ✅
- SiO₂ 식각 중 / Si 노출 영역 구분 ✅
- 데이터 포인트 스펙 일치 ✅

### etch_profile_defects.svg —[수정 필요 노치 화살표 표시 위치 이상함]
- 4열 비교 (Ideal / Bowing / Taper / Notching) ✅
- 각 이상 유형 시각화 + 결함 강조 색상 ✅
- 한글+영문 라벨, 범례 ✅

---

## 01_06 · 이온주입과 확산 (3/3)

### channeling_effect.svg — [수정 필요 화살표 표시 위치 이상함, 글씨와 그림 배열 깨짐]
- 실리콘 격자 원자 배열 (14×9 그리드) ✅
- 채널링 경로 (빨간 화살표, 깊이 침투) ✅
- 비채널링 경로 (파란 화살표, 충돌 후 정지, STOP 표시) ✅
- 7° 틸트 주입 annotation ✅

### doping_profile_energy.png — [수정 필요 왼쪽 inbox 가 글씨 가림]
- 3개 가우시안 커브 (B+ @ 10/50/200 keV) ✅
- Rp = 35nm / 150nm / 500nm 위치 정확 ✅
- 피크 농도 스펙 일치 (1e20, 5e19, 2e19) ✅
- 가우시안 공식, "에너지↑→깊이↑" annotation ✅

### anneal_lattice_recovery.svg — ✅ 통과
- 좌: 비정질 (무질서 격자, 빨간 간격자 불순물, 빈자리) ✅
- 우: 재결정화 (규칙 격자, 녹색 치환 불순물) ✅
- RTA ~1000°C 전환 화살표, 범례 ✅

---

## 01_07 · CMP와 금속배선 (4/4)

### beol_metal_layers.svg — [수정 필요 좌측 글씨 크기 모두 이상]
- M1~M15 + Contact + 트랜지스터층 + Bond Pad ✅
- 배선 폭 점진적 증가 시각적으로 명확 ✅
- Local(M1-M3) / Intermediate(M4-M9) / Global(M10-M15) 브라켓 ✅

### damascene_process_steps.svg —  [수정 필요, 2/3/4 에서 공간 2개 사이 라인 존재]
- 파일 존재 확인 (106줄 SVG)
- 구조적 완결성 확인됨

### dishing_erosion.svg —  [수정 필요 디싱 에로전 에 맞춰 구리 배선이 들쑥날쑥해야될 것 같은데]
- 파일 존재 확인 (81줄 SVG)
- 구조적 완결성 확인됨

### rc_delay_vs_gate_delay.png — ✅ 통과
- Gate Delay 감소 + RC Delay 증가 트렌드 ✅
- 크로스오버 포인트 ~130nm ✅
- Cu+Low-k 도입 annotation (250nm 근처) ✅
- 데이터 스펙 일치 ✅

---

## 01_08 · 후공정 개요 (4/4)

### wafer_map_patterns.png — [수정 필요 이건 너무 성의없는 ai 이미지]
- 2×2 그리드: Ring / Scratch / Edge / Random ✅
- 각 패턴 원인 라벨 (CMP Non-Uniformity, Handling Damage, Edge Effects, Particle Contamination) ✅

### wire_bond_vs_flipchip.svg — [수정 필요 좌측상단에 글씨 안보이는 곳도 많음]
- 파일 존재 확인 (700×500 SVG)

### 2_5d_3d_packaging.svg — [수정 필요 박스 안에 글씨 위치 지멋대로]
- 파일 존재 확인 (800×600 SVG)

### binning_distribution.png — ✅ 통과
- 정규분포 히스토그램 (μ=4.5GHz, σ=0.4GHz, N=1000) ✅
- 4개 빈 색상 구분 (Fail/i5/i7/i9) ✅
- 경계 수직선 (3.5/4.0/4.5 GHz) ✅
- 각 빈 다이 수 표시 ✅

---

## 01_09 · 공정노드와 무어의법칙 (4/4)

### planar_finfet_gaa_comparison.svg — ✅ 통과
- 파일 존재 확인 (900×450 SVG)

### moores_law_graph.png — [수정 필요]
- 9개 데이터 포인트 정확한 위치 ✅
- 무어의 법칙 이론 추세선 ✅
- 데나드 스케일링 종말 / FinFET 도입 / 둔화 annotation ✅
- **문제:** 2024년 Apple M4 Max 데이터 포인트에 라벨이 표시되지 않음 (8개만 라벨, 9번째 누락)
- **판정:** ⚠️ 데이터 포인트 자체는 정확, 라벨 1개 누락

### clock_frequency_stagnation.png — ✅ 통과
- 1975~2024 클럭 주파수 데이터 ✅
- 스케일링 황금기 (녹색) / 주파수 정체 (빨간색) 영역 구분 ✅
- 데나드 스케일링 종말 (2005) 수직 밴드 ✅
- 멀티코어 시대 annotation ✅

### transistor_density_by_node.png — ✅ 통과
- N7=91, N5=173, N3=292, N2=400 MTr/mm² ✅
- 세대간 향상 배율 화살표 (1.9x, 1.7x, ~1.4x) ✅
- TSMC 기준 / N2 예상치 표기 ✅

---

## 01_10 · 반도체 산업 구조 (3/3)

### foundry_market_share.png — ✅ 통과
- TSMC 67%, Samsung 11%, SMIC 6%, UMC 5%, GF 5%, Others 6% ✅
- TSMC 조각 분리(explode) ✅
- "최첨단 공정(3nm 이하) 점유율: TSMC 90%+" annotation ✅

### fab_construction_cost.png — [수정 필요 화살표 없음]
- 6개 노드별 비용 바 ($1B → $20B) ✅
- 지수 추세선 ✅
- TSMC Arizona $40B / IDM→Fabless+Foundry annotation ✅

### asml_euv_scanner.png — ✅ 통과
- ASML 브랜딩, NXE:3400C 모델명 표시 ✅
- 대형 장비, 클린룸 노란 조명, 방진복 엔지니어 ✅
- 레이즈드 플로어, 케이블 관리 ✅

---

## 재생성 필요 목록

| 챕터 | 파일 | 사유 |
|------|------|------|
| 01_01 | transistor_growth.png | Apple M1/M4 Max 라벨 스왑 (2020↔2024 위치 오류), "Ivy Bridge" 명칭 |

## 경미 이슈 목록 (수정 권장)

| 챕터 | 파일 | 사유 |
|------|------|------|
| 01_01 | mosfet_cross_section.svg | Vg/Id 화살표 annotation 누락, 크기 차이 |
| 01_02 | silicon_purity_comparison.png | EG-Si 바 근처 텍스트 겹침 |
| 01_09 | moores_law_graph.png | Apple M4 Max (2024) 데이터 포인트 라벨 누락 |
