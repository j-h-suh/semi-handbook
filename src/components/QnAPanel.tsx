'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, ChevronDown, Check } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DEFAULT_MODEL_ID, MODEL_OPTIONS } from '@/lib/llm/models';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    isStreaming?: boolean;
}
import { useQnAContext } from './QnAContext';

const MODEL_STORAGE_KEY = 'chat-model';

export default function QnAPanel() {
    const { documentContext: currentDocumentContext } = useQnAContext();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [panelWidth, setPanelWidth] = useState(420);
    const isResizing = useRef(false);

    // 모델 선택 (헤더 dropdown)
    const [model, setModel] = useState<string>(DEFAULT_MODEL_ID);
    const [modelOpen, setModelOpen] = useState(false);
    const modelDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem(MODEL_STORAGE_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (stored && MODEL_OPTIONS.some((m) => m.id === stored)) setModel(stored);
    }, []);

    // dropdown 바깥 클릭 시 close
    useEffect(() => {
        if (!modelOpen) return;
        const onClick = (ev: MouseEvent) => {
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(ev.target as Node)) {
                setModelOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [modelOpen]);

    const handleModelSelect = (id: string) => {
        setModel(id);
        localStorage.setItem(MODEL_STORAGE_KEY, id);
        setModelOpen(false);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, isOpen]);

    // 패널이 열려 있는 동안 history entry 를 추가해 뒤로 가기로 닫을 수 있게 함
    useEffect(() => {
        if (!isOpen) return;
        window.history.pushState({ qnaOpen: true }, '');
        const handlePopState = () => setIsOpen(false);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isOpen]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        const startX = e.clientX;
        const startWidth = panelWidth;

        const onMouseMove = (ev: MouseEvent) => {
            if (!isResizing.current) return;
            const delta = startX - ev.clientX;
            setPanelWidth(Math.max(320, Math.min(700, startWidth + delta)));
        };
        const onMouseUp = () => {
            isResizing.current = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [panelWidth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');

        // 직전 메시지 history (placeholder / streaming 자리 제외)
        const history = messages
            .filter((m) => !m.isStreaming && m.content)
            .map((m) => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.content }));

        setMessages((prev) => [
            ...prev,
            { role: 'user', content: userMsg },
            { role: 'model', content: '', isStreaming: true },
        ]);

        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMsg,
                    context: currentDocumentContext,
                    history,
                    model,
                }),
            });

            if (!response.ok) {
                let errMsg = 'Failed to fetch response';
                try {
                    const err = await response.json();
                    errMsg = err.error || errMsg;
                } catch { }
                throw new Error(errMsg);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error('No response stream');

            let accumulatedText = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.type === 'text' && parsed.content) {
                            accumulatedText += parsed.content;
                        }
                    } catch {
                        accumulatedText += line;
                    }
                }

                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        role: 'model',
                        content: accumulatedText,
                        isStreaming: true,
                    };
                    return updated;
                });
            }

            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    isStreaming: false,
                };
                return updated;
            });

            const chapterMatch = decodeURIComponent(pathname).match(/\/chapter\/(.+)/);
            supabase.from('qna_logs').insert({
                chapter_id: chapterMatch ? chapterMatch[1] : null,
                question: userMsg,
                answer: accumulatedText,
            }).then(() => { });
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            console.error(error);
            setMessages((prev) => {
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].role === 'model' && updated[updated.length - 1].isStreaming) {
                    updated[updated.length - 1] = { role: 'model', content: `Error: ${errMsg}`, isStreaming: false };
                } else {
                    updated.push({ role: 'model', content: `Error: ${errMsg}` });
                }
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 md:top-3 md:right-3 md:bottom-auto z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 bg-[#00d4a4]/[0.08] border border-[#00d4a4]/25 text-[#00d4a4] rounded-lg hover:bg-[#00d4a4]/[0.15] hover:border-[#00d4a4]/40 transition-all"
                    aria-label="AI 도움 패널 열기"
                    title="AI 도움"
                >
                    <Bot size={16} />
                </button>
            </div>
        );
    }

    return (
        <div style={{ width: panelWidth }} className="h-full flex flex-col border-l border-white/5 glass-panel shrink-0 shadow-2xl relative z-40 transition-[background] bg-zinc-900/95">
            {/* Resize handle */}
            <div
                onMouseDown={handleMouseDown}
                className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#00d4a4]/30 transition-colors z-50"
            />
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bot className="text-[#00d4a4]" size={20} />
                    <div ref={modelDropdownRef} className="relative">
                        <button
                            onClick={() => setModelOpen(!modelOpen)}
                            className="flex items-center gap-1.5 text-sm font-bold text-zinc-200 hover:text-white transition-colors"
                            aria-label="모델 선택"
                        >
                            <span>{MODEL_OPTIONS.find((m) => m.id === model)?.label ?? model}</span>
                            <ChevronDown
                                size={14}
                                className={`text-zinc-400 transition-transform ${modelOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                        {modelOpen && (
                            <div className="absolute top-full left-0 mt-2 w-60 bg-zinc-800 border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50">
                                {MODEL_OPTIONS.map((opt) => {
                                    const isSelected = model === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleModelSelect(opt.id)}
                                            className={`w-full text-left px-3 py-2 transition-colors ${isSelected
                                                ? 'bg-[#00d4a4]/10 text-[#00d4a4]'
                                                : 'text-zinc-300 hover:bg-zinc-700/50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{opt.label}</span>
                                                {isSelected && <Check size={14} />}
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-0.5">{opt.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => window.history.back()}
                    className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                    aria-label="패널 닫기"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5 custom-scrollbar"
            >
                {messages.length === 0 && (
                    <div className="self-center my-auto text-center text-zinc-500 text-sm">
                        문서를 읽다가 궁금한 점을 질문해보세요!<br />
                        (현재 보고 계시는 페이지의 내용을 AI가 참조하여 답변합니다.)
                    </div>
                )}

                {messages.map((msg, idx) => (
                    msg.role === 'user' ? (
                        <div
                            key={idx}
                            className="self-end max-w-[80%] px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap break-words"
                        >
                            {msg.content}
                        </div>
                    ) : (
                        <div key={idx} className="self-stretch text-zinc-300 text-sm leading-relaxed">
                            {msg.isStreaming && !msg.content && <TypingDots />}
                            {msg.content && (
                                <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-pre:my-2 prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    )
                ))}
            </div>

            <div className="p-4 border-t border-white/5 bg-zinc-900/50">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading || messages.some((m) => m.isStreaming)}
                        placeholder="질문을 입력하세요..."
                        className="w-full bg-black/50 border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#00d4a4] focus:ring-1 focus:ring-[#00d4a4] transition-all disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || messages.some((m) => m.isStreaming) || !input.trim()}
                        className="absolute right-2 top-2 p-1.5 text-zinc-400 hover:text-[#00d4a4] hover:bg-white/5 rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        aria-label="질문 전송"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

/** paper-reader 결 typing dots — 첫 chunk 도착 전까지 표시. */
function TypingDots() {
    const dotStyle = (delay: string): React.CSSProperties => ({
        animation: 'typing-dot 1.3s ease-in-out infinite both',
        animationDelay: delay,
    });
    return (
        <span className="inline-flex items-center gap-1.5 py-1.5">
            <i className="block w-1.5 h-1.5 rounded-full bg-zinc-500" style={dotStyle('0s')} />
            <i className="block w-1.5 h-1.5 rounded-full bg-zinc-500" style={dotStyle('0.18s')} />
            <i className="block w-1.5 h-1.5 rounded-full bg-zinc-500" style={dotStyle('0.36s')} />
        </span>
    );
}
