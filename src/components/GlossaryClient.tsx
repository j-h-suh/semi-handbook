'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Cpu, TrendingUp, Terminal, type LucideIcon } from 'lucide-react';
import glossary from '@/lib/glossary';
import type { GlossaryEntry } from '@/lib/glossary';
import { BOOKS, getBookMeta, type Book, type IconName } from '@/lib/books';

const BOOK_FILTERS: { id: 'all' | Book; label: string }[] = [
    { id: 'all', label: '전체' },
    ...BOOKS.map((b) => ({ id: b.id as 'all' | Book, label: b.fullLabel })),
];

const ICON_MAP: Record<IconName, LucideIcon> = {
    'cpu': Cpu,
    'trending-up': TrendingUp,
    'terminal': Terminal,
};

interface Props {
    chapterMap: Record<Book, Record<string, { id: string; title: string }>>;
}

export default function GlossaryClient({ chapterMap }: Props) {
    const [search, setSearch] = useState('');
    const [activeBook, setActiveBook] = useState<'all' | Book>('all');

    const filtered = useMemo(() => {
        let entries = glossary as GlossaryEntry[];
        if (activeBook !== 'all') {
            entries = entries.filter((e) => e.book === activeBook);
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            entries = entries.filter((e) =>
                e.term.toLowerCase().includes(q) ||
                (e.abbr && e.abbr.toLowerCase().includes(q)) ||
                e.definition.toLowerCase().includes(q),
            );
        }
        return entries;
    }, [search, activeBook]);

    return (
        <div className="max-w-4xl mx-auto w-full px-8 py-12 lg:px-12">
            <header className="mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    용어 사전
                </h1>
                <p className="mt-3 text-sm text-zinc-500">
                    핸드북에서 사용된 핵심 키워드 {glossary.length}개
                </p>
            </header>

            {/* Search + Book filter */}
            <div className="mb-8 space-y-4">
                <input
                    type="text"
                    placeholder="용어 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#00d4a4]/40 focus:ring-1 focus:ring-[#00d4a4]/20 transition-colors"
                />
                <div className="flex gap-2 flex-wrap">
                    {BOOK_FILTERS.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setActiveBook(f.id)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${activeBook === f.id
                                ? 'bg-[#00d4a4]/15 border-[#00d4a4]/30 text-[#00d4a4] font-medium'
                                : 'bg-white/3 border-white/8 text-zinc-500 hover:text-zinc-300 hover:border-white/15'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            <div className="space-y-1">
                {filtered.length === 0 && (
                    <p className="text-sm text-zinc-600 py-8 text-center">검색 결과가 없습니다.</p>
                )}
                {filtered.map((entry, i) => {
                    const bookMeta = getBookMeta(entry.book);
                    const BookIcon = ICON_MAP[bookMeta.iconKey];
                    const bookChapterMap = chapterMap[entry.book] ?? {};
                    return (
                        <div key={i} className="group px-4 py-3 rounded-xl hover:bg-white/3 transition-colors border border-transparent hover:border-white/5">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-base font-semibold text-zinc-200">{entry.term}</span>
                                {entry.abbr && (
                                    <span className="text-xs text-zinc-500">({entry.abbr})</span>
                                )}
                                <span className="text-[11px] text-zinc-700 ml-auto">{entry.category}</span>
                            </div>
                            {entry.definition && (
                                <p className="text-sm text-zinc-400 leading-relaxed">{entry.definition}</p>
                            )}
                            <div className="mt-1.5 flex gap-2 flex-wrap items-center">
                                {entry.chapters.map((ch) => {
                                    const found = bookChapterMap[ch];
                                    return (
                                        <Link
                                            key={ch}
                                            href={found ? `${bookMeta.route}/${found.id}` : '#'}
                                            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-[#00d4a4] transition-colors"
                                            title={found?.title}
                                        >
                                            <BookIcon size={11} className="text-[#00d4a4]/70" />
                                            <span>{ch}장</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
