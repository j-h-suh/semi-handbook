import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import matter from 'gray-matter';

/* ─── Book 타입 및 설정 ─── */

export type Book = 'semi' | 'stats' | 'claude';

// UI 메타 — Client 컴포넌트로 직렬화 가능한 _문자열 토큰_ 만.
// 아이콘은 IconName 으로, 색상은 AccentName 으로 받아 컴포넌트 측에서 매핑.
// (Tailwind safelist 회피를 위해 동적 클래스 빌더는 컴포넌트 측 lookup table 사용.)
export type IconName = 'cpu' | 'trending-up' | 'terminal';
export type AccentName = 'cyan' | 'emerald' | 'violet';

export interface BookConfig {
  // ─── 데이터 / SSR 자리 ───
  id: Book;
  contentDir: string;
  imageRewrite: string;
  excludePattern: (file: string) => boolean;
  getPartFromId: (id: string) => string;
  // ─── UI 메타 (Client 직렬화 가능) ───
  label: string;            // 사이드창 dropdown / 짧은 이름 (예: "반도체")
  fullLabel: string;        // 카드 제목 (예: "반도체 핸드북")
  subtitle: string;         // 카드 작은 부제 (예: "포토리소그래피 & AI 제조")
  description: string;      // 카드 본문 (한두 줄)
  landingHref: string;      // 카드 클릭 시 첫 챕터로
  route: string;            // 사이드창 prefix (예: '/semi')
  iconKey: IconName;
  accent: AccentName;
}

export const BOOKS: BookConfig[] = [
  {
    id: 'semi',
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
    label: '반도체',
    fullLabel: '반도체 핸드북',
    subtitle: '포토리소그래피 & AI 제조',
    description: '반도체 제조 공정부터 수율 공학, AI 적용까지 — 업계 선배가 전하는 실무 안내서',
    landingHref: '/semi/00_00_들어가며',
    route: '/semi',
    iconKey: 'cpu',
    accent: 'cyan',
  },
  {
    id: 'stats',
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
    label: '통계학',
    fullLabel: '통계학 핸드북',
    subtitle: '데이터로 일하는 모두를 위한 통계',
    description: '기술통계부터 베이지안, 인과추론까지 — 실무에서 바로 쓰는 통계학 가이드',
    landingHref: '/stats/00_00_들어가며',
    route: '/stats',
    iconKey: 'trending-up',
    accent: 'emerald',
  },
  {
    id: 'claude',
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
      if (id.startsWith('09_')) return 'Part 9: 미니 Claude Code';
      if (id.startsWith('10_')) return 'Part 10: 확장하기';
      if (id.startsWith('11_')) return '에필로그';
      return '기타';
    },
    label: '클로드',
    fullLabel: '클로드 핸드북',
    subtitle: 'AI 코딩 에이전트 심층 분석',
    description: '부트스트랩부터 멀티 에이전트까지 — Claude Code의 내부 구조를 해부하는 기술 핸드북',
    landingHref: '/claude/00_0_왜_이_책을_썼는가',
    route: '/claude',
    iconKey: 'terminal',
    accent: 'violet',
  },
];

// 배열에서 derived — id 로 lookup 할 때.
const BOOK_BY_ID: Record<Book, BookConfig> = Object.fromEntries(
  BOOKS.map((b) => [b.id, b]),
) as Record<Book, BookConfig>;

export function getBookConfig(book: Book): BookConfig {
  return BOOK_BY_ID[book];
}

// 하위 호환 — 기존 BOOK_CONFIGS 참조를 BOOK_BY_ID 로 alias
const BOOK_CONFIGS = BOOK_BY_ID;

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

export function getSortedClaudeChapters(): ChapterMeta[] {
  return getSortedChapters('claude');
}

export async function getClaudeChapterData(id: string): Promise<Chapter> {
  return getChapter('claude', id);
}

/* ─── mini_claude SETUP.md 전용 (챕터 폴더 밖의 부속 문서) ─── */

export async function getMiniClaudeSetupData(): Promise<Chapter> {
  const resolvedPath = path.join(
    process.cwd(),
    'content', 'claude_code', 'mini_claude', 'SETUP.md'
  );
  const fileContents = fs.readFileSync(resolvedPath, 'utf8');

  const matterResult = matter(fileContents);

  let title = 'mini_claude SETUP';
  const match = fileContents.match(/^#\s+(.*)/m);
  if (match) title = match[1].trim();

  const contentWithoutTitle = matterResult.content.replace(/^#\s+(.*)/m, '');
  const fixedBoldContent = contentWithoutTitle.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

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
    id: 'setup',
    title,
    part: 'Part 9: 미니 Claude Code',
    content: fixedBoldContent,
    lastUpdated,
    commitHistory,
    ...matterResult.data,
  };
}

/* ─── claude 사이드바: SETUP.md 를 Part 9 첫 자리(9.0) 로 끼워넣기 ─── */

export function getSortedClaudeChaptersWithSetup(): ChapterMeta[] {
  const chapters = getSortedChapters('claude');

  // SETUP.md 의 H1 에서 title 추출 (사이드바 표시용)
  let setupTitle = '9.0 학습자 환경 설정';
  try {
    const setupPath = path.join(
      process.cwd(),
      'content', 'claude_code', 'mini_claude', 'SETUP.md'
    );
    const setupContents = fs.readFileSync(setupPath, 'utf8');
    const match = setupContents.match(/^#\s+(.*)/m);
    if (match) setupTitle = match[1].trim();
  } catch {
    // SETUP.md 가 없으면 기본 title 그대로
  }

  const setupMeta: ChapterMeta = {
    id: 'setup',
    title: setupTitle,
    part: 'Part 9: 미니 Claude Code',
  };

  // 09_ 첫 자리 *직전* 에 삽입 — Part 9 그룹 안의 첫 항목이 됨
  const idx = chapters.findIndex(c => c.id.startsWith('09_'));
  if (idx === -1) return [...chapters, setupMeta];
  return [...chapters.slice(0, idx), setupMeta, ...chapters.slice(idx)];
}
