import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(req: NextRequest) {
    const { postId, status, password } = await req.json();

    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    if (!['대기', '완료'].includes(status)) {
        return NextResponse.json({ error: '잘못된 상태값입니다.' }, { status: 400 });
    }

    const { error } = await supabase
        .from('posts')
        .update({ status })
        .eq('id', postId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
