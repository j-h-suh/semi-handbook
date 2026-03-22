'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'shared' | 'headA' | 'headB' | 'headNew' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    shared:  { label: '공유 레이어', sub: '장비 물리 학습', desc: '센서 → CD/OVL 의 일반적 물리 관계를 학습. 제품과 무관한 장비 물리. 모든 제품이 이 지식을 공유.', color: '#3b82f6' },
    headA:   { label: 'Product A Head', sub: '제품A 특화', desc: '제품A의 Dose 민감도, 타겟 CD 등 특화 관계. 풍부한 데이터로 학습.', color: '#22c55e' },
    headB:   { label: 'Product B Head', sub: '제품B 특화', desc: '제품B의 고유한 패턴-CD 관계. 제품별 레시피 차이 반영.', color: '#f59e0b' },
    headNew: { label: 'New Product Head', sub: '소량 학습', desc: '신제품은 소량(수십 웨이퍼)으로 헤드만 학습. 공유 레이어가 물리를 이미 알고 있으므로 가능.', color: '#ef4444' },
};

const SVG_W = 400;
const SVG_H = 160;
const SHARED_W = 120;
const SHARED_H = 50;
const HEAD_W = 110;
const HEAD_H = 40;
const CX = SVG_W / 2;
const SHARED_Y = 30;
const HEAD_Y = 120;

export default function MultiTaskProductHead() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDim = (id: NodeId) => hovered !== null && hovered !== id;

    const heads: { id: Exclude<NodeId, null>; x: number }[] = [
        { id: 'headA', x: CX - HEAD_W - 16 },
        { id: 'headB', x: CX },
        { id: 'headNew', x: CX + HEAD_W + 16 },
    ];

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Multi-Task 전이 학습 — 공유 레이어 + 제품별 Head
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                장비 물리 공유 → 신제품은 Head만 소량 학습
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 400 }}>
                    <defs>
                        <marker id="arrowMT" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {/* Arrows from shared to heads */}
                    {heads.map(h => (
                        <line key={h.id} x1={CX} y1={SHARED_Y + SHARED_H / 2 + SHARED_H / 2}
                            x2={h.x} y2={HEAD_Y - HEAD_H / 2}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrowMT)" />
                    ))}
                    {/* Shared block */}
                    <motion.g onMouseEnter={() => setHovered('shared')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDim('shared') ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - SHARED_W / 2 - 6} y={SHARED_Y - SHARED_H / 2 - 6} width={SHARED_W + 12} height={SHARED_H + 12} fill="transparent" />
                        <rect x={CX - SHARED_W / 2} y={SHARED_Y - SHARED_H / 2 + 4} width={SHARED_W} height={SHARED_H} rx={8}
                            fill={hovered === 'shared' ? '#3b82f615' : 'rgba(255,255,255,0.03)'}
                            stroke={hovered === 'shared' ? '#3b82f650' : 'rgba(255,255,255,0.08)'} strokeWidth={hovered === 'shared' ? 1.5 : 1} />
                        <text x={CX} y={SHARED_Y - 2} textAnchor="middle" dominantBaseline="central"
                            fill={hovered === 'shared' ? '#3b82f6' : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>공유 레이어</text>
                        <text x={CX} y={SHARED_Y + 14} textAnchor="middle" dominantBaseline="central"
                            fill={COLOR.textDim} fontSize={FONT.min}>장비 물리 학습</text>
                    </motion.g>
                    {/* Head blocks */}
                    {heads.map(({ id, x }) => {
                        const info = NODES[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - HEAD_W / 2 - 4} y={HEAD_Y - HEAD_H / 2 - 4} width={HEAD_W + 8} height={HEAD_H + 8} fill="transparent" />
                                <rect x={x - HEAD_W / 2} y={HEAD_Y - HEAD_H / 2} width={HEAD_W} height={HEAD_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1}
                                    strokeDasharray={id === 'headNew' ? '4 2' : undefined} />
                                <text x={x} y={HEAD_Y - 4} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                                <text x={x} y={HEAD_Y + 12} textAnchor="middle" dominantBaseline="central"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: NODES[hovered].color, marginBottom: 2 }}>{NODES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{NODES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 블록을 호버하세요. 물리 공유 + 제품별 특화 = 소량 데이터 전이의 핵심 전략.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
