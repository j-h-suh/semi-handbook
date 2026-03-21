'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { model: '6par', label: '6par (선형)', residual: 2.8, color: '#4169E1', desc: 'Translation + Rotation + Magnification — 6개 파라미터' },
    { model: '19par', label: '19par', residual: 2.2, color: '#6495ED', desc: '6par + 고차 항 추가 — 19개 파라미터' },
    { model: 'HOWA', label: '38par / HOWA', residual: 1.6, color: '#22c55e', desc: '최대 5차 다항식 — 38개 파라미터' },
    { model: 'CPE', label: 'CPE (필드별)', residual: 1.2, color: '#ffd700', desc: '각 필드 독립 보정 — N_fields × 2 파라미터' },
    { model: 'AI', label: 'AI/ML (SMILE)', residual: 0.9, color: '#ef4444', desc: '비선형 + 다층 피처 — 비파라메트릭 모델' },
];

type ModelId = string | null;

export default function ModelResidualComparison() {
    const [hovered, setHovered] = useState<ModelId>(null);
    const hoveredData = DATA.find(d => d.model === hovered);

    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                모델별 잔차(Residual) 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                선형 → 고차 → AI — 잔차 3σ (nm)
            </p>

            <div style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={DATA} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="label" tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
                        <YAxis domain={[0, 3.5]} tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false}
                            label={{ value: '잔차 3σ (nm)', angle: -90, position: 'insideLeft', fill: COLOR.textDim, fontSize: FONT.min, dx: -4 }} />
                        <ReferenceLine y={1.5} stroke="rgba(239,68,68,0.4)" strokeDasharray="6 3"
                            label={{ value: '3nm 공정 요구', fill: 'rgba(239,68,68,0.5)', fontSize: FONT.min, position: 'right' }} />
                        <Tooltip content={() => null} />
                        <Bar dataKey="residual" radius={[4, 4, 0, 0]}
                            onMouseLeave={() => setHovered(null)}>
                            {DATA.map((entry) => (
                                <Cell key={entry.model} fill={hovered === entry.model ? entry.color : `${entry.color}80`}
                                    onMouseEnter={() => setHovered(entry.model)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hoveredData ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: hoveredData.color, marginBottom: 2 }}>
                                {hoveredData.label} — 잔차 {hoveredData.residual}nm (3σ)
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {hoveredData.desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 바를 호버하세요. AI가 줄이는 0.3~0.5nm → 수율 수 % 차이 → 연간 수백억 원의 가치.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
