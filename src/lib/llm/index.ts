import { streamText as streamAnthropic } from './anthropic';
import { streamText as streamGemini } from './gemini';
import type { StreamTextArgs, StreamTextResult } from './types';

export type { ChatMessage, StreamTextArgs, StreamTextResult } from './types';

// 모델 ID prefix 결로 provider 분기
//   claude-*  → AnthropicVertex
//   gemini-*  → GoogleGenAI (Vertex 모드)
export async function streamText(args: StreamTextArgs): Promise<StreamTextResult> {
    if (args.model.startsWith('claude-')) {
        return streamAnthropic(args);
    }
    if (args.model.startsWith('gemini-')) {
        return streamGemini(args);
    }
    throw new Error(`지원하지 않는 모델 ID: ${args.model}`);
}

// UI 결로 노출하는 모델 목록 — SettingsModal 에서 import
export interface ModelOption {
    id: string;
    label: string;
    provider: 'anthropic' | 'google';
    description: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
    {
        id: 'claude-opus-4-7',
        label: 'Claude Opus 4.7',
        provider: 'anthropic',
        description: 'Anthropic 최상위 — 깊은 추론, 긴 본문 이해',
    },
    {
        id: 'gemini-3.5-flash',
        label: 'Gemini 3.5 Flash',
        provider: 'google',
        description: 'Google Vertex — 빠른 응답, 다국어 강세',
    },
];

export const DEFAULT_MODEL_ID = 'gemini-3.5-flash';
