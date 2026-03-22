# 프로젝트 메모리

이 문서는 세션 간 유지해야 할 프로젝트 규칙, 결정사항, 주의점을 기록합니다.

---

## 1. 다이어그램 디자인 토큰

모든 다이어그램 컴포넌트는 `src/components/diagrams/diagramTokens.ts`에서 `FONT`, `COLOR`를 import하여 사용한다. **하드코딩 금지.**

```
FONT.title      = 18px   (차트 제목)
FONT.cardHeader = 15px   (카드/툴팁 헤더)
FONT.subtitle   = 14px   (영문 부제)
FONT.body       = 14px   (축 라벨, 보조 텍스트)
FONT.small      = 13px   (본문, 스펙)
FONT.min        = 12px   (최소 허용 — 이보다 작은 텍스트 금지)
```

## 2. 다이어그램 컴포넌트 등록 방법

1. `src/components/diagrams/` 에 컴포넌트 생성
2. `diagramRegistry.ts`에 dynamic import + 경로 매핑 추가
3. 마크다운에서 `![alt](/content/images/XX_XX/filename.svg)` 형태로 참조
4. `MarkdownViewer.tsx`가 `<img>` 태그를 찾아 해당 React 컴포넌트로 교체

## 3. 등록된 다이어그램 목록

