import { getSortedChaptersData } from './markdown';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface SearchEntry {
    chapterId: string;
    chapterTitle: string;
    paragraph: string;
}

/**
 * Build search data: read all chapters and split into paragraphs.
 * Called at build time (server only).
 */
export function buildSearchData(): SearchEntry[] {
    const contentDirectory = path.join(process.cwd(), 'content');
    const chapters = getSortedChaptersData();
    const entries: SearchEntry[] = [];

    for (const ch of chapters) {
        const files = fs.readdirSync(contentDirectory).filter(f => f.endsWith('.md'));
        const matchingFile = files.find(f => {
            const baseName = f.replace(/\.md$/, '');
            return baseName.normalize('NFC') === ch.id.normalize('NFC');
        });
        if (!matchingFile) continue;

        const raw = fs.readFileSync(path.join(contentDirectory, matchingFile), 'utf8');
        const { content } = matter(raw);

        // Strip markdown formatting for cleaner search
        const cleaned = content
            .replace(/^#.*$/gm, '')           // headings
            .replace(/!\[.*?\]\(.*?\)/g, '')   // images
            .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // links → text only
            .replace(/```[\s\S]*?```/g, '')    // code blocks
            .replace(/\*\*(.*?)\*\*/g, '$1')   // bold
            .replace(/<strong>(.*?)<\/strong>/g, '$1')
            .replace(/\$\$[\s\S]*?\$\$/g, '')  // block math
            .replace(/\$[^$]+\$/g, '')         // inline math
            .replace(/---/g, '')               // hr
            .replace(/[|:]/g, ' ')             // table chars
            .trim();

        // Split into paragraphs (non-empty lines)
        const paragraphs = cleaned
            .split(/\n\n+/)
            .map(p => p.replace(/\n/g, ' ').trim())
            .filter(p => p.length > 15);  // skip very short lines

        for (const paragraph of paragraphs) {
            entries.push({
                chapterId: ch.id,
                chapterTitle: ch.title,
                paragraph,
            });
        }
    }

    return entries;
}
