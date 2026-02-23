import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    try {
        // 1. Get API Key from Authorization header (BYOK model)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or Invalid API Key' }, { status: 401 });
        }
        const apiKey = authHeader.split('Bearer ')[1].trim();

        // 2. Parse request body
        const body = await req.json();
        const { message, context, history } = body;

        // 3. Initialize GenAI client with user-provided key
        const ai = new GoogleGenAI({ apiKey });

        // 4. Construct the prompt
        const systemInstruction = `
You are a highly capable AI assistant embedded in the "반도체를 여행하는 세미에이아이를 위한 안내서".
Your goal is to answer questions from CS/AI engineers learning about Semiconductor Photolithography.
You are given the Markdown text of the document they are currently reading as "Context".
ALWAYS base your answers on this context. If the answer is not in the context, you may use external knowledge but mention that it's out-of-context. Be polite, clear, and use Markdown for formatting your answers.
Current Document Context:
-------
${context}
-------
    `;

        const fullPrompt = `${history ? "Previous chat history:\n" + JSON.stringify(history) + "\n\n" : ""}User Question: ${message}`;

        // 5. Use streaming generation with thinking mode enabled
        const stream = await ai.models.generateContentStream({
            model: 'gemini-3-pro-preview',
            contents: fullPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
                thinkingConfig: {
                    includeThoughts: true,
                    thinkingLevel: 'low',
                }
            }
        });

        // 6. Create a ReadableStream that sends thinking + text as structured events
        // Format: JSON lines — each line is { "type": "thinking" | "text", "content": "..." }
        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        // Each chunk may have multiple parts (thinking parts + text parts)
                        const candidates = chunk.candidates || [];
                        for (const candidate of candidates) {
                            const parts = candidate.content?.parts || [];
                            for (const part of parts) {
                                if (part.thought && part.text) {
                                    // This is a thinking part
                                    const line = JSON.stringify({ type: 'thinking', content: part.text }) + '\n';
                                    controller.enqueue(encoder.encode(line));
                                } else if (part.text) {
                                    // This is a regular text part
                                    const line = JSON.stringify({ type: 'text', content: part.text }) + '\n';
                                    controller.enqueue(encoder.encode(line));
                                }
                            }
                        }
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            }
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
