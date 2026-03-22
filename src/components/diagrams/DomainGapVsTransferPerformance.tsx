'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { gap: 0.5, perf: 0.93, label: 'PM 전후', color: '#22c55e' },
    { gap: 1.5, perf: 0.88, label: '장비 간', color: '#3b82f6' },
    { gap: 3.0, perf: 0.78, label: '제품 간', color: '#f59e0b' },
    { gap: 4.5, perf: 0.62, label: '팹 간', color: '#ef4444' },
];

export default function DomainGapVsTransferPerformance() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                도메인 차이 vs 전이 성능
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                도메인 차이가 클수록 전이 성능 저하 — 단순 전이 방법의 한계
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={260} maxHeight={260}>
                    <ScatterChart margin={{ top: 8, right: 30, left: 10, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" dataKey="gap" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'Domain Gap (PSI)', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis type="number" dataKey="perf" domain={[0.5, 1.0]} ticks={[0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'Transfer R²', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <ReferenceLine y={0.85} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 3"
                            label={{ value: 'Acceptable', fill: COLOR.textDim, fontSize: FONT.min, position: 'insideTopRight' }} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small }}
                            labelStyle={{ color: COLOR.textBright }}
                            itemStyle={{ color: COLOR.textBright }}
                            formatter={(v?: number, name?: string) => {
                                if (name === 'perf') return [`${(v ?? 0).toFixed(2)}`, 'R²'];
                                return [`${(v ?? 0).toFixed(1)}`, 'Gap'];
                            }} />
                        {DATA.map((d, i) => (
                            <Scatter key={i} data={[d]} fill={d.color} name={d.label}>
                            </Scatter>
                        ))}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            {/* Labels */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                {DATA.map(d => (
                    <span key={d.label} style={{ color: d.color, fontSize: FONT.min }}>● {d.label}</span>
                ))}
            </div>
        </div>
    );
}
