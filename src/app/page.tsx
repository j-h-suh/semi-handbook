import { getSortedChapters } from '@/lib/markdown';
import { BOOKS, type Book } from '@/lib/books';
import glossary from '@/lib/glossary';
import HomeClient from '@/components/HomeClient';
import path from 'path';
import fs from 'fs';

export default function Home() {
    const chapterCounts = Object.fromEntries(
        BOOKS.map((b) => [b.id, getSortedChapters(b.id).length]),
    ) as Record<Book, number>;

    const totalTerms = glossary.length;

    const diagramDir = path.join(process.cwd(), 'src/components/diagrams');
    const semiDiagramDir = path.join(diagramDir, 'semi');
    const statsDiagramDir = path.join(diagramDir, 'stats');
    const countTsx = (dir: string) => {
        try { return fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).length; }
        catch { return 0; }
    };

    const allDiagramFiles = fs.readdirSync(diagramDir).filter(
        f => f.endsWith('.tsx') && !f.toLowerCase().includes('registry') && !f.toLowerCase().includes('tokens')
    );
    const totalDiagrams = allDiagramFiles.length + countTsx(semiDiagramDir) + countTsx(statsDiagramDir);

    // 각 책별 카드 footer — 4 번째 핸드북 추가 시 _이 자리에 한 줄_
    const bookMetas: Record<Book, string> = {
        semi: `${chapterCounts.semi}개 챕터 · ${totalTerms}개 용어`,
        stats: `${chapterCounts.stats}개 챕터 · ${totalDiagrams}개 다이어그램`,
        claude: `${chapterCounts.claude}개 챕터`,
    };

    return (
        <main className="h-full w-full flex overflow-hidden relative">
            <HomeClient bookMetas={bookMetas} />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00d4a4]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7cebcb]/8 rounded-full blur-3xl pointer-events-none" />
        </main>
    );
}
