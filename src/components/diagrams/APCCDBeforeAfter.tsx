'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell, Legend } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* Simulated CD data: Before vs After APC */
const DATA = Array.from({ length: 25 }, (_, i) => {
    const base = 20;
    const drift = (i - 12) * 0.08;
    const noise = Math.sin(i * 1.7) * 0.3;
    const before = +(base + drift + noise).toFixed(2);
    const after = +(base + drift * 0.2 + noise * 0.3).toFixed(2);
    return { lot: i + 1, before, after };
});

export default function APCCDBeforeAfter() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                APC 보정 전/후 CD 분포 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                보정 전(Raw): Drift + 노이즈 · 보정 후(APC): 목표값 20nm 주변 안정화
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={260} maxHeight={260}>
                    <BarChart data={DATA} margin={{ top: 8, right: 30, left: 10, bottom: 8 }} barGap={0} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="lot" type="number" domain={[1, 25]} ticks={[1, 5, 10, 15, 20, 25]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: '로트 번호', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis domain={[19, 21]} ticks={[19, 19.5, 20, 20.5, 21]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'CD (nm)', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small, color: COLOR.textMuted }}
                            formatter={((v: number | undefined, name: string | undefined) => [`${(v ?? 0).toFixed(2)} nm`, name === 'before' ? '보정 전' : '보정 후']) as never}
                            labelFormatter={(l) => `Lot #${l}`} />
                        <ReferenceLine y={20} stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4 3"
                            label={{ value: 'Target 20nm', fill: COLOR.textDim, fontSize: FONT.min, position: 'right' }} />
                        <Bar dataKey="before" name="before" fill="#ef4444" fillOpacity={0.4} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                        <Bar dataKey="after" name="after" fill="#3b82f6" fillOpacity={0.6} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                        <Legend formatter={(v) => v === 'before' ? '보정 전 (Raw)' : '보정 후 (APC)'} wrapperStyle={{ fontSize: FONT.small, color: COLOR.textMuted }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
