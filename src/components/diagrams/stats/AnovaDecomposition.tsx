'use client';

import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, Cell,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── Types ─── */

type Scenario = 'none' | 'slight' | 'large';

interface GroupData {
    label: string;
    values: number[];
    color: string;
}

interface AnovaResult {
    sst: number;
    ssb: number;
    ssw: number;
    dfBetween: number;
    dfWithin: number;
    msb: number;
    msw: number;
    fStat: number;
    pApprox: string;
    grandMean: number;
    groupMeans: number[];
}

/* ─── Seeded PRNG (mulberry32) ─── */

function mulberry32(seed: number) {
    let s = seed | 0;
    return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function sampleNormal(rand: () => number, mu: number, sigma: number): number {
    const u1 = rand();
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mu + sigma * z;
}

/* ─── Scenario definitions ─── */

const SCENARIO_LABEL: Record<Scenario, string> = {
    none: '차이 없음',
    slight: '약간 차이',
    large: '큰 차이',
};

const SCENARIO_MEANS: Record<Scenario, [number, number, number]> = {
    none: [50, 50, 50],
    slight: [45, 50, 55],
    large: [30, 50, 70],
};

const SIGMA = 10;
const N_PER_GROUP = 10;
const GROUP_LABELS = ['A', 'B', 'C'];
const GROUP_COLORS = [STATS_COLOR.series[0], STATS_COLOR.series[1], STATS_COLOR.series[2]];

/* ─── Data generation ─── */

function generateGroups(scenario: Scenario): GroupData[] {
    const means = SCENARIO_MEANS[scenario];
    const seed = scenario === 'none' ? 42 : scenario === 'slight' ? 137 : 256;
    const rand = mulberry32(seed);

    return means.map((mu, i) => {
        const values: number[] = [];
        for (let j = 0; j < N_PER_GROUP; j++) {
            values.push(sampleNormal(rand, mu, SIGMA));
        }
        return { label: GROUP_LABELS[i], values, color: GROUP_COLORS[i] };
    });
}

/* ─── ANOVA calculation ─── */

function computeAnova(groups: GroupData[]): AnovaResult {
    const allValues = groups.flatMap((g) => g.values);
    const grandMean = allValues.reduce((a, b) => a + b, 0) / allValues.length;

    const groupMeans = groups.map((g) => g.values.reduce((a, b) => a + b, 0) / g.values.length);

    // SST: total sum of squares
    const sst = allValues.reduce((s, v) => s + (v - grandMean) ** 2, 0);

    // SSB: between-group sum of squares
    const ssb = groups.reduce((s, g, i) => s + g.values.length * (groupMeans[i] - grandMean) ** 2, 0);

    // SSW: within-group sum of squares
    const ssw = groups.reduce((s, g, i) =>
        s + g.values.reduce((ws, v) => ws + (v - groupMeans[i]) ** 2, 0), 0);

    const k = groups.length;
    const n = allValues.length;
    const dfBetween = k - 1;
    const dfWithin = n - k;
    const msb = ssb / dfBetween;
    const msw = ssw / dfWithin;
    const fStat = msb / msw;

    // Approximate p-value using F-distribution CDF (rough approximation)
    const pApprox = approximateFPValue(fStat, dfBetween, dfWithin);

    return { sst, ssb, ssw, dfBetween, dfWithin, msb, msw, fStat, pApprox, grandMean, groupMeans };
}

/** Simple F-distribution p-value approximation using the regularized incomplete beta function */
function approximateFPValue(f: number, d1: number, d2: number): string {
    // Use the relationship between F and Beta distributions
    const x = d2 / (d2 + d1 * f);
    const p = regularizedBeta(x, d2 / 2, d1 / 2);
    if (p < 0.001) return 'p < 0.001';
    if (p < 0.01) return 'p < 0.01';
    if (p < 0.05) return 'p < 0.05';
    return `p = ${p.toFixed(3)}`;
}

/** Regularized incomplete beta function via continued fraction (Lentz's method) */
function regularizedBeta(x: number, a: number, b: number): number {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    // Use the series expansion for small x
    const lnBeta = lgamma(a) + lgamma(b) - lgamma(a + b);
    const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lnBeta) / a;

    // Continued fraction (Lentz's algorithm)
    let f = 1;
    let c = 1;
    let d = 1 - (a + b) * x / (a + 1);
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    f = d;

    for (let m = 1; m <= 200; m++) {
        // Even step
        let numerator = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
        d = 1 + numerator * d;
        if (Math.abs(d) < 1e-30) d = 1e-30;
        d = 1 / d;
        c = 1 + numerator / c;
        if (Math.abs(c) < 1e-30) c = 1e-30;
        f *= c * d;

        // Odd step
        numerator = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1));
        d = 1 + numerator * d;
        if (Math.abs(d) < 1e-30) d = 1e-30;
        d = 1 / d;
        c = 1 + numerator / c;
        if (Math.abs(c) < 1e-30) c = 1e-30;
        const delta = c * d;
        f *= delta;

        if (Math.abs(delta - 1) < 1e-10) break;
    }

    return front * f;
}

