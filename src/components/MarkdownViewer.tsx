'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function MarkdownViewer({ title, contentHtml }: { title: string; contentHtml: string }) {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!contentRef.current) return;

        // 1. Find all rendered code blocks that represent a mermaid diagram
        // remark-html generates `<pre><code class="language-mermaid">`
        const mermaidCodeBlocks = contentRef.current.querySelectorAll('pre code.language-mermaid');

        mermaidCodeBlocks.forEach((codeEl) => {
            const preEl = codeEl.parentElement;
            if (!preEl || !preEl.parentElement) return;

            // Extract raw diagram syntax. remark-html might escape < and > as &lt; and &gt;
            // We use innerHTML but then decode the basic entities so mermaid gets raw text.
            let diagramSource = codeEl.innerHTML || '';
            diagramSource = diagramSource
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');

            // Create a div wrapper for mermaid
            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid flex justify-center py-8 w-full overflow-x-auto text-sm';
            mermaidDiv.textContent = diagramSource; // Using textContent here safely injects the unescaped raw string for Mermaid parser

            // Replace the <pre> block with our new div
            preEl.parentElement.replaceChild(mermaidDiv, preEl);
        });

        // 2. Initialize and Render Mermaid on the injected divs
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            flowchart: { useMaxWidth: false }, // Prevent shrinking to fit, allow horizontal scroll
        });

        mermaid.run({
            querySelector: '.mermaid',
        }).catch(e => console.error("Mermaid Render Error:", e));

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
