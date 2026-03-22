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
    chapters: ChapterMeta[];
}

export default function ClientLayout({ children, searchData, chapters }: Props) {
    return (
        <QnAPanelProvider>
            <Sidebar chapters={chapters} />
            {children}
            <QnAPanel />
            <SettingsModal />
            <SearchModal searchData={searchData} />
        </QnAPanelProvider>
    );
}
