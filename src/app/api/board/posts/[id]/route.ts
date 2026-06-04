import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/board-server';
import type { Post } from '@/lib/board-types';

const POST_COLS = 'id, nickname, category, book, title, content, chapter_id, status, created_at';

async function verifyPost(id: number, password: string): Promise<boolean> {
    const res = await query<{ password_hash: string }>(
        `select password_hash from posts where id = $1`,
        [id],
    );
    const row = res.rows[0];
    return !!row && row.password_hash === hashPassword(password);
}

// 글 수정
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const postId = Number(id);
        const { password, nickname, category, book, title, content } = await req.json();
        if (!password || !(await verifyPost(postId, password))) {
            return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
        }
        const res = await query<Post>(
            `update posts set nickname = $1, category = $2, book = $3, title = $4, content = $5
             where id = $6
             returning ${POST_COLS}`,
            [nickname?.trim() || '익명', category, book, title?.trim() ?? '', content?.trim() ?? '', postId],
        );
        return NextResponse.json({ post: res.rows[0] });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'DB 오류';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// 글 삭제
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const postId = Number(id);
        const { password } = await req.json();
        if (!password || !(await verifyPost(postId, password))) {
            return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
        }
        await query(`delete from posts where id = $1`, [postId]);
        return NextResponse.json({ success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'DB 오류';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
