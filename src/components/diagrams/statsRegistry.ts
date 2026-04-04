import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

const CentralTendencyComparison = dynamic(() => import('./stats/CentralTendencyComparison'), { ssr: false });
const EmpiricalRuleNormal = dynamic(() => import('./stats/EmpiricalRuleNormal'), { ssr: false });
const BoxplotAnatomy = dynamic(() => import('./stats/BoxplotAnatomy'), { ssr: false });
const AnscombeQuartet = dynamic(() => import('./stats/AnscombeQuartet'), { ssr: false });
const HistogramBinComparison = dynamic(() => import('./stats/HistogramBinComparison'), { ssr: false });
const BayesTheoremSlider = dynamic(() => import('./stats/BayesTheoremSlider'), { ssr: false });
const PmfPdfCdfGrid = dynamic(() => import('./stats/PmfPdfCdfGrid'), { ssr: false });
const DiscreteDistributionExplorer = dynamic(() => import('./stats/DiscreteDistributionExplorer'), { ssr: false });
const ContinuousDistributionExplorer = dynamic(() => import('./stats/ContinuousDistributionExplorer'), { ssr: false });
const CLTSimulation = dynamic(() => import('./stats/CLTSimulation'), { ssr: false });
const LLNConvergence = dynamic(() => import('./stats/LLNConvergence'), { ssr: false });
const EstimatorTargetBoard = dynamic(() => import('./stats/EstimatorTargetBoard'), { ssr: false });
const ConfidenceIntervalSim = dynamic(() => import('./stats/ConfidenceIntervalSim'), { ssr: false });
const HypothesisTestVisualizer = dynamic(() => import('./stats/HypothesisTestVisualizer'), { ssr: false });
const TDistributionComparison = dynamic(() => import('./stats/TDistributionComparison'), { ssr: false });
const AnovaDecomposition = dynamic(() => import('./stats/AnovaDecomposition'), { ssr: false });
const MultipleTestingComparison = dynamic(() => import('./stats/MultipleTestingComparison'), { ssr: false });
const OLSFitVisualizer = dynamic(() => import('./stats/OLSFitVisualizer'), { ssr: false });
const ResidualPatterns = dynamic(() => import('./stats/ResidualPatterns'), { ssr: false });
const SigmoidCurve = dynamic(() => import('./stats/SigmoidCurve'), { ssr: false });
const L1L2ContourPlot = dynamic(() => import('./stats/L1L2ContourPlot'), { ssr: false });
const BiasVarianceTradeoff = dynamic(() => import('./stats/BiasVarianceTradeoff'), { ssr: false });
const PosteriorConvergence = dynamic(() => import('./stats/PosteriorConvergence'), { ssr: false });
const MCMCTraceViewer = dynamic(() => import('./stats/MCMCTraceViewer'), { ssr: false });
const SampleSizeCalculator = dynamic(() => import('./stats/SampleSizeCalculator'), { ssr: false });
const KLDivergenceAsymmetry = dynamic(() => import('./stats/KLDivergenceAsymmetry'), { ssr: false });
const CurseDimensionality = dynamic(() => import('./stats/CurseDimensionality'), { ssr: false });
const CausalDAGExplorer = dynamic(() => import('./stats/CausalDAGExplorer'), { ssr: false });

