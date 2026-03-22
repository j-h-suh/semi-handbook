'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 생성 ─── */
const data: { x: number; mse: number; asym: number }[] = [];
for (let x = -3; x <= 3; x += 0.1) {
    const mse = x * x;
    const asym = x < 0 ? 2 * x * x : 0.5 * x * x;
    data.push({ x: Math.round(x * 10) / 10, mse, asym });
}

export default function AsymmetricLossFunction() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                비대칭 손실 함수
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Asymmetric Loss — CD 오차 방향에 따라 비용이 다르다
            </p>

            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="x" type="number" domain={[-3, 3]}
                        ticks={[-3, -2, -1, 0, 1, 2, 3]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: 'CD 오차 (nm)', position: 'bottom', offset: 6, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        type="number" domain={[0, 20]}
                        ticks={[0, 5, 10, 15, 20]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '손실 (Loss)', angle: -90, position: 'insideLeft', offset: 4, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <Tooltip
                        isAnimationActive={false}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        content={({ payload }: any) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            return (
                                <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: '#22d3ee', marginBottom: 2 }}>
                                        CD 오차 = {d.x} nm
                                    </div>
                                    <div style={{ fontSize: FONT.small, color: '#888888' }}>MSE 손실 = {d.mse.toFixed(1)}</div>
                                    <div style={{ fontSize: FONT.small, color: '#ef4444' }}>비대칭 손실 = {d.asym.toFixed(1)}</div>
                                </div>
                            );
                        }}
                    />
                    <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                    {/* MSE */}
                    <Line dataKey="mse" stroke="#888888" strokeWidth={1.5} strokeDasharray="6 4" dot={false} name="대칭 손실 (MSE)" />
                    {/* Asymmetric */}
                    <Line dataKey="asym" stroke="#ef4444" strokeWidth={2} dot={false} name="비대칭 손실" />
                </LineChart>
            </ResponsiveContainer>

            {/* 범례 + 주석 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 0, borderTop: '2px dashed #888888' }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>대칭 손실 (MSE: x²)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 0, borderTop: '2px solid #ef4444' }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>비대칭 손실 (2x² / 0.5x²)</span>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: FONT.min, color: '#ef4444' }}>← CD 작음: 누설 전류 ↑ (더 치명적)</span>
                <span style={{ fontSize: FONT.min, color: '#3b82f6' }}>CD 큼: 스위칭 속도 ↓ →</span>
            </div>
        </div>
    );
}
