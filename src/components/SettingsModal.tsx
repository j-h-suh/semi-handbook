'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { MODEL_OPTIONS, DEFAULT_MODEL_ID } from '@/lib/llm';

const STORAGE_KEY = 'chat-model';

export default function SettingsModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-settings', handleOpen);

        const stored = localStorage.getItem(STORAGE_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (stored && MODEL_OPTIONS.some((m) => m.id === stored)) setSelectedModel(stored);

        return () => window.removeEventListener('open-settings', handleOpen);
    }, []);

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, selectedModel);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            setIsOpen(false);
        }, 700);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700/50 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                    aria-label="설정 닫기"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-2">Q&A 모델 선택</h2>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                    Vertex AI 자격증명은 서버의 <code className="text-[#7cebcb] text-xs">.env.local</code> +{' '}
                    <code className="text-[#7cebcb] text-xs">secrets/</code> 에 보관됩니다. 자격이 없으면 Q&A 가 작동하지 않으며,
                    원격 배포 환경에서는 의도적으로 비활성 상태입니다.
                </p>

                <div className="space-y-2 mb-6">
                    {MODEL_OPTIONS.map((option) => {
                        const isSelected = selectedModel === option.id;
                        return (
                            <button
                                key={option.id}
                                onClick={() => setSelectedModel(option.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                    isSelected
                                        ? 'border-[#00d4a4]/40 bg-[#00d4a4]/[0.08]'
                                        : 'border-zinc-700/50 bg-zinc-950/40 hover:border-zinc-600 hover:bg-zinc-900'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`font-medium ${isSelected ? 'text-[#00d4a4]' : 'text-zinc-200'}`}>
                                        {option.label}
                                    </span>
                                    {isSelected && <Check size={16} className="text-[#00d4a4]" />}
                                </div>
                                <p className="text-xs text-zinc-500">{option.description}</p>
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-[#00b48a] hover:bg-[#00d4a4] text-white font-medium py-2 rounded-lg transition-colors"
                >
                    {saved ? '저장됨' : '저장'}
                </button>
            </div>
        </div>
    );
}
