'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type StepId = 'data' | 'fe' | 'split' | 'sel' | 'train' | 'eval' | 'deploy' | 'monitor' | null;

const STEPS: Record<Exclude<StepId, null>, { label: string; sub: string; desc: string; color: string }> = {
    data:    { label: '데이터 수집', sub: 'FDC + 계측 매칭', desc: '3.8장의 데이터 인프라에서 FDC Trace, MES 이력, 계측 데이터를 수집하고 Wafer_ID 기준으로 매칭한다.', color: '#3b82f6' },
    fe:      { label: '피처 엔지니어링', sub: '도메인 피처 생성', desc: '4.2장의 도메인 지식 기반 피처를 생성한다. Summary Statistics, Trace 피처, Cross-Layer 피처 등.', color: '#22c55e' },
    split:   { label: '시간 기반 분할', sub: 'Train / Val / Test', desc: '시간 순서를 보존하여 Train(과거)/Validation(중간)/Test(최신)로 분할. 랜덤 분할 금지.', color: '#f59e0b' },
    sel:     { label: '피처 선택', sub: '상관 필터 + 모델 기반', desc: '상관 분석으로 불필요한 피처를 제거하고, 모델 기반(SHAP, Permutation Importance)으로 핵심 피처를 선별.', color: '#a78bfa' },
    train:   { label: '모델 학습', sub: '+ 하이퍼파라미터 튜닝', desc: 'Time-Based CV + Optuna로 하이퍼파라미터를 최적화하며 모델을 학습. Sliding Window 기반 재학습 전략.', color: '#ef4444' },
    eval:    { label: '오프라인 평가', sub: 'RMSE, R², 잔차 분석', desc: 'Test 셋에서 최종 성능 평가. RMSE 절대값, R², 잔차 분포(정규성, 시간 패턴)를 종합 검토.', color: '#22d3ee' },
    deploy:  { label: '배포', sub: '실시간 추론 서비스', desc: 'FastAPI/TensorRT 기반 실시간 추론. A/B 테스트로 기존 모델과 비교 후 전면 전환.', color: '#f472b6' },
    monitor: { label: '온라인 모니터링', sub: 'Drift 감지, A/B 테스트', desc: '예측 오차 추이, 잔차 분포, 비즈니스 메트릭을 모니터링. 열화 감지 시 재학습 트리거 → 데이터 수집으로 순환.', color: '#fb923c' },
};

const STEP_ORDER: Exclude<StepId, null>[] = ['data', 'fe', 'split', 'sel', 'train', 'eval', 'deploy', 'monitor'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 780;
const SVG_H = 370;
const CX = SVG_W / 2;
const CY = SVG_H / 2;
const RX = 290;
const RY = 130;
const BOX_W = 130;
const BOX_H = 50;

/* 타원 위에 8개 노드를 배치 — 상단 중앙부터 시계 방향 */
function getPos(i: number) {
    const angle = -Math.PI / 2 + (i / STEP_ORDER.length) * 2 * Math.PI;
    return { x: CX + RX * Math.cos(angle), y: CY + RY * Math.sin(angle) };
}

export default function SemiMLPipeline() {
    const [hovered, setHovered] = useState<StepId>(null);
    const isDimmed = (id: Exclude<StepId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                반도체 ML 파이프라인
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                데이터 수집 → 학습 → 배포 → 모니터링 → 재학습 순환
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 750 }}>
                    {/* 연결선 (순환) */}
                    {STEP_ORDER.map((_, i) => {
                        const from = getPos(i);
                        const to = getPos((i + 1) % STEP_ORDER.length);
                        return (
                            <g key={`edge-${i}`}>
                                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                    stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                            </g>
                        );
                    })}

                    {/* 노드 */}
                    {STEP_ORDER.map((id, i) => {
                        const pos = getPos(i);
                        const info = STEPS[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={pos.x - BOX_W / 2 - 6} y={pos.y - BOX_H / 2 - 4} width={BOX_W + 12} height={BOX_H + 8} fill="transparent" />
                                <rect x={pos.x - BOX_W / 2} y={pos.y - BOX_H / 2} width={BOX_W} height={BOX_H} rx={10}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={pos.x} y={pos.y - 2} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.body} fontWeight={700}>{info.label}</text>
                                <text x={pos.x} y={pos.y + 14} textAnchor="middle"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
                            </motion.g>
                        );
                    })}

                    {/* 중앙 순환 아이콘 */}
                    <text x={CX} y={CY + 4} textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize={32}>⟳</text>
                </svg>
            </div>

            {/* 툴팁 */}
            <div style={{ maxWidth: 700, margin: '0 auto', height: 52 }}>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 단계를 호버하여 반도체 ML 파이프라인의 세부 내용을 확인하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
