'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type NodeId = 'train' | 'val' | 'test' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    train: { label: 'Training', sub: '과거 데이터 ~70%', desc: '가장 오래된 데이터(예: 1~3월)로 모델 파라미터를 학습한다.', color: '#3b82f6' },
    val:   { label: 'Validation', sub: '중간 데이터 ~15%', desc: 'Training 직후 기간(4월)으로 하이퍼파라미터 튜닝과 Early Stopping에 사용한다.', color: '#f59e0b' },
    test:  { label: 'Test', sub: '최신 데이터 ~15%', desc: '가장 최신 데이터(5월)로 최종 성능 평가. 튜닝에 절대 사용하지 않고 한 번만 사용한다.', color: '#ef4444' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 560;
const SVG_H = 80;
const BOX_W = 140;
const BOX_H = 50;
const GAP = 30;
const TOTAL_W = 3 * BOX_W + 2 * GAP;
const START_X = (SVG_W - TOTAL_W) / 2;
const BOX_Y = (SVG_H - BOX_H) / 2;
const ORDER: Exclude<NodeId, null>[] = ['train', 'val', 'test'];

export default function TimeBasedSplit() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                시간 기반 분할
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Time-Based Split — 항상 과거로 학습하고 미래를 예측
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {/* 시간 화살표 배경 */}
                    <line x1={START_X - 10} y1={SVG_H / 2} x2={START_X + TOTAL_W + 10} y2={SVG_H / 2} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

                    {ORDER.map((id, i) => {
                        const x = START_X + i * (BOX_W + GAP);
                        const info = NODES[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - 4} y={BOX_Y - 4} width={BOX_W + 8} height={BOX_H + 8} fill="transparent" />
                                <rect x={x} y={BOX_Y} width={BOX_W} height={BOX_H} rx={10}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x + BOX_W / 2} y={BOX_Y + 20} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.body} fontWeight={700}>{info.label}</text>
                                <text x={x + BOX_W / 2} y={BOX_Y + 36} textAnchor="middle"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
                                {/* 화살표 */}
                                {i < 2 && (
                                    <g>
                                        <line x1={x + BOX_W + 2} y1={SVG_H / 2} x2={x + BOX_W + GAP - 8} y2={SVG_H / 2}
                                            stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
                                        <polygon
                                            points={`${x + BOX_W + GAP - 2},${SVG_H / 2} ${x + BOX_W + GAP - 10},${SVG_H / 2 - 4} ${x + BOX_W + GAP - 10},${SVG_H / 2 + 4}`}
                                            fill="rgba(255,255,255,0.2)" />
                                    </g>
                                )}
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            {/* 툴팁 */}
            <div style={{ maxWidth: 600, margin: '4px auto 0', height: 44 }}>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 블록을 호버하여 Train/Validation/Test 분할 전략을 확인하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
