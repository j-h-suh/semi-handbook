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
};
