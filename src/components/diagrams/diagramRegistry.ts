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
};
