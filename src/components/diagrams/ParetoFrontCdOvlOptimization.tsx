'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* Pareto front + dominated points */
const PARETO = [
    { cd: 0.3, ovl: 2.8 },
    { cd: 0.5, ovl: 2.0 },
    { cd: 0.8, ovl: 1.5 },
    { cd: 1.2, ovl: 1.1 },
    { cd: 1.8, ovl: 0.8 },
    { cd: 2.2, ovl: 0.5 },
];
const DOMINATED = [
    { cd: 0.8, ovl: 2.5 },
    { cd: 1.0, ovl: 2.2 },
    { cd: 1.5, ovl: 1.8 },
    { cd: 1.2, ovl: 2.0 },
    { cd: 2.0, ovl: 1.5 },
    { cd: 1.8, ovl: 1.8 },
    { cd: 0.6, ovl: 2.6 },
    { cd: 2.5, ovl: 1.2 },
];

export default function ParetoFrontCdOvlOptimization() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Pareto Front — CD vs Overlay 다목적 최적화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Pareto 위의 해 중 최종 선택은 비즈니스/엔지니어링 판단
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={280} maxHeight={280}>
                    <ScatterChart margin={{ top: 8, right: 30, left: 10, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" dataKey="cd" name="CD 오차" domain={[0, 3]} ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'CD 오차 (nm)', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis type="number" dataKey="ovl" name="OVL 오차" domain={[0, 3]} ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'OVL 오차 (nm)', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small }}
                            labelStyle={{ color: COLOR.textBright }}
                            itemStyle={{ color: COLOR.textBright }}
                            formatter={(v?: number, name?: string) => [`${(v ?? 0).toFixed(1)} nm`, name ?? '']} />
                        <Scatter data={PARETO} name="Pareto Front" fill="#f59e0b" line={{ stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '4 2' }} isAnimationActive={false} />
                        <Scatter data={DOMINATED} name="Dominated" fill="rgba(255,255,255,0.15)" isAnimationActive={false} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
                <span style={{ color: '#f59e0b', fontSize: FONT.min }}>● Pareto Front (최적)</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: FONT.min }}>● Dominated (열위)</span>
            </div>
        </div>
    );
}
