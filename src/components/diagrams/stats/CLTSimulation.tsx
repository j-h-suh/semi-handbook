'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── PRNG (mulberry32) ─── */

function mulberry32(seed: number) {
    let s = seed | 0;
    return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ─── Distribution helpers ─── */

type DistType = 'uniform' | 'exponential' | 'bimodal';

const DIST_LABEL: Record<DistType, string> = {
    uniform: 'Uniform',
    exponential: 'Exponential',
    bimodal: 'Bimodal',
};

const LAMBDA = 1;

function sampleUniform(rand: () => number): number {
    return rand() * 10;
}

function sampleExponential(rand: () => number): number {
    const u = rand();
    return -Math.log(1 - u) / LAMBDA;
}

/** Box-Muller transform for normal samples */
function sampleNormal(rand: () => number, mu: number, sigma: number): number {
    const u1 = rand();
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mu + sigma * z;
}

function sampleBimodal(rand: () => number): number {
    return rand() < 0.5 ? sampleNormal(rand, 3, 0.8) : sampleNormal(rand, 7, 0.8);
}

function sampleOne(dist: DistType, rand: () => number): number {
    switch (dist) {
        case 'uniform': return sampleUniform(rand);
        case 'exponential': return sampleExponential(rand);
        case 'bimodal': return sampleBimodal(rand);
    }
}

/* ─── Theoretical parameters ─── */

function theoreticalParams(dist: DistType): { mu: number; sigma: number } {
    switch (dist) {
        case 'uniform': return { mu: 5, sigma: Math.sqrt(100 / 12) };
        case 'exponential': return { mu: 1 / LAMBDA, sigma: 1 / LAMBDA };
        case 'bimodal': return { mu: 5, sigma: Math.sqrt(0.64 + 4) };
        // bimodal: E[X]=5, Var = E[Var|comp] + Var[E|comp] = 0.64 + 4 = 4.64
    }
}

/* ─── Histogram binning ─── */

interface BinDatum {
    x: string;
    xMid: number;
    count: number;
}

function buildHistogram(values: number[], binCount: number, rangeMin?: number, rangeMax?: number): BinDatum[] {
    const lo = rangeMin ?? Math.min(...values);
    const hi = rangeMax ?? Math.max(...values);
    const width = (hi - lo) / binCount || 1;
    const bins: number[] = new Array(binCount).fill(0);
    for (const v of values) {
        let idx = Math.floor((v - lo) / width);
        if (idx < 0) idx = 0;
        if (idx >= binCount) idx = binCount - 1;
        bins[idx]++;
    }
    return bins.map((count, i) => ({
        x: (lo + (i + 0.5) * width).toFixed(2),
        xMid: lo + (i + 0.5) * width,
        count,
    }));
}

/* ─── Population distribution (large sample to visualise shape) ─── */

function generatePopulation(dist: DistType): BinDatum[] {
    const rand = mulberry32(99999);
    const samples: number[] = [];
    for (let i = 0; i < 50000; i++) samples.push(sampleOne(dist, rand));

    switch (dist) {
        case 'uniform': return buildHistogram(samples, 30, 0, 10);
        case 'exponential': return buildHistogram(samples, 30, 0, 8);
        case 'bimodal': return buildHistogram(samples, 30, 0, 10);
    }
}

/* ─── Sample size steps ─── */
const N_STEPS = [1, 2, 5, 10, 30, 100];

/* ─── Observed stats ─── */

function mean(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[]): number {
    const m = mean(arr);
    const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
    return Math.sqrt(variance);
}

/* ─── Component ─── */

const NUM_SETS = 1000;

export default function CLTSimulation() {
    const [dist, setDist] = useState<DistType>('uniform');
    const [nIdx, setNIdx] = useState(2); // default n=5
    const [drawCount, setDrawCount] = useState(0); // triggers re-render

    const n = N_STEPS[nIdx];
    const theory = theoreticalParams(dist);

    /* Population histogram (deterministic, depends only on dist) */
    const popData = useMemo(() => generatePopulation(dist), [dist]);

    /* Sample means: seeded on first render, Math.random on button click */
    const { meansData, obsMean, obsStd } = useMemo(() => {
        const rand = drawCount === 0 ? mulberry32(12345) : Math.random;
        const means: number[] = [];
        for (let s = 0; s < NUM_SETS; s++) {
            let sum = 0;
            for (let i = 0; i < n; i++) sum += sampleOne(dist, rand as () => number);
            means.push(sum / n);
        }
        const theoryMu = theory.mu;
        const theorySigmaMean = theory.sigma / Math.sqrt(n);
        // histogram range: center ± 4σ of sampling dist (but at least cover population range)
        const lo = Math.max(theoryMu - 4 * theorySigmaMean, dist === 'exponential' ? -0.5 : -1);
        const hi = Math.min(theoryMu + 4 * theorySigmaMean, dist === 'exponential' ? 8 : 11);
        return {
            meansData: buildHistogram(means, 40, lo, hi),
            obsMean: mean(means),
            obsStd: std(means),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dist, n, drawCount]);

    const handleDraw = useCallback(() => {
        setDrawCount((c) => c + 1);
    }, []);

    const theorySigmaMean = theory.sigma / Math.sqrt(n);

    return (
        <div className="my-8">
            {/* Title */}
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                중심극한정리 시뮬레이션
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 20 }}>
                Central Limit Theorem — Interactive Simulation
            </p>

            {/* Controls */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
                {/* Distribution tabs */}
                <div style={{ display: 'flex', gap: 4, background: COLOR.cardBg, borderRadius: 8, padding: 4, border: `1px solid ${COLOR.border}` }}>
                    {(['uniform', 'exponential', 'bimodal'] as DistType[]).map((d) => (
                        <button
                            key={d}
                            onClick={() => { setDist(d); setDrawCount(0); }}
                            style={{
                                padding: '6px 14px',
                                fontSize: FONT.small,
                                fontWeight: dist === d ? 600 : 400,
                                color: dist === d ? COLOR.textBright : COLOR.textMuted,
                                background: dist === d ? STATS_COLOR.accentDim : 'transparent',
                                border: dist === d ? `1px solid ${STATS_COLOR.accentBorder}` : '1px solid transparent',
                                borderRadius: 6,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            {DIST_LABEL[d]}
                        </button>
                    ))}
                </div>

                {/* Sample size slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>n = {n}</span>
                    <input
                        type="range"
                        min={0}
                        max={N_STEPS.length - 1}
                        step={1}
                        value={nIdx}
                        onChange={(e) => setNIdx(parseInt(e.target.value, 10))}
                        style={{ width: 140, accentColor: STATS_COLOR.accent }}
                    />
                </div>

                {/* Draw button */}
                <button
                    onClick={handleDraw}
                    style={{
                        padding: '7px 18px',
                        fontSize: FONT.small,
                        fontWeight: 600,
                        color: '#fff',
                        background: STATS_COLOR.accentDim,
                        border: `1px solid ${STATS_COLOR.accentBorder}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = STATS_COLOR.accent; }}
                    onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = STATS_COLOR.accentDim; }}
                >
                    Draw 1,000 samples
                </button>
            </div>

            {/* Charts grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 700, margin: '0 auto' }}>
                {/* Left: population */}
                <div>
                    <p style={{ textAlign: 'center', fontSize: FONT.body, color: COLOR.textMuted, marginBottom: 8, fontWeight: 600 }}>
                        모집단 분포
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={popData} margin={{ top: 4, right: 8, left: 0, bottom: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLOR.border} />
                            <XAxis
                                dataKey="xMid"
                                type="number"
                                tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                                axisLine={{ stroke: COLOR.border }}
                                tickLine={false}
                                tickCount={5}
                                domain={['dataMin', 'dataMax']}
                            />
                            <YAxis hide />
                            <Bar dataKey="count" fill={STATS_COLOR.series[1]} fillOpacity={0.6} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                            <ReferenceLine
                                x={theory.mu}
                                stroke={STATS_COLOR.accent}
                                strokeDasharray="4 4"
                                strokeWidth={1.5}
                                label={{ value: 'μ', position: 'top', fill: STATS_COLOR.accent, fontSize: FONT.min }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Right: sample means */}
                <div>
                    <p style={{ textAlign: 'center', fontSize: FONT.body, color: COLOR.textMuted, marginBottom: 8, fontWeight: 600 }}>
                        표본평균 분포 <span style={{ color: COLOR.textDim, fontWeight: 400 }}>(n={n})</span>
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={meansData} margin={{ top: 4, right: 8, left: 0, bottom: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLOR.border} />
                            <XAxis
                                dataKey="xMid"
                                type="number"
                                tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                                axisLine={{ stroke: COLOR.border }}
                                tickLine={false}
                                tickCount={5}
                                domain={['dataMin', 'dataMax']}
                            />
                            <YAxis hide />
                            <Bar dataKey="count" fill={STATS_COLOR.accent} fillOpacity={0.7} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                            <ReferenceLine
                                x={theory.mu}
                                stroke={STATS_COLOR.series[3]}
                                strokeDasharray="4 4"
                                strokeWidth={1.5}
                                label={{ value: 'μ', position: 'top', fill: STATS_COLOR.series[3], fontSize: FONT.min }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Stats banner */}
            <div style={{
                maxWidth: 700,
                margin: '16px auto 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
            }}>
                {[
                    { label: '이론 μ', value: theory.mu.toFixed(3) },
                    { label: '이론 σ/√n', value: theorySigmaMean.toFixed(3) },
                    { label: '관측 평균', value: obsMean.toFixed(3) },
                    { label: '관측 표준편차', value: obsStd.toFixed(3) },
                ].map(({ label, value }) => (
                    <div
                        key={label}
                        style={{
                            textAlign: 'center',
                            padding: '10px 6px',
                            background: STATS_COLOR.accentBg,
                            border: `1px solid ${STATS_COLOR.accentBorder}`,
                            borderRadius: 8,
                        }}
                    >
                        <div style={{ fontSize: FONT.min, color: COLOR.textMuted, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: FONT.cardHeader, color: STATS_COLOR.accent, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                            {value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
