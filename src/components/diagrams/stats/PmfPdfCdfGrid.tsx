'use client';

import React, { useState } from 'react';
import {
    BarChart, Bar, AreaChart, Area, LineChart, Line,
    XAxis, YAxis, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

// Binomial PMF: P(X=k) for n=10, p=0.5
function binomPmf(k: number, n: number, p: number) {
    let coeff = 1;
    for (let i = 0; i < k; i++) coeff = coeff * (n - i) / (i + 1);
    return coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function normalPdf(x: number, mu: number, sigma: number) {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

function normalCdf(x: number, mu: number, sigma: number) {
    const z = (x - mu) / sigma;
    return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

function erf(x: number) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1 / (1 + p * x);
    return sign * (1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x));
}

// Data
const pmfData = Array.from({ length: 11 }, (_, k) => ({ x: k, y: binomPmf(k, 10, 0.5) }));
const pdfData: { x: number; y: number }[] = [];
for (let x = -4; x <= 4; x += 0.1) pdfData.push({ x: Math.round(x * 10) / 10, y: normalPdf(x, 0, 1) });

const discreteCdf = pmfData.reduce<{ x: number; y: number }[]>((acc, d) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].y : 0;
    acc.push({ x: d.x, y: prev + d.y });
    return acc;
}, []);

const continuousCdf: { x: number; y: number }[] = [];
for (let x = -4; x <= 4; x += 0.1) continuousCdf.push({ x: Math.round(x * 10) / 10, y: normalCdf(x, 0, 1) });

type Tab = 'discrete' | 'continuous';

const CHART_H = 160;

export default function PmfPdfCdfGrid() {
    const [tab, setTab] = useState<Tab>('discrete');

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                PMF/PDF와 CDF 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Probability Function vs Cumulative Distribution Function
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                {([['discrete', '이산 (Binomial n=10, p=0.5)'], ['continuous', '연속 (Normal μ=0, σ=1)']] as [Tab, string][]).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        style={{
                            padding: '6px 16px', borderRadius: 8, fontSize: FONT.small,
                            fontWeight: tab === key ? 600 : 400,
                            color: tab === key ? '#fff' : COLOR.textMuted,
                            background: tab === key ? STATS_COLOR.accentDim : 'transparent',
                            border: `1px solid ${tab === key ? STATS_COLOR.accent : COLOR.border}`,
                            cursor: 'pointer', transition: 'all 0.2s',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 640, margin: '0 auto' }}>
                {/* Left: PMF or PDF */}
                <div>
                    <p style={{ textAlign: 'center', fontSize: FONT.small, color: STATS_COLOR.accent, fontWeight: 600, marginBottom: 4 }}>
                        {tab === 'discrete' ? 'PMF — P(X = k)' : 'PDF — f(x)'}
                    </p>
                    <ResponsiveContainer width="100%" height={CHART_H}>
                        {tab === 'discrete' ? (
                            <BarChart data={pmfData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="x" tick={{ fontSize: 11, fill: COLOR.textDim }} axisLine={{ stroke: COLOR.border }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: COLOR.textDim }} axisLine={{ stroke: COLOR.border }} tickLine={false} domain={[0, 0.3]} />
                                <Bar dataKey="y" fill={STATS_COLOR.accent} opacity={0.7} radius={[2, 2, 0, 0]} />
                            </BarChart>
                        ) : (
                            <AreaChart data={pdfData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="x" type="number" tick={{ fontSize: 11, fill: COLOR.textDim }} axisLine={{ stroke: COLOR.border }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: COLOR.textDim }} axisLine={{ stroke: COLOR.border }} tickLine={false} domain={[0, 0.45]} />
                                <Area type="monotone" dataKey="y" stroke={STATS_COLOR.accent} fill={STATS_COLOR.areaFill} strokeWidth={2} isAnimationActive={false} />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                    <p style={{ textAlign: 'center', fontSize: 11, color: COLOR.textDim, marginTop: 2 }}>
                        {tab === 'discrete' ? '각 막대 = 그 값이 나올 확률' : '곡선 아래 면적 = 확률 (높이 자체는 확률 아님)'}
                    </p>
                </div>

                {/* Right: CDF */}
                <div>
                    <p style={{ textAlign: 'center', fontSize: FONT.small, color: STATS_COLOR.series[1], fontWeight: 600, marginBottom: 4 }}>
                        CDF — P(X ≤ x)
                    </p>
                    <ResponsiveContainer width="100%" height={CHART_H}>
                        <LineChart data={tab === 'discrete' ? discreteCdf : continuousCdf} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="x" type="number" tick={{ fontSize: 11, fill: COLOR.textDim }} axisLine={{ stroke: COLOR.border }} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: COLOR.textDim }} axisLine={{ stroke: COLOR.border }} tickLine={false} domain={[0, 1]} />
                            <Line
                                type={tab === 'discrete' ? 'stepAfter' : 'monotone'}
                                dataKey="y" dot={false}
                                stroke={STATS_COLOR.series[1]} strokeWidth={2}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    <p style={{ textAlign: 'center', fontSize: 11, color: COLOR.textDim, marginTop: 2 }}>
                        {tab === 'discrete' ? '계단 함수 — 정수에서만 점프' : '부드러운 S자 곡선 — 항상 0→1'}
                    </p>
                </div>
            </div>
        </div>
    );
}
