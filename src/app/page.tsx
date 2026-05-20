import { getSortedChapters } from '@/lib/markdown';
import glossary from '@/lib/glossary';
import HomeClient from '@/components/HomeClient';
import path from 'path';
import fs from 'fs';

export default function Home() {
    const semiChapters = getSortedChapters('semi');
    const statsChapters = getSortedChapters('stats');
    const claudeChapters = getSortedChapters('claude');

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

    return (
        <main className="h-full w-full flex overflow-hidden relative">
            <HomeClient
                semiChapterCount={semiChapters.length}
                statsChapterCount={statsChapters.length}
                claudeChapterCount={claudeChapters.length}
                totalTerms={totalTerms}
                totalDiagrams={totalDiagrams}
            />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </main>
    );
}
