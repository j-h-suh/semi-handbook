'use client';

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

type DistType = 'normal' | 'exponential' | 'uniform';

function normalPdf(x: number, mu: number, sigma: number) {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

function expPdf(x: number, lambda: number) {
    return x < 0 ? 0 : lambda * Math.exp(-lambda * x);
}

function uniformPdf(x: number, a: number, b: number) {
    return x >= a && x <= b ? 1 / (b - a) : 0;
}

const DIST_CONFIGS: Record<DistType, {
    label: string;
    params: { name: string; key: string; min: number; max: number; step: number; default: number }[];
    generate: (params: Record<string, number>) => { x: number; y: number }[];
    stats: (params: Record<string, number>) => { mean: number; variance: number };
}> = {
    normal: {
        label: '정규분포 N(μ, σ²)',
        params: [
            { name: 'μ', key: 'mu', min: -3, max: 3, step: 0.1, default: 0 },
            { name: 'σ', key: 'sigma', min: 0.3, max: 3, step: 0.1, default: 1 },
        ],
        generate: (p) => {
            const pts: { x: number; y: number }[] = [];
            const range = Math.max(4 * p.sigma, 5);
            for (let x = p.mu - range; x <= p.mu + range; x += range / 150) {
                pts.push({ x: Math.round(x * 100) / 100, y: normalPdf(x, p.mu, p.sigma) });
            }
            return pts;
        },
        stats: (p) => ({ mean: p.mu, variance: p.sigma ** 2 }),
    },
    exponential: {
        label: '지수분포 Exp(λ)',
        params: [
            { name: 'λ', key: 'lambda', min: 0.2, max: 5, step: 0.1, default: 1 },
        ],
        generate: (p) => {
            const pts: { x: number; y: number }[] = [];
            const xMax = Math.max(8 / p.lambda, 5);
            for (let x = 0; x <= xMax; x += xMax / 200) {
                pts.push({ x: Math.round(x * 100) / 100, y: expPdf(x, p.lambda) });
            }
            return pts;
        },
        stats: (p) => ({ mean: 1 / p.lambda, variance: 1 / (p.lambda ** 2) }),
    },
    uniform: {
        label: '균등분포 U(a, b)',
        params: [
            { name: 'a', key: 'a', min: -5, max: 3, step: 0.5, default: 0 },
            { name: 'b', key: 'b', min: -2, max: 8, step: 0.5, default: 5 },
        ],
        generate: (p) => {
            const a = Math.min(p.a, p.b - 0.1);
            const margin = (p.b - a) * 0.3;
            const pts: { x: number; y: number }[] = [];
            for (let x = a - margin; x <= p.b + margin; x += 0.05) {
                pts.push({ x: Math.round(x * 100) / 100, y: uniformPdf(x, a, p.b) });
            }
            return pts;
        },
        stats: (p) => ({ mean: (p.a + p.b) / 2, variance: (p.b - p.a) ** 2 / 12 }),
    },
};

const DIST_KEYS: DistType[] = ['normal', 'exponential', 'uniform'];

export default function ContinuousDistributionExplorer() {
    const [dist, setDist] = useState<DistType>('normal');
    const config = DIST_CONFIGS[dist];
    const [params, setParams] = useState<Record<string, number>>(() =>
        Object.fromEntries(config.params.map(p => [p.key, p.default]))
    );

    // Reset params when switching dist
    const handleDistChange = (d: DistType) => {
        setDist(d);
        setParams(Object.fromEntries(DIST_CONFIGS[d].params.map(p => [p.key, p.default])));
    };

    const data = useMemo(() => config.generate(params), [config, params]);
    const stats = config.stats(params);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                연속분포 탐색기
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Continuous Distribution Explorer
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                {DIST_KEYS.map(key => (
                    <button key={key} onClick={() => handleDistChange(key)} style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: FONT.small,
                        fontWeight: dist === key ? 600 : 400,
                        color: dist === key ? '#fff' : COLOR.textMuted,
                        background: dist === key ? STATS_COLOR.accentDim : 'transparent',
                        border: `1px solid ${dist === key ? STATS_COLOR.accent : COLOR.border}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        {DIST_CONFIGS[key].label}
                    </button>
                ))}
            </div>

            {/* Sliders */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12, flexWrap: 'wrap' }}>
                {config.params.map(pc => (
                    <div key={pc.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>{pc.name} = {(params[pc.key] ?? pc.default).toFixed(1)}</span>
                        <input type="range" min={pc.min} max={pc.max} step={pc.step}
                            value={params[pc.key] ?? pc.default}
                            onChange={e => setParams(prev => ({ ...prev, [pc.key]: parseFloat(e.target.value) }))}
                            style={{ width: 160, accentColor: STATS_COLOR.accent }} />
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 12,
                padding: '6px 16px', borderRadius: 8, background: COLOR.cardBg, width: 'fit-content', margin: '0 auto 12px',
            }}>
                <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>
                    E[X] = <span style={{ color: STATS_COLOR.accent }}>{stats.mean.toFixed(2)}</span>
                </span>
                <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>
                    Var(X) = <span style={{ color: STATS_COLOR.series[1] }}>{stats.variance.toFixed(2)}</span>
                </span>
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                    <defs>
                        <linearGradient id="contFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={STATS_COLOR.accent} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={STATS_COLOR.accent} stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="x" type="number" tick={{ fontSize: FONT.min, fill: COLOR.textDim }} axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'x', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }} />
                    <YAxis tick={{ fontSize: FONT.min, fill: COLOR.textDim }} axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'f(x)', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: FONT.min, fill: COLOR.textDim } }} />
                    <Tooltip content={({ payload }) => {
                        if (!payload || !payload.length) return null;
                        const d = payload[0]?.payload;
                        return d ? (
                            <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', fontSize: FONT.min }}>
                                <div style={{ color: COLOR.textMuted }}>x = {d.x.toFixed(2)}</div>
                                <div style={{ color: STATS_COLOR.accent, fontWeight: 600 }}>f(x) = {d.y.toFixed(4)}</div>
                            </div>
                        ) : null;
                    }} />
                    <Area type="monotone" dataKey="y" stroke={STATS_COLOR.accent} fill="url(#contFill)" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
