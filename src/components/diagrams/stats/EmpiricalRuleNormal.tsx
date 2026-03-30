'use client';

import React, { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

function normalPdf(x: number, sigma: number) {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * (x / sigma) ** 2);
}

const BANDS = [
    { k: 1, pct: '68.27%', color: STATS_COLOR.series[0], opacity: 0.25 },
    { k: 2, pct: '95.45%', color: STATS_COLOR.series[1], opacity: 0.15 },
    { k: 3, pct: '99.73%', color: STATS_COLOR.series[4], opacity: 0.10 },
];

export default function EmpiricalRuleNormal() {
    const [sigma, setSigma] = useState(1.0);
    const [hoveredBand, setHoveredBand] = useState<number | null>(null);

    const data = useMemo(() => {
        const pts: { x: number; y: number }[] = [];
        const range = Math.max(4 * sigma, 4);
        for (let x = -range; x <= range; x += range / 200) {
            pts.push({ x: Math.round(x * 100) / 100, y: normalPdf(x, sigma) });
        }
        return pts;
    }, [sigma]);

    const xRange = Math.max(4 * sigma, 4);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                68-95-99.7 규칙
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Empirical Rule — Normal Distribution
            </p>

            {/* Sigma slider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>σ = {sigma.toFixed(1)}</span>
                <input
                    type="range" min="0.5" max="3.0" step="0.1"
                    value={sigma}
                    onChange={(e) => setSigma(parseFloat(e.target.value))}
                    style={{ width: 200, accentColor: STATS_COLOR.accent }}
                />
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                        <linearGradient id="empiricalFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={STATS_COLOR.accent} stopOpacity={0.2} />
                            <stop offset="100%" stopColor={STATS_COLOR.accent} stopOpacity={0.01} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="x" type="number"
                        domain={[-xRange, xRange]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }}
                        tickLine={false}
                        label={{ value: 'x', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis hide />

                    {/* Reference areas for bands — render in reverse order (3σ, 2σ, 1σ) */}
                    {[...BANDS].reverse().map(({ k, color, opacity }) => (
                        <ReferenceArea
                            key={k}
                            x1={-k * sigma} x2={k * sigma}
                            fill={color}
                            fillOpacity={hoveredBand === k ? opacity * 2.5 : opacity}
                            stroke="none"
                        />
                    ))}

                    {/* σ boundary lines */}
                    {BANDS.map(({ k, color }) => (
                        <React.Fragment key={`lines-${k}`}>
                            <ReferenceLine x={-k * sigma} stroke={color} strokeDasharray="4 3" strokeWidth={1} opacity={0.6} />
                            <ReferenceLine x={k * sigma} stroke={color} strokeDasharray="4 3" strokeWidth={1} opacity={0.6} />
                        </React.Fragment>
                    ))}

                    <ReferenceLine x={0} stroke={COLOR.textDim} strokeWidth={1} strokeDasharray="2 2" />

                    <Area
                        type="monotone" dataKey="y"
                        stroke={STATS_COLOR.accent} strokeWidth={2}
                        fill="url(#empiricalFill)"
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Band labels */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4 }}>
                {BANDS.map(({ k, pct, color }) => (
                    <div
                        key={k}
                        onMouseEnter={() => setHoveredBand(k)}
                        onMouseLeave={() => setHoveredBand(null)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                            padding: '4px 10px', borderRadius: 6,
                            background: hoveredBand === k ? COLOR.hoverBg : 'transparent',
                            transition: 'background 0.15s',
                        }}
                    >
                        <div style={{ width: 14, height: 14, borderRadius: 3, background: color, opacity: 0.6 }} />
                        <span style={{ fontSize: FONT.small, color: hoveredBand === k ? COLOR.textBright : COLOR.textMuted }}>
                            ±{k}σ = {pct}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
