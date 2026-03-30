'use client';

import React, { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    ReferenceLine, ReferenceArea, Tooltip,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── Math helpers ─── */

/** Standard normal PDF */
function normalPdf(x: number): number {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

/** Error function approximation (Abramowitz & Stegun 7.1.26) */
function erf(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    const t = 1 / (1 + p * Math.abs(x));
    const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
}

/** Standard normal CDF: P(Z <= x) */
function normalCdf(x: number): number {
    return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

/**
 * Inverse normal (quantile) via rational approximation.
 * Uses the Beasley-Springer-Moro algorithm for p in (0, 1).
 */
function normalInv(p: number): number {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    if (p === 0.5) return 0;

    // Rational approximation for central region
    const a = [
        -3.969683028665376e+01, 2.209460984245205e+02,
        -2.759285104469687e+02, 1.383577518672690e+02,
        -3.066479806614716e+01, 2.506628277459239e+00,
    ];
    const b = [
        -5.447609879822406e+01, 1.615858368580409e+02,
        -1.556989798598866e+02, 6.680131188771972e+01,
        -1.328068155288572e+01,
    ];
    const c = [
        -7.784894002430293e-03, -3.223964580411365e-01,
        -2.400758277161838e+00, -2.549732539343734e+00,
        4.374664141464968e+00, 2.938163982698783e+00,
    ];
    const d = [
        7.784695709041462e-03, 3.224671290700398e-01,
        2.445134137142996e+00, 3.754408661907416e+00,
    ];

    const pLow = 0.02425;
    const pHigh = 1 - pLow;

    let q: number, r: number;

    if (p < pLow) {
        q = Math.sqrt(-2 * Math.log(p));
        return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= pHigh) {
        q = p - 0.5;
        r = q * q;
        return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
            (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
}

/* ─── Types ─── */

type TestType = 'two-tailed' | 'right-tailed' | 'left-tailed';

const TEST_LABELS: Record<TestType, string> = {
    'two-tailed': '양측검정',
    'right-tailed': '단측검정 (우측)',
    'left-tailed': '단측검정 (좌측)',
};

const ALPHA_OPTIONS = [0.01, 0.05, 0.10];

/* ─── Component ─── */

export default function HypothesisTestVisualizer() {
    const [testType, setTestType] = useState<TestType>('two-tailed');
    const [alpha, setAlpha] = useState(0.05);
    const [zObs, setZObs] = useState(1.96);

    /* Critical values */
    const criticals = useMemo(() => {
        switch (testType) {
            case 'two-tailed': {
                const zCrit = normalInv(1 - alpha / 2);
                return { lower: -zCrit, upper: zCrit };
            }
            case 'right-tailed': {
                const zCrit = normalInv(1 - alpha);
                return { lower: null, upper: zCrit };
            }
            case 'left-tailed': {
                const zCrit = normalInv(alpha);
                return { lower: zCrit, upper: null };
            }
        }
    }, [testType, alpha]);

    /* p-value */
    const pValue = useMemo(() => {
        switch (testType) {
            case 'two-tailed':
                return 2 * (1 - normalCdf(Math.abs(zObs)));
            case 'right-tailed':
                return 1 - normalCdf(zObs);
            case 'left-tailed':
                return normalCdf(zObs);
        }
    }, [testType, zObs]);

    const reject = pValue < alpha;

    /* Curve data */
    const data = useMemo(() => {
        const pts: { x: number; y: number }[] = [];
        for (let x = -4; x <= 4; x += 0.04) {
            const rounded = Math.round(x * 100) / 100;
            pts.push({ x: rounded, y: normalPdf(rounded) });
        }
        return pts;
    }, []);

    /* ─── Styles ─── */

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '6px 14px',
        fontSize: FONT.small,
        fontWeight: active ? 600 : 400,
        color: active ? STATS_COLOR.accent : COLOR.textMuted,
        background: active ? STATS_COLOR.accentBg : 'transparent',
        border: `1px solid ${active ? STATS_COLOR.accentBorder : COLOR.border}`,
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 0.15s',
    });

    const rejectionFill = 'rgba(244, 114, 182, 0.25)';
    const rejectionStroke = STATS_COLOR.areaNegStroke;
    const pValueFill = 'rgba(244, 114, 182, 0.12)';

    return (
        <div className="my-8">
            {/* Title */}
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                가설검정 시각화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 20 }}>
                Hypothesis Test — Standard Normal Distribution
            </p>

            {/* Test type tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {(Object.keys(TEST_LABELS) as TestType[]).map((t) => (
                    <button key={t} style={tabStyle(testType === t)} onClick={() => setTestType(t)}>
                        {TEST_LABELS[t]}
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20, flexWrap: 'wrap' }}>
                {/* Alpha selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>α =</span>
                    {ALPHA_OPTIONS.map((a) => (
                        <button
                            key={a}
                            onClick={() => setAlpha(a)}
                            style={{
                                padding: '4px 10px',
                                fontSize: FONT.min,
                                fontWeight: alpha === a ? 600 : 400,
                                color: alpha === a ? COLOR.textBright : COLOR.textMuted,
                                background: alpha === a ? 'rgba(255,255,255,0.08)' : 'transparent',
                                border: `1px solid ${alpha === a ? 'rgba(255,255,255,0.15)' : COLOR.border}`,
                                borderRadius: 4,
                                cursor: 'pointer',
                            }}
                        >
                            {a}
                        </button>
                    ))}
                </div>

                {/* z_obs slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>
                        z<sub>obs</sub> = {zObs.toFixed(2)}
                    </span>
                    <input
                        type="range" min="-3.5" max="3.5" step="0.01"
                        value={zObs}
                        onChange={(e) => setZObs(parseFloat(e.target.value))}
                        style={{ width: 180, accentColor: STATS_COLOR.accent }}
                    />
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                        <linearGradient id="htCurveFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={STATS_COLOR.accent} stopOpacity={0.15} />
                            <stop offset="100%" stopColor={STATS_COLOR.accent} stopOpacity={0.01} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />

                    <XAxis
                        dataKey="x"
                        type="number"
                        domain={[-4, 4]}
                        tickCount={9}
                        tick={{ fill: COLOR.textMuted, fontSize: FONT.min }}
                        axisLine={{ stroke: COLOR.border }}
                        tickLine={{ stroke: COLOR.border }}
                    />
                    <YAxis
                        domain={[0, 0.45]}
                        tick={{ fill: COLOR.textMuted, fontSize: FONT.min }}
                        axisLine={{ stroke: COLOR.border }}
                        tickLine={{ stroke: COLOR.border }}
                        tickFormatter={(v: number) => v.toFixed(2)}
                    />

                    <Tooltip
                        contentStyle={{
                            background: COLOR.tooltipBg,
                            border: `1px solid ${COLOR.border}`,
                            borderRadius: 8,
                            fontSize: FONT.small,
                            color: COLOR.text,
                        }}
                        formatter={(value: number) => [value.toFixed(4), 'f(z)']}
                        labelFormatter={(label: number) => `z = ${label.toFixed(2)}`}
                    />

                    {/* Rejection regions */}
                    {(testType === 'two-tailed' || testType === 'left-tailed') && criticals.lower !== null && (
                        <ReferenceArea
                            x1={-4} x2={criticals.lower}
                            fill={rejectionFill}
                            stroke={rejectionStroke}
                            strokeOpacity={0.4}
                            label={{ value: '기각역', fill: STATS_COLOR.areaNegStroke, fontSize: FONT.min, position: 'insideTop' }}
                        />
                    )}
                    {(testType === 'two-tailed' || testType === 'right-tailed') && criticals.upper !== null && (
                        <ReferenceArea
                            x1={criticals.upper} x2={4}
                            fill={rejectionFill}
                            stroke={rejectionStroke}
                            strokeOpacity={0.4}
                            label={{ value: '기각역', fill: STATS_COLOR.areaNegStroke, fontSize: FONT.min, position: 'insideTop' }}
                        />
                    )}

                    {/* p-value shading */}
                    {testType === 'two-tailed' && (
                        <>
                            {zObs > 0 && (
                                <ReferenceArea x1={Math.abs(zObs)} x2={4} fill={pValueFill} strokeOpacity={0} />
                            )}
                            {zObs > 0 && (
                                <ReferenceArea x1={-4} x2={-Math.abs(zObs)} fill={pValueFill} strokeOpacity={0} />
                            )}
                            {zObs <= 0 && (
                                <ReferenceArea x1={-4} x2={zObs} fill={pValueFill} strokeOpacity={0} />
                            )}
                            {zObs <= 0 && (
                                <ReferenceArea x1={-zObs} x2={4} fill={pValueFill} strokeOpacity={0} />
                            )}
                        </>
                    )}
                    {testType === 'right-tailed' && (
                        <ReferenceArea x1={zObs} x2={4} fill={pValueFill} strokeOpacity={0} />
                    )}
                    {testType === 'left-tailed' && (
                        <ReferenceArea x1={-4} x2={zObs} fill={pValueFill} strokeOpacity={0} />
                    )}

                    {/* Normal curve */}
                    <Area
                        type="monotone"
                        dataKey="y"
                        stroke={STATS_COLOR.accent}
                        strokeWidth={2}
                        fill="url(#htCurveFill)"
                        dot={false}
                        isAnimationActive={false}
                    />

                    {/* Critical value lines */}
                    {criticals.lower !== null && (
                        <ReferenceLine
                            x={criticals.lower}
                            stroke={STATS_COLOR.areaNegStroke}
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                        />
                    )}
                    {criticals.upper !== null && (
                        <ReferenceLine
                            x={criticals.upper}
                            stroke={STATS_COLOR.areaNegStroke}
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                        />
                    )}

                    {/* Observed z line */}
                    <ReferenceLine
                        x={zObs}
                        stroke={STATS_COLOR.series[1]}
                        strokeWidth={2.5}
                        label={{
                            value: `z = ${zObs.toFixed(2)}`,
                            fill: STATS_COLOR.series[1],
                            fontSize: FONT.small,
                            position: 'top',
                        }}
                    />

                    {/* Zero line */}
                    <ReferenceLine x={0} stroke={COLOR.textDim} strokeDasharray="2 4" strokeWidth={1} />
                </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 3, background: STATS_COLOR.series[1], borderRadius: 2 }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>관측 검정통계량</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 10, background: rejectionFill, border: `1px solid ${rejectionStroke}`, borderRadius: 2 }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>기각역 (α)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 10, background: pValueFill, borderRadius: 2 }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>p-value 영역</span>
                </div>
            </div>

            {/* Info panel */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 12,
                maxWidth: 600,
                margin: '0 auto',
                padding: '0 16px',
            }}>
                {/* z_obs */}
                <div style={{
                    background: COLOR.cardBg,
                    border: `1px solid ${COLOR.border}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: FONT.min, color: COLOR.textDim, marginBottom: 4 }}>관측 통계량</div>
                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STATS_COLOR.series[1] }}>
                        z = {zObs.toFixed(2)}
                    </div>
                </div>

                {/* p-value */}
                <div style={{
                    background: COLOR.cardBg,
                    border: `1px solid ${COLOR.border}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: FONT.min, color: COLOR.textDim, marginBottom: 4 }}>p-value</div>
                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: COLOR.textBright }}>
                        {pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}
                    </div>
                </div>

                {/* Critical value(s) */}
                <div style={{
                    background: COLOR.cardBg,
                    border: `1px solid ${COLOR.border}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: FONT.min, color: COLOR.textDim, marginBottom: 4 }}>임계값</div>
                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STATS_COLOR.areaNegStroke }}>
                        {testType === 'two-tailed'
                            ? `±${criticals.upper!.toFixed(3)}`
                            : testType === 'right-tailed'
                                ? `${criticals.upper!.toFixed(3)}`
                                : `${criticals.lower!.toFixed(3)}`
                        }
                    </div>
                </div>

                {/* Decision */}
                <div style={{
                    background: reject
                        ? 'rgba(244, 114, 182, 0.08)'
                        : STATS_COLOR.accentBg,
                    border: `1px solid ${reject
                        ? 'rgba(244, 114, 182, 0.25)'
                        : STATS_COLOR.accentBorder}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: FONT.min, color: COLOR.textDim, marginBottom: 4 }}>판정</div>
                    <div style={{
                        fontSize: FONT.cardHeader,
                        fontWeight: 700,
                        color: reject ? STATS_COLOR.areaNegStroke : STATS_COLOR.accent,
                    }}>
                        {reject ? 'H₀ 기각' : 'H₀ 기각 실패'}
                    </div>
                </div>
            </div>
        </div>
    );
}
