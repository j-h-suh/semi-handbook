# TODO

## Phase 1: 통계학 핸드북 콘텐츠 검토

각 챕터에 대해 아래 항목을 검토합니다. 콘텐츠가 확정된 후 구조 전환(Phase 2)을 진행합니다.

### 검토 기준
- **정합성/정확도**: 수식 오류, 용어 불일치, 틀린 설명
- **난이도 흐름**: 챕터 간 난이도 점프, 전제 지식이 앞에서 커버되는지
- **수식**: 텍스트로만 설명한 부분 중 KaTeX 수식이 필요한 곳
- **시각화/다이어그램**: 분포 그래프, 개념도, 인터랙티브 시뮬레이션이 효과적일 곳
- **보충 설명**: 직관적 비유 부족, 실무 예시 부족, "왜?"가 빠진 곳
- **누락 내용**: 다루지 않았지만 Part 흐름상 필요한 토픽

### Part 1: 기술통계
- [x] 01_01 평균, 중앙값, 최빈값
- [x] 01_02 분산과 표준편차
- [x] 01_03 백분위수와 IQR
- [x] 01_04 상관계수의 함정
- [x] 01_05 시각화의 통계학

### Part 2: 확률과 분포
- [x] 02_01 확률의 기본 규칙
- [x] 02_02 확률변수와 기댓값
- [x] 02_03 이산분포
- [x] 02_04 연속분포
- [x] 02_05 중심극한정리
- [x] 02_06 큰수의법칙

### Part 3: 추론통계
- [x] 03_01 모수와 통계량
- [x] 03_02 점추정과 구간추정
- [x] 03_03 가설검정의 프레임워크
- [x] 03_04 t검정과 z검정
- [x] 03_05 카이제곱, ANOVA
- [x] 03_06 다중검정

### Part 4: 회귀와 모델링
- [x] 04_01 선형회귀의 통계학적 의미
- [x] 04_02 회귀 진단
- [x] 04_03 로지스틱 회귀
- [x] 04_04 정규화의 통계적 해석
- [x] 04_05 편향-분산 트레이드오프

### Part 5: 베이지안 통계
- [x] 05_01 빈도주의 vs 베이지안
- [x] 05_02 사전, 우도, 사후
- [x] 05_03 MAP와 MLE
- [x] 05_04 MCMC 맛보기

### Part 6: 실전 응용
- [x] 06_01 A/B테스트 설계
- [x] 06_02 부트스트랩과 교차검증
- [x] 06_03 정보이론 기초
- [x] 06_04 차원의 저주
- [x] 06_05 인과추론 입문

---

## Phase 1.5: 텍스트 보충 수정

콘텐츠 검토에서 발견된 보충/수정 사항입니다.

### Part 1: 기술통계

- [x] 01_01: "비강근" → "**비강근(Non-robust)**" 용어 형식 수정
- [x] 01_01: 가중평균의 가중치 결정 철학 1~2문장 추가
- [x] 01_02: "덧셈 성질이 왜 ML에서 중요한가" 1문장 추가
- [x] 01_02: 편향-분산 트레이드오프 티저 추가 (다음 장 연결)
- [x] 01_03: "순서 기반이 왜 이상치에 강건한가" 직관 보강
- [x] 01_04: 피어슨 r이 포물선에서 상쇄되는 이유 직관 추가
- [x] 01_05: KDE bandwidth 선택 실무 가이드
- [x] 01_05: Shapiro-Wilk vs QQ플롯 실무 판단 기준

### Part 2: 확률과 분포

- [x] 02_01: 독립성 정의 표현 명확화 ("동등하게" → "다시 쓰면")
- [x] 02_01: Recall/Precision 수식 비교 명시
- [x] 02_02: CDF의 "strictly increasing은 아닐 수 있다" 언급
- [x] 02_02: "모델의 예측도 확률변수다"라는 대칭적 설명 추가
- [x] 02_03: 이항계수 $\binom{n}{k}$ 설명 1줄 추가
- [x] 02_03: "각 예측이 독립적" 가정이 현실에서 깨질 때 언급
- [x] 02_03: 포아송 회귀의 로그 링크 함수를 왜 쓰는지 명시
- [x] 02_04: 지수분포 모수화(λ) 의미 명확화 (기댓값은 1/λ)
- [x] 02_04: 균등분포의 "무정보 사전" 비유를 더 직관적으로
- [x] 02_05: "충분히 크면"의 진단 방법 추가 (Shapiro-Wilk 등)
- [x] 02_05: SGD에서 gradient가 독립이 아닌데도 작동하는 이유
- [x] 02_06: "편향이 사라진다" → "표본 평균이 모평균에 수렴" 정확한 표현으로
- [x] 02_06: 분포 이동(distribution shift)의 구체적 예시 추가

### Part 3: 추론통계

- [x] 03_01: 효율성-강건성 트레이드오프에 구체적 이유 추가
- [x] 03_01: 자유도 개념을 불편성 설명 시 미리 언급
- [x] 03_02: 코드에서 z=1.96 하드코딩 → n=25면 t값 사용 또는 주석 추가
- [x] 03_02: "95%는 구간에 대한 것" 설명에 반복 실험 비유 보강
- [x] 03_03: α=0.05가 임의인 이유를 분야별 맥락으로 설명
- [x] 03_03: 검정력 예시에 구체적 수치 (효과크기 d=0.3, n=50이면 power≈35%)
- [x] 03_04: t-분포의 "꼬리가 두꺼운 이유" 직관 보강
- [x] 03_04: 합동 비율(pooled proportion) 개념 설명 추가
- [x] 03_05: Fisher's exact test 한 줄 정의 추가
- [x] 03_05: 적합도 검정에서 "왜 포아송인가?" 설명
- [x] 03_06: FWER 공식의 직관 (독립성 + 곱셈 법칙) 추가
- [x] 03_06: FDR에서 "기댓값"을 쓰는 이유 설명
- [x] 03_06: ML 사례에 구체적 수치/시나리오 추가

### Part 4: 회귀와 모델링

- [x] 04_01: "닫힌 형태(closed-form)" 용어 정의 추가
- [x] 04_01: "회귀 계수는 확률변수"가 왜 중요한지 3.1 연결 명시
- [x] 04_01: R² 함정의 실무 예시 구체화
- [x] 04_02: Scale-Location 플롯 용어 정의 추가
- [x] 04_02: Cook's distance 실용 임계값(>1 또는 >4/n) 명시
- [x] 04_03: 오즈비 "0.1→0.18" 계산 과정 수식으로 보여주기
- [x] 04_03: 소프트맥스 설명 순서 조정 (시그모이드의 K클래스 확장 → 수식)
- [x] 04_04: L1 벌칙 수식 오류 수정 (이중 노름 → 절대값)
- [x] 04_04: 가우시안/라플라스 용어에 영어 병기 추가
- [x] 04_04: "σ가 크면(노이즈 많으면) λ가 커진다" 해석 추가
- [x] 04_05: λ 조정에 따른 편향-분산 변화 수치 예시
- [x] 04_05: Boosting의 편향 감소 메커니즘 직관 보강
- [x] 04_05: "데이터를 아무리 많이 모아도 나아지지 않는다" 표현 정밀화

### Part 5: 베이지안 통계

- [x] 05_01: 신뢰구간 계산 방법(Wald? Wilson?) 명시
- [x] 05_01: MLE 수식 $\hat{\theta}_{MLE} = \arg\max P(\text{data}|\theta)$ 명시적 추가
- [x] 05_01: 사후 일치성이 "왜 중요한지" 설명
- [x] 05_02: 정규화 상수가 "왜 θ와 무관한가" 설명 추가
- [x] 05_02: 켤레 사전분포의 실무적 중요성 보충
- [x] 05_02: 4.4 정규화와의 연결 명시 ("4.4에서 배웠듯이")
- [x] 05_03: 세 수식(MLE/MAP/완전 베이즈) 각각 한 줄 해석 추가
- [x] 05_03: weight_decay 실무 가이드 구체화
- [x] 05_04: 수렴 진단 도구(Rhat, ESS, trace plot) 언급
- [x] 05_04: 수락 확률 min(1, ...)의 이유 한 줄 설명
- [x] 05_04: MCMC vs VI 선택 기준 구체화
- [x] Part 5 전체: 모수 표기(θ/μ/p) 파일 간 통일 (문맥별로 적합하여 변경 불필요 확인)

### Part 6: 실전 응용

- [x] 06_01: MDE 설정 방법론 구체화
- [x] 06_01: 윈저화(winsorization) 정의 보충
- [x] 06_01: 참신성 효과의 실무 수치 추가
- [x] 06_02: 블록 부트스트랩 정의/비유 추가
- [x] 06_02: Stratified k-fold 언급
- [x] 06_03: "자기정보(self-information)" 용어 정확화
- [x] 06_03: VAE의 KL 방향 선택 이유 설명
- [x] 06_03: 연속분포 엔트로피, Mutual Information 누락 보충
- [x] 06_04: KNN 무력화의 구체적 이유 보강
- [x] 06_04: 부피 공식 "단위 구의 부피 비율" 표현 명확화
- [x] 06_04: 텍스트/이미지 실제 차원 수 예시 추가
- [x] 06_05: 식별(identification) 개념 추가
- [x] 06_05: 관측 데이터의 근본적 한계 강조

---

## Phase 1.6: 2차 텍스트 보충 수정

2차 검토에서 발견된 보충/수정 사항입니다.

### A. 사실/수식 오류 (즉시 수정)

- [x] 00_00: "7개의 Part" → 실제 6개이므로 수정
- [x] 01_02: 모델 A/B 분산 수치 부정확 (ddof 기준 명시 및 수치 정정)
- [x] 01_02: "기하급수적으로 커진다" → "급격히 커진다" (제곱은 다항식적 증가)
- [x] 01_04: R² 범위 "0~1" → 음수 가능성 언급 추가
- [x] 01_05: QQ플롯 수식 `$\Phi^{-1}(n-0.5/n)$` → `$\Phi^{-1}((n-0.5)/n)$` 괄호 수정
- [x] 02_02: "두 파라미터 = 충분 통계량" → 파라미터와 충분통계량 구분하여 설명 수정
- [x] 03_03: "히스 입자" → "힉스 입자(Higgs boson)" 오타 수정
- [x] 03_04: 단측검정 p-value 조건 `t_stat > 0` → `t_stat < 0`으로 방향 수정
- [x] 04_01: F-검정 수식에서 SSR 표기를 $SS_{reg}$/$SS_{res}$로 통일
- [x] 04_03: BCE 기울기 수식 부호 표기 통일 (마이너스 제거, $(p_i - y_i)$ 형태로)
- [x] 04_04: L1 λ 대응값 `σ²/b` → `2σ²/b` (계수 2 추가)
- [x] 04_04: Deep Dive L1 서브그래디언트에서 "MSE" → "RSS" 표기 수정
- [x] 05_02: Python 코드 출력값과 파라미터(tau=10) 불일치 수정

### B. 코드 오류 (실행 불가)

- [x] 02_02: 코시 분포 코드에 `import numpy as np` 추가
- [x] 02_03: 이항분포 신뢰구간 코드에 `import numpy as np` 추가
- [x] 04_02: 진단 워크플로우 코드에서 `.values` 제거 (numpy array 호환)
- [x] 04_02: 진단 워크플로우 코드에 `import matplotlib.pyplot as plt` 추가
- [x] 04_03: sklearn LogisticRegression에 `penalty=None` 추가 또는 정규화 차이 주석
- [x] 05_04: `pm.summary(trace)` → `az.summary(trace)` (PyMC v5 호환)
- [x] 06_01: peeking 시뮬레이션 코드에 numpy/scipy import 추가
- [x] 06_02: 부트스트랩 코드에 numpy import 추가 + `[...]` 플레이스홀더를 실제 데이터로

### C. 용어 도입 형식 누락

- [x] 01_01: Huber Loss → **후버 손실(Huber Loss)** 형식 + 한 줄 정의
- [x] 02_01: "여보법칙" → **여사건의 법칙(Complement Rule)** 오타+형식 수정
- [x] 02_01: 콜모고로프 공리 → **콜모고로프 공리(Kolmogorov Axioms)**
- [x] 02_01: 포함-배제 원리 → **포함-배제 원리(Inclusion-Exclusion Principle)**
- [x] 02_02: LOTUS 풀네임 → **LOTUS(Law of the Unconscious Statistician)**
- [x] 03_02: **신뢰구간(Confidence Interval)** 정식 도입 추가
- [x] 03_05: ANOVA 풀네임을 첫 등장(23행)으로 이동
- [x] 03_06: FWER **가족별 오류율(Family-Wise Error Rate, FWER)** 본문 정식 도입
- [x] 05_04: **변분 추론(Variational Inference, VI)** 형식 도입
- [x] 05_04: **번인(Burn-in)** 형식 도입
- [x] 06_05: **백도어 조정(Backdoor Adjustment)** 형식 도입
- [x] 06_05: DAG → **방향이 있는 비순환 그래프(Directed Acyclic Graph, DAG)**
- [x] 06_05: PSM, IV, DiD, RDD 풀네임 형식 정비
- [x] 04_04: 라플라스 분포 한 줄 정의 추가

### D. 논리적 비약 / 설명 보충

- [x] 01_05: QQ플롯 "최적의 균형점" → "중~대규모에서 가장 실용적인 도구"로 완화
- [x] 02_05: 부트스트랩 "CLT의 실용적 구현" → 독립적 기법임을 명확히
- [x] 02_06: WLLN 조건 "분산 유한" → 기댓값만 유한하면 충분 (Khintchine 정리 언급)
- [x] 03_01: "일치성 = LLN의 직접적 결과" → 표본평균에 한정하여 서술
- [x] 04_03: $w$/$\beta$ 혼용 → 한 챕터 내 $\beta$로 통일
- [x] 04_05: 이중 하강 현상에 편향-분산 관점의 직관적 설명 1~2문장 추가
- [x] 04_05: Bias 표기 — 계수 편향 $\text{Bias}(\hat{\beta})$로 명시

### E. 챕터 간 연결

