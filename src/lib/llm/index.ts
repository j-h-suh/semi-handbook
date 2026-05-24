// Server-only entry — Anthropic Vertex SDK / GoogleGenAI 등 server SDK 의존.
// 'use client' 자리에서 import 하면 SSR 번들에 끌려와 실패하니, client 자리는
// '@/lib/llm/models' 자리만 사용.

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
