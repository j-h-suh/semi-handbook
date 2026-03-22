'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 (03_08.json 스펙 기준, 로그 스케일) ─── */
const data = [
    { source: 'FDC Trace', volume: 30000, label: '~30 TB', color: '#ef4444' },
    { source: '결함 검사', volume: 3000, label: '~3 TB', color: '#f59e0b' },
    { source: '계측 데이터', volume: 50, label: '~50 GB', color: '#3b82f6' },
    { source: '공정 이력(MES)', volume: 5, label: '~5 GB', color: '#22c55e' },
    { source: '전기적 테스트', volume: 5, label: '~5 GB', color: '#a78bfa' },
];

const formatTick = (v: number) => {
    if (v >= 1000) return `${v / 1000} TB`;
    return `${v} GB`;
};

export default function FabDataVolumeBySource() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                팹 데이터 소스별 일일 생성량
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Daily Data Volume by Source — Log Scale (대형 팹 기준)
            </p>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical" margin={{ top: 10, right: 80, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis
                        type="number" scale="log" domain={[1, 100000]}
                        ticks={[1, 10, 100, 1000, 10000, 100000]}
                        tickFormatter={formatTick}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '일일 데이터 생성량 (GB, 로그 스케일)', position: 'bottom', offset: -4, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        dataKey="source" type="category" width={100}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                    />
                    <Tooltip
                        isAnimationActive={false}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        content={({ payload }: any) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            return (
                                <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: d.color, marginBottom: 2 }}>{d.source}</div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>{d.label} / 일</div>
                                </div>
                            );
                        }}
                    />
                    <Bar dataKey="volume" radius={[0, 4, 4, 0]}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        label={({ x, y, width, height, index }: any) => (
                            <text x={x + width + 6} y={y + height / 2 + 4} fill={COLOR.textMuted} fontSize={FONT.min}>
                                {data[index].label}
                            </text>
                        )}
                    >
                        {data.map((entry, i) => (
                            <Cell key={i} fill={entry.color} opacity={0.8} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <p style={{ textAlign: 'center', fontSize: FONT.min, color: COLOR.textDim, marginTop: 4 }}>
                합계: 일당 약 50~100 TB · 월간 PB급 · FDC Trace가 전체의 ~90% 이상
            </p>
        </div>
    );
}
