'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkUnwrapImages from 'remark-unwrap-images';
import remarkDirective from 'remark-directive';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import { diagramRegistry } from './diagrams/diagramRegistry';
import { FONT } from './diagrams/diagramTokens';
import { CodeBlock } from './CodeBlock';
import { Tabs } from './Tabs';
import { remarkTabs } from '@/lib/remarkTabs';
import type { GitCommit } from '@/lib/markdown';
import 'katex/dist/katex.min.css';

interface MarkdownViewerProps {
    title: string;
    content: string;
    lastUpdated?: string | null;
    commitHistory?: GitCommit[];
}

function extractTextFromChildren(node: React.ReactNode): string {
    if (node === null || node === undefined || typeof node === 'boolean') return '';
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractTextFromChildren).join('');
    if (typeof node === 'object' && 'props' in node) {
        const props = (node as React.ReactElement<{ children?: React.ReactNode }>).props;
        return extractTextFromChildren(props.children);
    }
    return '';
}

export default function MarkdownViewer({ title, content, lastUpdated, commitHistory }: MarkdownViewerProps) {
    const [showHistory, setShowHistory] = useState(false);
    const mermaidRef = useRef<HTMLDivElement>(null);

    // Re-initialize mermaid when content changes
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            flowchart: { useMaxWidth: true },
            fontSize: FONT.small,
            themeVariables: {
                background: 'transparent',
                mainBkg: '#1e3a5f',
                nodeBorder: '#3b82f6',
                clusterBkg: 'transparent',
                clusterBorder: 'transparent',
                primaryColor: '#1e3a5f',
                primaryTextColor: '#e2e8f0',
                primaryBorderColor: '#3b82f6',
                lineColor: '#64748b',
                secondaryColor: '#312e81',
                tertiaryColor: '#1e293b',
                edgeLabelBackground: 'transparent',
            },
        });

        // Find all mermaid divs and render them
        if (mermaidRef.current) {
            mermaid.run({
                querySelector: '.mermaid',
            }).catch(e => console.error("Mermaid Render Error:", e));
        }
    }, [content]);

    const [mainTitle, ...subtitleParts] = title.split('—');
    const subtitle = subtitleParts.join('—').trim();

    return (
        <article className="max-w-4xl mx-auto w-full px-4 py-8 md:px-8 md:py-12 lg:px-12" ref={mermaidRef}>
            <header className="mb-10 md:mb-12">
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                    {mainTitle.trim()}
                </h1>
                {subtitle && (
                    <p className="mt-3 text-lg sm:text-xl text-slate-400 font-normal tracking-tight">
                        {subtitle}
                    </p>
                )}
                {lastUpdated && (
                    <div className="mt-3">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="text-sm text-slate-500 hover:text-slate-400 transition-colors cursor-pointer"
                        >
                            최종 수정: {lastUpdated} {commitHistory && commitHistory.length > 0 && (
                                <span className="ml-1 text-slate-600">{showHistory ? '▲' : '▼'}</span>
                            )}
                        </button>
                        {showHistory && commitHistory && commitHistory.length > 0 && (
                            <ul className="mt-2 space-y-1 text-xs text-slate-600 border-l-2 border-slate-800 pl-3">
                                {commitHistory.slice(0, 5).map((c, i) => (
                                    <li key={i}>
                                        <span className="text-slate-500">{c.date}</span>
                                        <span className="mx-1.5 text-slate-700">—</span>
                                        <span>{c.message}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </header>

            <div className="prose prose-slate prose-invert max-w-none">
                <ReactMarkdown
                    remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath, remarkUnwrapImages, remarkDirective, remarkTabs]}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                    components={{
                        // 1. Intercept <img> to render custom diagram components
                        img: ({ src, alt, ...props }) => {
                            const imgSrc = src as string;
                            if (imgSrc && diagramRegistry[imgSrc]) {
                                const DiagramComponent = diagramRegistry[imgSrc];
                                return (
                                    <span className="diagram-interactive my-8 block w-full" aria-label={alt}>
                                        <DiagramComponent />
                                    </span>
                                );
                            }
                            // Fallback to standard img tag (we need native img here since it might be an external src)
                            // eslint-disable-next-line @next/next/no-img-element
                            return <img src={imgSrc} alt={alt} className="mx-auto block" {...props} />;
                        },

                        // 2a. Intercept <pre> to render fenced code blocks via Shiki
                        // (mermaid blocks are also fenced and handled here)
                        pre({ children, ...props }) {
                            const child = Array.isArray(children) ? children[0] : children;
                            if (child && typeof child === 'object' && 'props' in child) {
                                const codeProps = (child as React.ReactElement<{ className?: string; children?: React.ReactNode }>).props;
                                const className = codeProps.className || '';
                                const match = /language-(\w+)/.exec(className);
                                const codeText = extractTextFromChildren(codeProps.children).replace(/\n$/, '');

                                if (match && match[1] === 'mermaid') {
                                    return (
                                        <code className="mermaid flex justify-center py-8 w-full overflow-x-auto text-sm block">
                                            {codeText}
                                        </code>
                                    );
                                }

                                const lang = match ? match[1] : 'text';
                                return <CodeBlock code={codeText} lang={lang} />;
                            }
                            return <pre {...props}>{children}</pre>;
                        },

                        // 2b. Inline code — extract text to flatten any rogue elements
                        // (rehype-raw + GFM may convert ** in inline code to <strong>; flatten back to text)
                        code({ className, children, ...props }) {
                            const text = extractTextFromChildren(children);
                            return (
                                <code className={className} {...props}>
                                    {text}
                                </code>
                            );
                        },

                        // 2c. Blockquote (콜아웃) — 첫 글자 (💡/⚠️/⚙️) 인식 → data-variant.
                        // globals.css 의 .prose blockquote[data-variant="..."] 셀렉터로 종류별 색 적용.
                        blockquote({ children, ...props }) {
                            const text = extractTextFromChildren(children).trimStart();
                            let variant: 'tip' | 'warn' | 'note' | undefined;
                            if (text.startsWith('💡')) variant = 'tip';
                            else if (text.startsWith('⚠️') || text.startsWith('⚠')) variant = 'warn';
                            else if (text.startsWith('⚙️') || text.startsWith('⚙')) variant = 'note';
                            return <blockquote data-variant={variant} {...props}>{children}</blockquote>;
                        },

                        // 2d. `:::tabs` directive (via remarkTabs plugin → <div class="tabs-directive">)
                        div({ className, children, ...props }) {
                            if (typeof className === 'string' && className.includes('tabs-directive')) {
                                return <Tabs>{children}</Tabs>;
                            }
                            return <div className={className} {...props}>{children}</div>;
                        },

                        // 3. Intercept <p> to prevent invalid HTML nesting
                        // react-markdown wraps images in <p>, and rehype-raw can add nested <p> wrappers
                        // Any block-level element inside <p> is invalid HTML and causes hydration errors
                        p({ children, ...props }) {
                            const BLOCK_TAGS = new Set(['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'table', 'pre', 'blockquote', 'hr', 'section', 'figure', 'img']);

                            const hasBlock = (child: React.ReactNode): boolean => {
                                if (!child || typeof child !== 'object') return false;
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const el = child as any;
                                if (!el.props) return false;
                                // Check for our diagram wrapper
                                const cn = el.props.className || '';
                                if (typeof cn === 'string' && cn.includes('diagram-interactive')) return true;
                                // Check for block-level HTML tags
                                if (typeof el.type === 'string' && BLOCK_TAGS.has(el.type)) return true;
                                return false;
                            };

                            const shouldUnwrap = Array.isArray(children)
                                ? children.some(hasBlock)
                                : hasBlock(children);

                            if (shouldUnwrap) {
                                return <div {...props}>{children}</div>;
                            }
                            return <p {...props}>{children}</p>;
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </article>
    );
}
