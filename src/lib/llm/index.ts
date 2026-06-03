// Server-only entry — Anthropic Bedrock SDK / GoogleGenAI 등 server SDK 의존.
// 'use client' 자리에서 import 하면 SSR 번들에 끌려와 실패하니, client 자리는
// '@/lib/llm/models' 만 사용.

import { streamText as streamAnthropic } from './anthropic';
import { streamText as streamGemini } from './gemini';
import type { StreamTextArgs, StreamTextResult } from './types';

export type { ChatMessage, StreamTextArgs, StreamTextResult } from './types';

// UI 모델 키 → { provider, 실제 모델 ID 를 담은 환경변수 이름 }.
//   Claude(Bedrock) 는 inference-profile ID, Gemini(Vertex) 는 Vertex 모델 ID 를
//   각 환경변수에서 지연 로딩한다. UI 키와 실제 ID 가 다르고(특히 Bedrock 은
//   global.anthropic.claude-... 형식이라 claude- prefix 분기와도 충돌), 배포 환경별로
//   ID 가 달라질 수 있어 코드에 박지 않고 .env 로 뺀다.
const MODEL_ENV: Record<string, { provider: 'anthropic' | 'gemini'; envKey: string }> = {
    'claude-opus-4-8': { provider: 'anthropic', envKey: 'OPUS_MODEL' },
    'claude-haiku-4-5': { provider: 'anthropic', envKey: 'HAIKU_MODEL' },
    'gemini-3.5-flash': { provider: 'gemini', envKey: 'GEMINI_MODEL' },
};

function resolveModel(key: string): { provider: 'anthropic' | 'gemini'; model: string } {
    const entry = MODEL_ENV[key];
    if (!entry) {
        throw new Error(`지원하지 않는 모델 ID: ${key}`);
    }
    const fromEnv = process.env[entry.envKey];
    if (fromEnv) {
        return { provider: entry.provider, model: fromEnv };
    }
    // Gemini(Vertex)는 UI 키가 곧 Vertex 모델명이라 env 미설정 시 키를 그대로 사용
    // (기존 동작 유지). Claude(Bedrock)는 inference-profile ID 가 필수라 env 가 없으면
    // 친절한 에러로 안내한다.
    if (entry.provider === 'gemini') {
        return { provider: entry.provider, model: key };
    }
    throw new Error(
        `${entry.envKey} 환경변수가 비어 있습니다. .env 에 ${key} 모델 ID를 채워주세요.`,
    );
}

// 모델 키로 provider 를 고르고, 실제 모델 ID 로 치환해 어댑터에 위임.
//   claude-*  → AnthropicBedrock
//   gemini-*  → GoogleGenAI (Vertex 모드)
export async function streamText(args: StreamTextArgs): Promise<StreamTextResult> {
    const { provider, model } = resolveModel(args.model);
    if (provider === 'anthropic') {
        return streamAnthropic({ ...args, model });
    }
    return streamGemini({ ...args, model });
}
