'use client';

import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    ReferenceLine, Tooltip, ReferenceArea,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

function sigmoid(z: number): number {
    if (z > 500) return 1;
    if (z < -500) return 0;
    return 1 / (1 + Math.exp(-z));
}

export default function SigmoidCurve() {
    const [beta0, setBeta0] = useState(0);   // intercept
    const [beta1, setBeta1] = useState(1);   // slope

    const data = useMemo(() => {
        const pts: { x: number; p: number }[] = [];
        for (let x = -8; x <= 8; x += 0.2) {
            const z = beta0 + beta1 * x;
            pts.push({ x: Math.round(x * 10) / 10, p: Math.round(sigmoid(z) * 10000) / 10000 });
        }
        return pts;
    }, [beta0, beta1]);

    // 결정 경계: σ(β₀ + β₁x) = 0.5 → x = -β₀/β₁
    const boundary = beta1 !== 0 ? -beta0 / beta1 : null;
    const boundaryInRange = boundary !== null && boundary >= -8 && boundary <= 8;

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                시그모이드 함수와 결정 경계
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Logistic Regression — σ(β₀ + β₁x) maps any input to [0, 1]
            </p>

            {/* 슬라이더 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                    { label: 'β₀ (절편)', value: beta0, set: setBeta0, min: -5, max: 5, step: 0.1 },
                    { label: 'β₁ (기울기)', value: beta1, set: setBeta1, min: -5, max: 5, step: 0.1 },
                ].map(({ label, value, set, min, max, step }) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>{label}</span>
                        <span style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STATS_COLOR.accent }}>
                            {value.toFixed(1)}
                        </span>
                        <input
                            type="range" min={min} max={max} step={step} value={value}
                            onChange={e => set(parseFloat(e.target.value))}
                            style={{ width: 160, accentColor: STATS_COLOR.accent }}
                        />
                    </div>
                ))}
            </div>

            {/* 결정 경계 정보 */}
            {boundaryInRange && (
                <div style={{
                    textAlign: 'center', padding: '6px 14px', borderRadius: 8,
                    background: COLOR.cardBg, border: `1px solid ${STATS_COLOR.accentBorder}`,
                    marginBottom: 16, maxWidth: 350, margin: '0 auto 16px',
                }}>
                    <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>결정 경계 (p = 0.5): </span>
                    <span style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STATS_COLOR.series[3] }}>
                        x = {boundary!.toFixed(2)}
                    </span>
                </div>
            )}

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        dataKey="x" type="number" domain={[-8, 8]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'x', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1.0]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'σ(z)', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
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
                                    <div style={{ color: COLOR.textMuted }}>x = {d.x}</div>
                                    <div style={{ color: STATS_COLOR.accent }}>σ(z) = {d.p.toFixed(4)}</div>
                                    <div style={{ color: COLOR.textDim }}>
                                        → {d.p >= 0.5 ? 'Class 1' : 'Class 0'}
                                    </div>
                                </div>
                            );
                        }}
                    />
                    {/* p=0.5 기준선 */}
                    <ReferenceLine y={0.5} stroke={COLOR.textDim} strokeDasharray="4 3" strokeWidth={1} />
                    {/* 결정 경계 수직선 */}
                    {boundaryInRange && (
                        <ReferenceLine x={boundary!} stroke={STATS_COLOR.series[3]} strokeDasharray="4 3" strokeWidth={1.5} />
                    )}
                    {/* Class 0/1 영역 */}
                    {boundaryInRange && beta1 > 0 && (
                        <>
                            <ReferenceArea x1={-8} x2={boundary!} y1={0} y2={1} fill={STATS_COLOR.series[2]} fillOpacity={0.04} />
                            <ReferenceArea x1={boundary!} x2={8} y1={0} y2={1} fill={STATS_COLOR.series[0]} fillOpacity={0.04} />
                        </>
                    )}
                    {boundaryInRange && beta1 < 0 && (
                        <>
                            <ReferenceArea x1={-8} x2={boundary!} y1={0} y2={1} fill={STATS_COLOR.series[0]} fillOpacity={0.04} />
                            <ReferenceArea x1={boundary!} x2={8} y1={0} y2={1} fill={STATS_COLOR.series[2]} fillOpacity={0.04} />
                        </>
                    )}
                    <Line
                        type="monotone" dataKey="p" dot={false}
                        stroke={STATS_COLOR.accent} strokeWidth={2.5}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>

            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 8 }}>
                β₁이 클수록 전환이 급격하고, β₀은 곡선을 좌우로 이동시킨다. β₁ &lt; 0이면 S자가 뒤집힌다.
            </p>
        </div>
    );
}
