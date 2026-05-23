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
const HookLifecycle = dynamic(() => import('./HookLifecycle'), { ssr: false });
const APIClientAdapter = dynamic(() => import('./APIClientAdapter'), { ssr: false });
const QueueLoopModel = dynamic(() => import('./QueueLoopModel'), { ssr: false });
const CacheLayerBoundary = dynamic(() => import('./CacheLayerBoundary'), { ssr: false });
const AppStateCategories = dynamic(() => import('./AppStateCategories'), { ssr: false });
const VirtualScrollViewport = dynamic(() => import('./VirtualScrollViewport'), { ssr: false });
const TeamMailboxFlow = dynamic(() => import('./TeamMailboxFlow'), { ssr: false });
const EventLoopAlgorithm = dynamic(() => import('./EventLoopAlgorithm'), { ssr: false });
const PermissionModeCycle = dynamic(() => import('./PermissionModeCycle'), { ssr: false });
const TurnTokenFlow = dynamic(() => import('./TurnTokenFlow'), { ssr: false });
const RecoveryPaths = dynamic(() => import('./RecoveryPaths'), { ssr: false });
const QueryCallStack = dynamic(() => import('./QueryCallStack'), { ssr: false });
const TurnApiSequence = dynamic(() => import('./TurnApiSequence'), { ssr: false });
const AutoCompactFlow = dynamic(() => import('./AutoCompactFlow'), { ssr: false });
const FileReadFlow = dynamic(() => import('./FileReadFlow'), { ssr: false });
const BashCommandSplit = dynamic(() => import('./BashCommandSplit'), { ssr: false });
const ChatInputFlow = dynamic(() => import('./ChatInputFlow'), { ssr: false });
const SlashCommandFlow = dynamic(() => import('./SlashCommandFlow'), { ssr: false });

export const claudeDiagramRegistry: Record<string, ComponentType> = {
    '/content/claude_code/images/09_1/architecture.svg': MiniClaudeArchitecture,
    '/content/claude_code/images/02_1/two_layer_loop.svg': TwoLayerAgentLoop,
    '/content/claude_code/images/00_1/agent_loop_branch.svg': AgentLoopBranch,
    '/content/claude_code/images/03_1/tool_as_microservice.svg': ToolAsMicroservice,
    '/content/claude_code/images/03_2/tool_47_fields.svg': ToolInterface47Fields,
    '/content/claude_code/images/10_1/part10_architecture.svg': Part10Architecture,
    '/content/claude_code/images/00_1/claude_code_architecture.svg': ClaudeCodeArchitecture,
    '/content/claude_code/images/05_2/selector_pattern.svg': AppStateSelectorPattern,
    '/content/claude_code/images/10_3/hook_lifecycle.svg': HookLifecycle,
    '/content/claude_code/images/10_5/client_adapter.svg': APIClientAdapter,
    '/content/claude_code/images/08_4/queue_loop_model.svg': QueueLoopModel,
    '/content/claude_code/images/06_1/cache_layer_boundary.svg': CacheLayerBoundary,
    '/content/claude_code/images/06_2/appstate_categories.svg': AppStateCategories,
    '/content/claude_code/images/05_3/virtual_scroll_viewport.svg': VirtualScrollViewport,
    '/content/claude_code/images/08_4/mailbox_flow.svg': TeamMailboxFlow,
    '/content/claude_code/images/00_2/event_loop_algorithm.svg': EventLoopAlgorithm,
    '/content/claude_code/images/06_3/permission_mode_cycle.svg': PermissionModeCycle,
    '/content/claude_code/images/02_1/turn_token_flow.svg': TurnTokenFlow,
    '/content/claude_code/images/02_1/recovery_paths.svg': RecoveryPaths,
    '/content/claude_code/images/02_1/query_call_stack.svg': QueryCallStack,
    '/content/claude_code/images/02_1/turn_api_sequence.svg': TurnApiSequence,
    '/content/claude_code/images/02_3/autocompact_flow.svg': AutoCompactFlow,
    '/content/claude_code/images/03_4/fileread_flow.svg': FileReadFlow,
    '/content/claude_code/images/03_5/bash_command_split.svg': BashCommandSplit,
    '/content/claude_code/images/04_1/chat_input_flow.svg': ChatInputFlow,
    '/content/claude_code/images/04_1/slash_command_flow.svg': SlashCommandFlow,
};
