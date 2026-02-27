'use client';

import { useEffect, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import mermaid from 'mermaid';
import { diagramRegistry } from './diagrams/diagramRegistry';

export default function MarkdownViewer({ title, contentHtml }: { title: string; contentHtml: string }) {
    const contentRef = useRef<HTMLDivElement>(null);
    const diagramRootsRef = useRef<Root[]>([]);

    useEffect(() => {
        if (!contentRef.current) return;

        // Wait for DOM to be fully painted after dangerouslySetInnerHTML update
        const rafId = requestAnimationFrame(() => {
            if (!contentRef.current) return;

            // ============================================================
            // 1. MERMAID: Find and render mermaid code blocks
            // ============================================================
            const mermaidCodeBlocks = contentRef.current.querySelectorAll('pre code.language-mermaid');

            mermaidCodeBlocks.forEach((codeEl) => {
                const preEl = codeEl.parentElement;
                if (!preEl || !preEl.parentElement) return;

                let diagramSource = codeEl.innerHTML || '';
                diagramSource = diagramSource
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&');

                const mermaidDiv = document.createElement('div');
                mermaidDiv.className = 'mermaid flex justify-center py-8 w-full overflow-x-auto text-sm';
                mermaidDiv.textContent = diagramSource;

                preEl.parentElement.replaceChild(mermaidDiv, preEl);
            });

            mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                securityLevel: 'loose',
                flowchart: { useMaxWidth: false },
            });

            mermaid.run({
                querySelector: '.mermaid',
            }).catch(e => console.error("Mermaid Render Error:", e));

            // ============================================================
            // 2. DIAGRAMS: Replace <img> tags with React components
            // ============================================================
            const images = contentRef.current.querySelectorAll('img');

            images.forEach((img) => {
                const src = img.getAttribute('src');
                if (!src) return;

                const DiagramComponent = diagramRegistry[src];
                if (!DiagramComponent) return;

                const container = document.createElement('div');
                container.className = 'diagram-interactive';

                img.parentElement?.replaceChild(container, img);

                const root = createRoot(container);
                root.render(<DiagramComponent />);
                diagramRootsRef.current.push(root);
            });
        });

        // Cleanup
        return () => {
            cancelAnimationFrame(rafId);
            const roots = [...diagramRootsRef.current];
            diagramRootsRef.current = [];
            setTimeout(() => {
                roots.forEach(root => root.unmount());
            }, 0);
        };
    }, [contentHtml]);

    return (
        <article className="max-w-4xl mx-auto w-full px-8 py-12 lg:px-12">
            <header className="mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    {title}
                </h1>
            </header>
            <div
                ref={contentRef}
                className="prose prose-slate prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
        </article>
    );
}
