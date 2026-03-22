'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { n: 0, scratch: 0, finetune: 0.60, fewshot: 0.70, zeroshot: 0.55 },
    { n: 10, scratch: 0.35, finetune: 0.72, fewshot: 0.78, zeroshot: 0.55 },
    { n: 50, scratch: 0.55, finetune: 0.82, fewshot: 0.84, zeroshot: 0.55 },
    { n: 100, scratch: 0.65, finetune: 0.86, fewshot: 0.87, zeroshot: 0.55 },
    { n: 200, scratch: 0.73, finetune: 0.88, fewshot: 0.88, zeroshot: 0.55 },
    { n: 500, scratch: 0.82, finetune: 0.90, fewshot: 0.89, zeroshot: 0.55 },
    { n: 1000, scratch: 0.87, finetune: 0.91, fewshot: 0.90, zeroshot: 0.55 },
    { n: 2000, scratch: 0.90, finetune: 0.91, fewshot: 0.90, zeroshot: 0.55 },
];

export default function FewShotDataVsPerformance() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                데이터 양 vs 모델 성능 — 전이 학습의 효과
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                소량 데이터에서 전이 학습이 처음부터(scratch) 학습보다 압도적 우위
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={280} maxHeight={280}>
                    <LineChart data={DATA} margin={{ top: 8, right: 30, left: 10, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="n" type="number" domain={[0, 2000]} ticks={[0, 100, 500, 1000, 2000]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: '웨이퍼 수', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis domain={[0, 1.0]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'R²', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <ReferenceLine y={0.85} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 3" />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small }}
                            labelStyle={{ color: COLOR.textBright }}
                            itemStyle={{ color: COLOR.textBright }}
                            labelFormatter={(l) => `${l} wafers`}
                            formatter={(v?: number, name?: string) => [`${(v ?? 0).toFixed(2)}`, name ?? '']} />
                        <Legend wrapperStyle={{ fontSize: FONT.min, color: COLOR.textMuted }} />
                        <Line type="monotone" dataKey="scratch" name="처음부터 학습" stroke="#6b7280" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="finetune" name="Fine-Tuning" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="fewshot" name="Few-Shot (MAML)" stroke="#22c55e" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="zeroshot" name="Zero-Shot (물리)" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
