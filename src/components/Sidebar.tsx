'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Settings } from 'lucide-react';
import type { ChapterMeta } from '@/lib/markdown';

export default function Sidebar({ chapters }: { chapters: ChapterMeta[] }) {
    const pathname = usePathname();

    // Group chapters by Part
    const groupedChapters = chapters.reduce((acc, chapter) => {
        if (!acc[chapter.part]) {
            acc[chapter.part] = [];
        }
        acc[chapter.part].push(chapter);
        return acc;
    }, {} as Record<string, ChapterMeta[]>);

    return (
        <aside className="w-72 h-full flex flex-col border-r border-slate-800 glass-panel shrink-0">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <BookOpen size={20} />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-slate-200 tracking-tight whitespace-normal leading-tight">
                        반도체를 여행하는<br />세미에이아이를 위한 안내서
                    </h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {Object.entries(groupedChapters).map(([part, partChapters]) => (
                    <div key={part} className="mb-6">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">
                            {part}
                        </h2>
                        <ul className="space-y-1">
                            {partChapters.map((chapter) => {
                                const isActive = pathname === `/chapter/${chapter.id}` || (pathname === '/' && chapter.id === partChapters[0].id && part === Object.keys(groupedChapters)[0]);

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
                    </div>
                ))}
            </div>

            {/* Settings / API Key section hook at the bottom */}
            <div className="p-4 border-t border-slate-800">
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