/** Log-gamma via Stirling's approximation (Lanczos) */
function lgamma(z: number): number {
    const g = 7;
    const coef = [
        0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];
    if (z < 0.5) {
        return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
    }
    z -= 1;
    let x = coef[0];
    for (let i = 1; i < g + 2; i++) {
        x += coef[i] / (z + i);
    }
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/* ─── Dot plot data preparation ─── */

interface DotPoint {
    group: string;
    groupIdx: number;
    value: number;
    color: string;
}

function prepareDots(groups: GroupData[]): DotPoint[] {
    return groups.flatMap((g, gi) =>
        g.values.map((v) => ({ group: g.label, groupIdx: gi, value: v, color: g.color }))
    );
}

/* ─── SS decomposition bar data ─── */

interface SSBarDatum {
    name: string;
    value: number;
    color: string;
    pct: string;
}

/* ─── Custom SVG dot plot (rendered inside a recharts-like container) ─── */

const DOT_PLOT_HEIGHT = 280;
const DOT_PLOT_MARGIN = { top: 20, right: 30, bottom: 30, left: 50 };

function DotPlot({ groups, anova }: { groups: GroupData[]; anova: AnovaResult }) {
    const dots = prepareDots(groups);
    const allValues = dots.map((d) => d.value);
    const yMin = Math.min(...allValues) - 5;
    const yMax = Math.max(...allValues) + 5;

    const innerWidth = 360 - DOT_PLOT_MARGIN.left - DOT_PLOT_MARGIN.right;
    const innerHeight = DOT_PLOT_HEIGHT - DOT_PLOT_MARGIN.top - DOT_PLOT_MARGIN.bottom;

    const xScale = (gi: number) => DOT_PLOT_MARGIN.left + (gi + 0.5) * (innerWidth / 3);
    const yScale = (v: number) => DOT_PLOT_MARGIN.top + innerHeight * (1 - (v - yMin) / (yMax - yMin));

    // Jitter dots horizontally
    const jitter = (idx: number) => (idx - N_PER_GROUP / 2 + 0.5) * 3.5;

    // Y-axis ticks
    const yTicks: number[] = [];
    const step = Math.ceil((yMax - yMin) / 6 / 5) * 5;
    for (let t = Math.ceil(yMin / step) * step; t <= yMax; t += step) {
        yTicks.push(t);
    }

    return (
        <svg width="100%" viewBox={`0 0 360 ${DOT_PLOT_HEIGHT}`} style={{ overflow: 'visible' }}>
            {/* Y-axis gridlines */}
            {yTicks.map((t) => (
                <line key={t} x1={DOT_PLOT_MARGIN.left} x2={360 - DOT_PLOT_MARGIN.right}
                    y1={yScale(t)} y2={yScale(t)}
                    stroke={COLOR.border} strokeWidth={1} />
            ))}
            {/* Y-axis labels */}
            {yTicks.map((t) => (
                <text key={`yl-${t}`} x={DOT_PLOT_MARGIN.left - 8} y={yScale(t) + 4}
                    textAnchor="end" fill={COLOR.textMuted} fontSize={FONT.min}>
                    {t.toFixed(0)}
                </text>
            ))}
            {/* X-axis labels */}
            {GROUP_LABELS.map((label, gi) => (
                <text key={label} x={xScale(gi)} y={DOT_PLOT_HEIGHT - 6}
                    textAnchor="middle" fill={GROUP_COLORS[gi]} fontSize={FONT.body} fontWeight={600}>
                    Group {label}
                </text>
            ))}

            {/* Grand mean line */}
            <line
                x1={DOT_PLOT_MARGIN.left} x2={360 - DOT_PLOT_MARGIN.right}
                y1={yScale(anova.grandMean)} y2={yScale(anova.grandMean)}
                stroke={COLOR.textDim} strokeWidth={1.5} strokeDasharray="6 4"
            />
            <text x={360 - DOT_PLOT_MARGIN.right + 4} y={yScale(anova.grandMean) + 4}
                fill={COLOR.textDim} fontSize={FONT.min}>
                x̄ = {anova.grandMean.toFixed(1)}
            </text>

            {/* Group means */}
            {anova.groupMeans.map((gm, gi) => {
                const cx = xScale(gi);
                const halfW = 22;
                return (
                    <line key={`gm-${gi}`}
                        x1={cx - halfW} x2={cx + halfW}
                        y1={yScale(gm)} y2={yScale(gm)}
                        stroke={GROUP_COLORS[gi]} strokeWidth={3}
                    />
                );
            })}

            {/* Dots */}
            {groups.map((g, gi) =>
                g.values.map((v, vi) => (
                    <circle key={`${gi}-${vi}`}
                        cx={xScale(gi) + jitter(vi)}
                        cy={yScale(v)}
                        r={4}
                        fill={g.color}
                        fillOpacity={0.55}
                        stroke={g.color}
                        strokeWidth={1}
                    />
                ))
            )}
        </svg>
    );
}

/* ─── Component ─── */

export default function AnovaDecomposition() {
    const [scenario, setScenario] = useState<Scenario>('slight');

    const groups = useMemo(() => generateGroups(scenario), [scenario]);
    const anova = useMemo(() => computeAnova(groups), [groups]);

    const ssBarData: SSBarDatum[] = useMemo(() => [
        {
            name: 'SSB (집단 간)',
            value: anova.ssb,
            color: STATS_COLOR.series[0],
            pct: ((anova.ssb / anova.sst) * 100).toFixed(1),
        },
        {
            name: 'SSW (집단 내)',
            value: anova.ssw,
            color: STATS_COLOR.series[2],
            pct: ((anova.ssw / anova.sst) * 100).toFixed(1),
        },
    ], [anova]);

    const isSignificant = anova.pApprox.includes('<');

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '6px 14px',
        fontSize: FONT.small,
        fontWeight: active ? 600 : 400,
        color: active ? COLOR.textBright : COLOR.textMuted,
        background: active ? STATS_COLOR.accentDim : 'transparent',
        border: active ? `1px solid ${STATS_COLOR.accentBorder}` : '1px solid transparent',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 0.15s',
    });

    return (
        <div className="my-8">
            {/* Title */}
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                ANOVA 분산 분해
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 20 }}>
                Analysis of Variance — Decomposition of SST into SSB + SSW
            </p>

            {/* Scenario tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 4, background: COLOR.cardBg, borderRadius: 8, padding: 4, border: `1px solid ${COLOR.border}` }}>
                    {(['none', 'slight', 'large'] as Scenario[]).map((s) => (
                        <button key={s} onClick={() => setScenario(s)} style={tabStyle(scenario === s)}>
                            {SCENARIO_LABEL[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main content: dot plot + SS bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', alignItems: 'flex-start' }}>
                {/* Dot plot */}
                <div style={{
                    flex: '1 1 360px', maxWidth: 400,
                    background: COLOR.cardBg, borderRadius: 12, padding: 16,
                    border: `1px solid ${COLOR.border}`,
                }}>
                    <p style={{ color: COLOR.textMuted, fontSize: FONT.small, marginBottom: 8, textAlign: 'center' }}>
                        각 그룹의 데이터 분포 (n = {N_PER_GROUP}/group)
                    </p>
                    <DotPlot groups={groups} anova={anova} />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                        <span style={{ color: COLOR.textDim, fontSize: FONT.min }}>
                            <span style={{ display: 'inline-block', width: 20, borderTop: `2px dashed ${COLOR.textDim}`, verticalAlign: 'middle', marginRight: 4 }} />
                            전체 평균 (Grand Mean)
                        </span>
                        <span style={{ color: COLOR.textDim, fontSize: FONT.min }}>
                            <span style={{ display: 'inline-block', width: 20, borderTop: `3px solid ${STATS_COLOR.series[0]}`, verticalAlign: 'middle', marginRight: 4 }} />
                            그룹 평균
                        </span>
                    </div>
                </div>

                {/* SS Decomposition bar chart + stats */}
                <div style={{
                    flex: '1 1 300px', maxWidth: 360,
                    display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                    {/* Stacked proportion bar */}
                    <div style={{
                        background: COLOR.cardBg, borderRadius: 12, padding: 16,
                        border: `1px solid ${COLOR.border}`,
                    }}>
                        <p style={{ color: COLOR.textMuted, fontSize: FONT.small, marginBottom: 12, textAlign: 'center' }}>
                            SST 분해: SSB + SSW
                        </p>
                        <ResponsiveContainer width="100%" height={60}>
                            <BarChart
                                layout="vertical"
                                data={[{
                                    name: 'SST',
                                    ssb: anova.ssb,
                                    ssw: anova.ssw,
                                }]}
                                margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip
                                    contentStyle={{
                                        background: COLOR.tooltipBg,
                                        border: `1px solid ${COLOR.border}`,
                                        borderRadius: 8,
                                        fontSize: FONT.small,
                                        color: COLOR.text,
                                    }}
                                    formatter={(value: unknown, name: unknown) => [
                                        Number(value).toFixed(1),
                                        String(name) === 'ssb' ? 'SSB (집단 간)' : 'SSW (집단 내)',
                                    ]}
                                />
                                <Bar dataKey="ssb" stackId="ss" fill={STATS_COLOR.series[0]} radius={[4, 0, 0, 4]} />
                                <Bar dataKey="ssw" stackId="ss" fill={STATS_COLOR.series[2]} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Proportion labels */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '0 10px' }}>
                            {ssBarData.map((d) => (
                                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color, display: 'inline-block' }} />
                                    <span style={{ color: COLOR.textMuted, fontSize: FONT.min }}>
                                        {d.name} ({d.pct}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ANOVA table */}
                    <div style={{
                        background: COLOR.cardBg, borderRadius: 12, padding: 16,
                        border: `1px solid ${COLOR.border}`,
                    }}>
                        <p style={{ color: COLOR.textMuted, fontSize: FONT.small, marginBottom: 12, textAlign: 'center' }}>
                            ANOVA 요약
                        </p>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: FONT.small }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${COLOR.border}` }}>
                                    {['요인', 'SS', 'df', 'MS'].map((h) => (
                                        <th key={h} style={{ color: COLOR.textMuted, fontWeight: 500, padding: '4px 6px', textAlign: 'right' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: `1px solid ${COLOR.border}` }}>
                                    <td style={{ color: STATS_COLOR.series[0], padding: '6px', fontWeight: 500 }}>집단 간 (B)</td>
                                    <td style={{ color: COLOR.text, textAlign: 'right', padding: '6px' }}>{anova.ssb.toFixed(1)}</td>
                                    <td style={{ color: COLOR.text, textAlign: 'right', padding: '6px' }}>{anova.dfBetween}</td>
                                    <td style={{ color: COLOR.text, textAlign: 'right', padding: '6px' }}>{anova.msb.toFixed(1)}</td>
                                </tr>
                                <tr style={{ borderBottom: `1px solid ${COLOR.border}` }}>
                                    <td style={{ color: STATS_COLOR.series[2], padding: '6px', fontWeight: 500 }}>집단 내 (W)</td>
                                    <td style={{ color: COLOR.text, textAlign: 'right', padding: '6px' }}>{anova.ssw.toFixed(1)}</td>
                                    <td style={{ color: COLOR.text, textAlign: 'right', padding: '6px' }}>{anova.dfWithin}</td>
                                    <td style={{ color: COLOR.text, textAlign: 'right', padding: '6px' }}>{anova.msw.toFixed(1)}</td>
                                </tr>
                                <tr>
                                    <td style={{ color: COLOR.textMuted, padding: '6px', fontWeight: 500 }}>합계 (T)</td>
                                    <td style={{ color: COLOR.text, textAlign: 'right', padding: '6px' }}>{anova.sst.toFixed(1)}</td>
                                    <td style={{ color: COLOR.text, textAlign: 'right', padding: '6px' }}>{anova.dfBetween + anova.dfWithin}</td>
                                    <td style={{ color: COLOR.textDim, textAlign: 'right', padding: '6px' }}>—</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* F-statistic & decision */}
                    <div style={{
                        background: COLOR.cardBg, borderRadius: 12, padding: 16,
                        border: `1px solid ${isSignificant ? STATS_COLOR.accentBorder : COLOR.border}`,
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: FONT.cardHeader, color: COLOR.textBright, fontWeight: 600, marginBottom: 4 }}>
                            F = {anova.fStat.toFixed(2)}
                        </div>
                        <div style={{ fontSize: FONT.body, color: COLOR.textMuted, marginBottom: 8 }}>
                            df = ({anova.dfBetween}, {anova.dfWithin}), {anova.pApprox}
                        </div>
                        <div style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: 6,
                            fontSize: FONT.small,
                            fontWeight: 600,
                            color: isSignificant ? '#065f46' : COLOR.textMuted,
                            background: isSignificant ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                        }}>
                            {isSignificant ? '✅ 귀무가설 기각 — 그룹 간 유의한 차이 있음' : '그룹 간 유의한 차이 없음'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Formula reference */}
            <div style={{
                marginTop: 20, padding: '12px 16px',
                background: COLOR.cardBg, borderRadius: 8,
                border: `1px solid ${COLOR.border}`,
                textAlign: 'center',
                fontSize: FONT.min, color: COLOR.textDim, lineHeight: 1.8,
            }}>
                SST = SSB + SSW &nbsp;|&nbsp; F = MSB / MSW = (SSB/df₁) / (SSW/df₂) &nbsp;|&nbsp;
                df₁ = k−1 = {anova.dfBetween}, df₂ = N−k = {anova.dfWithin}
            </div>
        </div>
    );
}
