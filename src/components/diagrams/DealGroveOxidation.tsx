'use client';

import React from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ReferenceLine,
} from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* Deal-Grove model data: x² + Ax = B(t + τ) */
const wetData = [
    { time: 0, thickness: 0 },
    { time: 10, thickness: 50 },
    { time: 30, thickness: 120 },
    { time: 60, thickness: 200 },
    { time: 120, thickness: 320 },
    { time: 240, thickness: 480 },
    { time: 480, thickness: 700 },
];

const dryData = [
    { time: 0, thickness: 0 },
    { time: 10, thickness: 8 },
    { time: 30, thickness: 20 },
    { time: 60, thickness: 35 },
    { time: 120, thickness: 55 },
    { time: 240, thickness: 85 },
    { time: 480, thickness: 130 },
];

/* Merge into single dataset for Recharts */
const data = wetData.map((w, i) => ({
    time: w.time,
    wet: w.thickness,
    dry: dryData[i].thickness,
}));

interface PayloadItem {
    name: string;
    value: number;
    color: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: PayloadItem[]; label?: number }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: COLOR.tooltipBg,
            backdropFilter: 'blur(8px)',
            border: `1px solid ${COLOR.border}`,
            borderRadius: 8,
            padding: '10px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
            <p style={{ color: COLOR.textBright, fontWeight: 600, fontSize: FONT.cardHeader, margin: '0 0 6px' }}>
                산화 시간: {label}분
            </p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color, fontSize: FONT.small, margin: '2px 0', fontWeight: 500 }}>
                    {p.name === 'wet' ? '습식 (Wet)' : '건식 (Dry)'}: <strong>{p.value} nm</strong>
                </p>
            ))}
            {label !== undefined && label <= 30 && (
                <p style={{ color: COLOR.textDim, fontSize: FONT.min, margin: '6px 0 0', borderTop: `1px solid ${COLOR.border}`, paddingTop: 4 }}>
                    📐 선형 영역 (반응률 제한)
                </p>
            )}
            {label !== undefined && label > 120 && (
                <p style={{ color: COLOR.textDim, fontSize: FONT.min, margin: '6px 0 0', borderTop: `1px solid ${COLOR.border}`, paddingTop: 4 }}>
                    📈 포물선 영역 (확산 제한)
                </p>
            )}
        </div>
    );
}

export default function DealGroveOxidation() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Deal-Grove 모델: 산화막 성장 곡선
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                x² + Ax = B(t + τ)  —  1,000°C 기준
            </p>

            <ResponsiveContainer width="100%" height={380}>
                <LineChart data={data} margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="time"
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }}
                        tickLine={false}
                        axisLine={{ stroke: COLOR.border }}
                        label={{
                            value: '산화 시간 (min)',
                            position: 'insideBottom',
                            offset: -10,
                            fill: COLOR.textDim,
                            style: { fontSize: FONT.min },
                        }}
                    />
                    <YAxis
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }}
                        tickLine={false}
                        axisLine={{ stroke: COLOR.border }}
                        label={{
                            value: '산화막 두께 (nm)',
                            angle: -90,
                            position: 'insideLeft',
                            fill: COLOR.textDim,
                            style: { fontSize: FONT.min, textAnchor: 'middle' },
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        align="right"
                        verticalAlign="top"
                        wrapperStyle={{ fontSize: FONT.min, paddingBottom: 8 }}
                        formatter={(value: string) => (
                            <span style={{ color: COLOR.textMuted }}>
                                {value === 'wet' ? '습식 산화 (Wet, 1000°C)' : '건식 산화 (Dry, 1000°C)'}
                            </span>
                        )}
                    />

                    {/* Region annotations */}
                    <ReferenceLine x={60} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4"
                        label={{ value: '선형 → 포물선', fill: COLOR.textDim, fontSize: FONT.min, position: 'insideTopLeft', offset: 10 }} />

                    <Line type="monotone" dataKey="wet" name="wet"
                        stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="dry" name="dry"
                        stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }}
                        activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
