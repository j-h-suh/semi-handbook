'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type NodeId = 'markA' | 'markB' | 'calc' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    markA: { label: '마크 A', sub: '바이어스 +d', desc: '현재 층 격자를 이전 층 대비 +d만큼 의도적으로 오프셋. 회절 강도 I_A+, I_A-를 측정.', color: '#3b82f6' },
    markB: { label: '마크 B', sub: '바이어스 -d', desc: '현재 층 격자를 이전 층 대비 -d만큼 의도적으로 오프셋. 회절 강도 I_B+, I_B-를 측정.', color: '#818cf8' },
    calc: { label: 'Overlay 계산', sub: 'OVL = f(I_A+, I_A-, I_B+, I_B-)', desc: '마크 A, B 각각의 ±1차 회절 강도 4개 값을 조합하여 Overlay를 계산. 바이어스 ±d가 내부 눈금자 역할.', color: '#22c55e' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 560;
const SVG_H = 160;
const CX = SVG_W / 2;
const NODE_H = 44;

const NODE_CFG: Record<Exclude<NodeId, null>, { x: number; y: number; w: number }> = {
    markA: { x: CX - 140, y: 50, w: 130 },
    markB: { x: CX - 140, y: 110, w: 130 },
    calc:  { x: CX + 130, y: 80, w: 200 },
};

export default function DBOMeasurementPrinciple() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                DBO 측정 원리
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                바이어스 ±d를 가진 두 마크로 Overlay 추출
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 560 }}>
                    {/* 화살표: markA → calc */}
                    <line x1={NODE_CFG.markA.x + NODE_CFG.markA.w / 2} y1={NODE_CFG.markA.y} x2={NODE_CFG.calc.x - NODE_CFG.calc.w / 2} y2={NODE_CFG.calc.y}
                        stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    {/* 화살표: markB → calc */}
                    <line x1={NODE_CFG.markB.x + NODE_CFG.markB.w / 2} y1={NODE_CFG.markB.y} x2={NODE_CFG.calc.x - NODE_CFG.calc.w / 2} y2={NODE_CFG.calc.y}
                        stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

                    {(Object.keys(NODES) as Exclude<NodeId, null>[]).map(id => {
                        const cfg = NODE_CFG[id];
                        const info = NODES[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={cfg.x - cfg.w / 2 - 6} y={cfg.y - NODE_H / 2 - 4} width={cfg.w + 12} height={NODE_H + 8} fill="transparent" />
                                <rect x={cfg.x - cfg.w / 2} y={cfg.y - NODE_H / 2} width={cfg.w} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'}
                                    strokeWidth={active ? 1.5 : 1} />
                                <text x={cfg.x} y={cfg.y - 4} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>
                                    {info.label}
                                </text>
                                <text x={cfg.x} y={cfg.y + 12} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>
                                    {info.sub}
                                </text>
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: NODES[hovered].color, marginBottom: 2 }}>
                                {NODES[hovered].label} — {NODES[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {NODES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 노드를 호버하세요. ±d 바이어스를 가진 두 마크로 4개의 회절 강도를 측정하여 Overlay를 계산합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
