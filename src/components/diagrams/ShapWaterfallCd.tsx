'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { feature: 'PEB 온도 ↑', shap: 0.8, color: '#ef4444' },
    { feature: 'Dose ↓', shap: 0.5, color: '#ef4444' },
    { feature: '레지스트 두꺼움', shap: 0.3, color: '#ef4444' },
    { feature: '장비B 사용', shap: -0.2, color: '#3b82f6' },
    { feature: 'Focus 양호', shap: -0.1, color: '#3b82f6' },
];

const BASE_CD = 20.0;
const FINAL_CD = 21.3;

export default function ShapWaterfallCd() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                SHAP Waterfall Plot — CD 예측 해석
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                기본 CD {BASE_CD}nm → 최종 예측 {FINAL_CD}nm: 각 피처의 기여분 분해
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={260} maxHeight={260}>
                    <BarChart data={DATA} layout="vertical" margin={{ top: 8, right: 60, left: 10, bottom: 8 }} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" domain={[-0.5, 1.0]} ticks={[-0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'SHAP Value (nm)', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis type="category" dataKey="feature" width={130}
                            tick={{ fill: COLOR.textMuted, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                        <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small }}
                            labelStyle={{ color: COLOR.textBright }}
                            itemStyle={{ color: COLOR.textBright }}
                            formatter={(v?: number) => [`${(v ?? 0) > 0 ? '+' : ''}${(v ?? 0).toFixed(1)} nm`, 'SHAP']} />
                        <Bar dataKey="shap" isAnimationActive={false} radius={[0, 4, 4, 0]}>
                            {DATA.map((d, i) => (
                                <Cell key={i} fill={d.color} fillOpacity={0.7} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4 }}>
                <span style={{ color: '#ef4444', fontSize: FONT.min }}>■ CD 증가 방향 (+)</span>
                <span style={{ color: '#3b82f6', fontSize: FONT.min }}>■ CD 감소 방향 (−)</span>
            </div>
        </div>
    );
}
