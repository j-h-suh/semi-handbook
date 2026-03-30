'use client';

import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Cell, Tooltip,
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

/* ─── Beta distribution sampling via gamma ─── */

/** Gamma(shape, 1) using Marsaglia-Tsang method */
function sampleGamma(rand: () => number, shape: number): number {
    if (shape < 1) {
        // Boost: Gamma(a) = Gamma(a+1) * U^(1/a)
        return sampleGamma(rand, shape + 1) * Math.pow(rand(), 1 / shape);
    }
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    for (;;) {
        let x: number, v: number;
        do {
            // Box-Muller for normal
            const u1 = rand();
            const u2 = rand();
            x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            v = 1 + c * x;
        } while (v <= 0);
        v = v * v * v;
        const u = rand();
        if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
}

/** Beta(a, b) sample */
function sampleBeta(rand: () => number, a: number, b: number): number {
    const ga = sampleGamma(rand, a);
    const gb = sampleGamma(rand, b);
    return ga / (ga + gb);
}

/* ─── Types ─── */

type CorrectionMethod = 'none' | 'bonferroni' | 'bh';

interface TestDatum {
    index: number;
    sortedIndex: number;
    pValue: number;
    hasEffect: boolean;
    significant: boolean;
    threshold: number;
}

/* ─── Test count steps ─── */
const M_STEPS = [5, 10, 20, 50, 100];

const ALPHA = 0.05;

const METHOD_LABELS: Record<CorrectionMethod, string> = {
    none: '보정 없음',
    bonferroni: 'Bonferroni',
    bh: 'Benjamini-Hochberg',
};

/* ─── Data generation ─── */

function generateTests(m: number, rand: () => number): { pValue: number; hasEffect: boolean }[] {
    const tests: { pValue: number; hasEffect: boolean }[] = [];
    for (let i = 0; i < m; i++) {
        const hasEffect = rand() < 0.1; // ~10% have real effects
        const pValue = hasEffect
            ? sampleBeta(rand, 1, 10) // skewed toward 0
            : rand();                  // Uniform(0, 1)
        tests.push({ pValue, hasEffect });
    }
    return tests;
}

/* ─── Apply correction and determine significance ─── */

function applyCorrection(
    tests: { pValue: number; hasEffect: boolean }[],
    method: CorrectionMethod,
): TestDatum[] {
    const m = tests.length;

    // Sort by p-value ascending
    const sorted = tests
        .map((t, i) => ({ ...t, origIndex: i }))
        .sort((a, b) => a.pValue - b.pValue);

    if (method === 'none') {
        return sorted.map((t, si) => ({
            index: t.origIndex,
            sortedIndex: si + 1,
            pValue: t.pValue,
            hasEffect: t.hasEffect,
            significant: t.pValue < ALPHA,
            threshold: ALPHA,
        }));
    }

    if (method === 'bonferroni') {
        const threshold = ALPHA / m;
        return sorted.map((t, si) => ({
            index: t.origIndex,
            sortedIndex: si + 1,
            pValue: t.pValue,
            hasEffect: t.hasEffect,
            significant: t.pValue < threshold,
            threshold,
        }));
    }

    // Benjamini-Hochberg
    // Find largest k where p_(k) <= k/m * alpha
    let maxK = -1;
    for (let k = 0; k < m; k++) {
        const bhThreshold = ((k + 1) / m) * ALPHA;
        if (sorted[k].pValue <= bhThreshold) {
            maxK = k;
        }
    }

    return sorted.map((t, si) => ({
        index: t.origIndex,
        sortedIndex: si + 1,
        pValue: t.pValue,
        hasEffect: t.hasEffect,
        significant: si <= maxK,
        threshold: ((si + 1) / m) * ALPHA,
    }));
}

/* ─── Custom tooltip ─── */

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TestDatum }> }) {
    if (!active || !payload || payload.length === 0) return null;
    const d = payload[0].payload;
    return (
        <div style={{
            background: COLOR.tooltipBg,
            border: `1px solid ${COLOR.border}`,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: FONT.small,
        }}>
            <div style={{ color: COLOR.textBright, fontWeight: 600, marginBottom: 4 }}>
                검정 #{d.sortedIndex} (정렬 순서)
            </div>
            <div style={{ color: COLOR.text }}>
                p-value: <span style={{ color: STATS_COLOR.accent, fontWeight: 600 }}>{d.pValue.toFixed(4)}</span>
            </div>
            <div style={{ color: COLOR.text }}>
                임계값: <span style={{ fontWeight: 600 }}>{d.threshold.toFixed(4)}</span>
            </div>
            <div style={{ color: COLOR.textMuted, marginTop: 2 }}>
                {d.hasEffect ? '실제 효과 있음' : '귀무가설 참 (효과 없음)'}
            </div>
            <div style={{ color: d.significant ? STATS_COLOR.series[2] : COLOR.textDim, fontWeight: 600 }}>
                {d.significant ? '유의함' : '유의하지 않음'}
            </div>
        </div>
    );
}

