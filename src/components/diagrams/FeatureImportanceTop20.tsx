'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { feature: 'PEB_온도_편차', importance: 0.142, color: '#ef4444' },
    { feature: 'Focus_오차²', importance: 0.128, color: '#ef4444' },
    { feature: 'Dose_변동', importance: 0.115, color: '#ef4444' },
    { feature: 'PM_이후_웨이퍼수', importance: 0.098, color: '#f59e0b' },
    { feature: 'Radius', importance: 0.087, color: '#f59e0b' },
    { feature: 'RF_Settling_Time', importance: 0.076, color: '#f59e0b' },
    { feature: 'Resist_두께', importance: 0.065, color: '#3b82f6' },
    { feature: '이전층_CD', importance: 0.058, color: '#3b82f6' },
    { feature: 'Gas_Flow_Std', importance: 0.052, color: '#3b82f6' },
    { feature: 'Pressure_Mean', importance: 0.048, color: '#3b82f6' },
    { feature: '이전층_OVL', importance: 0.042, color: '#22c55e' },
    { feature: 'Chuck_Temp_편차', importance: 0.038, color: '#22c55e' },
    { feature: 'Scan_Position', importance: 0.034, color: '#22c55e' },
    { feature: 'RF_Overshoot', importance: 0.031, color: '#22c55e' },
    { feature: 'Edge_Flag', importance: 0.028, color: '#6b7280' },
    { feature: 'Angle', importance: 0.024, color: '#6b7280' },
    { feature: 'Dose×Resist', importance: 0.021, color: '#6b7280' },
    { feature: 'PEB_시간', importance: 0.018, color: '#6b7280' },
    { feature: 'Chamber_ID', importance: 0.015, color: '#6b7280' },
    { feature: 'Lot_배치_ID', importance: 0.012, color: '#6b7280' },
];

export default function FeatureImportanceTop20() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Feature Importance — 상위 20개 피처
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                도메인 피처(PEB 온도, Focus²)가 최상위 — 물리 지식의 가치 입증
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={420} maxHeight={420}>
                    <BarChart data={DATA} layout="vertical" margin={{ top: 8, right: 40, left: 10, bottom: 8 }} barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" domain={[0, 0.16]} ticks={[0, 0.04, 0.08, 0.12, 0.16]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'Importance', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis type="category" dataKey="feature" width={130}
                            tick={{ fill: COLOR.textMuted, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small, color: COLOR.textMuted }}
                            labelStyle={{ color: COLOR.textBright }}
                            itemStyle={{ color: COLOR.textBright }}
                            formatter={(v?: number) => [`${((v ?? 0) * 100).toFixed(1)}%`, 'Importance']} />
                        <Bar dataKey="importance" isAnimationActive={false} radius={[0, 3, 3, 0]}>
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
