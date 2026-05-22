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
- [x] 섹션 번호 + 한국어 조사 붙여쓰기: `0.0의/0.0에서/6.4의/3.5의/7.4의/9.4의/8.1의/8.2의/9.3의/9.3은/9.3에서/10.3의/10.3은/10.2의/7.2의/8.3에서` 등
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
- [x] 10.3 MCP 서버 만들기
- [x] 10.4 Hook 만들기 (6.5 회수 — 5 이벤트, fail-open, deny 절대 우선)
- [x] 10.5 사용자 정의 에이전트 (8.1·8.2 회수 — `.claude/agents/<name>/AGENT.md` + subagent_type 분기)
- [x] 10.6 메시지 큐 (2.2 Deep Dive 회수 — 모듈 싱글턴 deque, 4 입력자 인프라, 10.7 의 토대)
- [x] 10.7 에이전트 팀 (8.4 회수 — contextvars 격리, asyncio.Queue 메일박스, polling 없는 fan-in. 게이트/공유 메모리/secret guard OUT)
- [x] 10.8 API 클라이언트 (07_1 회수 — Vertex 기본 + vLLM OpenAI 호환 어댑터. Bedrock/Foundry OUT)

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
- [x] 10.7 에이전트 팀 신규 챕터 + mini_claude teams 모듈 (commit `bcf8423`)
- [x] 10.8 API 클라이언트 신규 챕터 + mini_claude clients 모듈 (Vertex + vLLM 어댑터) (commit `4832510`)

**Vertex 실행 보장**:
- [x] mini_claude/SETUP.md + `anthropic[vertex]` extra — google.auth import 보장 (commit `3416d0e`)
- [x] Vertex region/model 기본값 학습자 환경 표준에 맞춤 — `claude-opus-4-7` alias + `global` region + `CLOUD_ML_REGION` fallback (commit `b25b356`)

**9.x + 10.4 본문 코드 Vertex 화**:
- [x] 9.x + 10.4 본문 코드 인용을 `AsyncAnthropicVertex` 로 (23 자리) — 학습자가 본문 그대로 복사해서 만들면 작동 (commit `af4654a`)

**누적 검증 발견 갭 보강 (7 개)**:
- [x] 9.1/9.2/9.5 본문 갭 3개 — pyproject Vertex extra / messages.py 라벨 / agent.py import (commit `324da39`)
- [x] 10.1/10.4/10.5 본문 갭 3개 — PyYAML 의존성 / hooks 생략 메서드 + HookInput / _normalize_list 정의 (commit `bcb20ad`)
- [x] 추가 보강 4 — 10.3 mcp[cli] / 10.4 완전한 hooks 본문 / SETUP §0 GCP 진입 가이드 / 11 에필로그 10.7·10.8 회수 (이 commit)

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
| 10.3 | 가짜 MCP 서버 spawn → tools/call | ✅ |
| 10.4 | Hook 빈 registry → None | ✅ |
| 10.5 | AGENT.md 발견 → spec 1개 | ✅ |
| 10.6 | message_queue push/drain | ✅ |
| 10.7 | teams wait_all_idle + mailbox | ✅ |
| 10.8 | make_client → Vertex + vLLM 변환 | ✅ |

---

## Phase 10: SETUP 단순화 — JSON 한 길 + `.env` 흐름

학습자 SETUP 흐름이 _gcloud 로그인 길_ + _SA JSON 길_ 두 갈래로 복잡해서 _JSON 한 길_ 로 압축. 본문 9.x / 10.8 도 _gcloud ADC_ 표현을 _Service Account JSON_ 으로 통일. 환경변수 설정은 _shell rc export_ 가 아닌 _`.env` 파일 + `python-dotenv` 자동 로드_ 방식으로.

### 10-1. gcloud → SA JSON 통일
- [x] SETUP.md 재작성 — §0 GCP 신규 / §1 API / §2 Model Garden / §4 IAM 을 _전제_ 로 압축, §3 의 길 A(gcloud) 제거. ~204줄 → ~85줄
- [x] 9.1 본문 — 인증 한 줄 + 💡 콜아웃 + `main.py` stub 에러 메시지 (3 자리)
- [x] 9.2 본문 — `_make_vertex_client()` env 이름 (`GOOGLE_CLOUD_PROJECT`→`VERTEX_PROJECT_ID`, `CLOUD_ML_REGION`→`VERTEX_LOCATION`), `main.py` env 체크, 진짜로 돌려보기 셸
- [x] 10.8 본문 — ⚠️ 콜아웃 끝 표현 + Vertex 시나리오 셸 (gcloud 두 줄 제거)
- [x] mini_claude 코드 — `clients/__init__.py` docstring 의 _또는 gcloud ADC_ 제거
- [x] 학습자 누적 시뮬로 검증 — `VERTEX_PROJECT_ID` + `VERTEX_LOCATION` + `GOOGLE_APPLICATION_CREDENTIALS` + `MINI_LLM_MODEL` 4 개만으로 (1) `_check_environment()` 통과 (2) 9.2 `_make_vertex_client()` 객체 생성 (3) 10.8 `make_client()` + `get_default_model()` 작동 (4) `VERTEX_PROJECT_ID` 누락 시 친절 에러 — 4/4 PASS

### 10-2. `.env` 흐름 도입
- [x] `mini_claude/pyproject.toml` — `python-dotenv>=1.0.0` 의존성 추가 + `uv sync`
- [x] `mini_claude/src/mini_claude/main.py` — `from dotenv import load_dotenv` + `main()` 첫 줄에 `load_dotenv()` 호출 (Write 로 file 전체 한 번에 — ruff hook 의 중간상태 F401 회피)
- [x] `mini_claude/.env.example` 신규 — 학습자 템플릿 (4 변수 + vLLM 주석)
- [x] 저장소 root `.gitignore` — `.env*` 옆에 `!.env.example` negation 추가
- [x] SETUP.md §2 재작성 — _shell rc export_ → `cp .env.example .env` + 편집 흐름. 💡 콜아웃에 `.env` git 제외 + dotenv 자동 로드 설명
- [x] 9.1 본문 — pyproject.toml 의존성 _세 줄→네 줄_ + main.py stub 의 `from dotenv import load_dotenv` + `main()` 의 `load_dotenv()` 호출
- [x] 9.2 본문 — main.py 의 dotenv import + `load_dotenv()` 호출 + 진짜로 돌려보기 셸 (`export ...` → `cp .env.example .env` + 편집)
- [x] `.env` 자동 로드 시뮬 검증 — tmpdir 의 `.env` → `load_dotenv()` → `_check_environment()` 통과 → `make_client()` 작동 (4/4 PASS) + 진짜 `mini-claude` CLI 가 _.env 만으로_ REPL 진입 확인

---

