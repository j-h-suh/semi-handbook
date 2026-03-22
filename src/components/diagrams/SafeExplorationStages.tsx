'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StageId = 'safe' | 'expand1' | 'expand2' | 'full' | null;

const STAGES: Record<Exclude<StageId, null>, { label: string; range: string; desc: string; color: string; pct: number }> = {
    safe:    { label: 'Hard Bounds', range: '±1%', desc: '물리적/규격 한계로 탐색 범위 제한. 가장 단순하고 확실한 안전 장치. Dose ∈ [20,30] mJ/cm².', color: '#22c55e', pct: 0.3 },
    expand1: { label: '1단계 확대', range: '±2%', desc: '1단계 안전 확인 후 범위 확장. Constrained BO로 제약 만족 확률 90% 이상인 영역만 탐색.', color: '#3b82f6', pct: 0.5 },
    expand2: { label: '2단계 확대', range: '±5%', desc: 'Safety Critic이 제안 행동의 위험도 평가. 위험 행동 사전 차단. 탐색 범위 추가 확장.', color: '#f59e0b', pct: 0.75 },
    full:    { label: '전체 탐색', range: '전범위', desc: '충분한 안전 확인 후 전체 파라미터 공간 탐색. Shadow→Advisory→Semi-Auto→Full Auto 로드맵과 동일 철학.', color: '#ef4444', pct: 1.0 },
};

const ORDER: Exclude<StageId, null>[] = ['safe', 'expand1', 'expand2', 'full'];

const SVG_W = 700;
const SVG_H = 180;
const CX = SVG_W / 2;
const CY = 80;
const MAX_R = 72;

export default function SafeExplorationStages() {
    const [hovered, setHovered] = useState<StageId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Safe Exploration — 점진적 탐색 범위 확대
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                안전 확인 후 단계적으로 탐색 범위를 넓힌다
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    {/* Concentric ellipses (reversed for z-order) */}
                    {[...ORDER].reverse().map(id => {
                        const info = STAGES[id];
                        const rx = MAX_R * info.pct * 2.5;
                        const ry = MAX_R * info.pct;
                        const active = hovered === id;
                        return (
                            <motion.g key={id} animate={{ opacity: hovered !== null && hovered !== id ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
                                <ellipse cx={CX} cy={CY} rx={rx} ry={ry}
                                    fill={active ? `${info.color}08` : 'transparent'}
                                    stroke={active ? `${info.color}60` : `${info.color}20`} strokeWidth={active ? 1.5 : 1}
                                    strokeDasharray={id === 'full' ? '4 2' : undefined} style={{ cursor: 'pointer' }}
                                    onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)} />
                            </motion.g>
                        );
                    })}
                    {/* Center dot */}
                    <circle cx={CX} cy={CY} r={4} fill={COLOR.textMuted} />
                    <text x={CX} y={CY + 18} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.small}>현재 조건</text>
                    {/* Labels */}
                    {ORDER.map((id, i) => {
                        const info = STAGES[id];
                        const rx = MAX_R * info.pct * 2.5;
                        const labelX = CX + rx + 8;
                        const active = hovered === id;
                        return (
                            <motion.text key={id} x={labelX} y={CY - MAX_R * info.pct + 10}
                                textAnchor="start" fill={active ? info.color : COLOR.textDim} fontSize={FONT.small}
                                fontWeight={active ? 600 : 400}
                                animate={{ opacity: hovered !== null && hovered !== id ? 0.15 : 1 }}
                                transition={{ duration: 0.15 }}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                style={{ cursor: 'pointer' }}>
                                {info.range}
                            </motion.text>
                        );
                    })}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STAGES[hovered].color, marginBottom: 2 }}>{STAGES[hovered].label} ({STAGES[hovered].range})</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{STAGES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 영역을 호버하세요. 안전 확인 후 단계적으로 탐색 범위를 확대합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
