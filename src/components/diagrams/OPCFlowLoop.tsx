'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type NodeId = 'input' | 'simulate' | 'compare' | 'adjust' | 'done' | null;

interface NodeInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const NODES: Record<Exclude<NodeId, null>, NodeInfo> = {
    input: { label: '설계 패턴', sub: 'GDS / OASIS', desc: '수 TB 규모의 칩 설계 데이터. 수십억 개의 패턴 에지가 OPC의 최적화 변수가 된다.', color: '#3b82f6' },
    simulate: { label: '광학 시뮬레이션', sub: 'Optical Model', desc: '현재 마스크 패턴으로 빛의 회절/간섭을 물리 기반 시뮬레이션. Maxwell 방정식의 근사 해법을 사용.', color: '#818cf8' },
    compare: { label: '목표 비교', sub: 'Target vs Simulated', desc: '시뮬레이션된 웨이퍼 패턴과 설계 의도를 비교. CD 오차, 코너 라운딩, 라인엔드 숏트닝 등을 정량 평가.', color: '#f59e0b' },
    adjust: { label: '에지 이동', sub: 'Edge Placement', desc: '오차가 큰 에지를 nm 단위로 이동. 경사 하강법과 유사한 반복 최적화. 보통 10~50회 반복.', color: '#ef4444' },
    done: { label: 'OPC 완료', sub: 'Corrected Mask Data', desc: '수렴 조건 달성. 보정된 마스크 데이터가 마스크 제조로 전달. 칩 레이어 하나에 수천 CPU 코어로 수 시간~수일.', color: '#22c55e' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 480;
const SVG_H = 320;
const CX = SVG_W / 2;
const NODE_W = 120;
const NODE_H = 44;

// 포지션
const POS: Record<Exclude<NodeId, null>, { x: number; y: number }> = {
    input:    { x: CX, y: 40 },
    simulate: { x: CX, y: 110 },
    compare:  { x: CX, y: 180 },
    adjust:   { x: CX + 140, y: 145 },
    done:     { x: CX, y: 260 },
};

function Arrow({ x1, y1, x2, y2, label, curved }: {
    x1: number; y1: number; x2: number; y2: number; label?: string; curved?: 'right';
}) {
    if (curved === 'right') {
        // 곡선 화살표 (compare → adjust → simulate)
        const midX = Math.max(x1, x2) + 20;
        return (
            <g>
                <path d={`M${x1},${y1} Q${midX},${y1} ${x2},${y2}`}
                    fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.2} />
                <polygon points={`${x2},${y2} ${x2 + 4},${y2 - 6} ${x2 - 4},${y2 - 6}`}
                    fill="rgba(255,255,255,0.15)" />
            </g>
        );
    }
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len;
    const uy = dy / len;
    const ax = x2 - ux * 6;
    const ay = y2 - uy * 6;
    return (
        <g>
            <line x1={x1} y1={y1} x2={ax} y2={ay} stroke="rgba(255,255,255,0.15)" strokeWidth={1.2} />
            <polygon points={`${x2},${y2} ${x2 - uy * 4 - ux * 6},${y2 + ux * 4 - uy * 6} ${x2 + uy * 4 - ux * 6},${y2 - ux * 4 - uy * 6}`}
                fill="rgba(255,255,255,0.15)" />
            {label && (
                <text x={(x1 + x2) / 2 + (curved ? 10 : -14)} y={(y1 + y2) / 2}
                    fill={COLOR.textDim} fontSize={FONT.min} textAnchor="end">{label}</text>
            )}
        </g>
    );
}

export default function OPCFlowLoop() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Model-Based OPC 반복 최적화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Iterative Optimization Loop — Gradient Descent 유사 구조
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 480)} style={{ maxWidth: '100%' }}>
                    {/* 화살표 — 아래로 */}
                    <Arrow x1={POS.input.x} y1={POS.input.y + NODE_H / 2} x2={POS.simulate.x} y2={POS.simulate.y - NODE_H / 2} />
                    <Arrow x1={POS.simulate.x} y1={POS.simulate.y + NODE_H / 2} x2={POS.compare.x} y2={POS.compare.y - NODE_H / 2} />
                    {/* Yes → done */}
                    <Arrow x1={POS.compare.x} y1={POS.compare.y + NODE_H / 2} x2={POS.done.x} y2={POS.done.y - NODE_H / 2} />
                    <text x={POS.compare.x - 10} y={POS.compare.y + NODE_H / 2 + 16}
                        fill="rgba(34,197,94,0.5)" fontSize={FONT.min} textAnchor="end">Yes</text>
                    {/* No → adjust (compare 오른쪽 → adjust 아래) */}
                    <Arrow x1={POS.compare.x + NODE_W / 2} y1={POS.compare.y}
                        x2={POS.adjust.x} y2={POS.adjust.y + NODE_H / 2} />
                    <text x={POS.compare.x + NODE_W / 2 + 14} y={POS.compare.y - 6}
                        fill="rgba(239,68,68,0.5)" fontSize={FONT.min} textAnchor="start">No</text>
                    {/* adjust → simulate (반복 루프: adjust 위 → simulate 오른쪽) */}
                    <Arrow x1={POS.adjust.x} y1={POS.adjust.y - NODE_H / 2}
                        x2={POS.simulate.x + NODE_W / 2} y2={POS.simulate.y}
                        curved="right" />

                    {/* 노드들 */}
                    {(Object.keys(NODES) as Exclude<NodeId, null>[]).map(id => {
                        const pos = POS[id];
                        const info = NODES[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);

                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={pos.x - NODE_W / 2 - 8} y={pos.y - NODE_H / 2 - 4} width={NODE_W + 16} height={NODE_H + 8}
                                    fill="transparent" />
                                <rect x={pos.x - NODE_W / 2} y={pos.y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={id === 'compare' ? 22 : 8}
                                    fill={active ? `${info.color}18` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}60` : 'rgba(255,255,255,0.08)'}
                                    strokeWidth={active ? 1.5 : 1} />
                                <text x={pos.x} y={pos.y - 4} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>
                                    {info.label}
                                </text>
                                <text x={pos.x} y={pos.y + 12} textAnchor="middle"
                                    fill={COLOR.textDim} fontSize={FONT.min}>
                                    {info.sub}
                                </text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto', height: 58 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: NODES[hovered].color, marginBottom: 2 }}>
                                {NODES[hovered].label} — {NODES[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {NODES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 단계를 호버하세요. Model-Based OPC의 반복 최적화 루프를 보여줍니다. 머신러닝의 학습 루프와 구조적으로 동일합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
