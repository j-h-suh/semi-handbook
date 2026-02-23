'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface QnAPanelContextType {
    documentContext: string;
    setDocumentContext: (ctx: string) => void;
}

const QnAPanelContext = createContext<QnAPanelContextType>({
    documentContext: '',
    setDocumentContext: () => { },
});

export function QnAPanelProvider({ children }: { children: ReactNode }) {
    const [documentContext, setDocumentContext] = useState('');

    return (
        <QnAPanelContext.Provider value={{ documentContext, setDocumentContext }}>
            {children}
        </QnAPanelContext.Provider>
    );
}

export function useQnAContext() {
    return useContext(QnAPanelContext);
}
