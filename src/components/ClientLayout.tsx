'use client';

import { QnAPanelProvider } from '@/components/QnAContext';
import QnAPanel from '@/components/QnAPanel';
import SettingsModal from '@/components/SettingsModal';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <QnAPanelProvider>
            {children}
            <QnAPanel />
            <SettingsModal />
        </QnAPanelProvider>
    );
}
