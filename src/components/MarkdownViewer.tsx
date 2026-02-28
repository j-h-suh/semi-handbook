'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkUnwrapImages from 'remark-unwrap-images';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import { diagramRegistry } from './diagrams/diagramRegistry';
import { FONT } from './diagrams/diagramTokens';
import 'katex/dist/katex.min.css';

interface MarkdownViewerProps {
    title: string;
    content: string;
}

export default function MarkdownViewer({ title, content }: MarkdownViewerProps) {
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

    return (
        <article className="max-w-4xl mx-auto w-full px-8 py-12 lg:px-12" ref={mermaidRef}>
            <header className="mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    {title}
                </h1>
            </header>

            <div className="prose prose-slate prose-invert max-w-none">
                <ReactMarkdown
                    remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath, remarkUnwrapImages]}
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

                        // 2. Intercept <code> to render mermaid blocks
                        code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const isMermaid = match && match[1] === 'mermaid';

                            if (isMermaid) {
                                return (
                                    <code className="mermaid flex justify-center py-8 w-full overflow-x-auto text-sm block">
                                        {String(children).replace(/\n$/, '')}
                                    </code>
                                );
                            }

                            // Let regular code blocks use default rendering
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
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
