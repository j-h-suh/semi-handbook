'use client';

import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    ReferenceLine, Tooltip,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── 정규분포 역함수 (근사) ─── */
function qnorm(p: number): number {
    // Rational approximation (Abramowitz & Stegun 26.2.23)
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    if (p < 0.5) return -qnorm(1 - p);
    const t = Math.sqrt(-2 * Math.log(1 - p));
    const c0 = 2.515517, c1 = 0.802853, c2 = 0.010328;
    const d1 = 1.432788, d2 = 0.189269, d3 = 0.001308;
    return t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
}

/** 두 비율 비교 시 필요 표본 크기 (각 그룹) */
function sampleSizePerGroup(mde: number, alpha: number, power: number, baseRate: number): number {
    const zAlpha = qnorm(1 - alpha / 2);
    const zBeta = qnorm(power);
    const p1 = baseRate;
    const p2 = baseRate + mde;
    const pBar = (p1 + p2) / 2;
    const n = ((zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) / mde) ** 2;
    return Math.ceil(n);
}

export default function SampleSizeCalculator() {
    const [alpha, setAlpha] = useState(0.05);
    const [power, setPower] = useState(0.80);
    const [baseRate, setBaseRate] = useState(0.10); // 기본 전환율 10%

    const data = useMemo(() => {
        const pts: { mde: number; n: number }[] = [];
        for (let mde = 0.002; mde <= 0.05; mde += 0.001) {
            const n = sampleSizePerGroup(mde, alpha, power, baseRate);
            if (isFinite(n) && n > 0 && n < 10_000_000) {
                pts.push({ mde: Math.round(mde * 1000) / 10, n }); // mde as percentage points * 10
            }
        }
        return pts;
    }, [alpha, power, baseRate]);

    // 대표 MDE 값 (1%p)
    const sampleAtOnePct = sampleSizePerGroup(0.01, alpha, power, baseRate);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                A/B 테스트 표본 크기 계산기
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Sample Size Calculator — smaller MDE requires exponentially more data
            </p>

            {/* 슬라이더 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                    { label: '유의수준 α', value: alpha, set: setAlpha, min: 0.01, max: 0.10, step: 0.01, fmt: (v: number) => v.toFixed(2) },
                    { label: '검정력 (1-β)', value: power, set: setPower, min: 0.70, max: 0.95, step: 0.05, fmt: (v: number) => `${(v * 100).toFixed(0)}%` },
                    { label: '기본 전환율', value: baseRate, set: setBaseRate, min: 0.01, max: 0.30, step: 0.01, fmt: (v: number) => `${(v * 100).toFixed(0)}%` },
                ].map(({ label, value, set, min, max, step, fmt }) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>{label}</span>
                        <span style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STATS_COLOR.accent }}>{fmt(value)}</span>
                        <input
                            type="range" min={min} max={max} step={step} value={value}
                            onChange={e => set(parseFloat(e.target.value))}
                            style={{ width: 140, accentColor: STATS_COLOR.accent }}
                        />
                    </div>
                ))}
            </div>

            {/* 결과 배너 */}
            <div style={{
                textAlign: 'center', padding: '8px 16px', borderRadius: 8,
                background: COLOR.cardBg, border: `1px solid ${STATS_COLOR.accentBorder}`,
                marginBottom: 16, maxWidth: 420, margin: '0 auto 16px',
            }}>
                <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>MDE = 1%p 감지에 필요한 그룹당 표본: </span>
                <span style={{ fontSize: FONT.title, fontWeight: 700, color: STATS_COLOR.accent }}>
                    {sampleAtOnePct.toLocaleString()}명
                </span>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 60, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        dataKey="mde" type="number"
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'MDE (%p × 10)', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
                        label={{ value: '그룹당 표본 크기', angle: -90, position: 'insideLeft', offset: -10, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
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
                                    <div style={{ color: COLOR.textMuted }}>MDE = {(d.mde / 10).toFixed(1)}%p</div>
                                    <div style={{ color: STATS_COLOR.accent, fontWeight: 600 }}>n = {d.n.toLocaleString()}명/그룹</div>
                                </div>
                            );
                        }}
                    />
                    <ReferenceLine x={10} stroke={STATS_COLOR.series[3]} strokeDasharray="4 3" strokeWidth={1} />
                    <Line
                        type="monotone" dataKey="n" dot={false}
                        stroke={STATS_COLOR.accent} strokeWidth={2.5}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>

            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 8 }}>
                MDE가 절반으로 줄면 필요 표본은 약 4배로 늘어난다 (n ∝ 1/MDE²).
            </p>
        </div>
    );
}
