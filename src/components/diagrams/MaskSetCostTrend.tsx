'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Cell } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { node: '28nm', cost: 2, masks: 40 },
    { node: '14nm', cost: 5, masks: 60 },
    { node: '7nm', cost: 10, masks: 80 },
    { node: '5nm', cost: 15, masks: 90 },
    { node: '3nm', cost: 20, masks: 100 },
];

const BAR_COLORS = ['#60a5fa', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc'];

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: '#c084fc', marginBottom: 2 }}>{d.node} 노드</div>
            <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>마스크 세트 비용: <b style={{ color: COLOR.textBright }}>${d.cost}M (~{(d.cost * 13).toLocaleString()}억 원)</b></div>
            <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>레이어 수: <b style={{ color: '#f59e0b' }}>{d.masks}장</b></div>
        </div>
    );
}

export default function MaskSetCostTrend() {
    return (
        <div className="my-8 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                공정 노드별 마스크 세트 비용
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Mask Set Cost by Technology Node
            </p>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <ComposedChart data={DATA} margin={{ top: 20, right: 40, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="node" tick={{ fill: COLOR.textDim, fontSize: FONT.min }} stroke="rgba(255,255,255,0.15)" />
                        <YAxis yAxisId="cost"
                            label={{ value: '비용 (백만 $)', angle: -90, position: 'insideLeft', offset: 0, fill: COLOR.textDim, fontSize: FONT.min }}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} stroke="rgba(255,255,255,0.15)"
                            domain={[0, 25]} />
                        <YAxis yAxisId="masks" orientation="right"
                            label={{ value: '레이어 수', angle: 90, position: 'insideRight', offset: 0, fill: '#f59e0b', fontSize: FONT.min }}
                            tick={{ fill: '#f59e0b', fontSize: FONT.min }} stroke="rgba(245,158,11,0.15)"
                            domain={[0, 120]} />
                        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                        <Bar yAxisId="cost" dataKey="cost" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                            {DATA.map((_, i) => (
                                <Cell key={i} fill={BAR_COLORS[i]} fillOpacity={0.7} />
                            ))}
                        </Bar>
                        <Line yAxisId="masks" type="monotone" dataKey="masks" stroke="#f59e0b" strokeWidth={2}
                            dot={{ fill: '#f59e0b', r: 4 }} isAnimationActive={false} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* 주석 */}
            <div style={{ textAlign: 'center', marginTop: 4 }}>
                <span style={{ color: COLOR.textDim, fontSize: FONT.min }}>
                    7nm부터 EUV 도입 · 3nm 마스크 세트 ~200억 원 이상
                </span>
            </div>
        </div>
    );
}
