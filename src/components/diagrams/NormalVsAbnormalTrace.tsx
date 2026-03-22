'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer, Legend } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* Generate fake trace data: normal vs abnormal RF Power */
const NORMAL: { t: number; normal: number; abnormal: number | null }[] = [];
const ABNORMAL: { t: number; normal: number; abnormal: number | null }[] = [];

for (let i = 0; i <= 70; i += 1) {
    let nv: number, av: number;
    if (i < 10) { nv = 0; av = 0; }
    else if (i < 15) { nv = (i - 10) * 100; av = (i - 10) * 100; }
    else if (i < 55) {
        nv = 500 + (Math.sin(i * 0.3) * 3);
        /* Abnormal: dip at t=30-35, spike at t=45 */
        if (i >= 30 && i <= 35) av = 480 - (i - 32) * (i - 32) * 0.5 + (Math.sin(i * 0.5) * 2);
        else if (i >= 44 && i <= 46) av = 530 + (Math.sin(i) * 5);
        else av = 500 + (Math.sin(i * 0.3) * 3);
    }
    else if (i < 60) { nv = 500 - (i - 55) * 100; av = 500 - (i - 55) * 100; }
    else { nv = 0; av = 0; }
    NORMAL.push({ t: i, normal: +nv.toFixed(1), abnormal: null });
    ABNORMAL.push({ t: i, normal: null as unknown as number, abnormal: +av.toFixed(1) });
}

const DATA = NORMAL.map((n, i) => ({ t: n.t, normal: n.normal, abnormal: ABNORMAL[i].abnormal }));

export default function NormalVsAbnormalTrace() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                정상 vs 이상 Trace 비교 — RF Power
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                정상 Trace(파란색)와 이상 Trace(빨간색) — 순간적 Dip/Spike를 Summary는 놓침
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={260} maxHeight={260}>
                    <LineChart data={DATA} margin={{ top: 8, right: 30, left: 10, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <ReferenceArea x1={10} x2={15} fill="rgba(255,255,255,0.03)" label={{ value: '안정화', fill: COLOR.textDim, fontSize: FONT.min, position: 'insideTop' }} />
                        <ReferenceArea x1={15} x2={55} fill="rgba(59,130,246,0.03)" label={{ value: '메인 식각', fill: COLOR.textDim, fontSize: FONT.min, position: 'insideTop' }} />
                        <ReferenceArea x1={55} x2={60} fill="rgba(255,255,255,0.03)" label={{ value: '퍼지', fill: COLOR.textDim, fontSize: FONT.min, position: 'insideTop' }} />
                        <ReferenceArea x1={28} x2={37} fill="rgba(239,68,68,0.06)" />
                        <XAxis dataKey="t" type="number" domain={[0, 70]} ticks={[0, 10, 20, 30, 40, 50, 60, 70]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: '시간 (s)', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis domain={[0, 560]} ticks={[0, 100, 200, 300, 400, 500]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'RF Power (W)', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small, color: COLOR.textMuted }}
                            formatter={((v: number | undefined, name: string | undefined) => [v != null ? `${v}W` : '-', name === 'normal' ? '정상' : '이상']) as never}
                            labelFormatter={(l) => `t = ${l}s`} />
                        <Line dataKey="normal" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={false} />
                        <Line dataKey="abnormal" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} connectNulls={false} />
                        <Legend formatter={(v) => v === 'normal' ? '정상 Trace' : '이상 Trace'} wrapperStyle={{ fontSize: FONT.small, color: COLOR.textMuted }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
