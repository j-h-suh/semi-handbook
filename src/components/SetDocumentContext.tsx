'use client';

import { useEffect } from 'react';
import { useQnAContext } from './QnAContext';

/** 
 * Drop this into any page to set the current document context for the QnA panel.
 * It's invisible — just sets context on mount / when context changes.
 */
export default function SetDocumentContext({ context }: { context: string }) {
    const { setDocumentContext } = useQnAContext();

    useEffect(() => {
        setDocumentContext(context);
    }, [context, setDocumentContext]);

    return null;
}
