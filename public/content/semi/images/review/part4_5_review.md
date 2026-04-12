# Part 4~5 이미지 검수 리포트

검수일: 2026-02-16
검수자: Queen (서브에이전트)
총 이미지: 44개 (Part 4: 30개, Part 5: 14개)

## 요약
- ✅ 통과: 37개
- ⚠️ 경미: 6개
- ❌ 재생성: 1개

---

## 04_01 — 반도체 AI 문제정의
- img01 (asymmetric_loss_function.png): ✅ — 비대칭 손실 곡선 정확, MSE 대칭 곡선 대비 음의 오차 쪽 2배 가중 정확 표현, 축 라벨/색상 일치
- img02 (pareto_front_cd_ovl.png): ✅ — Pareto front 7개 포인트, dominated 8개 포인트 모두 스펙 일치, ★ 마커/회색 원 색상 정확, 주석 정확

## 04_02 — 피처 엔지니어링
- img01 (trace_settling_overshoot.png): ❌ — Overshoot 값 불일치: 스펙 550W/10% vs 이미지 655W/30.9%. Overshoot 주석에 문자 깨짐(□). 파형 형태도 스펙의 key_points와 불일치(과도한 진동). 재생성 필요
- img02 (feature_importance_top20.png): ⚠️ — Y축 라벨("피처명")이 왼쪽 경계에서 잘림/깨짐, "Temp_Top□Temp_Bottom" 마이너스 기호가 □로 렌더링. 20개 피처 데이터 및 색상 구분(도메인/FDC/공간/Cross-Layer)은 정확
- img03 (cross_layer_r2_comparison.png): ✅ — 3개 바(0.72/0.82/0.88), 색상(파랑/초록/빨강), +10%p/+6%p/총+16%p 주석 모두 정확

## 04_03 — 모델 학습과 검증
- img01 (random_vs_time_split_r2.png): ✅ — 3개 바(0.95/0.85/0.70), "랜덤 분할의 환상 0.25 갭!", "실전 갭 0.15", 실전 최소 요구 수준(0.80) 점선 모두 정확
- img02 (sliding_window_visualization.svg): ✅ — Expanding/Sliding 3회차씩 정확, PM 이벤트 마커(3월 초), 폐기 데이터 X표시, 색상(Train 파랑/Test 빨강/폐기 회색/PM 주황) 일치

## 04_04 — 모델 해석과 신뢰
- img01 (shap_waterfall_cd.png): ⚠️ — 기본값(20.0nm)→최종(21.3nm), 5개 피처 기여도 모두 정확. 하단 주석 텍스트("가장 큰 기여...", "총 변화...")가 범례와 일부 겹침. 내용 정확하므로 재생성 불필요
- img02 (shap_beeswarm_cd.png): ✅ — 10개 피처 중요도 순, 500개 데이터 포인트, Low(파랑)→High(빨강) 색상바, 각 피처별 SHAP 패턴(Focus_오차²↑→CD↑, Dose×두께↑→CD↓ 등) 물리적으로 정합
- img03 (physics_informed_hybrid_model.svg): ✅ — 입력→물리모델(파랑)→ŷ_physics, 잔차계산→ML모델(빨강, XGBoost)→합산(보라Σ)→최종출력(초록). 모든 블록/화살표/색상/수식 정확

## 04_05 — MLOps
- img01 (data_drift_psi_trend.png): ⚠️ — PEB_온도/RF_Power/Dose_실측 3개 시리즈 패턴 정확(PM 후 PEB 상승, 레지스트 변경 후 0.2 초과). "재학습 트리거!" 주석에서 ⚠️ 이모지가 □□로 렌더링됨. 데이터/임계선/이벤트 마커는 정확
- img02 (model_registry_timeline.svg): ✅ — v1.0~v2.1 버전 노드, R²/학습기간/상태(Archived/Production/Staging) 정확, 롤백(빨강)/배포(초록) 화살표 정확

