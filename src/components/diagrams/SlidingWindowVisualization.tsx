'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 ─── */
type WinType = 'expanding' | 'sliding' | null;

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월'];

interface FoldDef { train: [number, number]; test: number; discarded?: [number, number] }

const EXPANDING: FoldDef[] = [
    { train: [0, 2], test: 3 },
    { train: [0, 3], test: 4 },
    { train: [0, 4], test: 5 },
];
const SLIDING: FoldDef[] = [
    { train: [0, 2], test: 3 },
    { train: [1, 3], test: 4, discarded: [0, 0] },
    { train: [2, 4], test: 5, discarded: [0, 1] },
];

const INFO: Record<Exclude<WinType, null>, { label: string; desc: string; color: string }> = {
    expanding: { label: 'Expanding Window', desc: '학습 데이터를 점점 늘린다. 데이터 양이 풍부하지만, 오래된 데이터가 현재 공정과 달라지면(PM, 레시피 변경) 모델을 오염시킬 수 있다.', color: '#3b82f6' },
    sliding:   { label: 'Sliding Window (권장)', desc: '최근 N개월만 사용한다. 비정상성(Non-Stationarity)에 자연 대응하며, 오래된 데이터를 자동으로 버린다. 반도체에서는 최근 2~4주가 적절.', color: '#22c55e' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 780;
const SVG_H = 280;
const CELL_W = 80;
const CELL_H = 24;
const ROW_GAP = 30;
const LABEL_X = 130;
const GRID_X = 230;
const SECTION_GAP = 30;

const TRAIN_COLOR = '#3b82f6';
const TEST_COLOR = '#ef4444';
const DISCARD_COLOR = 'rgba(255,255,255,0.04)';

export default function SlidingWindowVisualization() {
    const [hovered, setHovered] = useState<WinType>(null);
    const isDimmed = (id: WinType) => hovered !== null && hovered !== id;

    const renderSection = (type: Exclude<WinType, null>, folds: FoldDef[], startY: number) => {
        const info = INFO[type];
        const dimmed = isDimmed(type);

        return (
            <motion.g key={type}
                onMouseEnter={() => setHovered(type)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: dimmed ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                {/* 섹션 라벨 */}
                <text x={LABEL_X} y={startY + ROW_GAP} textAnchor="end" fill={hovered === type ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={700}>{info.label}</text>

                {folds.map((fold, fi) => {
                    const y = startY + fi * ROW_GAP;
                    return (
                        <g key={fi}>
                            {/* Fold 라벨 */}
                            <text x={LABEL_X + 10} y={y + CELL_H / 2 + 4} fill={COLOR.textDim} fontSize={FONT.min}>{fi + 1}회차</text>
                            {MONTHS.map((_, mi) => {
                                const x = GRID_X + mi * CELL_W;
                                const isTrain = mi >= fold.train[0] && mi <= fold.train[1];
                                const isTest = mi === fold.test;
                                const isDiscarded = fold.discarded && mi >= fold.discarded[0] && mi <= fold.discarded[1];
                                const fill = isTest ? TEST_COLOR : isTrain ? TRAIN_COLOR : isDiscarded ? DISCARD_COLOR : 'rgba(255,255,255,0.02)';
                                const opacity = isTest ? 0.7 : isTrain ? 0.5 : 1;
                                return (
                                    <rect key={mi} x={x} y={y} width={CELL_W - 4} height={CELL_H} rx={4}
                                        fill={fill} opacity={opacity} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
                                );
                            })}
                        </g>
                    );
                })}
            </motion.g>
        );
    };

    return (
        <div className="mt-8 mb-12" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Expanding vs Sliding Window
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                학습 데이터 범위 전략 — Sliding Window 권장
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 750 }}>
                    {/* 월 헤더 */}
                    {MONTHS.map((m, i) => (
                        <text key={i} x={GRID_X + i * CELL_W + (CELL_W - 4) / 2} y={14} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>{m}</text>
                    ))}

                    {renderSection('expanding', EXPANDING, 28)}
                    {renderSection('sliding', SLIDING, 28 + 3 * ROW_GAP + SECTION_GAP)}
                </svg>
            </div>

            {/* 범례 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 10, borderRadius: 3, background: TRAIN_COLOR, opacity: 0.5 }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>Train</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 10, borderRadius: 3, background: TEST_COLOR, opacity: 0.7 }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>Test</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 10, borderRadius: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>탈락 (Sliding)</span>
                </div>
            </div>

            {/* 툴팁 */}
            <div style={{ maxWidth: 700, margin: '12px auto 0', height: 48 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: INFO[hovered].color, marginBottom: 2 }}>{INFO[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{INFO[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 영역을 호버하여 Expanding/Sliding Window 전략을 비교하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
