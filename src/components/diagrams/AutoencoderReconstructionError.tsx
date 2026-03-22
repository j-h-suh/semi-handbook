'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* Generate reconstruction error distributions */
function generateDist(mu: number, sigma: number, count: number, label: string) {
    const bins: Record<number, number> = {};
    const rng = (s: number) => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * s;
    };
    for (let i = 0; i < count; i++) {
        const val = mu + rng(sigma);
        const bin = Math.round(val * 10) / 10;
        bins[bin] = (bins[bin] || 0) + 1;
    }
    return bins;
}

/* Pre-computed smooth distributions */
function normalPDF(x: number, mu: number, sigma: number) {
    return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

const THRESHOLD = 0.15;
const POINTS = Array.from({ length: 61 }, (_, i) => {
    const x = +(i * 0.006).toFixed(3);
    return {
        x,
        normal: +(normalPDF(x, 0.05, 0.025) * 100).toFixed(2),
        abnormal: +(normalPDF(x, 0.22, 0.05) * 30).toFixed(2),
    };
});

export default function AutoencoderReconstructionError() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Autoencoder 복원 오차 분포
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                정상 데이터: 낮은 복원 오차 · 이상 데이터: 높은 복원 오차 → 임계값으로 분리
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={260} maxHeight={260}>
                    <AreaChart data={POINTS} margin={{ top: 24, right: 30, left: 10, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="x" type="number" domain={[0, 0.36]} ticks={[0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'Reconstruction Error', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis hide domain={[0, 'auto']} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small, color: COLOR.textMuted }}
                            formatter={((v: number | undefined, name: string | undefined) => {
                                const label = name === 'normal' ? '정상' : '이상';
                                return [`${(v ?? 0).toFixed(1)}`, label];
                            }) as never} />
                        <ReferenceLine x={THRESHOLD} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 3"
                            label={{ value: 'Threshold', fill: '#f59e0b', fontSize: FONT.min, position: 'top' }} />
                        <Area dataKey="normal" name="normal" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Area dataKey="abnormal" name="abnormal" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 3, background: '#3b82f6', borderRadius: 2 }} />
                    <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>정상 데이터</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 3, background: '#ef4444', borderRadius: 2 }} />
                    <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>이상 데이터</span>
                </div>
            </div>
        </div>
    );
}
