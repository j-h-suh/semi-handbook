import { getSortedChaptersData } from '@/lib/markdown';
import glossary from '@/lib/glossary';
import HomeClient from '@/components/HomeClient';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export default function Home() {
    const chapters = getSortedChaptersData();

    // Stats
    const totalChapters = chapters.length;
    const totalTerms = glossary.length;
    const diagramDir = path.join(process.cwd(), 'src/components/diagrams');
    const totalDiagrams = fs.readdirSync(diagramDir).filter(f => f.endsWith('.tsx') && f !== 'diagramRegistry.ts' && f !== 'diagramRegistry.tsx').length;

    // Recent updates: get last commit date for each chapter file
    const contentDir = path.join(process.cwd(), 'content');
    const chaptersWithDates = chapters.map(ch => {
        try {
            const filePath = path.join(contentDir, `${ch.id}.md`);
            const date = execSync(`git log -1 --format=%ci -- "${filePath}"`, { encoding: 'utf-8' }).trim();
            return { id: ch.id, title: ch.title, lastUpdated: date };
        } catch {
            return { id: ch.id, title: ch.title, lastUpdated: '' };
        }
    }).filter(ch => ch.lastUpdated)
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 5);

    return (
        <main className="flex-1 w-full flex overflow-hidden relative">
            <HomeClient
                totalChapters={totalChapters}
                totalTerms={totalTerms}
                totalDiagrams={totalDiagrams}
                recentChapters={chaptersWithDates}
            />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </main>
    );
}
