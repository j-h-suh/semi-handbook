// Client/Server 공통 — 핸드북 UI 메타. server-only 모듈 (fs/path/...) 의존성 _없음_.
// 4 번째 핸드북 추가 시 이 파일의 BOOKS 배열에 한 줄 + markdown.ts 의 SERVER_CONFIGS 에 한 줄.

export type Book = 'semi' | 'stats' | 'claude' | 'agent_sdk' | 'memory' | 'llm' | 'harness';

export type IconName = 'cpu' | 'trending-up' | 'terminal';
// 단일 시그니처 — Mintlify brand-green. 향후 다른 색 도입 시 union 확장.
export type AccentName = 'green';

export interface BookMeta {
  id: Book;
  label: string;            // 사이드창 dropdown / 짧은 이름 (예: "반도체")
  fullLabel: string;        // 카드 제목 (예: "반도체 핸드북")
  subtitle: string;         // 카드 작은 부제
  description: string;      // 카드 본문 (한두 줄)
  landingHref: string;      // 카드 클릭 시 첫 챕터로
  route: string;            // 사이드창 prefix (예: '/semi')
  iconKey: IconName;
  accent: AccentName;
}

export const BOOKS: BookMeta[] = [
  {
    id: 'semi',
    label: '반도체',
    fullLabel: '반도체 핸드북',
    subtitle: '포토리소그래피 & AI 제조',
    description: '반도체 제조 공정부터 수율 공학, AI 적용까지',
    landingHref: '/semi/00_00_들어가며',
    route: '/semi',
    iconKey: 'cpu',
    accent: 'green',
  },
  {
    id: 'stats',
    label: '통계학',
    fullLabel: '통계학 핸드북',
    subtitle: '데이터로 일하는 모두를 위한 통계',
    description: '기술통계부터 베이지안, 인과추론까지',
    landingHref: '/stats/00_00_들어가며',
    route: '/stats',
    iconKey: 'trending-up',
    accent: 'green',
  },
  {
    id: 'claude',
    label: '클로드',
    fullLabel: '클로드 핸드북',
    subtitle: 'AI 코딩 에이전트 심층 분석',
    description: '부트스트랩부터 멀티 에이전트까지',
    landingHref: '/claude/00_0_왜_이_책을_썼는가',
    route: '/claude',
    iconKey: 'terminal',
    accent: 'green',
  },
  {
    id: 'agent_sdk',
    label: 'Agent SDK',
    fullLabel: 'Agent SDK 핸드북',
    subtitle: '만드는 법은 안다, 이제 굴린다',
    description: 'Claude Agent SDK로 에이전트 앱을 빈 스크립트에서 프로덕션까지',
    landingHref: '/agent_sdk/00_1_왜_롤백인가',
    route: '/agent_sdk',
    iconKey: 'terminal',
    accent: 'green',
  },
  {
    id: 'memory',
    label: '메모리',
    fullLabel: '에이전트 메모리 핸드북',
    subtitle: '도구는 바뀐다, 기억의 원리는 남는다',
    description: '에이전트에 어떤 기억을 어떻게 설계할지 판단하고 직접 구현하기',
    landingHref: '/memory/00_1_컨텍스트_윈도우의_벽',
    route: '/memory',
    iconKey: 'trending-up',
    accent: 'green',
  },
  {
    id: 'llm',
    label: 'LLM',
    fullLabel: 'LLM 핸드북',
    subtitle: 'RNN으로 충분했다, 그런데 왜 Transformer인가',
    description: '사이토 1권 이후 — LSTM에서 Transformer로의 전환을 정면으로 답하며 Mini LLM 만들기',
    landingHref: '/llm/00_1_세_자료의_지도',
    route: '/llm',
    iconKey: 'trending-up',
    accent: 'green',
  },
  {
    id: 'harness',
    label: '하네스',
    fullLabel: '에이전트 하네스 핸드북',
    subtitle: '하네스는 뜨고 진다, 비교의 축은 남는다',
    description: '제품 카탈로그가 아니라 어느 하네스든 읽어내는 비교의 축',
    landingHref: '/harness/00_1_왜_비교하나',
    route: '/harness',
    iconKey: 'terminal',
    accent: 'green',
  },
];

const BOOK_BY_ID: Record<Book, BookMeta> = Object.fromEntries(
  BOOKS.map((b) => [b.id, b]),
) as Record<Book, BookMeta>;

export function getBookMeta(book: Book): BookMeta {
  return BOOK_BY_ID[book];
}