- [x] 03_04: 챕터 시작에 3.3 연결 문장 추가
- [x] 03_06: 챕터 시작에 3.5 연결 문장 추가
- [x] 05_01: Part 4→5 전환 문장 추가
- [x] 06_02: "4.1에서 부트스트랩" → 잘못된 챕터 참조 수정
- [x] 05_03: 코드 주석 `λ=1/τ²` → `λ=σ²/τ²`로 수정
- [x] 03_04: $x_A$, $x_B$ 변수 정의 추가

### F. KaTeX 표기 / 구조

- [x] 01_03: 수식 내 `Q1`/`Q3` → `Q_1`/`Q_3` 표기 개선
- [x] 06_03: 같은 파일 내 "세 관점" vs "네 관점" 불일치 수정
- [x] 06_03: 표 내 `q(z|x)` → `q(z \mid x)` (마크다운 표 파싱 안전)
- [x] 06_04, 06_05: "Python으로 확인하기" 전용 섹션 추가

---

## Phase 1.7: 3차 텍스트 검토

3차 검토에서 발견된 사항입니다. 전 32챕터 재검토 결과.

- [x] 05_03: OUTPUT 주석 블록 내 `λ(=1/τ²)` → `λ(=σ²/τ²)` 수정 (코드는 1.6에서 수정했으나 출력 주석 누락)
- [x] 06_03: KL 비대칭 코드에서 `entropy(p, q)` → `entropy(p, q, base=np.e)` 통일 (같은 파일 내 base 파라미터 불일치)

- [x] 04_03: $w, b$ vs $\beta, \beta_0$ 혼용에 대한 전환 설명 문장 추가 (43행)

→ **3건 발견, 3건 수정 완료.**

---

## Phase 1.75: 인터랙티브 시각화 구현

반도체 핸드북과 동일한 다이어그램 시스템을 활용하여 통계학 핸드북의 인터랙티브 시각화를 구현합니다.

### 기술 스택 (신규 설치 없음 — 기존 인프라 활용)

- **Recharts**: 차트 (LineChart, AreaChart, ScatterChart, BarChart)
- **Framer Motion**: 애니메이션, 호버 인터랙션
- **React Three Fiber**: 3D 시각화 (필요 시)
- **SVG + React state**: 개념도, 과녁, 벤 다이어그램
- **diagramTokens.ts**: 폰트/색상/간격 디자인 토큰 공유

### 작업 흐름 (컴포넌트 1개당)

1. `src/components/diagrams/stats/` 하위에 `.tsx` 파일 생성
2. `diagramRegistry.ts`에 dynamic import + 경로 매핑 등록
3. 마크다운 챕터에 `![alt](/content/images/stats/XX_XX/filename.svg)` 삽입
4. 개발 서버에서 렌더링 확인

### 구현 유형 분류

| 유형 | 기술 | 인터랙션 | 예시 |
|------|------|----------|------|
| **A. 파라미터 슬라이더** | Recharts + useState | 슬라이더로 파라미터 변경 → 분포/곡선 실시간 갱신 | 정규분포 σ 변화, 이항분포 p/n 변화 |
| **B. 시뮬레이션** | Recharts + 버튼/자동재생 | "실행" 버튼 → 샘플 추가되며 수렴 과정 시각화 | CLT 4단계, LLN 수렴, 부트스트랩 |
| **C. 비교 패널** | Recharts 다중 subplot | 탭/토글로 조건 전환, 호버 시 값 표시 | Anscombe's Quartet, 잔차 패턴 3종 |
| **D. 개념도** | SVG + Framer Motion | 호버 시 부분 하이라이트 + 설명 패널 | 과녁 비유, 벤 다이어그램, DAG |
| **E. 영역 시각화** | Recharts AreaChart + 참조선 | 호버/클릭으로 영역(α, β, p-value) 강조 | p-value 꼬리, 검정력 곡선 |

### Sprint 1: Part 1 — 기술통계 (5개 컴포넌트) ✅

| # | 챕터 | 컴포넌트명 | 유형 | 상태 |
|---|------|-----------|------|------|
| 1 | 01_01 | `CentralTendencyComparison` | D | ✅ |
| 2 | 01_02 | `EmpiricalRuleNormal` | A | ✅ |
| 3 | 01_03 | `BoxplotAnatomy` | D | ✅ |
| 4 | 01_04 | `AnscombeQuartet` | C | ✅ |
| 5 | 01_05 | `HistogramBinComparison` | A | ✅ |

### Sprint 2: Part 2 — 확률과 분포 (6개 컴포넌트) ✅

| # | 챕터 | 컴포넌트명 | 유형 | 상태 |
|---|------|-----------|------|------|
| 6 | 02_01 | `BayesTheoremSlider` | A+E | ✅ |
| 7 | 02_02 | `PmfPdfCdfGrid` | C | ✅ |
| 8 | 02_03 | `DiscreteDistributionExplorer` | A | ✅ |
| 9 | 02_04 | `ContinuousDistributionExplorer` | A | ✅ |
| 10 | 02_05 | `CLTSimulation` | B | ✅ |
| 11 | 02_06 | `LLNConvergence` | B | ✅ |

### Sprint 3: Part 3 — 추론통계 (6개 컴포넌트) ✅

| # | 챕터 | 컴포넌트명 | 유형 | 상태 |
|---|------|-----------|------|------|
| 12 | 03_01 | `EstimatorTargetBoard` | D | ✅ |
| 13 | 03_02 | `ConfidenceIntervalSim` | B | ✅ |
| 14 | 03_03 | `HypothesisTestVisualizer` | E | ✅ |
| 15 | 03_04 | `TDistributionComparison` | A | ✅ |
| 16 | 03_05 | `AnovaDecomposition` | D+E | ✅ |
| 17 | 03_06 | `MultipleTestingComparison` | E | ✅ |

### Sprint 4: Part 4 — 회귀와 모델링 (5개 컴포넌트) ✅

| # | 챕터 | 컴포넌트명 | 유형 | 상태 |
|---|------|-----------|------|------|
| 18 | 04_01 | `OLSFitVisualizer` | A | ✅ |
| 19 | 04_02 | `ResidualPatterns` | C | ✅ |
| 20 | 04_03 | `SigmoidCurve` | A | ✅ |
| 21 | 04_04 | `L1L2ContourPlot` | D | ✅ |
| 22 | 04_05 | `BiasVarianceTradeoff` | A+D | ✅ |

### Sprint 5: Part 5 & 6 — 베이지안 + 실전 (6개 컴포넌트) ✅

| # | 챕터 | 컴포넌트명 | 유형 | 상태 |
|---|------|-----------|------|------|
| 23 | 05_01 | `PosteriorConvergence` | B | ✅ |
| 24 | 05_04 | `MCMCTraceViewer` | B | ✅ |
| 25 | 06_01 | `SampleSizeCalculator` | A | ✅ |
| 26 | 06_03 | `KLDivergenceAsymmetry` | A | ✅ |
| 27 | 06_04 | `CurseDimensionality` | B | ✅ |
| 28 | 06_05 | `CausalDAGExplorer` | D | ✅ |

→ **28/28 컴포넌트 구현 완료. 전 챕터 registry 등록 + 마크다운 연결 완료.**

### 인프라 선행 작업 (Sprint 0)

- [x] `src/components/diagrams/stats/` 디렉토리 생성
- [x] `diagramRegistry.ts`에 stats 섹션 구분 주석 추가
- [x] 통계학 다이어그램용 색상 팔레트 결정 (반도체=시안 계열 → 통계=에메랄드/그린 계열)
- [x] 공용 훅 `useSlider`, `useSimulation` 추출 (반복 패턴이면) — **won't fix**: 28개 컴포넌트 모두 useState로 안정 작동, 추가 컴포넌트 계획 없음. 새 컴포넌트 추가 트리거 시 재검토.
- [x] 마크다운 내 이미지 플레이스홀더 일괄 삽입 — 수동 완료

---

## Phase 1.8: 4차 텍스트 검토

4차 검토에서 발견된 사항입니다. 전 32챕터 재검토 결과.

- [x] 01_02: OUTPUT 주석 모델 B 표준편차 `0.074` → `0.079` (ddof=1 기준 재계산)
- [x] 01_04: `y = exp(x)` 피어슨 r `~0.86` → `~0.94` (코드 주석 + 비교 표)
- [x] 02_06: LLN 수식 `\xrightarrow{}` → `\xrightarrow{P}` (확률 수렴 유형 명시)
- [x] 04_03: "약 1.8배 증가한 것이다" → "약 1.8배가 된 것이다" (배수 표현 정확성)
- [x] 04_05: 학습 곡선 코드에 `import numpy as np`, `import matplotlib.pyplot as plt` 추가
- [x] 05_01: OUTPUT 주석 Beta(708,302) 사후 평균 `0.7000` → `0.7010`

→ **6건 발견, 6건 수정 완료.**

---

## Phase 1.9: 5차 텍스트 검토 (수치 재계산 집중)

5차 검토에서 발견된 사항입니다. OUTPUT 주석의 수치를 수동/코드 실행으로 재검증.

### Part 0&1
- [x] 01_03: StandardScaler/RobustScaler OUTPUT 수치 전부 오류 (SS: -0.18→-0.34, RS: 32.92→48.91 등)
- [x] 01_04: sin(x) 종합비교 코드에서 [-3,3] 구간이 1주기 미만 → x_sin=[-10π,10π]로 변경, OUTPUT 수치 수정

### Part 2
- [x] 02_03: BCE OUTPUT `0.265250` → `0.253000` (수동 계산 검증)
- [x] 02_04: MSE OUTPUT `0.044000` → `0.070000`, NLL `0.940939` → `0.953939`

### Part 3
- [x] 03_02: n=50 CI 폭 `0.199` → `0.198` (반올림 오류)
- [x] 03_03: t통계량 `6.708` → `9.000`, Cohen's d `2.121` → `2.846` (데이터 대비 출력 불일치)
- [x] 03_04: 대응표본 fold_b 데이터에 변동 추가 (차이가 모두 0.02 → std=0 문제), t=-6.325
- [x] 03_05: χ² `8.618` → `8.909`, p `0.0134` → `0.0116`
- [x] 03_06: BH adjusted p-value 검정3-5 `0.063` → `0.067`

→ **10건 발견, 10건 수정 완료.** Part 4, 5, 6: 이슈 없음.

---

## Phase 2.0: 6차 텍스트 검토 (최종)

6차(최종) 검토에서 발견된 사항입니다. OUTPUT 주석 수치를 코드 실행으로 재검증.

### Part 0&1
이슈 없음.

### Part 2
- [x] 02_01: 베이즈 정리 P(질병|양성) `0.0901` → `0.0902` (반올림)
- [x] 02_02: ERM 위험값 3건 — w=2.0,b=1.0: `0.2487`→`0.2497`; w=1.5,b=0.5: `2.7523`→`4.6506`; w=3.0,b=2.0: `3.1876`→`17.1174`

### Part 3
- [x] 03_04: 단일표본 t `7.746`→`7.763`, Welch t `-2.987`→`-2.970`, 시뮬레이션 검정력 수치 수정

### Part 4
- [x] 04_04: Lasso/Ridge/OLS OUTPUT 전면 수정 — R² `0.928`→`0.985`, 0인 계수 `12`→`15`, β₁ 소멸→생존

### Part 5&6
이슈 없음.

→ **6건 발견, 6건 수정 완료.** 콘텐츠 수치 검증 완료.

---

## Phase 2: 멀티북 구조 전환

### 설계 결정 사항
- **라우팅**: `/semi/[slug]` + `/stats/[slug]`
- **랜딩**: `/` 허브 페이지 (책 선택 카드)
- **사이드바**: 책별 독립 TOC, 상단에 책 전환 링크
- **컴포넌트**: 뷰어/레이아웃 공유, 다이어그램/파트 매핑 책별 분리
- **게시판**: 통합 유지 + 책별 카테고리 태그
- **검색**: 현재 책 범위 내에서만 검색
- **디자인**: 다크 테마 통일, 책별 악센트 컬러 (반도체=시안, 통계=그린/에메랄드)
- **stats 마크다운**: 포맷 호환 확인됨, 변환 없이 그대로 사용

### 2-1. 콘텐츠 디렉토리 재구성 ✅
- [x] `content/` → `content/semi/`로 기존 반도체 마크다운 이동
- [x] `next/statistics_101/` → `content/stats/`로 통계 마크다운 이동 (`00_기획서.md` 제외)
- [x] 이미지 경로 정리 (`public/content/images/` 책별 분리 검토)

### 2-2. 라우팅 변경 ✅
- [x] `/chapter/[id]` → `/semi/[slug]` 라우트 전환
- [x] `/stats/[slug]` 라우트 신규 생성
- [x] 기존 `/chapter/...` URL → `/semi/...` 리다이렉트 처리

### 2-3. markdown.ts 리팩토링 ✅
- [x] `contentDirectory`를 책별로 분기 (`content/semi/`, `content/stats/`)
- [x] `getPartFromId()` 파트 매핑을 책별 설정으로 분리
- [x] `getSortedChaptersData(book)` 형태로 book 파라미터 추가

### 2-4. 랜딩 페이지 ✅
- [x] `/` 허브 페이지 구현 (책 선택 카드 UI)
- [x] 각 책별 소개, 챕터 수, 최근 업데이트 표시
- [x] 책별 악센트 컬러 적용 (반도체=시안, 통계=그린/에메랄드)

### 2-5. 사이드바 수정 ✅
- [x] URL prefix 기반으로 현재 책 판단
- [x] 해당 책의 TOC만 표시
- [x] 상단에 책 전환 링크 (홈 / 다른 책) 추가

### 2-6. 다이어그램 분리 ✅
- [x] `diagrams/` → `diagrams/semi/`, `diagrams/stats/` 구조 변경
- [x] `diagramRegistry.ts`를 책별로 분리

### 2-7. 검색 수정 ✅
- [x] `buildSearchData(book)` 형태로 책별 인덱싱
- [x] ⌘K 검색 시 현재 책 범위 내에서만 검색

### 2-8. 게시판 태그 ✅
- [x] 게시글에 책 카테고리 태그 추가 (반도체 / 통계)
- [x] 게시판 목록에서 태그 필터링

