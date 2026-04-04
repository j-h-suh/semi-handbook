import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import matter from 'gray-matter';

/* ─── Book 타입 및 설정 ─── */

export type Book = 'semi' | 'stats';

interface BookConfig {
  contentDir: string;
  imageRewrite: string;        // images/ → 이 경로로 치환
  excludePattern: (file: string) => boolean;
  getPartFromId: (id: string) => string;
}

const BOOK_CONFIGS: Record<Book, BookConfig> = {
  semi: {
    contentDir: path.join(process.cwd(), 'content', 'semi'),
    imageRewrite: '/content/images/',
    excludePattern: (f) => f === 'handbook-toc.md',
    getPartFromId: (id) => {
      if (id.startsWith('00_')) return '들어가며';
      if (id.startsWith('01_')) return 'Part 1: 반도체 제조 기초';
      if (id.startsWith('02_')) return 'Part 2: 포토리소그래피 심화';
      if (id.startsWith('03_')) return 'Part 3: 수율 공학과 결함 분석';
      if (id.startsWith('04_')) return 'Part 4: AI와 반도체 제조';
      if (id.startsWith('05_')) return 'Part 5: 실무 레퍼런스';
      return '기타';
    },
  },
  stats: {
    contentDir: path.join(process.cwd(), 'content', 'stats'),
    imageRewrite: '/content/images/stats/',
    excludePattern: (f) => f.startsWith('00_기획'),
    getPartFromId: (id) => {
      if (id.startsWith('00_')) return '들어가며';
      if (id.startsWith('01_')) return 'Part 1: 기술통계';
      if (id.startsWith('02_')) return 'Part 2: 확률과 분포';
      if (id.startsWith('03_')) return 'Part 3: 추론통계';
      if (id.startsWith('04_')) return 'Part 4: 회귀와 모델링';
      if (id.startsWith('05_')) return 'Part 5: 베이지안 통계';
      if (id.startsWith('06_')) return 'Part 6: 실전 응용';
      return '기타';
    },
  },
};

export function getBookConfig(book: Book): BookConfig {
  return BOOK_CONFIGS[book];
}

/* ─── 공통 타입 ─── */

export interface ChapterMeta {
  id: string;
  title: string;
  part: string;
}

export interface GitCommit {
  date: string;
  message: string;
}

export interface Chapter extends ChapterMeta {
  content: string;
  lastUpdated: string | null;
  commitHistory: GitCommit[];
}

/* ─── 통합 함수 ─── */

function listMarkdownFiles(config: BookConfig): string[] {
  return fs.readdirSync(config.contentDir)
    .filter(f => f.endsWith('.md') && !config.excludePattern(f));
}

export function getSortedChapters(book: Book): ChapterMeta[] {
  const config = BOOK_CONFIGS[book];
  const fileNames = listMarkdownFiles(config);

  const chapters = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(config.contentDir, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    let title = id.replace(/_/g, ' ');
    const match = fileContents.match(/^#\s+(.*)/m);
    if (match) title = match[1].trim();

    return { id, title, part: config.getPartFromId(id), ...matterResult.data } as ChapterMeta;
  });

  return chapters.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export async function getChapter(book: Book, id: string): Promise<Chapter> {
  const config = BOOK_CONFIGS[book];
  const decodedId = decodeURIComponent(id);

  const files = listMarkdownFiles(config);
  const matchingFile = files.find(f => {
    const baseName = f.replace(/\.md$/, '');
    return baseName.normalize('NFC') === decodedId.normalize('NFC')
      || baseName.normalize('NFC') === id.normalize('NFC');
  });

  if (!matchingFile) {
    throw new Error(`Chapter file not found for id: ${id} (book: ${book})`);
  }

  const resolvedPath = path.join(config.contentDir, matchingFile);
  const fileContents = fs.readFileSync(resolvedPath, 'utf8');

  // Fix image paths: images/ → book-specific public path
  const processedContents = fileContents.replace(
    /\]\(\/?images\//g,
    `](${config.imageRewrite}`
  );

  const matterResult = matter(processedContents);

  let title = id.replace(/_/g, ' ');
  const match = processedContents.match(/^#\s+(.*)/m);
  if (match) title = match[1].trim();

  // Remove H1 title (rendered separately by MarkdownViewer)
  const contentWithoutTitle = matterResult.content.replace(/^#\s+(.*)/m, '');

  // Remove hardcoded prev/next chapter text
  const cleanContent = contentWithoutTitle
    .replace(/^\*다음 챕터:.*?\*$/gm, '')
    .replace(/^\*이전 챕터:.*?\*$/gm, '');

  // Pre-process **bold** → <strong> for CJK compatibility
  const fixedBoldContent = cleanContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Git commit history
  let lastUpdated: string | null = null;
  const commitHistory: GitCommit[] = [];
  try {
    const gitLog = execSync(
      `git log --follow --format="%ci|||%s" -- "${resolvedPath}"`,
      { cwd: process.cwd(), encoding: 'utf8' }
    ).trim();
    if (gitLog) {
      const lines = gitLog.split('\n').filter(Boolean);
      for (const line of lines) {
        const [dateStr, ...msgParts] = line.split('|||');
        const date = dateStr.trim().split(' ')[0];
        const message = msgParts.join('|||').trim();
        commitHistory.push({ date, message });
      }
      if (commitHistory.length > 0) lastUpdated = commitHistory[0].date;
    }
  } catch {
    // git not available
  }

  return {
    id,
    title,
    part: config.getPartFromId(id),
    content: fixedBoldContent,
    lastUpdated,
    commitHistory,
    ...matterResult.data,
  };
}

/* ─── 하위 호환 래퍼 (기존 consumer용) ─── */

export function getAllChapterIds() {
  const config = BOOK_CONFIGS.semi;
  return listMarkdownFiles(config).map(fileName => ({
    params: { id: fileName.replace(/\.md$/, '') },
  }));
}

export function getSortedChaptersData(): ChapterMeta[] {
  return getSortedChapters('semi');
}

export async function getChapterData(id: string): Promise<Chapter> {
  return getChapter('semi', id);
}

export function getSortedStatsChapters(): ChapterMeta[] {
  return getSortedChapters('stats');
}

export async function getStatsChapterData(id: string): Promise<Chapter> {
  return getChapter('stats', id);
}
