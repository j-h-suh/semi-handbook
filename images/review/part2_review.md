# Part 2 이미지 검수 리포트

## 02_01 — 포토리소그래피란
- track_scanner_inline_system.png: ✅ — TEL CLEAN TRACK + ASML TWINSCAN, 클린룸 환경, FOUP 포트, 노란 조명 모두 스펙 부합
- spin_coating_cross_section.svg: ✅ — 3패널 수평, Step 1~3 컴포넌트 완벽, 색상 일치, 80~150nm 라벨, EBR 표시
- reduction_projection_optics.svg: ✅ — 수직 400x700, 광원→조명광학계→마스크(40nm)→투영렌즈(4:1)→웨이퍼(10nm), 광선 수렴, 색상 일치
- photo_printing_vs_lithography.png: ✅ — 아날로그 vs 반도체 1:1 대응, 필름↔마스크/확대기↔스캐너/인화지↔웨이퍼/현상액↔현상액 화살표 포함

## 02_02 — 노광 시스템
- scanner_slit_scanning.svg: ✅ — 마스크(→v)/웨이퍼(←v/4) 반대방향, 슬릿 빔, 4:1 축소, 수차 최소화 주석, 26×33mm 노광필드
- asml_twinscan_scanner.png: ✅ — ASML TWINSCAN NXT:2100I, 블루-화이트, FOUP 포트, 클린룸 노란 조명
- dual_stage_concept.png: ✅ — Stage A(Measure)/Stage B(Expose), SWAP 화살표, 하단 타임라인 파이프라인, 블루/오렌지 코딩
- illumination_shapes.svg: ✅ — Conventional/Annular/Dipole/Quadrupole 4패널, 동공면 분포 정확, 색상 일치

## 02_03 — 광원의 진화
- euv_source_mechanism.svg: ✅ — 4단계 수평(드롭릿→Pre-pulse→Main pulse→Collector), 모든 라벨/치수/색상 일치, 50,000회 반복
- wavelength_vs_resolution.png: ✅ — 로그-로그, 8개 데이터포인트 정확, 마커 구분, 3영역 색상 배경, 멀티패터닝 주석
- duv_vs_euv_optics.png: ✅ — DUV 굴절(투과마스크/fused silica/Air Water OK) vs EUV 반사(반사마스크/Mo Si/Vacuum Required)

## 02_04 — 마스크와 펠리클
- euv_reflective_mask_cross_section.svg: ✅ — LTEM기판→Mo/Si 다층→캡핑층(Ru)→TaBN 흡수체, 6° 경사입사, 그림자 효과, 치수 마커
- phase_shift_mask_interference.png: ✅ — Binary vs Alternating PSM, 0°/180° 위상, 상쇄간섭, sharp peaks, improved resolution 라벨
- mask_set_cost_trend.png: ✅ — Bar+Line 5개 노드(28nm~3nm), 비용($2M~$20M)+마스크수(40~100장), EUV도입 화살표, ~200억원

## 02_05 — 포토레지스트
- spin_coating_3step.svg: ✅ — 3패널(디스펜스/고속회전/균일박막+EBR), 두께∝1/√rpm, ArF/EUV 두께, ±1nm 균일도
- rls_trilemma.svg: ✅ — 정삼각형 R/L/S 꼭짓점, 트레이드오프 라벨, 중앙 "광자 통계가 근본 원인", 색상 스펙 일치
- peb_temp_vs_cd.png: ✅ — PEB 온도(108~112°C) vs CD(18~24nm), 목표 20nm, 규격밴드(19~21nm), ±0.1°C, ~1-2nm/°C
- pr_profile_defects.svg: ✅ — 4패널(이상적/T-topping/Footing/Rounding), 프로파일 형상 정확, 결함 원인 설명

## 02_06 — 해상도와 DOF
- dof_concept_diagram.svg: ✅ — Low NA vs High NA 비교, 수렴 광선, Best Focus, DOF 영역, 웨이퍼 단차, DOF=k₂×λ/NA²
- process_window_dose_focus.png: ✅ — 3노드 중첩 타원(65nm/7nm/3nm), 미세화→윈도우 축소, Best Focus/Best Dose 마커
- bossung_curve.png: ✅ — Dense 3곡선(역U자)+Isolated(U자), CD규격 상한/하한(19~21nm), Best Focus
- na_resolution_dof_tradeoff.png: ✅ — 이중축 R+DOF, DUV/EUV 계열 분리, 6개 포인트, DOF∝1/NA²

