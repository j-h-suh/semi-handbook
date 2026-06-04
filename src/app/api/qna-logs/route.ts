import { NextRequest, NextResponse } from 'next/server';
import { query, isDbConfigured } from '@/lib/db';

// AI Q&A 로그 적재 (fire-and-forget).
// DB 미구성/오류여도 챗봇 경험을 막지 않도록 항상 200 으로 응답한다.
export async function POST(req: NextRequest) {
    if (!isDbConfigured()) return NextResponse.json({ success: false });
    try {
        const { chapter_id, question, answer } = await req.json();
        await query(
            `insert into qna_logs (chapter_id, question, answer) values ($1, $2, $3)`,
            [chapter_id ?? null, question ?? '', answer ?? ''],
        );
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false });
    }
}
