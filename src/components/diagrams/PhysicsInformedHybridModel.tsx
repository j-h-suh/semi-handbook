'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'input' | 'physics' | 'ml' | 'combine' | 'output' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    input:   { label: 'Input X', sub: '피처', desc: 'FDC Summary, Trace 피처, 공간 좌표, Cross-Layer 등 모든 피처가 동일한 입력으로 양쪽 모델에 전달된다.', color: '#6b7280' },
    physics: { label: 'Physics Model', sub: 'ŷ_phys', desc: 'Overlay 선형 모델, Dose-CD 관계, Rayleigh 등 알려진 물리 방정식. Correctables를 잡고, 해석 가능한 예측 제공.', color: '#22c55e' },
    ml:      { label: 'ML Model', sub: 'Δŷ_ml', desc: '물리 모델의 잔차(Residual)만 학습. XGBoost/NN이 비선형 상호작용, HOWA 등 물리 모델이 놓치는 패턴 포착.', color: '#3b82f6' },
    combine: { label: '+', sub: '결합', desc: 'ŷ = ŷ_phys + Δŷ_ml. 물리 모델이 대부분을 설명하고, ML이 잔차만 보정 → 물리 정합성 보장 + 정확도 향상.', color: '#a855f7' },
    output:  { label: 'Final ŷ', sub: '최종 예측', desc: '물리적으로 타당하면서도 정확한 예측. 해석 가능: 물리 성분은 방정식으로, ML 성분은 SHAP으로 설명.', color: '#f59e0b' },
};

const SVG_W = 560;
const SVG_H = 140;
const NODE_W = 110;
const NODE_H = 42;

/* Layout: Input(left) → Physics(top) + ML(bottom) → +(center) → Output(right) */
const INPUT_X = 70;
const BRANCH_X = 210;
const COMBINE_X = 370;
const OUTPUT_X = 500;
const CY = SVG_H / 2;
const BRANCH_GAP = 28; /* half vertical distance between Physics and ML */

const POS: Record<Exclude<NodeId, null>, { x: number; y: number }> = {
    input:   { x: INPUT_X, y: CY },
    physics: { x: BRANCH_X, y: CY - BRANCH_GAP },
    ml:      { x: BRANCH_X, y: CY + BRANCH_GAP },
    combine: { x: COMBINE_X, y: CY },
    output:  { x: OUTPUT_X, y: CY },
};

export default function PhysicsInformedHybridModel() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDim = (id: NodeId) => hovered !== null && hovered !== id;

    const arrow = (x1: number, y1: number, x2: number, y2: number) => (
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.12)" strokeWidth={1} markerEnd="url(#arrowM)" />
    );

    const renderNode = (id: Exclude<NodeId, null>) => {
        const { x, y } = POS[id];
        const info = NODES[id];
        const active = hovered === id;
        const isPlus = id === 'combine';
        const w = isPlus ? 36 : NODE_W;
        const h = isPlus ? 36 : NODE_H;
        return (
            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={x - w / 2 - 6} y={y - h / 2 - 6} width={w + 12} height={h + 12} fill="transparent" />
                <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={isPlus ? 18 : 8}
                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                <text x={x} y={isPlus ? y + 1 : y - 6} textAnchor="middle" dominantBaseline="central"
                    fill={active ? info.color : COLOR.textMuted} fontSize={isPlus ? 16 : FONT.min} fontWeight={600}>{info.label}</text>
                {!isPlus && <text x={x} y={y + 10} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>}
            </motion.g>
        );
    };

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Physics-Informed 하이브리드 모델 구조
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                ŷ = Physics_Model(X) + ML_Residual(X) — 물리 + 데이터의 최적 결합
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 560 }}>
                    <defs>
                        <marker id="arrowM" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.2)" />
                        </marker>
                    </defs>

                    {/* Input → Physics (upper branch) */}
                    {arrow(INPUT_X + NODE_W / 2, CY, BRANCH_X - NODE_W / 2, CY - BRANCH_GAP)}
                    {/* Input → ML (lower branch) */}
                    {arrow(INPUT_X + NODE_W / 2, CY, BRANCH_X - NODE_W / 2, CY + BRANCH_GAP)}
                    {/* Physics → Combine */}
                    {arrow(BRANCH_X + NODE_W / 2, CY - BRANCH_GAP, COMBINE_X - 18, CY - 4)}
                    {/* ML → Combine */}
                    {arrow(BRANCH_X + NODE_W / 2, CY + BRANCH_GAP, COMBINE_X - 18, CY + 4)}
                    {/* Combine → Output */}
                    {arrow(COMBINE_X + 18, CY, OUTPUT_X - NODE_W / 2, CY)}

                    {renderNode('input')}
                    {renderNode('physics')}
                    {renderNode('ml')}
                    {renderNode('combine')}
                    {renderNode('output')}
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 블록을 호버하세요. 물리 모델 + ML 잔차의 하이브리드가 SMILE 핵심 아키텍처입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
