'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'kafka' | 'feat' | 'infer' | 'ri' | 'result' | 'actual' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    kafka:  { label: 'Kafka', sub: 'FDC 스트림', desc: '스캐너/트랙의 FDC 데이터가 실시간으로 스트리밍. 웨이퍼 단위 이벤트 메시지.', color: '#3b82f6' },
    feat:   { label: '피처 계산', sub: '실시간 변환', desc: 'Summary 통계 + 도메인 피처(Dose×두께, Focus² 등)를 실시간으로 계산.', color: '#22c55e' },
    infer:  { label: '추론 서버', sub: 'XGBoost + FastAPI', desc: '학습된 XGBoost 모델로 CD/OVL 예측. 레이턴시 < 100ms. Model Registry에서 최신 모델 로드.', color: '#f59e0b' },
    ri:     { label: 'RI 평가', sub: '신뢰도 계산', desc: 'Reliance Index: 입력 데이터가 학습 분포에서 얼마나 벗어났는지 계산. RI = 1 - 마할라노비스 거리 정규화.', color: '#a855f7' },
    result: { label: 'VM 예측값', sub: 'CD, Overlay', desc: 'RI ≥ 0.7 → VM 예측을 신뢰하여 사용. 실제 계측 생략 → 계측 절감 + throughput 향상.', color: '#06b6d4' },
    actual: { label: '실제 계측 요청', sub: 'RI < 0.7', desc: 'RI < 0.7 → VM 예측 불신뢰. 실제 계측을 요청하여 안전성 확보. 이 데이터가 재학습에 활용됨.', color: '#ef4444' },
};

const SVG_W = 820;
const SVG_H = 180;
const NODE_W = 120;
const NODE_H = 54;

export default function VmServingArchitecture() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDim = (id: NodeId) => hovered !== null && hovered !== id;

    /* Horizontal layout */
    const positions: Record<Exclude<NodeId, null>, { x: number; y: number }> = {
        kafka:  { x: 80, y: 80 },
        feat:   { x: 226, y: 80 },
        infer:  { x: 372, y: 80 },
        ri:     { x: 518, y: 80 },
        result: { x: 700, y: 40 },
        actual: { x: 700, y: 126 },
    };

    const arrows: { from: Exclude<NodeId, null>; to: Exclude<NodeId, null>; label?: string; dash?: boolean }[] = [
        { from: 'kafka', to: 'feat' },
        { from: 'feat', to: 'infer' },
        { from: 'infer', to: 'ri' },
        { from: 'ri', to: 'result', label: 'RI ≥ 0.7' },
        { from: 'ri', to: 'actual', label: 'RI < 0.7', dash: true },
    ];

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                VM 서빙 아키텍처 — 실시간 예측 + 신뢰도 필터
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Kafka → 피처 → 추론 → RI 평가 → 결과 분기
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 820 }}>
                    <defs>
                        <marker id="arrowVM" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {arrows.map(({ from, to, label, dash }) => {
                        const f = positions[from]; const t = positions[to];
                        const x1 = f.x + NODE_W / 2; const x2 = t.x - NODE_W / 2;
                        return (
                            <g key={from + to}>
                                <line x1={x1} y1={f.y} x2={x2} y2={t.y}
                                    stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray={dash ? '4 2' : undefined} markerEnd="url(#arrowVM)" />
                            </g>
                        );
                    })}
                    {/* RI branch labels — along the diagonal arrows */}
                    <text x={positions.ri.x + NODE_W / 2 + 16} y={(positions.ri.y + positions.result.y) / 2 - 10} textAnchor="start"
                        fill="#06b6d4" fontSize={FONT.min} opacity={0.7}>RI ≥ 0.7</text>
                    <text x={positions.ri.x + NODE_W / 2 + 16} y={(positions.ri.y + positions.actual.y) / 2 + 14} textAnchor="start"
                        fill="#ef4444" fontSize={FONT.min} opacity={0.7}>RI &lt; 0.7</text>
                    {Object.entries(positions).map(([id, { x, y }]) => {
                        const info = NODES[id as Exclude<NodeId, null>];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id as Exclude<NodeId, null>)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDim(id as NodeId) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 노드를 호버하세요. RI(신뢰도)가 핵심 — 계측 절감과 안전성의 균형.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