/* ─── Component ─── */

export default function MultipleTestingComparison() {
    const [mIdx, setMIdx] = useState(2); // default 20
    const [method, setMethod] = useState<CorrectionMethod>('none');
    const [simCount, setSimCount] = useState(0);

    const m = M_STEPS[mIdx];

    /* Generate test data */
    const rawTests = useMemo(() => {
        const rand = simCount === 0 ? mulberry32(77777) : mulberry32(Date.now());
        return generateTests(m, rand);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [m, simCount]);

    /* Apply correction */
    const data = useMemo(() => applyCorrection(rawTests, method), [rawTests, method]);

    /* Compute summary stats */
    const stats = useMemo(() => {
        const totalSig = data.filter((d) => d.significant).length;
        const falsePositives = data.filter((d) => d.significant && !d.hasEffect).length;
        const nullCount = data.filter((d) => !d.hasEffect).length;
        const effectCount = data.filter((d) => d.hasEffect).length;
        // FWER: P(at least one false positive) — empirical from this single run
        const fwer = nullCount > 0 ? (falsePositives > 0 ? 1 : 0) : 0;
        // Theoretical FWER under no correction: 1 - (1 - alpha)^m_null
        const theoreticalFwer = 1 - Math.pow(1 - ALPHA, nullCount);
        return { totalSig, falsePositives, nullCount, effectCount, fwer, theoreticalFwer };
    }, [data]);

    /* Colors for bars */
    const sigColor = STATS_COLOR.series[2]; // pink
    const nonsigColor = COLOR.textDim;

    /* BH line data points for rendering as reference segments */
    const bonferroniThreshold = ALPHA / m;

    return (
        <div className="my-8">
            {/* Title */}
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                다중 검정 보정 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 20 }}>
                Multiple Testing Correction — Interactive Comparison
            </p>

            {/* Controls */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
                {/* Number of tests slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>검정 수 m = {m}</span>
                    <input
                        type="range"
                        min={0}
                        max={M_STEPS.length - 1}
                        step={1}
                        value={mIdx}
                        onChange={(e) => setMIdx(parseInt(e.target.value, 10))}
                        style={{ width: 140, accentColor: STATS_COLOR.accent }}
                    />
                </div>

                {/* New simulation button */}
                <button
                    onClick={() => setSimCount((c) => c + 1)}
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
                    새 시뮬레이션
                </button>

                {/* Correction method tabs */}
                <div style={{ display: 'flex', gap: 4, background: COLOR.cardBg, borderRadius: 8, padding: 4, border: `1px solid ${COLOR.border}` }}>
                    {(['none', 'bonferroni', 'bh'] as CorrectionMethod[]).map((cm) => (
                        <button
                            key={cm}
                            onClick={() => setMethod(cm)}
                            style={{
                                padding: '6px 14px',
                                fontSize: FONT.small,
                                fontWeight: method === cm ? 600 : 400,
                                color: method === cm ? COLOR.textBright : COLOR.textMuted,
                                background: method === cm ? STATS_COLOR.accentDim : 'transparent',
                                border: method === cm ? `1px solid ${STATS_COLOR.accentBorder}` : '1px solid transparent',
                                borderRadius: 6,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            {METHOD_LABELS[cm]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bar chart */}
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={data} margin={{ top: 12, right: 16, left: 8, bottom: 32 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLOR.border} />
                        <XAxis
                            dataKey="sortedIndex"
                            tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                            axisLine={{ stroke: COLOR.border }}
                            tickLine={false}
                            label={{
                                value: '정렬된 검정 순서 (i)',
                                position: 'insideBottom',
                                offset: -20,
                                fill: COLOR.textMuted,
                                fontSize: FONT.small,
                            }}
                            interval={m <= 20 ? 0 : m <= 50 ? 4 : 9}
                        />
                        <YAxis
                            domain={[0, 1]}
                            tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                            axisLine={{ stroke: COLOR.border }}
                            tickLine={false}
                            label={{
                                value: 'p-value',
                                angle: -90,
                                position: 'insideLeft',
                                offset: 10,
                                fill: COLOR.textMuted,
                                fontSize: FONT.small,
                            }}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        />
                        <Bar dataKey="pValue" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                            {data.map((d, i) => (
                                <Cell
                                    key={i}
                                    fill={d.significant ? sigColor : nonsigColor}
                                    fillOpacity={d.significant ? 0.85 : 0.35}
                                    stroke={d.hasEffect ? STATS_COLOR.series[3] : 'none'}
                                    strokeWidth={d.hasEffect ? 1.5 : 0}
                                />
                            ))}
                        </Bar>

                        {/* alpha = 0.05 reference line (always shown) */}
                        <ReferenceLine
                            y={ALPHA}
                            stroke={STATS_COLOR.series[3]}
                            strokeDasharray="6 3"
                            strokeWidth={1.5}
                            label={{
                                value: `α = ${ALPHA}`,
                                position: 'right',
                                fill: STATS_COLOR.series[3],
                                fontSize: FONT.min,
                            }}
                        />

                        {/* Bonferroni threshold line */}
                        {method === 'bonferroni' && (
                            <ReferenceLine
                                y={bonferroniThreshold}
                                stroke={STATS_COLOR.series[1]}
                                strokeDasharray="4 4"
                                strokeWidth={1.5}
                                label={{
                                    value: `α/m = ${bonferroniThreshold.toFixed(4)}`,
                                    position: 'right',
                                    fill: STATS_COLOR.series[1],
                                    fontSize: FONT.min,
                                }}
                            />
                        )}

                        {/* BH diagonal: render as multiple reference lines at key points */}
                        {method === 'bh' && data.filter((_, i) => i % Math.max(1, Math.floor(m / 10)) === 0 || i === m - 1).map((d) => (
                            <ReferenceLine
                                key={`bh-${d.sortedIndex}`}
                                y={d.threshold}
                                x={d.sortedIndex}
                                ifOverflow="extendDomain"
                                stroke="transparent"
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>

                {/* BH diagonal line overlay (SVG) */}
                {method === 'bh' && (
                    <div style={{
                        position: 'relative',
                        maxWidth: 720,
                        margin: '-320px auto 0',
                        height: 320,
                        pointerEvents: 'none',
                    }}>
                        <svg
                            viewBox="0 0 720 320"
                            style={{ width: '100%', height: '100%' }}
                            preserveAspectRatio="none"
                        >
                            {/* Chart area approximation: left=8+~40=48, right=720-16=704, top=12, bottom=320-32=288 */}
                            {(() => {
                                const chartLeft = 56;
                                const chartRight = 704;
                                const chartTop = 12;
                                const chartBottom = 288;
                                const chartWidth = chartRight - chartLeft;
                                const chartHeight = chartBottom - chartTop;

                                // BH line: from (1, alpha/m) to (m, alpha)
                                const x1 = chartLeft + (0.5 / m) * chartWidth;
                                const y1 = chartTop + (1 - ALPHA / m) * chartHeight;
                                const x2 = chartLeft + ((m - 0.5) / m) * chartWidth;
                                const y2 = chartTop + (1 - ALPHA) * chartHeight;

                                return (
                                    <line
                                        x1={x1} y1={y1}
                                        x2={x2} y2={y2}
                                        stroke={STATS_COLOR.series[4]}
                                        strokeWidth={2}
                                        strokeDasharray="6 4"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                );
                            })()}
                            {/* Label */}
                            <text
                                x={680}
                                y={30}
                                fill={STATS_COLOR.series[4]}
                                fontSize={11}
                                textAnchor="end"
                            >
                                BH: i/m x α
                            </text>
                        </svg>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: 20,
                marginTop: method === 'bh' ? 4 : 12,
                marginBottom: 12, fontSize: FONT.small, color: COLOR.textMuted,
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: sigColor, opacity: 0.85 }} />
                    유의함
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: nonsigColor, opacity: 0.35 }} />
                    유의하지 않음
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, border: `2px solid ${STATS_COLOR.series[3]}`, background: 'transparent' }} />
                    실제 효과 있음
                </span>
            </div>

            {/* Info panel */}
            <div style={{
                maxWidth: 720,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
            }}>
                {[
                    {
                        label: '유의한 검정',
                        value: `${stats.totalSig} / ${m}`,
                        sub: `m = ${m}개 중`,
                    },
                    {
                        label: '위양성 (False Positive)',
                        value: `${stats.falsePositives}`,
                        sub: `귀무가설 참인 ${stats.nullCount}개 중`,
                        highlight: stats.falsePositives > 0,
                    },
                    {
                        label: 'FWER (이론적)',
                        value: `${(stats.theoreticalFwer * 100).toFixed(1)}%`,
                        sub: method === 'none' ? '보정 없을 때' : method === 'bonferroni' ? `≤ ${ALPHA * 100}% (제어됨)` : 'FDR 제어',
                    },
                    {
                        label: '실제 효과 있는 검정',
                        value: `${stats.effectCount}`,
                        sub: `전체의 ~${((stats.effectCount / m) * 100).toFixed(0)}%`,
                    },
                ].map(({ label, value, sub, highlight }) => (
                    <div
                        key={label}
                        style={{
                            textAlign: 'center',
                            padding: '10px 6px',
                            background: highlight ? STATS_COLOR.areaNegFill : STATS_COLOR.accentBg,
                            border: `1px solid ${highlight ? STATS_COLOR.areaNegStroke + '44' : STATS_COLOR.accentBorder}`,
                            borderRadius: 8,
                        }}
                    >
                        <div style={{ fontSize: FONT.min, color: COLOR.textMuted, marginBottom: 4 }}>{label}</div>
                        <div style={{
                            fontSize: FONT.cardHeader,
                            color: highlight ? STATS_COLOR.series[2] : STATS_COLOR.accent,
                            fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                        }}>
                            {value}
                        </div>
                        <div style={{ fontSize: FONT.min, color: COLOR.textDim, marginTop: 2 }}>{sub}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
