'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import glossary from '@/lib/glossary';
import type { GlossaryEntry } from '@/lib/glossary';

const CATEGORIES = ['전체', '공정', '리소그래피', '수율/계측', 'AI/ML', '장비/기업'];

interface Props {
    chapterMap: Record<string, { id: string; title: string }>;
}

export default function GlossaryClient({ chapterMap }: Props) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('전체');

    const filtered = useMemo(() => {
        let entries = glossary as GlossaryEntry[];
        if (activeCategory !== '전체') {
            entries = entries.filter(e => e.category === activeCategory);
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            entries = entries.filter(e =>
                e.term.toLowerCase().includes(q) ||
                (e.abbr && e.abbr.toLowerCase().includes(q)) ||
                e.definition.toLowerCase().includes(q)
            );
        }
        return entries;
    }, [search, activeCategory]);

    return (
        <div className="max-w-4xl mx-auto w-full px-8 py-12 lg:px-12">
            <header className="mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    용어 사전
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                    핸드북에서 사용된 핵심 키워드 {glossary.length}개
                </p>
            </header>

            {/* Search + Category filter */}
            <div className="mb-8 space-y-4">
                <input
                    type="text"
                    placeholder="용어 검색..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                />
                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                                activeCategory === cat
                                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 font-medium'
                                    : 'bg-white/3 border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/15'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            <div className="space-y-1">
                {filtered.length === 0 && (
                    <p className="text-sm text-slate-600 py-8 text-center">검색 결과가 없습니다.</p>
                )}
                {filtered.map((entry, i) => (
                    <div key={i} className="group px-4 py-3 rounded-xl hover:bg-white/3 transition-colors border border-transparent hover:border-white/5">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-base font-semibold text-slate-200">{entry.term}</span>
                            {entry.abbr && (
                                <span className="text-xs text-slate-500">({entry.abbr})</span>
                            )}
                            <span className="text-[11px] text-slate-700 ml-auto">{entry.category}</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">{entry.definition}</p>
                        <div className="mt-1.5 flex gap-1.5 flex-wrap">
                            {entry.chapters.map(ch => {
                                const found = chapterMap[ch];
                                if (!found) return <span key={ch} className="text-[11px] text-slate-600">{ch}장</span>;
                                return (
                                    <Link
                                        key={ch}
                                        href={`/chapter/${found.id}`}
                                        className="text-[11px] text-cyan-600 hover:text-cyan-400 transition-colors"
                                        title={found.title}
                                    >
                                        {ch}장
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
