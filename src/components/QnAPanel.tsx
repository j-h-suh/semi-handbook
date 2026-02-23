'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ChevronDown, ChevronRight, Brain } from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    thinking?: string;
}

export default function QnAPanel({ currentDocumentContext }: { currentDocumentContext: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [liveThinking, setLiveThinking] = useState(''); // Real-time thinking content
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, isThinking, liveThinking, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const apiKey = localStorage.getItem('gemini-api-key');
        if (!apiKey) {
            window.dispatchEvent(new CustomEvent('open-settings'));
            alert("API 키를 먼저 입력해주세요!");
            return;
        }

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);
        setIsThinking(true);
        setLiveThinking('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    message: userMsg,
                    context: currentDocumentContext,
                    history: messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
                })
            });

            if (!response.ok) {
                let errMsg = 'Failed to fetch response';
                try { const err = await response.json(); errMsg = err.error || errMsg; } catch { }
                throw new Error(errMsg);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error('No response stream');

            setIsLoading(false);

            let accumulatedText = '';
            let accumulatedThinking = '';
            let buffer = '';
            let messageAdded = false;

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
                        if (parsed.type === 'thinking') {
                            accumulatedThinking += parsed.content;
                            // Show thinking content live
                            setLiveThinking(accumulatedThinking);
                        } else if (parsed.type === 'text') {
                            if (isThinking) setIsThinking(false);
                            setLiveThinking('');
                            accumulatedText += parsed.content;

                            if (!messageAdded) {
                                messageAdded = true;
                                setMessages(prev => [...prev, {
                                    role: 'model',
                                    content: accumulatedText,
                                    thinking: accumulatedThinking
                                }]);
                            } else {
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = {
                                        role: 'model',
                                        content: accumulatedText,
                                        thinking: accumulatedThinking
                                    };
                                    return updated;
                                });
                            }
                        }
                    } catch {
                        accumulatedText += line;
                    }
                }
            }

            // Finalize: ensure message exists even if only thinking was received
            if (!messageAdded && accumulatedThinking) {
                setMessages(prev => [...prev, {
                    role: 'model',
                    content: accumulatedText,
                    thinking: accumulatedThinking
                }]);
            }

            setIsThinking(false);
            setLiveThinking('');
        } catch (error: any) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', content: `Error: ${error.message}` }]);
            setIsLoading(false);
            setIsThinking(false);
            setLiveThinking('');
        }
    };

    if (!isOpen) {
        return (
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-2xl shadow-xl hover:bg-cyan-500/20 transition-all backdrop-blur-md"
                >
                    <Bot size={20} />
                    <span className="font-semibold text-sm">AI Assistant</span>
                </button>
            </div>
        );
    }

    // Extract first line of thinking as a title/summary
    const getThinkingTitle = (thinking: string) => {
        const firstLine = thinking.split('\n').find(l => l.trim());
        if (!firstLine) return '사고 과정';
        return firstLine.length > 40 ? firstLine.slice(0, 40) + '…' : firstLine;
    };

    return (
        <div className="w-[380px] h-full flex flex-col border-l border-white/5 glass-panel shrink-0 shadow-2xl relative z-40 transition-all bg-zinc-900/95">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bot className="text-cyan-400" size={20} />
                    <h2 className="font-bold text-slate-200">AI Assistant</h2>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
                {messages.length === 0 && !isThinking && (
                    <div className="text-center text-slate-500 my-10 text-sm">
                        문서를 읽다가 궁금한 점을 질문해보세요!<br />
                        (현재 보고 계시는 페이지의 내용을 AI가 참조하여 답변합니다.)
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'
                            }`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'space-y-2'}`}>
                            {/* Thinking section (collapsible) */}
                            {msg.role === 'model' && msg.thinking && (
                                <ThinkingBlock
                                    title={getThinkingTitle(msg.thinking)}
                                    content={msg.thinking}
                                />
                            )}
                            {/* Main response */}
                            {msg.content && (
                                <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                    : 'bg-zinc-800 text-zinc-300 rounded-tl-sm border border-white/5'
                                    }`}>
                                    {msg.content}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Live thinking indicator with real-time content */}
                {isThinking && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                            <Bot size={16} />
                        </div>
                        <div className="max-w-[85%] space-y-2">
                            <LiveThinkingBlock content={liveThinking} />
                        </div>
                    </div>
                )}

                {isLoading && !isThinking && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                            <Bot size={16} />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-zinc-800 rounded-tl-sm border border-white/5 flex items-center gap-2 text-slate-400">
                            <Loader2 className="animate-spin" size={16} />
                            <span className="text-xs">연결 중...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/5 bg-zinc-900/50">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading || isThinking}
                        placeholder="질문을 입력하세요..."
                        className="w-full bg-black/50 border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || isThinking || !input.trim()}
                        className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

/** Live thinking block — shown during the thinking phase with real-time content */
function LiveThinkingBlock({ content }: { content: string }) {
    const [isExpanded, setIsExpanded] = useState(true); // Open by default while thinking

    // Get a summary title from the first meaningful line
    const title = (() => {
        if (!content) return '사고를 시작하는 중...';
        const firstLine = content.split('\n').find(l => l.trim());
        if (!firstLine) return '사고 중...';
        return firstLine.length > 35 ? firstLine.slice(0, 35) + '…' : firstLine;
    })();

    return (
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 overflow-hidden animate-pulse-subtle">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-purple-300 hover:bg-purple-500/10 transition-colors"
            >
                <Brain size={14} className="animate-pulse shrink-0" />
                <span className="truncate text-left flex-1 font-medium">{title}</span>
                {isExpanded ? <ChevronDown size={12} className="shrink-0" /> : <ChevronRight size={12} className="shrink-0" />}
            </button>
            {isExpanded && content && (
                <div className="px-3 pb-3 text-xs text-purple-200/50 leading-relaxed whitespace-pre-wrap border-t border-purple-500/10 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {content}
                </div>
            )}
        </div>
    );
}

/** Completed thinking block — collapsible, shown after response is done */
function ThinkingBlock({ title, content }: { title: string; content: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-purple-300 hover:bg-purple-500/10 transition-colors"
            >
                <Brain size={12} className="shrink-0" />
                <span className="truncate text-left flex-1">{title}</span>
                {isExpanded ? <ChevronDown size={12} className="shrink-0" /> : <ChevronRight size={12} className="shrink-0" />}
            </button>
            {isExpanded && (
                <div className="px-3 pb-3 text-xs text-purple-200/50 leading-relaxed whitespace-pre-wrap border-t border-purple-500/10 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {content}
                </div>
            )}
        </div>
    );
}
