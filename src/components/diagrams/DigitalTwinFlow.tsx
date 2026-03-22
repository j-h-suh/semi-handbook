'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'real' | 'twin' | 'insight' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    real:    { label: '실제 팹', sub: '장비, 공정, 웨이퍼', desc: 'FDC, 계측, MES 데이터를 실시간으로 디지털 트윈에 전송. 최적화된 설정을 수신하여 적용.', color: '#3b82f6' },
    twin:    { label: '가상 팹 (트윈)', sub: '물리 + ML 모델', desc: '물리 모델(렌즈 열팽창 등) + ML 모델(잔차 보정)을 결합한 시뮬레이션 환경. What-If 분석 가능.', color: '#22c55e' },
    insight: { label: '인사이트', sub: '최적 조건 · 위험 예측', desc: 'What-If 시뮬레이션 결과 → 최적 레시피, 위험 예측, 시나리오 비교. "Dose 0.5% 변경 시 CD 영향" 즉시 계산.', color: '#f59e0b' },
};

const SVG_W = 700;
const SVG_H = 120;
const NODE_W = 150;
const NODE_H = 56;

export default function DigitalTwinFlow() {
    const [hovered, setHovered] = useState<NodeId>(null);

    const positions: Record<Exclude<NodeId, null>, { x: number; y: number }> = {
        real:    { x: 120, y: 60 },
        twin:    { x: 350, y: 60 },
        insight: { x: 580, y: 60 },
    };

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                디지털 트윈 — 실제 팹의 가상 복제
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                실시간 동기화 → 가상 실험 → 최적화된 피드백
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    <defs>
                        <marker id="arrowDT" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {/* real → twin (top arrow: data) */}
                    <line x1={120 + NODE_W / 2} y1={46} x2={350 - NODE_W / 2} y2={46}
                        stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrowDT)" />
                    <text x={235} y={38} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min} opacity={0.6}>실시간 데이터</text>
                    {/* twin → real (bottom arrow: optimization) */}
                    <line x1={350 - NODE_W / 2} y1={74} x2={120 + NODE_W / 2} y2={74}
                        stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4 2" markerEnd="url(#arrowDT)" />
                    <text x={235} y={88} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min} opacity={0.6}>최적화 설정</text>
                    {/* twin → insight */}
                    <line x1={350 + NODE_W / 2} y1={60} x2={580 - NODE_W / 2} y2={60}
                        stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrowDT)" />
                    <text x={465} y={50} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min} opacity={0.6}>What-If 분석</text>
                    {/* Nodes */}
                    {Object.entries(positions).map(([id, { x, y }]) => {
                        const info = NODES[id as Exclude<NodeId, null>];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id as Exclude<NodeId, null>)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: hovered !== null && hovered !== id ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - NODE_W / 2 - 4} y={y - NODE_H / 2 - 4} width={NODE_W + 8} height={NODE_H + 8} fill="transparent" />
                                <rect x={x - NODE_W / 2} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x} y={y - 6} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>{info.label}</text>
                                <text x={x} y={y + 14} textAnchor="middle" dominantBaseline="central"
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 노드를 호버하세요. 실제 팹 ↔ 가상 팹의 양방향 피드백 루프.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
