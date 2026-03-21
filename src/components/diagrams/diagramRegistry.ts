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
};
