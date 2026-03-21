'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 패널 데이터 ─── */
type PanelId = 'aligned' | 'misaligned' | null;

const PANELS: Record<Exclude<PanelId, null>, { label: string; sub: string; desc: string; color: string }> = {
    aligned: {
        label: 'OVL = 0 (완벽 정렬)', sub: '+I₁ = -I₁',
        desc: '두 격자가 정확히 겹치면 합성 격자가 대칭. +1차와 -1차 회절 강도가 동일하므로 ΔI = 0 → Overlay = 0.',
        color: '#22c55e',
    },
    misaligned: {
        label: 'OVL ≠ 0 (정렬 오차)', sub: '+I₁ ≠ -I₁',
        desc: '현재 층 격자가 Δx만큼 오프셋되면 합성 격자가 비대칭. +1차와 -1차 강도 차이 발생 → ΔI ∝ Overlay.',
        color: '#ef4444',
    },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 600;
const SVG_H = 220;
const PANEL_W = 260;
const GAP = 30;
const START_X = (SVG_W - PANEL_W * 2 - GAP) / 2;
const BASE_Y = 20;
const LAYER_H = 16;
const LAYER_GAP = 8;
const BAR_W = 10;
const BAR_COUNT = 7;

function GratingPanel({ x, isOffset }: { x: number; isOffset: boolean }) {
    const cx = x + PANEL_W / 2;
    const gratingW = 160;
    const gx = cx - gratingW / 2;
    const barGap = gratingW / BAR_COUNT;
    const topY = BASE_Y + 50;
    const offset = isOffset ? 8 : 0;

    return (
        <g>
            {/* 이전 층 격자 (하) */}
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <rect key={`ref-${i}`} x={gx + i * barGap + (barGap - BAR_W) / 2} y={topY + LAYER_H + LAYER_GAP}
                    width={BAR_W} height={LAYER_H} fill="rgba(255,140,0,0.25)" stroke="rgba(255,140,0,0.4)" strokeWidth={0.8} />
            ))}
            <text x={gx - 8} y={topY + LAYER_H + LAYER_GAP + LAYER_H / 2 + 3} textAnchor="end" fill="rgba(255,140,0,0.5)" fontSize={FONT.min}>이전 층</text>

            {/* 현재 층 격자 (상, offset 적용) */}
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <rect key={`cur-${i}`} x={gx + i * barGap + (barGap - BAR_W) / 2 + offset} y={topY}
                    width={BAR_W} height={LAYER_H} fill="rgba(65,105,225,0.25)" stroke="rgba(65,105,225,0.4)" strokeWidth={0.8} />
            ))}
            <text x={gx - 8} y={topY + LAYER_H / 2 + 3} textAnchor="end" fill="rgba(65,105,225,0.5)" fontSize={FONT.min}>현재 층</text>

            {/* Offset 표시 */}
            {isOffset && (
                <>
                    <line x1={cx} y1={topY - 8} x2={cx + offset} y2={topY - 8} stroke="rgba(239,68,68,0.5)" strokeWidth={1} />
                    <text x={cx + offset / 2} y={topY - 14} textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize={FONT.min}>Δx</text>
                </>
            )}

            {/* 회절 강도 표시 */}
            <text x={cx - 40} y={topY + LAYER_H * 2 + LAYER_GAP + 30} textAnchor="middle"
                fill={isOffset ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.4)'} fontSize={FONT.min}>
                +I₁ {isOffset ? '↑' : ''}
            </text>
            <text x={cx + 40} y={topY + LAYER_H * 2 + LAYER_GAP + 30} textAnchor="middle"
                fill={isOffset ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.4)'} fontSize={FONT.min}>
                -I₁ {isOffset ? '↓' : ''}
            </text>
            <text x={cx} y={topY + LAYER_H * 2 + LAYER_GAP + 46} textAnchor="middle"
                fill={isOffset ? '#ef4444' : '#22c55e'} fontSize={FONT.min} fontWeight={600}>
                {isOffset ? '+I₁ ≠ -I₁ → OVL ≠ 0' : '+I₁ = -I₁ → OVL = 0'}
            </text>
        </g>
    );
}

export default function DBOGratingCrossSection() {
    const [hovered, setHovered] = useState<PanelId>(null);
    const isDimmed = (id: Exclude<PanelId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                DBO 격자 마크 단면도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                대칭 (OVL=0) vs 비대칭 (OVL≠0) — ±1차 회절 강도 비교
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {(['aligned', 'misaligned'] as Exclude<PanelId, null>[]).map((id, i) => {
                        const x = START_X + i * (PANEL_W + GAP);
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        const info = PANELS[id];
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.15 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={x} y={BASE_Y} width={PANEL_W} height={SVG_H - BASE_Y - 30} fill="transparent" />
                                <text x={x + PANEL_W / 2} y={BASE_Y + 14} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={700}>
                                    {info.label}
                                </text>
                                <GratingPanel x={x} isOffset={id === 'misaligned'} />
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: PANELS[hovered].color, marginBottom: 2 }}>
                                {PANELS[hovered].label}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {PANELS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 패널을 호버하세요. 격자 오프셋에 따른 ±1차 회절 강도 변화를 비교합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
