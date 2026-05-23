'use client';

import { useState, useCallback, useEffect } from 'react';
import { Menu, PanelLeftOpen } from 'lucide-react';
import { QnAPanelProvider } from '@/components/QnAContext';
import QnAPanel from '@/components/QnAPanel';
import SettingsModal from '@/components/SettingsModal';
import SearchModal from '@/components/SearchModal';
import Sidebar from '@/components/Sidebar';
import type { SearchEntry } from '@/lib/searchIndex';
import type { Book } from '@/lib/books';
import type { ChapterMeta } from '@/lib/markdown';

interface Props {
    children: React.ReactNode;
    searchData: SearchEntry[];
    chaptersByBook: Record<Book, ChapterMeta[]>;
}

const STORAGE_KEY = 'sidebar-desktop-hidden';

export default function ClientLayout({ children, searchData, chaptersByBook }: Props) {
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [desktopHidden, setDesktopHidden] = useState(false);

    // localStorage 에서 초기 상태 복원 (클라이언트에서만)
    useEffect(() => {
        try {
            if (localStorage.getItem(STORAGE_KEY) === 'true') {
                setDesktopHidden(true);
            }
        } catch {
            // SSR / private mode 등에서 무시
        }
    }, []);

    // 상태 변경 시 저장
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, String(desktopHidden));
        } catch {
            // ignore
        }
    }, [desktopHidden]);

    // useCallback 으로 참조 안정화 — Sidebar 의 useEffect 의존성 안정화 목적
    const openMobileDrawer = useCallback(() => setMobileDrawerOpen(true), []);
    const closeMobileDrawer = useCallback(() => setMobileDrawerOpen(false), []);
    const collapseDesktopSidebar = useCallback(() => setDesktopHidden(true), []);
    const expandDesktopSidebar = useCallback(() => setDesktopHidden(false), []);

    return (
        <QnAPanelProvider>
            {/* 모바일 헤더 (md 미만에서만 표시) */}
            <header className="md:hidden fixed top-0 inset-x-0 z-30 h-14 flex items-center px-4 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
                <button
                    onClick={openMobileDrawer}
                    className="p-2 -ml-2 rounded-lg text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
                    aria-label="메뉴 열기"
                >
                    <Menu size={20} />
                </button>
                <span className="ml-2 text-sm font-bold text-zinc-200">SemiAI 안내서</span>
            </header>

            {/* 모바일 백드롭 */}
            {mobileDrawerOpen && (
                <div
                    onClick={closeMobileDrawer}
                    className="md:hidden fixed inset-0 bg-black/60 z-40"
                    aria-hidden="true"
                />
            )}

            {/* 데스크탑 사이드바 열기 버튼 — 숨김 상태일 때만 표시 */}
            {desktopHidden && (
                <button
                    onClick={expandDesktopSidebar}
                    className="hidden md:flex fixed top-4 left-4 z-30 p-2 rounded-lg text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors border border-zinc-800 bg-zinc-950/95 backdrop-blur"
                    aria-label="사이드바 열기"
                >
                    <PanelLeftOpen size={18} />
                </button>
            )}

            {/* 사이드바 — 데스크탑 고정/숨김, 모바일 드로어 */}
            <Sidebar
                chaptersByBook={chaptersByBook}
                isOpen={mobileDrawerOpen}
                onClose={closeMobileDrawer}
                isDesktopHidden={desktopHidden}
                onCollapse={collapseDesktopSidebar}
            />

            {/* 본문 영역 — 모바일 헤더 높이만큼 padding-top */}
            <main className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">
                {children}
            </main>

            <QnAPanel />
            <SettingsModal />
            <SearchModal searchData={searchData} />
        </QnAPanelProvider>
    );
}
