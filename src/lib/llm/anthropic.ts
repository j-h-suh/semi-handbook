import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';
import type { StreamTextArgs, StreamTextResult } from './types';

let _client: AnthropicVertex | null = null;

// @anthropic-ai/vertex-sdk@0.11.x 는 region 값을 그대로 host prefix 결로 사용해
// region='global' 일 때 https://global-aiplatform.googleapis.com 결로 합성. 그러나
// Vertex 의 실제 global endpoint 는 prefix 없는 aiplatform.googleapis.com. SDK 가
// 고쳐질 때까지 baseURL 을 명시적으로 override.
function resolveBaseURL(region: string): string | undefined {
    if (region === 'global') return 'https://aiplatform.googleapis.com/v1';
    return undefined;
}

function getClient(): AnthropicVertex {
    if (_client) return _client;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const region = process.env.CLOUD_ML_REGION ?? 'global';
    if (!projectId) {
        throw new Error('GOOGLE_CLOUD_PROJECT 환경변수가 비어 있습니다.');
    }
    const baseURL = resolveBaseURL(region);
    _client = new AnthropicVertex({ projectId, region, ...(baseURL ? { baseURL } : {}) });
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

    const stream = client.messages.stream({
        model,
        max_tokens: maxTokens,
        system,
        messages,
    });

    // SDK 내부 _createMessage 가 reject 하는 promise(abort 시 APIUserAbortError 등) 를
    // 미리 attach. 그렇지 않으면 for-await 가 먼저 throw 해 finalize 가 호출되지 않을 때
    // promise 가 floating 상태로 남아 unhandledRejection 으로 server 가 죽음.
    const finalPromise = stream.finalMessage().catch((err: Error) => {
        if (signal?.aborted || err?.name === 'AbortError' || err?.name === 'APIUserAbortError') {
            return null;
        }
        throw err;
    });

    if (signal) {
        signal.addEventListener(
            'abort',
            () => {
                try {
                    stream.abort();
                } catch {
                    // 이미 종료된 stream — 무시
                }
            },
            { once: true },
        );
    }

    // Anthropic SDK MessageStream 은 EventEmitter — 'text'/'end'/'error' 를 큐 기반
    // async iterator 결로 변환
    async function* textIterator(): AsyncGenerator<string> {
        const queue: string[] = [];
        let resolveWait: (() => void) | null = null;
        let ended = false;
        let error: Error | null = null;

        const onText = (text: string) => {
            if (!text) return;
            queue.push(text);
            if (resolveWait) {
                const r = resolveWait;
                resolveWait = null;
                r();
            }
        };
        const onError = (err: Error) => {
            error = err;
            ended = true;
            if (resolveWait) {
                const r = resolveWait;
                resolveWait = null;
                r();
            }
        };
        const onEnd = () => {
            ended = true;
            if (resolveWait) {
                const r = resolveWait;
                resolveWait = null;
                r();
            }
        };

        stream.on('text', onText);
        stream.on('error', onError);
        stream.on('end', onEnd);

        try {
            while (true) {
                if (error) throw error;
                if (queue.length > 0) {
                    yield queue.shift()!;
                } else if (ended) {
                    return;
                } else {
                    await new Promise<void>((r) => {
                        resolveWait = r;
                    });
                }
            }
        } finally {
            stream.off('text', onText);
            stream.off('error', onError);
            stream.off('end', onEnd);
        }
    }

    async function finalize() {
        const final = await finalPromise;
        if (!final) return null;
        return {
            usage: {
                input_tokens: final.usage?.input_tokens ?? null,
                output_tokens: final.usage?.output_tokens ?? null,
            },
            model: final.model,
        };
    }

    return { textIterator: textIterator(), finalize };
}
