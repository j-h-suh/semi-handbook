'use client';

import React from 'react';
import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine,
} from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── Simulated delay data ─── */
interface DataPoint { node: number; gate: number; rc: number; }

// Gate delay decreases, RC delay increases as node shrinks
const nodes = [250, 180, 130, 90, 65, 45, 32, 22, 14, 10, 7, 5, 3];
const data: DataPoint[] = nodes.map(n => ({
    node: n,
    gate: 0.8 * (n / 250) ** 0.7,  // decreases
    rc: 0.15 + 0.85 * (250 / n) ** 0.5 * 0.3,  // increases
}));

// Normalize to percentages relative to 250nm
const maxGate = data[0].gate;
const maxRC = data[data.length - 1].rc;
const normalizedData = data.map(d => ({
    node: d.node,
    gate: Math.round((d.gate / maxGate) * 100),
    rc: Math.round((d.rc / maxRC) * 100),
}));

// Find crossover node
const crossIdx = normalizedData.findIndex((d, i) => i > 0 && normalizedData[i].rc >= normalizedData[i].gate);
const crossNode = crossIdx >= 0 ? normalizedData[crossIdx].node : 90;

interface PayloadItem { name: string; value: number; color: string; }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: PayloadItem[]; label?: number }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: `1px solid ${COLOR.border}`, borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <p style={{ color: COLOR.textBright, fontWeight: 600, fontSize: FONT.cardHeader, margin: '0 0 6px' }}>
                {label}nm 노드
            </p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color, fontSize: FONT.small, margin: '2px 0', fontWeight: 500 }}>
                    {p.name === 'gate' ? 'Gate Delay' : 'RC Delay (배선)'}: <strong>{p.value}%</strong>
                </p>
            ))}
        </div>
    );
}

export default function RCDelayVsGateDelay() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                RC 지연 vs 게이트 지연 트렌드
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Gate Delay Decreases While Interconnect RC Delay Increases
            </p>

            <ResponsiveContainer width="100%" height={380}>
                <LineChart data={normalizedData} margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="node" type="number" reversed
                        ticks={[250, 180, 130, 90, 65, 45, 32, 22, 14, 7, 3]}
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }} tickLine={false}
                        axisLine={{ stroke: COLOR.border }}
                        label={{ value: '기술 노드 (nm) →', position: 'insideBottom', offset: -10, fill: COLOR.textDim, style: { fontSize: FONT.min } }}
                    />
                    <YAxis domain={[0, 110]}
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }} tickLine={false}
                        axisLine={{ stroke: COLOR.border }}
                        label={{ value: '상대 지연 (%)', angle: -90, position: 'insideLeft', fill: COLOR.textDim, style: { fontSize: FONT.min, textAnchor: 'middle' } }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend align="right" verticalAlign="top" wrapperStyle={{ fontSize: FONT.min, paddingBottom: 8 }}
                        formatter={(value: string) => (
                            <span style={{ color: COLOR.textMuted }}>{value === 'gate' ? 'Gate Delay (트랜지스터)' : 'RC Delay (배선)'}</span>
                        )}
                    />
                    <ReferenceLine x={crossNode} stroke="#f59e0b" strokeDasharray="4,4" strokeWidth={1}>
                    </ReferenceLine>
                    <Line type="monotone" dataKey="gate" name="gate" stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="rc" name="rc" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
            </ResponsiveContainer>
            <p style={{ textAlign: 'center', color: '#f59e0b', fontSize: FONT.min, marginTop: -8 }}>
                ▲ ~{crossNode}nm 이후 배선 RC 지연이 게이트 지연을 추월 — 배선이 성능 병목
            </p>
        </div>
    );
}
