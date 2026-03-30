'use client';

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

type DistType = 'binomial' | 'poisson';

function binomPmf(k: number, n: number, p: number) {
    let coeff = 1;
    for (let i = 0; i < k; i++) coeff = coeff * (n - i) / (i + 1);
    return coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function poissonPmf(k: number, lambda: number) {
    let logP = -lambda + k * Math.log(lambda);
    for (let i = 2; i <= k; i++) logP -= Math.log(i);
    return Math.exp(logP);
}

export default function DiscreteDistributionExplorer() {
    const [dist, setDist] = useState<DistType>('binomial');
    const [n, setN] = useState(20);
    const [p, setP] = useState(0.5);
    const [lambda, setLambda] = useState(5);

    const data = useMemo(() => {
        if (dist === 'binomial') {
            return Array.from({ length: n + 1 }, (_, k) => ({
                k, prob: binomPmf(k, n, p),
            }));
        }
        const maxK = Math.max(20, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
        return Array.from({ length: maxK + 1 }, (_, k) => ({
            k, prob: poissonPmf(k, lambda),
        }));
    }, [dist, n, p, lambda]);

    const mean = dist === 'binomial' ? n * p : lambda;
    const variance = dist === 'binomial' ? n * p * (1 - p) : lambda;

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                이산분포 탐색기
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Discrete Distribution Explorer
            </p>

            {/* Dist tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                {([['binomial', '이항분포 Bin(n, p)'], ['poisson', '포아송분포 Poi(λ)']] as [DistType, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => setDist(key)} style={{
                        padding: '6px 16px', borderRadius: 8, fontSize: FONT.small,
                        fontWeight: dist === key ? 600 : 400,
                        color: dist === key ? '#fff' : COLOR.textMuted,
                        background: dist === key ? STATS_COLOR.accentDim : 'transparent',
                        border: `1px solid ${dist === key ? STATS_COLOR.accent : COLOR.border}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Sliders */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12, flexWrap: 'wrap' }}>
                {dist === 'binomial' ? (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>n = {n}</span>
                            <input type="range" min={1} max={50} step={1} value={n}
                                onChange={e => setN(parseInt(e.target.value))}
                                style={{ width: 160, accentColor: STATS_COLOR.accent }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>p = {p.toFixed(2)}</span>
                            <input type="range" min={0.01} max={0.99} step={0.01} value={p}
                                onChange={e => setP(parseFloat(e.target.value))}
                                style={{ width: 160, accentColor: STATS_COLOR.accent }} />
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>λ = {lambda.toFixed(1)}</span>
                        <input type="range" min={0.5} max={30} step={0.5} value={lambda}
                            onChange={e => setLambda(parseFloat(e.target.value))}
                            style={{ width: 200, accentColor: STATS_COLOR.accent }} />
                    </div>
                )}
            </div>

            {/* Stats banner */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 12,
                padding: '6px 16px', borderRadius: 8, background: COLOR.cardBg, width: 'fit-content', margin: '0 auto 12px',
            }}>
                <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>
                    E[X] = <span style={{ color: STATS_COLOR.accent }}>{mean.toFixed(2)}</span>
                </span>
                <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>
                    Var(X) = <span style={{ color: STATS_COLOR.series[1] }}>{variance.toFixed(2)}</span>
                </span>
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="k" tick={{ fontSize: FONT.min, fill: COLOR.textDim }} axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'k', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }} />
                    <YAxis tick={{ fontSize: FONT.min, fill: COLOR.textDim }} axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'P(X=k)', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: FONT.min, fill: COLOR.textDim } }} />
                    <Tooltip content={({ payload }) => {
                        if (!payload || !payload.length) return null;
                        const d = payload[0]?.payload;
                        return d ? (
                            <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', fontSize: FONT.min }}>
                                <div style={{ color: COLOR.textMuted }}>k = {d.k}</div>
                                <div style={{ color: STATS_COLOR.accent, fontWeight: 600 }}>P = {d.prob.toFixed(4)}</div>
                            </div>
                        ) : null;
                    }} />
                    <Bar dataKey="prob" fill={STATS_COLOR.accent} opacity={0.7} radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
