'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import type { SearchEntry } from '@/lib/searchIndex';

interface Props {
    searchData: SearchEntry[];
}

export default function SearchModal({ searchData }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Cmd+K / Ctrl+K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
            setPage(0);
        }
    }, [open]);

    // Search logic — simple substring match with snippet extraction
    const results = useMemo(() => {
        if (!query.trim() || query.trim().length < 2) return [];
        const q = query.trim().toLowerCase();

        const matches: { chapterId: string; chapterTitle: string; snippet: string }[] = [];
        const seenChapters = new Set<string>();

        for (const entry of searchData) {
            const idx = entry.paragraph.toLowerCase().indexOf(q);
            if (idx === -1) continue;

            // Extract snippet around match
            const start = Math.max(0, idx - 30);
            const end = Math.min(entry.paragraph.length, idx + q.length + 60);
            let snippet = '';
            if (start > 0) snippet += '…';
            snippet += entry.paragraph.slice(start, end);
            if (end < entry.paragraph.length) snippet += '…';

            const key = `${entry.chapterId}:${snippet.slice(0, 40)}`;
            if (seenChapters.has(key)) continue;
            seenChapters.add(key);

            matches.push({
                chapterId: entry.chapterId,
                chapterTitle: entry.chapterTitle,
                snippet,
            });

            if (matches.length >= 100) break;
        }

        return matches;
    }, [query, searchData]);

    const PER_PAGE = 10;
    const totalPages = Math.ceil(results.length / PER_PAGE);
    const pagedResults = results.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

    // Reset page when query changes
    useEffect(() => { setPage(0); }, [query]);

    const navigate = useCallback((chapterId: string) => {
        setOpen(false);
        router.push(`/chapter/${chapterId}`);
    }, [router]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-xl mx-4 bg-[#0f1729] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Search input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
                    <Search size={18} className="text-slate-500 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="핸드북 내용 검색..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                    <button onClick={() => setOpen(false)} className="text-slate-600 hover:text-slate-400 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {query.trim().length >= 2 && results.length === 0 && (
                        <div className="px-5 py-8 text-center text-sm text-slate-600">
                            검색 결과가 없습니다.
                        </div>
                    )}
                    {pagedResults.map((r, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(r.chapterId)}
                            className="w-full text-left px-5 py-3 hover:bg-white/5 transition-colors border-b border-white/3 cursor-pointer"
                        >
                            <div className="text-xs text-cyan-500 font-medium mb-1">{r.chapterTitle}</div>
                            <div className="text-sm text-slate-400 leading-relaxed">
                                {highlightMatch(r.snippet, query)}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Pagination + Footer */}
                <div className="px-5 py-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-700">
                    {results.length > PER_PAGE ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-2 py-0.5 rounded border border-slate-700/50 text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-default cursor-pointer"
                            >←</button>
                            <span className="text-slate-500">{page + 1} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-2 py-0.5 rounded border border-slate-700/50 text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-default cursor-pointer"
                            >→</button>
                            <span className="text-slate-600 ml-1">({results.length}건)</span>
                        </div>
                    ) : (
                        <span>{results.length > 0 ? `${results.length}건` : 'ESC 닫기'}</span>
                    )}
                    <span>⌘K 토글</span>
                </div>
            </div>
        </div>
    );
}

function highlightMatch(text: string, query: string) {
    if (!query.trim()) return text;
    const q = query.trim();
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
        regex.test(part)
            ? <mark key={i} className="bg-cyan-500/25 text-cyan-300 rounded px-0.5">{part}</mark>
            : part
    );
}
