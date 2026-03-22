'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 (03_06.json 스펙 기준) ─── */
const data = [
    { week: 1, r2: 0.94 }, { week: 2, r2: 0.93 }, { week: 3, r2: 0.92 },
    { week: 4, r2: 0.91 }, { week: 5, r2: 0.90 }, { week: 6, r2: 0.88 },
    { week: 7, r2: 0.85 }, { week: 8, r2: 0.82 }, { week: 9, r2: 0.78 },
    { week: 10, r2: 0.93 }, { week: 11, r2: 0.92 }, { week: 12, r2: 0.91 },
    { week: 13, r2: 0.89 }, { week: 14, r2: 0.87 }, { week: 15, r2: 0.72 },
    { week: 16, r2: 0.92 }, { week: 17, r2: 0.91 }, { week: 18, r2: 0.90 },
    { week: 19, r2: 0.89 }, { week: 20, r2: 0.88 },
];

/* PM·재학습 이벤트 */
const events = [
    { week: 7, r2: 0.85, type: 'PM', label: '장비 PM' },
    { week: 10, r2: 0.93, type: 'retrain', label: '재학습 ①' },
    { week: 15, r2: 0.72, type: 'PM', label: '챔버 세정' },
    { week: 16, r2: 0.92, type: 'retrain', label: '재학습 ②' },
];

export default function VMModelDegradation() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                VM 모델 열화와 재학습
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Model Degradation — R² Trend over Time with PM / Retrain Events
            </p>

            <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="week" type="number" domain={[0, 21]}
                        ticks={[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '시간 (주)', position: 'bottom', offset: 6, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        dataKey="r2" type="number" domain={[0.65, 1.0]}
                        ticks={[0.7, 0.8, 0.9, 1.0]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: 'R²', angle: -90, position: 'insideLeft', offset: 4, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        content={({ payload }: any) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            const event = events.find(e => e.week === d.week);
                            return (
                                <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: '#22d3ee', marginBottom: 2 }}>
                                        Week {d.week}
                                    </div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>R² = {d.r2}</div>
                                    {event && (
                                        <div style={{ fontSize: FONT.small, color: event.type === 'PM' ? '#f59e0b' : '#22c55e', marginTop: 2 }}>
                                            {event.label}
                                        </div>
                                    )}
                                    {d.r2 < 0.80 && (
                                        <div style={{ fontSize: FONT.small, color: '#ef4444', marginTop: 2 }}>⚠ 최소 허용 R² 미달</div>
                                    )}
                                </div>
                            );
                        }}
                    />
                    {/* 최소 허용선 */}
                    <ReferenceLine y={0.80} stroke="#ef4444" strokeDasharray="6 4" strokeWidth={1.5}
                        label={{ value: '최소 허용 R² = 0.80', position: 'insideTopLeft', fill: '#ef4444', fontSize: FONT.min }} />
                    {/* R² 추이선 */}
                    <Scatter data={data} fill="#3b82f6" line={{ stroke: '#3b82f6', strokeWidth: 2 }}
                        shape={(props: { cx?: number; cy?: number }) => (
                            <circle cx={props.cx} cy={props.cy} r={4} fill="#3b82f6" opacity={0.9} />
                        )} />
                    {/* PM 이벤트 오버레이 */}
                    <Scatter data={events.filter(e => e.type === 'PM')} fill="#f59e0b"
                        shape={(props: { cx?: number; cy?: number }) => (
                            <circle cx={props.cx} cy={props.cy} r={7} fill="#f59e0b" opacity={0.9} />
                        )} />
                    {/* 재학습 이벤트 오버레이 */}
                    <Scatter data={events.filter(e => e.type === 'retrain')} fill="#22c55e"
                        shape={(props: { cx?: number; cy?: number }) => (
                            <circle cx={props.cx} cy={props.cy} r={7} fill="#22c55e" opacity={0.9} />
                        )} />
                </ScatterChart>
            </ResponsiveContainer>

            {/* 범례 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>R² 추이</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>PM 이벤트</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>모델 재학습</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 0, borderTop: '2px dashed #ef4444' }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>최소 허용 R²</span>
                </div>
            </div>
        </div>
    );
}
