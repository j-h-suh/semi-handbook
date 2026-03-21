'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 마크 데이터 ─── */
type MarkId = 'symmetric' | 'asymmetric' | null;

interface MarkInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const MARKS: Record<Exclude<MarkId, null>, MarkInfo> = {
    symmetric: {
        label: '대칭 마크 (이상적)', sub: 'Symmetric Grating',
        desc: '좌우 대칭인 이상적 마크. 광학 센서가 중심을 정확히 판단하여 측정된 Overlay가 실제 값과 일치. 정확한 보정이 가능.',
        color: '#3b82f6',
    },
    asymmetric: {
        label: '비대칭 마크 (CMP 후)', sub: 'Asymmetric Grating',
        desc: 'CMP/식각에 의해 한쪽 측벽이 더 깎여 비대칭. 광학 센서가 "중심"을 잘못 판단 → 가짜 Overlay 보고. 이 값으로 보정 시 오히려 Overlay 악화!',
        color: '#ef4444',
    },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 640;
const SVG_H = 260;
const PANEL_W = 270;
const GAP = 40;
const START_X = (SVG_W - PANEL_W * 2 - GAP) / 2;
const BASE_Y = 30;
const GRATING_H = 140;

/* ─── 격자 마크 렌더 ─── */
function GratingMark({ x, isAsymmetric }: { x: number; isAsymmetric: boolean }) {
    const cx = x + PANEL_W / 2;
    const barW = 18;
    const barGap = 28;
    const bars = [-2, -1, 0, 1, 2];
    const barH = 70;
    const baseY = BASE_Y + (GRATING_H - barH) / 2;

    return (
        <g>
            {/* 기판 */}
            <rect x={cx - 65} y={baseY + barH} width={130} height={14}
                fill="rgba(192,192,192,0.1)" stroke="rgba(192,192,192,0.15)" strokeWidth={0.8} />
            {/* 격자 바들 */}
            {bars.map(i => {
                const bx = cx + i * barGap - barW / 2;
                const asymH = isAsymmetric && i > 0 ? barH * (1 - i * 0.12) : barH;
                const skewX = isAsymmetric && i > 0 ? i * 2 : 0;
                return (
                    <rect key={i} x={bx + skewX} y={baseY + (barH - asymH)}
                        width={barW} height={asymH}
                        fill={isAsymmetric ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}
                        stroke={isAsymmetric ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)'}
                        strokeWidth={1} rx={1} />
                );
            })}
            {/* 중심선 */}
            <line x1={cx} y1={baseY - 8} x2={cx} y2={baseY + barH + 20}
                stroke="rgba(34,197,94,0.5)" strokeWidth={1} strokeDasharray="3 2" />
            <text x={cx} y={baseY - 12} textAnchor="middle" fill="rgba(34,197,94,0.6)" fontSize={FONT.min}>실제 중심</text>
            {/* 비대칭시 잘못된 중심 */}
            {isAsymmetric && (
                <>
                    <line x1={cx + 10} y1={baseY - 2} x2={cx + 10} y2={baseY + barH + 14}
                        stroke="rgba(239,68,68,0.6)" strokeWidth={1.2} strokeDasharray="4 2" />
                    <text x={cx + 10} y={baseY + barH + 30} textAnchor="start" fill="rgba(239,68,68,0.7)" fontSize={FONT.min}>측정 중심 (가짜 OVL)</text>
                    {/* 오차 화살표 */}
                    <line x1={cx + 2} y1={baseY + barH + 22} x2={cx + 8} y2={baseY + barH + 22}
                        stroke="rgba(239,68,68,0.5)" strokeWidth={1} />
                </>
            )}
        </g>
    );
}

export default function MarkAsymmetry() {
    const [hovered, setHovered] = useState<MarkId>(null);
    const isDimmed = (id: Exclude<MarkId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                마크 비대칭에 의한 측정 왜곡
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                대칭 마크 vs 비대칭 마크 — 가짜 Overlay 발생 메커니즘
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 640 }}>
                    {(['symmetric', 'asymmetric'] as Exclude<MarkId, null>[]).map((id, i) => {
                        const x = START_X + i * (PANEL_W + GAP);
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        const info = MARKS[id];
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.15 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={x} y={BASE_Y - 20} width={PANEL_W} height={GRATING_H + 70} fill="transparent" />
                                <GratingMark x={x} isAsymmetric={id === 'asymmetric'} />
                                <text x={x + PANEL_W / 2} y={BASE_Y + GRATING_H + 56}
                                    textAnchor="middle" fill={active ? info.color : COLOR.textMuted}
                                    fontSize={FONT.min} fontWeight={600}>
                                    {id === 'symmetric' ? '대칭 (이상적)' : '비대칭 (CMP 후)'}
                                </text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto', height: 58 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: MARKS[hovered].color, marginBottom: 2 }}>
                                {MARKS[hovered].label}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {MARKS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 마크를 호버하세요. CMP 후 비대칭이 된 마크에서 가짜 Overlay가 보고되는 메커니즘을 보여줍니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
