'use client';

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
}

export default function ClientLayout({ children, searchData, semiChapters, statsChapters, claudeChapters }: Props) {
    return (
        <QnAPanelProvider>
            <Sidebar semiChapters={semiChapters} statsChapters={statsChapters} claudeChapters={claudeChapters} />
            {children}
            <QnAPanel />
            <SettingsModal />
            <SearchModal searchData={searchData} />
        </QnAPanelProvider>
    );
}
