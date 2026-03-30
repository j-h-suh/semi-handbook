'use client';

import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, ReferenceLine, Tooltip,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── Types ─── */

type DistType = 'fair-coin' | 'unfair-coin' | 'die';

interface Distribution {
    label: string;
    subtitle: string;
    expectedValue: number;
    variance: number;
    sample: (rng: () => number) => number;
}

/* ─── Seeded PRNG (mulberry32) ─── */

function mulberry32(seed: number): () => number {
    let s = seed | 0;
    return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ─── Distribution Definitions ─── */

const distributions: Record<DistType, Distribution> = {
    'fair-coin': {
        label: 'Fair Coin (p=0.5)',
        subtitle: 'E[X] = 0.5',
        expectedValue: 0.5,
        variance: 0.25, // p(1-p)
        sample: (rng) => rng() < 0.5 ? 1 : 0,
    },
    'unfair-coin': {
        label: 'Unfair Coin (p=0.3)',
        subtitle: 'E[X] = 0.3',
        expectedValue: 0.3,
        variance: 0.21, // p(1-p)
        sample: (rng) => rng() < 0.3 ? 1 : 0,
    },
    'die': {
        label: 'Die (1-6)',
        subtitle: 'E[X] = 3.5',
        expectedValue: 3.5,
        variance: 35 / 12, // (6^2 - 1) / 12
        sample: (rng) => Math.floor(rng() * 6) + 1,
    },
};

const TAB_KEYS: DistType[] = ['fair-coin', 'unfair-coin', 'die'];

/* ─── Log-spaced sample points ─── */

function logSpacedPoints(maxN: number, count: number): number[] {
    const pts: number[] = [1, 2, 3, 4, 5];
    const logMax = Math.log10(maxN);
    for (let i = 0; i < count; i++) {
        const n = Math.round(Math.pow(10, (logMax * i) / (count - 1)));
        if (n > 5) pts.push(n);
    }
    // Deduplicate and sort
    return [...new Set(pts)].sort((a, b) => a - b);
}

/* ─── Simulation ─── */

const MAX_TRIALS = 1000;
const SAMPLE_POINTS = logSpacedPoints(MAX_TRIALS, 200);

interface DataPoint {
    n: number;
    avg: number;
    upper: number;
    lower: number;
}

function simulate(dist: Distribution, rng: () => number): DataPoint[] {
    const { expectedValue: mu, variance: sigma2 } = dist;
    const sigma = Math.sqrt(sigma2);
    let sum = 0;
    let sampleIdx = 0;
    const result: DataPoint[] = [];

    for (let trial = 1; trial <= MAX_TRIALS; trial++) {
        sum += dist.sample(rng);

        if (sampleIdx < SAMPLE_POINTS.length && trial === SAMPLE_POINTS[sampleIdx]) {
            const avg = sum / trial;
            const band = (2 * sigma) / Math.sqrt(trial);
            result.push({
                n: trial,
                avg,
                upper: mu + band,
                lower: mu - band,
            });
            sampleIdx++;
        }
    }
    return result;
}

/* ─── Custom Tooltip ─── */

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DataPoint }> }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{
            background: COLOR.tooltipBg,
            border: `1px solid ${STATS_COLOR.accentBorder}`,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: FONT.small,
        }}>
            <div style={{ color: COLOR.textBright, fontWeight: 600, marginBottom: 4 }}>
                n = {d.n.toLocaleString()}
            </div>
            <div style={{ color: STATS_COLOR.accent }}>
                평균: {d.avg.toFixed(4)}
            </div>
            <div style={{ color: COLOR.textDim }}>
                ±2&sigma;/&radic;n: [{d.lower.toFixed(4)}, {d.upper.toFixed(4)}]
            </div>
        </div>
    );
}

/* ─── Main Component ─── */

