'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'ly' | 'ws' | 'ft' | 'oy' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    ly: { label: 'Line Yield', sub: '공정 수율', desc: '웨이퍼가 전공정(Fab)을 살아남는 비율. 파손·오염·파라미터 이탈로 폐기되는 것 제외. 성숙 공정 98-99%.', color: '#3b82f6' },
    ws: { label: 'Wafer Sort Yield', sub: '다이 수율', desc: '전기적 테스트(EDS)로 양품/불량 분류한 비율. "수율"이라 하면 보통 이 값. 성숙 공정 90-95%.', color: '#22c55e' },
    ft: { label: 'Final Test Yield', sub: '최종 테스트', desc: '패키징 후 기능 테스트 양품 비율. 와이어 본딩 불량 등이 원인. 보통 95-99%.', color: '#f59e0b' },
    oy: { label: 'Overall Yield', sub: 'LY × WS × FT', desc: '전체 수율 = 세 단계의 곱. 98% × 90% × 97% = 85.6%. 한 단계 하락이 전체에 큰 영향.', color: '#ef4444' },
};

const SVG_W = 700;
const SVG_H = 90;
const NODE_W = 150;
const NODE_H = 54;
const CY = SVG_H / 2;
const ORDER: Exclude<NodeId, null>[] = ['ly', 'ws', 'ft', 'oy'];
const GAP = (SVG_W - 4 * NODE_W) / 5;
const POSITIONS = ORDER.map((_, i) => GAP * (i + 1) + NODE_W * (i + 0.5));

export default function YieldStructureFlow() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                수율의 구성
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Line Yield → Wafer Sort → Final Test → Overall Yield
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    {[0, 1, 2].map(i => (
                        <line key={i} x1={POSITIONS[i] + NODE_W / 2} y1={CY} x2={POSITIONS[i + 1] - NODE_W / 2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    ))}
                    {ORDER.map((id, i) => {
                        const x = POSITIONS[i];
                        const info = NODES[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - NODE_W / 2 - 6} y={CY - NODE_H / 2 - 4} width={NODE_W + 12} height={NODE_H + 8} fill="transparent" />
                                <rect x={x - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x} y={CY - 8} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.body} fontWeight={600}>{info.label}</text>
                                <text x={x} y={CY + 10} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.small}>{info.sub}</text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: NODES[hovered].color, marginBottom: 2 }}>{NODES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{NODES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. 전체 수율은 세 단계의 곱(LY × WS × FT)으로 결정됩니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
