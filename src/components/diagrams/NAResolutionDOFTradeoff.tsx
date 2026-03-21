'use client';

import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, Scatter, XAxis, YAxis, Tooltip, Legend, ReferenceDot } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── ArF 이론 곡선 (λ=193nm, k₁=0.3, k₂=0.5) ─── */
const LAMBDA = 193;
const K1 = 0.3;
const K2 = 0.5;

const CURVE_DATA: { na: number; r: number; dof: number }[] = [];
for (let na = 0.5; na <= 1.4; na += 0.01) {
    CURVE_DATA.push({
        na: Math.round(na * 100) / 100,
        r: Math.round(K1 * LAMBDA / na * 10) / 10,
        dof: Math.round(K2 * LAMBDA / (na * na) * 10) / 10,
    });
}

/* ─── 주요 노드 마커 ─── */
const MARKERS = [
    { na: 0.75, label: 'ArF dry' },
    { na: 0.93, label: 'ArF dry max' },
    { na: 1.20, label: 'ArF-i' },
    { na: 1.35, label: 'ArF-i max' },
].map(m => ({
    ...m,
    r: Math.round(K1 * LAMBDA / m.na * 10) / 10,
    dof: Math.round(K2 * LAMBDA / (m.na * m.na) * 10) / 10,
}));

/* ─── EUV 참조 포인트 (λ=13.5nm) ─── */
const EUV_LAMBDA = 13.5;
const EUV_MARKERS = [
    { na: 0.33, label: 'EUV' },
    { na: 0.55, label: 'High-NA EUV' },
].map(m => ({
    ...m,
    r: Math.round(K1 * EUV_LAMBDA / m.na * 10) / 10,
    dof: Math.round(K2 * EUV_LAMBDA / (m.na * m.na) * 10) / 10,
}));

export default function NAResolutionDOFTradeoff() {
    return (
        <div className="mt-8 mb-2 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                NA vs 해상도 vs DOF 트레이드오프
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                ArF (λ=193nm) 이론 곡선 — NA↑ → R↓ but DOF↓↓
            </p>

            <div style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}>
                <ResponsiveContainer width="100%" height={340}>
                    <ComposedChart data={CURVE_DATA} margin={{ top: 20, right: 60, bottom: 20, left: 20 }}>
                        <XAxis
                            dataKey="na" type="number"
                            domain={[0.45, 1.45]}
                            ticks={[0.55, 0.75, 0.93, 1.20, 1.35]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }}
                            label={{ value: 'NA', position: 'insideBottom', offset: -14, fill: COLOR.textMuted, fontSize: FONT.min }}
                            stroke="rgba(255,255,255,0.1)"
                        />
                        <YAxis
                            yAxisId="r"
                            domain={[0, 130]}
                            ticks={[0, 25, 50, 75, 100, 125]}
                            tick={{ fill: '#3b82f6', fontSize: FONT.min }}
                            label={{ value: 'R (nm)', angle: -90, position: 'insideLeft', offset: 10, fill: '#3b82f6', fontSize: FONT.min }}
                            stroke="rgba(59,130,246,0.2)"
                        />
                        <YAxis
                            yAxisId="dof"
                            orientation="right"
                            domain={[0, 300]}
                            ticks={[0, 50, 100, 150, 200, 250]}
                            tick={{ fill: '#ef4444', fontSize: FONT.min }}
                            label={{ value: 'DOF (nm)', angle: 90, position: 'center', dx: 30, fill: '#ef4444', fontSize: FONT.min }}
                            stroke="rgba(239,68,68,0.2)"
                        />
                        <Tooltip
                            isAnimationActive={false}
                            cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                const r = payload.find(p => p.dataKey === 'r');
                                const dof = payload.find(p => p.dataKey === 'dof');
                                return (
                                    <div style={{
                                        background: 'rgba(24,24,27,0.97)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 8, padding: '8px 12px', fontSize: FONT.small,
                                    }}>
                                        <div style={{ color: COLOR.textBright, fontWeight: 600, marginBottom: 4 }}>NA = {label}</div>
                                        {r && <div style={{ color: '#3b82f6' }}>Resolution: {r.value} nm</div>}
                                        {dof && <div style={{ color: '#ef4444' }}>DOF: {dof.value} nm</div>}
                                    </div>
                                );
                            }}
                        />



                        {/* 이론 곡선 — Resolution (왼축) */}
                        <Line yAxisId="r" dataKey="r" name="R = k₁λ/NA" type="monotone"
                            stroke="#3b82f6" strokeWidth={2} dot={false} />
                        {/* 이론 곡선 — DOF (오른축) */}
                        <Line yAxisId="dof" dataKey="dof" name="DOF = k₂λ/NA²" type="monotone"
                            stroke="#ef4444" strokeWidth={2} dot={false} />

                        {/* ArF 노드 마커 — Resolution */}
                        <Scatter yAxisId="r" data={MARKERS} dataKey="r" name="ArF 노드 (R)"
                            fill="#3b82f6" shape="circle" legendType="none" />
                        {/* ArF 노드 마커 — DOF */}
                        <Scatter yAxisId="dof" data={MARKERS} dataKey="dof" name="ArF 노드 (DOF)"
                            fill="#ef4444" shape="circle" legendType="none" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
