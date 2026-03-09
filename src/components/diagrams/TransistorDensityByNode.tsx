'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

type NodeKey = 'N7' | 'N5' | 'N3' | 'N2' | null;

const nodeData: { node: string; density: number; gatePitch: string; metalPitch: string; gain: string; color: string; key: Exclude<NodeKey, null> }[] = [
    { node: 'N7', density: 91, gatePitch: '~54nm', metalPitch: '~36nm', gain: '-', color: '#3b82f6', key: 'N7' },
    { node: 'N5', density: 173, gatePitch: '~48nm', metalPitch: '~28nm', gain: '×1.9', color: '#8b5cf6', key: 'N5' },
    { node: 'N3', density: 292, gatePitch: '~48nm', metalPitch: '~23nm', gain: '×1.7', color: '#f59e0b', key: 'N3' },
    { node: 'N2', density: 400, gatePitch: '~44nm', metalPitch: '~20nm', gain: '×1.4', color: '#ef4444', key: 'N2' },
];

export default function TransistorDensityByNode() {
    const [hovered, setHovered] = useState<NodeKey>(null);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                노드별 트랜지스터 밀도 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Transistor Density by Process Node (TSMC, MTr/mm²)
            </p>

            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={nodeData} margin={{ top: 24, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="node"
                        tick={{ fontSize: FONT.body, fill: COLOR.textMuted, fontWeight: 600 }}
                    />
                    <YAxis
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: 'MTr/mm²', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                        domain={[0, 500]}
                    />
                    <Tooltip
                        contentStyle={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, backdropFilter: 'blur(8px)', fontSize: FONT.small }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        content={({ payload }: any) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            return (
                                <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: d.color, marginBottom: 4 }}>TSMC {d.node}</div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>밀도: {d.density} MTr/mm²{d.gain !== '-' ? ` (${d.gain})` : ''}</div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>게이트 피치: {d.gatePitch}</div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>메탈 피치: {d.metalPitch}</div>
                                    {d.key === 'N2' && <div style={{ fontSize: FONT.min, color: COLOR.textDim, marginTop: 4 }}>* 예상 수치</div>}
                                </div>
                            );
                        }}
                    />
                    <Bar dataKey="density" radius={[4, 4, 0, 0]}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onMouseEnter={(d: any) => setHovered(d?.key)}
                        onMouseLeave={() => setHovered(null)}>
                        <LabelList dataKey="gain" position="top" style={{ fontSize: FONT.min, fill: '#f59e0b', fontWeight: 600 }} />
                        {nodeData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color}
                                opacity={hovered !== null && hovered !== entry.key ? 0.25 : 0.7} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