→ **Phase 2 멀티북 구조 전환 전체 완료.**

---

## Phase 3: Claude Code 핸드북 스타일 정비

`content/claude_code/` 40개 챕터를 CLAUDE.md 스타일 가이드에 맞추는 작업. 본문 내용은 건드리지 않고 포맷/톤만 조정합니다.

### 3-1. 구조 변환 ✅
- [x] H1 병합: `# N.M 제목` + `## 부제` → `# N.M 제목 — 부제`
- [x] 헤딩 한 단계 상향 (`### → ##`, `#### → ###`), 코드 펜스 내부 보존
- [x] `*다음 챕터: N.M 제목 — 부제*` 티저 푸터 추가 (39개, 11 에필로그 제외)

### 3-2. 톤 일관성 — 평서체 챕터의 존댓말 누수 수정 ✅
평서체(~이다/한다)로 쓰인 챕터에 존댓말이 1건씩 섞인 파일들. 해당 문장만 평서체로 수정합니다.

- [x] `04_2_세_가지_명령_타입.md` — CLI 출력 예시의 "커밋했습니다" → "커밋함"
- [x] `06_1_CLAUDE_md.md` — CLAUDE.md 예시의 "붙입니다/사용합니다" → "붙인다/사용한다"
- [x] `06_3_권한_모드_5가지.md` — "바꾸지 마세요 … 우선입니다" → "바꾸지 마라 … 우선이다"
- [x] `08_3_Coordinator_Mode.md` — "띄웠습니다" → "띄웠다"
- [x] `09_5_스트리밍과_서브_에이전트.md` — 코드 문자열 "생성하지 못했습니다" → "생성하지 못했다"

### 3-3. 에필로그 숫자+단위 띄어쓰기 정리 ✅
`11_에필로그.md`의 "39 개", "52 만", "11 개" 등 숫자와 단위 사이 공백을 표준 한국어 표기(붙여쓰기)로 수정. 전체 파일에서 유사 패턴(조사/접미사 분절) 함께 확인.

- [x] 숫자 + 단위 붙여쓰기: `39개/11개/52만/4가지/5가지/5단계/6장/80줄/500줄/400줄/30줄/5줄/2026년/3월/31일`
- [x] 섹션 번호 + 한국어 조사 붙여쓰기: `0.0의/0.0에서/6.4의/3.5의/7.4의/9.4의/8.1의/8.2의/9.3의/9.3은/9.3에서/10.4의/10.4은/10.2의/7.2의/8.3에서` 등
- [x] `Part N` + 한국어 조사 붙여쓰기: `Part 1의 ~ Part 10의`, `Part 7에서`, `Part 9와 Part 10`
- [x] `9.1 ~ 9.5` → `9.1~9.5` (틸드 주변 공백 제거)
- 유지: 영어 단어 + 한국어 조사(예: `Claude Code 를`, `claude 를`)는 저자 스타일로 존치

### 3-4. 포맷 관습 정비
semi/stats 대비 claude_code에서 드문 표기를 보강/정리합니다.

- [x] **용어 도입 형식 확대**: 처음 등장하는 핵심 용어를 `**한국어(영어)**` + 한 줄 정의 형식으로 도입
  - `fast path` — 01_1에서 이미 `**빠른 경로(fast path)**`로 도입되어 있음 (추가 작업 불필요)
  - `preAction hook` → 01_1에 `**실행 전 훅(preAction hook)**` + 정의
  - `rendezvous` → 01_1에 `**만남점(rendezvous)**` + 정의
  - `memoize` → 01_1에 `**메모이제이션(memoization)**` + 정의
  - `fork-join` → 08_3에 `**분기와 합류(fork-join)**` + 정의 (챕터 본문 첫 개념 등장 자리)
- [x] **이탤릭 남용 정리**: semi/stats 스타일(이탤릭 0건)에 맞춰 전면 정리
  - 한국어 이탤릭 `*강조*` → 평문 (별표 제거)
  - 영문/키워드 이탤릭 `*query*` → **bold** `**query**`
  - 인용문 `*"..."*` → `"..."` 평문
  - `***` 세 별표 연속 → `**` 정리 (123건)
  - nested bold, unmatched `**`, 조사 분리(`한다 고` → `한다고`) 수작업 교정
  - 스크립트(`/tmp/italic_fix.py`) 일괄 변환 + 서브에이전트 5팀 병렬 검수

> 참고: 3-1의 "다음 챕터 푸터 추가"는 이후 커밋 `1439101`에서 의도적으로 제거됨. 현재 챕터 푸터 정책은 "푸터 없음".

---

## Phase 4: 메타 노트 통합

- [x] `content/claude_code/_handbook_revisions.md` 삭제 (4개 항목 모두 [done], TODO.md Phase 3에 큰 줄기 보존)
- [x] `content/claude_code/_revisions.md` 삭제 (살아있는 5건은 위 Phase 3.5로 이전)
- [x] `content/claude_code/_terminology_pending.md` 삭제 (빈 placeholder, 항목 발생 시 TODO.md에 직접 추가)
- [x] H1·구조 일관성 검토 — `00_0`의 콜론 H1과 `11_에필로그`의 `# 11.` 형식·5단 구조 부재는 모두 **의도된 예외**(도입부 / 에필로그 인사)로 확인. 패턴 일치 강제하지 않음.

---

## Phase 5: claude_code 본문 수정·보완 *(✅ 완료)*

전 챕터(0.0 ~ 11) 본문 내용 검토·보완. Phase 3(스타일·포맷)과 별개로 본문 자체의 정확도, 흐름, 보충 설명을 다듬는 작업입니다. **0.2~0.5는 본문에서 짧게 짚고 넘어가는 JS/TS·React 패턴을 깊이 보충하는 신규 사전 지식 챕터입니다.** (본문은 그대로 유지)

### Part 0: 들어가며
- [x] 0.0 왜 이 책을 썼는가
- [x] 0.1 도구를 쓸 줄 아는 챗봇
- [x] 0.2 비동기 제너레이터와 스트리밍 (신규)
- [x] 0.3 React 훅과 함수형 컴포넌트 (신규)
- [x] 0.4 TypeScript 판별 유니온과 타입 가드 (신규)
- [x] 0.5 클로저와 팩토리 패턴 (신규)

### Part 1: 부트스트랩
- [x] 1.1 부트스트랩의 첫 30ms
- [x] 1.2 REPL 루프

### Part 2: 에이전트 루프
- [x] 2.1 에이전트 루프 한 장
- [x] 2.2 비동기 제너레이터 파이프라인
- [x] 2.3 스트리밍과 재시도

### Part 3: 도구 시스템
- [x] 3.1 도구란 무엇인가
- [x] 3.2 Tool 인터페이스 47개 필드
- [x] 3.3 buildTool 팩토리
- [x] 3.4 단순한 도구 FileRead
- [x] 3.5 복잡한 도구 BashTool

### Part 4: 슬래시 명령
- [x] 4.1 슬래시 명령은 일반 채팅과 어떻게 다른가
- [x] 4.2 세 가지 명령 타입
- [x] 4.3 allowedTools

### Part 5: 터미널 UI
- [x] 5.1 터미널에 React
- [x] 5.2 AppState 스토어
- [x] 5.3 메시지 렌더링과 가상 스크롤
- [x] 5.4 스트리밍 텍스트와 부분 업데이트

### Part 6: 설정·권한·Hook
- [x] 6.1 CLAUDE.md
- [x] 6.2 AppState
- [x] 6.3 권한 모드 5가지
- [x] 6.4 권한 규칙 매칭
- [x] 6.5 Hook 시스템
- [x] 6.6 Hook 실전

### Part 7: 외부 연결
- [x] 7.1 API 클라이언트
- [x] 7.2 MCP 클라이언트
- [x] 7.3 OAuth와 토큰 저장
- [x] 7.4 컨텍스트 압축
- [x] 7.5 IDE Bridge

### Part 8: 멀티 에이전트
- [x] 8.1 AgentTool 재귀
- [x] 8.2 createSubagentContext
- [x] 8.3 Coordinator Mode
- [x] 8.4 에이전트 팀 (in-process + 공유 메모리)

### Part 9: 미니 Claude Code
- [x] 9.1 설계 — 미니 에이전트의 골격
- [x] 9.2 핵심 루프
- [x] 9.3 도구 시스템
- [x] 9.4 권한 체크
- [x] 9.5 스트리밍과 서브 에이전트

### Part 10: 확장하기
- [x] 10.1 사용자 정의 슬래시 명령
- [x] 10.2 스킬 만들기
- [x] 10.3 Hook 만들기 (6.5 회수 — 5 이벤트, fail-open, deny 절대 우선)
- [x] 10.4 MCP 서버 만들기
- [x] 10.5 API 클라이언트 (07_1 회수 — Vertex 기본 + vLLM OpenAI 호환 어댑터. Bedrock/Foundry OUT)
- [x] 10.6 사용자 정의 에이전트 (8.1·8.2 회수 — `.claude/agents/<name>/AGENT.md` + subagent_type 분기)
- [x] 10.7 메시지 큐 (2.2 Deep Dive 회수 — 모듈 싱글턴 deque, 4 입력자 인프라, 10.8 의 토대)
- [x] 10.8 에이전트 팀 (8.4 회수 — contextvars 격리, asyncio.Queue 메일박스, polling 없는 fan-in. 게이트/공유 메모리/secret guard OUT)

### 에필로그
- [x] 11 에필로그

---

## Phase 6: mini_claude 코드–핸드북 갭 *(✅ 완료 — 참고용)*

`mini_claude` 실행 중 발견된 코드/문서 갭. 코드 수정분은 roll-back되어 다시 적용해야 하며, 9.1/9.2 핸드북 본문에도 반영해야 합니다. (구 `content/claude_code/_revisions.md` 통합)

### 9.1 설계 — 미니 에이전트의 골격

- [x] **`pyproject.toml`에 `[build-system]` 섹션 추가**
  - 현상: `[build-system]`이 없으면 uv가 프로젝트 본체를 설치하지 않아 `[project.scripts]` entry point가 `.venv/bin/`에 생성되지 않음 → `uv run mini-claude` 실행 실패
  - 반영 위치: 9.1 `pyproject.toml` 예시(현재 172~186줄)에 `[build-system] requires = ["hatchling"], build-backend = "hatchling.build"` 블록 추가

- [x] **`tools/__init__.py` 예시에 `default_tool_pool` stub 포함**
  - 현상: `main.py`가 `from .tools import default_tool_pool`를 import. 스캐폴드 단계에 stub이 없으면 `ImportError`
  - 반영 위치: 9.1 "Python으로 옮기면" 섹션에 `tools/__init__.py` 예시 추가 — `def default_tool_pool() -> list[Tool]: return []`

- [x] **`main.py` API 키 미설정 에러 메시지 친절화**
  - 현상: 기존 메시지("ANTHROPIC_API_KEY 환경 변수가 필요해.")는 해결 방법 미제공
  - 반영 위치: 9.1 `main.py` 예시(현재 337~338줄)의 SystemExit 메시지에 `export ANTHROPIC_API_KEY=sk-ant-... 후 다시 실행.` 안내 한 줄 추가

- [x] **`agent.py` stub에 unreachable `yield` 추가**
  - 현상: `async def query(...) -> AsyncGenerator[str, None]`에 `yield`가 없으면 Python이 coroutine으로 인식 → `async for`에서 `TypeError`
  - 반영 위치: 9.1 `agent.py` stub(현재 303~316줄)의 `raise NotImplementedError` 다음 줄에 `yield  # async generator로 인식시키기 위한 unreachable yield`

### 9.2 핵심 루프

- [x] **"첫 실행" 단락 추가 (API 키 설정 안내)**
  - 현상: "안녕" 입력 예시로 시작하나, 실제로는 `ANTHROPIC_API_KEY` 미설정으로 SystemExit → 첫 실행에서 막힘
  - 반영 위치: 9.2의 "안녕" 예시(현재 442~444줄) **직전**에 단락 추가 — 환경 변수 설정(`export ANTHROPIC_API_KEY=...`), 실행 명령(`uv run mini-claude`), 첫 프롬프트 예시(`> 안녕`)
  - 비채택 대안: `.env` 지원(의존성 증가), 별도 "환경 준비" 섹션(흐름 단절)

---

## Phase 7: Deep Dive 콜아웃 포맷 통일 *(✅ 완료)*

기존 Deep Dive는 펼친 blockquote(`> 🔬 **Deep Dive — 제목** ...`) 한 덩어리로 작성되어 있어, 본문 흐름을 끊고 길이도 부담스럽다. 6.5장에서 도입한 `<details>` + blockquote 패턴(접고 펴기 + 펼쳤을 때 블록 경계 표시)으로 전 챕터를 통일한다.

### 변환 패턴

**기존**:
```markdown
> 🔬 **Deep Dive — 제목** 본문 한 단락...
```

**신규**:
```markdown
<details>
<summary>🔬 Deep Dive — 제목</summary>

> 본문 한 단락...
>
> ```code```
>
> 추가 단락...

</details>
```

### 대상 챕터 (claude_code, 총 27건)

- [x] 01_2_REPL_루프 (1건)
- [x] 02_1_에이전트_루프_한_장 (1건)
- [x] 02_2_비동기_제너레이터_파이프라인 (3건)
- [x] 02_3_스트리밍과_재시도 (1건)
- [x] 03_1_도구란_무엇인가 (2건)
- [x] 03_2_Tool_인터페이스_47개_필드 (1건)
- [x] 03_3_buildTool_팩토리 (1건)
- [x] 03_4_단순한_도구_FileRead (1건)
- [x] 03_5_복잡한_도구_BashTool (2건)
- [x] 04_1_슬래시_명령은_일반_채팅과_어떻게_다른가 (1건)
- [x] 04_2_세_가지_명령_타입 (1건)
- [x] 04_3_allowedTools (1건)
- [x] 05_1_터미널에_React (1건)
- [x] 05_2_AppState_스토어 (1건)
- [x] 05_3_메시지_렌더링과_가상_스크롤 (1건)
- [x] 05_4_스트리밍_텍스트와_부분_업데이트 (1건)
- [x] 06_1_CLAUDE_md (1건)
- [x] 06_2_AppState (1건)
- [x] 06_3_권한_모드_5가지 (1건)
- [x] 06_4_권한_규칙_매칭 (1건)
- [x] 06_5_Hook_시스템 (1건, 기준 패턴 도입)
- [x] 07_1_API_클라이언트 (1건)
- [x] 10_1_사용자_정의_슬래시_명령 (1건, 기존 신 패턴 — 미세 차이 잔존)
- [x] 10_2_스킬_만들기 (1건, 기존 신 패턴 — 미세 차이 잔존)
- [x] 10_3_MCP_서버_만들기 (1건, 기존 신 패턴 — 미세 차이 잔존)

