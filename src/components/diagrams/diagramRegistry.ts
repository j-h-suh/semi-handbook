import type { ComponentType } from 'react';
import { semiDiagramRegistry } from './semiRegistry';
import { statsDiagramRegistry } from './statsRegistry';
import { claudeDiagramRegistry } from './claudeRegistry';
import { agentSdkDiagramRegistry } from './agentSdkRegistry';
import { memoryDiagramRegistry } from './memoryRegistry';
import { llmDiagramRegistry } from './llmRegistry';

/**
 * Registry mapping image paths (as they appear in markdown) to React components.
 * When MarkdownViewer encounters an <img> with a matching src, it replaces
 * the static image with the corresponding interactive React component.
 *
 * Semi diagrams: ./semiRegistry.ts
 * Stats diagrams: ./statsRegistry.ts
 * Claude diagrams: ./claudeRegistry.ts
 * Agent SDK diagrams: ./agentSdkRegistry.ts
 * Memory diagrams: ./memoryRegistry.ts
 */
export const diagramRegistry: Record<string, ComponentType> = {
    ...semiDiagramRegistry,
    ...statsDiagramRegistry,
    ...claudeDiagramRegistry,
    ...agentSdkDiagramRegistry,
    ...memoryDiagramRegistry,
    ...llmDiagramRegistry,
};