## 02_07 — OPC와 RET
- opc_before_after.png: ✅ — 3패널 Design Intent→OPC Mask(Serif/Hammerhead/Bias)→Wafer Result
- ilt_mask_pattern.png: ✅ — ILT 비정형 곡면 패턴, 크롬/석영, 스케일바(1μm), Computational Optimization
- illumination_shapes_comparison.svg: ✅ — Annular/Dipole Y/Quadrupole/Freeform SMO, 동공면+k₁ 값 라벨

## 02_08 — Overlay란
- overlay_open_short_cross_section.svg: ✅ — 4패널(완벽정렬/미세오차/단선Open/단락Short), Via-Metal 구조, 접촉면적 표시
- wafer_distortion_patterns.png: ✅ — Bowl/Saddle/Higher-order 벡터맵, 블루(소)/레드(대), 노치
- mark_asymmetry_distortion.svg: ✅ — 대칭/비대칭 마크 비교, CMP 침식→가짜 중심→+2nm 가짜 오차, 4단계 메커니즘

## 02_09 — Overlay 측정 방법
- box_in_box_microscope.png: ✅ — Box-in-Box, L/R/T/B 간격, OVL_x=(L-R)/2 수식, 200x, 그레이스케일
- dbo_grating_mark_cross_section.svg: ✅ — OVL=0(대칭)/OVL≠0(비대칭), ±1차 회절 강도 비교, 바이어스 마크+OVL 공식
- sampling_map_comparison.png: ✅ — Fixed Grid vs AI-Optimized, 에지 집중, information gain 히트맵
- diffraction_principle.svg: ✅ — 입사광→합성격자→±1차/0차, 검출기, sinθ=mλ/P 회절 조건

## 02_10 — Overlay 에러 모델
- linear_6par_vector_map.png: ✅ — 2×3 그리드 Tx/Ty/R/Mx/My/Combined, 블루/레드 크기, 노치
- model_residual_comparison.png: ✅ — 5모델 잔차(6par→10par→HOWA→CPE→AI/ML), 3nm 공정 요구 라인

## 02_11 — CD 선폭 제어
- ler_lwr_sem_image.png: ✅ — CD-SEM, LER(3σ≈2nm)/LWR(3σ≈3nm)/CD 주석, 이상적 vs 실제 에지 비교
- global_cdu_wafer_heatmap.png: ✅ — 300mm 히트맵, Center(~20nm)/Edge(~22.5nm), RdYlBu_r, Edge Exclusion 3mm
- meef_vs_k1.png: ✅ — k₁(0.8→0.25) vs MEEF(0.9→4.2), MEEF=1 기준선, 위험영역, EUV MEEF 2~4

## 02_12 — CD 측정
- cd_sem_edge_profile.png: ✅ — Top-Down SEM + 이차전자 밝기 프로파일, 에지 피크, CD=20nm, 50% threshold
- ocd_spectrum_matching.png: ✅ — 실측 vs RCWA, 잔차 서브플롯, GOF=0.998, CD/H/SWA 추출
- cd_saxs_concept.png: ✅ — X-ray→나노구조→2D 회절패턴, GAA 나노시트 인셋, 비파괴 측정

## 02_13 — 멀티패터닝
- sadp_4step_cross_section.svg: ✅ — 4단계(맨드릴→스페이서 ALD→제거→전사), 피치 2P→P, 핵심 원리, 범례
- lele_overlay_pitch_variation.png: ✅ — Perfect(36nm)→OVL+2nm(16/20nm)→Consequence(커패시턴스/타이밍), 블루/레드 구분
- arf_saqp_vs_euv_sp_comparison.png: ✅ — Grouped bar 공정단계/마스크수/비용, 36nm 목표, TCO 절감

## 02_14 — EUV 리소그래피 심화
- euv_stochastic_defects_sem.png: ✅ — Micro-Bridge/Line Break/Missing Contact 3종 SEM, 100kx, 화살표 표시
- euv_scanner_installation_trend.png: ✅ — Stacked bar 2017~2025, TSMC/Samsung/Intel/Others, N7+ 양산, High-NA 주석
- anamorphic_4x_8x_reduction.png: ✅ — Current(4:1 대칭, 26×33mm) vs High-NA(4:1×8:1 아나모픽, 26×16.5mm), Stitching

---

## 검수 요약
- **총 이미지**: 46개
- **✅ 통과**: 46개
- **⚠️ 경미**: 0개
- **❌ 재생성**: 0개

**결론**: Part 2 전체 46개 이미지 모두 스펙과 정확히 부합. 재생성 필요한 이미지 없음.
