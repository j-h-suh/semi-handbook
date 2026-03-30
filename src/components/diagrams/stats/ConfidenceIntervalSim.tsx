'use client';

import React, { useState, useMemo } from 'react';
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

/* ─── Box-Muller normal sampling ─── */

function sampleNormal(rand: () => number, mu: number, sigma: number): number {
    const u1 = rand();
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mu + sigma * z;
}

/* ─── z critical values ─── */

const Z_CRIT: Record<number, number> = {
    90: 1.645,
    95: 1.96,
    99: 2.576,
};

/* ─── Constants ─── */

const POP_MU = 100;
const POP_SIGMA = 15;
const NUM_SAMPLES = 20;
const N_OPTIONS = [10, 25, 50, 100];
const CONF_OPTIONS = [90, 95, 99];

/* ─── Types ─── */

interface CIData {
    id: number;
    xbar: number;
    lo: number;
    hi: number;
    containsMu: boolean;
}

/* ─── Generate samples ─── */

function generateSamples(
    rand: () => number,
    n: number,
    confLevel: number,
): CIData[] {
    const z = Z_CRIT[confLevel];
    const margin = z * (POP_SIGMA / Math.sqrt(n));
    const results: CIData[] = [];

    for (let s = 0; s < NUM_SAMPLES; s++) {
        let sum = 0;
        for (let i = 0; i < n; i++) {
            sum += sampleNormal(rand, POP_MU, POP_SIGMA);
        }
        const xbar = sum / n;
        const lo = xbar - margin;
        const hi = xbar + margin;
        results.push({
            id: s + 1,
            xbar,
            lo,
            hi,
            containsMu: lo <= POP_MU && POP_MU <= hi,
        });
    }

    return results;
}

/* ─── Component ─── */

