import { Pool, type QueryResultRow } from 'pg';

// Lazy Postgres 연결 풀.
// 모듈 로드가 아니라 "첫 query 시점"에만 풀을 만든다 → DATABASE_URL 이 없어도
// 빌드/구동은 통과하고, DB 를 실제로 쓰는 요청에서만 에러가 난다.
// (게시판/Q&A 로그는 DATABASE_URL 주입 시 자동으로 켜지는 dormant 상태로 배포 가능)
let pool: Pool | null = null;

function getPool(): Pool {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error(
                'DATABASE_URL 이 설정되지 않았습니다. 게시판/Q&A 로그 기능을 쓰려면 DATABASE_URL 을 주입하세요.',
            );
        }
        pool = new Pool({ connectionString });
    }
    return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
) {
    return getPool().query<T>(text, params);
}

// DATABASE_URL 주입 여부 — 라우트에서 "DB 미구성" 을 graceful 하게 처리할 때 사용
export function isDbConfigured(): boolean {
    return Boolean(process.env.DATABASE_URL);
}
