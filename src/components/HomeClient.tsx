'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight, Cpu, TrendingUp, Terminal } from 'lucide-react';

interface Props {
    semiChapterCount: number;
    statsChapterCount: number;
    claudeChapterCount: number;
    totalTerms: number;
    totalDiagrams: number;
}

export default function HomeClient({
    semiChapterCount, statsChapterCount, claudeChapterCount, totalTerms, totalDiagrams,
}: Props) {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
            <div className="min-h-full flex flex-col justify-center">
                <div className="max-w-4xl mx-auto w-full px-4 py-8 md:px-8 md:py-16 lg:px-12">

                {/* Hero */}
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6">
                        <BookOpen size={32} className="md:w-9 md:h-9" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl mb-6 leading-snug">
                        반도체를 여행하는<br />
                        세미에이아이를 위한<br />
                        <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                            핸드북 시리즈
                        </span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
                        기술과 제품을 만드는 모두를 위한 핸드북 시리즈
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
                                <p className="text-xs text-slate-500">데이터로 일하는 모두를 위한 통계</p>
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
            </div>
            </div>
        </div>
    );
}
