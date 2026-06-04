import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 게시판 글 상태 변경 (관리자 전용 — ADMIN_PASSWORD 검증)
export async function PATCH(req: NextRequest) {
    try {
        const { postId, status, password } = await req.json();

        if (!process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: '관리자 기능이 구성되지 않았습니다.' }, { status: 401 });
        }
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
        }
        if (!['대기', '완료'].includes(status)) {
            return NextResponse.json({ error: '잘못된 상태값입니다.' }, { status: 400 });
        }

        await query(`update posts set status = $1 where id = $2`, [status, postId]);
        return NextResponse.json({ success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'DB 오류';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
