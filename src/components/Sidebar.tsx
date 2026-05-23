'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Settings, BookText, Search, ChevronDown, Cpu, TrendingUp, Terminal, X, PanelLeftClose } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BOOKS, getBookMeta, type Book, type IconName, type AccentName } from '@/lib/books';
import type { ChapterMeta } from '@/lib/markdown';

const ICON_MAP: Record<IconName, LucideIcon> = {
    'cpu': Cpu,
    'trending-up': TrendingUp,
    'terminal': Terminal,
};

// Tailwind safelist 회피 — 단일 시그니처 Mintlify brand-green #00d4a4 .
const CHAPTER_ACTIVE_CLASSES: Record<AccentName, string> = {
    green: 'bg-[#00d4a4]/10 text-[#00d4a4] border-[#00d4a4]/20',
};

interface Props {
    chaptersByBook: Record<Book, ChapterMeta[]>;
    isOpen?: boolean;             // 모바일 드로어 열림 상태
    onClose?: () => void;         // 모바일 드로어 닫기
    isDesktopHidden?: boolean;    // 데스크탑 사이드바 숨김 상태
    onCollapse?: () => void;      // 데스크탑 사이드바 접기
}

export default function Sidebar({ chaptersByBook, isOpen = false, onClose, isDesktopHidden = false, onCollapse }: Props) {
    const pathname = usePathname();
    const decodedPathname = decodeURIComponent(pathname);

    // URL 에서 활성 책 감지 — BOOKS.route 와 prefix 매칭
    const detectedBook: Book | null = useMemo(() => {
        for (const b of BOOKS) {
            if (decodedPathname.startsWith(`${b.route}/`)) return b.id;
        }
        return null;
    }, [decodedPathname]);

    // 사용자가 명시적으로 dropdown 으로 선택한 경우의 override.
    // URL 이동(pathname 변경) 시 자동 초기화 → 챕터 페이지 진입 시 그 책으로 자연 동기화.
    const [userOverride, setUserOverride] = useState<Book | null>(null);
    useEffect(() => {
        setUserOverride(null);
        onClose?.();
    }, [pathname, onClose]);
    const activeBook: Book = userOverride ?? detectedBook ?? BOOKS[0].id;

    const activeBookConfig = getBookMeta(activeBook);
    const chapters = chaptersByBook[activeBook] ?? [];
    const routePrefix = activeBookConfig.route;
    const ActiveIcon = ICON_MAP[activeBookConfig.iconKey];

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

    // activePart 가 바뀔 때만 자동 펴짐. 같은 챕터에서 사용자가 수동으로 닫으면 닫힌 채 유지.
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

    const handleBookChange = (book: Book) => {
        setUserOverride(book);
        const newChapters = chaptersByBook[book];
        const firstPart = newChapters[0]?.part;
        if (firstPart) setOpenParts(new Set([firstPart]));
    };

    return (
        <aside
            className={`w-72 h-full flex flex-col border-r border-zinc-800 glass-panel md:shrink-0 md:static fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isDesktopHidden ? 'md:hidden' : 'md:translate-x-0'}`}
        >
            <div className="relative">
                <Link
                    href="/"
                    onClick={onClose}
                    className="p-6 border-b border-zinc-800 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                    <div className="w-10 h-10 rounded-xl bg-[#00d4a4]/10 border border-[#00d4a4]/20 flex items-center justify-center text-[#00d4a4] shrink-0">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-zinc-200 whitespace-normal leading-snug">
                            반도체를 여행하는<br />세미에이아이를 위한<br />핸드북 시리즈
                        </h1>
                    </div>
                </Link>
                {/* 모바일 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="md:hidden absolute top-3 right-3 p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
                    aria-label="메뉴 닫기"
                >
                    <X size={18} />
                </button>
                {/* 데스크탑 접기 버튼 */}
                <button
                    onClick={onCollapse}
                    className="hidden md:block absolute top-3 right-3 p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
                    aria-label="사이드바 접기"
                >
                    <PanelLeftClose size={18} />
                </button>
            </div>

            {/* Book Selector — N 핸드북 자연 확장 dropdown */}
            <div className="px-4 py-3 border-b border-zinc-800">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        <ActiveIcon size={16} />
                    </div>
                    <select
                        value={activeBook}
                        onChange={(e) => handleBookChange(e.target.value as Book)}
                        aria-label="핸드북 선택"
                        className="w-full appearance-none bg-zinc-900/60 border border-zinc-700 hover:border-zinc-600 focus:border-zinc-500 rounded-lg pl-10 pr-9 py-2 text-sm text-zinc-200 cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    >
                        {BOOKS.map((book) => (
                            <option key={book.id} value={book.id} className="bg-zinc-900 text-zinc-200">
                                {book.fullLabel}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {Object.entries(groupedChapters).map(([part, partChapters]) => {
                    const isOpenPart = openParts.has(part);
                    return (
                        <div key={part} className="mb-2">
                            <button
                                onClick={() => togglePart(part)}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 transition-colors cursor-pointer"
                            >
                                {part}
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpenPart ? '' : '-rotate-90'}`} />
                            </button>
                            {isOpenPart && (
                                <ul className="space-y-1 mt-1">
                                    {partChapters.map((chapter) => {
                                        const isActive = decodedPathname === `${routePrefix}/${chapter.id}`;
                                        const accentClass = CHAPTER_ACTIVE_CLASSES[activeBookConfig.accent];
                                        return (
                                            <li key={chapter.id}>
                                                <Link
                                                    href={`${routePrefix}/${chapter.id}`}
                                                    onClick={onClose}
                                                    className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                                                        ? `${accentClass} font-medium border`
                                                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
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

            <div className="p-4 border-t border-zinc-800 space-y-1">
                <button
                    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
                >
                    <Search size={16} />
                    <span>검색</span>
                    <kbd className="ml-auto text-[10px] text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-700/50">⌘K</kbd>
                </button>
                <Link
                    href="/glossary"
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        pathname === '/glossary'
                            ? 'bg-[#00d4a4]/10 text-[#00d4a4] font-medium border border-[#00d4a4]/20'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                >
                    <BookText size={16} />
                    <span>용어 사전</span>
                </Link>
                <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
                >
                    <Settings size={16} />
                    <span>API Settings (BYOK)</span>
                </button>
            </div>
        </aside>
    );
}
