'use client';

import {
    Children,
    isValidElement,
    useState,
    type ReactNode,
} from 'react';
import { CodeBlock, LANG_LABEL } from './CodeBlock';

interface HastNode {
    type?: string;
    tagName?: string;
    properties?: { className?: string | string[] };
    children?: HastNode[];
    value?: string;
}

/**
 * `:::tabs ... :::` directive 내부의 `<pre><code class="language-xxx">` 블록을
 * 탭 UI 로 묶음. children 의 React 엘리먼트 props.node (HAST 노드) 를 사용해
 * 원본 코드와 언어를 추출 — react-markdown 의 컴포넌트 인터셉터로 type 이
 * 함수 참조로 바뀌어도 영향받지 않음.
 */
export function Tabs({ children }: { children: ReactNode }) {
    const items = Children.toArray(children).flatMap((child) => {
        if (!isValidElement(child)) return [];
        const props = child.props as { node?: HastNode };
        const node = props.node;
        if (!node || node.tagName !== 'pre') return [];

        const codeNode = node.children?.[0];
        if (!codeNode || codeNode.tagName !== 'code') return [];

        const cn = codeNode.properties?.className;
        const cnStr = Array.isArray(cn) ? cn.join(' ') : (cn ?? '');
        const match = /language-(\w+)/.exec(cnStr);
        const lang = match ? match[1] : 'text';

        const textNode = codeNode.children?.[0];
        const code = (textNode?.value ?? '').replace(/\n$/, '');
        const label = LANG_LABEL[lang] || lang || 'Code';

        return [{
            label,
            content: <CodeBlock code={code} lang={lang} inTabs />,
        }];
    });

    const [active, setActive] = useState(0);

    if (items.length === 0) return null;

    return (
        <div className="not-prose my-4 rounded-lg overflow-hidden border border-slate-800 bg-[#0d1117]">
            <div className="flex border-b border-slate-800 bg-slate-900/60 overflow-x-auto overflow-y-hidden">
                {items.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={`px-5 py-3 text-sm font-mono border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap ${active === i
                            ? 'border-[#00d4a4] text-[#00d4a4] bg-slate-800/40'
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            <div>{items[active]?.content}</div>
        </div>
    );
}
