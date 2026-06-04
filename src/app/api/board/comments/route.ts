import { NextRequest, NextResponse } from 'next/server';
import { query, isDbConfigured } from '@/lib/db';
import { hashPassword } from '@/lib/board-server';
import type { Comment } from '@/lib/board-types';

const COMMENT_COLS = 'id, post_id, nickname, content, created_at';

// 특정 글의 댓글 목록
export async function GET(req: NextRequest) {
    if (!isDbConfigured()) return NextResponse.json({ comments: [] });
    try {
        const postId = Number(req.nextUrl.searchParams.get('post_id'));
        if (!postId) return NextResponse.json({ comments: [] });
        const res = await query<Comment>(
            `select ${COMMENT_COLS} from comments where post_id = $1 order by created_at asc`,
            [postId],
        );
        return NextResponse.json({ comments: res.rows });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'DB 오류';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// 댓글 작성
export async function POST(req: NextRequest) {
    try {
        const { post_id, nickname, content, password } = await req.json();
        if (!post_id || !content?.trim() || !password?.trim()) {
            return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
        }
        const res = await query<Comment>(
            `insert into comments (post_id, nickname, content, password_hash)
             values ($1, $2, $3, $4)
             returning ${COMMENT_COLS}`,
            [post_id, nickname?.trim() || '익명', content.trim(), hashPassword(password)],
        );
        return NextResponse.json({ comment: res.rows[0] });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'DB 오류';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
