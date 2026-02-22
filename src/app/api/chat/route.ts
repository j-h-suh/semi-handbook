import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

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
        // For simplicity, we prepend the context to the system instructions implicitly by injecting it as a dev prompt
        // Or we just attach it to the current message to ensure it's grounded
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

        // 5. Build chat session
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3
            }
        });

        // 6. Optional: preload history if supported by the SDK structure or just send the final message.
        // For a robust implementation with @google/genai, you can pass history during create(), 
        // but here we just manually stringify existing history to avoid structure mismatches if `history` isn't fully shape-compatible.
        const fullPrompt = `${history ? "Previous chat history:\n" + JSON.stringify(history) + "\n\n" : ""}User Question: ${message}`;

        // 7. Send message to model
        const response = await chat.sendMessage({ message: fullPrompt });

        // 8. Log the interaction locally
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                userMessage: message,
                aiResponse: response.text,
            };
            const logPath = path.join(process.cwd(), 'qa_logs.json');

            let currentLogs = [];
            if (fs.existsSync(logPath)) {
                const fileData = fs.readFileSync(logPath, 'utf8');
                if (fileData) currentLogs = JSON.parse(fileData);
            }
            currentLogs.push(logEntry);
            fs.writeFileSync(logPath, JSON.stringify(currentLogs, null, 2), 'utf8');
        } catch (logErr) {
            console.error('Failed to write QA log:', logErr);
            // Don't fail the response if logging fails
        }

        // 9. Return response
        return NextResponse.json({ text: response.text });
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
