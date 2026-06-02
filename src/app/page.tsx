import { getSortedChapters } from '@/lib/markdown';
import { BOOKS, type Book } from '@/lib/books';
import HomeClient from '@/components/HomeClient';
import path from 'path';
import fs from 'fs';

export default function Home() {
    const chapterCounts = Object.fromEntries(
        BOOKS.map((b) => [b.id, getSortedChapters(b.id).length]),
    ) as Record<Book, number>;

    // 책별 다이어그램 카운트 — registry 파일의 매핑 entry 직접 카운트
    const diagramDir = path.join(process.cwd(), 'src/components/diagrams');
    const countRegistryEntries = (file: string): number => {
        try {
            const txt = fs.readFileSync(path.join(diagramDir, file), 'utf-8');
            return (txt.match(/^\s+'\//gm) || []).length;
        } catch {
            return 0;
        }
    };
    const diagramCounts: Record<Book, number> = {
        semi: countRegistryEntries('semiRegistry.ts'),
        stats: countRegistryEntries('statsRegistry.ts'),
        claude: countRegistryEntries('claudeRegistry.ts'),
        agent_sdk: countRegistryEntries('agentSdkRegistry.ts'),
        memory: countRegistryEntries('memoryRegistry.ts'),
        llm: countRegistryEntries('llmRegistry.ts'),
        harness: countRegistryEntries('harnessRegistry.ts'),
    };

    // 각 책별 카드 footer — 챕터 + 다이어그램 통일
    const bookMetas: Record<Book, string> = Object.fromEntries(
        BOOKS.map((b) => [
            b.id,
            `${chapterCounts[b.id]}개 챕터 · ${diagramCounts[b.id]}개 다이어그램`,
        ]),
    ) as Record<Book, string>;

    return (
        <main className="h-full w-full flex overflow-hidden relative">
            <HomeClient bookMetas={bookMetas} />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00d4a4]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7cebcb]/8 rounded-full blur-3xl pointer-events-none" />
        </main>
    );
}
