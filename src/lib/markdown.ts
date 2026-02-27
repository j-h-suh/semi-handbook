import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import gfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

const contentDirectory = path.join(process.cwd(), 'content');

export interface ChapterMeta {
  id: string;
  title: string;
  part: string;
}

export interface Chapter extends ChapterMeta {
  contentHtml: string;
}

// Helper to determine part from filename (e.g. 01_01_... -> Part 1)
function getPartFromId(id: string) {
  if (id.startsWith('00_')) return '들어가며';
  if (id.startsWith('01_')) return 'Part 1: 반도체 제조 기초';
  if (id.startsWith('02_')) return 'Part 2: 포토리소그래피 심화';
  if (id.startsWith('03_')) return 'Part 3: 수율 공학과 결함 분석';
  if (id.startsWith('04_')) return 'Part 4: AI와 반도체 제조';
  if (id.startsWith('05_')) return 'Part 5: 실무 레퍼런스';
  return '기타';
}

export function getAllChapterIds() {
  const fileNames = fs.readdirSync(contentDirectory).filter(file => file.endsWith('.md') && file !== 'handbook-toc.md');
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export function getSortedChaptersData(): ChapterMeta[] {
  const fileNames = fs.readdirSync(contentDirectory).filter(file => file.endsWith('.md') && file !== 'handbook-toc.md');

  const allChaptersData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(contentDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    // Even if no frontmatter exists, it's safe.
    const matterResult = matter(fileContents);

    // Extract title from first line of markdown if it starts with #
    let title = id.replace(/_/g, ' '); // fallback
    const match = fileContents.match(/^#\s+(.*)/m);
    if (match) {
      title = match[1].trim();
    }

    return {
      id,
      title,
      part: getPartFromId(id),
      ...matterResult.data,
    } as ChapterMeta;
  });

  // Sort by id (e.g. 01_01 < 01_02)
  return allChaptersData.sort((a, b) => {
    if (a.id < b.id) {
      return -1;
    } else if (a.id > b.id) {
      return 1;
    } else {
      return 0;
    }
  });
}

export async function getChapterData(id: string): Promise<Chapter> {
  const decodedId = decodeURIComponent(id);

  // Robust file matching: list directory and find by NFC-normalized comparison.
  // This handles macOS (NFD) vs Linux (NFC) Unicode normalization differences
  // that cause ENOENT errors on Vercel.
  const files = fs.readdirSync(contentDirectory).filter(f => f.endsWith('.md'));
  const matchingFile = files.find(f => {
    const baseName = f.replace(/\.md$/, '');
    return baseName.normalize('NFC') === decodedId.normalize('NFC')
      || baseName.normalize('NFC') === id.normalize('NFC');
  });

  if (!matchingFile) {
    throw new Error(`Chapter file not found for id: ${id} (decoded: ${decodedId})`);
  }

  const resolvedPath = path.join(contentDirectory, matchingFile);
  const fileContents = fs.readFileSync(resolvedPath, 'utf8');

  // Fix image paths manually before parsing if needed, e.g. mapping `images/` to `/content/images/`
  const processedContents = fileContents.replace(/\]\(\/?images\//g, '](/content/images/');

  const matterResult = matter(processedContents);

  let title = id.replace(/_/g, ' ');
  const match = processedContents.match(/^#\s+(.*)/m);
  if (match) {
    title = match[1].trim();
  }

  // Remove the H1 title so we don't render it twice
  const contentWithoutTitle = matterResult.content.replace(/^#\s+(.*)/m, '');

  // Remove hardcoded Next Chapter / Prev Chapter texts at the bottom of markdown files
  // These usually look like "*다음 챕터: 1.4 산화(Oxidation)와 증착(Deposition)*"
  const cleanContent = contentWithoutTitle.replace(/^\*다음 챕터:.*?\*$/gm, '').replace(/^\*이전 챕터:.*?\*$/gm, '');

  // Pre-process tricky bold syntax for CJK characters
  // Match **...** non-greedily and force them into HTML <strong> tags before remark parsing,
  // because remark breaks if ** touches Korean characters or parentheses without spaces.
  const fixedBoldContent = cleanContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(gfm, { singleTilde: false })
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(fixedBoldContent);

  const contentHtml = processedContent.toString();

  return {
    id,
    title,
    part: getPartFromId(id),
    contentHtml,
    ...matterResult.data,
  };
}
