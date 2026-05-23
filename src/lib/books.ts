// Client/Server 공통 — 안내서 UI 메타. server-only 모듈 (fs/path/...) 의존성 _없음_.
// 4 번째 안내서 추가 시 이 파일의 BOOKS 배열에 한 줄 + markdown.ts 의 SERVER_CONFIGS 에 한 줄.

export type Book = 'semi' | 'stats' | 'claude';

export type IconName = 'cpu' | 'trending-up' | 'terminal';
// 단일 시그니처 — Mintlify brand-green. 향후 다른 색 도입 시 union 확장.
export type AccentName = 'green';

export interface BookMeta {
  id: Book;
  label: string;            // 사이드창 dropdown / 짧은 이름 (예: "반도체")
  fullLabel: string;        // 카드 제목 (예: "반도체 안내서")
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
    fullLabel: '반도체 안내서',
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
    fullLabel: '통계학 안내서',
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
    fullLabel: '클로드 안내서',
    subtitle: 'AI 코딩 에이전트 심층 분석',
    description: '부트스트랩부터 멀티 에이전트까지',
    landingHref: '/claude/00_0_왜_이_책을_썼는가',
    route: '/claude',
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
