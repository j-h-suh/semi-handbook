'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'fabA' | 'fabB' | 'fabC' | 'server' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    fabA:   { label: 'Fab A', sub: '로컬 학습', desc: '팹A에서 로컬 데이터로 모델 학습. 원시 데이터는 팹 밖으로 절대 나가지 않음. 모델 가중치만 중앙 서버로 전송.', color: '#3b82f6' },
    fabB:   { label: 'Fab B', sub: '로컬 학습', desc: '팹B에서 독립적으로 학습. 장비/소재/환경이 달라도 각 팹의 경험이 모델에 반영됨.', color: '#22c55e' },
    fabC:   { label: 'Fab C', sub: '로컬 학습', desc: '신규 팹도 로컬 데이터가 쌓이면서 참여. 기존 팹들의 경험을 통합 모델로 받아 빠르게 가동 가능.', color: '#f59e0b' },
    server: { label: 'Central Server', sub: '가중치 평균화', desc: '각 팹의 모델 가중치를 수집 → FedAvg로 평균화 → 통합 모델을 각 팹에 배포. 데이터 프라이버시 + 규모의 경제.', color: '#a855f7' },
};

const SVG_W = 560;
const SVG_H = 220;
const CENTER_X = SVG_W / 2;
const SERVER_Y = 44;
const FAB_Y = 170;

const FABS: { id: Exclude<NodeId, null>; x: number }[] = [
    { id: 'fabA', x: 100 },
    { id: 'fabB', x: 280 },
    { id: 'fabC', x: 460 },
];

export default function FederatedLearningArchitecture() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDim = (id: NodeId) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Federated Learning 아키텍처 — 팹 간 지식 공유
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                원시 데이터는 팹을 떠나지 않고, 모델 가중치만 공유
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 560 }}>
                    <defs>
                        <marker id="arrowFL" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.18)" />
                        </marker>
                    </defs>
                    {/* Arrows: fabs → server (upload) + server → fabs (download) */}
                    {FABS.map(f => (
                        <g key={f.id}>
                            <line x1={f.x - 10} y1={FAB_Y - 28} x2={CENTER_X - 10} y2={SERVER_Y + 36}
                                stroke="rgba(255,255,255,0.1)" strokeWidth={1.2} markerEnd="url(#arrowFL)" />
                            <line x1={CENTER_X + 10} y1={SERVER_Y + 36} x2={f.x + 10} y2={FAB_Y - 28}
                                stroke="rgba(255,255,255,0.1)" strokeWidth={1.2} strokeDasharray="4 3" markerEnd="url(#arrowFL)" />
                        </g>
                    ))}
                    {/* Server */}
                    <motion.g onMouseEnter={() => setHovered('server')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDim('server') ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                        <rect x={CENTER_X - 85} y={SERVER_Y - 26} width={170} height={60} rx={8} fill="transparent" />
                        <rect x={CENTER_X - 80} y={SERVER_Y - 22} width={160} height={52} rx={10}
                            fill={hovered === 'server' ? '#a855f715' : 'rgba(255,255,255,0.03)'}
                            stroke={hovered === 'server' ? '#a855f750' : 'rgba(255,255,255,0.08)'} strokeWidth={hovered === 'server' ? 1.5 : 1} />
                        <text x={CENTER_X} y={SERVER_Y - 4} textAnchor="middle" dominantBaseline="central"
                            fill={hovered === 'server' ? '#a855f7' : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>Central Server</text>
                        <text x={CENTER_X} y={SERVER_Y + 14} textAnchor="middle" dominantBaseline="central"
                            fill={COLOR.textDim} fontSize={FONT.min}>가중치 평균화 (FedAvg)</text>
                    </motion.g>
                    {/* Fab nodes */}
                    {FABS.map(({ id, x }) => {
                        const info = NODES[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - 58} y={FAB_Y - 28} width={116} height={54} rx={8} fill="transparent" />
                                <rect x={x - 54} y={FAB_Y - 24} width={108} height={48} rx={10}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x} y={FAB_Y - 4} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>{info.label}</text>
                                <text x={x} y={FAB_Y + 14} textAnchor="middle" dominantBaseline="central"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
                            </motion.g>
                        );
                    })}
                    {/* Arrow labels */}
                    <text x={140} y={108} fill={COLOR.textDim} fontSize={FONT.min} opacity={0.5}>weights ↑</text>
                    <text x={390} y={108} fill={COLOR.textDim} fontSize={FONT.min} opacity={0.5}>↓ model</text>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 팹/서버를 호버하세요. 데이터는 팹을 떠나지 않고 가중치만 공유합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