### 추가 검토 주제 (챕터별 리스트업 보류, 큰 주제로만 보존)

- [x] **콜아웃(💡 등) 포맷도 동일 패턴으로 통일** — 인벤토리 결과 133건 중 130건(97.7%)이 1줄, 4줄 이상 1건뿐, 코드/표 포함 0건. _변환 대상 0건_. CLAUDE.md §8에 정책 명문화로 마무리.
- [x] **콜아웃과 Deep Dive의 시각적 위계 구분** — CLAUDE.md §8 표 + 위계/접기 기준 단락으로 통합 (🔬 항상 접힘, 💡/⚙️/⚠️ 펼침 기본).
- [x] **Python 등가 코드 누락 점검** — 201개 TS 블록 점검. 정상 122건(63.9%) / 의도적 TS-only(구현부 인용) 8건 / 누락 후보 61건. 누락 후보 재분류 결과: **Part 0 22건 → 진짜 누락 2건 보강** (00_2 line 185 `yield*`, 00_3 line 164 Ink). **Part 1+ 39건 → 진짜 누락 0건** (A 내러티브 비교 7건, 2a 구현부 verbatim 인용 32건). Part 1+ 는 _진짜 코드 분석_ 챕터라 TS-only 가 의도적 — Python 등가 작성은 _분석 흐름 파괴_. 결론: 핸드북 전체 Python 등가 커버리지는 _현재 상태가 옳음_, 강제 통일은 부적절.
## Phase 8: 1~8장 변화 → 9~10장 본문 동기화 *(✅ 완료)*

1~8장의 _최근 변경_ (예: Part 8.4 에이전트 팀 추가, 0~4장 본문 보강 등)이 9~10장 본문에 _충분히 반영_ 되어 있는지 점검·보강한다. 9~10장은 _이전 시점_ 의 1~8장을 회수하며 작성됐기 때문에, 최근 변경된 자리가 9~10장에서 _누락_ 또는 _불일치_ 로 남아 있을 수 있다. 본문 보강이 끝나면 그 영향이 mini_claude 실제 코드에도 미치는지 같이 정리한다.

### 작업 흐름 (plan에서 세부화)

- [x] **1~8장 최근 변화 인벤토리** — git log + 본문 diff 로 _9~10 작성 이후_ 1~8장이 어떻게 바뀌었는지 정리
- [x] **반영 매핑** — 각 변화가 9~10장의 어느 자리에 _회수되어야 자연스러운지_ 후보 작성 (예: 새 함수/패턴/메타포가 9~10에서 다시 등장하는가)
- [x] **9~10장 본문 보강** — 매핑된 자리에 cross-reference / 메타포 / 코드 회수 추가
- [x] **mini_claude 코드 영향 점검** — 본문 보강이 코드 변경을 유발하면 같이 정리. 본문이 source of truth 원칙 유지

---

## Phase 9: 학습자 Vertex 환경 보장 + 누적 실 검증 *(✅ 완료)*

학습자들이 _Anthropic API 키 없이 GCP Vertex 만 가능한 환경_ 에서 mini_claude 를 9.1 첫 챕터부터 _본문 코드 그대로 따라_ 만들어 실행할 수 있도록. 그 과정에서 _실제 학습자 시뮬레이션_ ($CLAUDE_JOB_DIR/learner_sim 에 본문 코드 누적 적용 + paper-viewer .env GCP 환경에서 호출) 으로 본문 갭을 _진짜 막힘 자리_ 단위로 발견 + 보강.

### 작업 결과 (10 commits 묶음)

**신규 챕터 + 추상화 도입** (Part 10 확장):
- [x] 10.8 에이전트 팀 신규 챕터 + mini_claude teams 모듈 (commit `bcf8423`)
- [x] 10.5 API 클라이언트 신규 챕터 + mini_claude clients 모듈 (Vertex + vLLM 어댑터) (commit `4832510`)

**Vertex 실행 보장**:
- [x] mini_claude/SETUP.md + `anthropic[vertex]` extra — google.auth import 보장 (commit `3416d0e`)
- [x] Vertex region/model 기본값 학습자 환경 표준에 맞춤 — `claude-opus-4-7` alias + `global` region + `CLOUD_ML_REGION` fallback (commit `b25b356`)

**9.x + 10.3 본문 코드 Vertex 화**:
- [x] 9.x + 10.3 본문 코드 인용을 `AsyncAnthropicVertex` 로 (23 자리) — 학습자가 본문 그대로 복사해서 만들면 작동 (commit `af4654a`)

**누적 검증 발견 갭 보강 (7 개)**:
- [x] 9.1/9.2/9.5 본문 갭 3개 — pyproject Vertex extra / messages.py 라벨 / agent.py import (commit `324da39`)
- [x] 10.1/10.3/10.6 본문 갭 3개 — PyYAML 의존성 / hooks 생략 메서드 + HookInput / _normalize_list 정의 (commit `bcb20ad`)
- [x] 추가 보강 4 — 10.4 mcp[cli] / 10.3 완전한 hooks 본문 / SETUP §0 GCP 진입 가이드 / 11 에필로그 10.8·10.5 회수 (이 commit)

### 누적 검증 통과 13 챕터

| 시점 | 시나리오 | 결과 |
|---|---|---|
| 9.1 | stub `NotImplementedError` | ✅ 의도된 결과 |
| 9.2 | 도구 없는 단순 응답 | ✅ Vertex 호출 |
| 9.3 | Bash `ls` 도구 호출 | ✅ |
| 9.4 | 권한 게이트 (allow_rule) | ✅ |
| 9.5 | 스트리밍 + AgentTool | ✅ |
| 10.1 | `/hello Alice` 슬래시 명령 → `$name` 치환 | ✅ |
| 10.2 | 자연어 → SkillTool 자동 매칭 | ✅ |
| 10.3 | Hook 빈 registry → None | ✅ |
| 10.4 | 가짜 MCP 서버 spawn → tools/call | ✅ |
| 10.5 | make_client → Vertex + vLLM 변환 | ✅ |
| 10.6 | AGENT.md 발견 → spec 1개 | ✅ |
| 10.7 | message_queue push/drain | ✅ |
| 10.8 | teams wait_all_idle + mailbox | ✅ |

---

## Phase 10: SETUP 단순화 — JSON 한 길 + `.env` 흐름 + 프로젝트 내 `secrets/`

학습자 SETUP 흐름이 _gcloud 로그인 길_ + _SA JSON 길_ 두 갈래로 복잡해서 _JSON 한 길_ 로 압축. 본문 9.x / 10.5 도 _gcloud ADC_ 표현을 _Service Account JSON_ 으로 통일. 환경변수 설정은 _shell rc export_ 가 아닌 _`.env` 파일 + `python-dotenv` 자동 로드_ 방식으로. SA JSON 자체도 HOME (`~/.config/gcp/`) 이 아닌 _프로젝트 내 `secrets/`_ 폴더로 옮겨 _프로젝트와 키의 인지적 결속_ 을 강화.

### 10-1. gcloud → SA JSON 통일
- [x] SETUP.md 재작성 — §0 GCP 신규 / §1 API / §2 Model Garden / §4 IAM 을 _전제_ 로 압축, §3 의 길 A(gcloud) 제거. ~204줄 → ~85줄
- [x] 9.1 본문 — 인증 한 줄 + 💡 콜아웃 + `main.py` stub 에러 메시지 (3 자리)
- [x] 9.2 본문 — `_make_vertex_client()` env 이름 (`GOOGLE_CLOUD_PROJECT`→`VERTEX_PROJECT_ID`, `CLOUD_ML_REGION`→`VERTEX_LOCATION`), `main.py` env 체크, 진짜로 돌려보기 셸
- [x] 10.5 본문 — ⚠️ 콜아웃 끝 표현 + Vertex 시나리오 셸 (gcloud 두 줄 제거)
- [x] mini_claude 코드 — `clients/__init__.py` docstring 의 _또는 gcloud ADC_ 제거
- [x] 학습자 누적 시뮬로 검증 — `VERTEX_PROJECT_ID` + `VERTEX_LOCATION` + `GOOGLE_APPLICATION_CREDENTIALS` + `MINI_LLM_MODEL` 4 개만으로 (1) `_check_environment()` 통과 (2) 9.2 `_make_vertex_client()` 객체 생성 (3) 10.5 `make_client()` + `get_default_model()` 작동 (4) `VERTEX_PROJECT_ID` 누락 시 친절 에러 — 4/4 PASS

### 10-2. `.env` 흐름 도입
- [x] `mini_claude/pyproject.toml` — `python-dotenv>=1.0.0` 의존성 추가 + `uv sync`
- [x] `mini_claude/src/mini_claude/main.py` — `from dotenv import load_dotenv` + `main()` 첫 줄에 `load_dotenv()` 호출 (Write 로 file 전체 한 번에 — ruff hook 의 중간상태 F401 회피)
- [x] `mini_claude/.env.example` 신규 — 학습자 템플릿 (4 변수 + vLLM 주석)
- [x] 저장소 root `.gitignore` — `.env*` 옆에 `!.env.example` negation 추가
- [x] SETUP.md §2 재작성 — _shell rc export_ → `cp .env.example .env` + 편집 흐름. 💡 콜아웃에 `.env` git 제외 + dotenv 자동 로드 설명
- [x] 9.1 본문 — pyproject.toml 의존성 _세 줄→네 줄_ + main.py stub 의 `from dotenv import load_dotenv` + `main()` 의 `load_dotenv()` 호출
- [x] 9.2 본문 — main.py 의 dotenv import + `load_dotenv()` 호출 + 진짜로 돌려보기 셸 (`export ...` → `cp .env.example .env` + 편집)
- [x] `.env` 자동 로드 시뮬 검증 — tmpdir 의 `.env` → `load_dotenv()` → `_check_environment()` 통과 → `make_client()` 작동 (4/4 PASS) + 진짜 `mini-claude` CLI 가 _.env 만으로_ REPL 진입 확인

### 10-3. SA JSON 위치 — HOME → 프로젝트 내 `secrets/`
- [x] 저장소 `.gitignore` 에 `content/claude_code/mini_claude/secrets/` 명시적 추가 — 사용자 글로벌 `~/.gitignore_global` 의존성 제거, 다른 학습자 clone 시에도 보호
- [x] SETUP.md §1 재작성 — `~/.config/gcp/` → `cd content/claude_code/mini_claude && mkdir -p secrets && mv ... secrets/` + `chmod 600` 흐름. 💡 (gitignore 보호 + 공유 시 주의) + ⚠️ (`chmod 600` 의 역할) 콜아웃 추가
- [x] `.env.example` + SETUP.md §2 의 `GOOGLE_APPLICATION_CREDENTIALS` 값을 `secrets/your-sa-key.json` (mini_claude/ cwd 기준 상대 경로) 으로 갱신
- [x] 시뮬 검증 — `mini_claude/secrets/your-sa-key.json` 가짜 키 + `.env` 의 상대 경로로 진짜 `mini-claude` CLI 가 REPL 진입 (`.env` 자동 로드 + `_check_environment()` 통과). `git check-ignore` 로 `secrets/` 와 `.env` 모두 무시 패턴 매칭 확인

---

## Phase 11: Part 9/10 통독 발견 + 코드–본문 정합성 일제 점검 *(✅ 완료)*

2026-05-23 Part 9 (5장) + Part 10 (8장) 통독 결과 발견된 잔여 이슈와, mini_claude 코드 베이스의 docstring/주석이 _Anthropic API 직접만_ 가정하는 옛 표현으로 남아 있을 가능성에 대한 일제 점검. Phase 10 의 _SETUP 단순화 + Vertex 기본_ 정책이 _본문·코드 전 자리_ 에 일관되게 반영됐는지 확인하는 라운드.

### 11-1. 즉시 픽스 — 환경변수 통일 잔여 (Phase 10-1 의 누락분)

- [x] **9.5 본문 line 561-564** — `_make_vertex_client()` (또는 query() 안 내장 client 생성 자리) 의 env 이름: `GOOGLE_CLOUD_PROJECT` → `VERTEX_PROJECT_ID`, `CLOUD_ML_REGION` → `VERTEX_LOCATION`. 9.2 line 301-302 는 갱신됐는데 9.5 만 옛 이름 잔존. 학습자가 9.5 본문 그대로 따라 쓰면 9.2 의 환경 변수와 _불일치_.
- [x] **10.3 본문 line 860** — `export GOOGLE_CLOUD_PROJECT=<your-gcp-project>   # + gcloud auth application-default login` 두 가지 문제 동시: (1) 옛 env 이름, (2) Phase 10 에서 _SA JSON 한 길_ 로 통일한 _gcloud ADC 표현_ 의 잔존. _SA JSON + `.env` 흐름_ 으로 갱신 — `uv run mini-claude   # .env 가 준비됐다고 가정 — SETUP.md 참조` 한 줄로 압축.

### 11-2. 챕터 끝 잔존 줄 (챕터 순서 재배치 흔적)

- [x] **10.5 본문 line 598** — `*Part 10 끝.*` 제거. 10.5 는 더 이상 Part 10 의 마지막 챕터가 아님 (10.6/10.7/10.8 이 뒤). _챕터 순서 재배치_ (191630b) 의 잔존물. 10.8 line 1047 의 `*Part 10 끝.*` 만 진짜.

### 11-3. 본문 보강 라운드 (Part 9/10 통독 발견)

