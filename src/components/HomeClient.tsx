'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, MessageSquare, Clock, BookText, BarChart3, ArrowRight, Cpu, TrendingUp, Terminal } from 'lucide-react';
import { supabase, type Post } from '@/lib/supabase';

interface RecentChapter {
    id: string;
    title: string;
    lastUpdated: string;
}

interface Props {
    semiChapterCount: number;
    statsChapterCount: number;
    claudeChapterCount: number;
    totalTerms: number;
    totalDiagrams: number;
    recentSemiChapters: RecentChapter[];
    recentStatsChapters: RecentChapter[];
    recentClaudeChapters: RecentChapter[];
}

export default function HomeClient({
    semiChapterCount, statsChapterCount, claudeChapterCount, totalTerms, totalDiagrams,
    recentSemiChapters, recentStatsChapters, recentClaudeChapters,
}: Props) {
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
                        세미에이아이<br />
                        <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                            핸드북 시리즈
                        </span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
                        반도체, 통계학, Claude Code — AI/ML 엔지니어를 위한 체계적 핸드북 시리즈
                    </p>
                </div>

                {/* Book Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Semi Handbook */}
                    <Link
                        href="/semi/00_00_들어가며"
                        className="group p-6 rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.03] hover:bg-cyan-500/[0.06] hover:border-cyan-500/25 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <Cpu size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">반도체 핸드북</h2>
                                <p className="text-xs text-slate-500">포토리소그래피 & AI 제조</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                            반도체 제조 공정부터 수율 공학, AI 적용까지 — 업계 선배가 전하는 실무 안내서
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">{semiChapterCount}개 챕터 · {totalTerms}개 용어</span>
                            <span className="text-sm text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                읽기 <ArrowRight size={14} />
                            </span>
                        </div>
                    </Link>

                    {/* Stats Handbook */}
                    <Link
                        href="/stats/00_00_들어가며"
                        className="group p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] hover:border-emerald-500/25 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">통계학 핸드북</h2>
                                <p className="text-xs text-slate-500">AI/ML 엔지니어를 위한 통계</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                            기술통계부터 베이지안, 인과추론까지 — 실무에서 바로 쓰는 통계학 가이드
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">{statsChapterCount}개 챕터 · {totalDiagrams}개 다이어그램</span>
                            <span className="text-sm text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                읽기 <ArrowRight size={14} />
                            </span>
                        </div>
                    </Link>

                    {/* Claude Code Handbook */}
                    <Link
                        href="/claude/00_0_왜_이_책을_썼는가"
                        className="group p-6 rounded-2xl border border-violet-500/10 bg-violet-500/[0.03] hover:bg-violet-500/[0.06] hover:border-violet-500/25 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                <Terminal size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">클로드 핸드북</h2>
                                <p className="text-xs text-slate-500">AI 코딩 에이전트 심층 분석</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                            부트스트랩부터 멀티 에이전트까지 — Claude Code의 내부 구조를 해부하는 기술 핸드북
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">{claudeChapterCount}개 챕터</span>
                            <span className="text-sm text-violet-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                읽기 <ArrowRight size={14} />
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-4 gap-3 mb-12">
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                        <div className="text-2xl font-bold text-white mb-1">{semiChapterCount + statsChapterCount + claudeChapterCount}</div>
                        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                            <BookOpen size={12} /> 총 챕터
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                        <div className="text-2xl font-bold text-white mb-1">{totalTerms}</div>
                        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                            <BookText size={12} /> 용어
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                        <div className="text-2xl font-bold text-white mb-1">{totalDiagrams}</div>
                        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                            <BarChart3 size={12} /> 다이어그램
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                        <div className="text-2xl font-bold text-white mb-1">3</div>
                        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                            <BookOpen size={12} /> 시리즈
                        </div>
                    </div>
                </div>

                {/* Recent Updates + Board */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Recent Semi Updates */}
                    <div>
                        <h2 className="flex items-center gap-2 text-xs font-bold text-cyan-500/70 mb-3">
                            <Clock size={13} /> 반도체 최근 업데이트
                        </h2>
                        <div className="space-y-1.5">
                            {recentSemiChapters.map(ch => (
                                <Link
                                    key={ch.id}
                                    href={`/semi/${ch.id}`}
                                    className="block px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all"
                                >
                                    <div className="text-xs font-medium text-slate-200 line-clamp-1 mb-0.5">{ch.title}</div>
                                    <div className="text-[10px] text-slate-600">{formatDate(ch.lastUpdated)}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Stats Updates */}
                    <div>
                        <h2 className="flex items-center gap-2 text-xs font-bold text-emerald-500/70 mb-3">
                            <Clock size={13} /> 통계학 최근 업데이트
                        </h2>
                        <div className="space-y-1.5">
                            {recentStatsChapters.map(ch => (
                                <Link
                                    key={ch.id}
                                    href={`/stats/${ch.id}`}
                                    className="block px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all"
                                >
                                    <div className="text-xs font-medium text-slate-200 line-clamp-1 mb-0.5">{ch.title}</div>
                                    <div className="text-[10px] text-slate-600">{formatDate(ch.lastUpdated)}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Claude Updates */}
                    <div>
                        <h2 className="flex items-center gap-2 text-xs font-bold text-violet-500/70 mb-3">
                            <Clock size={13} /> Claude Code 최근 업데이트
                        </h2>
                        <div className="space-y-1.5">
                            {recentClaudeChapters.map(ch => (
                                <Link
                                    key={ch.id}
                                    href={`/claude/${ch.id}`}
                                    className="block px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all"
                                >
                                    <div className="text-xs font-medium text-slate-200 line-clamp-1 mb-0.5">{ch.title}</div>
                                    <div className="text-[10px] text-slate-600">{formatDate(ch.lastUpdated)}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Board Posts */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <MessageSquare size={13} /> 최근 게시글
                            </h2>
                            <Link href="/board" className="text-[10px] text-slate-600 hover:text-cyan-400 transition-colors">
                                전체보기 →
                            </Link>
                        </div>
                        <div className="space-y-1.5">
                            {recentPosts.length === 0 ? (
                                <div className="px-3 py-6 rounded-xl border border-white/5 bg-white/[0.02] text-center text-[11px] text-slate-600">
                                    아직 게시글이 없습니다
                                </div>
                            ) : (
                                recentPosts.map(post => (
                                    <Link
                                        key={post.id}
                                        href="/board"
                                        className="block px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all"
                                    >
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className={`text-[9px] px-1 py-0.5 rounded border ${categoryColor(post.category)}`}>
                                                {post.category}
                                            </span>
                                            <span className="text-xs font-medium text-slate-200 line-clamp-1">{post.title}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-600">{post.nickname} · {formatDate(post.created_at)}</div>
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
