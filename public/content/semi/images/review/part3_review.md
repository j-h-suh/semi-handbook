# Part 3 이미지 검수 리포트

검수일: 2025-02-16
담당 범위: 03_01 ~ 03_09 (총 27개 이미지)

---

## 03_01 — 수율의 이해

- yield_vs_d0a_three_models.png: ⚠️ — 4곡선/축/범위/주석 모두 정확. D₀ 아래첨자가 D0으로 렌더링됨. 배경색이 whitegrid 대신 회색톤.
- yield_rampup_scurve.png: ✅ — S-커브/4구간/AI 하이라이트/데이터 포인트 모두 스펙 일치.
- wafer_map_pattern_types.png: ⚠️ — 5종 패턴/라벨/범례 정상. (1) 상단 3개 라벨 위아래 중복, (2) Ring 패턴이 동심원보다 edge/cluster에 가까움, (3) 배치가 행이 아닌 3+2 그리드.

## 03_02 — 결함 검사와 분류

- defect_sem_types.png: ✅ — 3종 SEM, 100nm 스케일바, 밝은 엣지 효과, 라벨 정확.
- voltage_contrast_principle.png: ✅ — Normal vs Open 비교, e-beam/전하/밝기 비교바 모두 정확.
- bf_vs_df_inspection.svg: ✅ — BF/DF 광학 원리, 컬러 코드, 결과/범례 모두 스펙 일치.

## 03_03 — SPC

- control_vs_spec_limits.svg: ✅ — 정규분포/CL/UCL/LCL/USL/LSL/마진/메시지/범례 완벽.
- weco_rules_patterns.svg: ✅ — 2×2 그리드, 4규칙 데이터 정확, 하이라이트 색상/심각도 배지 정상.
- cp_vs_cpk_visualization.png: ✅ — 공정 A/B 분포, LSL/USL/Target, Cp/Cpk 수식, 주석 모두 정확.
- multivariate_spc_t2_chart.png: ✅ — T² 관리도, UCL=9.49, OOC 표시, 인셋 산점도/타원/주석 정상.

## 03_04 — FDC

- normal_vs_abnormal_trace.png: ⚠️ — 정상/이상 trace, 아킹 이벤트 2개, 구간 배경색, 주석상자 정확. "Stabilization" 라벨이 범례에 가려져 부분 절단.
- autoencoder_reconstruction_error.png: ✅ — 정상/이상 히스토그램, Threshold=0.03, 영역 구분, 성능 지표 모두 정확.
- equipment_health_dashboard.png: ✅ — 6개 게이지(값/색상 일치), PM 타임라인, RF Power 추이, 알림 패널 정확.

## 03_05 — APC

- apc_cd_before_after.png: ✅ — 보정 전/후 분포, LSL/USL/Target, 메트릭스(Cpk 0.38→1.43) 정확.
- ff_fb_combined_correction.svg: ✅ — FF(초록)/FB(빨강)/Offset(주황) 경로, Σ, 피드백 루프, 수식상자 완벽.
- cross_layer_apc.svg: ✅ — 독립 APC vs Cross-Layer AI Controller, 양방향 화살표, 웨이퍼 단면도 정확.

## 03_06 — VM

- vm_predicted_vs_actual.png: ✅ — 산점도, y=x 선, 회귀선, 95% 신뢰대역, 메트릭스(R²=0.92) 정확.
- ri_distribution_threshold.png: ✅ — RI 분포(좌편향), 2개 임계값, 3구간 색상, Active Learning 주석 정확.
- vm_model_degradation.png: ✅ — R² 시계열, 점진/급격 열화, PM/재학습 이벤트 마커, 임계값 0.80 정확.

## 03_07 — 웨이퍼맵 분석

- wafer_map_8_patterns.png: ⚠️ — 8종 패턴, 한/영 라벨, 원인 표시 정확. Ring 패턴이 얇은 동심원이 아닌 두꺼운 환형 영역으로 표현됨.
- mixed_pattern_decomposition.png: ⚠️ — 혼합→분해 개념, CNN 아키텍처, 시그모이드 출력값 정확. Ring Component가 동심원보다 중심 클러스터에 가까움.

## 03_08 — 데이터 인프라

- modern_data_architecture.svg: ✅ — 5레이어, 모든 컴포넌트, 데이터 플로우 화살표, 지연시간 주석 완벽.
- data_matching_join.svg: ✅ — 3개 테이블, Join 심볼, 이슈 콜아웃, 5가지 어려움, 결과 테이블 완벽.
- fab_data_volume_by_source.png: ✅ — 로그 스케일, 5소스 정확한 볼륨/색상, 합계/비율 주석 정확.

## 03_09 — 반도체 데이터 특성

- variance_decomposition_pie.png: ✅ — 6성분 파이차트, 정확한 비율/색상, 개선 우선순위 패널, 수식상자 정확.
- kriging_spatial_interpolation.png: ✅ — 3단계(측정→보간→불확실성), 컬러바, 주석 정확. 레이아웃이 가로 대신 L형이나 내용 정확.
- spatiotemporal_data_cube.svg: ✅ — 등각 투영 큐브, 웨이퍼 히트맵 슬라이스, 3축, 절단면 주석, 구조 라벨, 핵심 메시지 완벽.

---

## 요약

| 판정 | 개수 |
|------|------|
| ✅ 통과 | 21 |
| ⚠️ 경미 | 6 |
| ❌ 재생성 | 0 |

### ⚠️ 경미 사항 목록
1. `03_01/yield_vs_d0a_three_models.png` — D₀ 아래첨자 미표현, 배경색
2. `03_01/wafer_map_pattern_types.png` — Ring 패턴 부정확, 라벨 중복, 레이아웃
3. `03_04/normal_vs_abnormal_trace.png` — Stabilization 라벨 부분 가림
4. `03_07/wafer_map_8_patterns.png` — Ring 패턴이 두꺼운 환형
5. `03_07/mixed_pattern_decomposition.png` — Ring Component가 중심 클러스터형
6. `03_01/wafer_map_pattern_types.png`과 `03_07`의 Ring 패턴 이슈는 AI 생성 이미지 한계로, 교육 목적으로는 사용 가능하나 정밀도 개선 여지 있음
