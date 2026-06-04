import { NextRequest, NextResponse } from 'next/server';
import { query, isDbConfigured } from '@/lib/db';
import { hashPassword } from '@/lib/board-server';
import type { Post } from '@/lib/board-types';

const POST_COLS = 'id, nickname, category, book, title, content, chapter_id, status, created_at';

// 목록 + 카테고리 카운트 + 댓글 카운트 (클라이언트 1회 호출로 통합)
export async function GET(req: NextRequest) {
    if (!isDbConfigured()) {
        return NextResponse.json({ posts: [], categoryCounts: {}, commentCounts: {} });
    }
    try {
        const category = req.nextUrl.searchParams.get('category');
        const book = req.nextUrl.searchParams.get('book');

        const conditions: string[] = [];
        const params: unknown[] = [];
        if (category && category !== '전체') {
            params.push(category);
            conditions.push(`category = $${params.length}`);
        }
        if (book && book !== '전체') {
            params.push(book);
            conditions.push(`book = $${params.length}`);
        }
        const where = conditions.length ? `where ${conditions.join(' and ')}` : '';

        const postsRes = await query<Post>(
            `select ${POST_COLS} from posts ${where} order by created_at desc`,
            params,
        );
        const posts = postsRes.rows;

        const catRes = await query<{ category: string; count: number }>(
            `select category, count(*)::int as count from posts group by category`,
        );
        const categoryCounts: Record<string, number> = {};
        let total = 0;
        for (const r of catRes.rows) {
            categoryCounts[r.category] = r.count;
            total += r.count;
        }
        categoryCounts['전체'] = total;

        const commentCounts: Record<number, number> = {};
        if (posts.length > 0) {
            const ids = posts.map((p) => p.id);
            const cntRes = await query<{ post_id: number; count: number }>(
                `select post_id, count(*)::int as count from comments where post_id = any($1) group by post_id`,
                [ids],
            );
            for (const r of cntRes.rows) commentCounts[r.post_id] = r.count;
        }

        return NextResponse.json({ posts, categoryCounts, commentCounts });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'DB 오류';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// 새 글 작성
export async function POST(req: NextRequest) {
    try {
        const { nickname, category, book, title, content, password } = await req.json();
        if (!title?.trim() || !content?.trim() || !password?.trim()) {
            return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
        }
        const status = category === '질문' || category === '수정요청' ? '대기' : null;
        const res = await query<Post>(
            `insert into posts (nickname, category, book, title, content, password_hash, status)
             values ($1, $2, $3, $4, $5, $6, $7)
             returning ${POST_COLS}`,
            [nickname?.trim() || '익명', category, book, title.trim(), content.trim(), hashPassword(password), status],
        );
        return NextResponse.json({ post: res.rows[0] });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'DB 오류';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
