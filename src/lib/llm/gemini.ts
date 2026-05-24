import { GoogleGenAI } from '@google/genai';
import type { StreamTextArgs, StreamTextResult, ChatMessage } from './types';

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
    if (_client) return _client;
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.CLOUD_ML_REGION ?? 'global';
    if (!project) {
        throw new Error('GOOGLE_CLOUD_PROJECT 환경변수가 비어 있습니다.');
    }
    _client = new GoogleGenAI({ vertexai: true, project, location });
    return _client;
}

export async function streamText({
    system,
    messages,
    model,
    maxTokens,
    signal,
}: StreamTextArgs): Promise<StreamTextResult> {
    const client = getClient();

    // Anthropic user/assistant role 을 Gemini user/model 결로 매핑
    const contents = messages.map((m: ChatMessage) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
    }));
    if (contents.length === 0 || contents[0].role !== 'user') {
        throw new Error('Gemini: contents 의 첫 메시지는 반드시 user 여야 합니다.');
    }

    const streamPromise = client.models.generateContentStream({
        model,
        contents,
        config: {
            systemInstruction: system,
            maxOutputTokens: maxTokens,
            abortSignal: signal,
        },
    });

    // finalize 용으로 마지막 chunk(usageMetadata 포함) 를 보관
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastChunk: any = null;

    async function* textIterator(): AsyncGenerator<string> {
        const stream = await streamPromise;
        for await (const chunk of stream) {
            lastChunk = chunk;
            const text = chunk.text;
            if (text) yield text;
        }
    }

    async function finalize() {
        const u = lastChunk?.usageMetadata ?? {};
        return {
            usage: {
                input_tokens: u.promptTokenCount ?? null,
                output_tokens: u.candidatesTokenCount ?? null,
            },
            model: lastChunk?.modelVersion ?? model,
        };
    }

    return { textIterator: textIterator(), finalize };
}
