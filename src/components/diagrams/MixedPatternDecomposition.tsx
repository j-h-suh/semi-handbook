'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type ViewId = 'mixed' | 'edge' | 'ring' | null;

const VIEWS: Record<Exclude<ViewId, null>, { label: string; sub: string; desc: string; color: string }> = {
    mixed: { label: 'Mixed (Edge + Ring)', sub: '혼합 패턴', desc: '에지와 링 패턴이 동시에 나타남. Single-label 분류로는 하나만 잡힘. Multi-label 또는 분해 필요.', color: '#ef4444' },
    edge:  { label: 'Edge 성분', sub: '코팅/CMP 에지 효과', desc: '분해된 Edge 성분. 스핀 코팅 에지 비드, CMP 에지 효과가 원인 → 에지 레시피 최적화.', color: '#f59e0b' },
    ring:  { label: 'Ring 성분', sub: '회전 공정 불균일', desc: '분해된 Ring 성분. 핫플레이트 온도 불균일, 스핀 건조 속도 차이가 원인 → 온도 보정.', color: '#06b6d4' },
};

const SVG_W = 520;
const SVG_H = 130;
const WAFER_R = 48;
const CY = SVG_H / 2;
const X_MIXED = 80;
const X_EDGE = 280;
const X_RING = 440;

function seeded(seed: number) {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function generateMixedDies() {
    const rng = seeded(42);
    const dies: { dx: number; dy: number; type: 'edge' | 'ring' | 'pass' }[] = [];
    const GRID = 11;
    for (let gy = -GRID; gy <= GRID; gy++) {
        for (let gx = -GRID; gx <= GRID; gx++) {
            const nx = gx / GRID;
            const ny = gy / GRID;
            const dist = Math.sqrt(nx * nx + ny * ny);
            if (dist > 1.0) continue;
            const r = rng();
            const isEdge = dist > 0.82 && r < 0.5;
            const isRing = Math.abs(dist - 0.55) < 0.1 && r < 0.5;
            dies.push({ dx: nx, dy: ny, type: isEdge ? 'edge' : isRing ? 'ring' : 'pass' });
        }
    }
    return dies;
}

export default function MixedPatternDecomposition() {
    const [hovered, setHovered] = useState<ViewId>(null);
    const isDim = (id: ViewId) => hovered !== null && hovered !== id;
    const dies = useMemo(() => generateMixedDies(), []);

    const renderWafer = (id: Exclude<ViewId, null>, cx: number) => {
        const info = VIEWS[id];
        const active = hovered === id;
        const showEdge = id === 'mixed' || id === 'edge';
        const showRing = id === 'mixed' || id === 'ring';

        return (
            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={cx - WAFER_R - 6} y={CY - WAFER_R - 6} width={WAFER_R * 2 + 12} height={WAFER_R * 2 + 28} fill="transparent" />
                <circle cx={cx} cy={CY} r={WAFER_R} fill="rgba(255,255,255,0.02)"
                    stroke={active ? `${info.color}60` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 0.5} />
                {dies.map((d, j) => {
                    const isVisible = (d.type === 'edge' && showEdge) || (d.type === 'ring' && showRing);
                    const color = d.type === 'edge' ? '#f59e0b' : d.type === 'ring' ? '#06b6d4' : 'rgba(34,197,94,0.4)';
                    return (
                        <rect key={j} x={cx + d.dx * (WAFER_R - 3) - 1.8} y={CY + d.dy * (WAFER_R - 3) - 1.8} width={3.6} height={3.6} rx={0.5}
                            fill={d.type !== 'pass' && isVisible ? color : 'rgba(34,197,94,0.4)'}
                            opacity={d.type !== 'pass' && isVisible ? (active ? 0.9 : 0.7) : 0.12} />
                    );
                })}
                <text x={cx} y={CY + WAFER_R + 14} textAnchor="middle" fill={active ? info.color : COLOR.textDim} fontSize={FONT.min} fontWeight={active ? 600 : 400}>{info.label}</text>
            </motion.g>
        );
    };

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                혼합 패턴 분해 — Edge + Ring
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                혼합 패턴을 개별 성분으로 분리하여 각 원인을 독립 추적
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 520 }}>
                    {/* Arrows */}
                    <text x={(X_MIXED + X_EDGE) / 2} y={CY + 4} textAnchor="middle" fill={COLOR.textDim} fontSize={16}>→</text>
                    <text x={(X_MIXED + X_EDGE) / 2} y={CY - 14} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min} opacity={0.5}>Decompose</text>
                    <text x={(X_EDGE + X_RING) / 2} y={CY + 4} textAnchor="middle" fill={COLOR.textDim} fontSize={16}>|</text>

                    {renderWafer('mixed', X_MIXED)}
                    {renderWafer('edge', X_EDGE)}
                    {renderWafer('ring', X_RING)}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: VIEWS[hovered].color, marginBottom: 2 }}>{VIEWS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{VIEWS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 웨이퍼를 호버하세요. 혼합 패턴을 분해하면 각 성분의 원인을 독립적으로 추적할 수 있습니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