| 경로 | 컴포넌트 | 챕터 |
|------|----------|------|
| `01_01/mosfet_cross_section.svg` | `MOSFETCrossSection` | 1.1 |
| `01_01/transistor_growth.png` | `TransistorGrowth` | 1.1 |
| `01_01/chip_process_flow.svg` | `ChipProcessFlow` | 1.1 |
| `01_02/silicon_purity_comparison.png` | `SiliconPurity` | 1.2 |
| `01_02/ingot_to_wafer_process.svg` | `IngotToWafer` | 1.2 |
| `01_02/crystal_orientation.svg` | `CrystalOrientation` | 1.2 |
| `01_03/frontend_process_flow.svg` | `FrontEndProcessFlow` | 1.3 |
| `01_03/chip_cross_section_feol_beol.svg` | `ChipCrossSection` | 1.3 |
| `01_03/process_data_volume.png` | `ProcessDataVolume` | 1.3 |
| `01_04/thermal_oxidation_furnace.svg` | `ThermalOxidationFurnace` | 1.4 |
| `01_04/deal_grove_oxidation.png` | `DealGroveOxidation` | 1.4 |
| `01_04/ald_vs_cvd_conformality.svg` | `ALDvsCVDConformality` | 1.4 |
| `01_05/wet_vs_dry_etch_profile.svg` | `WetVsDryEtchProfile` | 1.5 |
| `01_05/rie_chamber_cross_section.svg` | `RIEChamber` | 1.5 |
| `01_05/etch_profile_defects.svg` | `EtchProfileDefects` | 1.5 |
| `01_05/oes_endpoint_detection.png` | `OESEndpointDetection` | 1.5 |
| `01_06/doping_profile_energy.png` | `DopingProfileEnergy` | 1.6 |
| `01_06/channeling_effect.svg` | `ChannelingEffect` | 1.6 |
| `01_06/anneal_lattice_recovery.svg` | `AnnealLatticeRecovery` | 1.6 |
| `01_07/cmp_necessity.svg` | `CMPNecessity` | 1.7 |
| `01_07/dishing_erosion.svg` | `DishingErosion` | 1.7 |
| `01_07/beol_metal_layers.svg` | `BEOLMetalLayers` | 1.7 |
| `01_07/damascene_process_steps.svg` | `DamasceneProcessSteps` | 1.7 |
| `01_07/rc_delay_vs_gate_delay.png` | `RCDelayVsGateDelay` | 1.7 |
| `01_08/wire_bond_vs_flipchip.svg` | `WireBondVsFlipchip` | 1.8 |
| `01_08/binning_distribution.png` | `BinningDistribution` | 1.8 |
| `01_08/2_5d_3d_packaging.svg` | `Packaging2_5D3D` | 1.8 |
| `01_08/wafer_map_patterns.png` | `WaferMapPatterns` | 1.8 |
| `01_09/moores_law_graph.png` | `MooresLawGraph` | 1.9 |
| `01_09/transistor_density_by_node.png` | `TransistorDensityByNode` | 1.9 |
| `01_09/clock_frequency_stagnation.png` | `ClockFrequencyStagnation` | 1.9 |
| `01_09/planar_finfet_gaa_comparison.svg` | `PlanarFinFETGAA` | 1.9 |
| `02_05/positive_vs_negative_resist.svg` | `PositiveVsNegativeResist` | 2.5 |
| `02_05/peb_temp_vs_cd.png` | `PEBTempVsCD` | 2.5 |
| `02_05/spin_coating_3step.svg` | `SpinCoating3Step` | 2.5 |
| `02_05/pr_profile_defects.svg` | `PRProfileDefects` | 2.5 |
| `02_05/rls_trilemma.svg` | `RLSTrilemma` | 2.5 |
| `02_05/car_mechanism.svg` | `CARMechanism` | 2.5 |
| `02_06/dof_concept_diagram.svg` | `DOFConceptDiagram` | 2.6 |
| `02_06/na_resolution_dof_tradeoff.png` | `NAResolutionDOFTradeoff` | 2.6 |
| `02_06/process_window_dose_focus.png` | `ProcessWindowDoseFocus` | 2.6 |
| `02_06/bossung_curve.png` | `BossungCurve` | 2.6 |
| `02_07/opc_before_after.png` | `OPCBeforeAfter` | 2.7 |
| `02_07/opc_flow_loop.svg` | `OPCFlowLoop` | 2.7 |
| `02_07/illumination_shapes_comparison.svg` | `IlluminationShapesOAI` | 2.7 |
| `02_08/overlay_concept.svg` | `OverlayConcept` | 2.8 |
| `02_08/overlay_open_short_cross_section.svg` | `OverlayOpenShort` | 2.8 |
| `02_08/overlay_budget.svg` | `OverlayBudget` | 2.8 |
| `02_08/mark_asymmetry_distortion.svg` | `MarkAsymmetry` | 2.8 |
| `02_08/wafer_distortion_patterns.png` | `WaferDistortionPatterns` | 2.8 |
| `02_09/box_in_box_microscope.png` | `BoxInBoxMicroscope` | 2.9 |
| `02_09/diffraction_principle.svg` | `DiffractionPrinciple` | 2.9 |
| `02_09/dbo_grating_mark_cross_section.svg` | `DBOGratingCrossSection` | 2.9 |
| `02_09/dbo_measurement_principle.svg` | `DBOMeasurementPrinciple` | 2.9 |
| `02_09/sampling_map_comparison.png` | `SamplingMapComparison` | 2.9 |
| `02_10/linear_6par_vector_map.png` | `Linear6parVectorMap` | 2.10 |
| `02_10/model_residual_comparison.png` | `ModelResidualComparison` | 2.10 |
| `02_10/correctables_residuals_flow.svg` | `CorrectablesResidualsFlow` | 2.10 |
| `02_10/apc_control_loop.svg` | `APCControlLoop` | 2.10 |
| `02_11/cdu_hierarchy.svg` | `CDUHierarchy` | 2.11 |
| `02_11/global_cdu_wafer_heatmap.png` | `GlobalCDUWaferHeatmap` | 2.11 |
| `02_11/ler_lwr_sem_image.png` | `LERLWRSemImage` | 2.11 |
| `02_11/meef_vs_k1.png` | `MEEFvsK1` | 2.11 |
| `02_11/cd_apc_loop.svg` | `CDApcLoop` | 2.11 |
| `02_12/cd_sem_principle.svg` | `CDSEMPrinciple` | 2.12 |
| `02_12/cd_sem_edge_profile.png` | `CDSEMEdgeProfile` | 2.12 |
| `02_12/ocd_principle.svg` | `OCDPrinciple` | 2.12 |
| `02_12/ocd_spectrum_matching.png` | `OCDSpectrumMatching` | 2.12 |
| `02_12/cd_saxs_concept.png` | `CDSAXSConcept` | 2.12 |
| `02_13/lele_process_flow.svg` | `LELEProcessFlow` | 2.13 |
| `02_13/lele_overlay_pitch_variation.png` | `LELEOverlayPitchVariation` | 2.13 |
| `02_13/sadp_process_flow.svg` | `SADPProcessFlow` | 2.13 |
| `02_13/sadp_4step_cross_section.png` | `SADP4StepCrossSection` | 2.13 |
| `02_13/arf_saqp_vs_euv_sp_comparison.png` | `ArFSAQPvsEUVComparison` | 2.13 |
| `03_01/yield_structure_flow.svg` | `YieldStructureFlow` | 3.1 |
| `03_01/yield_vs_d0a_three_models.png` | `YieldVsD0AThreeModels` | 3.1 |
| `03_01/yield_rampup_scurve.png` | `YieldRampupSCurve` | 3.1 |
| `03_01/yield_rampup_stages.svg` | `YieldRampupStages` | 3.1 |
| `03_01/wafer_map_pattern_types.png` | `WaferMapPatternTypes` | 3.1 |
| `03_02/inspection_checkpoints.svg` | `InspectionCheckpoints` | 3.2 |
| `03_02/bf_vs_df_inspection.svg` | `BFvsDFInspection` | 3.2 |
| `03_02/adc_pipeline.svg` | `ADCPipeline` | 3.2 |
| `03_03/control_vs_spec_limits.svg` | `ControlVsSpecLimits` | 3.3 |
| `03_03/weco_rules_patterns.svg` | `WECORulesPatterns` | 3.3 |
| `03_03/cp_vs_cpk_visualization.png` | `CpVsCpkVisualization` | 3.3 |
| `03_03/multivariate_spc_t2_chart.png` | `MultivariateT2Chart` | 3.3 |
| `03_04/pca_based_fdc.svg` | `PCABasedFDC` | 3.4 |
| `03_04/normal_vs_abnormal_trace.png` | `NormalVsAbnormalTrace` | 3.4 |
| `03_04/autoencoder_reconstruction_error.png` | `AutoencoderReconstructionError` | 3.4 |
| `03_04/equipment_health_dashboard.svg` | `EquipmentHealthDashboard` | 3.4 |
| `03_05/apc_control_hierarchy.svg` | `APCControlHierarchy` | 3.5 |
| `03_05/ewma_control_loop.svg` | `EWMAControlLoop` | 3.5 |
| `03_05/ff_fb_combined_correction.svg` | `FFBCombinedCorrection` | 3.5 |
| `03_05/apc_cd_before_after.png` | `APCCDBeforeAfter` | 3.5 |
| `03_05/cross_layer_apc.svg` | `CrossLayerAPC` | 3.5 |
| `03_07/cnn_wafer_map_pipeline.svg` | `CNNWaferMapPipeline` | 3.7 |
| `03_07/wafer_map_analysis_pipeline.svg` | `WaferMapAnalysisPipeline` | 3.7 |
| `03_09/variance_decomposition_pie.svg` | `VarianceDecompositionPie` | 3.9 |
| `04_02/trace_settling_overshoot.png` | `TraceSettlingOvershoot` | 4.2 |
| `04_02/cross_layer_r2_comparison.png` | `CrossLayerR2Comparison` | 4.2 |
| `04_02/feature_importance_top20.png` | `FeatureImportanceTop20` | 4.2 |
| `04_04/shap_waterfall_cd.png` | `ShapWaterfallCd` | 4.4 |
| `04_04/physics_informed_hybrid_model.svg` | `PhysicsInformedHybridModel` | 4.4 |
| `04_04/trust_building_roadmap.svg` | `TrustBuildingRoadmap` | 4.4 |
| `04_06/resnet18_sem_architecture.svg` | `ResNet18SemArchitecture` | 4.6 |
| `04_06/cnn_adc_pipeline.svg` | `CnnAdcPipeline` | 4.6 |
| `04_06/dl_vs_xgboost_performance.png` | `DlVsXgboostPerformance` | 4.6 |

