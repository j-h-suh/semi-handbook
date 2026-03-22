'use client';

import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 생성 (R²≈0.92 시뮬레이션) ─── */
function generateData(seed: number) {
    const data: { actual: number; predicted: number }[] = [];
    let s = seed;
    const next = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 200; i++) {
        const actual = 18.5 + next() * 3.0;
        const noise = (next() - 0.5) * 0.5;
        const predicted = 0.96 * actual + 0.8 + noise;
        data.push({ actual: Math.round(actual * 100) / 100, predicted: Math.round(predicted * 100) / 100 });
    }
    return data;
}
const data = generateData(42);

export default function VMPredictedVsActual() {
    const [activePoint, setActivePoint] = useState<string | null>(null);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                VM 예측값 vs 실측값
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Predicted CD vs. Actual CD — R² = 0.92
            </p>

            <ResponsiveContainer width="100%" height={360}>
                <ScatterChart margin={{ top: 10, right: 30, left: 20, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="actual" type="number" domain={[18, 22]}
                        ticks={[18, 19, 20, 21, 22]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '실측 CD (nm)', position: 'bottom', offset: 6, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        dataKey="predicted" type="number" domain={[18, 22]}
                        ticks={[18, 19, 20, 21, 22]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: 'VM 예측 CD (nm)', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        content={({ payload }: any) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            return (
                                <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>실측: {d.actual} nm</div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>예측: {d.predicted} nm</div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textDim }}>오차: {Math.abs(d.actual - d.predicted).toFixed(2)} nm</div>
                                </div>
                            );
                        }}
                    />
                    {/* y=x 이상선 */}
                    <ReferenceLine segment={[{ x: 18, y: 18 }, { x: 22, y: 22 }]}
                        stroke="rgba(255,255,255,0.2)" strokeDasharray="6 4" strokeWidth={1} />
                    {/* 데이터 포인트 */}
                    <Scatter
                        data={data} fill="#3b82f6"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onMouseEnter={(d: any) => setActivePoint(`${d?.actual}-${d?.predicted}`)}
                        onMouseLeave={() => setActivePoint(null)}
                    >
                        {data.map((entry, i) => (
                            <circle key={i} r={activePoint === `${entry.actual}-${entry.predicted}` ? 5 : 3}
                                fill="#3b82f6" opacity={0.6} />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>

            {/* 메트릭 + 범례 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 20, height: 0, borderTop: '2px dashed rgba(255,255,255,0.3)' }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>y = x (이상선)</span>
                </div>
                <span style={{ fontSize: FONT.min, color: '#22c55e', fontWeight: 600 }}>R² = 0.92</span>
                <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>MAE = 0.18 nm</span>
                <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>RMSE = 0.24 nm</span>
            </div>
        </div>
    );
}