## 04_06 — 딥러닝 in 반도체
- img01 (resnet18_sem_architecture.svg): ✅ — Input(SEM 64×64)→Conv1→MaxPool→ResBlock1~4→GAP→FC→Output. Skip Connection(주황 점선), downsample 표시, 결함 클래스 목록, 하단 주석 모두 정확
- img02 (gan_generated_defect_samples.png): ✅ — Real/GAN Generated 2행 ×4열 비교(Bridge/Line Break/Particle/Residue). 그레이스케일 SEM 스타일, 프롬프트 의도에 부합
- img03 (dl_vs_xgboost_performance.png): ✅ — 5개 태스크별 XGBoost vs DL 그룹 바. 수치(88/96, 91/97, 88/87, 85/92, N/A/95) 모두 정확, "이미지에서 DL 압도적 우위"/"정형 데이터에서는 XGBoost ≥ DL" 주석 정확

## 04_07 — 전이학습과 도메인적응
- img01 (domain_gap_vs_transfer_performance.png): ✅ — 5개 시나리오(PM 전후→장비 간→제품 간→팹 간), 전이 없음(회색X)/전이 적용(빨강●) 2시리즈, "오프셋 보정만으로 충분"/"물리 모델 + Federated Learning" 주석 정확
- img02 (federated_learning_architecture.svg): ⚠️ — 3개 팹(대만/미국/한국) 삼각형 배치, 중앙 Aggregator, 양방향 가중치 화살표, 🔒 Data Privacy Boundary 정확. 스펙의 "W_avg = (W_A + W_B + W_C) / 3" 수식 미표시, GPU 아이콘 대신 "로컬 데이터 유지" 텍스트. 구조/흐름은 정확
- img03 (few_shot_data_vs_performance.png): ✅ — Zero-Shot(0/0.45)→Few-Shot(50/0.72)→Fine-Tuning(300/0.82)→처음부터(3000/0.88), 로그 스케일, 수확 체감 곡선 정확

## 04_08 — 강화학습과 최적화
- img01 (pareto_front_cd_ovl_optimization.png): ✅ — Pareto front 8포인트(빨강), non-pareto 8포인트(회색), 엔지니어 선택점(초록 ★, 1.4/1.9), Hypervolume 음영, CD 우선/OVL 우선 주석 정확
- img02 (gp_surrogate_acquisition.png): ⚠️ — 2행 서브플롯(GP+EI) 구조 정확. GP: 5개 관측점, 평균 곡선, ±2σ 밴드, 현재 최적(Dose=25, CD=0.4) 정확. EI: 곡선 패턴이 과도하게 진동(실제 EI보다 비현실적), 다음 탐색점이 범위 경계(30)에 위치. 개념 전달은 되나 EI 형태가 이상적이지 않음
- img03 (safe_exploration_stages.svg): ✅ — 동심원 3단계(±1%/±2%/±5%), Hard Bounds(±10% 빨강 점선), Spec Limit, 중앙 최적점(Dose=25, Focus=0), 축(Dose×Focus) 정확

## 04_09 — LLM과 생성AI
- img01 (tool_using_agent_architecture.svg): ✅ — LLM 에이전트(보라) 중앙, 5개 도구(SQL/웨이퍼맵/FDC/RAG/VM) 방사형 배치, 엔지니어 입력→종합 답변 흐름, 챕터 참조(§3.2~4.9) 정확
- img02 (onpremise_vs_cloud_llm.svg): ✅ — 좌(Cloud: ★★★★★, 데이터 전송 불가)우(On-Premise: ★★★~★★★★, 데이터 활용 가능) 대칭 비교, 보안 경계(🛡️), 공통 한계 4항목 정확

## 04_10 — 종합실습 SMILE
- img01 (smile_system_architecture.svg): ✅ — 장비→Kafka→추론(Edge: 피처엔진/VM/APC)→모니터링, 학습(Central: Spark/GPU/MLflow), 피드백 루프(APC→스캐너, 모니터링→재학습), 프로토콜 라벨 모두 정확
- img02 (smile_development_roadmap.svg): ✅ — Phase 1~4(PoC/배포/확장/고도화), 기간/목표/마일스톤 정확, Shadow→Advisory→Semi-Auto→Full Auto 자동화 단계 바 정확
- img03 (smile_dashboard_mockup.png): ✅ — Grafana 스타일 다크 테마, VM Performance(RMSE=0.423nm, HEALTHY), Data Drift(PSI 바, 0.2 임계선), APC Correction(94%, 2 clampings, CD 3σ=1.2nm) 정확

