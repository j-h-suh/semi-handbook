'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, ReferenceArea, ReferenceLine, Tooltip, Cell,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── 간단한 Metropolis-Hastings 시뮬레이션 ─── */
function seededRandom(seed: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
}

function normalRandom(seed: number): number {
    // Box-Muller
    const u1 = Math.max(1e-10, seededRandom(seed));
    const u2 = seededRandom(seed + 7919);
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** 타겟: Normal(3, 1) 에서 샘플링 */
const TARGET_MU = 3.0;
const TARGET_SIGMA = 1.0;

function logTarget(x: number): number {
    return -0.5 * ((x - TARGET_MU) / TARGET_SIGMA) ** 2;
}

function runMCMC(nSteps: number, runSeed: number): number[] {
    const chain: number[] = [];
    let current = 0; // 시작점 (0에서 출발 — burn-in 효과 보여줌)
    const proposalSigma = 0.8;

    for (let i = 0; i < nSteps; i++) {
        const proposal = current + normalRandom(runSeed * 10000 + i * 2) * proposalSigma;
        const logAlpha = logTarget(proposal) - logTarget(current);
        const u = seededRandom(runSeed * 10000 + i * 2 + 1);
        if (Math.log(u) < logAlpha) {
            current = proposal;
        }
        chain.push(Math.round(current * 1000) / 1000);
    }
    return chain;
}

const N_STEPS = 500;
const BURN_IN = 50;
const N_BINS = 30;

export default function MCMCTraceViewer() {
    const [runKey, setRunKey] = useState(0);

    const chain = useMemo(() => runMCMC(N_STEPS, runKey), [runKey]);

    // Trace plot 데이터
    const traceData = useMemo(() =>
        chain.map((val, i) => ({ step: i, value: val })),
    [chain]);

    // 히스토그램 데이터 (burn-in 제외)
    const histData = useMemo(() => {
        const postBurnin = chain.slice(BURN_IN);
        const min = Math.min(...postBurnin);
        const max = Math.max(...postBurnin);
        const binWidth = (max - min) / N_BINS || 0.1;
        const bins: { center: number; count: number }[] = [];
        for (let i = 0; i < N_BINS; i++) {
            const lo = min + i * binWidth;
            const hi = lo + binWidth;
            const center = Math.round((lo + hi) / 2 * 100) / 100;
            const count = postBurnin.filter(v => v >= lo && (i === N_BINS - 1 ? v <= hi : v < hi)).length;
            bins.push({ center, count });
        }
        return bins;
    }, [chain]);

    // 사후 통계
    const postBurnin = chain.slice(BURN_IN);
    const mean = postBurnin.reduce((s, v) => s + v, 0) / postBurnin.length;
    const std = Math.sqrt(postBurnin.reduce((s, v) => s + (v - mean) ** 2, 0) / postBurnin.length);

    const handleRerun = useCallback(() => setRunKey(k => k + 1), []);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                MCMC Trace Plot & 사후분포
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Metropolis-Hastings sampling from N({TARGET_MU}, {TARGET_SIGMA}²)
            </p>

            {/* 통계 배너 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                {[
                    { label: '사후 평균', value: mean.toFixed(3), color: STATS_COLOR.accent },
                    { label: '사후 표준편차', value: std.toFixed(3), color: STATS_COLOR.series[1] },
                    { label: 'Burn-in', value: `${BURN_IN} steps`, color: STATS_COLOR.series[2] },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        textAlign: 'center', padding: '4px 10px', borderRadius: 6,
                        background: COLOR.cardBg, border: `1px solid ${COLOR.border}`,
                    }}>
                        <div style={{ fontSize: FONT.min, color: COLOR.textMuted }}>{label}</div>
                        <div style={{ fontSize: FONT.body, fontWeight: 700, color }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* 두 차트 나란히 */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Trace plot */}
                <div style={{ flex: '1 1 400px', maxWidth: 500 }}>
                    <p style={{ textAlign: 'center', fontSize: FONT.small, color: COLOR.textMuted, marginBottom: 4 }}>
                        Trace Plot
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={traceData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis
                                dataKey="step" type="number" domain={[0, N_STEPS]}
                                tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                                axisLine={{ stroke: COLOR.border }} tickLine={false}
                                label={{ value: 'Step', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                            />
                            <YAxis
                                tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                                axisLine={{ stroke: COLOR.border }} tickLine={false}
                            />
                            <Tooltip
                                content={({ payload }) => {
                                    if (!payload?.[0]) return null;
                                    const d = payload[0].payload;
                                    return (
                                        <div style={{
                                            background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 6, padding: '6px 10px', fontSize: FONT.min,
                                        }}>
                                            <div style={{ color: COLOR.textMuted }}>Step {d.step}</div>
                                            <div style={{ color: STATS_COLOR.accent }}>θ = {d.value.toFixed(3)}</div>
                                        </div>
                                    );
                                }}
                            />
                            {/* Burn-in 영역 */}
                            <ReferenceArea x1={0} x2={BURN_IN} fill={STATS_COLOR.series[2]} fillOpacity={0.1} />
                            <ReferenceLine y={TARGET_MU} stroke={STATS_COLOR.series[3]} strokeDasharray="4 3" strokeWidth={1} />
                            <Line
                                type="linear" dataKey="value" dot={false}
                                stroke={STATS_COLOR.accent} strokeWidth={0.8}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 사후분포 히스토그램 */}
                <div style={{ flex: '1 1 250px', maxWidth: 300 }}>
                    <p style={{ textAlign: 'center', fontSize: FONT.small, color: COLOR.textMuted, marginBottom: 4 }}>
                        사후분포 (burn-in 제외)
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={histData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis
                                dataKey="center" type="number"
                                tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                                axisLine={{ stroke: COLOR.border }} tickLine={false}
                                label={{ value: 'θ', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                            />
                            <YAxis
                                tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                                axisLine={{ stroke: COLOR.border }} tickLine={false}
                            />
                            <Bar dataKey="count" isAnimationActive={false}>
                                {histData.map((_, i) => (
                                    <Cell key={i} fill={STATS_COLOR.accent} fillOpacity={0.6} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 재실행 버튼 */}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button
                    onClick={handleRerun}
                    style={{
                        background: STATS_COLOR.accentDim,
                        color: STATS_COLOR.accent,
                        border: `1px solid ${STATS_COLOR.accentBorder}`,
                        borderRadius: 8, padding: '8px 20px',
                        fontSize: FONT.body, fontWeight: 600, cursor: 'pointer',
                    }}
                >
                    체인 재실행
                </button>
                <p style={{ color: COLOR.textDim, fontSize: FONT.min, marginTop: 4 }}>
                    핑크 영역이 burn-in 구간. 점선은 참값 μ = {TARGET_MU}.
                </p>
            </div>
        </div>
    );
}