export default function ConfidenceIntervalSim() {
    const [n, setN] = useState(25);
    const [confLevel, setConfLevel] = useState(95);
    const [drawCount, setDrawCount] = useState(0);

    const samples = useMemo(() => {
        const rand = drawCount === 0 ? mulberry32(99999) : Math.random;
        return generateSamples(rand as () => number, n, confLevel);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [n, confLevel, drawCount]);

    const containCount = samples.filter((s) => s.containsMu).length;

    /* x-axis domain: center on μ with padding */
    const margin = Z_CRIT[confLevel] * (POP_SIGMA / Math.sqrt(n));
    const xMin = POP_MU - margin - POP_SIGMA / Math.sqrt(n) * 2;
    const xMax = POP_MU + margin + POP_SIGMA / Math.sqrt(n) * 2;

    const chartWidth = 600;
    const rowHeight = 22;
    const paddingTop = 30;
    const paddingBottom = 40;
    const paddingLeft = 48;
    const paddingRight = 24;
    const chartHeight = paddingTop + NUM_SAMPLES * rowHeight + paddingBottom;

    const plotWidth = chartWidth - paddingLeft - paddingRight;

    function xScale(val: number): number {
        return paddingLeft + ((val - xMin) / (xMax - xMin)) * plotWidth;
    }

    function yPos(idx: number): number {
        return paddingTop + idx * rowHeight + rowHeight / 2;
    }

    /* x-axis ticks */
    const tickStep = Math.ceil((xMax - xMin) / 8);
    const ticks: number[] = [];
    const tickStart = Math.ceil(xMin);
    for (let t = tickStart; t <= xMax; t += tickStep) {
        ticks.push(t);
    }
    if (!ticks.includes(POP_MU)) ticks.push(POP_MU);
    ticks.sort((a, b) => a - b);

    const hitColor = STATS_COLOR.series[0]; // emerald
    const missColor = STATS_COLOR.series[2]; // pink

    return (
        <div className="my-8">
            {/* Title */}
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                신뢰구간 시뮬레이션
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 20 }}>
                Confidence Interval Simulation — μ={POP_MU}, σ={POP_SIGMA}
            </p>

            {/* Controls */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
                {/* Sample size */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>n =</span>
                    <div style={{ display: 'flex', gap: 4, background: COLOR.cardBg, borderRadius: 8, padding: 4, border: `1px solid ${COLOR.border}` }}>
                        {N_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { setN(opt); setDrawCount(0); }}
                                style={{
                                    padding: '5px 12px',
                                    fontSize: FONT.small,
                                    fontWeight: n === opt ? 600 : 400,
                                    color: n === opt ? COLOR.textBright : COLOR.textMuted,
                                    background: n === opt ? STATS_COLOR.accentDim : 'transparent',
                                    border: n === opt ? `1px solid ${STATS_COLOR.accentBorder}` : '1px solid transparent',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Confidence level */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>신뢰수준</span>
                    <div style={{ display: 'flex', gap: 4, background: COLOR.cardBg, borderRadius: 8, padding: 4, border: `1px solid ${COLOR.border}` }}>
                        {CONF_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { setConfLevel(opt); setDrawCount(0); }}
                                style={{
                                    padding: '5px 12px',
                                    fontSize: FONT.small,
                                    fontWeight: confLevel === opt ? 600 : 400,
                                    color: confLevel === opt ? COLOR.textBright : COLOR.textMuted,
                                    background: confLevel === opt ? STATS_COLOR.accentDim : 'transparent',
                                    border: confLevel === opt ? `1px solid ${STATS_COLOR.accentBorder}` : '1px solid transparent',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {opt}%
                            </button>
                        ))}
                    </div>
                </div>

                {/* Draw button */}
                <button
                    onClick={() => setDrawCount((c) => c + 1)}
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
                    Draw {NUM_SAMPLES} samples
                </button>
            </div>

            {/* SVG chart */}
            <div style={{ maxWidth: chartWidth, margin: '0 auto' }}>
                <svg
                    width="100%"
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    style={{ display: 'block' }}
                >
                    {/* Background grid lines */}
                    {ticks.map((t) => (
                        <line
                            key={`grid-${t}`}
                            x1={xScale(t)}
                            y1={paddingTop - 4}
                            x2={xScale(t)}
                            y2={chartHeight - paddingBottom}
                            stroke={COLOR.border}
                            strokeDasharray="3 3"
                        />
                    ))}

                    {/* μ reference line */}
                    <line
                        x1={xScale(POP_MU)}
                        y1={paddingTop - 8}
                        x2={xScale(POP_MU)}
                        y2={chartHeight - paddingBottom + 4}
                        stroke={STATS_COLOR.series[3]}
                        strokeWidth={2}
                        strokeDasharray="6 3"
                    />
                    <text
                        x={xScale(POP_MU)}
                        y={paddingTop - 14}
                        textAnchor="middle"
                        fill={STATS_COLOR.series[3]}
                        fontSize={FONT.body}
                        fontWeight={700}
                    >
                        μ = {POP_MU}
                    </text>

                    {/* Confidence intervals */}
                    {samples.map((s, idx) => {
                        const color = s.containsMu ? hitColor : missColor;
                        const y = yPos(idx);
                        return (
                            <g key={s.id}>
                                {/* CI line */}
                                <line
                                    x1={xScale(s.lo)}
                                    y1={y}
                                    x2={xScale(s.hi)}
                                    y2={y}
                                    stroke={color}
                                    strokeWidth={2.5}
                                    strokeOpacity={0.85}
                                    strokeLinecap="round"
                                />
                                {/* Left cap */}
                                <line
                                    x1={xScale(s.lo)}
                                    y1={y - 5}
                                    x2={xScale(s.lo)}
                                    y2={y + 5}
                                    stroke={color}
                                    strokeWidth={2}
                                    strokeOpacity={0.85}
                                />
                                {/* Right cap */}
                                <line
                                    x1={xScale(s.hi)}
                                    y1={y - 5}
                                    x2={xScale(s.hi)}
                                    y2={y + 5}
                                    stroke={color}
                                    strokeWidth={2}
                                    strokeOpacity={0.85}
                                />
                                {/* x̄ dot */}
                                <circle
                                    cx={xScale(s.xbar)}
                                    cy={y}
                                    r={3}
                                    fill={color}
                                />
                                {/* Sample label */}
                                <text
                                    x={paddingLeft - 8}
                                    y={y + 4}
                                    textAnchor="end"
                                    fill={s.containsMu ? COLOR.textDim : missColor}
                                    fontSize={FONT.min}
                                    fontWeight={s.containsMu ? 400 : 600}
                                >
                                    {s.id}
                                </text>
                            </g>
                        );
                    })}

                    {/* X axis line */}
                    <line
                        x1={paddingLeft}
                        y1={chartHeight - paddingBottom}
                        x2={chartWidth - paddingRight}
                        y2={chartHeight - paddingBottom}
                        stroke={COLOR.border}
                    />

                    {/* X axis ticks + labels */}
                    {ticks.map((t) => (
                        <g key={`tick-${t}`}>
                            <line
                                x1={xScale(t)}
                                y1={chartHeight - paddingBottom}
                                x2={xScale(t)}
                                y2={chartHeight - paddingBottom + 6}
                                stroke={COLOR.textDim}
                            />
                            <text
                                x={xScale(t)}
                                y={chartHeight - paddingBottom + 20}
                                textAnchor="middle"
                                fill={t === POP_MU ? STATS_COLOR.series[3] : COLOR.textDim}
                                fontSize={FONT.min}
                                fontWeight={t === POP_MU ? 700 : 400}
                            >
                                {t}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>

            {/* Stats counter */}
            <div style={{
                maxWidth: chartWidth,
                margin: '16px auto 0',
                display: 'flex',
                justifyContent: 'center',
                gap: 16,
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '12px 24px',
                    background: STATS_COLOR.accentBg,
                    border: `1px solid ${STATS_COLOR.accentBorder}`,
                    borderRadius: 8,
                    flex: 1,
                    maxWidth: 360,
                }}>
                    <div style={{ fontSize: FONT.body, color: COLOR.textMuted, marginBottom: 6 }}>
                        포함 비율
                    </div>
                    <div style={{ fontSize: FONT.title, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        <span style={{ color: hitColor }}>{containCount}</span>
                        <span style={{ color: COLOR.textDim }}> / {NUM_SAMPLES}</span>
                        <span style={{ color: COLOR.textMuted, fontSize: FONT.body, marginLeft: 8 }}>
                            ({((containCount / NUM_SAMPLES) * 100).toFixed(0)}%)
                        </span>
                    </div>
                    <div style={{ fontSize: FONT.small, color: COLOR.textDim, marginTop: 6 }}>
                        {NUM_SAMPLES}개 중{' '}
                        <span style={{ color: hitColor, fontWeight: 600 }}>{containCount}개</span>가 μ를 포함
                        {containCount < NUM_SAMPLES && (
                            <>
                                ,{' '}
                                <span style={{ color: missColor, fontWeight: 600 }}>{NUM_SAMPLES - containCount}개</span>가 빗나감
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 20, height: 3, background: hitColor, borderRadius: 2 }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>μ 포함</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 20, height: 3, background: missColor, borderRadius: 2 }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>μ 미포함</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 20, height: 2, background: STATS_COLOR.series[3], borderRadius: 2, borderTop: '1px dashed' + STATS_COLOR.series[3] }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>μ = {POP_MU}</span>
                </div>
            </div>
        </div>
    );
}
