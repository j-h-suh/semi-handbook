'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { task: 'FDC Summary', xgb: 0.87, dl: 0.85, best: 'xgb' },
    { task: 'SEM ADC', xgb: 0.88, dl: 0.96, best: 'dl' },
    { task: '웨이퍼맵', xgb: 0.91, dl: 0.97, best: 'dl' },
    { task: 'Trace 분류', xgb: 0.83, dl: 0.90, best: 'dl' },
    { task: 'OVL 예측', xgb: 0.85, dl: 0.84, best: 'xgb' },
    { task: 'PM 예측', xgb: 0.78, dl: 0.82, best: 'dl' },
];

export default function DlVsXgboostPerformance() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                딥러닝 vs XGBoost 성능 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                이미지/Trace → 딥러닝 우위 | 정형 Summary → XGBoost 우위 또는 동등
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={280} maxHeight={280}>
                    <BarChart data={DATA} margin={{ top: 8, right: 30, left: 10, bottom: 8 }} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="task"
                            tick={{ fill: COLOR.textMuted, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                        <YAxis domain={[0.7, 1.0]} ticks={[0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'Accuracy / R²', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small }}
                            labelStyle={{ color: COLOR.textBright }}
                            itemStyle={{ color: COLOR.textBright }}
                            formatter={(v?: number, name?: string) => [`${((v ?? 0) * 100).toFixed(0)}%`, name ?? '']} />
                        <Legend wrapperStyle={{ fontSize: FONT.min, color: COLOR.textMuted }} />
                        <Bar dataKey="xgb" name="XGBoost" fill="#f59e0b" isAnimationActive={false} radius={[3, 3, 0, 0]}>
                            {DATA.map((d, i) => (
                                <Cell key={i} fill="#f59e0b" fillOpacity={d.best === 'xgb' ? 0.8 : 0.35} />
                            ))}
                        </Bar>
                        <Bar dataKey="dl" name="Deep Learning" fill="#3b82f6" isAnimationActive={false} radius={[3, 3, 0, 0]}>
                            {DATA.map((d, i) => (
                                <Cell key={i} fill="#3b82f6" fillOpacity={d.best === 'dl' ? 0.8 : 0.35} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
