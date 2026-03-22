'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'raw' | 'pca' | 't2' | 'q' | 'dec' | 'alarm' | 'ok' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    raw:   { label: '원시 센서', sub: '100+ 변수', desc: '식각 장비의 RF 전력, 압력, 가스 유량, 온도 등 수백 개 센서 데이터.', color: '#3b82f6' },
    pca:   { label: 'PCA 변환', sub: '차원 축소', desc: '수백 개 센서를 소수 주성분(PC)으로 차원 축소. 센서 간 상관관계를 보존.', color: '#22c55e' },
    t2:    { label: 'T² 통계량', sub: '중심 이탈도', desc: 'Hotelling\'s T² — 데이터가 정상 범위 중심에서 얼마나 먼지. 마할라노비스 거리.', color: '#f59e0b' },
    q:     { label: 'Q 통계량', sub: '모델 적합도', desc: 'SPE(Squared Prediction Error) — PCA 모델이 설명 못하는 잔차. 새로운 유형 이상 탐지.', color: '#a855f7' },
    dec:   { label: '이상 판정', sub: 'T² or Q > 한계', desc: 'T² 또는 Q 통계량이 관리 한계 초과 시 이상 판정.', color: '#ef4444' },
    alarm: { label: '알람 + 기여도', sub: '원인 센서 특정', desc: '기여도 분석(Contribution Analysis)으로 어떤 센서가 이상에 가장 크게 기여했는지 특정.', color: '#ef4444' },
    ok:    { label: '정상', sub: '계속 가동', desc: '모든 통계량이 관리 한계 내 → 정상 판정 → 계속 가동.', color: '#71717a' },
};

/* Layout: RAW → PCA → [T²,Q] → DEC → [ALARM,OK] */
const SVG_W = 680;
const SVG_H = 140;
const NODE_W = 85;
const NODE_H = 50;
const CY = 60;
/* X positions */
const X = { raw: 55, pca: 175, t2: 295, q: 295, dec: 415, alarm: 555, ok: 555 };
const T2_Y = CY - 32;
const Q_Y = CY + 32;

export default function PCABasedFDC() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDim = (id: NodeId) => hovered !== null && hovered !== id;

    const renderNode = (id: Exclude<NodeId, null>, x: number, y: number, w = NODE_W, h = NODE_H) => {
        const info = NODES[id];
        const active = hovered === id;
        return (
            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={x - w / 2 - 4} y={y - h / 2 - 4} width={w + 8} height={h + 8} fill="transparent" />
                <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={8}
                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                <text x={x} y={y - 6} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                <text x={x} y={y + 12} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
            </motion.g>
        );
    };

    const arrow = (x1: number, y1: number, x2: number, y2: number) => (
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
    );

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                PCA 기반 FDC 파이프라인
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                원시 센서 → PCA 차원 축소 → T²/Q 통계량 → 이상 판정 → 기여도 분석
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 680 }}>
                    {/* Arrows */}
                    {arrow(X.raw + NODE_W / 2, CY, X.pca - NODE_W / 2, CY)}
                    {arrow(X.pca + NODE_W / 2, CY - 8, X.t2 - NODE_W / 2, T2_Y)}
                    {arrow(X.pca + NODE_W / 2, CY + 8, X.q - NODE_W / 2, Q_Y)}
                    {arrow(X.t2 + NODE_W / 2, T2_Y, X.dec - NODE_W / 2, CY - 8)}
                    {arrow(X.q + NODE_W / 2, Q_Y, X.dec - NODE_W / 2, CY + 8)}
                    {arrow(X.dec + NODE_W / 2, CY - 8, X.alarm - NODE_W / 2, T2_Y)}
                    {arrow(X.dec + NODE_W / 2, CY + 8, X.ok - NODE_W / 2, Q_Y)}
                    {/* Yes/No labels */}
                    <text x={(X.dec + X.alarm) / 2} y={T2_Y - 14} textAnchor="middle" fill="#ef4444" fontSize={FONT.min} opacity={0.5}>Yes</text>
                    <text x={(X.dec + X.ok) / 2} y={Q_Y + 22} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min} opacity={0.5}>No</text>

                    {/* Nodes */}
                    {renderNode('raw', X.raw, CY)}
                    {renderNode('pca', X.pca, CY)}
                    {renderNode('t2', X.t2, T2_Y)}
                    {renderNode('q', X.q, Q_Y)}
                    {renderNode('dec', X.dec, CY)}
                    {renderNode('alarm', X.alarm, T2_Y)}
                    {renderNode('ok', X.ok, Q_Y)}
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 노드를 호버하세요. PCA 기반 다변량 분석으로 단변량에서 놓치는 이상을 탐지합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
