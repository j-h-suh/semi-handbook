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
  agent_sdk: {
    contentDir: path.join(process.cwd(), 'content', 'agent_sdk'),
    imageRewrite: '/content/images/agent_sdk/',
    excludePattern: (f) =>
      f === 'handbook-toc.md' || f === 'chapter-rubric.md' || f === 'writing-brief.md',
    getPartFromId: (id) => {
      if (id.startsWith('00_')) return '들어가며';
      if (id.startsWith('01_')) return 'Part 1: 첫 에이전트';
      if (id.startsWith('02_')) return 'Part 2: 능력 주기';
      if (id.startsWith('03_')) return 'Part 3: 앱으로 감싸기';
      if (id.startsWith('04_')) return 'Part 4: 상태를 로그로 표현';
      if (id.startsWith('05_')) return 'Part 5: 시간을 다루기';
      if (id.startsWith('06_')) return 'Part 6: 관측성';
      if (id.startsWith('07_')) return 'Part 7: 믿게 만들기';
      if (id.startsWith('08_')) return 'Part 8: 배포·부채';
      if (id.startsWith('09_')) return 'Part 9: 실전';
      if (id.startsWith('99_')) return '에필로그';
      return '기타';
    },
    wipChapters: new Set([
      '00_1_왜_롤백인가', '00_2_이_책의_자리', '00_3_환경과_첫_호출',
      '01_1_query_한_번의_호출', '01_2_대화_잇기', '01_3_options_지도와_결과',
      '02_1_내장_도구_고르기', '02_2_커스텀_도구', '02_3_mcp_연결',
      '03_1_에이전트_루프를_앱이', '03_2_인터페이스',
      '04_1_세션이_담지_않는_것', '04_2_event_append', '04_3_nodes와_events', '04_4_replay',
      '05_1_두_개의_시간축', '05_2_분기_만들기', '05_3_롤백_하기',
      '05_4_분기_공존과_트리_탐색', '05_5_정합과_함정',
      '06_1_hook으로_신호_뽑기', '06_2_비용과_토큰',
      '07_1_비결정_에이전트_테스트', '07_2_인수_조건을_코드로', '07_3_견고함과_안전',
      '08_1_내보내기', '08_2_다음을_위한_자리',
      '09_1_처음부터_끝까지', '99_에필로그',
    ]),
  },
  memory: {
    contentDir: path.join(process.cwd(), 'content', 'memory'),
    imageRewrite: '/content/images/memory/',
    excludePattern: (f) =>
      f === 'handbook-toc.md' || f === 'chapter-rubric.md' || f === 'writing-brief.md',
    getPartFromId: (id) => {
      if (id.startsWith('00_')) return '들어가며';
      if (id.startsWith('01_')) return 'Part 1: 기억의 유형';
      if (id.startsWith('02_')) return 'Part 2: 어떻게 담나 — 저장';
      if (id.startsWith('03_')) return 'Part 3: 어떻게 떠올리나 — 인출';
      if (id.startsWith('04_')) return 'Part 4: 잊기와 갱신';
      if (id.startsWith('05_')) return 'Part 5: 직접 만들어보기';
      if (id.startsWith('06_')) return 'Part 6: 프레임워크 지형';
      if (id.startsWith('07_')) return 'Part 7: Claude 위에서';
      if (id.startsWith('08_')) return 'Part 8: 실전';
      if (id.startsWith('09_')) return '에필로그';
      return '기타';
    },
    wipChapters: new Set([
      '00_1_컨텍스트_윈도우의_벽', '00_2_이_책의_자리', '00_3_기억의_큰_그림',
      '01_1_단기_컨텍스트', '01_2_장기_세_갈래', '01_3_무엇을_언제',
      '02_1_벡터_스토어', '02_2_지식_그래프', '02_3_폴리스토어',
      '03_1_유사도_검색', '03_2_시간_그래프_탐색', '03_3_하이브리드_재랭킹',
      '04_1_왜_잊어야_하나', '04_2_사실은_변한다', '04_3_두_개의_시간', '04_4_분석_staleness',
      '05_1_최소_메모리', '05_2_망각_갱신_얹기', '05_3_원리가_프레임워크로',
      '06_1_지형_한눈에', '06_2_대표_비교', '06_3_선택_프레임',
      '07_1_네이티브', '07_2_플러그인',
      '08_1_분석_에이전트_실전', '09_에필로그',
    ]),
  },
  llm: {
    contentDir: path.join(process.cwd(), 'content', 'llm'),
    imageRewrite: '/content/images/llm/',
    excludePattern: (f) =>
      f === 'handbook-toc.md' ||
      f === 'chapter-rubric.md' ||
      f === 'writing-brief.md' ||
      f === 'handbook-review.md',
    getPartFromId: (id) => {
      if (id.startsWith('00_')) return '들어가며';
      if (id.startsWith('01_')) return 'Part 1: 텍스트를 수로';
      if (id.startsWith('02_')) return 'Part 2: 순서를 기억하는 기계';
      if (id.startsWith('03_')) return 'Part 3: Attention의 등장';
      if (id.startsWith('04_')) return 'Part 4: 전환점';
      if (id.startsWith('05_')) return 'Part 5: Transformer 블록 쌓기';
      if (id.startsWith('06_')) return 'Part 6: Mini LLM 만들기';
      if (id.startsWith('07_')) return 'Part 7: 학습과 실험';
      if (id.startsWith('08_')) return '에필로그';
      return '기타';
    },
    wipChapters: new Set([
      '00_1_세_자료의_지도', '00_2_이_책이_답할_질문', '00_3_환경_설정',
      '01_1_토큰이란_무엇인가', '01_2_어휘와_인덱스', '01_3_임베딩', '01_4_Word2Vec의_직관',
      '02_1_순서_정보의_문제', '02_2_RNN의_구조', '02_3_LSTM의_등장',
      '02_4_LSTM_구현', '02_5_언어_모델로서의_LSTM',
      '03_1_seq2seq의_병목', '03_2_Bahdanau_Attention',
      '03_3_Query_Key_Value', '03_4_Attention_구현',
      '04_1_LSTM의_세_가지_한계', '04_2_병렬화가_왜_결정적인가',
      '04_3_Self-Attention의_직관', '04_4_Attention_Is_All_You_Need',
      '05_1_Scaled_Dot-Product_Attention', '05_2_Multi-Head_Attention',
      '05_3_Positional_Encoding', '05_4_Feed-Forward_Layer',
      '05_5_Residual_Connection과_Layer_Norm', '05_6_Transformer_블록_완성',
      '05_7_Encoder_vs_Decoder',
      '06_1_GPT_아키텍처_개요', '06_2_Causal_Self-Attention',
      '06_3_Mini_GPT_전체_구현', '06_4_텍스트_생성', '06_5_처음부터_끝까지',
      '07_1_손실과_Perplexity', '07_2_학습_루프',
      '07_3_하이퍼파라미터_실험', '07_4_스케일의_법칙',
      '08_1_에필로그',
    ]),
  },
  harness: {
    contentDir: path.join(process.cwd(), 'content', 'harness'),
    imageRewrite: '/content/images/harness/',
    excludePattern: (f) =>
      f === 'handbook-toc.md' || f === 'chapter-rubric.md' || f === 'writing-brief.md',
    getPartFromId: (id) => {
      if (id.startsWith('00_')) return '들어가며';
      if (id.startsWith('01_')) return 'Part 1: 하네스 해부학';
      if (id.startsWith('02_')) return 'Part 2: 1차 분류';
      if (id.startsWith('03_')) return 'Part 3: 축 1 — 상태';
      if (id.startsWith('04_')) return 'Part 4: 축 2 — 확장';
      if (id.startsWith('05_')) return 'Part 5: 축 3 — 메모리';
      if (id.startsWith('06_')) return 'Part 6: 축 4 — 협업';
      if (id.startsWith('07_')) return 'Part 7: 종합';
      if (id.startsWith('08_')) return '에필로그';
      return '기타';
    },
    wipChapters: new Set([
      '00_1_왜_비교하나', '00_2_이_책의_자리', '00_3_등장_5종',
      '01_1_하네스란_무엇인가', '01_2_다섯_가지_공통_부품', '01_3_비교의_자를_세우다',
      '02_1_코딩_하네스', '02_2_게이트웨이', '02_3_경계가_흐려진다',
      '03_1_파일_이벤트로그형', '03_2_서버_DB형', '03_3_계층형', '03_4_세_패턴_트레이드오프',
      '04_1_도구와_MCP', '04_2_ACP', '04_3_skill과_플러그인',
      '05_1_트랜스크립트_replay', '05_2_증류된_Memories', '05_3_자기개선',
      '06_1_서브에이전트', '06_2_코디네이터_모드', '06_3_에이전트_팀',
      '07_1_5종_종합표', '07_2_내_경우엔_무엇을', '07_3_직접_만든다면',
      '08_에필로그',
    ]),
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

export function getSortedAgentSdkChapters(): ChapterMeta[] {
  return getSortedChapters('agent_sdk');
}

export async function getAgentSdkChapterData(id: string): Promise<Chapter> {
  return getChapter('agent_sdk', id);
}

export function getSortedMemoryChapters(): ChapterMeta[] {
  return getSortedChapters('memory');
}

export async function getMemoryChapterData(id: string): Promise<Chapter> {
  return getChapter('memory', id);
}

export function getSortedLlmChapters(): ChapterMeta[] {
  return getSortedChapters('llm');
}

export async function getLlmChapterData(id: string): Promise<Chapter> {
  return getChapter('llm', id);
}

export function getSortedHarnessChapters(): ChapterMeta[] {
  return getSortedChapters('harness');
}

export async function getHarnessChapterData(id: string): Promise<Chapter> {
  return getChapter('harness', id);
}

/* ─── claude 챕터: 09_0 학습자 환경 설정 포함 모두 파일 스캔으로 자동 등록 ─── */
