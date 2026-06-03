import { AnthropicBedrock } from '@anthropic-ai/bedrock-sdk';
import type { StreamTextArgs, StreamTextResult } from './types';

let _client: AnthropicBedrock | null = null;

function getClient(): AnthropicBedrock {
    if (_client) return _client;
    // AWS_BEARER_TOKEN_BEDROCK 이 환경에 있으면 SDK 가 Bearer 인증을 자동 사용한다.
    // 없으면 표준 AWS 자격증명 체인(~/.aws, AWS_ACCESS_KEY_ID/SECRET, EC2 IAM role)으로
    // SigV4 서명한다. region 은 endpoint 결정에 필요 — global inference profile 도 호출
    // 기점 region 을 요구하므로 기본값을 둔다.
    const awsRegion = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1';
    _client = new AnthropicBedrock({ awsRegion });
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
    // async iterator 로 변환
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
