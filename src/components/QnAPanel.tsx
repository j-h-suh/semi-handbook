'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User } from 'lucide-react';
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

        // 선택된 모델 — localStorage 에 없으면 default
        const storedModel = localStorage.getItem(MODEL_STORAGE_KEY);
        const model = storedModel && MODEL_OPTIONS.some((m) => m.id === storedModel)
            ? storedModel
            : DEFAULT_MODEL_ID;

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
                    <h2 className="font-bold text-zinc-200">AI Assistant</h2>
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
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
                {messages.length === 0 && (
                    <div className="text-center text-zinc-500 my-10 text-sm">
                        문서를 읽다가 궁금한 점을 질문해보세요!<br />
                        (현재 보고 계시는 페이지의 내용을 AI가 참조하여 답변합니다.)
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#00b48a]/25 text-[#00d4a4]' : 'bg-[#00d4a4]/15 text-[#00d4a4]'
                            }`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'space-y-2'}`}>
                            {msg.role === 'model' && msg.isStreaming && !msg.content && (
                                <div className="px-4 py-3 rounded-2xl bg-zinc-800 rounded-tl-sm border border-white/5 flex items-center gap-2 text-zinc-400">
                                    <span className="text-xs">생각 중...</span>
                                </div>
                            )}

                            {msg.content && (
                                <div
                                    className={`px-4 py-2 rounded-2xl text-sm leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-pre:my-2 prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1 ${msg.role === 'user'
                                        ? 'bg-[#00b48a] text-white rounded-tr-sm'
                                        : 'bg-zinc-800 text-zinc-300 rounded-tl-sm border border-white/5'
                                        }`}
                                >
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
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
