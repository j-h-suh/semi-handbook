'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 (02_14.json 스펙 기준) ─── */
const data = [
    { year: 2017, tsmc: 2, samsung: 1, intel: 0, others: 0 },
    { year: 2018, tsmc: 8, samsung: 3, intel: 1, others: 0 },
    { year: 2019, tsmc: 20, samsung: 8, intel: 3, others: 1 },
    { year: 2020, tsmc: 35, samsung: 15, intel: 6, others: 2 },
    { year: 2021, tsmc: 55, samsung: 22, intel: 10, others: 5 },
    { year: 2022, tsmc: 75, samsung: 28, intel: 15, others: 8 },
    { year: 2023, tsmc: 90, samsung: 32, intel: 18, others: 12 },
    { year: 2024, tsmc: 100, samsung: 35, intel: 22, others: 15 },
    { year: 2025, tsmc: 110, samsung: 38, intel: 25, others: 18 },
];

const SERIES = [
    { key: 'tsmc', name: 'TSMC', color: '#ef4444' },
    { key: 'samsung', name: 'Samsung', color: '#3b82f6' },
    { key: 'intel', name: 'Intel', color: '#22c55e' },
    { key: 'others', name: 'Others', color: '#f59e0b' },
] as const;

export default function EuvScannerInstallation() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                전 세계 EUV 스캐너 누적 설치 추이
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Cumulative EUV Scanner Installations by Customer (2017–2025)
            </p>

            <ResponsiveContainer width="100%" height={360}>
                <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="year"
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '연도', position: 'bottom', offset: 6, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '누적 설치 대수', angle: -90, position: 'insideLeft', offset: 4, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                        domain={[0, 200]}
                        ticks={[0, 50, 100, 150, 200]}
                    />
                    <Tooltip
                        contentStyle={{
                            background: COLOR.tooltipBg,
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            backdropFilter: 'blur(8px)',
                            fontSize: FONT.small,
                        }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        content={({ payload, label }: any) => {
                            if (!payload || payload.length === 0) return null;
                            const total = payload.reduce((s: number, p: { value: number }) => s + (p.value || 0), 0);
                            return (
                                <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: '#22d3ee', marginBottom: 4 }}>
                                        {label}년 · 합계 {total}대
                                    </div>
                                    {payload.map((p: { name: string; value: number; color: string }, i: number) => (
                                        <div key={i} style={{ fontSize: FONT.small, color: COLOR.textMuted, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                            <span style={{ color: p.color }}>{p.name}</span>
                                            <span>{p.value}대</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        }}
                    />
                    {SERIES.map(s => (
                        <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={s.color} opacity={0.85} />
                    ))}
                    <ReferenceLine x={2019} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1} opacity={0.5}
                        label={{ value: 'N7+ 양산', position: 'top', fill: COLOR.textDim, fontSize: FONT.min }} />
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4, flexWrap: 'wrap' }}>
                {SERIES.map(s => (
                    <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, opacity: 0.85 }} />
                        <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>{s.name}</span>
                    </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 0, borderTop: '2px dashed #ef4444', opacity: 0.5 }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>N7+ 양산 시작</span>
                </div>
            </div>

            {/* 주석 */}
            <p style={{ textAlign: 'center', fontSize: FONT.min, color: COLOR.textDim, marginTop: 8 }}>
                1대당 ~4억 달러 · 200대 기준 총 투자 ~800억 달러 · ASML 독점 공급
            </p>
        </div>
    );
}
