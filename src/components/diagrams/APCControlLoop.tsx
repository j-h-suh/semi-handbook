'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type NodeId = 'align' | 'scanner' | 'metrology' | 'apc' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    align:     { label: '웨이퍼 정렬 측정', sub: 'Feed-Forward', desc: '노광 전 정렬 마크를 읽어 Inter-Field 모델 피팅. 웨이퍼별 개별 보정값 산출.', color: '#3b82f6' },
    scanner:   { label: '스캐너', sub: '보정값 적용 + 노광', desc: 'APC가 산출한 보정값(Correctables)을 적용하여 노광. Translation/Rotation/Magnification 실시간 조정.', color: '#f59e0b' },
    metrology: { label: 'Overlay 계측', sub: 'ADI / AEI', desc: '노광 후(ADI) 또는 식각 후(AEI) Overlay를 DBO/IBO로 측정. Residual 확인.', color: '#22c55e' },
    apc:       { label: 'APC 컨트롤러', sub: '모델 업데이트', desc: '측정 결과로 모델 파라미터를 업데이트. EWMA 기반 Feedback으로 드리프트 추적.', color: '#ef4444' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 700;
const SVG_H = 210;
const NODE_W = 140;
const NODE_H = 54;
const CY = SVG_H / 2;
const GAP = (SVG_W - 4 * NODE_W) / 5;
const POSITIONS = [GAP + NODE_W / 2, 2 * GAP + NODE_W * 1.5, 3 * GAP + NODE_W * 2.5, 4 * GAP + NODE_W * 3.5];

export default function APCControlLoop() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;
    const ORDER: Exclude<NodeId, null>[] = ['align', 'scanner', 'metrology', 'apc'];

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                APC 보정 루프
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Feed-Forward + Feedback 자동 보정 사이클
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    {/* 순방향 화살표 */}
                    {[0, 1, 2].map(i => (
                        <line key={i} x1={POSITIONS[i] + NODE_W / 2} y1={CY} x2={POSITIONS[i + 1] - NODE_W / 2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    ))}
                    {/* Feedback 화살표 (APC → Scanner, 위쪽 호) */}
                    <path d={`M ${POSITIONS[3]} ${CY - NODE_H / 2 - 6} C ${POSITIONS[3]} ${CY - 80}, ${POSITIONS[1]} ${CY - 80}, ${POSITIONS[1]} ${CY - NODE_H / 2 - 6}`}
                        fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth={1} strokeDasharray="4 3" />
                    <text x={(POSITIONS[3] + POSITIONS[1]) / 2} y={CY - 76} textAnchor="middle" fill="#ef4444" fontSize={FONT.min} fontWeight={600}>Feedback</text>
                    {/* 다음 로트 화살표 (APC → 정렬, 아래쪽 호) */}
                    <path d={`M ${POSITIONS[3]} ${CY + NODE_H / 2 + 6} C ${POSITIONS[3]} ${CY + 76}, ${POSITIONS[0]} ${CY + 76}, ${POSITIONS[0]} ${CY + NODE_H / 2 + 6}`}
                        fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth={1} strokeDasharray="4 3" />
                    <text x={(POSITIONS[3] + POSITIONS[0]) / 2} y={CY + 80} textAnchor="middle" fill="#3b82f6" fontSize={FONT.min} fontWeight={600}>다음 로트</text>

                    {ORDER.map((id, i) => {
                        const x = POSITIONS[i];
                        const info = NODES[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={x - NODE_W / 2 - 6} y={CY - NODE_H / 2 - 4} width={NODE_W + 12} height={NODE_H + 8} fill="transparent" />
                                <rect x={x - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'}
                                    strokeWidth={active ? 1.5 : 1} />
                                <text x={x} y={CY - 4} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>
                                    {info.label}
                                </text>
                                <text x={x} y={CY + 12} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>
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
                                각 노드를 호버하세요. Feed-Forward(웨이퍼별)와 Feedback(로트별) 보정이 자동으로 순환합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
