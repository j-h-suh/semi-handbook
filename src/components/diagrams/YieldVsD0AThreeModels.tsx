'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const X_POINTS = Array.from({ length: 61 }, (_, i) => i * 0.05);

function poisson(x: number) { return Math.exp(-x) * 100; }
function murphy(x: number) { return x === 0 ? 100 : Math.pow((1 - Math.exp(-x)) / x, 2) * 100; }
function nb(x: number, a: number) { return Math.pow(1 + x / a, -a) * 100; }

const DATA = X_POINTS.map(x => ({
    x: +x.toFixed(2),
    poisson: +poisson(x).toFixed(1),
    murphy: +murphy(x).toFixed(1),
    nb2: +nb(x, 2).toFixed(1),
    nb5: +nb(x, 5).toFixed(1),
}));

const CURVE_COLORS = { poisson: '#ef4444', murphy: '#3b82f6', nb2: '#22c55e', nb5: '#f59e0b' };

export default function YieldVsD0AThreeModels() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                D₀×A 대비 수율 — 3대 수율 모델 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                클러스터링이 있으면 Murphy/NB 모델이 Poisson보다 높은 수율 예측
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={320} maxHeight={320}>
                    <LineChart data={DATA} margin={{ top: 8, right: 30, left: 10, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="x" type="number" domain={[0, 3]} ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'D₀ × A', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small, color: COLOR.textMuted }}
                            formatter={((v: number | undefined, name: string | undefined) => [`${v ?? 0}%`, name ?? '']) as never} labelFormatter={(l) => `D₀A = ${l}`} />
                        <Legend wrapperStyle={{ fontSize: FONT.small, color: COLOR.textMuted }} />
                        <ReferenceLine x={0.81} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3" label={{ value: 'H100 (D₀A≈0.81)', fill: COLOR.textDim, fontSize: FONT.min, position: 'top' }} />
                        <Line dataKey="poisson" name="Poisson" stroke={CURVE_COLORS.poisson} strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line dataKey="murphy" name="Murphy" stroke={CURVE_COLORS.murphy} strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />
                        <Line dataKey="nb2" name="NB (α=2)" stroke={CURVE_COLORS.nb2} strokeWidth={2} strokeDasharray="4 2" dot={false} isAnimationActive={false} />
                        <Line dataKey="nb5" name="NB (α=5)" stroke={CURVE_COLORS.nb5} strokeWidth={2} strokeDasharray="2 2" dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
