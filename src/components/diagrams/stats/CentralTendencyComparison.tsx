'use client';

import React, { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

type DistType = 'symmetric' | 'right' | 'left';

interface Distribution {
    label: string;
    subtitle: string;
    generate: () => { x: number; y: number }[];
    mean: number;
    median: number;
    mode: number;
}

function normalPdf(x: number, mu: number, sigma: number) {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

function gammaPdf(x: number, alpha: number, beta: number) {
    if (x <= 0) return 0;
    const lnGamma = (a: number): number => {
        // Stirling approximation for gamma function
        if (a < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * a)) - lnGamma(1 - a);
        a -= 1;
        const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
            -1.231739572450155, 0.001208650973866179, -0.000005395239384953];
        let s = 1.000000000190015;
        for (let i = 0; i < 6; i++) s += c[i] / (a + i + 1);
        return Math.log(Math.sqrt(2 * Math.PI) * s / (a + 1)) + (a + 0.5) * Math.log(a + 5.5 + 1) - (a + 5.5 + 1);
    };
    return Math.exp((alpha - 1) * Math.log(x) - x / beta - alpha * Math.log(beta) - lnGamma(alpha));
}

const distributions: Record<DistType, Distribution> = {
    symmetric: {
        label: '대칭 분포',
        subtitle: 'Mean ≈ Median ≈ Mode',
        generate: () => {
            const pts: { x: number; y: number }[] = [];
            for (let x = -4; x <= 4; x += 0.1) {
                pts.push({ x: Math.round(x * 10) / 10, y: normalPdf(x, 0, 1) });
            }
            return pts;
        },
        mean: 0, median: 0, mode: 0,
    },
    right: {
        label: '오른쪽 치우침',
        subtitle: 'Mode < Median < Mean',
        generate: () => {
            const pts: { x: number; y: number }[] = [];
            for (let x = 0; x <= 12; x += 0.15) {
                pts.push({ x: Math.round(x * 100) / 100, y: gammaPdf(x, 2, 1.5) });
            }
            return pts;
        },
        mean: 3.0, median: 2.3, mode: 1.5,
    },
    left: {
        label: '왼쪽 치우침',
        subtitle: 'Mean < Median < Mode',
        generate: () => {
            const pts: { x: number; y: number }[] = [];
            for (let x = 0; x <= 12; x += 0.15) {
                const mirrored = 12 - x;
                pts.push({ x: Math.round(x * 100) / 100, y: gammaPdf(mirrored, 2, 1.5) });
            }
            return pts;
        },
        mean: 9.0, median: 9.7, mode: 10.5,
    },
};

const TAB_KEYS: DistType[] = ['symmetric', 'right', 'left'];

const MEASURE_COLORS: Record<string, string> = {
    mean: STATS_COLOR.series[0],
    median: STATS_COLOR.series[1],
    mode: STATS_COLOR.series[3],
};

export default function CentralTendencyComparison() {
    const [active, setActive] = useState<DistType>('symmetric');
    const dist = distributions[active];
    const data = useMemo(() => dist.generate(), [dist]);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                분포 형태에 따른 대표값의 위치
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Central Tendency across Distribution Shapes
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                {TAB_KEYS.map(key => (
                    <button
                        key={key}
                        onClick={() => setActive(key)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: 8,
                            fontSize: FONT.small,
                            fontWeight: active === key ? 600 : 400,
                            color: active === key ? '#fff' : COLOR.textMuted,
                            background: active === key ? STATS_COLOR.accentDim : 'transparent',
                            border: `1px solid ${active === key ? STATS_COLOR.accent : COLOR.border}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        {distributions[key].label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <defs>
                        <linearGradient id="statsFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={STATS_COLOR.accent} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={STATS_COLOR.accent} stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="x" type="number"
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }}
                        tickLine={false}
                    />
                    <YAxis hide />
                    <Area
                        type="monotone" dataKey="y"
                        stroke={STATS_COLOR.accent} strokeWidth={2}
                        fill="url(#statsFill)"
                        isAnimationActive={false}
                    />
                    <ReferenceLine
                        x={dist.mean} stroke={MEASURE_COLORS.mean}
                        strokeWidth={2} strokeDasharray="6 3"
                        label={{ value: `평균 (${dist.mean})`, position: 'top', fill: MEASURE_COLORS.mean, fontSize: FONT.min }}
                    />
                    <ReferenceLine
                        x={dist.median} stroke={MEASURE_COLORS.median}
                        strokeWidth={2} strokeDasharray="6 3"
                        label={{ value: `중앙값 (${dist.median})`, position: 'insideTopRight', fill: MEASURE_COLORS.median, fontSize: FONT.min }}
                    />
                    <ReferenceLine
                        x={dist.mode} stroke={MEASURE_COLORS.mode}
                        strokeWidth={2}
                        label={{ value: `최빈값 (${dist.mode})`, position: 'insideTopLeft', fill: MEASURE_COLORS.mode, fontSize: FONT.min }}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
                {[
                    { key: 'mean', label: '평균 (Mean)' },
                    { key: 'median', label: '중앙값 (Median)' },
                    { key: 'mode', label: '최빈값 (Mode)' },
                ].map(({ key, label }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 16, height: 3, background: MEASURE_COLORS[key], borderRadius: 1 }} />
                        <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Subtitle */}
            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 8 }}>
                {dist.subtitle}
            </p>
        </div>
    );
}
