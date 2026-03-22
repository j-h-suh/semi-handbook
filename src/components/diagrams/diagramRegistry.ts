import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// Lazy-load diagram components to keep bundle size small
const MOSFETCrossSection = dynamic(() => import('./MOSFETCrossSection'), { ssr: false });
const TransistorGrowth = dynamic(() => import('./TransistorGrowth'), { ssr: false });
const ChipProcessFlow = dynamic(() => import('./ChipProcessFlow'), { ssr: false });
const SiliconPurity = dynamic(() => import('./SiliconPurity'), { ssr: false });
const IngotToWafer = dynamic(() => import('./IngotToWafer'), { ssr: false });
const CrystalOrientation = dynamic(() => import('./CrystalOrientation'), { ssr: false });
const FrontEndProcessFlow = dynamic(() => import('./FrontEndProcessFlow'), { ssr: false });
const ChipCrossSection = dynamic(() => import('./ChipCrossSection'), { ssr: false });
const ProcessDataVolume = dynamic(() => import('./ProcessDataVolume'), { ssr: false });
const ThermalOxidationFurnace = dynamic(() => import('./ThermalOxidationFurnace'), { ssr: false });
const DealGroveOxidation = dynamic(() => import('./DealGroveOxidation'), { ssr: false });
const ALDvsCVDConformality = dynamic(() => import('./ALDvsCVDConformality'), { ssr: false });
const WetVsDryEtchProfile = dynamic(() => import('./WetVsDryEtchProfile'), { ssr: false });
const RIEChamber = dynamic(() => import('./RIEChamber'), { ssr: false });
const EtchProfileDefects = dynamic(() => import('./EtchProfileDefects'), { ssr: false });
const OESEndpointDetection = dynamic(() => import('./OESEndpointDetection'), { ssr: false });
const DopingProfileEnergy = dynamic(() => import('./DopingProfileEnergy'), { ssr: false });
const ChannelingEffect = dynamic(() => import('./ChannelingEffect'), { ssr: false });
const AnnealLatticeRecovery = dynamic(() => import('./AnnealLatticeRecovery'), { ssr: false });
const CMPNecessity = dynamic(() => import('./CMPNecessity'), { ssr: false });
const DishingErosion = dynamic(() => import('./DishingErosion'), { ssr: false });
const BEOLMetalLayers = dynamic(() => import('./BEOLMetalLayers'), { ssr: false });
const DamasceneProcessSteps = dynamic(() => import('./DamasceneProcessSteps'), { ssr: false });
const RCDelayVsGateDelay = dynamic(() => import('./RCDelayVsGateDelay'), { ssr: false });
const WireBondVsFlipchip = dynamic(() => import('./WireBondVsFlipchip'), { ssr: false });
const BinningDistribution = dynamic(() => import('./BinningDistribution'), { ssr: false });
const Packaging2_5D3D = dynamic(() => import('./Packaging2_5D3D'), { ssr: false });
const WaferMapPatterns = dynamic(() => import('./WaferMapPatterns'), { ssr: false });
const MooresLawGraph = dynamic(() => import('./MooresLawGraph'), { ssr: false });
const TransistorDensityByNode = dynamic(() => import('./TransistorDensityByNode'), { ssr: false });
const ClockFrequencyStagnation = dynamic(() => import('./ClockFrequencyStagnation'), { ssr: false });
const PlanarFinFETGAA = dynamic(() => import('./PlanarFinFETGAA'), { ssr: false });
const FoundryMarketShare = dynamic(() => import('./FoundryMarketShare'), { ssr: false });
const FabConstructionCost = dynamic(() => import('./FabConstructionCost'), { ssr: false });
const ASMLEuvScanner = dynamic(() => import('./ASMLEuvScanner'), { ssr: false });
const SemiIndustryStructure = dynamic(() => import('./SemiIndustryStructure'), { ssr: false });
const SemiValueChain = dynamic(() => import('./SemiValueChain'), { ssr: false });
const PhotoPrintingVsLitho = dynamic(() => import('./PhotoPrintingVsLitho'), { ssr: false });
const TrackScannerSystem = dynamic(() => import('./TrackScannerSystem'), { ssr: false });
const SpinCoatingCrossSection = dynamic(() => import('./SpinCoatingCrossSection'), { ssr: false });
const ReductionProjectionOptics = dynamic(() => import('./ReductionProjectionOptics'), { ssr: false });
const LithoProcessFlow = dynamic(() => import('./LithoProcessFlow'), { ssr: false });
const Part2Roadmap = dynamic(() => import('./Part2Roadmap'), { ssr: false });
const StepperOperation = dynamic(() => import('./StepperOperation'), { ssr: false });
const ScannerSlitScanning = dynamic(() => import('./ScannerSlitScanning'), { ssr: false });
const IlluminationShapes = dynamic(() => import('./IlluminationShapes'), { ssr: false });
const DualStageConcept = dynamic(() => import('./DualStageConcept'), { ssr: false });
const ASMLTwinscanScanner = dynamic(() => import('./ASMLTwinscanScanner'), { ssr: false });
const WavelengthVsResolution = dynamic(() => import('./WavelengthVsResolution'), { ssr: false });
const LightSourceEvolution = dynamic(() => import('./LightSourceEvolution'), { ssr: false });
const DuvVsEuvOptics = dynamic(() => import('./DuvVsEuvOptics'), { ssr: false });
const EuvSourceMechanism = dynamic(() => import('./EuvSourceMechanism'), { ssr: false });
const ImmersionStructure = dynamic(() => import('./ImmersionStructure'), { ssr: false });
const DuvMaskStructure = dynamic(() => import('./DuvMaskStructure'), { ssr: false });
const PSMInterference = dynamic(() => import('./PSMInterference'), { ssr: false });
const MaskSetCostTrend = dynamic(() => import('./MaskSetCostTrend'), { ssr: false });
const EuvReflectiveMask = dynamic(() => import('./EuvReflectiveMask'), { ssr: false });
const PelliclePrinciple = dynamic(() => import('./PelliclePrinciple'), { ssr: false });
const PositiveVsNegativeResist = dynamic(() => import('./PositiveVsNegativeResist'), { ssr: false });
const PEBTempVsCD = dynamic(() => import('./PEBTempVsCD'), { ssr: false });
const SpinCoating3Step = dynamic(() => import('./SpinCoating3Step'), { ssr: false });
const PRProfileDefects = dynamic(() => import('./PRProfileDefects'), { ssr: false });
const RLSTrilemma = dynamic(() => import('./RLSTrilemma'), { ssr: false });
const CARMechanism = dynamic(() => import('./CARMechanism'), { ssr: false });
const DOFConceptDiagram = dynamic(() => import('./DOFConceptDiagram'), { ssr: false });
const NAResolutionDOFTradeoff = dynamic(() => import('./NAResolutionDOFTradeoff'), { ssr: false });
const ProcessWindowDoseFocus = dynamic(() => import('./ProcessWindowDoseFocus'), { ssr: false });
const BossungCurve = dynamic(() => import('./BossungCurve'), { ssr: false });
const OPCBeforeAfter = dynamic(() => import('./OPCBeforeAfter'), { ssr: false });
const OPCFlowLoop = dynamic(() => import('./OPCFlowLoop'), { ssr: false });
const IlluminationShapesOAI = dynamic(() => import('./IlluminationShapesOAI'), { ssr: false });
const OPCCorrectionTypes = dynamic(() => import('./OPCCorrectionTypes'), { ssr: false });
const OverlayConcept = dynamic(() => import('./OverlayConcept'), { ssr: false });
const OverlayOpenShort = dynamic(() => import('./OverlayOpenShort'), { ssr: false });
const OverlayBudget = dynamic(() => import('./OverlayBudget'), { ssr: false });
const MarkAsymmetry = dynamic(() => import('./MarkAsymmetry'), { ssr: false });
const WaferDistortionPatterns = dynamic(() => import('./WaferDistortionPatterns'), { ssr: false });
const BoxInBoxMicroscope = dynamic(() => import('./BoxInBoxMicroscope'), { ssr: false });
const DiffractionPrinciple = dynamic(() => import('./DiffractionPrinciple'), { ssr: false });
const DBOGratingCrossSection = dynamic(() => import('./DBOGratingCrossSection'), { ssr: false });
const DBOMeasurementPrinciple = dynamic(() => import('./DBOMeasurementPrinciple'), { ssr: false });
const SamplingMapComparison = dynamic(() => import('./SamplingMapComparison'), { ssr: false });
const Linear6parVectorMap = dynamic(() => import('./Linear6parVectorMap'), { ssr: false });
const ModelResidualComparison = dynamic(() => import('./ModelResidualComparison'), { ssr: false });
const CorrectablesResidualsFlow = dynamic(() => import('./CorrectablesResidualsFlow'), { ssr: false });
const APCControlLoop = dynamic(() => import('./APCControlLoop'), { ssr: false });
const CDUHierarchy = dynamic(() => import('./CDUHierarchy'), { ssr: false });
const GlobalCDUWaferHeatmap = dynamic(() => import('./GlobalCDUWaferHeatmap'), { ssr: false });
const LERLWRSemImage = dynamic(() => import('./LERLWRSemImage'), { ssr: false });
const MEEFvsK1 = dynamic(() => import('./MEEFvsK1'), { ssr: false });
const CDApcLoop = dynamic(() => import('./CDApcLoop'), { ssr: false });
const CDSEMPrinciple = dynamic(() => import('./CDSEMPrinciple'), { ssr: false });
const CDSEMEdgeProfile = dynamic(() => import('./CDSEMEdgeProfile'), { ssr: false });
const OCDPrinciple = dynamic(() => import('./OCDPrinciple'), { ssr: false });
const OCDSpectrumMatching = dynamic(() => import('./OCDSpectrumMatching'), { ssr: false });
const CDSAXSConcept = dynamic(() => import('./CDSAXSConcept'), { ssr: false });
const LELEProcessFlow = dynamic(() => import('./LELEProcessFlow'), { ssr: false });
const SADPProcessFlow = dynamic(() => import('./SADPProcessFlow'), { ssr: false });
const LELEOverlayPitchVariation = dynamic(() => import('./LELEOverlayPitchVariation'), { ssr: false });
const SADP4StepCrossSection = dynamic(() => import('./SADP4StepCrossSection'), { ssr: false });
const ArFSAQPvsEUVComparison = dynamic(() => import('./ArFSAQPvsEUVComparison'), { ssr: false });
const YieldStructureFlow = dynamic(() => import('./YieldStructureFlow'), { ssr: false });
const YieldRampupStages = dynamic(() => import('./YieldRampupStages'), { ssr: false });
const YieldVsD0AThreeModels = dynamic(() => import('./YieldVsD0AThreeModels'), { ssr: false });
const YieldRampupSCurve = dynamic(() => import('./YieldRampupSCurve'), { ssr: false });
const WaferMapPatternTypes = dynamic(() => import('./WaferMapPatternTypes'), { ssr: false });
const InspectionCheckpoints = dynamic(() => import('./InspectionCheckpoints'), { ssr: false });
const ADCPipeline = dynamic(() => import('./ADCPipeline'), { ssr: false });
const BFvsDFInspection = dynamic(() => import('./BFvsDFInspection'), { ssr: false });
const ControlVsSpecLimits = dynamic(() => import('./ControlVsSpecLimits'), { ssr: false });
const WECORulesPatterns = dynamic(() => import('./WECORulesPatterns'), { ssr: false });
const CpVsCpkVisualization = dynamic(() => import('./CpVsCpkVisualization'), { ssr: false });
const MultivariateT2Chart = dynamic(() => import('./MultivariateT2Chart'), { ssr: false });
const PCABasedFDC = dynamic(() => import('./PCABasedFDC'), { ssr: false });
const NormalVsAbnormalTrace = dynamic(() => import('./NormalVsAbnormalTrace'), { ssr: false });
const AutoencoderReconstructionError = dynamic(() => import('./AutoencoderReconstructionError'), { ssr: false });
const EquipmentHealthDashboard = dynamic(() => import('./EquipmentHealthDashboard'), { ssr: false });
const APCControlHierarchy = dynamic(() => import('./APCControlHierarchy'), { ssr: false });
const EWMAControlLoop = dynamic(() => import('./EWMAControlLoop'), { ssr: false });
const FFBCombinedCorrection = dynamic(() => import('./FFBCombinedCorrection'), { ssr: false });
const APCCDBeforeAfter = dynamic(() => import('./APCCDBeforeAfter'), { ssr: false });
const CrossLayerAPC = dynamic(() => import('./CrossLayerAPC'), { ssr: false });
const EuvScannerInstallation = dynamic(() => import('./EuvScannerInstallation'), { ssr: false });
const StochasticDefectsDilemma = dynamic(() => import('./StochasticDefectsDilemma'), { ssr: false });
const AnamorphicReduction = dynamic(() => import('./AnamorphicReduction'), { ssr: false });
const VMPredictedVsActual = dynamic(() => import('./VMPredictedVsActual'), { ssr: false });
const RIDistributionThreshold = dynamic(() => import('./RIDistributionThreshold'), { ssr: false });
const VMModelDegradation = dynamic(() => import('./VMModelDegradation'), { ssr: false });
const VMInputOutputFlow = dynamic(() => import('./VMInputOutputFlow'), { ssr: false });
const RIHybridStrategy = dynamic(() => import('./RIHybridStrategy'), { ssr: false });
const CNNWaferMapPipeline = dynamic(() => import('./CNNWaferMapPipeline'), { ssr: false });
const WaferMapAnalysisPipeline = dynamic(() => import('./WaferMapAnalysisPipeline'), { ssr: false });
const WaferMap8Patterns = dynamic(() => import('./WaferMap8Patterns'), { ssr: false });
const MixedPatternDecomposition = dynamic(() => import('./MixedPatternDecomposition'), { ssr: false });
const FabDataVolumeBySource = dynamic(() => import('./FabDataVolumeBySource'), { ssr: false });
const DataMatchingJoin = dynamic(() => import('./DataMatchingJoin'), { ssr: false });
const DataCollectionArch = dynamic(() => import('./DataCollectionArch'), { ssr: false });
const ModernDataArch = dynamic(() => import('./ModernDataArch'), { ssr: false });
const VarianceDecompositionPie = dynamic(() => import('./VarianceDecompositionPie'), { ssr: false });
const KrigingSpatialInterpolation = dynamic(() => import('./KrigingSpatialInterpolation'), { ssr: false });
const ParetoFrontCdOvl = dynamic(() => import('./ParetoFrontCdOvl'), { ssr: false });
const AsymmetricLossFunction = dynamic(() => import('./AsymmetricLossFunction'), { ssr: false });
const ProblemTypeGuide = dynamic(() => import('./ProblemTypeGuide'), { ssr: false });
const RandomVsTimeSplitR2 = dynamic(() => import('./RandomVsTimeSplitR2'), { ssr: false });
const SlidingWindowVisualization = dynamic(() => import('./SlidingWindowVisualization'), { ssr: false });
const TimeBasedSplit = dynamic(() => import('./TimeBasedSplit'), { ssr: false });
const SemiMLPipeline = dynamic(() => import('./SemiMLPipeline'), { ssr: false });
const TraceSettlingOvershoot = dynamic(() => import('./TraceSettlingOvershoot'), { ssr: false });
const CrossLayerR2Comparison = dynamic(() => import('./CrossLayerR2Comparison'), { ssr: false });
const FeatureImportanceTop20 = dynamic(() => import('./FeatureImportanceTop20'), { ssr: false });
const ShapWaterfallCd = dynamic(() => import('./ShapWaterfallCd'), { ssr: false });
const PhysicsInformedHybridModel = dynamic(() => import('./PhysicsInformedHybridModel'), { ssr: false });
const TrustBuildingRoadmap = dynamic(() => import('./TrustBuildingRoadmap'), { ssr: false });
const ShapBeeswarmCd = dynamic(() => import('./ShapBeeswarmCd'), { ssr: false });
const DataDriftPsiTrend = dynamic(() => import('./DataDriftPsiTrend'), { ssr: false });
const ModelRegistryTimeline = dynamic(() => import('./ModelRegistryTimeline'), { ssr: false });
const MLDeployArch = dynamic(() => import('./MLDeployArch'), { ssr: false });
const MonitoringDashboard = dynamic(() => import('./MonitoringDashboard'), { ssr: false });
const ResNet18SemArchitecture = dynamic(() => import('./ResNet18SemArchitecture'), { ssr: false });
const CnnAdcPipeline = dynamic(() => import('./CnnAdcPipeline'), { ssr: false });
const DlVsXgboostPerformance = dynamic(() => import('./DlVsXgboostPerformance'), { ssr: false });
const DomainGapVsTransferPerformance = dynamic(() => import('./DomainGapVsTransferPerformance'), { ssr: false });
const MultiTaskProductHead = dynamic(() => import('./MultiTaskProductHead'), { ssr: false });
const FederatedLearningArchitecture = dynamic(() => import('./FederatedLearningArchitecture'), { ssr: false });
const FewShotDataVsPerformance = dynamic(() => import('./FewShotDataVsPerformance'), { ssr: false });
const BayesianOptimizationLoop = dynamic(() => import('./BayesianOptimizationLoop'), { ssr: false });
const GpSurrogateAcquisition = dynamic(() => import('./GpSurrogateAcquisition'), { ssr: false });
const ParetoFrontCdOvlOptimization = dynamic(() => import('./ParetoFrontCdOvlOptimization'), { ssr: false });
const SafeExplorationStages = dynamic(() => import('./SafeExplorationStages'), { ssr: false });
const RagPipelineQna = dynamic(() => import('./RagPipelineQna'), { ssr: false });
const ToolUsingAgentArchitecture = dynamic(() => import('./ToolUsingAgentArchitecture'), { ssr: false });
const OnpremiseVsCloudLlm = dynamic(() => import('./OnpremiseVsCloudLlm'), { ssr: false });

