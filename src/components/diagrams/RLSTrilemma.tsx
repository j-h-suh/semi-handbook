'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 꼭짓점 데이터 ─── */
type VertexId = 'R' | 'L' | 'S' | null;

interface VertexInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const VERTICES: Record<Exclude<VertexId, null>, VertexInfo> = {
    R: { label: 'Resolution (해상도)', sub: '미세 패턴 구현 능력', desc: 'EUV에서 목표하는 미세 패턴(~10nm 이하)을 정확히 구현하는 능력. 레지스트를 얇게 하면 향상되지만, 패턴 붕괴 위험 증가.', color: '#3b82f6' },
    L: { label: 'LER/LWR (거칠기)', sub: '패턴 에지 거칠기', desc: '패턴 가장자리의 매끈함. 광자 수가 적으면 Poisson 분포에 의한 Shot Noise가 커져 LER 악화. LER을 줄이려면 더 많은 Dose 필요.', color: '#22c55e' },
    S: { label: 'Sensitivity (감도)', sub: '노광 감도·처리량', desc: '적은 노광 에너지로도 반응하는 능력. 감도가 높으면 처리량(throughput) 증가하지만, 광자 수가 줄어 LER 악화.', color: '#f59e0b' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 400;
const SVG_H = 290;
const CX = SVG_W / 2;

/* 삼각형 좌표 (정삼각형) */
const TRI_SIZE = 120;
const TRI_CY = SVG_H / 2 + 20;
const TOP = { x: CX, y: TRI_CY - TRI_SIZE };
const BL = { x: CX - TRI_SIZE * Math.cos(Math.PI / 6), y: TRI_CY + TRI_SIZE * Math.sin(Math.PI / 6) };
const BR = { x: CX + TRI_SIZE * Math.cos(Math.PI / 6), y: TRI_CY + TRI_SIZE * Math.sin(Math.PI / 6) };

const VERTEX_POS: Record<Exclude<VertexId, null>, { x: number; y: number }> = {
    R: TOP,
    L: BL,
    S: BR,
};

/* 변 중점에 라벨 */
const EDGE_LABELS = [
    { mid: { x: (TOP.x + BL.x) / 2 - 55, y: (TOP.y + BL.y) / 2 }, text: '해상도↑ → LER↑' },
    { mid: { x: (BL.x + BR.x) / 2, y: (BL.y + BR.y) / 2 + 24 }, text: 'LER↓ → Dose↑' },
    { mid: { x: (BR.x + TOP.x) / 2 + 55, y: (BR.y + TOP.y) / 2 }, text: '감도↑ → 해상도↓' },
];

export default function RLSTrilemma() {
    const [hovered, setHovered] = useState<VertexId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                RLS 트릴레마
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                EUV Resist — Resolution, LER, Sensitivity Trade-off
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={340} style={{ maxWidth: '100%' }}>
                    {/* 삼각형 */}
                    <polygon points={`${TOP.x},${TOP.y} ${BL.x},${BL.y} ${BR.x},${BR.y}`}
                        fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.2)" strokeWidth={1.5} />

                    {/* 중심 라벨 */}
                    <text x={CX} y={TRI_CY - 8} textAnchor="middle"
                        fill="rgba(239,68,68,0.5)" fontSize={FONT.cardHeader} fontWeight={700}>RLS</text>
                    <text x={CX} y={TRI_CY + 10} textAnchor="middle"
                        fill="rgba(239,68,68,0.3)" fontSize={FONT.min}>Trade-off</text>
                    <text x={CX} y={TRI_CY + 28} textAnchor="middle"
                        fill={COLOR.textDim} fontSize={FONT.min}>광자 통계가 근본 원인</text>

                    {/* 변 라벨 */}
                    {EDGE_LABELS.map((e, i) => (
                        <text key={i} x={e.mid.x} y={e.mid.y} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>{e.text}</text>
                    ))}

                    {/* 꼭짓점 */}
                    {(['R', 'L', 'S'] as const).map(id => {
                        const pos = VERTEX_POS[id];
                        const info = VERTICES[id];
                        const active = hovered === id;
                        const dimmed = hovered !== null && hovered !== id;
                        const labelOffset = id === 'R' ? { dx: 0, dy: -24 } : id === 'L' ? { dx: -20, dy: 30 } : { dx: 20, dy: 30 };

                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                {/* 히트 영역 */}
                                <circle cx={pos.x} cy={pos.y} r={30} fill="transparent" />
                                {/* 노드 원 */}
                                <circle cx={pos.x} cy={pos.y} r={active ? 16 : 14}
                                    fill={active ? `${info.color}30` : `${info.color}15`}
                                    stroke={active ? info.color : `${info.color}50`} strokeWidth={1.5} />
                                <text x={pos.x} y={pos.y + 5} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.body} fontWeight={700}>{id}</text>
                                {/* 꼭짓점 라벨 */}
                                <text x={pos.x + labelOffset.dx} y={pos.y + labelOffset.dy} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textDim} fontSize={FONT.min} fontWeight={600}>
                                    {info.sub}
                                </text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: VERTICES[hovered].color, marginBottom: 2 }}>
                                {VERTICES[hovered].label}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {VERTICES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 꼭짓점을 호버하세요. EUV 레지스트에서 세 가지를 동시에 만족할 수 없는 물리적 한계입니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
