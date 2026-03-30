'use client';

import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── lnGamma (Lanczos approximation) ─── */

const LN_SQRT_2PI = 0.9189385332046727;
const LANCZOS_COEFF = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953,
];

function lnGamma(z: number): number {
    let x = z;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) {
        x += 1;
        ser += LANCZOS_COEFF[j] / x;
    }
    return -tmp + Math.log(LN_SQRT_2PI * ser / z);
}

/* ─── PDF helpers ─── */

function tPdf(x: number, df: number): number {
    const halfDfPlus1 = (df + 1) / 2;
    const halfDf = df / 2;
    const logCoeff = lnGamma(halfDfPlus1) - lnGamma(halfDf) - 0.5 * Math.log(df * Math.PI);
    return Math.exp(logCoeff - halfDfPlus1 * Math.log(1 + (x * x) / df));
}

function normalPdf(x: number): number {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

/* ─── Constants ─── */

const DF_OPTIONS = [1, 2, 3, 5, 10, 30, 100] as const;
const OVERLAY_DFS = [1, 5, 30] as const;
const OVERLAY_COLORS: Record<number, string> = {
    1: STATS_COLOR.series[2],  // pink
    5: STATS_COLOR.series[3],  // amber
    30: STATS_COLOR.series[0], // emerald
};
const OVERLAY_LABELS: Record<number, string> = {
    1: 'df = 1',
    5: 'df = 5',
    30: 'df = 30',
};
const NUM_POINTS = 301;
const X_MIN = -5;
const X_MAX = 5;
const STEP = (X_MAX - X_MIN) / (NUM_POINTS - 1);

/* ─── Data generation ─── */

interface DataPoint {
    x: number;
    normal: number;
    t: number;
    t1?: number;
    t5?: number;
    t30?: number;
}

function generateData(df: number, showOverlay: boolean): DataPoint[] {
    const pts: DataPoint[] = [];
    for (let i = 0; i < NUM_POINTS; i++) {
        const x = X_MIN + i * STEP;
        const xRounded = Math.round(x * 1000) / 1000;
        const pt: DataPoint = {
            x: xRounded,
            normal: normalPdf(xRounded),
            t: tPdf(xRounded, df),
        };
        if (showOverlay) {
            pt.t1 = tPdf(xRounded, 1);
            pt.t5 = tPdf(xRounded, 5);
            pt.t30 = tPdf(xRounded, 30);
        }
        pts.push(pt);
    }
    return pts;
}

/* ─── Tail thickness indicator ─── */

function tailThickness(df: number): { label: string; bars: number } {
    if (df <= 1) return { label: '매우 두꺼움', bars: 5 };
    if (df <= 2) return { label: '두꺼움', bars: 4 };
    if (df <= 5) return { label: '보통~두꺼움', bars: 3 };
    if (df <= 10) return { label: '약간 두꺼움', bars: 2 };
    return { label: '얇음 (정규분포에 근접)', bars: 1 };
}

function TailIndicator({ df }: { df: number }) {
    const { label, bars } = tailThickness(df);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>꼬리 두께:</span>
            <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: 5 }, (_, i) => (
                    <div
                        key={i}
                        style={{
                            width: 6,
                            height: 14 + i * 3,
                            borderRadius: 2,
                            backgroundColor: i < bars ? STATS_COLOR.series[2] : 'rgba(255,255,255,0.08)',
                            transition: 'background-color 0.2s',
                        }}
                    />
                ))}
            </div>
            <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>{label}</span>
        </div>
    );
}

/* ─── Custom Tooltip ─── */

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: number }) {
    if (!active || !payload || payload.length === 0) return null;
    return (
        <div style={{
            backgroundColor: COLOR.tooltipBg,
            border: `1px solid ${COLOR.border}`,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: FONT.small,
        }}>
            <div style={{ color: COLOR.textBright, marginBottom: 4 }}>x = {Number(label).toFixed(2)}</div>
            {payload.map((entry, i) => (
                <div key={i} style={{ color: entry.color, fontSize: FONT.min }}>
                    {entry.name}: {entry.value.toFixed(4)}
                </div>
            ))}
        </div>
    );
}

/* ─── Main Component ─── */

