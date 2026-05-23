'use client';

import { useEffect, useState } from 'react';
import type { Highlighter, BundledLanguage, BundledTheme } from 'shiki';
import {
    transformerNotationDiff,
    transformerNotationHighlight,
    transformerNotationFocus,
    transformerNotationErrorLevel,
} from '@shikijs/transformers';

const LANGS: BundledLanguage[] = [
    'typescript', 'tsx', 'javascript', 'jsx',
    'python', 'json', 'bash', 'shell',
    'yaml', 'toml', 'markdown', 'diff',
    'html', 'css', 'sql', 'rust', 'go',
    'java', 'c', 'cpp', 'csharp',
];

const THEME: BundledTheme = 'github-dark';

export const LANG_LABEL: Record<string, string> = {
    typescript: 'TypeScript',
    ts: 'TypeScript',
    tsx: 'TSX',
    javascript: 'JavaScript',
    js: 'JavaScript',
    jsx: 'JSX',
    python: 'Python',
    py: 'Python',
    bash: 'Bash',
    shell: 'Shell',
    sh: 'Shell',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    toml: 'TOML',
    markdown: 'Markdown',
    md: 'Markdown',
    diff: 'Diff',
    html: 'HTML',
    css: 'CSS',
    sql: 'SQL',
    rust: 'Rust',
    rs: 'Rust',
    go: 'Go',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    text: '',
};

const LANG_ALIAS: Record<string, BundledLanguage> = {
    ts: 'typescript',
    js: 'javascript',
    py: 'python',
    sh: 'bash',
    yml: 'yaml',
    md: 'markdown',
    rs: 'rust',
};

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
    if (!highlighterPromise) {
        highlighterPromise = (async () => {
            const { createHighlighter } = await import('shiki');
            return createHighlighter({
                themes: [THEME],
                langs: LANGS,
            });
        })();
    }
    return highlighterPromise;
}

interface CodeBlockProps {
    code: string;
    lang: string;
    filename?: string;
    inTabs?: boolean;
}

function autoDetectLang(code: string, lang: string): string {
    if (lang && lang !== 'text') return lang;
    const firstLine = code.split('\n').find((l) => l.trim().length > 0)?.trim() ?? '';
    if (firstLine.startsWith('$ ')) return 'bash';
    return lang || 'text';
}

export function CodeBlock({ code, lang, filename, inTabs = false }: CodeBlockProps) {
    const [html, setHtml] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const effectiveLang = autoDetectLang(code, lang);

    useEffect(() => {
        let cancelled = false;
        const resolvedLang = (LANG_ALIAS[effectiveLang] ?? effectiveLang) as BundledLanguage;
        const validLang = LANGS.includes(resolvedLang) ? resolvedLang : ('text' as BundledLanguage);

        getHighlighter()
            .then((highlighter) => {
                if (cancelled) return;
                try {
                    const result = highlighter.codeToHtml(code, {
                        lang: validLang,
                        theme: THEME,
                        transformers: [
                            transformerNotationDiff(),
                            transformerNotationHighlight(),
                            transformerNotationFocus(),
                            transformerNotationErrorLevel(),
                        ],
                    });
                    setHtml(result);
                } catch (e) {
                    console.error('Shiki highlight error:', e);
                    setHtml(null);
                }
            })
            .catch((e) => {
                if (!cancelled) console.error('Shiki load error:', e);
            });

        return () => {
            cancelled = true;
        };
    }, [code, effectiveLang]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Copy failed:', e);
        }
    };

    const label = filename || LANG_LABEL[effectiveLang] || (effectiveLang === 'text' ? '' : effectiveLang);

    // ASCII 다이어그램 (lang === 'text') 은 코드와 시각 구분 — 부드러운 surface 결로.
    const isAscii = effectiveLang === 'text';

    const innerContent = (
        <div className="relative group">
            <button
                onClick={handleCopy}
                className="absolute right-2 top-2 z-10 px-2 py-1 text-xs rounded bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                aria-label="코드 복사"
            >
                {copied ? '복사됨' : '복사'}
            </button>
            {html ? (
                <div
                    className="shiki-wrapper overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            ) : (
                <pre className="p-4 text-base text-zinc-300 overflow-x-auto m-0 font-mono leading-relaxed">
                    <code>{code}</code>
                </pre>
            )}
        </div>
    );

    if (inTabs) {
        return innerContent;
    }

    return (
        <div className={`not-prose my-4 rounded-lg overflow-hidden border ${
            isAscii
                ? 'border-zinc-800/50 bg-zinc-900/40'
                : 'border-zinc-800 bg-[#1c1c1e]'
        }`}>
            {label && (
                <div className="flex items-center justify-between px-5 py-3 text-sm font-mono bg-zinc-900/60 border-b border-zinc-800">
                    <span className="text-zinc-400">{label}</span>
                </div>
            )}
            {innerContent}
        </div>
    );
}
