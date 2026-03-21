'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type NodeId = 'current' | 'reference' | 'ideal' | 'ovl' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    current:   { label: '현재 층 패턴', sub: 'Current Layer', desc: '지금 노광하려는 층. 스캐너가 이 층의 패턴을 정확히 이전 층 위에 배치해야 한다.', color: '#3b82f6' },
    reference: { label: '이전 층 패턴', sub: 'Reference Layer', desc: '이미 웨이퍼에 형성된 층. 이 층의 정렬 마크를 읽어 현재 층의 노광 위치를 결정한다.', color: '#818cf8' },
    ideal:     { label: '이상: 완벽 정렬', sub: 'Δx = 0, Δy = 0', desc: '두 층의 패턴이 설계대로 정확히 맞물린 상태. 현실에서는 달성 불가능한 이상적 상태.', color: '#22c55e' },
    ovl:       { label: 'Overlay 오차', sub: 'Δx, Δy (nm)', desc: '실제로는 x/y 방향으로 나노미터 단위의 오차가 존재. Mean(체계적)과 3σ(랜덤) 성분으로 관리.', color: '#ef4444' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 400;
const SVG_H = 220;
const CX = SVG_W / 2;
const NODE_W = 130;
const NODE_H = 40;

const POS: Record<Exclude<NodeId, null>, { x: number; y: number }> = {
    current:   { x: CX, y: 35 },
    reference: { x: CX, y: 105 },
    ideal:     { x: CX - 90, y: 175 },
    ovl:       { x: CX + 90, y: 175 },
};

export default function OverlayConcept() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Overlay 개념
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                현재 층과 이전 층 사이의 정렬 오차
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 400)} style={{ maxWidth: '100%' }}>
                    {/* 화살표 */}
                    <line x1={CX} y1={POS.current.y + NODE_H / 2} x2={CX} y2={POS.reference.y - NODE_H / 2}
                        stroke="rgba(255,255,255,0.12)" strokeWidth={1.2} />
                    <line x1={CX} y1={POS.reference.y + NODE_H / 2} x2={POS.ideal.x} y2={POS.ideal.y - NODE_H / 2}
                        stroke="rgba(34,197,94,0.2)" strokeWidth={1.2} />
                    <text x={(CX + POS.ideal.x) / 2 - 8} y={(POS.reference.y + NODE_H / 2 + POS.ideal.y - NODE_H / 2) / 2}
                        fill="rgba(34,197,94,0.4)" fontSize={FONT.min} textAnchor="end">이상</text>
                    <line x1={CX} y1={POS.reference.y + NODE_H / 2} x2={POS.ovl.x} y2={POS.ovl.y - NODE_H / 2}
                        stroke="rgba(239,68,68,0.2)" strokeWidth={1.2} />
                    <text x={(CX + POS.ovl.x) / 2 + 8} y={(POS.reference.y + NODE_H / 2 + POS.ovl.y - NODE_H / 2) / 2}
                        fill="rgba(239,68,68,0.4)" fontSize={FONT.min} textAnchor="start">현실</text>

                    {(Object.keys(NODES) as Exclude<NodeId, null>[]).map(id => {
                        const pos = POS[id];
                        const info = NODES[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={pos.x - NODE_W / 2 - 6} y={pos.y - NODE_H / 2 - 4} width={NODE_W + 12} height={NODE_H + 8} fill="transparent" />
                                <rect x={pos.x - NODE_W / 2} y={pos.y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'}
                                    strokeWidth={active ? 1.5 : 1} />
                                <text x={pos.x} y={pos.y - 2} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>
                                    {info.label}
                                </text>
                                <text x={pos.x} y={pos.y + 12} textAnchor="middle"
                                    fill={COLOR.textDim} fontSize={FONT.min}>
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
                                {NODES[hovered].label}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {NODES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 노드를 호버하세요. 현재 층과 이전 층 사이의 정렬 관계를 보여줍니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
