'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, LabelList } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 (04_03.json 스펙) ─── */
const data = [
    { name: '랜덤 분할\n(오프라인)', r2: 0.95, color: '#ef4444' },
    { name: '시간 기반 분할\n(오프라인)', r2: 0.85, color: '#3b82f6' },
    { name: '실전 배포\n(온라인)', r2: 0.70, color: '#71717a' },
];

export default function RandomVsTimeSplitR2() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                랜덤 분할 vs 시간 기반 분할 — R² 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Random Split의 환상 — 오프라인 0.95 → 실전 0.70 급락
            </p>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 32 }} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                        dataKey="name" tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                    />
                    <YAxis
                        domain={[0.5, 1.0]} ticks={[0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: 'R² (결정계수)', angle: -90, position: 'insideLeft', offset: 4, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <Tooltip
                        isAnimationActive={false}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        content={({ payload }: any) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            return (
                                <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: d.color, marginBottom: 2 }}>R² = {d.r2}</div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>{d.name.replace('\n', ' ')}</div>
                                </div>
                            );
                        }}
                    />
                    {/* 실전 최소 요구 수준 */}
                    <ReferenceLine y={0.80} stroke="#22c55e" strokeDasharray="6 4" label={{ value: '실전 최소 요구', position: 'right', fill: '#22c55e', fontSize: FONT.min }} />
                    <Bar dataKey="r2" radius={[6, 6, 0, 0]}>
                        {data.map((d, i) => <Cell key={i} fill={d.color} opacity={0.85} />)}
                        <LabelList dataKey="r2" position="top" fill={COLOR.textMuted} fontSize={FONT.body} fontWeight={700} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* 갭 주석 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: FONT.min, color: '#ef4444' }}>랜덤→실전 갭: 0.25 (치명적)</span>
                <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>|</span>
                <span style={{ fontSize: FONT.min, color: '#3b82f6' }}>시간→실전 갭: 0.15 (관리 가능)</span>
            </div>
        </div>
    );
}
