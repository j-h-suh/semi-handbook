'use client';

import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    Tooltip, Legend,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── 정규분포 PDF ─── */
function normalPdf(x: number, mu: number, sigma: number): number {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/* ─── KL Divergence (정규분포 → 해석해) ─── */
function klNormal(mu1: number, s1: number, mu2: number, s2: number): number {
    // KL(N(mu1,s1²) || N(mu2,s2²))
    return Math.log(s2 / s1) + (s1 * s1 + (mu1 - mu2) ** 2) / (2 * s2 * s2) - 0.5;
}

export default function KLDivergenceAsymmetry() {
    const [mu2, setMu2] = useState(2.0);
    const [sigma2, setSigma2] = useState(1.5);

    const MU1 = 0, SIGMA1 = 1.0;

    const klPQ = klNormal(MU1, SIGMA1, mu2, sigma2);
    const klQP = klNormal(mu2, sigma2, MU1, SIGMA1);

    const chartData = useMemo(() => {
        const pts: { x: number; p: number; q: number }[] = [];
        for (let x = -6; x <= 8; x += 0.1) {
            pts.push({
                x: Math.round(x * 10) / 10,
                p: Math.round(normalPdf(x, MU1, SIGMA1) * 10000) / 10000,
                q: Math.round(normalPdf(x, mu2, sigma2) * 10000) / 10000,
            });
        }
        return pts;
    }, [mu2, sigma2]);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                KL 발산의 비대칭성
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                KL Divergence — D_KL(P‖Q) ≠ D_KL(Q‖P)
            </p>

            {/* 슬라이더 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: FONT.min, color: STATS_COLOR.series[0] }}>P = N(0, 1) [고정]</span>
                </div>
                {[
                    { label: 'μ_Q', value: mu2, set: setMu2, min: -3, max: 5, step: 0.1 },
                    { label: 'σ_Q', value: sigma2, set: setSigma2, min: 0.3, max: 4, step: 0.1 },
                ].map(({ label, value, set, min, max, step }) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>{label}</span>
                        <span style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STATS_COLOR.series[1] }}>
                            {value.toFixed(1)}
                        </span>
                        <input
                            type="range" min={min} max={max} step={step} value={value}
                            onChange={e => set(parseFloat(e.target.value))}
                            style={{ width: 140, accentColor: STATS_COLOR.series[1] }}
                        />
                    </div>
                ))}
            </div>

            {/* KL 결과 배너 */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap',
            }}>
                <div style={{
                    textAlign: 'center', padding: '8px 16px', borderRadius: 8,
                    background: COLOR.cardBg, border: `1px solid ${STATS_COLOR.series[3]}40`,
                }}>
                    <div style={{ fontSize: FONT.min, color: COLOR.textMuted }}>D_KL(P ‖ Q)</div>
                    <div style={{ fontSize: FONT.title, fontWeight: 700, color: STATS_COLOR.series[3] }}>
                        {klPQ.toFixed(3)}
                    </div>
                </div>
                <div style={{
                    textAlign: 'center', padding: '8px 16px', borderRadius: 8,
                    background: COLOR.cardBg, border: `1px solid ${STATS_COLOR.series[4]}40`,
                }}>
                    <div style={{ fontSize: FONT.min, color: COLOR.textMuted }}>D_KL(Q ‖ P)</div>
                    <div style={{ fontSize: FONT.title, fontWeight: 700, color: STATS_COLOR.series[4] }}>
                        {klQP.toFixed(3)}
                    </div>
                </div>
                <div style={{
                    textAlign: 'center', padding: '8px 16px', borderRadius: 8,
                    background: COLOR.cardBg, border: `1px solid ${STATS_COLOR.series[2]}40`,
                }}>
                    <div style={{ fontSize: FONT.min, color: COLOR.textMuted }}>|차이|</div>
                    <div style={{ fontSize: FONT.title, fontWeight: 700, color: STATS_COLOR.series[2] }}>
                        {Math.abs(klPQ - klQP).toFixed(3)}
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        dataKey="x" type="number" domain={[-6, 8]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'x', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
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
                                    <div style={{ color: COLOR.textMuted }}>x = {d.x}</div>
                                    <div style={{ color: STATS_COLOR.series[0] }}>P(x) = {d.p.toFixed(4)}</div>
                                    <div style={{ color: STATS_COLOR.series[1] }}>Q(x) = {d.q.toFixed(4)}</div>
                                </div>
                            );
                        }}
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: FONT.min, paddingBottom: 8 }} />
                    <Line name="P = N(0, 1)" type="monotone" dataKey="p" dot={false}
                        stroke={STATS_COLOR.series[0]} strokeWidth={2.5} isAnimationActive={false} />
                    <Line name={`Q = N(${mu2.toFixed(1)}, ${sigma2.toFixed(1)}²)`} type="monotone" dataKey="q" dot={false}
                        stroke={STATS_COLOR.series[1]} strokeWidth={2.5} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>

            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 8 }}>
                KL(P‖Q)와 KL(Q‖P)가 다르다 — 이것이 KL이 &quot;거리&quot;가 아닌 &quot;발산&quot;인 이유다.
            </p>
        </div>
    );
}
