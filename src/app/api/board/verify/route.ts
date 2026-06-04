import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/board-server';

// 수정 진입 시 비밀번호 확인 (글/댓글 공용).
// table 명은 kind 로 한정된 화이트리스트 — 사용자 임의 입력 아님.
export async function POST(req: NextRequest) {
    try {
        const { kind, id, password } = await req.json();
        const table = kind === 'comment' ? 'comments' : 'posts';
        if (!password) return NextResponse.json({ ok: false }, { status: 401 });

        const res = await query<{ password_hash: string }>(
            `select password_hash from ${table} where id = $1`,
            [Number(id)],
        );
        const row = res.rows[0];
        const ok = !!row && row.password_hash === hashPassword(password);
        return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'DB 오류';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
