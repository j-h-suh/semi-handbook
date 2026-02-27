/**
 * 다이어그램 컴포넌트 공통 디자인 토큰
 *
 * 모든 다이어그램에서 이 값을 import하여 사용합니다.
 * 폰트 크기, 색상, 간격 등의 일관성을 유지하기 위한 규칙입니다.
 */

/* ─── 폰트 크기 (px) ─── */
export const FONT = {
    /** 차트/다이어그램 제목 */
    title: 18,
    /** 영문 부제 */
    subtitle: 14,
    /** 카드/단계 헤더, 툴팁 제목 */
    cardHeader: 15,
    /** 차트 축 라벨, 툴팁 보조 텍스트 */
    body: 14,
    /** 본문, 스펙 텍스트, 툴팁 본문 */
    small: 13,
    /** 최소 허용 크기 — 이보다 작은 텍스트는 사용 금지 */
    min: 12,
} as const;

/* ─── 색상 ─── */
export const COLOR = {
    /** 밝은 텍스트 (제목, 강조) */
    textBright: '#e4e4e7',
    /** 기본 텍스트 */
    text: '#d4d4d8',
    /** 보조 텍스트 */
    textMuted: '#a1a1aa',
    /** 비활성/힌트 텍스트 */
    textDim: '#71717a',

    /** 툴팁 배경 */
    tooltipBg: 'rgba(24, 24, 27, 0.95)',
    /** 기본 보더 */
    border: 'rgba(255,255,255,0.06)',
    /** 호버 시 카드 배경 */
    hoverBg: 'rgba(255,255,255,0.06)',
    /** 카드 기본 배경 */
    cardBg: 'rgba(255,255,255,0.02)',
} as const;

/* ─── 간격 ─── */
export const SPACING = {
    /** 다이어그램 상하 여백 */
    diagramMarginY: 32,  // = my-8
    /** 제목-부제 간격 */
    titleGap: 4,
    /** 부제-본문 간격 */
    subtitleGap: 16,
} as const;
