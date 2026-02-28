'use client';

import React from 'react';
import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, Tooltip, CartesianGrid,
    ReferenceLine, ReferenceArea, Legend,
} from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── OES data: simulated emission intensity vs time ─── */
const rawData: { time: number; co: number; sif: number }[] = [];

// Phase 1: SiO₂ etching (0–60s) — CO strong, SiF weak
for (let t = 0; t <= 60; t += 2) {
    rawData.push({
        time: t,
        co: 75 + 8 * Math.sin(t / 10) + Math.random() * 4,
        sif: 12 + 3 * Math.sin(t / 8) + Math.random() * 3,
    });
}
// Phase 2: Transition / Endpoint (60–72s) — CO drops, SiF rises
for (let t = 62; t <= 72; t += 2) {
    const f = (t - 60) / 12; // 0 → 1
    rawData.push({
        time: t,
        co: 75 - 55 * f + Math.random() * 3,
        sif: 12 + 60 * f + Math.random() * 3,
    });
}
// Phase 3: Si exposure / Over-etch (72–100s) — CO low, SiF high
for (let t = 74; t <= 100; t += 2) {
    rawData.push({
        time: t,
        co: 18 + 3 * Math.sin(t / 6) + Math.random() * 3,
        sif: 72 + 5 * Math.sin(t / 7) + Math.random() * 4,
    });
}

const data = rawData.map(d => ({
    time: d.time,
    co: Math.round(d.co * 10) / 10,
    sif: Math.round(d.sif * 10) / 10,
}));

interface PayloadItem { name: string; value: number; color: string; }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: PayloadItem[]; label?: number }) {
    if (!active || !payload?.length) return null;
    const t = label ?? 0;
    let phase = '🔵 SiO₂ 식각 중';
    if (t >= 60 && t <= 72) phase = '🔴 종점 (Endpoint)';
    else if (t > 72) phase = '⚠️ Over-etch 영역';

    return (
        <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: `1px solid ${COLOR.border}`, borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <p style={{ color: COLOR.textBright, fontWeight: 600, fontSize: FONT.cardHeader, margin: '0 0 6px' }}>
                식각 시간: {t}s
            </p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color, fontSize: FONT.small, margin: '2px 0', fontWeight: 500 }}>
                    {p.name === 'co' ? 'CO (SiO₂ 식각 지표)' : 'SiF (Si 식각 지표)'}: <strong>{p.value}</strong> a.u.
                </p>
            ))}
            <p style={{ color: COLOR.textDim, fontSize: FONT.min, margin: '6px 0 0', borderTop: `1px solid ${COLOR.border}`, paddingTop: 4 }}>
                {phase}
            </p>
        </div>
    );
}

export default function OESEndpointDetection() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                OES 기반 식각 종점 검출
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Optical Emission Spectroscopy — Endpoint Detection
            </p>

            <ResponsiveContainer width="100%" height={380}>
                <LineChart data={data} margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

                    {/* Endpoint zone highlight */}
                    <ReferenceArea x1={60} x2={72} fill="#ef4444" fillOpacity={0.08} />

                    <XAxis dataKey="time"
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }} tickLine={false}
                        axisLine={{ stroke: COLOR.border }}
                        label={{ value: '식각 시간 (sec)', position: 'insideBottom', offset: -10, fill: COLOR.textDim, style: { fontSize: FONT.min } }}
                    />
                    <YAxis
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }} tickLine={false}
                        axisLine={{ stroke: COLOR.border }}
                        label={{ value: '발광 강도 (a.u.)', angle: -90, position: 'insideLeft', fill: COLOR.textDim, style: { fontSize: FONT.min, textAnchor: 'middle' } }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend align="right" verticalAlign="top" wrapperStyle={{ fontSize: FONT.min, paddingBottom: 8 }}
                        formatter={(value: string) => (
                            <span style={{ color: COLOR.textMuted }}>
                                {value === 'co' ? 'CO (SiO₂ 식각 지표)' : 'SiF (Si 식각 지표)'}
                            </span>
                        )}
                    />

                    <ReferenceLine x={66} stroke="#ef4444" strokeDasharray="4 4"
                        label={{ value: 'Endpoint', fill: '#ef4444', fontSize: FONT.min, position: 'insideTopRight', offset: 10 }} />

                    <Line type="monotone" dataKey="co" name="co" stroke="#3b82f6" strokeWidth={2}
                        dot={false} activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="sif" name="sif" stroke="#f59e0b" strokeWidth={2}
                        dot={false} activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
