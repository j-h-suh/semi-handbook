'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type NodeId = 'raw' | 'model' | 'corr' | 'res' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    raw:   { label: 'Raw Overlay', sub: '측정된 전체 오차', desc: '계측 장비(DBO/IBO)로 측정한 원본 Overlay 데이터. 체계적 + 비체계적 오차를 모두 포함.', color: '#f59e0b' },
    model: { label: '모델 피팅', sub: '선형/고차/AI', desc: '측정 데이터를 수학적 모델(6par, HOWA, CPE, AI)로 피팅하여 체계적 패턴을 추출.', color: '#a1a1aa' },
    corr:  { label: 'Correctables', sub: '스캐너 보정 가능', desc: '모델이 설명하는 체계적 오차. Translation, Rotation, Magnification 등 스캐너가 실시간 보정 가능.', color: '#22c55e' },
    res:   { label: 'Residuals', sub: '잔여 오차 → 수율 결정', desc: '모델이 포착하지 못한 나머지. 보정 불가능하므로 수율을 직접 결정. AI로 줄이는 것이 SMILE의 핵심.', color: '#ef4444' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 600;
const SVG_H = 140;
const NODE_W = 120;
const NODE_H = 44;
const POS = {
    raw:   { x: 60, y: 70 },
    model: { x: 220, y: 70 },
    corr:  { x: 420, y: 40 },
    res:   { x: 420, y: 100 },
};

export default function CorrectablesResidualsFlow() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Correctables vs Residuals
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Raw Overlay = Correctables + Residuals
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {/* 화살표들 */}
                    <line x1={POS.raw.x + NODE_W / 2} y1={POS.raw.y} x2={POS.model.x - NODE_W / 2} y2={POS.model.y}
                        stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    <line x1={POS.model.x + NODE_W / 2} y1={POS.model.y} x2={POS.corr.x - NODE_W / 2} y2={POS.corr.y}
                        stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    <line x1={POS.model.x + NODE_W / 2} y1={POS.model.y} x2={POS.res.x - NODE_W / 2} y2={POS.res.y}
                        stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

                    {(Object.keys(NODES) as Exclude<NodeId, null>[]).map(id => {
                        const pos = POS[id];
                        const info = NODES[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        const w = id === 'corr' || id === 'res' ? 140 : NODE_W;
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={pos.x - w / 2 - 6} y={pos.y - NODE_H / 2 - 4} width={w + 12} height={NODE_H + 8} fill="transparent" />
                                <rect x={pos.x - w / 2} y={pos.y - NODE_H / 2} width={w} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'}
                                    strokeWidth={active ? 1.5 : 1} />
                                <text x={pos.x} y={pos.y - 4} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>
                                    {info.label}
                                </text>
                                <text x={pos.x} y={pos.y + 12} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>
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
                                각 노드를 호버하세요. Overlay 엔지니어링의 핵심은 Residuals를 최소화하는 것입니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
