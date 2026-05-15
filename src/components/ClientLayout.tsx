'use client';

import { useState, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { QnAPanelProvider } from '@/components/QnAContext';
import QnAPanel from '@/components/QnAPanel';
import SettingsModal from '@/components/SettingsModal';
import SearchModal from '@/components/SearchModal';
import Sidebar from '@/components/Sidebar';
import type { SearchEntry } from '@/lib/searchIndex';
import type { ChapterMeta } from '@/lib/markdown';

interface Props {
    children: React.ReactNode;
    searchData: SearchEntry[];
    semiChapters: ChapterMeta[];
    statsChapters: ChapterMeta[];
    claudeChapters: ChapterMeta[];
    execChapters: ChapterMeta[];
}

export default function ClientLayout({ children, searchData, semiChapters, statsChapters, claudeChapters, execChapters }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // useCallback 으로 참조 안정화 — 매 렌더마다 새 함수가 생성되면
    // Sidebar 의 useEffect 의존성이 매번 바뀌어 즉시 닫힘 버그 발생.
    const openSidebar = useCallback(() => setSidebarOpen(true), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    return (
        <QnAPanelProvider>
            {/* 모바일 헤더 (md 미만에서만 표시) */}
            <header className="md:hidden fixed top-0 inset-x-0 z-30 h-14 flex items-center px-4 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
                <button
                    onClick={openSidebar}
                    className="p-2 -ml-2 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-colors"
                    aria-label="메뉴 열기"
                >
                    <Menu size={20} />
                </button>
                <span className="ml-2 text-sm font-bold text-slate-200">세미에이아이 핸드북</span>
            </header>

            {/* 모바일 백드롭 */}
            {sidebarOpen && (
                <div
                    onClick={closeSidebar}
                    className="md:hidden fixed inset-0 bg-black/60 z-40"
                    aria-hidden="true"
                />
            )}

            {/* 사이드바 — 데스크탑 고정, 모바일 드로어 */}
            <Sidebar
                semiChapters={semiChapters}
                statsChapters={statsChapters}
                claudeChapters={claudeChapters}
                execChapters={execChapters}
                isOpen={sidebarOpen}
                onClose={closeSidebar}
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
