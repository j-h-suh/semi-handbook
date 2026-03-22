'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StepId = 'img' | 'conv' | 'pool' | 'fc' | 'out' | null;

const STEPS: Record<Exclude<StepId, null>, { label: string; sub: string; desc: string; color: string }> = {
    img:  { label: 'SEM 이미지', sub: '64×64', desc: '검사 장비(ADC)가 촬영한 결함 후보 이미지. Grayscale 64×64 또는 128×128.', color: '#6b7280' },
    conv: { label: 'Conv Layers', sub: '특징 추출', desc: '여러 Convolution 레이어가 에지, 텍스처, 형태 등 저수준→고수준 특징을 자동으로 추출.', color: '#3b82f6' },
    pool: { label: 'Pooling', sub: '차원 축소', desc: 'Max/Average Pooling으로 공간 차원을 줄여 위치 불변성 확보 + 연산량 감소.', color: '#22c55e' },
    fc:   { label: 'FC Layer', sub: '분류', desc: 'Fully Connected 레이어 + Softmax로 각 결함 유형의 확률 산출.', color: '#a855f7' },
    out:  { label: '결함 유형', sub: 'Bridge/Break/...', desc: '최종 분류 결과: Bridge, Break, Particle, Residue 등. ~96% 정확도로 인간 전문가와 동등.', color: '#f59e0b' },
};

const ORDER: Exclude<StepId, null>[] = ['img', 'conv', 'pool', 'fc', 'out'];

const SVG_W = 560;
const SVG_H = 70;
const NODE_W = 96;
const NODE_H = 42;
const GAP = 12;
const TOTAL = ORDER.length * NODE_W + (ORDER.length - 1) * GAP;
const X0 = (SVG_W - TOTAL) / 2 + NODE_W / 2;
const CY = SVG_H / 2;

export default function CnnAdcPipeline() {
    const [hovered, setHovered] = useState<StepId>(null);
    const isDim = (id: StepId) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                CNN 기반 ADC 파이프라인
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                SEM 이미지 → 특징 추출 → 분류 → 결함 유형 (Rule-Based 80% → CNN 96%)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 560 }}>
                    <defs>
                        <marker id="arrowADC" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {ORDER.slice(0, -1).map((id, i) => {
                        const x1 = X0 + i * (NODE_W + GAP) + NODE_W / 2;
                        const x2 = X0 + (i + 1) * (NODE_W + GAP) - NODE_W / 2;
                        return <line key={i} x1={x1} y1={CY} x2={x2} y2={CY} stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrowADC)" />;
                    })}
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
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                                <text x={cx} y={CY + 10} textAnchor="middle" dominantBaseline="central"
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. CNN 기반 ADC는 반도체 딥러닝의 가장 성공적 사례입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
