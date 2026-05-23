import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// 클로드 핸드북 다이어그램 — claude_code 본문의 ASCII 자리를 React 컴포넌트로 점진 전환.
// img src 와 _완전 일치_ 한 key 로 매핑 (MarkdownViewer 의 diagramRegistry 매칭).

const MiniClaudeArchitecture = dynamic(() => import('./MiniClaudeArchitecture'), { ssr: false });
const TwoLayerAgentLoop = dynamic(() => import('./TwoLayerAgentLoop'), { ssr: false });
const AgentLoopBranch = dynamic(() => import('./AgentLoopBranch'), { ssr: false });
const ToolAsMicroservice = dynamic(() => import('./ToolAsMicroservice'), { ssr: false });
const ToolInterface47Fields = dynamic(() => import('./ToolInterface47Fields'), { ssr: false });
const Part10Architecture = dynamic(() => import('./Part10Architecture'), { ssr: false });
const ClaudeCodeArchitecture = dynamic(() => import('./ClaudeCodeArchitecture'), { ssr: false });
const AppStateSelectorPattern = dynamic(() => import('./AppStateSelectorPattern'), { ssr: false });

export const claudeDiagramRegistry: Record<string, ComponentType> = {
    '/content/claude_code/images/09_1/architecture.svg': MiniClaudeArchitecture,
    '/content/claude_code/images/02_1/two_layer_loop.svg': TwoLayerAgentLoop,
    '/content/claude_code/images/00_1/agent_loop_branch.svg': AgentLoopBranch,
    '/content/claude_code/images/03_1/tool_as_microservice.svg': ToolAsMicroservice,
    '/content/claude_code/images/03_2/tool_47_fields.svg': ToolInterface47Fields,
    '/content/claude_code/images/10_1/part10_architecture.svg': Part10Architecture,
    '/content/claude_code/images/00_1/claude_code_architecture.svg': ClaudeCodeArchitecture,
    '/content/claude_code/images/05_2/selector_pattern.svg': AppStateSelectorPattern,
};
