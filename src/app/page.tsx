import { getSortedChapters } from '@/lib/markdown';
import glossary from '@/lib/glossary';
import HomeClient from '@/components/HomeClient';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

function getRecentChapters(book: 'semi' | 'stats', contentSubdir: string) {
    const chapters = getSortedChapters(book);
    const contentDir = path.join(process.cwd(), 'content', contentSubdir);
    return chapters.map(ch => {
        try {
            const filePath = path.join(contentDir, `${ch.id}.md`);
            const date = execSync(`git log -1 --format=%ci -- "${filePath}"`, { encoding: 'utf-8' }).trim();
            return { id: ch.id, title: ch.title, lastUpdated: date };
        } catch {
            return { id: ch.id, title: ch.title, lastUpdated: '' };
        }
    }).filter(ch => ch.lastUpdated)
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 3);
}

export default function Home() {
    const semiChapters = getSortedChapters('semi');
    const statsChapters = getSortedChapters('stats');

    const totalTerms = glossary.length;

    // Count diagram components
    const diagramDir = path.join(process.cwd(), 'src/components/diagrams');
    const semiDiagramDir = path.join(diagramDir, 'semi');
    const statsDiagramDir = path.join(diagramDir, 'stats');
    const countTsx = (dir: string) => {
        try { return fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).length; }
        catch { return 0; }
    };
    const semiDiagrams = countTsx(semiDiagramDir) + countTsx(diagramDir) - countTsx(semiDiagramDir); // legacy: root-level diagrams are semi
    const statsDiagrams = countTsx(statsDiagramDir);

    // Simpler count: all tsx in diagrams/ excluding registry and tokens
    const allDiagramFiles = [
        ...fs.readdirSync(diagramDir).filter(f => f.endsWith('.tsx') && !f.includes('Registry') && !f.includes('Tokens') && !f.includes('registry') && !f.includes('tokens')),
    ];
    const totalDiagrams = allDiagramFiles.length + countTsx(semiDiagramDir) + countTsx(statsDiagramDir);

    const recentSemiChapters = getRecentChapters('semi', 'semi');
    const recentStatsChapters = getRecentChapters('stats', 'stats');

    return (
        <main className="flex-1 w-full flex overflow-hidden relative">
            <HomeClient
                semiChapterCount={semiChapters.length}
                statsChapterCount={statsChapters.length}
                totalTerms={totalTerms}
                totalDiagrams={totalDiagrams}
                recentSemiChapters={recentSemiChapters}
                recentStatsChapters={recentStatsChapters}
            />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </main>
    );
}
