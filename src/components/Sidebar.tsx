'use client';

import { useState, useMemo } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Settings, BookText, Search, MessageSquare, ChevronDown } from 'lucide-react';
import type { ChapterMeta } from '@/lib/markdown';

export default function Sidebar({ chapters }: { chapters: ChapterMeta[] }) {
    const pathname = usePathname();
    const decodedPathname = decodeURIComponent(pathname);

    // Group chapters by Part
    const groupedChapters = chapters.reduce((acc, chapter) => {
        if (!acc[chapter.part]) {
            acc[chapter.part] = [];
        }
        acc[chapter.part].push(chapter);
        return acc;
    }, {} as Record<string, ChapterMeta[]>);

    // Auto-expand the Part that contains the active chapter
    const activePart = useMemo(() => {
        for (const [part, chs] of Object.entries(groupedChapters)) {
            if (chs.some(ch => decodedPathname === `/chapter/${ch.id}`)) return part;
        }
        return null;
    }, [pathname, groupedChapters]);

    const [openParts, setOpenParts] = useState<Set<string>>(
        new Set(activePart ? [activePart] : [Object.keys(groupedChapters)[0]])
    );

    // Keep active part open when navigating
    if (activePart && !openParts.has(activePart)) {
        setOpenParts(prev => new Set([...prev, activePart]));
    }

    const togglePart = (part: string) => {
        setOpenParts(prev => {
            const next = new Set(prev);
            if (next.has(part)) next.delete(part);
            else next.add(part);
            return next;
        });
    };

    return (
        <aside className="w-72 h-full flex flex-col border-r border-slate-800 glass-panel shrink-0">
            <Link href="/" className="p-6 border-b border-slate-800 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <BookOpen size={20} />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-slate-200 tracking-tight whitespace-normal leading-tight">
                        반도체를 여행하는<br />세미에이아이를 위한 안내서
                    </h1>
                </div>
            </Link>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {Object.entries(groupedChapters).map(([part, partChapters]) => {
                    const isOpen = openParts.has(part);
                    return (
                        <div key={part} className="mb-2">
                            <button
                                onClick={() => togglePart(part)}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors cursor-pointer"
                            >
                                {part}
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
                            </button>
                            {isOpen && (
                                <ul className="space-y-1 mt-1">
                                    {partChapters.map((chapter) => {
                                        const isActive = decodedPathname === `/chapter/${chapter.id}`;
                                        return (
                                            <li key={chapter.id}>
                                                <Link
                                                    href={`/chapter/${chapter.id}`}
                                                    className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                                                        ? 'bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20'
                                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                                    }`}
                                                >
                                                    {chapter.title}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Search + Glossary + Settings at the bottom */}
            <div className="p-4 border-t border-slate-800 space-y-1">
                <button
                    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
                >
                    <Search size={16} />
                    <span>검색</span>
                    <kbd className="ml-auto text-[10px] text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700/50">⌘K</kbd>
                </button>
                <Link
                    href="/glossary"
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        pathname === '/glossary'
                            ? 'bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                >
                    <BookText size={16} />
                    <span>용어 사전</span>
                </Link>
                <Link
                    href="/board"
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        pathname === '/board'
                            ? 'bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                >
                    <MessageSquare size={16} />
                    <span>게시판</span>
                </Link>
                <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
                >
                    <Settings size={16} />
                    <span>API Settings (BYOK)</span>
                </button>
            </div>
        </aside>
    );
}
