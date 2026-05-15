import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
    if (_client) return _client;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
        throw new Error(
            'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set',
        );
    }
    _client = createClient(url, key);
    return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop, receiver) {
        return Reflect.get(getClient(), prop, receiver);
    },
});

export interface Post {
    id: number;
    nickname: string;
    category: string;
    book: string;
    title: string;
    content: string;
    chapter_id: string | null;
    password_hash: string;
    created_at: string;
    status: string | null;
}

export interface Comment {
    id: number;
    post_id: number;
    nickname: string;
    content: string;
    password_hash: string;
    created_at: string;
}