export default function LLNConvergence() {
    const [active, setActive] = useState<DistType>('fair-coin');
    const [seed, setSeed] = useState(54321);

    const dist = distributions[active];

    const data = useMemo(() => {
        const rng = seed === 54321 ? mulberry32(54321) : (() => Math.random());
        return simulate(dist, rng);
    }, [dist, seed]);

    const lastPoint = data[data.length - 1];
    const currentAvg = lastPoint?.avg ?? 0;
    const error = Math.abs(currentAvg - dist.expectedValue);

    const handleNewSimulation = () => {
        setSeed(Date.now());
    };

    // Y-axis domain: compute based on distribution
    const yMin = Math.min(...data.map(d => Math.min(d.avg, d.lower)));
    const yMax = Math.max(...data.map(d => Math.max(d.avg, d.upper)));
    const yPadding = (yMax - yMin) * 0.1 || 0.1;

    return (
        <div className="my-8">
            {/* Title */}
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                큰 수의 법칙 — 수렴 시각화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Law of Large Numbers Convergence
            </p>

            {/* Controls: tabs + button */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
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
                <button
                    onClick={handleNewSimulation}
                    style={{
                        padding: '6px 16px',
                        borderRadius: 8,
                        fontSize: FONT.small,
                        fontWeight: 500,
                        color: STATS_COLOR.accent,
                        background: STATS_COLOR.accentBg,
                        border: `1px solid ${STATS_COLOR.accentBorder}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginLeft: 8,
                    }}
                >
                    New Simulation
                </button>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid stroke={COLOR.border} strokeDasharray="3 3" />
                    <XAxis
                        dataKey="n"
                        type="number"
                        scale="log"
                        domain={[1, MAX_TRIALS]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }}
                        tickLine={false}
                        label={{ value: '시행 횟수 (n)', position: 'insideBottom', offset: -5, fill: COLOR.textMuted, fontSize: FONT.min }}
                        ticks={[1, 5, 10, 50, 100, 500, 1000]}
                    />
                    <YAxis
                        domain={[yMin - yPadding, yMax + yPadding]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }}
                        tickLine={false}
                        label={{ value: '표본 평균', angle: -90, position: 'insideLeft', fill: COLOR.textMuted, fontSize: FONT.min }}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Confidence bands ±2σ/√n */}
                    <Line
                        dataKey="upper"
                        stroke={STATS_COLOR.accentMuted}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                        isAnimationActive={false}
                        name="upper-band"
                    />
                    <Line
                        dataKey="lower"
                        stroke={STATS_COLOR.accentMuted}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                        isAnimationActive={false}
                        name="lower-band"
                    />

                    {/* True E[X] reference line */}
                    <ReferenceLine
                        y={dist.expectedValue}
                        stroke={STATS_COLOR.accent}
                        strokeWidth={2}
                        strokeDasharray="8 4"
                        label={{
                            value: `E[X] = ${dist.expectedValue}`,
                            position: 'right',
                            fill: STATS_COLOR.accent,
                            fontSize: FONT.small,
                        }}
                    />

                    {/* Running average */}
                    <Line
                        dataKey="avg"
                        stroke={STATS_COLOR.series[1]}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        name="running-avg"
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
                {[
                    { color: STATS_COLOR.series[1], label: '표본 평균 (Running Avg)', dash: false },
                    { color: STATS_COLOR.accent, label: 'E[X] (True Mean)', dash: true },
                    { color: STATS_COLOR.accentMuted, label: '±2σ/√n', dash: true },
                ].map(({ color, label, dash }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                            width: 20,
                            height: 0,
                            borderTop: `2px ${dash ? 'dashed' : 'solid'} ${color}`,
                        }} />
                        <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Stats display */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 32,
                marginTop: 16,
                padding: '12px 20px',
                background: COLOR.cardBg,
                border: `1px solid ${COLOR.border}`,
                borderRadius: 10,
                maxWidth: 520,
                marginLeft: 'auto',
                marginRight: 'auto',
            }}>
                {[
                    { label: 'True E[X]', value: dist.expectedValue.toFixed(4), color: STATS_COLOR.accent },
                    { label: `평균 (n=${MAX_TRIALS})`, value: currentAvg.toFixed(4), color: STATS_COLOR.series[1] },
                    { label: '|오차|', value: error.toFixed(4), color: error < 0.05 ? STATS_COLOR.accent : STATS_COLOR.series[2] },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: FONT.min, color: COLOR.textDim, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
                            {value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
