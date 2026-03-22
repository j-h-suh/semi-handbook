import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Post {
    id: number;
    nickname: string;
    category: string;
    title: string;
    content: string;
    chapter_id: string | null;
    password_hash: string;
    created_at: string;
}

export interface Comment {
    id: number;
    post_id: number;
    nickname: string;
    content: string;
    password_hash: string;
    created_at: string;
}
