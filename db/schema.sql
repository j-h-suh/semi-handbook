-- semi-handbook 게시판 / Q&A 로그 스키마
-- 적용:  psql "$DATABASE_URL" -f db/schema.sql
--
-- 기존 Supabase 클라우드에서 옮겨오는 데이터는 없음(현재 미사용).
-- DATABASE_URL 로 닿는 사내 Postgres 에 이 스크립트를 한 번 적용하면
-- 게시판/Q&A 로그 기능이 켜진다.

create table if not exists posts (
    id            serial      primary key,
    nickname      text        not null default '익명',
    category      text        not null,
    book          text,
    title         text        not null,
    content       text        not null,
    chapter_id    text,
    password_hash text        not null,
    status        text,
    created_at    timestamptz not null default now()
);

create table if not exists comments (
    id            serial      primary key,
    post_id       integer     not null references posts(id) on delete cascade,
    nickname      text        not null default '익명',
    content       text        not null,
    password_hash text        not null,
    created_at    timestamptz not null default now()
);

create table if not exists qna_logs (
    id          serial      primary key,
    chapter_id  text,
    question    text        not null,
    answer      text        not null,
    created_at  timestamptz not null default now()
);

create index if not exists idx_comments_post_id on comments (post_id);
create index if not exists idx_posts_created_at on posts (created_at desc);
