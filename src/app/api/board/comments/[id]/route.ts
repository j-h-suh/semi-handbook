import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/board-server';
import type { Comment } from '@/lib/board-types';

const COMMENT_COLS = 'id, post_id, nickname, content, created_at';

async function verifyComment(id: number, password: string): Promise<boolean> {
    const res = await query<{ password_hash: string }>(
        `select password_hash from comments where id = $1`,
        [id],
    );
    const row = res.rows[0];
    return !!row && row.password_hash === hashPassword(password);
}

// 댓글 수정
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const commentId = Number(id);
        const { password, content } = await req.json();
        if (!password || !(await verifyComment(commentId, password))) {
            return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
        }
        const res = await query<Comment>(
            `update comments set content = $1 where id = $2 returning ${COMMENT_COLS}`,
            [content?.trim() ?? '', commentId],
        );
        return NextResponse.json({ comment: res.rows[0] });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'DB 오류';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// 댓글 삭제
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const commentId = Number(id);
        const { password } = await req.json();
        if (!password || !(await verifyComment(commentId, password))) {
            return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
        }
        await query(`delete from comments where id = $1`, [commentId]);
        return NextResponse.json({ success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'DB 오류';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
