'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type NodeId = 'eq' | 'edge' | 'center' | 'met' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    eq:     { label: '장비', sub: '스캐너, 식각기', desc: 'EDA를 통해 실시간 센서 데이터를 Edge Server로 전송. Edge로부터 보정값(APC)을 수신하여 공정에 적용.', color: '#3b82f6' },
    edge:   { label: 'Edge Server', sub: '장비 근처 · 실시간 추론', desc: '장비 가까이 배치된 서버. ONNX/TensorRT로 밀리초 단위 추론. VM 예측, APC 보정값 계산. 레이턴시 < 1초.', color: '#22c55e' },
    center: { label: 'Central Server', sub: '팹 중앙 · 모델 학습', desc: 'GPU 클러스터에서 모델 학습/재학습/모니터링 수행. FDC+계측 통합, 학습된 모델을 Edge로 배포.', color: '#f59e0b' },
    met:    { label: '계측 장비', sub: 'CD-SEM, OCD', desc: '계측 데이터(CD, OVL 실측값)를 Central로 전송. 모델 학습의 타겟(Y) 데이터 제공.', color: '#a78bfa' },
};

/* ─── SVG 레이아웃 (좌→우 3열, 계측은 우 하단) ─── */
const SVG_W = 700;
const SVG_H = 220;
const BOX_W = 140;
const BOX_H = 50;

/* 3열 배치: 장비(왼) → Edge(중앙) → Central(오른) / 계측(오른 아래) */
const COL1 = 100;            /* 장비 */
const COL2 = SVG_W / 2;      /* Edge */
const COL3 = SVG_W - 100;    /* Central */
const ROW_TOP = 60;           /* 상단 행 */
const ROW_BOT = 170;          /* 하단 행 (계측) */

const POS: Record<Exclude<NodeId, null>, { x: number; y: number }> = {
    eq:     { x: COL1, y: ROW_TOP },
    edge:   { x: COL2, y: ROW_TOP },
    center: { x: COL3, y: ROW_TOP },
    met:    { x: COL3, y: ROW_BOT },
};

/* ─── 연결선 정의 (양방향은 위/아래로 분리) ─── */
interface EdgeDef { x1: number; y1: number; x2: number; y2: number; label: string; color: string; labelY: number }

const ARROW_OFF = 10; /* 양방향 화살표 위아래 오프셋 */
const EDGE_LIST: EdgeDef[] = [
    /* 장비 → Edge (위쪽 선) */
    { x1: COL1 + BOX_W / 2, y1: ROW_TOP - ARROW_OFF, x2: COL2 - BOX_W / 2, y2: ROW_TOP - ARROW_OFF, label: 'EDA 데이터 →', color: '#3b82f6', labelY: ROW_TOP - ARROW_OFF - 8 },
    /* Edge → 장비 (아래쪽 선) */
    { x1: COL2 - BOX_W / 2, y1: ROW_TOP + ARROW_OFF, x2: COL1 + BOX_W / 2, y2: ROW_TOP + ARROW_OFF, label: '← 보정값', color: '#22c55e', labelY: ROW_TOP + ARROW_OFF + 16 },
    /* Edge → Central (위쪽 선) */
    { x1: COL2 + BOX_W / 2, y1: ROW_TOP - ARROW_OFF, x2: COL3 - BOX_W / 2, y2: ROW_TOP - ARROW_OFF, label: '로그 →', color: '#71717a', labelY: ROW_TOP - ARROW_OFF - 8 },
    /* Central → Edge (아래쪽 선) */
    { x1: COL3 - BOX_W / 2, y1: ROW_TOP + ARROW_OFF, x2: COL2 + BOX_W / 2, y2: ROW_TOP + ARROW_OFF, label: '← 새 모델', color: '#f59e0b', labelY: ROW_TOP + ARROW_OFF + 16 },
    /* 계측 → Central (수직) */
    { x1: COL3, y1: ROW_BOT - BOX_H / 2, x2: COL3, y2: ROW_TOP + BOX_H / 2, label: '계측 데이터 ↑', color: '#a78bfa', labelY: (ROW_TOP + ROW_BOT) / 2 },
];

export default function MLDeployArch() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                반도체 ML 배포 아키텍처
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Edge (실시간 추론) + Central (모델 학습) — On-Premise 필수
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 750 }}>
                    {/* 연결선 */}
                    {EDGE_LIST.map((e, i) => {
                        const mx = (e.x1 + e.x2) / 2;
                        const isVertical = e.x1 === e.x2;
                        return (
                            <g key={i}>
                                <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                                    stroke={e.color} strokeWidth={1} opacity={0.35} />
                                <text
                                    x={isVertical ? e.x1 - 10 : mx}
                                    y={e.labelY}
                                    textAnchor={isVertical ? 'end' : 'middle'}
                                    fill={e.color} fontSize={FONT.min} opacity={0.7}>{e.label}</text>
                            </g>
                        );
                    })}

                    {/* 노드 */}
                    {(Object.keys(NODES) as Exclude<NodeId, null>[]).map(id => {
                        const p = POS[id];
                        const info = NODES[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={p.x - BOX_W / 2 - 6} y={p.y - BOX_H / 2 - 4} width={BOX_W + 12} height={BOX_H + 8} fill="transparent" />
                                <rect x={p.x - BOX_W / 2} y={p.y - BOX_H / 2} width={BOX_W} height={BOX_H} rx={10}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={p.x} y={p.y - 2} textAnchor="middle" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.body} fontWeight={700}>{info.label}</text>
                                <text x={p.x} y={p.y + 14} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ maxWidth: 700, margin: '8px auto 0', height: 52 }}>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 요소를 호버하여 Edge + Central 2계층 아키텍처를 확인하세요.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
