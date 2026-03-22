'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 히스토그램 데이터 (Beta-like, left-skewed, peak ~0.85) ─── */
function generateHistogram() {
    const bins: { ri: number; count: number }[] = [];
    for (let i = 0; i < 20; i++) {
        const riCenter = (i + 0.5) / 20;
        // Beta-like distribution skewed left (peak ~0.85)
        const a = 8, b = 2;
        const beta = Math.pow(riCenter, a - 1) * Math.pow(1 - riCenter, b - 1);
        const count = Math.round(beta * 800 + Math.random() * 20);
        bins.push({ ri: Math.round(riCenter * 100) / 100, count });
    }
    return bins;
}
const histData = generateHistogram();

/* 영역 색상 결정 */
const getBarColor = (ri: number) => {
    if (ri < 0.5) return '#ef4444';     // 반드시 실측 (빨강)
    if (ri < 0.7) return '#f59e0b';     // 판단 필요 (노랑)
    return '#22c55e';                     // VM 신뢰 (초록)
};

export default function RIDistributionThreshold() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                RI 분포와 임계값 설정
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Reliance Index Distribution — Threshold-based Hybrid Strategy
            </p>

            <ResponsiveContainer width="100%" height={340}>
                <BarChart data={histData} margin={{ top: 10, right: 30, left: 10, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="ri"
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: 'Reliance Index (RI)', position: 'bottom', offset: 6, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '웨이퍼 수', angle: -90, position: 'insideLeft', offset: 4, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        content={({ payload }: any) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            const zone = d.ri < 0.5 ? '반드시 실측' : d.ri < 0.7 ? '판단 필요' : 'VM 신뢰';
                            return (
                                <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: getBarColor(d.ri), marginBottom: 2 }}>
                                        RI = {d.ri} · {zone}
                                    </div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>{d.count}개 웨이퍼</div>
                                </div>
                            );
                        }}
                    />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                        {histData.map((entry, i) => (
                            <Cell key={i} fill={getBarColor(entry.ri)} opacity={0.8} />
                        ))}
                    </Bar>
                    {/* 임계값선 */}
                    <ReferenceLine x={0.5} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5}
                        label={{ value: '공격적 (0.5)', position: 'insideTopRight', fill: '#ef4444', fontSize: FONT.min, offset: 6 }} />
                    <ReferenceLine x={0.7} stroke="#22c55e" strokeDasharray="4 3" strokeWidth={1.5}
                        label={{ value: '보수적 (0.7)', position: 'insideTopRight', fill: '#22c55e', fontSize: FONT.min, offset: 6 }} />
                </BarChart>
            </ResponsiveContainer>

            {/* 범례 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4, flexWrap: 'wrap' }}>
                {[
                    { color: '#ef4444', label: '반드시 실측 (RI < 0.5)' },
                    { color: '#f59e0b', label: '판단 필요 (0.5 ≤ RI < 0.7)' },
                    { color: '#22c55e', label: 'VM 신뢰 (RI ≥ 0.7)' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, opacity: 0.8 }} />
                        <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
