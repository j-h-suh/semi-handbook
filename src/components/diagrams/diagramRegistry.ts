import type { ComponentType } from 'react';
import { semiDiagramRegistry } from './semiRegistry';
import { statsDiagramRegistry } from './statsRegistry';

/**
 * Registry mapping image paths (as they appear in markdown) to React components.
 * When MarkdownViewer encounters an <img> with a matching src, it replaces
 * the static image with the corresponding interactive React component.
 *
 * Semi diagrams: ./semiRegistry.ts
 * Stats diagrams: ./statsRegistry.ts
 */
export const diagramRegistry: Record<string, ComponentType> = {
    ...semiDiagramRegistry,
    ...statsDiagramRegistry,
};
