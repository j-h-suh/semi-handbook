import { NextResponse } from 'next/server';
import { streamText, type ChatMessage } from '@/lib/llm';
import { DEFAULT_MODEL_ID } from '@/lib/llm/models';

const MAX_TOKENS = 4096;

interface ChatRequestBody {
    message: string;
    context: string;
    history?: ChatMessage[];
    model?: string;
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as ChatRequestBody;
        const { message, context, history, model: requestedModel } = body;
        const model = requestedModel || DEFAULT_MODEL_ID;

        const systemInstruction = `You are a highly capable AI assistant embedded in the "반도체를 여행하는 SemiAI를 위한 핸드북".
Your goal is to answer questions from CS/AI engineers learning about Semiconductor Photolithography.
You are given the Markdown text of the document they are currently reading as "Context".
ALWAYS base your answers on this context. If the answer is not in the context, you may use external knowledge but mention that it's out-of-context. Be polite, clear, and use Markdown for formatting your answers.
Current Document Context:
-------
${context}
-------
`;

        const messages: ChatMessage[] = [
            ...(Array.isArray(history) ? history : []),
            { role: 'user', content: message },
        ];

        const { textIterator } = await streamText({
            system: systemInstruction,
            messages,
            model,
            maxTokens: MAX_TOKENS,
            signal: req.signal,
        });

        // JSON lines streaming — { type: 'text', content: '...' } 만 emit
        // (thinking parts 자리는 의도적으로 제거 — 두 provider 통일 결)
        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const text of textIterator) {
                        const line = JSON.stringify({ type: 'text', content: text }) + '\n';
                        controller.enqueue(encoder.encode(line));
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