## 4. 마크다운 작성 규칙

- `##` 섹션 사이에 `---` 수평선 넣지 않음 — heading의 margin-top으로 충분
- `---`는 대주제 전환(챕터 개요 → 본문 시작) 또는 마지막 정리 구분에만 사용
- 빈 줄은 heading과 이미지 사이에 최대 1줄

## 5. Next.js 한글 파일명 주의사항

- `params.id`는 URL 인코딩 상태(`%EC%9B%A8...`)로 들어옴
- `allChapters[].id`는 원본 한글(`웨이퍼_...`)
- **반드시 `decodeURIComponent(params.id)` 후 비교**해야 함
- 이 버그로 챕터 네비게이션 버튼이 사라졌던 이력 있음

## 6. AI 사이드바 (QnAPanel)

- 너비 리사이즈 가능 (320~700px, 기본 420px) — 왼쪽 가장자리 드래그
- KaTeX 수식 렌더링 지원 (`$...$` 인라인, `$$...$$` 블록)
- `### 제목` 마크다운 헤더 지원
- `ClientLayout.tsx`에서 전역 렌더링 (페이지 이동해도 유지)
- API 키는 `localStorage`에 저장

## 7. MarkdownViewer 렌더링 타이밍

- `dangerouslySetInnerHTML` → `requestAnimationFrame` → DOM 쿼리 순서
- `<img>` 교체를 다음 프레임으로 지연시켜 hydration 타이밍 이슈 방지
- cleanup 시 `cancelAnimationFrame` 호출 필수

