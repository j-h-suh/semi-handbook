// 게시판 도메인 타입 (client-safe).
// password_hash 는 서버에서만 다루므로 클라이언트로 내려보내지 않는다.

export interface Post {
    id: number;
    nickname: string;
    category: string;
    book: string;
    title: string;
    content: string;
    chapter_id: string | null;
    status: string | null;
    created_at: string;
}

export interface Comment {
    id: number;
    post_id: number;
    nickname: string;
    content: string;
    created_at: string;
}
