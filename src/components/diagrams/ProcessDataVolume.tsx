'use client';

import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    Cell,
    LabelList,
} from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const data = [
    { name: '산화', sub: 'Oxidation', sensor: 50, metrology: 5, total: 55 },
    { name: '증착', sub: 'Deposition', sensor: 120, metrology: 15, total: 135 },
    { name: '포토리소', sub: 'Litho', sensor: 200, metrology: 80, total: 280, highlight: true },
    { name: '식각', sub: 'Etching', sensor: 150, metrology: 20, total: 170 },
    { name: '이온주입', sub: 'Implant', sensor: 80, metrology: 10, total: 90 },
    { name: '어닐링', sub: 'Anneal', sensor: 40, metrology: 5, total: 45 },
    { name: 'CMP', sub: 'CMP', sensor: 100, metrology: 15, total: 115 },
    { name: '세정', sub: 'Clean', sensor: 60, metrology: 5, total: 65 },
];

interface PayloadItem {
    payload: typeof data[0];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: PayloadItem[] }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{
            background: COLOR.tooltipBg,
            backdropFilter: 'blur(8px)',
            border: `1px solid ${COLOR.border}`,
            borderRadius: 8,
            padding: '10px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
            <p style={{ color: d.highlight ? '#f97316' : COLOR.textBright, fontWeight: 600, fontSize: FONT.cardHeader, margin: '0 0 2px' }}>
                {d.name} <span style={{ color: COLOR.textDim, fontWeight: 400, fontSize: FONT.min }}>{d.sub}</span>
            </p>
            <div style={{ display: 'flex', gap: 16, margin: '6px 0' }}>
                <div>
                    <span style={{ color: '#3b82f6', fontSize: FONT.min }}>■</span>
                    <span style={{ color: COLOR.textMuted, fontSize: FONT.small, marginLeft: 4 }}>장비 센서</span>
                    <span style={{ color: COLOR.textBright, fontSize: FONT.small, fontWeight: 600, marginLeft: 6 }}>{d.sensor} GB</span>
                </div>
                <div>
                    <span style={{ color: '#f59e0b', fontSize: FONT.min }}>■</span>
                    <span style={{ color: COLOR.textMuted, fontSize: FONT.small, marginLeft: 4 }}>계측</span>
                    <span style={{ color: COLOR.textBright, fontSize: FONT.small, fontWeight: 600, marginLeft: 6 }}>{d.metrology} GB</span>
                </div>
            </div>
            <p style={{ color: COLOR.textBright, fontSize: FONT.body, fontWeight: 700, margin: '4px 0 0', borderTop: `1px solid ${COLOR.border}`, paddingTop: 4 }}>
                합계: {d.total} GB/day
            </p>
            {d.highlight && (
                <p style={{ color: '#f97316', fontSize: FONT.min, margin: '4px 0 0', fontWeight: 600 }}>
                    ⭐ 최대 데이터 생성 공정
                </p>
            )}
        </div>
    );
}

function CustomTick({ x, y, payload }: { x: number; y: number; payload: { value: string } }) {
    const item = data.find(d => d.name === payload.value);
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={14} textAnchor="middle"
                fill={item?.highlight ? '#f97316' : COLOR.textMuted}
                style={{ fontSize: FONT.min, fontWeight: item?.highlight ? 700 : 400 }}>
                {payload.value}
            </text>
            <text x={0} y={0} dy={28} textAnchor="middle"
                fill={COLOR.textDim} style={{ fontSize: 10 }}>
                {item?.sub}
            </text>
        </g>
    );
}

export default function ProcessDataVolume() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                공정별 일일 데이터 생성량 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                300mm 팹 기준 추정 (GB/day)
            </p>

            <ResponsiveContainer width="100%" height={380}>
                <BarChart data={data} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                        dataKey="name"
                        tick={CustomTick as never}
                        tickLine={false}
                        axisLine={{ stroke: COLOR.border }}
                        interval={0}
                        height={50}
                    />
                    <YAxis
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }}
                        tickLine={false}
                        axisLine={{ stroke: COLOR.border }}
                        label={{
                            value: '일일 데이터량 (GB/day)',
                            angle: -90,
                            position: 'insideLeft',
                            fill: COLOR.textDim,
                            style: { fontSize: FONT.min, textAnchor: 'middle' },
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Legend
                        wrapperStyle={{ fontSize: FONT.min, color: COLOR.textMuted, paddingTop: 8 }}
                        formatter={(value: string) => <span style={{ color: COLOR.textMuted }}>{value}</span>}
                    />
                    <Bar dataKey="sensor" name="장비 센서 (Equipment Sensor)" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]}>
                        {data.map((entry, i) => (
                            <Cell key={i} fill={entry.highlight ? '#2563eb' : '#3b82f6'} fillOpacity={entry.highlight ? 0.9 : 0.7} />
                        ))}
                    </Bar>
                    <Bar dataKey="metrology" name="계측 (Metrology)" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                        {data.map((entry, i) => (
                            <Cell key={i} fill={entry.highlight ? '#d97706' : '#f59e0b'} fillOpacity={entry.highlight ? 0.9 : 0.7} />
                        ))}
                        <LabelList
                            dataKey="total"
                            position="top"
                            style={{ fill: COLOR.textMuted, fontSize: FONT.min, fontWeight: 600 }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
