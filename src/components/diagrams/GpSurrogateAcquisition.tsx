'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ReferenceDot } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* Simulate GP mean + uncertainty band over Dose range */
const N = 60;
const DATA = Array.from({ length: N }, (_, i) => {
    const x = 20 + (i / (N - 1)) * 10; // Dose 20~30
    /* True function: CD = 25 - 0.8*(x-25) + 0.15*(x-25)^2 */
    const dx = x - 25;
    const mean = 25 - 0.8 * dx + 0.15 * dx * dx;
    /* Uncertainty: lower where we have "observations" */
    const hasData = [21, 23, 25, 27, 29].some(d => Math.abs(x - d) < 0.8);
    const sigma = hasData ? 0.3 : 1.2 + 0.5 * Math.sin(x * 0.7);
    /* Acquisition: EI-like (higher where mean is good + uncertainty is high) */
    const ei = Math.max(0, (25 - mean) + 0.8 * sigma);
    return { x: +x.toFixed(1), mean: +mean.toFixed(2), upper: +(mean + sigma).toFixed(2), lower: +(mean - sigma).toFixed(2), ei: +ei.toFixed(2) };
});

const OBSERVATIONS = [
    { x: 21, y: 28.3 }, { x: 23, y: 26.1 }, { x: 25, y: 25.0 }, { x: 27, y: 25.4 }, { x: 29, y: 27.8 },
];

export default function GpSurrogateAcquisition() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                GP Surrogate + Acquisition Function 시각화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                파란 = GP 평균 ± 불확실성, 초록 = Acquisition (EI), 점 = 관측치
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={280} maxHeight={280}>
                    <LineChart data={DATA} margin={{ top: 8, right: 30, left: 10, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="x" type="number" domain={[20, 30]} ticks={[20, 22, 24, 26, 28, 30]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'Dose (mJ/cm²)', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis domain={[20, 32]} ticks={[20, 22, 24, 26, 28, 30, 32]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'CD (nm)', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small }}
                            labelStyle={{ color: COLOR.textBright }}
                            itemStyle={{ color: COLOR.textBright }}
                            labelFormatter={(l) => `Dose: ${l} mJ/cm²`} />
                        {/* Uncertainty band */}
                        <Area type="monotone" dataKey="upper" stroke="none" fill="#3b82f6" fillOpacity={0.08} isAnimationActive={false} />
                        <Area type="monotone" dataKey="lower" stroke="none" fill="rgba(0,0,0,1)" fillOpacity={0.08} isAnimationActive={false} />
                        {/* GP mean */}
                        <Line type="monotone" dataKey="mean" name="GP Mean" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                        {/* Uncertainty bounds */}
                        <Line type="monotone" dataKey="upper" name="Upper σ" stroke="#3b82f6" strokeWidth={0.5} strokeDasharray="3 2" dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="lower" name="Lower σ" stroke="#3b82f6" strokeWidth={0.5} strokeDasharray="3 2" dot={false} isAnimationActive={false} />
                        {/* EI */}
                        <Line type="monotone" dataKey="ei" name="EI (Acquisition)" stroke="#22c55e" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                        {/* Observations */}
                        {OBSERVATIONS.map((o, i) => (
                            <ReferenceDot key={i} x={o.x} y={o.y} r={4} fill="#f59e0b" stroke="#f59e0b" strokeWidth={1} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
