'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { label: 'Current Layer Only', r2: 0.62, color: '#6b7280' },
    { label: '+ Cross-Layer CD', r2: 0.78, color: '#3b82f6' },
    { label: '+ Cross-Layer OVL', r2: 0.84, color: '#22c55e' },
    { label: '+ Cross-Layer 막두께', r2: 0.89, color: '#a855f7' },
];

export default function CrossLayerR2Comparison() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Cross-Layer 피처 효과 — R² 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                이전 층 데이터를 추가할수록 예측 정확도(R²)가 10~30% 향상
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={240} maxHeight={240}>
                    <BarChart data={DATA} layout="vertical" margin={{ top: 8, right: 40, left: 20, bottom: 8 }} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'R²', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis type="category" dataKey="label" width={140}
                            tick={{ fill: COLOR.textMuted, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small, color: COLOR.textMuted }}
                            labelStyle={{ color: COLOR.textBright }}
                            itemStyle={{ color: COLOR.textBright }}
                            formatter={(v?: number) => [`${(v ?? 0).toFixed(2)}`, 'R²']} />
                        <Bar dataKey="r2" isAnimationActive={false} radius={[0, 4, 4, 0]}>
                            {DATA.map((d, i) => (
                                <Cell key={i} fill={d.color} fillOpacity={0.7} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
