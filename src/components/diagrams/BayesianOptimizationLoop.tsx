'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StepId = 'init' | 'fit' | 'acq' | 'exp' | 'update' | null;

const STEPS: Record<Exclude<StepId, null>, { label: string; sub: string; desc: string; color: string }> = {
    init:   { label: '초기 실험', sub: 'DOE 포인트', desc: '랜덤 또는 DOE 설계로 10~15개 초기 실험 수행. Surrogate 모델의 초기 학습 데이터.', color: '#6b7280' },
    fit:    { label: 'Surrogate 피팅', sub: 'Gaussian Process', desc: 'GP가 목적 함수를 근사. 예측값 + 불확실성(σ) 동시 제공. 데이터가 없는 영역은 불확실성 高.', color: '#3b82f6' },
    acq:    { label: 'Acquisition Fn', sub: 'EI / UCB', desc: '다음 실험 위치 결정. EI = 개선 기대량 최대화, UCB = 예측 + β×σ 최대화. 탐색-활용 균형.', color: '#22c55e' },
    exp:    { label: '실험 수행', sub: '웨이퍼 가공+계측', desc: 'Acquisition이 제안한 조건으로 실제 웨이퍼 가공 및 CD/OVL 계측. 실험 1회 = 수만 달러.', color: '#f59e0b' },
    update: { label: '결과 관측', sub: '데이터 추가', desc: '새 실험 결과를 데이터에 추가. Surrogate 재학습 → 다음 루프. 반복할수록 최적에 수렴.', color: '#a855f7' },
};

const ORDER: Exclude<StepId, null>[] = ['init', 'fit', 'acq', 'exp', 'update'];

const SVG_W = 700;
const SVG_H = 100;
const NODE_W = 114;
const NODE_H = 54;
const GAP = 14;
const TOTAL = ORDER.length * NODE_W + (ORDER.length - 1) * GAP;
const X0 = (SVG_W - TOTAL) / 2 + NODE_W / 2;
const CY = SVG_H / 2;

export default function BayesianOptimizationLoop() {
    const [hovered, setHovered] = useState<StepId>(null);
    const isDim = (id: StepId) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Bayesian Optimization 루프
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                초기 실험 → Surrogate → Acquisition → 실험 → 데이터 추가 (반복)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    <defs>
                        <marker id="arrowBO" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {/* Forward arrows */}
                    {ORDER.slice(0, -1).map((_, i) => {
                        const x1 = X0 + i * (NODE_W + GAP) + NODE_W / 2;
                        const x2 = X0 + (i + 1) * (NODE_W + GAP) - NODE_W / 2;
                        return <line key={i} x1={x1} y1={CY} x2={x2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrowBO)" />;
                    })}
                    {/* Loop-back arrow (update → fit) */}
                    {(() => {
                        const xEnd = X0 + 4 * (NODE_W + GAP) + NODE_W / 2;
                        const xStart = X0 + 1 * (NODE_W + GAP) - NODE_W / 2;
                        const yTop = CY - NODE_H / 2 - 8;
                        return <path d={`M${xEnd},${CY - NODE_H / 2} Q${xEnd + 10},${yTop - 6} ${(xEnd + xStart) / 2},${yTop - 6} Q${xStart - 10},${yTop - 6} ${xStart},${CY - NODE_H / 2}`}
                            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="4 2" markerEnd="url(#arrowBO)" />;
                    })()}
                    {/* Nodes */}
                    {ORDER.map((id, i) => {
                        const cx = X0 + i * (NODE_W + GAP);
                        const info = STEPS[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={cx - NODE_W / 2 - 4} y={CY - NODE_H / 2 - 4} width={NODE_W + 8} height={NODE_H + 8} fill="transparent" />
                                <rect x={cx - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={cx} y={CY - 6} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>{info.label}</text>
                                <text x={cx} y={CY + 12} textAnchor="middle" dominantBaseline="central"
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STEPS[hovered].color, marginBottom: 2 }}>{STEPS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{STEPS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. DOE 대비 실험 횟수 50% 이상 절감하며 최적 조건 탐색.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