- [x] **10.7 ↔ 10.8 시스템 관계 명시화** — 10.8 의 _§Mailbox_ 도입 직후 (line 305 부근) 에 ⚙️ 콜아웃 추가. `message_queue.py` (전역 트래픽 — 사용자 입력 / 백그라운드 알림) 와 `teams/mailbox.py` (팀원별 격리 채널 — idle / peer DM) 가 _공존_, _대체 관계 아님_ 명시. 팀원 task 안에서 `message_queue.push()` 가 _부모와 공유_ 되는 그대로 (10.7 의 부모/자식 공유 가정이 _팀 컨텍스트에서도 유효_) — _전역 vs 팀별_ 이라는 _서로 다른 격리 단위_.
- [x] **10.8 시나리오 출력의 "사실성" 표시** — `### ④ 출력` 직후 (line 155 직전) 에 💡 _"가상 예시 — 평행 spawn 의 약한 자리"_ 콜아웃 추가. reviewer 가 researcher 의 다섯 마일스톤을 _다 본 듯_ 응답하는 것이 _LLM 의 도메인 지식으로 대충 맞히는 자리_ 임을 명시 + 정직한 표현법 (Team 도구 두 번 호출 / AGENT.md prompt 명시) 안내로 §"진짜로 팀을 구성해 보기" 의 ⚠️ 회수.
- [x] **10.6 description 추출 코드 중복의 근거** — 기존 💡 _"왜 PyYAML 안 쓰나"_ 콜아웃 다음에 별도 ⚙️ 콜아웃 추가. 10.1 (슬래시 명령) 은 _PyYAML 의존성 받아들임_ (frontmatter 가 임의 YAML 일 수 있음), 10.6 (사용자 정의 에이전트) 는 _경량 직접 파서_ (frontmatter 가 고정 5 필드). _같은 패턴, 다른 의존성 정책_ — _의존성 vs 표현력 trade-off_ 의 두 가지 본보기로 학습자에게 제시.
- [x] **10.6 → 10.8 티저 강화** — 10.6 마지막 핵심 정리 불릿을 두 문장으로 확장. `analyzer` 한 명 → 10.8 의 `scanner` / `triager` / `fixer-planner` 팀 동료들 — _AGENT.md frontmatter + 본문은 같고 spawn 방식만 다른_ 셈. "10.6 한 파일 작성한 학습자 = 이미 10.8 의 팀원 한 명 정의" strong promise 회수.

### 11-4. mini_claude 코드–본문 정합성 일제 점검

1차 grep 으로 식별된 자리 (8개) — Anthropic API 단독 가정 / 옛 환경변수 / 옛 모델명 흔적:

**옛 환경변수 fallback 의 의도 — 명시적으로 _안전망_ 임을 표현**
- [x] **`src/mini_claude/clients/__init__.py` line 56-66** — `GCLOUD_PROJECT` / `GOOGLE_CLOUD_PROJECT` / `CLOUD_ML_REGION` fallback 이 _Anthropic SDK 표준 호환_ 의 의도임은 docstring 에 잘 적혀 있음 (line 35-36). 정상 — _이 자리는 두는 것이 맞음_. 10.5 본문 (line 217 직후) 에 ⚙️ 콜아웃 한 줄로 _fallback chain 의 의도_ (gcloud CLI / Cloud Run / Cloud Functions 가 각자 다른 GCP 환경변수 이름을 쓰는 현실 흡수) 명시.

**docstring 표현 다듬기 (학습자 혼동 줄이기, 우선순위 낮음)**
- [x] **`src/mini_claude/messages.py:21`** — `"Anthropic API"` → `"LLM API"` + `"(Anthropic 표준; Vertex/vLLM 어댑터도 동일)"` 보강.
- [x] **`src/mini_claude/tools/base.py:20, 26, 54`** — 세 자리 모두 `"Anthropic API"` → `"LLM API"` 치환. line 20 + 54 는 `"(Anthropic 형식, Vertex/vLLM 동일)"` 보강.

**진짜 누락 / 옛 표현 일제 점검 — 28 파일 전수**
- [x] **모든 docstring + 주석** 에서 _옛 표현_ 흔적 일제 점검 — Explore 에이전트 grep 결과 _새 잔존 0건_. 1차 grep 으로 식별된 4 자리 (messages.py:21, tools/base.py:20/26/54) 외 추가 자리 없음. gcloud / 옛 모델명 / ANTHROPIC_API_KEY 단독 가정 / 옛 환경변수 기본 가정 / AsyncAnthropic 단독 import — 모두 _발견 없음_ 또는 _정상 안전망_.
- [x] **본문 챕터 (09 ~ 11 + SETUP.md) 동일 grep** — Explore 에이전트 grep 결과 _진짜 잔존 0건_. 11-1/11-2 픽스 (commit `67ba225`, `da1e5f4`) 로 모든 잔존 정리됨. Phase 10 정책 _전면 일관_ — Vertex 기본, .env + SA JSON, MINI_LLM_PROVIDER 분기. 00~08 챕터는 _배경지식 / 진짜 Claude Code 분석_ 으로 이 라운드 범위 밖.
- [x] **누적 검증 (가벼운 sanity check)** — `uv run python -c "from mini_claude.* import ..."` import 검증 OK + `default_tool_pool()` 4 도구 / 4 스키마 정상 생성. _진짜 Vertex 호출 검증_ (Phase 9 의 13 챕터 시나리오) 은 _이번 변경이 docstring + 본문 콜아웃 뿐 (기능 불변)_ 이라 별도 라운드. ruff 3 errors (teams 모듈 unused import) 는 _이번 변경과 무관_, _별도 라운드 후보_.

---

## Phase 12: LLM API 가족 정리 + .env 흐름 일제 통일 *(✅ 완료)*

2026-05-23 진행. Phase 11-4 의 Explore 본문 grep 이 _Anthropic API_ 표현 잔존을 못 잡았던 미스 (gcloud / 옛 환경변수 / 옛 모델명 중심으로만 grep) 를 사용자가 _9.1 파이썬으로 옮기며_ 주석에서 직접 발견. 이를 계기로 _6 가지 용어 (Anthropic / Claude / Vertex / vLLM / OpenAI / Gemini API)_ 가 _공급자 / 인터페이스 모양 / SDK_ 3 레이어로 혼재된 _개념적 큰 그림_ 정리까지 확장. 환경변수 설정도 _export → .env_ 일제 통일. 사용자와의 plan/AskUserQuestion 대화로 자리 결정 (옵션 B: 9.0 짧게 + 10.5 §0 상세). 6 commit + 1 마무리.

### 12-1. 본문 Anthropic API 표현 LLM API 일반화 (`9eef23a`)

Phase 11-4 의 _코드_ docstring 만 다뤘던 부분이 _본문 코드 인용 + 내러티브_ 까지는 안 갔던 누락분 보완.

- [x] **카테고리 A — 코드 인용 docstring/주석 7 자리**: 9.1 line 234/250/277, 9.2 line 67, 9.3 line 124/130/154. mini_claude 코드 (commit `98955a8`) 와 동일 모양으로 동기화.
- [x] **카테고리 B — 내러티브 진술 ~15 자리**: 9.1 line 64/202, 9.2 line 8/39/76/120/139/493/494/496, 9.3 line 86/98/694, 10.3 line 787, 10.7 line 84. `Anthropic API` → `LLM API (Anthropic 인터페이스)` 또는 `LLM API (Anthropic 표준)`.
- [x] **카테고리 C — 유지** (5 자리): 9.1 line 414 (`Anthropic SDK 패키지`), 10.3 line 78/840 (secret 패턴 — 진짜 키 이름), 10.5 line 5/39 (`Anthropic 직접 API 키` — 직접 서비스 의미).

### 12-2. 10.5 §0 "LLM API 가족 — 한 장 정리" 신설 (`4b14d56`, +94 줄)

- [x] _3 레이어 혼재_ 표 — 6 용어 × 3 레이어 (서비스 / 인터페이스 / SDK)
- [x] _인터페이스 가족 3 개_ 비교 — Anthropic / OpenAI / Google. endpoint, system 처리, messages 구조, tool 형식 차이
- [x] _공급자 × 인터페이스_ 매트릭스 8 행 — Claude 호스팅 4 (Anthropic 직접 / Vertex / Bedrock / Foundry), Gemini 2 (Vertex Gemini / AI Studio), OpenAI/vLLM 2
- [x] ⚠️ Vertex 두 모양 공존 — Claude 코너 (Anthropic 인터페이스) + Gemini 코너 (Google 인터페이스), 같은 GCP project / SA JSON
- [x] _카페 메뉴판_ 비유 — 직영점 / 스타벅스 / 제휴 카페, 스타벅스 안 _두 코너_
- [x] mini 결정 (두 family) + ⚙️ Gemini 향후 확장 (vLLM 어댑터 패턴 그대로 _Google 모양 → Anthropic 모양_ 변환 시 추가 가능)

### 12-3. 9.0 SETUP 큰 그림 단락 + 10.5 §0 링크 (`a92cbd3`)

- [x] SETUP.md 의 _## 왜 Vertex 의 Claude 인가 — 큰 그림_ 한 단락 추가 (전제 직전)
- [x] LLM API 두 레이어 (공급자 vs 인터페이스) 짧은 설명 + mini 기본 결정 근거 (Anthropic 직접 API 키 없이도 GCP project + SA JSON 으로 시작 가능)
- [x] 💡 콜아웃 — _다른 옵션 매트릭스는 §10.5 §0 참조_ 링크

### 12-4. §0 시각화 ASCII → 표 (`5676783`, `c66f2f6`)

- [x] _인터페이스 가족은 3 개_ 의 ASCII 박스 3 칸 → markdown 표 7 행 × 3 가족 (`5676783`). 행 단위 _같은 차원_ 비교 가능. 11+/16-
- [x] _혼동 자리 — Vertex 두 코너_ 의 ASCII 중첩 박스 → markdown 표 4 행 × 2 코너 + `publisher 경로` 행 보강 (`c66f2f6`). _Model Garden opt-in_ 명시. 8+/16-

### 12-5. 환경변수 export → .env 통일 (`b68e8a9` + 이번 commit)

- [x] **mini_claude 코드** — `main.py _check_environment()` 의 3 에러 메시지 (Vertex / vLLM / Anthropic) `export ...` → `.env 파일에 추가 (SETUP.md §2 참조)` + 변수 들여쓰기
- [x] **본문 6 자리** — 9.1 line 367-373 (stub 에러), 10.5 line 131-134/152-154 (시나리오 ①/②), 10.5 line 442-445 (`_check_environment` 인용), 10.5 line 619-621/647-650 (진짜 Vertex/vLLM 시나리오). 시나리오 셸 = `cat mini_claude/.env` + 변수 + `uv run mini-claude` (python-dotenv 자동 로드 주석)
- [x] **GOOGLE_APPLICATION_CREDENTIALS 상대 경로** — `/path/to/sa.json` 또는 `/Users/me/keys/sa.json` → `secrets/your-sa-key.json` (Phase 10-3 의 _프로젝트 내 secrets/_ 정책)
- [x] **SETUP.md vLLM 섹션** — 마지막 잔존 (line 104-110) `.env` 흐름으로 정리 (이번 commit)

### 12-6. 정합성 점검 결과 + 후행 기록

- [x] `grep "export [A-Z_]*=" content/claude_code/{09,10}_*.md` — 0 잔존
- [x] `uv run ruff check src/` — All checks passed (코드 회귀 없음)
- [x] 1차 + 후행 grep + 본문 통독 후 잔존 자리 모두 픽스 (`gcloud` / `GOOGLE_CLOUD_PROJECT` / `CLOUD_ML_REGION` 의 남은 자리는 모두 _fallback chain 정상_ 또는 _Anthropic SDK fallback 의도 설명_)
- [x] **TODO 등재** — 이 Phase 12 섹션 자체 (이번 commit)

---

## Phase 13: 학습자 누적 시뮬 13/13 PASS + 1:1 diff 검증 + 본문 막힘 자리 픽스 *(✅ 완료)*

2026-05-23 사용자 _학습자 누적 시뮬 재실행_ 요청. 처음에는 _현재 mini_claude 코드 베이스_ 의 _대표 7 시나리오_ 만 실행 (sanity) — 사용자가 _"끝까지 가본 건가요?"_ 지적 → _13 챕터 진짜 누적_ (각 시점에 _본문에서 발췌한 코드_ 만으로 mini_claude/ 디렉토리 누적 + 실행) 으로 재진행. 13/13 PASS 후 사용자가 _불완전_ 의 뜻을 물으며 _1:1 diff 검증_ 까지 진행 — agent 가 _누적 카피하면서 본문과 다른 _최종 코드_ 를 가져온 자리_ = _학습자 막힘 후보_ 분류.

### 13-1. 학습자 누적 시뮬 13 시점 PASS

- [x] **9.1 stub NotImplementedError** — main.py + agent.py(NotImplementedError + yield stub) + 7 파일 스캐폴드 + .env + secrets symlink + uv sync → query() async for → NotImplementedError 의도된 에러
- [x] **9.2 단순 응답** — messages.py 교체 (add_user/add_assistant), tools/base.py 단순화 (input_schema dict), EchoTool 신규, agent.py 본격 구현, main.py 정리 → Vertex "한 줄 인사" → end_turn (turns=2)
- [x] **9.3 Bash 도구** — tools/{read,write,bash,edit}.py 4 신규 + Pydantic input_model + ToolContext.read_files → 4 도구 등록 + Read read_only=True
- [x] **9.4 권한 게이트** — permissions.py 4단계 check (deny → allow → auto-read → ask) + ToolContext.permissions → 4 분기 모두
- [x] **9.5 스트리밍 + AgentTool** — query() async generator + TextDelta/ToolUseStarted/TurnDone + AgentTool sub-agent
- [x] **10.1 슬래시 명령** — frontmatter 파싱 + $1/$ARGUMENTS/$name 치환 → /hello Alice 시나리오
- [x] **10.2 Skills/SkillTool** — Skill 디렉토리 + listing/call + when_to_use 노출
- [x] **10.3 Hook** — HookEngine 빈/실 registry + PreToolUse deny + alias
- [x] **10.4 MCP** — MCPToolDef→Pydantic + create_mcp_tool (Tool Protocol) + load_mcp_config
- [x] **10.5 make_client** — vertex/vllm/unknown 분기 + get_default_model + agent 의 client/model 인자
- [x] **10.6 AGENT.md spec** — AgentSpec dataclass + AgentTool 메뉴 + 도구 필터
- [x] **10.7 message_queue** — push/drain FIFO + agent.py 합류 자리
- [x] **10.8 teams** — coordinator(빈 wait_all_idle + singleton) + mailbox(deliver/drain/history) + identity(ContextVar 격리) + TeamTool import
- [x] **진행 방식** — 9.1, 9.2, 10.8 은 메인 직접; 9.3 ~ 10.7 은 general-purpose agent 위임 (10 챕터 × 본문 발췌 + 누적 + sim 스크립트, 22 분 240 tool uses)