export const statsDiagramRegistry: Record<string, ComponentType> = {
    /* Stats 01_01 — 평균, 중앙값, 최빈값 */
    '/content/images/stats/01_01/central_tendency_comparison.svg': CentralTendencyComparison,

    /* Stats 01_02 — 분산과 표준편차 */
    '/content/images/stats/01_02/empirical_rule_normal.svg': EmpiricalRuleNormal,

    /* Stats 01_03 — 백분위수와 IQR */
    '/content/images/stats/01_03/boxplot_anatomy.svg': BoxplotAnatomy,

    /* Stats 01_04 — 상관계수의 함정 */
    '/content/images/stats/01_04/anscombe_quartet.svg': AnscombeQuartet,

    /* Stats 01_05 — 시각화의 통계학 */
    '/content/images/stats/01_05/histogram_bin_comparison.svg': HistogramBinComparison,

    /* Stats 02_01 — 베이즈 정리 */
    '/content/images/stats/02_01/bayes_theorem_slider.svg': BayesTheoremSlider,

    /* Stats 02_02 — PMF, PDF, CDF */
    '/content/images/stats/02_02/pmf_pdf_cdf_grid.svg': PmfPdfCdfGrid,

    /* Stats 02_03 — 이산확률분포 */
    '/content/images/stats/02_03/discrete_distribution_explorer.svg': DiscreteDistributionExplorer,

    /* Stats 02_04 — 연속확률분포 */
    '/content/images/stats/02_04/continuous_distribution_explorer.svg': ContinuousDistributionExplorer,

    /* Stats 02_05 — 중심극한정리 */
    '/content/images/stats/02_05/clt_simulation.svg': CLTSimulation,

    /* Stats 02_06 — 큰 수의 법칙 */
    '/content/images/stats/02_06/lln_convergence.svg': LLNConvergence,

    /* Stats 03_01 — 모수와 통계량 */
    '/content/images/stats/03_01/estimator_target_board.svg': EstimatorTargetBoard,

    /* Stats 03_02 — 점추정과 구간추정 */
    '/content/images/stats/03_02/confidence_interval_sim.svg': ConfidenceIntervalSim,

    /* Stats 03_03 — 가설검정의 프레임워크 */
    '/content/images/stats/03_03/hypothesis_test_visualizer.svg': HypothesisTestVisualizer,

    /* Stats 03_04 — t검정과 z검정 */
    '/content/images/stats/03_04/t_distribution_comparison.svg': TDistributionComparison,

    /* Stats 03_05 — 카이제곱, ANOVA */
    '/content/images/stats/03_05/anova_decomposition.svg': AnovaDecomposition,

    /* Stats 03_06 — 다중검정 */
    '/content/images/stats/03_06/multiple_testing_comparison.svg': MultipleTestingComparison,

    /* Stats 04_01 — 선형회귀의 통계학적 의미 */
    '/content/images/stats/04_01/ols_fit_visualizer.svg': OLSFitVisualizer,

    /* Stats 04_02 — 회귀 진단 */
    '/content/images/stats/04_02/residual_patterns.svg': ResidualPatterns,

    /* Stats 04_03 — 로지스틱 회귀 */
    '/content/images/stats/04_03/sigmoid_curve.svg': SigmoidCurve,

    /* Stats 04_04 — 정규화의 통계적 해석 */
    '/content/images/stats/04_04/l1_l2_contour_plot.svg': L1L2ContourPlot,

    /* Stats 04_05 — 편향-분산 트레이드오프 */
    '/content/images/stats/04_05/bias_variance_tradeoff.svg': BiasVarianceTradeoff,

    /* Stats 05_01 — 빈도주의 vs 베이지안 */
    '/content/images/stats/05_01/posterior_convergence.svg': PosteriorConvergence,

    /* Stats 05_04 — MCMC 맛보기 */
    '/content/images/stats/05_04/mcmc_trace_viewer.svg': MCMCTraceViewer,

    /* Stats 06_01 — A/B테스트 설계 */
    '/content/images/stats/06_01/sample_size_calculator.svg': SampleSizeCalculator,

    /* Stats 06_03 — 정보이론 기초 */
    '/content/images/stats/06_03/kl_divergence_asymmetry.svg': KLDivergenceAsymmetry,

    /* Stats 06_04 — 차원의 저주 */
    '/content/images/stats/06_04/curse_dimensionality.svg': CurseDimensionality,

    /* Stats 06_05 — 인과추론 입문 */
    '/content/images/stats/06_05/causal_dag_explorer.svg': CausalDAGExplorer,
};
