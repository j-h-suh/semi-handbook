'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, ReferenceArea, ResponsiveContainer, Tooltip } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* Classic underdamped step response: clear overshoot to ~560W */
const DATA = Array.from({ length: 80 }, (_, i) => {
    const t = i * 0.1;
    let value: number;
    if (t < 0.3) {
        value = 0;
    } else {
        const s = t - 0.3; // time since step
        const zeta = 0.3;  // underdamped
        const wn = 4.5;    // natural frequency
        const wd = wn * Math.sqrt(1 - zeta * zeta);
        value = 500 * (1 - Math.exp(-zeta * wn * s) * (Math.cos(wd * s) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * s)));
        if (t > 3) value = 500 + Math.sin(t * 3) * 2 + Math.cos(t * 7) * 1.5; // steady noise
    }
    return { t: +t.toFixed(1), value: +value.toFixed(1) };
});

const TARGET = 500;

export default function TraceSettlingOvershoot() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Trace 형상 피처 — Settling Time과 Overshoot
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Step Response의 특성을 정량화: Rise Time, Overshoot, Settling Time, AUC
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={300} maxHeight={300}>
                    <LineChart data={DATA} margin={{ top: 28, right: 40, left: 10, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="t" type="number" domain={[0, 8]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'Time (s)', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis domain={[0, 600]} ticks={[0, 100, 200, 300, 400, 500, 600]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'RF Power (W)', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small, color: COLOR.textMuted }}
                            formatter={(v?: number) => [`${(v ?? 0).toFixed(1)} W`, 'RF Power']}
                            labelFormatter={(l) => `${l} s`} />

                        {/* Target line */}
                        <ReferenceLine y={TARGET} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3"
                            label={{ value: 'Target 500W', fill: COLOR.textDim, fontSize: FONT.min, position: 'right' }} />
                        {/* ±2% settling band */}
                        <ReferenceArea y1={TARGET * 0.98} y2={TARGET * 1.02} fill="rgba(34,197,94,0.06)" />

                        {/* Rise region shading (10%→90%) */}
                        <ReferenceArea x1={0.3} x2={0.7} fill="rgba(255,255,255,0.06)"
                            label={{ value: 'Rise', fill: 'rgba(255,255,255,0.5)', fontSize: FONT.min, position: 'insideTop' }} />

                        {/* Overshoot peak: t_peak = 0.3 + π/ωd ≈ 1.0 */}
                        <ReferenceLine x={1.0} stroke="#ef4444" strokeDasharray="3 2" strokeWidth={0.8}
                            label={{ value: '⬆ Overshoot', fill: '#ef4444', fontSize: FONT.min, position: 'top' }} />

                        {/* Settling time: ≈ 4/(ζωn) = 4/(0.3×4.5) ≈ 3.0s after step (t=0.3) → t≈3.3 */}
                        <ReferenceLine x={3.3} stroke="#22c55e" strokeDasharray="3 2" strokeWidth={0.8}
                            label={{ value: 'Settling Time ➜', fill: '#22c55e', fontSize: FONT.min, position: 'top' }} />

                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