### 13-2. 1:1 diff 검증 — 카테고리 A 학습자 막힘 자리 발견 (commit `796d823`, `784db0b`)

- [x] _누적 디렉토리 (작동 PASS) ↔ 본문 코드 블록_ 1:1 일치 검증 (agent 위임, 70+ 자리 비교, 9 분 115 tool uses)
- [x] **카테고리 A 진단 4 건** + 메인 직접 verify (3 자리는 본문 코드 _진짜 깨짐_, 1 건은 분류 오류 — 진짜는 카테고리 B):
  - 10.4 `MCPToolWrapper` NameError — _dataclass + 동명 클로저 default_ 가 Python class body scope 함정 → import 즉시 NameError. `python3 -c "..."` 실험 확인. 회피 = alias 변수 (_input_model 등) + 일반 class. ⚠️ 콜아웃 추가 (commit `796d823`)
  - 9.5 `ToolContext(cwd=cwd)` — 9.4 본문이 ToolContext 정의 변경 + 생성 변경 _코드로 명시 안 함_ (주석만). _권한 위임 깨짐_ 우려. 9.4 본문 _코드 블록 두 자리_ 추가 (정의 + 생성) + 9.5 본문도 permissions 인자 합류
  - 9.5 `state.add_assistant(response.content)` — SDK Pydantic 객체 직접 (9.2~9.4 의 dict 패턴과 불일치). SDK 가 양쪽 받아 운 좋게 작동했지만 일관성 깨짐. content_blocks 변환 + dict 접근 모두 통일 (commit `784db0b`)

### 13-3. 카테고리 B 보강 — 학습자 추론 부담 자리 (commit `679e0d3`)

- [x] **10.3** query() 시그니처 변경 명시 (`hooks: HookEngine | None = None`) — 기존엔 본문 _다른 자리에 짧게 언급_ 만, _코드 블록 없음_
- [x] **10.5** Part 10 main.py 누적 안내 (10.1~10.8 각 챕터가 _변경분만_ 보여줌; 통합본은 `mini_claude/src/mini_claude/main.py` 한 자리 — 학습자가 _누적 결과_ 참조 가능)
- [x] **10.6** agents/__init__.py 패키지 export 코드 블록 (tools/agent.py 가 `from ..agents import AgentSpec` 로 가져갈 수 있도록)
- [x] **10.6** AgentTool description 의 _9.5 그대로_ 문자열 명시 (기존 `...` 줄임 풀기)
- [x] **10.6** AgentTool.call() 의 ⑥ 결과 회수 코드 완전 (기존 `...` 풀기 — fallback 텍스트 블록 합치기 11 줄)
- [x] **10.8** `_last_assistant_text()` 헬퍼 코드 블록 추가 (`_notify_lead_on_idle` 가 호출하는데 정의가 본문에 _누락_ 됐던 자리)
- [x] **10.8** TeamTool 보조 메서드 (__post_init__/_find_spec/_filter_tools/permission_summary/is_read_only/is_destructive) 가 _10.6 AgentTool 시그니처 그대로_ 임 명시 + 전체 모양은 `mini_claude/src/mini_claude/tools/team.py` 참조 안내

### 13-4. 수정 후 시뮬 재검증

- [x] **10.4 sim 재실행** — 누적 모양 = 수정된 본문 모양 → PASS 유지 (수정된 본문 그대로 학습자가 만들면 작동 확인)
- [x] **9.5 sim 재실행** — PASS 유지

### 13-5. 종합

- [x] **카테고리 A (학습자 막힘) 1 건** = 10.4 NameError 만 _진짜 import 실패_. 나머지 _SDK 양쪽 받기_ 같은 자리는 _운 좋게 작동_ 이지만 _일관성 깨짐_ 으로 같이 정리
- [x] **카테고리 B (학습자 추론 부담) 6 자리** 본문 보강
- [x] **카테고리 C (formatter / docstring / 공백) ~25 자리** 무시 — 작동 영향 없음
- [x] worktree 정리 (시뮬 worktree `learner-sim-cumulative` remove, 작업 worktree `book-coverage-fix` 는 push 후 정리)

---

## Phase 14: 핸드북 나열 UX 재설계 (3 → 6~8 → 10+ 자연 확장) *(✅ 완료)*

2026-05-23 사용자 _다음 페이즈 UX 고민_ 요청 — "지금 3개라 상관없지만 4개가 되면 깨질 것 같아요". 옵션 비교 (drop down vs 그리드 vs 다른) 후 옵션 _G (세로 리스트 + 사이드창 dropdown)_ 채택 — _Notion / Vercel docs / Stripe Guides_ 의 검증된 패턴, _N 핸드북 자연 확장_ (스크롤만 늘어남), _Tailwind safelist 회피_.

### 14-1. 데이터 분리 — Client/Server (commit `eef5677`, `2443810`)

- [x] **`src/lib/books.ts` 신설** — Client + Server 공통 UI 메타 (BOOKS / BookMeta / IconName / AccentName / getBookMeta). server-only 의존성 (fs/path/execSync/matter) 0
- [x] **`src/lib/markdown.ts`** — server-only 자리 (SERVER_CONFIGS: contentDir/excludePattern/getPartFromId/imageRewrite) 만 보존. `getBookConfig` 시그니처 → `BookServerConfig` 반환. 기존 _getSortedChapters / getChapter / getMiniClaudeSetupData / getSortedClaudeChaptersWithSetup_ 인터페이스 모두 보존 (Phase 12 의 사이드바 노출 변경 인터페이스)
- [x] **빌드 검증** — 초기 commit 1 (UI 메타 markdown.ts 합치기) 후 _"Module not found" — Client Component 가 server-only 의존성 import_ 빌드 깨짐 발견. commit 4 (Client/Server 분리) 로 해결. `npm run build` 통과 (Static/SSG/Dynamic)

### 14-2. 첫 화면 카드 그리드 → 세로 리스트 (commit `7876dae`)

- [x] **`HomeClient.tsx`** — `grid grid-cols-1 md:grid-cols-3 gap-6` → `flex flex-col gap-3`. 3 카드 하드코딩 → `BOOKS.map((book) => <BookRow ... />)`. 4 / 8 / 50+ 핸드북 모두 시각 비례 일관
- [x] **`BookRow` 컴포넌트** (HomeClient.tsx 내) — 가로 배치 (아이콘 왼쪽 / 제목+부제+설명+메타 가운데 / 읽기→ 오른쪽). 기존 색상·hover·iconText 유지 + Tailwind safelist 회피 (ACCENT_CLASSES lookup table)
- [x] **`max-w-4xl` → `max-w-3xl`** — 세로 리스트는 좁힐 때 가독성 ↑
- [x] **`page.tsx` Props 통일** — `chapterCounts: Record<Book, number>` (Object.fromEntries(BOOKS.map)) + `bookMetas: Record<Book, string>` 만 전달

### 14-3. 사이드창 상단 탭 → dropdown (commit `acbe9dc`)

- [x] **`Sidebar.tsx`** — `flex border-b border-slate-800` + `flex-1` 3 등분 탭 → 네이티브 `<select>` + 좌측 활성 책 아이콘 + 우측 ChevronDown. N 핸드북 자연 확장 (10+ 까지). aria-label="핸드북 선택"
- [x] **내부 데이터도 BOOKS / getBookMeta 기반** — `BookTab` → `Book` (books.ts), `BOOK_META` 로컬 Record 제거 → BOOKS 순회 + 컴포넌트 측 ICON_MAP / CHAPTER_ACTIVE_CLASSES, `detectedBook` 도 BOOKS.route prefix 매칭으로 일반화
- [x] **`ClientLayout.tsx` + `layout.tsx` Props 통일** — `semiChapters / statsChapters / claudeChapters` 3 자리 → `chaptersByBook: Record<Book, ChapterMeta[]>` 하나. claude 의 SETUP.md 합류는 _그 자리에서_ `getSortedClaudeChaptersWithSetup()` 조건 분기로 보존

### 14-4. 검증

- [x] **TS check** — `tsc --noEmit` clean
- [x] **빌드** — `npm run build` 통과 (Static / SSG / Dynamic 모두 prerendered)
- [x] **SSR HTML 검증** — `curl localhost:3010/` 와 `curl localhost:3010/claude/...` 둘 다 `<select aria-label="핸드북 선택">` + `<option value="semi/stats/claude" selected>` + `<h2>...핸드북` BookRow 정상 출력. 첫 화면 selected=semi (URL=/ 기본값), 챕터 페이지 selected=claude (URL detect 작동)

### 14-5. 4 번째 핸드북 추가 시 _자리 한 곳_

- [x] **`src/lib/books.ts`** — `BOOKS` 배열에 한 객체 + `Book` 유니온에 한 자리
- [x] **`src/lib/markdown.ts`** — `SERVER_CONFIGS` Record 에 한 객체
- [x] **`src/app/page.tsx`** — `bookMetas` Record 에 한 자리 (카드 footer 문자열 — `${chapterCounts.xxx}개 챕터` 등)
- [x] **`src/app/(new-book)/[id]/page.tsx`** — 새 라우트 디렉토리

총 _3~4 자리_ — HomeClient / Sidebar / ClientLayout / layout 은 _BOOKS.map / Object.fromEntries(BOOKS.map)_ 으로 _자동 반영_.

### 14-6. 후행 자리 (이번 라운드 _이후_)

- _F 카테고리화_ — 4~6 핸드북 도달 시 재고려
- _검색 (Cmd+K)_ — 30+ 도달 시
- _진행률 표시_ — `BookRow` 에 _학습자 진행 추적_ (사용자 요청 시)
- _카드 정보 밀도 보강_ — chapterCount/subtitle/lastUpdated 등 메타 _점진 추가_

---

## Phase 15: 미니 클로드 이름 통일 (한글 우선) *(✅ 완료)*

2026-05-23 사용자 — _mini-claude / mini_claude / mini Claude / 미니 에이전트 / 미니_ 등 _다양한 변형_ 호칭의 _통일_ 요청. 사용자 결정: _영어가 필요없는 자리에는 한글만_ + _챕터 이름, 파트 이름 포함 핸드북 전체_.

### 15-1. 표기 규칙 — 4 줄

| 자리 | 표기 |
|---|---|
| 내러티브 / 본문 / 챕터 제목 / Part 이름 | **미니 클로드** (조사 자유) |
| CLI 명령 인용 (실행할 명령) | `` `mini-claude` `` (코드 폰트) |
| import / 디렉토리 / 파일 경로 인용 | `` `mini_claude/` `` / `` `from mini_claude.agent import query` `` (코드 폰트) |
| 코드 블록 내부 (`````python` 안) | 변경 _없음_ — 코드 그대로 |

### 15-2. 본문 19 파일 145 자리 통일 (commit `eea5dec`)

- general-purpose agent 위임 (~25 분, 219 tool uses)
- Part 0/06/09/10/11 + mini_claude/SETUP.md + mini_claude/README.md
- 변경 자리:
  - `mini Claude` (공백+대문자) 2 자리 → _미니 클로드_
  - `미니 에이전트` 6 자리 → _미니 클로드_ (09_1 H1 제목 포함)
  - _내러티브 자리_ 의 `mini-claude` / `mini_claude` / 기타 `미니` → _미니 클로드_
- 변경 _안 함_:
  - 코드 폰트 / 코드 블록 / pyproject / 디렉토리 / import / `~/.mini_claude/` 컨벤션 / `print("mini-claude 시작 ...")` _사용자 친화 출력_
  - _부사적 "X의 미니 버전"_ (예: createSubagentContext 의 미니 버전, Python 미니 버전) — _미니 클로드와 무관한 축소판 의미_

### 15-3. markdown.ts Part 9 이름 3 자리 (commit `7311a9b`)

- `getPartFromId('09_')` 분기 (line 65)
- `getMiniClaudeSetupData()` 의 `part` 필드 (line 275)
- `getSortedClaudeChaptersWithSetup()` 의 setupChapter `part` 필드 (line 305)

모두 `'Part 9: 미니 Claude Code'` → `'Part 9: 미니 클로드'`. 사이드창 part 헤더 통일.

### 15-4. 검증

- 잔존 grep — `mini Claude` / `미니 에이전트` / `미니 Claude Code` 모두 _0 자리_
- TS check — clean
- 회귀 — 코드 자리 변경 _없음_ → `uv run mini-claude` 실행 영향 _없음_

### 15-5. 후행 자리

- _영문 브릿지 도입_ (예: `**미니 클로드** (mini-claude)`) — 학습자 피드백으로 _명령과 연결 안 됨_ 발견 시 _첫 등장 자리에만_ 추가
- _부사적 "미니 버전" 자리_ — 81 자리 중 _대부분 보존_, 학습자 피드백 따라 _문맥 보강_ 가능

---

## Phase 16: Mintlify 결 가독성 톤 다운 *(✅ 완료)*

2026-05-23 사용자 — _UI 가 나쁘지 않은데 눈이 좀 아프다_ + getdesign.md 참고 요청. _큐레이션 사이트_ (71 개 기업의 DESIGN.md 카탈로그) 확인 후 Mintlify (_문서 사이트 그 자체_) 선택. _이번 라운드는 즉시 효과 5 가지만_ (다크 유지) 합의.

### 16-1. Mintlify DESIGN.md 추출 (`VoltAgent/awesome-design-md` raw)

