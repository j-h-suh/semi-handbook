'use client';

import React, { useState } from 'react';
import {
    ResponsiveContainer, ScatterChart, Scatter,
    XAxis, YAxis, Tooltip, CartesianGrid,
    Cell,
} from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 ─── */
interface DataPoint {
    name: string;
    wavelength: number;
    resolution: number;
    year: string;
    note?: string;
    color: string;
    group: string;
}

const DATA: DataPoint[] = [
    { name: 'g-line', wavelength: 436, resolution: 800, year: '1980s', color: '#fbbf24', group: '수은램프' },
    { name: 'i-line', wavelength: 365, resolution: 350, year: '1990s', color: '#f59e0b', group: '수은램프' },
    { name: 'KrF', wavelength: 248, resolution: 180, year: '2000s', color: '#ef4444', group: 'DUV' },
    { name: 'ArF (dry)', wavelength: 193, resolution: 65, year: '2003', color: '#3b82f6', group: 'DUV' },
    { name: 'ArF-i (SP)', wavelength: 193, resolution: 38, year: '2006', color: '#60a5fa', group: 'DUV' },
    { name: 'ArF-i (MP)', wavelength: 193, resolution: 7, year: '2015', color: '#818cf8', group: 'DUV', note: '멀티패터닝' },
    { name: 'EUV', wavelength: 13.5, resolution: 13, year: '2019', color: '#c084fc', group: 'EUV' },
    { name: 'High-NA EUV', wavelength: 13.5, resolution: 8, year: '2026', color: '#e879f9', group: 'EUV', note: '예상' },
];

/* ─── 커스텀 툴팁 ─── */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DataPoint }> }) {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
        <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '8px 12px', maxWidth: 220 }}>
            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: d.color, marginBottom: 2 }}>
                {d.name}
            </div>
            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                파장: {d.wavelength}nm · 해상도: ~{d.resolution}nm<br />
                도입: {d.year}{d.note ? ` (${d.note})` : ''}
            </div>
        </div>
    );
}

/* ─── Log 축 눈금 ─── */
const xTicks = [10, 50, 100, 200, 500];
const yTicks = [5, 10, 50, 100, 500, 1000];

export default function WavelengthVsResolution() {
    const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                광원 파장별 해상도 변화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Wavelength vs. Minimum Resolution (Half-Pitch)
            </p>

            {/* 범례 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
                {['수은램프', 'DUV', 'EUV'].map(g => (
                    <div key={g}
                        onMouseEnter={() => setHoveredGroup(g)} onMouseLeave={() => setHoveredGroup(null)}
                        style={{ fontSize: FONT.min, color: hoveredGroup === null || hoveredGroup === g ? COLOR.textMuted : 'rgba(255,255,255,0.2)',
                            cursor: 'pointer', transition: 'color 0.15s' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 4,
                            background: g === '수은램프' ? '#f59e0b' : g === 'DUV' ? '#3b82f6' : '#c084fc' }} />
                        {g}
                    </div>
                ))}
            </div>

            <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="wavelength" type="number" scale="log" domain={[8, 600]}
                        ticks={xTicks} tickFormatter={(v: number) => `${v}`}
                        label={{ value: '파장 λ (nm)', position: 'bottom', offset: 10, fill: COLOR.textDim, fontSize: FONT.min }}
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }} stroke="rgba(255,255,255,0.15)"
                        allowDataOverflow />
                    <YAxis
                        dataKey="resolution" type="number" scale="log" domain={[4, 1200]}
                        ticks={yTicks} tickFormatter={(v: number) => `${v}`}
                        label={{ value: '해상도 (nm)', angle: -90, position: 'insideLeft', offset: -5, fill: COLOR.textDim, fontSize: FONT.min }}
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }} stroke="rgba(255,255,255,0.15)"
                        allowDataOverflow />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Scatter data={DATA} isAnimationActive={false}>
                        {DATA.map((d, i) => (
                            <Cell key={i} fill={d.color}
                                opacity={hoveredGroup === null || hoveredGroup === d.group ? 1 : 0.15}
                                r={hoveredGroup === d.group ? 8 : 6} />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
