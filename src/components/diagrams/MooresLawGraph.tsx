'use client';

import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const chipData = [
    { year: 1971, transistors: 2300, name: 'Intel 4004', node: '10μm' },
    { year: 1978, transistors: 29000, name: 'Intel 8086', node: '3μm' },
    { year: 1985, transistors: 275000, name: 'Intel 386', node: '1.5μm' },
    { year: 1989, transistors: 1200000, name: 'Intel 486', node: '1μm' },
    { year: 1993, transistors: 3100000, name: 'Pentium', node: '0.8μm' },
    { year: 1999, transistors: 9500000, name: 'Pentium III', node: '250nm' },
    { year: 2004, transistors: 125000000, name: 'Pentium 4 (Prescott)', node: '90nm' },
    { year: 2006, transistors: 291000000, name: 'Core 2 Duo', node: '65nm' },
    { year: 2010, transistors: 1170000000, name: 'Core i7 (Westmere)', node: '32nm' },
    { year: 2015, transistors: 2000000000, name: 'Apple A9', node: '14nm' },
    { year: 2017, transistors: 4300000000, name: 'Apple A11', node: '10nm' },
    { year: 2020, transistors: 16000000000, name: 'Apple M1', node: '5nm' },
    { year: 2022, transistors: 20000000000, name: 'Apple M2 Ultra', node: '5nm' },
    { year: 2024, transistors: 28000000000, name: 'Apple M4 Max', node: '3nm' },
];

/* Moore's Law trend line: doubles every 2 years from 1971 base */
const trendData = Array.from({ length: 28 }, (_, i) => {
    const year = 1971 + i * 2;
    return { year, transistors: 2300 * Math.pow(2, i) };
}).filter(d => d.year <= 2025);

function formatTransistors(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return String(n);
}

const logTicks = [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11];

export default function MooresLawGraph() {
    const [activeChip, setActiveChip] = useState<string | null>(null);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                무어의 법칙: 트랜지스터 집적도의 궤적
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Moore&apos;s Law — Transistor Count over Time (Log Scale)
            </p>

            <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="year" type="number" domain={[1970, 2026]}
                        ticks={[1970, 1980, 1990, 2000, 2010, 2020]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '연도', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        dataKey="transistors" type="number" scale="log" domain={[1e3, 2e11]}
                        ticks={logTicks} allowDataOverflow
                        tickFormatter={(v: number) => {
                            const exp = Math.round(Math.log10(v));
                            const supers = '⁰¹²³⁴⁵⁶⁷⁸⁹';
                            return '10' + String(exp).split('').map(c => c === '-' ? '⁻' : supers[Number(c)]).join('');
                        }}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '트랜지스터 수', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <Tooltip
                        contentStyle={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, backdropFilter: 'blur(8px)', fontSize: FONT.small }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        content={({ payload }: any) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d?.name) return null;
                            return (
                                <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: '#22d3ee', marginBottom: 4 }}>{d.name}</div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>{d.year}년 · {d.node}</div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>트랜지스터: {formatTransistors(d.transistors)}개</div>
                                </div>
                            );
                        }}
                    />
                    {/* Trend line */}
                    <Scatter data={trendData} fill="none" line={{ stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '6,4' }} legendType="none" isAnimationActive={false}>
                        {trendData.map((_, i) => (
                            <circle key={i} r={0} fill="none" />
                        ))}
                    </Scatter>
                    {/* Data points */}
                    <Scatter
                        data={chipData} fill="#22d3ee"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onMouseEnter={(d: any) => setActiveChip(d?.name)}
                        onMouseLeave={() => setActiveChip(null)}
                    >
                        {chipData.map((entry, i) => (
                            <circle key={i} r={activeChip === entry.name ? 6 : 4} fill="#22d3ee"
                                opacity={activeChip !== null && activeChip !== entry.name ? 0.3 : 0.8} />
                        ))}
                    </Scatter>
                    <ReferenceLine x={2006} stroke="#ef4444" strokeDasharray="4,3" strokeWidth={1} opacity={0.5} />
                </ScatterChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22d3ee', opacity: 0.8 }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>실제 칩</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 20, height: 0, borderTop: '2px dashed #f59e0b' }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>2년마다 2배 추세</span>
                </div>
            </div>
        </div>
    );
}