- canvas / ink / muted / brand-green (#00d4a4) + Inter / Geist Mono + 3 컬럼 + 헤딩 letter-spacing
- _브랜드 충돌_ — Mintlify 의 _시그니처 그린_ 은 우리 _시안/인디고 그라데이션_ (홈 hero) 과 다름. _그린 도입은 보류_, _구조/타이포/간격_ 만 가져옴.

### 16-2. 5 자리 적용 (commit `9e7fb3a`)

| 자리 | 변경 |
|---|---|
| 폰트 | `next/font` 의 `Geist_Mono` 추가 + `globals.css` body font override 제거 → Inter (이미 import) 자연 적용 |
| 본문 line-height | 1.6 → 1.7 (호흡 ↑) |
| 헤딩 letter-spacing | -0.025em (h1) / -0.015em (h2/h3) |
| 인라인 코드 액센트 | 시안 #67e8f9 → teal-300 #5eead4 (채도 ↓, 본문 자극 ↓) |
| 홈 폭 | `max-w-3xl` → `max-w-4xl` (호흡 ↑) |

### 16-3. 변경 _안 함_ (이번 라운드 OUT)

- _라이트 모드 토글_ — Mintlify dual-mode 시그니처 자리. 다음 라운드 옵션
- _3 컬럼 (우측 TOC)_ — 닥스 표준 자리. 다음 라운드 옵션
- _배경 / 본문 색_ — 다크 톤 자체는 유지 (브랜드 톤 + Notion dark feel 보존)
- _완전 그린 액센트 전환_ — 브랜드 시안/인디고 정체성 보존

### 16-4. 검증

- TS check — clean
- `npm run build` — 통과 (Geist_Mono 가 `next/font/google` 의 _real_ 한 폰트로 로드)
- _공유 dev (port 3000)_ 가 main hot reload 로 즉시 시각 확인

### 16-5. 후행 자리

- 사용자 _hot reload 시각 확인_ 후 _추가 톤 다운_ 또는 _라이트 모드 토글_ 필요 자리 발굴
- _코드 블록 (Shiki) 배경/보더_ 도 Mintlify `surface-code` (#1c1c1e) 와 비교해 _차분한 자리_ 가능
- BYOK / Q&A 패널 정리 (Phase 15 에서 _다음에 정리_ 합의 자리)

---

## Phase 17: 단일 시그니처 컬러 — Mintlify brand-green *(✅ 완료)*

2026-05-23 사용자 — _UI 할일 정리_ 요청 + _핸드북 별 컬러 정체성_ 자리. Explore 보고로 _현재 액센트 노출 불균형_ 발견 (semi=cyan 8/12, stats=emerald 3/12, claude=violet 3/12 — _공용 자리는 모두 cyan_, _stats/claude 정체성 부재_). 사용자 결정: _단일 시그니처_ + _Mintlify brand-green #00d4a4 그대로_ + _hero 그라데이션 정체성 유지 불필요_.

### 17-1. 단일 시그니처 데이터 모델 (`books.ts`)

- `AccentName = 'cyan' | 'emerald' | 'violet'` → `AccentName = 'green'` (필드 _보존_, 단일 값. 향후 _다른 색_ 도입 자리 _열려 있음_)
- 3 책 (semi/stats/claude) 모두 `accent: 'green'` 통일

### 17-2. Lookup table + 컴포넌트 색 통일 (commit `d377ddd`)

12 파일 약 30 자리 cyan/emerald/violet → `#00d4a4` (그라데이션 자리는 `#00d4a4 → #7cebcb` 의 _brand-green → brand-green-soft_):

| 자리 | 변경 |
|---|---|
| `HomeClient` | `ACCENT_CLASSES` 3 키 → 1 키 + hero icon + 그라데이션 span (cyan→indigo → green→green-soft) |
| `Sidebar` | `CHAPTER_ACTIVE_CLASSES` 단일화 + 로고 + 용어 사전 활성 |
| `Tabs.tsx:62` | 하드코딩 cyan 탭 → green |
| `SettingsModal` | 버튼 + input focus + 링크 (3 자리) |
| `SearchModal` | 책별 동적 라벨 lookup → 고정 green + chapter title + highlight `<mark>` |
| `glossary/board` | 배경 글로우 cyan+indigo → green+green-soft |
| `layout.tsx:32` | `selection:bg-cyan-500/30` → green |
| `[book]/[id]` 세 자리 | 글로우 (semi=cyan+indigo, stats=emerald+teal, claude=violet+purple) + navigation hover (책별 색) 모두 green |

### 17-3. 인라인 코드 액센트 (commit `3251012`)

`globals.css .prose code` color teal-300 `#5eead4` → Mintlify _brand-green-soft_ `#7cebcb`. Phase 16 의 _본문 자극 ↓_ 유지 + 사이트 전체 시그니처 일관성.

### 17-4. 책 구분 — 색 없이 유지

- 사이드창 dropdown 의 _아이콘_ (cpu/trending-up/terminal) + _부제_ + _책 이름_ 으로 구분
- 검색 모달의 _책 라벨 텍스트_ (반도체 / 통계 / Claude Code) 로 구분 — 색은 통일
- 챕터 페이지 자체에는 _책 표시자_ 없음 (사이드창 에서 활성 책으로 충분)

### 17-5. 검증

- TS check — clean
- `npm run build` — 통과 (Tailwind v4 의 arbitrary value `bg-[#00d4a4]/10` 정상 컴파일)
- _공유 dev hot reload_ — 모든 책의 사이드창 활성, 카드, hover, 글로우, 인라인 코드, 선택 모두 green 통일

### 17-6. 후행 자리 (Phase 18+)

**미등재 13 UI 자리** (이번 라운드 OUT):
- 검색 모달 결과/내용 시각 계층 강화
- 사이드바 푸터 — "다음 챕터" / 진행률 / 읽기 시간
- 글로서리 필터/카테고리
- 챕터 메타 (lastUpdated / readTime)
- 모바일 반응형 추가 테스트

**Phase 16 후행 (누적)**:
- 라이트 모드 토글 (dual-mode 시그니처)
- 3 컬럼 (우측 TOC)
- Shiki 코드 블록 배경/보더 (`#1c1c1e` surface-code)
- Mintlify neutral 토큰 (slate/steel/stone) CSS variable 등록

**Phase 15 후행**: BYOK / Q&A 패널 정리

---

## Phase 18: 콜아웃 카드 결 + 종류별 색 + 본문 링크 그린 *(✅ 완료)*

2026-05-23 사용자 — Mintlify quickstart 스크린샷 보고 _콜아웃 2 가지 색_ + _소제목_ 발견. 우리 자리 점검 결과: ① `.prose a` 가 Tailwind invert 의 _cyan-400 잔존_ (Phase 17 _누락_), ② blockquote 가 _좌측 보더만_ — _카드 결_ 부족, ③ 콜아웃 _이모지로만_ 구분 + _색 단일_.

### 18-1. blockquote 인터셉터 + 종류별 색 (commit `3519b1f`)

- `MarkdownViewer.tsx` — `blockquote` 인터셉터 추가, 첫 글자 인식 → `data-variant`:
  - `💡` → `tip`
  - `⚠️` (or `⚠`) → `warn`
  - `⚙️` (or `⚙`) → `note`
- `globals.css` — `.prose blockquote` 카드 결 (배경 + padding 0.875rem 1.125rem + radius 0.5rem + 좌측 보더 3px)
- variant 별 색:
  - tip: 배경 `rgba(0,212,164,.05)` + 보더 `#00d4a4`
  - warn: 배경 `rgba(195,125,13,.06)` + 보더 `#c37d0d`
  - note: 배경 `rgba(168,168,170,.05)` + 보더 `#888888`

### 18-2. 본문 링크 → 시그니처 그린 (Phase 17 누락 보완)

- `.prose a` 색: Tailwind invert 의 cyan → `#00d4a4`
- 부드러운 밑줄 (`text-decoration-color rgba(0,212,164,.4)`, hover 시 진한 `#00d4a4`)

### 18-3. CLAUDE.md 색 매핑 추가

- `## 8. 강조와 콜아웃` 표에 _색_ 컬럼 추가 — 작성자가 _이모지가 종류 신호_ 임을 _즉시 알 수 있게_
- _별도 마크업 불필요_ — 이모지 자체가 신호

### 18-4. 검증

- TS check — clean
- `npm run build` — 통과
- _공유 dev hot reload_:
  - 콜아웃 (💡/⚠️/⚙️) _카드 결로_ 도드라지고 종류별로 _다른 보더 색_
  - 본문 링크가 시안 → 그린 통일 (인라인 코드 결과 일관)

### 18-5. 후행 자리

- _Mintlify quickstart_ 스크린샷에서 추가 발견:
  - 우측 TOC (3 컬럼) — Phase 16 후행 자리 누적
  - H2 하단 hairline 또는 좌측 accent — 섹션 구분 강화 옵션
- 콜아웃에 _아이콘_ 위치 명시 (현재 이모지가 본문 첫 글자) — _별도 라운드_ 자리
- 기존 본문 (`content/`) 의 _💡/⚠️/⚙️ 미적용 콜아웃_ 자리 — 자연 통일됨 (이모지 인식)

---

## Phase 19: ASCII 다이어그램 wrapper + site-wide 파란 톤 제거 *(✅ 완료)*

2026-05-23 사용자 — _claude 핸드북의 ASCII 그림과 코드 포맷이 다른 것 의도냐_ 질문 + _코드 공간 + 사이드바에 클로드 핸드북이 파란색 계열_ 지적. 진단: ① CodeBlock 컴포넌트 자체는 공통이지만 _claude 가 ASCII 80+ 자리_ 라 _lang === 'text'_ 의 _색 없는 톤_ 이 _semi 의 Mermaid 또는 python 코드_ 와 _시각 결로 다름_, ② Tailwind _slate-_ (#0f172a, 살짝 푸름) 가 _site-wide 127 자리_ + _GitHub dark `#0d1117`_ + _SearchModal `#0f1729`_ 가 _파란 인식의 근원_.

### 19-1. ASCII 다이어그램 wrapper 분리 (옵션 A, commit `c5bff94`)

- `CodeBlock.tsx` — `effectiveLang === 'text'` 분기:
  - ASCII: `border-zinc-800/50 bg-zinc-900/40` (부드러운 surface, 코드와 시각 구분)
  - 코드: `border-zinc-800 bg-[#1c1c1e]` (Mintlify surface-code, 진한 charcoal)
- `Tabs.tsx`: `bg-[#0d1117]` → `bg-[#1c1c1e]`
- `SearchModal.tsx`: `bg-[#0f1729]` → `bg-[#1c1c1e]` (단일 검정 톤)

### 19-2. site-wide slate-* → zinc-* (commit `b30a520`)

- `find src -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.css' \) -exec sed -i '' 's/slate-\([0-9]\)/zinc-\1/g' {} +`
- 16 파일 124 자리 일괄 매핑 — Sidebar / HomeClient / MarkdownViewer / SearchModal / SettingsModal / QnAPanel / BoardClient / GlossaryClient / ClientLayout / CodeBlock / Tabs / [book]/[id]/page.tsx / layout / globals
- Tailwind slate (#0f172a — R=15 G=23 B=42, 파랑 우세) → zinc (#18181b — R=G=B 거의 같음, 진짜 중립)
- 남은 _slate-_ grep 매칭은 `translate-x/y` 의 _-late-_ false positive (3 자리)

### 19-3. 검증

- TS check — clean
- `npm run build` — 통과
- _공유 dev hot reload_:
  - 코드 블록 배경 — 푸르스름 검정 (#0d1117) → 진짜 charcoal (#1c1c1e)
  - ASCII 다이어그램 — _부드러운 surface_ 결로 _코드와 시각 구분_
  - 사이드바 / 모든 페이지 — 푸름 → _진짜 중립 회색_

### 19-4. 변경 _안 함_

- `content/` 의 _slate-_ 매칭 16 자리 — _claude_code/code_repository/web/_ 안의 _분석 대상 소스_ (우리 사이트 렌더링 대상 아님). _자기 코드 자리 보존_.
- `globals.css` 의 `--color-main-bg: #18181b` (zinc-900) — _이미 중립_, 변경 _불필요_
- Shiki `github-dark` 테마 — 코드 신택스 자체는 _보존_ (외곽 wrapper 만 charcoal 통일)
- Mintlify _라이트 모드 토글_ — Phase 16 후행 누적 자리, _별도 라운드_

### 19-5. 후행 자리

- _Shiki 테마_ — `github-dark` → _더 차분한 theme_ (예: `vitesse-dark`, `material-theme-darker`) 검토
- _Mintlify_ 의 _3 컬럼 (우측 TOC)_ — Phase 16 후행 누적
- _라이트 모드 토글_ — Mintlify dual-mode 시그니처

---

## Phase 20: 사이드바 헤드 + 드랍다운 콜아웃 그린 결로 *(✅ 완료)*

2026-05-23 사용자 — Phase 19 의 _site-wide slate→zinc_ 후 확인. _헤드와 드랍다운 윈도우는 중립 회색보단, 다른 콜아웃이랑 같은 색을 적용하는게 좋지 않을까요?_ 의 자리. _브랜드 앵커 강조_ + _Phase 18 콜아웃 tip (#00d4a4)_ 의 _결 통일_.

### 20-1. Sidebar.tsx 두 자리 (commit `8845f39`)

| 자리 | 기존 | 새 |
|---|---|---|
| 헤드 (`<Link href="/">` 로고 + 핸드북 시리즈) | `p-6 border-b border-zinc-800 hover:bg-white/[0.02]` (하단 보더만) | `m-3 p-4 rounded-xl border border-[#00d4a4]/15 bg-[#00d4a4]/[0.04] hover:bg-[#00d4a4]/[0.07] hover:border-[#00d4a4]/25` (카드 결로) |
| 드랍다운 wrapper | `px-4 py-3 border-b border-zinc-800` | `px-3 py-3 border-b border-zinc-800/60` (얇아진 구분선) |
| 드랍다운 select | `bg-zinc-900/60 border border-zinc-700 hover:border-zinc-600 focus:border-zinc-500 focus:ring-zinc-500` | `bg-[#00d4a4]/[0.05] border border-[#00d4a4]/20 hover:border-[#00d4a4]/35 focus:border-[#00d4a4] focus:ring-[#00d4a4]` |
| 드랍다운 좌측 아이콘 (ActiveIcon) | `text-zinc-400` | `text-[#00d4a4]` (책 아이콘 강조) |

콜아웃 _💡 tip_ 결 (`rgba(0,212,164,.05)` 배경 + `#00d4a4` 보더) 과 _일관_.

### 20-2. 변경 _안 함_

- 챕터 활성 자리 (`CHAPTER_ACTIVE_CLASSES`) — _이미 그린_ (Phase 17)
- 챕터 _비활성_ hover — _zinc 중립 유지_ (그린 과도 방지)
- 사이드바 푸터 (검색 / 용어 사전 / API Settings) — _보존_ (Phase 17 에서 _용어 사전 활성_ 만 그린)
- 드랍다운 ChevronDown 아이콘 — _zinc 중립_ (시각 균형)

### 20-3. 검증

- TS check — clean
- _공유 dev hot reload_ — 사이드바 상단 _두 자리_ 가 _콜아웃 결로_ 강조

### 20-4. 후행 자리

- _데스크탑 사이드바 접기 / 모바일 닫기 버튼_ 의 _절대 위치_ — 헤드 카드 결로 떨어진 후 _위치 미세 조정_ 필요할 수 있음 (현재는 _aside 최상단 top-3 right-3_ 으로 _헤드 카드 위_ 12px 자리에 _자연 안착_)
- _Mintlify 의 _outline 그린 글로우_ on focus_ — 더 진한 자리 가능

---

## Phase 21: 박스 11 종류 → 4 카테고리 압축 (콜아웃 단일 결) *(✅ 완료)*

2026-05-23 사용자 — 0.0 챕터에서 _콜아웃 검정 / ASCII 외곽 다름 / 코드 헤더 검정 / 팁 초록_ 의 _시각 결 어긋남_ 지적 + _박스 종류 정리_ 요청. 11 종류 표 작성 후 사용자 통찰: _4 카테고리 (코드 / 다이어그램 / 콜아웃 / 표)_ 로 압축 가능, _콜아웃은 단일 결 + 이모지가 색 신호_, _Deep Dive 는 콜아웃과 _접힘/펼침_ 만 차이_.

### 21-1. 압축 후 4 카테고리

| # | 종류 | 트리거 | 시각 결 |
|---|---|---|---|
| 1 | 코드 블록 | `\`\`\`python` / `:::tabs` | charcoal `#1c1c1e` + 헤더 `bg-zinc-900/60` |
| 2 | 다이어그램 | `diagramRegistry` 매칭 React 컴포넌트 | 자기 컴포넌트 (외곽 _없음_) |
| 3 | 콜아웃 | `> 이모지` (펼침) / `<details><summary>🔬` (접힘) | 단일 카드 결 — _이모지가 색 신호_ |
| 4 | 표 | `\| ... \|` | Notion 결 (독립) |

### 21-2. 콜아웃 단일 결 + Deep Dive 통일 (commit `4dee164`)

- `globals.css`: `.prose blockquote[data-variant="tip/warn/note"]` 3 자리 색 분기 _제거_
- `globals.css`: `.prose blockquote, .prose details` 단일 셀렉터 — 카드 결 (radius/padding/배경/좌측 보더) _동일_
- `globals.css`: `.prose summary` 커서/굵음 + `details > *:not(summary)` 간격
- `MarkdownViewer.tsx`: `blockquote` 인터셉터 _제거_ (이모지 인식 + `data-variant` 분기 _불필요_)
- _기능적 차이_: 접힘 (Deep Dive) vs 펼침 (blockquote) — _색 차이 없음_, _이모지가 _자체 시각 신호_

### 21-3. CLAUDE.md 단순화

- `## 8. 강조와 콜아웃` 표에서 _색_ 컬럼 _제거_
- _콜아웃 단일 결 + 이모지가 시각 신호_ 원칙 명시
- 작성자가 _색 결정 불필요_ — 이모지 (💡/⚠️/⚙️/🔬) 만 _자기 의도_ 선택

### 21-4. 후행 자리 (별도 라운드)

- **ASCII 다이어그램 (`\`\`\`text`) → React 컴포넌트 변환** — claude 핸드북에 80+ 자리, _작성자 수동 작업_ 필요. 변환 _완료 후_ CodeBlock 의 `lang === 'text'` 분기 _제거_ → 박스 종류 _3 카테고리_ (다이어그램 안 _ASCII 보존 자리_ _완전 제거_).
- _Deep Dive_ 의 _브라우저 기본 마커_ (▶/▼) — _커스텀_ 자리 (스타일/위치) 결정 자리

---

## Phase 22: 콜아웃 + 코드 헤더에 시그니처 그린 톤 부여 *(✅ 완료)*

2026-05-23 사용자 — Phase 21 통일 후 _콜아웃 배경 (rgba(255,255,255,.025) — 거의 검정) + 코드 헤더 (bg-zinc-900/60 — 진한 회색)_ 이 _zinc-950 배경 위에서 _구분 안 됨_ 지적. _색을 줍시다_ — 시그니처 그린 옅은 톤 부여.

### 22-1. 변경 (commit `816797b`)

| 자리 | 기존 | 새 |
|---|---|---|
| `.prose blockquote, .prose details` 배경 | `rgba(255,255,255,.025)` 거의 검정 | `rgba(0,212,164,.045)` 옅은 그린 |
| 같은 자리 좌측 보더 | `rgba(255,255,255,.15)` 옅은 회색 | `#00d4a4` 시그니처 그린 |
| CodeBlock 헤더 배경 | `bg-zinc-900/60` 진한 회색 | `bg-[#00d4a4]/[0.06]` 옅은 그린 |
| 같은 자리 하단 보더 | `border-zinc-800` | `border-[#00d4a4]/15` |
| 같은 자리 label 텍스트 | `text-zinc-400` | `text-[#00d4a4]/80` (배경과 _덜 충돌_) |

### 22-2. Phase 21 의 _이모지 신호_ 와 충돌 _없음_

- 콜아웃의 _배경 색_ 은 _브랜드 일관 (시그니처 그린)_
- 이모지 (💡/⚠️/⚙️/🔬) 는 _자체 색_ 으로 _부가 의미 신호_
- _시각 결 (radius/padding/보더)_ 는 _단일_ 유지 — Phase 21 정신 보존

### 22-3. 후행 자리

- _콜아웃 자체_ 가 _그린 결로_ 통일 후 _사이드바 헤드/드랍다운 (Phase 20)_ 과 _시각 결 일치_ — _브랜드 일관_ ↑
- _코드 본문 (charcoal #1c1c1e)_ 과 _코드 헤더 (옅은 그린)_ 의 _명도 대비_ 가 _자연_ — 헤더가 _도드라짐_

---

## Phase 23: claude 핸드북 ASCII → React 다이어그램 변환 시작 *(🚧 진행 중)*

2026-05-23 사용자 — Phase 21 의 _박스 11→4 카테고리 압축_ 후 _ASCII → React 변환_ 결정. 사용자 선택: **B (React 전면, semi 패턴)** + **시범 자리 09_1 미니 클로드 골격**.

### 23-1. 인프라 구축 (commit `842dfd4`)

- `diagramTokens.ts` — `CLAUDE_COLOR` 추가 (`accent #00d4a4` 시그니처 그린 가족)
- `claudeRegistry.ts` 신설 — claude 핸드북 전용 registry
- `diagramRegistry.ts` — `claudeDiagramRegistry` spread 추가 (semi/stats 와 일관)
- key 패턴: `/content/claude_code/images/[chapter]/[name].svg` (semi 와 일관 — _실제 파일 없어도 _registry 매칭으로 React 컴포넌트 대체_)

### 23-2. 첫 변환 — 09_1 미니 클로드 골격

- 41 줄 ASCII (5 박스 + 내부 4 단계 + 6 화살표) → `MiniClaudeArchitecture.tsx` React 컴포넌트
- 구조: main → query() (내부 ①LLM ②파싱 ③권한 ④도구 + while 루프) → streaming → tools/agent (AgentTool 재귀)
- 챕터 매핑 태그 (9.2 / 9.3 / 9.4 / 9.5) 시그니처 그린 칩으로 강조
- Geist Mono 폰트 + zinc 톤 박스 + Mintlify brand-green 보더

### 23-3. 남은 자리 (점진 진행)

claude 의 ASCII 자리 (chapter 별 박스 개수 — 33 자리, 총 ~80+ 박스):

| 우선순위 | 챕터 | 자리 수 | 비고 |
|---|---|---|---|
| 1 | 09_1 | 53 | _첫 변환 완료_, 나머지 자리도 점진 |
| 2 | 06_6 Hook 실전 | 46 | 실행 흐름 — _시퀀스 패턴_ |
| 3 | 03_2 Tool 47 필드 | 44 | 필드 매트릭스 — _표/카드 패턴_ |
| 4 | 08_4 Agent Teams | 35 | 구조도 |
| 5 | 10_1 슬래시 명령 | 34 | 명령 구조 |
| ... | (생략) | ~80 | 점진 전환 |

### 23-4. 변환 _완료 후_

- CodeBlock 의 `lang === 'text'` 분기 _제거_ (Phase 19 의 ASCII wrapper)
- 박스 종류 _3 카테고리_ (코드 / 다이어그램 / 콜아웃 / 표 → 코드 / 다이어그램 / 콜아웃 / 표; ASCII wrapper 자리 _완전 제거_)

---

## Phase 24: 사이드바 헤드 정리 + 02_1 두 계층 루프 다이어그램 *(✅ 완료)*

2026-05-23 사용자 — Phase 23 시범 (09_1) 후 _이어가기_ + 사이드바 헤드 _외곽선 / 배경색 제거_ 요청.

### 24-1. 사이드바 헤드 (commit `4fa329f`)

Phase 20 에서 도입한 _카드 결로_ (m-3 p-4 rounded-xl + #00d4a4 보더/배경) → 순수 _padding + hover_:
- `m-3 p-4 rounded-xl border border-[#00d4a4]/15 bg-[#00d4a4]/[0.04] ... hover:bg-[#00d4a4]/[0.07] hover:border-[#00d4a4]/25` → `p-5 ... hover:bg-white/[0.02]`
- 아이콘 (BookOpen 의 그린 배경/보더/텍스트) _보존_ — 브랜드 신호 유지

### 24-2. 02_1 두 계층 루프 (commit `d66f68e`)

- `TwoLayerAgentLoop.tsx` — nested 박스 (외부 루프 한 턴 / 내부 루프 LLM 호출 + 도구 처리) + ⑤ 단계 Yes/No 분기 (├─ Yes / └─ No)
- `claudeRegistry`: 2 번째 등재 (`02_1/two_layer_loop.svg`)
- `02_1.md`: 21 줄 ASCII → 1 줄 이미지 참조
- 09_1 의 query() 자리와 _재방문 연결_ — 학습자가 _두 번_ 보는 자리

### 24-3. 우선순위 결정 근거

- 09_1 _남은 자리_ — 디렉토리 트리 (`├── └──`) 1 자리만 — _ASCII 가 트리 구조에 _자연_ + 코드 폰트 일관_, _React 변환 가치 ↓_ — _보존_ 결정
- 02_1 — _학습자 가장 자주 본 자리_ (외부+내부 루프 nested) — _Part 9 의 query() 와 _재방문 연결_

### 24-4. 다음 자리 (점진)

| 우선순위 | 챕터 | 비고 |
|---|---|---|
| 1 | 0.1 도구를 쓸 줄 아는 챗봇 | 학습자 첫 접점 |
| 2 | 1.1 부트스트랩 30ms | 초기 흐름 |
| 3 | 3.1 도구란 무엇인가 | Part 3 진입 |
| 4 | 5.1 터미널에 React | UI 구조 |
| 5 | 6.3 권한 모드 5 가지 | 권한 흐름 |
| 6 | 8.4 Agent Teams | 멀티 에이전트 |
| 7 | 10_x 시리즈 (Hook, MCP, Skill, Team) | Part 10 확장 |

---

## Phase 25: claude 다이어그램 batch 1 — 00_1 + 03_1 (가속) *(✅ 완료)*

2026-05-23 사용자 — _병렬 다중_ 가속 결정. 0.1 / 1.1 / 3.1 시도, _1.1 자리 모두 코드 (ASCII 다이어그램 없음)_ 발견 → 2 자리 진행.

### 25-1. 변환 (commit `cd1effd`)

| 자리 | 컴포넌트 | 내용 |
|---|---|---|
| 00_1 BLOCK 1 (22 줄) | `AgentLoopBranch.tsx` | 사용자 입력 → API 호출 → 응답 분기 (텍스트 → 종료 / 도구 → ↻ 루프) |
| 03_1 BLOCK 1 (13 줄) | `ToolAsMicroservice.tsx` | _Read_ 도구의 8 가지 구성 (입력/권한/실행/렌더링/메타) |

`claudeRegistry` 4 자리 등재 (09_1, 02_1, 00_1, 03_1).

### 25-2. 1.1 진단

1.1 부트스트랩 30ms 의 _모든 코드 블록_ 은 `\`\`\`typescript` / `\`\`\`python` _코드 자리_ — _ASCII 다이어그램 없음_. 텍스트 박스 + Python/TS 코드만으로 _구성_ → React 변환 _대상 아님_.

### 25-3. 남은 우선순위

| 다음 라운드 | 챕터 | 비고 |
|---|---|---|
| 1 | 5.1 터미널에 React | UI 구조 |
| 2 | 6.3 권한 모드 5 가지 | 권한 흐름 |
| 3 | 8.4 Agent Teams | 멀티 에이전트 |
| 4 | 3.1 BLOCK 2 (148 줄) | _전체 도구 카탈로그_ — 큰 자리, 단순화 변환 |
| 5 | 10_x 시리즈 | Part 10 확장 |

ASCII 자리 분석 도구 정리 — 작성자가 _```$_ 또는 _```text$_ 자리만 _진짜 ASCII_, 다른 lang 자리는 _코드 블록_.

---