export default function TDistributionComparison() {
    const [dfIndex, setDfIndex] = useState(3); // default df=5
    const [showNormal, setShowNormal] = useState(true);
    const [showOverlay, setShowOverlay] = useState(false);

    const df = DF_OPTIONS[dfIndex];

    const data = useMemo(() => generateData(df, showOverlay), [df, showOverlay]);

    const note = useMemo(() => {
        if (df === 1) return { text: '코시 분포 (Cauchy) — 기댓값과 분산이 존재하지 않음!', color: STATS_COLOR.series[2] };
        if (df === 2) return { text: '분산이 정의되지만 (Var = ∞), 여전히 꼬리가 매우 두꺼움', color: STATS_COLOR.series[3] };
        if (df >= 30) return { text: '정규분포와 거의 동일 — 실무에서 df ≥ 30이면 z-검정 사용 가능', color: STATS_COLOR.accent };
        return null;
    }, [df]);

    return (
        <div className="my-8">
            {/* Title */}
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                t-분포 vs 정규분포
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 20 }}>
                t-Distribution Comparison — How df Shapes the Curve
            </p>

            {/* Controls */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
                gap: 16, marginBottom: 16, padding: '12px 16px',
                background: COLOR.cardBg, borderRadius: 10, border: `1px solid ${COLOR.border}`,
            }}>
                {/* df slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>자유도 (df):</span>
                    <input
                        type="range"
                        min={0} max={DF_OPTIONS.length - 1} step={1}
                        value={dfIndex}
                        onChange={(e) => setDfIndex(parseInt(e.target.value))}
                        style={{ width: 160, accentColor: STATS_COLOR.accent }}
                    />
                    <span style={{
                        fontSize: FONT.cardHeader, fontWeight: 700, color: STATS_COLOR.accent,
                        minWidth: 36, textAlign: 'center',
                    }}>
                        {df}
                    </span>
                </div>

                {/* Show normal toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: FONT.small, color: COLOR.textMuted }}>
                    <input
                        type="checkbox"
                        checked={showNormal}
                        onChange={(e) => setShowNormal(e.target.checked)}
                        style={{ accentColor: STATS_COLOR.accent }}
                    />
                    N(0,1) 기준선
                </label>

                {/* Overlay toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: FONT.small, color: COLOR.textMuted }}>
                    <input
                        type="checkbox"
                        checked={showOverlay}
                        onChange={(e) => setShowOverlay(e.target.checked)}
                        style={{ accentColor: STATS_COLOR.accent }}
                    />
                    df=1, 5, 30 동시 비교
                </label>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={340}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="x"
                        type="number"
                        domain={[X_MIN, X_MAX]}
                        tickCount={11}
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }}
                        axisLine={{ stroke: COLOR.border }}
                    />
                    <YAxis
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }}
                        axisLine={{ stroke: COLOR.border }}
                        tickFormatter={(v: number) => v.toFixed(2)}
                        domain={[0, 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: FONT.min, color: COLOR.textMuted, paddingTop: 8 }}
                    />

                    {/* Normal reference */}
                    {showNormal && !showOverlay && (
                        <Line
                            dataKey="normal"
                            name="N(0,1)"
                            stroke={COLOR.textDim}
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            dot={false}
                            isAnimationActive={false}
                        />
                    )}

                    {/* Single t-distribution */}
                    {!showOverlay && (
                        <Line
                            dataKey="t"
                            name={`t(df=${df})`}
                            stroke={STATS_COLOR.accent}
                            strokeWidth={2.5}
                            dot={false}
                            isAnimationActive={false}
                        />
                    )}

                    {/* Overlay mode */}
                    {showOverlay && (
                        <>
                            {showNormal && (
                                <Line
                                    dataKey="normal"
                                    name="N(0,1)"
                                    stroke={COLOR.textDim}
                                    strokeWidth={2}
                                    strokeDasharray="6 3"
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            )}
                            {OVERLAY_DFS.map((d) => (
                                <Line
                                    key={d}
                                    dataKey={`t${d}`}
                                    name={OVERLAY_LABELS[d]}
                                    stroke={OVERLAY_COLORS[d]}
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            ))}
                        </>
                    )}
                </LineChart>
            </ResponsiveContainer>

            {/* Info panel */}
            <div style={{
                marginTop: 16, padding: '14px 18px',
                background: COLOR.cardBg, borderRadius: 10, border: `1px solid ${COLOR.border}`,
                display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: FONT.body, color: COLOR.textBright }}>
                        현재 자유도: <span style={{ fontWeight: 700, color: STATS_COLOR.accent }}>df = {df}</span>
                    </div>
                    <TailIndicator df={df} />
                </div>

                {note && (
                    <div style={{
                        fontSize: FONT.small,
                        color: note.color,
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: `1px solid ${note.color}33`,
                        background: `${note.color}0D`,
                        maxWidth: 400,
                    }}>
                        {df === 1 && '⚠️ '}{df >= 30 && '✅ '}{note.text}
                    </div>
                )}
            </div>

            {/* Formula */}
            <div style={{
                marginTop: 12, textAlign: 'center',
                fontSize: FONT.min, color: COLOR.textDim, fontFamily: 'monospace',
            }}>
                f(x) = Γ((ν+1)/2) / (√(νπ) · Γ(ν/2)) · (1 + x²/ν)<sup>-(ν+1)/2</sup>
                <span style={{ marginLeft: 12, color: COLOR.textMuted }}>where ν = df</span>
            </div>
        </div>
    );
}
