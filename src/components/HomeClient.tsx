'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, MessageSquare, Clock, BookText, BarChart3, ArrowRight } from 'lucide-react';
import { supabase, type Post } from '@/lib/supabase';

interface RecentChapter {
    id: string;
    title: string;
    lastUpdated: string;
}

interface Props {
    totalChapters: number;
    totalTerms: number;
    totalDiagrams: number;
    recentChapters: RecentChapter[];
}

export default function HomeClient({ totalChapters, totalTerms, totalDiagrams, recentChapters }: Props) {
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);

    useEffect(() => {
        supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(3)
            .then(({ data }) => setRecentPosts(data ?? []));
    }, []);

    const formatDate = (d: string) => {
        const date = new Date(d);
        return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
    };

    const categoryColor = (cat: string) => {
        switch (cat) {
            case '질문': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case '수정요청': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-400 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
            <div className="max-w-4xl mx-auto w-full px-8 py-16 lg:px-12">

                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6">
                        <BookOpen size={36} />
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl mb-4">
                        반도체를 여행하는<br />
                        <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                            세미에이아이를 위한 안내서
                        </span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
                        반도체 포토리소그래피와 AI 기술을 체계적으로 정리한 핸드북
                    </p>
                    <Link
                        href="/chapter/00_00_들어가며"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-medium rounded-xl hover:bg-cyan-500/25 transition-colors text-sm"
                    >
                        읽기 시작하기 <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                        <div className="text-3xl font-bold text-white mb-1">{totalChapters}</div>
                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                            <BookOpen size={13} /> 챕터
                        </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                        <div className="text-3xl font-bold text-white mb-1">{totalTerms}</div>
                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                            <BookText size={13} /> 용어
                        </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                        <div className="text-3xl font-bold text-white mb-1">{totalDiagrams}</div>
                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                            <BarChart3 size={13} /> 다이어그램
                        </div>
                    </div>
                </div>

                {/* Recent Updates + Board */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Recent Updates */}
                    <div>
                        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-4">
                            <Clock size={15} /> 최근 업데이트
                        </h2>
                        <div className="space-y-2">
                            {recentChapters.map(ch => (
                                <Link
                                    key={ch.id}
                                    href={`/chapter/${ch.id}`}
                                    className="block px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all"
                                >
                                    <div className="text-sm font-medium text-slate-200 line-clamp-1 mb-1">{ch.title}</div>
                                    <div className="text-xs text-slate-600">{formatDate(ch.lastUpdated)}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Board Posts */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                <MessageSquare size={15} /> 최근 게시글
                            </h2>
                            <Link href="/board" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">
                                전체보기 →
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {recentPosts.length === 0 ? (
                                <div className="px-4 py-6 rounded-xl border border-white/5 bg-white/[0.02] text-center text-xs text-slate-600">
                                    아직 게시글이 없습니다
                                </div>
                            ) : (
                                recentPosts.map(post => (
                                    <Link
                                        key={post.id}
                                        href="/board"
                                        className="block px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${categoryColor(post.category)}`}>
                                                {post.category}
                                            </span>
                                            <span className="text-sm font-medium text-slate-200 line-clamp-1">{post.title}</span>
                                        </div>
                                        <div className="text-xs text-slate-600">{post.nickname} · {formatDate(post.created_at)}</div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
