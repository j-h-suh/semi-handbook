'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StepId = 'data' | 'feat' | 'model' | 'vm' | 'apc' | 'mon' | null;

const STEPS: Record<Exclude<StepId, null>, { label: string; sub: string; desc: string; color: string; ref: string }> = {
    data:  { label: '1. 데이터 수집', sub: 'EDA + SECS + 계측', desc: '스캐너 EDA, 트랙 SECS/GEM, 계측 DB에서 실시간 수집 → Kafka 적재.', color: '#3b82f6', ref: '3.8장' },
    feat:  { label: '2. 피처 엔지니어링', sub: '도메인 + FDC + 공간', desc: 'Dose×두께, Focus², PEB×시간 등 도메인 피처 + Cross-Layer 피처 생성.', color: '#22c55e', ref: '4.2장' },
    model: { label: '3. 모델 학습', sub: 'XGBoost + SHAP', desc: 'Time-Based CV, Optuna 튜닝, 물리 정합성 검증(SHAP Dependence).', color: '#f59e0b', ref: '4.3~4.4장' },
    vm:    { label: '4. VM 서빙', sub: 'CD/OVL 예측 + RI', desc: 'FastAPI 실시간 추론. RI≥0.7 → VM 신뢰, RI<0.7 → 실제 계측 요청.', color: '#a855f7', ref: '3.6+4.5장' },
    apc:   { label: '5. APC 보정', sub: 'EWMA+VM 하이브리드', desc: '보정값 = α×VM + (1-α)×EWMA. α는 RI에 따라 동적 조절. Safety Guard.', color: '#ef4444', ref: '3.5+4.8장' },
    mon:   { label: '6. 모니터링', sub: 'Drift + 재학습', desc: 'PSI/KS Drift 감지, 잔차 추세 모니터링. 임계값 초과 → 자동 재학습 트리거.', color: '#06b6d4', ref: '4.5장' },
};

const ORDER: Exclude<StepId, null>[] = ['data', 'feat', 'model', 'vm', 'apc', 'mon'];

const SVG_W = 820;
const SVG_H = 220;
const NODE_W = 118;
const NODE_H = 56;
const GAP_X = 12;
const TOTAL_W = ORDER.length * NODE_W + (ORDER.length - 1) * GAP_X;
const X0 = (SVG_W - TOTAL_W) / 2 + NODE_W / 2;
const CY = SVG_H / 2;

export default function SmilePipelineOverview() {
    const [hovered, setHovered] = useState<StepId>(null);
    const isDim = (id: StepId) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                SMILE End-to-End 파이프라인 — 6단계
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                데이터 → 피처 → 모델 → VM → APC → 모니터링 (재학습 루프)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 820 }}>
                    <defs>
                        <marker id="arrowSM" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {/* Forward arrows */}
                    {ORDER.slice(0, -1).map((_, i) => {
                        const x1 = X0 + i * (NODE_W + GAP_X) + NODE_W / 2;
                        const x2 = X0 + (i + 1) * (NODE_W + GAP_X) - NODE_W / 2;
                        return <line key={i} x1={x1} y1={CY} x2={x2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrowSM)" />;
                    })}
                    {/* Loop-back arrow (6.모니터링 → 3.모델학습): 재학습 */}
                    {(() => {
                        const xMon = X0 + 5 * (NODE_W + GAP_X);
                        const xModel = X0 + 2 * (NODE_W + GAP_X);
                        const yStart = CY + NODE_H / 2;
                        const yPeak = CY + NODE_H / 2 + 50;
                        return (
                            <g>
                                <path d={`M${xMon},${yStart} C${xMon},${yPeak} ${xModel},${yPeak} ${xModel},${yStart}`}
                                    fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth={1.5} strokeDasharray="6 3" markerEnd="url(#arrowSM)" />
                                <text x={(xMon + xModel) / 2} y={yPeak - 4}
                                    textAnchor="middle" fill="#06b6d4" fontSize={FONT.min} fontWeight={500} opacity={0.7}>↻ 재학습 트리거</text>
                            </g>
                        );
                    })()}
                    {/* Nodes */}
                    {ORDER.map((id, i) => {
                        const cx = X0 + i * (NODE_W + GAP_X);
                        const info = STEPS[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={cx - NODE_W / 2 - 4} y={CY - NODE_H / 2 - 4} width={NODE_W + 8} height={NODE_H + 8} fill="transparent" />
                                <rect x={cx - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={cx} y={CY - 8} textAnchor="middle" dominantBaseline="central"
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STEPS[hovered].color, marginBottom: 2 }}>{STEPS[hovered].label} <span style={{ fontWeight: 400, color: COLOR.textDim }}>({STEPS[hovered].ref})</span></div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{STEPS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. Part 1~4의 모든 지식이 이 파이프라인으로 통합됩니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
