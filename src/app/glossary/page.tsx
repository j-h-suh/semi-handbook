import { getSortedChaptersData } from '@/lib/markdown';
import GlossaryClient from '@/components/GlossaryClient';

export default function GlossaryPage() {
    const allChapters = getSortedChaptersData();

    // Build lookup: "2.4" → { id: "02_04_스캐너와_트랙", title: "..." }
    const chapterMap: Record<string, { id: string; title: string }> = {};
    for (const ch of allChapters) {
        const match = ch.id.match(/^(\d+)_(\d+)/);
        if (match) {
            const key = `${parseInt(match[1])}.${parseInt(match[2])}`;
            chapterMap[key] = { id: ch.id, title: ch.title };
        }
    }

    return (
        <main className="flex-1 w-full flex overflow-hidden relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
                <GlossaryClient chapterMap={chapterMap} />
            </div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </main>
    );
}
