'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function SettingsModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [geminiKey, setGeminiKey] = useState('');

    useEffect(() => {
        // Listen for custom event to open settings
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-settings', handleOpen);

        // Load from localStorage
        const savedKey = localStorage.getItem('gemini-api-key');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (savedKey) setGeminiKey(savedKey);

        return () => window.removeEventListener('open-settings', handleOpen);
    }, []);

    const handleSave = () => {
        localStorage.setItem('gemini-api-key', geminiKey);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700/50 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-2">API Settings (BYOK)</h2>
                <p className="text-sm text-zinc-400 mb-6 line-height-relaxed">
                    Q&A 기능을 사용하려면 **Google Gemini API Key**가 필요합니다.
                    키는 당신의 브라우저 로컬 저장소에만 보관되며 어느 서버로도 전송되지 않습니다. 비용은 사용자 부담입니다.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#00d4a4] focus:ring-1 focus:ring-[#00d4a4] transition-all"
                        />
                        <p className="text-xs text-zinc-500 mt-2">
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#00d4a4] hover:underline">
                                Google AI Studio에서 무료 발급받기 &rarr;
                            </a>
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full mt-4 bg-[#00b48a] hover:bg-[#00d4a4] text-white font-medium py-2 rounded-lg transition-colors"
                    >
                        Save Key
                    </button>
                </div>
            </div>
        </div>
    );
}
