import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// 클로드 핸드북 다이어그램 — claude_code 본문의 ASCII 자리를 React 컴포넌트로 점진 전환.
// img src 와 _완전 일치_ 한 key 로 매핑 (MarkdownViewer 의 diagramRegistry 매칭).

const MiniClaudeArchitecture = dynamic(() => import('./MiniClaudeArchitecture'), { ssr: false });
const TwoLayerAgentLoop = dynamic(() => import('./TwoLayerAgentLoop'), { ssr: false });

export const claudeDiagramRegistry: Record<string, ComponentType> = {
    '/content/claude_code/images/09_1/architecture.svg': MiniClaudeArchitecture,
    '/content/claude_code/images/02_1/two_layer_loop.svg': TwoLayerAgentLoop,
};
