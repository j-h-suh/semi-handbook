'use client';

import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    Tooltip, Legend,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── Beta 분포 PDF ─── */
function lnGamma(z: number): number {
    // Stirling approx for Gamma via Lanczos
    const g = 7;
    const c = [
        0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];
    if (z < 0.5) {
        return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
    }
    z -= 1;
    let x = c[0];
    for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function betaPdf(x: number, a: number, b: number): number {
    if (x <= 0 || x >= 1) return 0;
    const lnB = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
    return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lnB);
}

/* ─── 사전분포 프리셋 ─── */
interface PriorConfig {
    label: string;
    a: number;
    b: number;
    color: string;
}

const PRIORS: PriorConfig[] = [
    { label: '무정보 Beta(1,1)', a: 1, b: 1, color: STATS_COLOR.series[0] },
    { label: '약정보 Beta(5,2)', a: 5, b: 2, color: STATS_COLOR.series[1] },
    { label: '강정보 Beta(2,5)', a: 2, b: 5, color: STATS_COLOR.series[2] },
];

const TRUE_THETA = 0.7; // 진짜 모수
const DATA_SIZES = [0, 5, 20, 100, 500];

export default function PosteriorConvergence() {
    const [nData, setNData] = useState(0);

    // 관측: nData 중 TRUE_THETA 비율이 성공
    const successes = Math.round(nData * TRUE_THETA);
    const failures = nData - successes;

    const chartData = useMemo(() => {
        const pts: Record<string, number>[] = [];
        for (let x = 0.01; x <= 0.99; x += 0.01) {
            const pt: Record<string, number> = { theta: Math.round(x * 100) / 100 };
            for (const prior of PRIORS) {
                const postA = prior.a + successes;
                const postB = prior.b + failures;
                pt[prior.label] = Math.round(betaPdf(x, postA, postB) * 10000) / 10000;
            }
            pts.push(pt);
        }
        return pts;
    }, [successes, failures]);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                사후분포의 수렴
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Posterior Convergence — different priors, same data, same conclusion
            </p>

            {/* 데이터 크기 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: FONT.min, color: COLOR.textMuted, alignSelf: 'center' }}>관측 데이터 n =</span>
                {DATA_SIZES.map(n => (
                    <button
                        key={n}
                        onClick={() => setNData(n)}
                        style={{
                            background: nData === n ? STATS_COLOR.accentDim : 'transparent',
                            color: nData === n ? STATS_COLOR.accent : COLOR.textMuted,
                            border: `1px solid ${nData === n ? STATS_COLOR.accentBorder : COLOR.border}`,
                            borderRadius: 6, padding: '4px 14px',
                            fontSize: FONT.small, fontWeight: nData === n ? 600 : 400,
                            cursor: 'pointer',
                        }}
                    >
                        {n}
                    </button>
                ))}
            </div>

            <div style={{
                textAlign: 'center', padding: '6px 14px', marginBottom: 16,
                fontSize: FONT.small, color: COLOR.textMuted,
            }}>
                성공 {successes}회 / 실패 {failures}회 (θ_true = {TRUE_THETA})
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        dataKey="theta" type="number" domain={[0, 1]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'θ', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'f(θ|data)', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <Tooltip
                        content={({ payload }) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            return (
                                <div style={{
                                    background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 6, padding: '6px 10px', fontSize: FONT.min,
                                }}>
                                    <div style={{ color: COLOR.textMuted }}>θ = {d.theta}</div>
                                    {PRIORS.map(p => (
                                        <div key={p.label} style={{ color: p.color }}>
                                            {p.label}: {(d[p.label] as number)?.toFixed(3)}
                                        </div>
                                    ))}
                                </div>
                            );
                        }}
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: FONT.min, paddingBottom: 8 }} />
                    {PRIORS.map(p => (
                        <Line
                            key={p.label}
                            name={p.label}
                            type="monotone"
                            dataKey={p.label}
                            dot={false}
                            stroke={p.color}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>

            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 8 }}>
                데이터가 많아질수록 서로 다른 사전분포에서 출발해도 사후분포가 같은 곳(θ = {TRUE_THETA})으로 수렴한다.
            </p>
        </div>
    );
}
