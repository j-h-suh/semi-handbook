'use client';

import React, { useState } from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

// Anscombe's Quartet data
const datasets: { name: string; data: { x: number; y: number }[] }[] = [
    {
        name: 'Dataset I',
        data: [
            { x: 10, y: 8.04 }, { x: 8, y: 6.95 }, { x: 13, y: 7.58 }, { x: 9, y: 8.81 },
            { x: 11, y: 8.33 }, { x: 14, y: 9.96 }, { x: 6, y: 7.24 }, { x: 4, y: 4.26 },
            { x: 12, y: 10.84 }, { x: 7, y: 4.82 }, { x: 5, y: 5.68 },
        ],
    },
    {
        name: 'Dataset II',
        data: [
            { x: 10, y: 9.14 }, { x: 8, y: 8.14 }, { x: 13, y: 8.74 }, { x: 9, y: 8.77 },
            { x: 11, y: 9.26 }, { x: 14, y: 8.10 }, { x: 6, y: 6.13 }, { x: 4, y: 3.10 },
            { x: 12, y: 9.13 }, { x: 7, y: 7.26 }, { x: 5, y: 4.74 },
        ],
    },
    {
        name: 'Dataset III',
        data: [
            { x: 10, y: 7.46 }, { x: 8, y: 6.77 }, { x: 13, y: 12.74 }, { x: 9, y: 7.11 },
            { x: 11, y: 7.81 }, { x: 14, y: 8.84 }, { x: 6, y: 6.08 }, { x: 4, y: 5.39 },
            { x: 12, y: 8.15 }, { x: 7, y: 6.42 }, { x: 5, y: 5.73 },
        ],
    },
    {
        name: 'Dataset IV',
        data: [
            { x: 8, y: 6.58 }, { x: 8, y: 5.76 }, { x: 8, y: 7.71 }, { x: 8, y: 8.84 },
            { x: 8, y: 8.47 }, { x: 8, y: 7.04 }, { x: 8, y: 5.25 }, { x: 19, y: 12.50 },
            { x: 8, y: 5.56 }, { x: 8, y: 7.91 }, { x: 8, y: 6.89 },
        ],
    },
];

// All four have nearly identical statistics:
// mean(x)=9, mean(y)≈7.50, var(x)=11, var(y)≈4.13, r≈0.816, regression: y≈3.00+0.500x
const SHARED_STATS = {
    meanX: 9.0,
    meanY: 7.50,
    r: 0.816,
    slope: 0.500,
    intercept: 3.00,
};

function RegressionLine({ slope, intercept, xMin, xMax, color }: { slope: number; intercept: number; xMin: number; xMax: number; color: string }) {
    const data = [
        { x: xMin, y: slope * xMin + intercept },
        { x: xMax, y: slope * xMax + intercept },
    ];
    return (
        <Scatter data={data} fill="none" line={{ stroke: color, strokeWidth: 1.5, strokeDasharray: '6,3' }} isAnimationActive={false}>
            {data.map((_, i) => <circle key={i} r={0} fill="none" />)}
        </Scatter>
    );
}

export default function AnscombeQuartet() {
    const [hoveredSet, setHoveredSet] = useState<number | null>(null);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                앤스콤의 4중주
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 4 }}>
                Anscombe&apos;s Quartet — Four datasets, identical statistics
            </p>

            {/* Shared stats banner */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16,
                padding: '8px 16px', borderRadius: 8, background: COLOR.cardBg, width: 'fit-content', margin: '0 auto 16px',
            }}>
                {[
                    { label: 'x̄', value: SHARED_STATS.meanX.toFixed(1) },
                    { label: 'ȳ', value: SHARED_STATS.meanY.toFixed(2) },
                    { label: 'r', value: SHARED_STATS.r.toFixed(3) },
                    { label: 'ŷ', value: `${SHARED_STATS.intercept}+${SHARED_STATS.slope}x` },
                ].map(({ label, value }) => (
                    <span key={label} style={{ fontSize: FONT.small, color: COLOR.textMuted }}>
                        <span style={{ color: STATS_COLOR.accent }}>{label}</span> = {value}
                    </span>
                ))}
            </div>

            {/* 2x2 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 640, margin: '0 auto' }}>
                {datasets.map((ds, idx) => (
                    <div
                        key={idx}
                        onMouseEnter={() => setHoveredSet(idx)}
                        onMouseLeave={() => setHoveredSet(null)}
                        style={{
                            padding: '8px 4px 0',
                            borderRadius: 10,
                            border: `1px solid ${hoveredSet === idx ? STATS_COLOR.accentBorder : COLOR.border}`,
                            background: hoveredSet === idx ? STATS_COLOR.accentBg : 'transparent',
                            transition: 'all 0.2s',
                        }}
                    >
                        <p style={{
                            textAlign: 'center', fontSize: FONT.min, fontWeight: 600,
                            color: hoveredSet === idx ? STATS_COLOR.accent : COLOR.textMuted, marginBottom: 2,
                        }}>
                            {ds.name}
                        </p>
                        <ResponsiveContainer width="100%" height={180}>
                            <ScatterChart margin={{ top: 5, right: 15, left: 5, bottom: 15 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis
                                    dataKey="x" type="number" domain={[2, 20]}
                                    tick={{ fontSize: 11, fill: COLOR.textDim }}
                                    axisLine={{ stroke: COLOR.border }} tickLine={false}
                                />
                                <YAxis
                                    dataKey="y" type="number" domain={[2, 14]}
                                    tick={{ fontSize: 11, fill: COLOR.textDim }}
                                    axisLine={{ stroke: COLOR.border }} tickLine={false}
                                />
                                <Tooltip
                                    content={({ payload }) => {
                                        if (!payload || payload.length === 0) return null;
                                        const d = payload[0]?.payload;
                                        if (!d) return null;
                                        return (
                                            <div style={{
                                                background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 6, padding: '6px 10px', fontSize: FONT.min,
                                            }}>
                                                <span style={{ color: COLOR.textMuted }}>x={d.x}, y={d.y}</span>
                                            </div>
                                        );
                                    }}
                                />
                                <RegressionLine slope={SHARED_STATS.slope} intercept={SHARED_STATS.intercept} xMin={2} xMax={20} color={STATS_COLOR.series[2]} />
                                <Scatter data={ds.data} fill={STATS_COLOR.accent}>
                                    {ds.data.map((_, i) => (
                                        <circle key={i} r={4} fill={STATS_COLOR.accent} opacity={0.8} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>

            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 12, lineHeight: 1.6 }}>
                네 데이터셋의 평균, 분산, 상관계수, 회귀선이 모두 동일하지만 — 시각화하면 전혀 다르다.
            </p>
        </div>
    );
}
