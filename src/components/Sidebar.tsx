'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Settings, BookText, Search, MessageSquare, ChevronDown, Cpu, TrendingUp, Terminal, X, PanelLeftClose } from 'lucide-react';
import type { ChapterMeta } from '@/lib/markdown';

type BookTab = 'semi' | 'stats' | 'claude';

const BOOK_META: Record<BookTab, { label: string; icon: typeof Cpu; color: string; tabColor: string; chapterColor: string; route: string }> = {
    semi: { label: '반도체', icon: Cpu, color: 'text-slate-500', tabColor: 'text-cyan-400 border-cyan-400', chapterColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', route: '/semi' },
    stats: { label: '통계학', icon: TrendingUp, color: 'text-slate-500', tabColor: 'text-emerald-400 border-emerald-400', chapterColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', route: '/stats' },
    claude: { label: '클로드', icon: Terminal, color: 'text-slate-500', tabColor: 'text-violet-400 border-violet-400', chapterColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20', route: '/claude' },
};

interface Props {
    semiChapters: ChapterMeta[];
    statsChapters: ChapterMeta[];
    claudeChapters: ChapterMeta[];
    isOpen?: boolean;             // 모바일 드로어 열림 상태
    onClose?: () => void;         // 모바일 드로어 닫기
    isDesktopHidden?: boolean;    // 데스크탑 사이드바 숨김 상태
    onCollapse?: () => void;      // 데스크탑 사이드바 접기
}

export default function Sidebar({ semiChapters, statsChapters, claudeChapters, isOpen = false, onClose, isDesktopHidden = false, onCollapse }: Props) {
    const pathname = usePathname();
    const decodedPathname = decodeURIComponent(pathname);

    const detectedBook: BookTab | null = useMemo(() => {
        if (decodedPathname.startsWith('/semi/')) return 'semi';
        if (decodedPathname.startsWith('/stats/')) return 'stats';
        if (decodedPathname.startsWith('/claude/')) return 'claude';
        return null;
    }, [decodedPathname]);

    // 사용자가 명시적으로 탭을 클릭한 경우의 override.
    // URL 이동(pathname 변경) 시 자동 초기화 → 챕터 페이지 진입 시 그 책 탭으로 자연 동기화.
    const [userOverride, setUserOverride] = useState<BookTab | null>(null);
    useEffect(() => {
        setUserOverride(null);
        onClose?.();
    }, [pathname, onClose]);
    const activeBook: BookTab = userOverride ?? detectedBook ?? 'semi';

    const chaptersMap: Record<BookTab, ChapterMeta[]> = { semi: semiChapters, stats: statsChapters, claude: claudeChapters };
    const chapters = chaptersMap[activeBook];
    const routePrefix = BOOK_META[activeBook].route;

    const groupedChapters = chapters.reduce((acc, chapter) => {
        if (!acc[chapter.part]) acc[chapter.part] = [];
        acc[chapter.part].push(chapter);
        return acc;
    }, {} as Record<string, ChapterMeta[]>);

    const activePart = useMemo(() => {
        for (const [part, chs] of Object.entries(groupedChapters)) {
            if (chs.some(ch => decodedPathname === `${routePrefix}/${ch.id}`)) return part;
        }
        return null;
    }, [decodedPathname, groupedChapters, routePrefix]);

    const [openParts, setOpenParts] = useState<Set<string>>(
        new Set(activePart ? [activePart] : [Object.keys(groupedChapters)[0]])
    );

    // activePart 가 바뀔 때만 자동 펴짐. 같은 챕터에서 사용자가 수동으로 닫으면
    // (= 이전엔 렌더 중 setState 가 즉시 재추가해서 무응답으로 보였던 버그) 닫힌 채 유지.
    useEffect(() => {
        if (!activePart) return;
        setOpenParts(prev => (prev.has(activePart) ? prev : new Set([...prev, activePart])));
    }, [activePart]);

    const togglePart = (part: string) => {
        setOpenParts(prev => {
            const next = new Set(prev);
            if (next.has(part)) next.delete(part);
            else next.add(part);
            return next;
        });
    };

    return (
        <aside
            className={`w-72 h-full flex flex-col border-r border-slate-800 glass-panel md:shrink-0 md:static fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isDesktopHidden ? 'md:hidden' : 'md:translate-x-0'}`}
        >
            <div className="relative">
                <Link
                    href="/"
                    onClick={onClose}
                    className="p-6 border-b border-slate-800 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-200 whitespace-normal leading-snug">
                            반도체를 여행하는<br />세미에이아이를 위한<br />핸드북 시리즈
                        </h1>
                    </div>
                </Link>
                {/* 모바일 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="md:hidden absolute top-3 right-3 p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                    aria-label="메뉴 닫기"
                >
                    <X size={18} />
                </button>
                {/* 데스크탑 접기 버튼 */}
                <button
                    onClick={onCollapse}
                    className="hidden md:block absolute top-3 right-3 p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                    aria-label="사이드바 접기"
                >
                    <PanelLeftClose size={18} />
                </button>
            </div>

            {/* Book Tabs */}
            <div className="flex border-b border-slate-800">
                {(Object.keys(BOOK_META) as BookTab[]).map(book => {
                    const meta = BOOK_META[book];
                    const Icon = meta.icon;
                    const isActive = activeBook === book;
                    return (
                        <button
                            key={book}
                            onClick={() => {
                                setUserOverride(book);
                                const newChapters = chaptersMap[book];
                                const firstPart = newChapters[0]?.part;
                                if (firstPart) setOpenParts(new Set([firstPart]));
                            }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors cursor-pointer border-b-2 ${
                                isActive
                                    ? BOOK_META[book].tabColor
                                    : 'text-slate-500 border-transparent hover:text-slate-300'
                            }`}
                        >
                            <Icon size={14} />
                            {meta.label}
                        </button>
                    );
                })}
            </div>

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
                                        const isActive = decodedPathname === `${routePrefix}/${chapter.id}`;
                                        const accentColor = BOOK_META[activeBook].chapterColor;
                                        return (
                                            <li key={chapter.id}>
                                                <Link
                                                    href={`${routePrefix}/${chapter.id}`}
                                                    onClick={onClose}
                                                    className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                                                        ? `${accentColor} font-medium border`
                                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                                    }`}
                                                >
                                                    {chapter.title.split('—')[0].trim()}
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
