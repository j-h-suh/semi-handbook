'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 ─── */
type Side = 'positive' | 'negative' | null;

interface SideInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const SIDES: Record<Exclude<Side, null>, SideInfo> = {
    positive: {
        label: '포지티브 레지스트', sub: 'Positive — 노광부 제거',
        desc: '빛을 받은 부분의 용해도가 증가하여 현상에서 제거된다. 마스크와 동일한 패턴이 웨이퍼에 남는다. 해상도 우수, 현대 반도체의 절대적 주류.',
        color: '#3b82f6',
    },
    negative: {
        label: '네거티브 레지스트', sub: 'Negative — 노광부 잔류',
        desc: '빛을 받은 부분이 경화(Cross-linking)되어 현상에서 잔류한다. 마스크의 반전 패턴이 남는다. 팽윤(Swelling) 문제로 미세 패턴 한계. 패키징/MEMS에서 사용.',
        color: '#ef4444',
    },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 560;
const SVG_H = 150;
const PANEL_W = 230;
const GAP = 40;
const LEFT_X = (SVG_W - PANEL_W * 2 - GAP) / 2;
const RIGHT_X = LEFT_X + PANEL_W + GAP;

/* 단면 좌표 */
const STEP_W = 70;
const STEP_GAP = 8;
const MASK_Y = 20;
const MASK_H = 14;
const PR_Y = MASK_Y + MASK_H + 24;
const PR_H = 40;
const SUB_Y = PR_Y + PR_H;
const SUB_H = 20;
const BAR_W = 18;
const OPEN_W = 34;

function StepPanel({ x, w, type, active }: { x: number; w: number; type: 'positive' | 'negative'; active: boolean }) {
    const cx = x + w / 2;
    const accent = type === 'positive' ? '#3b82f6' : '#ef4444';
    const prColor = active ? `${accent}40` : `${accent}20`;
    const prStroke = active ? accent : `${accent}60`;

    /* 3 step positions */
    const steps = [
        { label: '마스크', cx: cx - STEP_W - STEP_GAP },
        { label: '노광', cx: cx },
        { label: '현상 후', cx: cx + STEP_W + STEP_GAP },
    ];

    return (
        <g>
            <text x={cx} y={MASK_Y - 6} textAnchor="middle" fill={active ? accent : COLOR.textDim} fontSize={FONT.min} fontWeight={600}>
                {type === 'positive' ? '포지티브' : '네거티브'}
            </text>

            {steps.map((step, si) => {
                const sx = step.cx - STEP_W / 2;

                return (
                    <g key={si}>
                        {/* 기판 */}
                        <rect x={sx} y={SUB_Y} width={STEP_W} height={SUB_H} rx={2}
                            fill="rgba(113,113,122,0.15)" stroke="rgba(113,113,122,0.3)" strokeWidth={0.5} />

                        {si === 0 && (
                            <>
                                <rect x={sx} y={PR_Y} width={STEP_W} height={PR_H} rx={1}
                                    fill={prColor} stroke={prStroke} strokeWidth={0.8} />
                                <text x={sx + STEP_W / 2} y={PR_Y + PR_H / 2 + 4} textAnchor="middle"
                                    fill={active ? accent : COLOR.textDim} fontSize={FONT.min}>
                                    {type === 'positive' ? '포지티브 PR' : '네거티브 PR'}
                                </text>
                                {/* 마스크 바 (차단) */}
                                <rect x={sx + 2} y={MASK_Y} width={BAR_W} height={MASK_H} rx={1}
                                    fill="rgba(113,113,122,0.4)" stroke="rgba(113,113,122,0.6)" strokeWidth={0.5} />
                                <rect x={sx + STEP_W - BAR_W - 2} y={MASK_Y} width={BAR_W} height={MASK_H} rx={1}
                                    fill="rgba(113,113,122,0.4)" stroke="rgba(113,113,122,0.6)" strokeWidth={0.5} />
                                {/* 투과 영역 */}
                                <text x={step.cx} y={MASK_Y + MASK_H / 2 + 3} textAnchor="middle"
                                    fill="rgba(251,191,36,0.5)" fontSize={FONT.min}>↓</text>
                            </>
                        )}

                        {si === 1 && (
                            <>
                                {/* 노광 단계: PR + 빛 표시 */}
                                <rect x={sx} y={PR_Y} width={STEP_W} height={PR_H} rx={1}
                                    fill={prColor} stroke={prStroke} strokeWidth={0.8} />
                                {/* 노광 영역 표시 */}
                                <rect x={sx + BAR_W + 2} y={PR_Y} width={OPEN_W} height={PR_H} rx={0}
                                    fill="rgba(251,191,36,0.15)" stroke="none" />
                                {/* 빛 화살표 */}
                                <line x1={step.cx} y1={MASK_Y + MASK_H} x2={step.cx} y2={PR_Y - 2}
                                    stroke="rgba(251,191,36,0.5)" strokeWidth={1} />
                                <text x={step.cx} y={MASK_Y + MASK_H / 2 + 3} textAnchor="middle"
                                    fill="rgba(251,191,36,0.5)" fontSize={FONT.min}>hν</text>
                            </>
                        )}

                        {si === 2 && (
                            <>
                                {/* 현상 후: positive=중앙 빈, negative=중앙만 남음 */}
                                {type === 'positive' ? (
                                    <>
                                        <rect x={sx} y={PR_Y} width={BAR_W + 2} height={PR_H} rx={1}
                                            fill={prColor} stroke={prStroke} strokeWidth={0.8} />
                                        <rect x={sx + STEP_W - BAR_W - 2} y={PR_Y} width={BAR_W + 2} height={PR_H} rx={1}
                                            fill={prColor} stroke={prStroke} strokeWidth={0.8} />
                                    </>
                                ) : (
                                    <rect x={sx + BAR_W + 2} y={PR_Y} width={OPEN_W} height={PR_H} rx={1}
                                        fill={prColor} stroke={prStroke} strokeWidth={0.8} />
                                )}
                            </>
                        )}

                        {/* 단계 라벨 */}
                        <text x={step.cx} y={SUB_Y + SUB_H + 14} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>{step.label}</text>
                    </g>
                );
            })}

            {/* 화살표 연결 */}
            {[0, 1].map(i => {
                const fromCx = steps[i].cx + STEP_W / 2 + 2;
                const toCx = steps[i + 1].cx - STEP_W / 2 - 2;
                const ay = PR_Y + PR_H / 2;
                return (
                    <g key={i}>
                        <line x1={fromCx} y1={ay} x2={toCx} y2={ay}
                            stroke={COLOR.textDim} strokeWidth={0.8} />
                        <polygon points={`${toCx - 4},${ay - 3} ${toCx},${ay} ${toCx - 4},${ay + 3}`}
                            fill={COLOR.textDim} />
                    </g>
                );
            })}
        </g>
    );
}

export default function PositiveVsNegativeResist() {
    const [hovered, setHovered] = useState<Side>(null);
    const isDimmed = (id: Exclude<Side, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                포지티브 vs 네거티브 레지스트
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Positive vs Negative Photoresist — Development Result
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 560)} style={{ maxWidth: '100%' }}>
                    <motion.g onMouseEnter={() => setHovered('positive')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('positive') ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                        <rect x={LEFT_X} y={0} width={PANEL_W} height={SVG_H} fill="transparent" />
                        <StepPanel x={LEFT_X} w={PANEL_W} type="positive" active={hovered === 'positive'} />
                    </motion.g>

                    <motion.g onMouseEnter={() => setHovered('negative')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('negative') ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                        <rect x={RIGHT_X} y={0} width={PANEL_W} height={SVG_H} fill="transparent" />
                        <StepPanel x={RIGHT_X} w={PANEL_W} type="negative" active={hovered === 'negative'} />
                    </motion.g>

                    <text x={SVG_W / 2} y={PR_Y + PR_H / 2 + 4} textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize={20} fontWeight={700}>vs</text>
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: SIDES[hovered].color, marginBottom: 2 }}>
                                {SIDES[hovered].label} — {SIDES[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {SIDES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 패널을 호버하여 비교하세요. 포지티브는 노광부가 제거되고, 네거티브는 노광부가 잔류합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