## 8. 기술 스택 & 의존성

- Next.js 16 (Turbopack)
- React, Framer Motion (애니메이션)
- Recharts (차트)
- KaTeX (수식)
- Mermaid (다이어그램)
- Vercel 배포

## 9. 다이어그램 스타일 가이드

### 공통 규칙
- `'use client'` 선언 필수
- `diagramTokens.ts`의 `FONT`, `COLOR` import (하드코딩 금지)
- 래퍼에 `className="my-8"` 상하 여백
- **다크 테마** 기반: 배경 `rgba(255,255,255,0.02~0.06)`, zinc 계열 텍스트

### 제목 구조
```
<h3> 한글 제목   → FONT.title (18px), COLOR.textBright, bold
<p>  영문 부제   → FONT.subtitle (14px), COLOR.textDim (선택)
```

### 두 가지 렌더링 유형

| 유형 | 사용 시점 | 의존성 |
|------|----------|--------|
| SVG 인터랙티브 | 구조도, 프로세스 플로우 | Framer Motion (`motion.div`, `motion.g`) |
| 차트형 | 데이터 비교, 시계열 | Recharts (`BarChart`, `ScatterChart` 등) |

### 인터랙션 패턴
- **hover dimming**: 비호버 요소 `opacity: 0.35`
- **hover scale**: 호버 요소 `scale: 1.02~1.05`
- **floating tooltip**: `AnimatePresence` + 마우스 좌표 추적
  - 배경: `rgba(24,24,27,0.95)` + `backdrop-blur(8px)`
  - 보더: `rgba(255,255,255,0.1)`, `borderRadius: 8`
  - 제목: 엑센트 색상, `FONT.cardHeader`, bold
  - 본문: `COLOR.textMuted`, `FONT.small`

### 색상 팔레트
- 툴팁 제목 엑센트: `#22d3ee`(cyan) 또는 `#818cf8`(indigo)
- 데이터 엑센트: `#ef4444`(red), `#3b82f6`(blue), `#22c55e`(green), `#f59e0b`(amber), `#8b5cf6`(purple)
- 보조 요소: zinc 계열 (`#a1a1aa`, `#71717a`, `#4b5563`)

## 10. 다이어그램 SVG 작성 필수 규칙

### 좌표계
- **모든 좌표는 상수로 정의** 후 계산식으로 사용 (매직 넘버 금지)
- 기판 위치, 트렌치 크기, 코팅 두께 등을 상단에 `const`로 선언
- 요소 간 간격(gap)도 상수로 정의하고 대칭 배치 시 중심 기준 계산

### 폰트
- SVG 내부 텍스트 포함, **모든 텍스트에 FONT 토큰 사용** (예외 없음)
- `FONT.min(12px)` 이하의 폰트 크기는 절대 사용 금지
- DimLabel, 주석, 범례 등 보조 텍스트도 최소 `FONT.min`

### 텍스트 배치
- 텍스트와 도형 사이 최소 간격: 6px 이상
- 주석 라벨은 가리키는 대상과 같은 x 또는 y 좌표 정렬 필수
- 여러 주석이 같은 높이에 있을 때 y좌표 통일

### 완성도 체크리스트 (코드 작성 후 셀프 검증)
- [ ] 모든 fontSize가 `FONT.*` 토큰을 사용하는가?
- [ ] 좌표가 상수 기반 계산식인가? (매직 넘버 없는가?)
- [ ] 좌우/상하 대칭이 필요한 곳에서 gap이 동일한가?
- [ ] 텍스트가 도형과 겹치지 않는가? (최소 6px 간격)
- [ ] 제목 순서와 시각적 배치 순서가 일치하는가?
