'use client';

import { QnAPanelProvider } from '@/components/QnAContext';
import QnAPanel from '@/components/QnAPanel';
import SettingsModal from '@/components/SettingsModal';
import SearchModal from '@/components/SearchModal';
import type { SearchEntry } from '@/lib/searchIndex';

interface Props {
    children: React.ReactNode;
    searchData: SearchEntry[];
}

export default function ClientLayout({ children, searchData }: Props) {
    return (
        <QnAPanelProvider>
            {children}
            <QnAPanel />
            <SettingsModal />
            <SearchModal searchData={searchData} />
        </QnAPanelProvider>
    );
}
