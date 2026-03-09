'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const clockData = [
    { year: 1990, clock: 0.033, chip: 'Intel 486 (33MHz)' },
    { year: 1993, clock: 0.066, chip: 'Pentium (66MHz)' },
    { year: 1995, clock: 0.2, chip: 'Pentium Pro (200MHz)' },
    { year: 1998, clock: 0.45, chip: 'Pentium II (450MHz)' },
    { year: 2000, clock: 1.0, chip: 'Pentium III (1GHz)' },
    { year: 2002, clock: 2.2, chip: 'Pentium 4 (2.2GHz)' },
    { year: 2004, clock: 3.4, chip: 'Pentium 4 (3.4GHz)' },
    { year: 2006, clock: 3.0, chip: 'Core 2 Duo (3GHz)' },
    { year: 2008, clock: 3.2, chip: 'Core i7 (3.2GHz)' },
    { year: 2010, clock: 3.3, chip: 'Core i7-980X (3.3GHz)' },
    { year: 2012, clock: 3.5, chip: 'Core i7-3770K (3.5GHz)' },
    { year: 2014, clock: 4.0, chip: 'Core i7-4790K (4GHz)' },
    { year: 2016, clock: 4.0, chip: 'Core i7-6700K (4GHz)' },
    { year: 2018, clock: 5.0, chip: 'Core i9-9900K (5GHz)' },
    { year: 2020, clock: 5.3, chip: 'Core i9-10900K (5.3GHz)' },
    { year: 2022, clock: 5.5, chip: 'Core i9-13900K (5.5GHz)' },
    { year: 2024, clock: 5.8, chip: 'Core i9-14900K (5.8GHz)' },
];

export default function ClockFrequencyStagnation() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                클럭 주파수의 정체
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Clock Frequency Stagnation — The End of Dennard Scaling
            </p>

            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={clockData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="year" type="number" domain={[1990, 2025]}
                        ticks={[1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '연도', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        domain={[0, 7]}
                        ticks={[0, 1, 2, 3, 4, 5, 6]}
                        label={{ value: 'GHz', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <Tooltip
                        contentStyle={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, backdropFilter: 'blur(8px)', fontSize: FONT.small }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        content={({ payload }: any) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            return (
                                <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: d.year <= 2005 ? '#22c55e' : '#ef4444', marginBottom: 4 }}>{d.chip}</div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>{d.year}년 · {d.clock} GHz</div>
                                </div>
                            );
                        }}
                    />
                    <ReferenceLine x={2006} stroke="#ef4444" strokeDasharray="4,3" strokeWidth={1.5}
                        label={{ value: '데나드 스케일링 종말', position: 'insideTopRight', style: { fontSize: FONT.min, fill: '#ef4444' } }} />
                    <Line type="monotone" dataKey="clock" stroke="#22d3ee" strokeWidth={2.5} dot={{ fill: '#22d3ee', r: 3, strokeWidth: 0 }} />
                </LineChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 3, background: '#22d3ee', borderRadius: 2 }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>최대 클럭 주파수</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 0, borderTop: '2px dashed #ef4444' }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>~2006: 스케일링 한계</span>
                </div>
            </div>
        </div>
    );
}