/**
 * Registry mapping image paths (as they appear in markdown) to React components.
 * When MarkdownViewer encounters an <img> with a matching src, it replaces
 * the static image with the corresponding interactive React component.
 *
 * To add a new diagram:
 * 1. Create a component in src/components/diagrams/
 * 2. Add the mapping here: '/content/images/XX_XX/filename.svg': YourComponent
 */
export const diagramRegistry: Record<string, ComponentType> = {
    '/content/images/01_01/mosfet_cross_section.svg': MOSFETCrossSection,
    '/content/images/01_01/transistor_growth.png': TransistorGrowth,
    '/content/images/01_01/chip_process_flow.svg': ChipProcessFlow,
    '/content/images/01_02/silicon_purity_comparison.png': SiliconPurity,
    '/content/images/01_02/ingot_to_wafer_process.svg': IngotToWafer,
    '/content/images/01_02/crystal_orientation.svg': CrystalOrientation,
    '/content/images/01_03/frontend_process_flow.svg': FrontEndProcessFlow,
    '/content/images/01_03/chip_cross_section_feol_beol.svg': ChipCrossSection,
    '/content/images/01_03/process_data_volume.png': ProcessDataVolume,
    '/content/images/01_04/thermal_oxidation_furnace.svg': ThermalOxidationFurnace,
    '/content/images/01_04/deal_grove_oxidation.png': DealGroveOxidation,
    '/content/images/01_04/ald_vs_cvd_conformality.svg': ALDvsCVDConformality,
    '/content/images/01_05/wet_vs_dry_etch_profile.svg': WetVsDryEtchProfile,
    '/content/images/01_05/rie_chamber_cross_section.svg': RIEChamber,
    '/content/images/01_05/etch_profile_defects.svg': EtchProfileDefects,
    '/content/images/01_05/oes_endpoint_detection.png': OESEndpointDetection,
    '/content/images/01_06/doping_profile_energy.png': DopingProfileEnergy,
    '/content/images/01_06/channeling_effect.svg': ChannelingEffect,
    '/content/images/01_06/anneal_lattice_recovery.svg': AnnealLatticeRecovery,
    '/content/images/01_07/cmp_necessity.svg': CMPNecessity,
    '/content/images/01_07/dishing_erosion.svg': DishingErosion,
    '/content/images/01_07/beol_metal_layers.svg': BEOLMetalLayers,
    '/content/images/01_07/damascene_process_steps.svg': DamasceneProcessSteps,
    '/content/images/01_07/rc_delay_vs_gate_delay.png': RCDelayVsGateDelay,
    '/content/images/01_08/wire_bond_vs_flipchip.svg': WireBondVsFlipchip,
    '/content/images/01_08/binning_distribution.png': BinningDistribution,
    '/content/images/01_08/2_5d_3d_packaging.svg': Packaging2_5D3D,
    '/content/images/01_08/wafer_map_patterns.png': WaferMapPatterns,
    '/content/images/01_09/moores_law_graph.png': MooresLawGraph,
    '/content/images/01_09/transistor_density_by_node.png': TransistorDensityByNode,
    '/content/images/01_09/clock_frequency_stagnation.png': ClockFrequencyStagnation,
    '/content/images/01_09/planar_finfet_gaa_comparison.svg': PlanarFinFETGAA,
    '/content/images/01_10/foundry_market_share.png': FoundryMarketShare,
    '/content/images/01_10/fab_construction_cost.png': FabConstructionCost,
    '/content/images/01_10/asml_euv_scanner.png': ASMLEuvScanner,
    '/content/images/01_10/semi_industry_structure.svg': SemiIndustryStructure,
    '/content/images/01_10/semi_value_chain.svg': SemiValueChain,
    '/content/images/02_01/photo_printing_vs_lithography.png': PhotoPrintingVsLitho,
    '/content/images/02_01/track_scanner_inline_system.png': TrackScannerSystem,
    '/content/images/02_01/spin_coating_cross_section.svg': SpinCoatingCrossSection,
    '/content/images/02_01/reduction_projection_optics.svg': ReductionProjectionOptics,
    '/content/images/02_01/litho_process_flow.svg': LithoProcessFlow,
    '/content/images/02_01/part2_roadmap.svg': Part2Roadmap,
    '/content/images/02_02/stepper_operation.svg': StepperOperation,
    '/content/images/02_02/scanner_slit_scanning.svg': ScannerSlitScanning,
    '/content/images/02_02/illumination_shapes.svg': IlluminationShapes,
    '/content/images/02_02/dual_stage_concept.png': DualStageConcept,
    '/content/images/02_02/asml_twinscan_scanner.png': ASMLTwinscanScanner,
    /* Chapter 2.3 */
    '/content/images/02_03/wavelength_vs_resolution.png': WavelengthVsResolution,
    '/content/images/02_03/light_source_evolution.svg': LightSourceEvolution,
    '/content/images/02_03/duv_vs_euv_optics.png': DuvVsEuvOptics,
    '/content/images/02_03/euv_source_mechanism.svg': EuvSourceMechanism,
    '/content/images/02_03/immersion_structure.svg': ImmersionStructure,
    /* Chapter 2.4 */
    '/content/images/02_04/duv_mask_structure.svg': DuvMaskStructure,
    '/content/images/02_04/phase_shift_mask_interference.png': PSMInterference,
    '/content/images/02_04/mask_set_cost_trend.png': MaskSetCostTrend,
    '/content/images/02_04/euv_reflective_mask_cross_section.svg': EuvReflectiveMask,
    '/content/images/02_04/pellicle_principle.svg': PelliclePrinciple,
    /* Chapter 2.5 */
    '/content/images/02_05/positive_vs_negative_resist.svg': PositiveVsNegativeResist,
    '/content/images/02_05/peb_temp_vs_cd.png': PEBTempVsCD,
    '/content/images/02_05/spin_coating_3step.svg': SpinCoating3Step,
    '/content/images/02_05/pr_profile_defects.svg': PRProfileDefects,
    '/content/images/02_05/rls_trilemma.svg': RLSTrilemma,
    '/content/images/02_05/car_mechanism.svg': CARMechanism,

    /* Chapter 2.6 */
    '/content/images/02_06/dof_concept_diagram.svg': DOFConceptDiagram,
    '/content/images/02_06/na_resolution_dof_tradeoff.png': NAResolutionDOFTradeoff,
    '/content/images/02_06/process_window_dose_focus.png': ProcessWindowDoseFocus,
    '/content/images/02_06/bossung_curve.png': BossungCurve,

    /* Chapter 2.7 */
    '/content/images/02_07/opc_before_after.png': OPCBeforeAfter,
    '/content/images/02_07/opc_flow_loop.svg': OPCFlowLoop,
    '/content/images/02_07/illumination_shapes_comparison.svg': IlluminationShapesOAI,
    '/content/images/02_07/opc_correction_types.svg': OPCCorrectionTypes,

    /* Chapter 2.8 */
    '/content/images/02_08/overlay_concept.svg': OverlayConcept,
    '/content/images/02_08/overlay_open_short_cross_section.svg': OverlayOpenShort,
    '/content/images/02_08/overlay_budget.svg': OverlayBudget,
    '/content/images/02_08/mark_asymmetry_distortion.svg': MarkAsymmetry,
    '/content/images/02_08/wafer_distortion_patterns.png': WaferDistortionPatterns,

    /* Chapter 2.9 */
    '/content/images/02_09/box_in_box_microscope.png': BoxInBoxMicroscope,
    '/content/images/02_09/diffraction_principle.svg': DiffractionPrinciple,
    '/content/images/02_09/dbo_grating_mark_cross_section.svg': DBOGratingCrossSection,
    '/content/images/02_09/dbo_measurement_principle.svg': DBOMeasurementPrinciple,
    '/content/images/02_09/sampling_map_comparison.png': SamplingMapComparison,

    /* Chapter 2.10 */
    '/content/images/02_10/linear_6par_vector_map.png': Linear6parVectorMap,
    '/content/images/02_10/model_residual_comparison.png': ModelResidualComparison,
    '/content/images/02_10/correctables_residuals_flow.svg': CorrectablesResidualsFlow,
    '/content/images/02_10/apc_control_loop.svg': APCControlLoop,

    /* Chapter 2.11 */
    '/content/images/02_11/cdu_hierarchy.svg': CDUHierarchy,
    '/content/images/02_11/global_cdu_wafer_heatmap.png': GlobalCDUWaferHeatmap,
    '/content/images/02_11/ler_lwr_sem_image.png': LERLWRSemImage,
    '/content/images/02_11/meef_vs_k1.png': MEEFvsK1,
    '/content/images/02_11/cd_apc_loop.svg': CDApcLoop,

    /* Chapter 2.12 */
    '/content/images/02_12/cd_sem_principle.svg': CDSEMPrinciple,
    '/content/images/02_12/cd_sem_edge_profile.png': CDSEMEdgeProfile,
    '/content/images/02_12/ocd_principle.svg': OCDPrinciple,
    '/content/images/02_12/ocd_spectrum_matching.png': OCDSpectrumMatching,
    '/content/images/02_12/cd_saxs_concept.png': CDSAXSConcept,

    /* Chapter 2.13 */
    '/content/images/02_13/lele_process_flow.svg': LELEProcessFlow,
    '/content/images/02_13/lele_overlay_pitch_variation.png': LELEOverlayPitchVariation,
    '/content/images/02_13/sadp_process_flow.svg': SADPProcessFlow,
    '/content/images/02_13/sadp_4step_cross_section.png': SADP4StepCrossSection,
    '/content/images/02_13/arf_saqp_vs_euv_sp_comparison.png': ArFSAQPvsEUVComparison,

    /* Chapter 2.14 */
    '/content/images/02_14/euv_scanner_installation_trend.png': EuvScannerInstallation,
    '/content/images/02_14/stochastic_defects_dilemma.svg': StochasticDefectsDilemma,
    '/content/images/02_14/anamorphic_4x_8x_reduction.png': AnamorphicReduction,

    /* Chapter 3.1 */
    '/content/images/03_01/yield_structure_flow.svg': YieldStructureFlow,
    '/content/images/03_01/yield_vs_d0a_three_models.png': YieldVsD0AThreeModels,
    '/content/images/03_01/yield_rampup_scurve.png': YieldRampupSCurve,
    '/content/images/03_01/yield_rampup_stages.svg': YieldRampupStages,
    '/content/images/03_01/wafer_map_pattern_types.png': WaferMapPatternTypes,

    /* Chapter 3.2 */
    '/content/images/03_02/inspection_checkpoints.svg': InspectionCheckpoints,
    '/content/images/03_02/bf_vs_df_inspection.svg': BFvsDFInspection,
    '/content/images/03_02/adc_pipeline.svg': ADCPipeline,

    /* Chapter 3.3 */
    '/content/images/03_03/control_vs_spec_limits.svg': ControlVsSpecLimits,
    '/content/images/03_03/weco_rules_patterns.svg': WECORulesPatterns,
    '/content/images/03_03/cp_vs_cpk_visualization.png': CpVsCpkVisualization,
    '/content/images/03_03/multivariate_spc_t2_chart.png': MultivariateT2Chart,

    /* Chapter 3.4 */
    '/content/images/03_04/pca_based_fdc.svg': PCABasedFDC,
    '/content/images/03_04/normal_vs_abnormal_trace.png': NormalVsAbnormalTrace,
    '/content/images/03_04/autoencoder_reconstruction_error.png': AutoencoderReconstructionError,
    '/content/images/03_04/equipment_health_dashboard.svg': EquipmentHealthDashboard,

    /* Chapter 3.5 */
    '/content/images/03_05/apc_control_hierarchy.svg': APCControlHierarchy,
    '/content/images/03_05/ewma_control_loop.svg': EWMAControlLoop,
    '/content/images/03_05/ff_fb_combined_correction.svg': FFBCombinedCorrection,
    '/content/images/03_05/apc_cd_before_after.png': APCCDBeforeAfter,
    '/content/images/03_05/cross_layer_apc.svg': CrossLayerAPC,

    /* Chapter 3.6 */
    '/content/images/03_06/vm_predicted_vs_actual.png': VMPredictedVsActual,
    '/content/images/03_06/ri_distribution_threshold.png': RIDistributionThreshold,
    '/content/images/03_06/vm_model_degradation.png': VMModelDegradation,
    '/content/images/03_06/vm_input_output_flow.svg': VMInputOutputFlow,
    '/content/images/03_06/ri_hybrid_strategy.svg': RIHybridStrategy,

    /* Chapter 3.7 */
    '/content/images/03_07/cnn_wafer_map_pipeline.svg': CNNWaferMapPipeline,
    '/content/images/03_07/wafer_map_analysis_pipeline.svg': WaferMapAnalysisPipeline,
    '/content/images/03_07/wafer_map_8_patterns.svg': WaferMap8Patterns,
    '/content/images/03_07/mixed_pattern_decomposition.svg': MixedPatternDecomposition,

    /* Chapter 3.8 */
    '/content/images/03_08/fab_data_volume_by_source.png': FabDataVolumeBySource,
    '/content/images/03_08/data_matching_join.svg': DataMatchingJoin,
    '/content/images/03_08/data_collection_arch.svg': DataCollectionArch,
    '/content/images/03_08/modern_data_architecture.svg': ModernDataArch,

    /* Chapter 3.9 */
    '/content/images/03_09/variance_decomposition_pie.svg': VarianceDecompositionPie,
    '/content/images/03_09/kriging_spatial_interpolation.svg': KrigingSpatialInterpolation,

    /* Chapter 4.1 */
    '/content/images/04_01/pareto_front_cd_ovl.png': ParetoFrontCdOvl,
    '/content/images/04_01/asymmetric_loss_function.png': AsymmetricLossFunction,
    '/content/images/04_01/problem_type_guide.svg': ProblemTypeGuide,

    /* Chapter 4.3 */
    '/content/images/04_03/random_vs_time_split_r2.png': RandomVsTimeSplitR2,
    '/content/images/04_03/sliding_window_visualization.svg': SlidingWindowVisualization,
    '/content/images/04_03/time_based_split.svg': TimeBasedSplit,
    '/content/images/04_03/semi_ml_pipeline.svg': SemiMLPipeline,

    /* Chapter 4.2 */
    '/content/images/04_02/trace_settling_overshoot.png': TraceSettlingOvershoot,
    '/content/images/04_02/cross_layer_r2_comparison.png': CrossLayerR2Comparison,
    '/content/images/04_02/feature_importance_top20.png': FeatureImportanceTop20,

    /* Chapter 4.4 */
    '/content/images/04_04/shap_waterfall_cd.png': ShapWaterfallCd,
    '/content/images/04_04/physics_informed_hybrid_model.svg': PhysicsInformedHybridModel,
    '/content/images/04_04/trust_building_roadmap.svg': TrustBuildingRoadmap,
    '/content/images/04_04/shap_beeswarm_cd.svg': ShapBeeswarmCd,

    /* Chapter 4.5 */
    '/content/images/04_05/data_drift_psi_trend.png': DataDriftPsiTrend,
    '/content/images/04_05/model_registry_timeline.svg': ModelRegistryTimeline,
    '/content/images/04_05/ml_deploy_arch.svg': MLDeployArch,
    '/content/images/04_05/monitoring_dashboard.svg': MonitoringDashboard,

    /* Chapter 4.6 */
    '/content/images/04_06/resnet18_sem_architecture.svg': ResNet18SemArchitecture,
    '/content/images/04_06/cnn_adc_pipeline.svg': CnnAdcPipeline,
    '/content/images/04_06/dl_vs_xgboost_performance.png': DlVsXgboostPerformance,

    /* Chapter 4.7 */
    '/content/images/04_07/domain_gap_vs_transfer_performance.png': DomainGapVsTransferPerformance,
    '/content/images/04_07/multi_task_product_head.svg': MultiTaskProductHead,
    '/content/images/04_07/federated_learning_architecture.svg': FederatedLearningArchitecture,
    '/content/images/04_07/few_shot_data_vs_performance.png': FewShotDataVsPerformance,

    /* Chapter 4.8 */
    '/content/images/04_08/bayesian_optimization_loop.svg': BayesianOptimizationLoop,
    '/content/images/04_08/gp_surrogate_acquisition.png': GpSurrogateAcquisition,
    '/content/images/04_08/pareto_front_cd_ovl_optimization.png': ParetoFrontCdOvlOptimization,
    '/content/images/04_08/safe_exploration_stages.svg': SafeExplorationStages,

    /* Chapter 4.9 */
    '/content/images/04_09/rag_pipeline_qna.svg': RagPipelineQna,
    '/content/images/04_09/tool_using_agent_architecture.svg': ToolUsingAgentArchitecture,
    '/content/images/04_09/onpremise_vs_cloud_llm.svg': OnpremiseVsCloudLlm,
};
