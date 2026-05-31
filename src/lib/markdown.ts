import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import matter from 'gray-matter';

import type { Book } from './books';
export type { Book } from './books';

/* ─── Server-only 자리 ─── */
// UI 메타 (label / accent / iconKey / route 등) 는 src/lib/books.ts 참조 — Client 도 import 가능.
// 이 파일은 server-only — fs / path / execSync / matter 의존성이 Client Bundle 에 섞이면 깨짐.

interface BookServerConfig {
  contentDir: string;
  imageRewrite: string;
  excludePattern: (file: string) => boolean;
  getPartFromId: (id: string) => string;
  wipChapters?: Set<string>;   // 집필/검증 진행 중 — 사이드바에 '공사중' 배지
}

const SERVER_CONFIGS: Record<Book, BookServerConfig> = {
  semi: {
    contentDir: path.join(process.cwd(), 'content', 'semi'),
    imageRewrite: '/content/semi/images/',
    excludePattern: (f) => f === 'handbook-toc.md' || f === 'handbook-review.md',
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
  claude: {
    contentDir: path.join(process.cwd(), 'content', 'claude_code'),
    imageRewrite: '/content/images/claude_code/',
    excludePattern: () => false,
    getPartFromId: (id) => {
      if (id.startsWith('00_0_')) return '들어가며';
      if (id.startsWith('00_')) return 'Part 0: 배경지식';
      if (id.startsWith('01_')) return 'Part 1: 부트스트랩';
      if (id.startsWith('02_')) return 'Part 2: 에이전트 루프';
      if (id.startsWith('03_')) return 'Part 3: 도구 시스템';
      if (id.startsWith('04_')) return 'Part 4: 슬래시 명령';
      if (id.startsWith('05_')) return 'Part 5: 터미널 UI';
      if (id.startsWith('06_')) return 'Part 6: 설정·권한·Hook';
      if (id.startsWith('07_')) return 'Part 7: 외부 연결';
      if (id.startsWith('08_')) return 'Part 8: 멀티 에이전트';
      if (id.startsWith('09_')) return 'Part 9: 미니 클로드';
      if (id.startsWith('10_')) return 'Part 10: 확장하기';
      if (id.startsWith('11_')) return '에필로그';
      return '기타';
    },
    // 본문은 보강됐으나 mini-claude 레포 add-up 검증이 아직 진행 중인 챕터.
    wipChapters: new Set(['10_7_메시지_큐', '10_8_에이전트_팀']),
  },
};

export function getBookConfig(book: Book): BookServerConfig {
  return SERVER_CONFIGS[book];
}

// 하위 호환 — 기존 BOOK_CONFIGS 참조 자리
const BOOK_CONFIGS = SERVER_CONFIGS;

/* ─── 공통 타입 ─── */

export interface ChapterMeta {
  id: string;
  title: string;
  part: string;
  wip?: boolean;   // 사이드바 '공사중' 배지 — wipChapters 에 속한 챕터
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

function listMarkdownFiles(config: BookServerConfig): string[] {
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

    return {
      id,
      title,
      part: config.getPartFromId(id),
      ...matterResult.data,
      // 파일명이 NFD 로 체크아웃되는 환경(macOS 등) 대비 — getChapter 와 동일 정규화.
      wip: config.wipChapters?.has(id.normalize('NFC')) ?? false,
    } as ChapterMeta;
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

export function getSortedClaudeChapters(): ChapterMeta[] {
  return getSortedChapters('claude');
}

export async function getClaudeChapterData(id: string): Promise<Chapter> {
  return getChapter('claude', id);
}

/* ─── claude 챕터: 09_0 학습자 환경 설정 포함 모두 파일 스캔으로 자동 등록 ─── */