## 05_01 — 차세대 리소그래피
- img01 (anamorphic_optics_concept.svg): ✅ — 좌(기존 EUV: 4:1×4:1, 26mm×33mm) 우(High-NA: 4:1×8:1, 26mm×16.5mm) 비교, 마스크→렌즈→웨이퍼 경로, 스캔 방향, 스티칭 주석 정확
- img02 (nextgen_litho_comparison.png): ✅ — 4개 기술(EUV/High-NA/DSA/NIL) × 4개 메트릭, 5점 만점 정규화, 양산 상태 라벨 정확
- img03 (nil_imprint_principle.png): ✅ — 4단계(Approach/Press/UV Cure/Separate) 단면도, 파랑 몰드/노랑 레지스트/회색 기판, sub-14nm 치수 주석 정확
- img04 (litho_tech_application_map.svg): ✅ — 3-circle 벤다이어그램(High-NA EUV/DSA/NIL), 각 기술 적용 영역/해상도/양산 시점, 중앙 "공존의 미래" 정확

## 05_02 — 반도체 AI 미래트렌드
- img01 (autonomous_fab_maturity.svg): ✅ — Level 1~5 계단형 상승, AI/인간 역할/예시/AI비중 바, 현재 위치(Level 2~3) 빨강 마커, 협업 최적점(Level 3~4) 정확
- img02 (foundation_model_architecture.svg): ✅ — 다수 팹 데이터→Pre-training→Foundation Model Core→Fine-Tuning→Applications(VM/FDC/APC/수율/PHM), Federated Learning/Few-Shot 주석 정확
- img03 (edge_ai_latency_comparison.png): ✅ — 6단계 수평 바, 서버 AI(1,220ms, 빨강) vs Edge AI(20ms, 초록), "61x 개선!" 강조, 서버 전송 제거 핵심 메시지 정확
- img04 (semiconductor_ai_roadmap_timeline.svg): ✅ — 2026~2030+ 5개 연도, 3 트랙(리소그래피/AI-ML/팹 자율화), NOW 마커(2026), 각 마일스톤 정확

## 05_03 — 커리어 패스
- img01 (cross_competency_venn.svg): ✅ — 2-circle 벤다이어그램(AI/ML 전문가 파랑 + 반도체 엔지니어 주황), 교집합 "반도체 AI 엔지니어" 강조, 주석(순수 AI/순수 반도체 한계) 정확
- img02 (job_role_radar_chart.png): ✅ — 6축(ML/DL, 데이터 엔지니어링, 반도체 공정 지식, 소프트웨어 개발, 물리/광학, 커뮤니케이션), 5 직무 반투명 영역, 색상 구분 정확
- img03 (career_growth_timeline.svg): ✅ — 주니어→시니어→분기점(리더 트랙/IC 트랙), 구조/색상 스펙 일치
- img04 (semiconductor_ai_market_growth.png): ✅ — 이중축 차트(AI 기여 가치 바 + 전체 시장 선), 2023~2030 7개 데이터포인트, 모든 수치($1.6B~$25.5B, $520B~$850B) 정확

## 05_04 — 에필로그
- img01 (semiconductor_ai_formula.svg): ✅ — 물리 이해 + 데이터 역량 + ML 적용 + 현장 신뢰 = 반도체 AI 엔지니어 수평 공식, Part 참조(1-2/3/4/4.4), 색상 구분 정확
- img02 (handbook_knowledge_map.svg): ✅ — Part 1~5 블록(10/14/9/10/4챕터), 핵심 교훈, 교차 연결선, 5-block 수평 흐름 구조 정확

---

## 재생성 필요 목록

| # | 챕터 | 파일명 | 사유 |
|---|------|--------|------|
| 1 | 04_02 | trace_settling_overshoot.png | Overshoot 값 불일치 (스펙 10%/550W vs 이미지 30.9%/655W), 문자 깨짐 |

## 경미 이슈 목록 (재생성 불필요)

| # | 챕터 | 파일명 | 사유 |
|---|------|--------|------|
| 1 | 04_02 | feature_importance_top20.png | Y축 라벨 잘림, 마이너스 기호 □ 렌더링 |
| 2 | 04_04 | shap_waterfall_cd.png | 하단 주석-범례 겹침 |
| 3 | 04_05 | data_drift_psi_trend.png | ⚠️ 이모지 □□ 렌더링 |
| 4 | 04_07 | federated_learning_architecture.svg | 가중치 평균화 수식 미표시 |
| 5 | 04_08 | gp_surrogate_acquisition.png | EI 곡선 과도 진동 |
