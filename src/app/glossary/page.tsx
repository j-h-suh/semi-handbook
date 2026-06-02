import { getSortedChapters } from '@/lib/markdown';
import { BOOKS, type Book } from '@/lib/books';
import GlossaryClient from '@/components/GlossaryClient';

export default function GlossaryPage() {
    // 책별 chapterMap — "2.4" → { id: "02_04_xxx", title: "..." }
    const chapterMap: Record<Book, Record<string, { id: string; title: string }>> = {
        semi: {},
        stats: {},
        claude: {},
        agent_sdk: {},
        memory: {},
        llm: {},
        harness: {},
    };
    for (const book of BOOKS) {
        const chapters = getSortedChapters(book.id);
        for (const ch of chapters) {
            const match = ch.id.match(/^(\d+)_(\d+)/);
            if (match) {
                const key = `${parseInt(match[1])}.${parseInt(match[2])}`;
                chapterMap[book.id][key] = { id: ch.id, title: ch.title };
            }
        }
    }

    return (
        <main className="flex-1 w-full flex overflow-hidden relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
                <GlossaryClient chapterMap={chapterMap} />
            </div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00d4a4]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7cebcb]/8 rounded-full blur-3xl pointer-events-none" />
        </main>
    );
}
