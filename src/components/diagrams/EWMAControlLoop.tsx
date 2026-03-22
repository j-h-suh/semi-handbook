'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'measure' | 'ewma' | 'recipe' | 'process' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    measure: { label: '계측', sub: 'CD/OVL 측정', desc: '공정 완료 후 CD 또는 Overlay를 측정. 이 결과가 EWMA 입력이 됨.', color: '#3b82f6' },
    ewma:    { label: 'EWMA 컨트롤러', sub: '예측값 업데이트', desc: '예측값(n+1) = λ×실측값(n) + (1-λ)×예측값(n). λ≈0.3~0.5 사용.', color: '#22c55e' },
    recipe:  { label: '레시피 조정', sub: 'Dose/Focus/Offset', desc: 'EWMA 예측값과 목표값의 차이를 보정값으로 변환하여 장비 레시피에 반영.', color: '#f59e0b' },
    process: { label: '공정 실행', sub: '다음 로트', desc: '조정된 레시피로 다음 로트/웨이퍼를 처리. 결과가 다시 계측으로 순환.', color: '#a855f7' },
};

const ORDER: Exclude<NodeId, null>[] = ['measure', 'ewma', 'recipe', 'process'];
const SVG_W = 340;
const SVG_H = 220;
const CX = SVG_W / 2;
const CY = SVG_H / 2;
const RX = 110;
const RY = 70;
const NODE_W = 100;
const NODE_H = 46;

/* Circular positions: top, right, bottom, left */
const ANGLES = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];

export default function EWMAControlLoop() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDim = (id: NodeId) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                EWMA R2R 제어 루프
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                계측 → EWMA 업데이트 → 레시피 조정 → 공정 실행 → 반복
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 340 }}>
                    {/* Circular arrows between nodes */}
                    {ORDER.map((_, i) => {
                        const a1 = ANGLES[i] + 0.3;
                        const a2 = ANGLES[(i + 1) % 4] - 0.3;
                        const x1 = CX + Math.cos(a1) * RX;
                        const y1 = CY + Math.sin(a1) * RY;
                        const x2 = CX + Math.cos(a2) * RX;
                        const y2 = CY + Math.sin(a2) * RY;
                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />;
                    })}

                    {/* Nodes */}
                    {ORDER.map((id, i) => {
                        const angle = ANGLES[i];
                        const x = CX + Math.cos(angle) * RX;
                        const y = CY + Math.sin(angle) * RY;
                        const info = NODES[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - NODE_W / 2 - 4} y={y - NODE_H / 2 - 4} width={NODE_W + 8} height={NODE_H + 8} fill="transparent" />
                                <rect x={x - NODE_W / 2} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x} y={y - 6} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                                <text x={x} y={y + 12} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: NODES[hovered].color, marginBottom: 2 }}>{NODES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{NODES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 노드를 호버하세요. EWMA R2R(Run-to-Run) 제어는 매 로트 결과를 반영한 피드백 루프입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
