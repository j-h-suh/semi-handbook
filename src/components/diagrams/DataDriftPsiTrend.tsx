'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 생성 (04_05.json 스펙) ─── */
function genData() {
    const d: { day: number; peb: number; rf: number; dose: number }[] = [];
    for (let i = 1; i <= 60; i++) {
        let peb: number, rf: number, dose: number;
        if (i <= 30) {
            peb = 0.03 + Math.random() * 0.05;
            dose = 0.04 + Math.random() * 0.03;
        } else if (i <= 44) {
            peb = 0.12 + Math.random() * 0.03;
            dose = 0.08 + Math.random() * 0.04;
        } else {
            peb = 0.25 + Math.random() * 0.10;
            dose = 0.05 + Math.random() * 0.03;
        }
        rf = 0.02 + Math.random() * (i > 45 ? 0.06 : 0.04);
        d.push({ day: i, peb: +peb.toFixed(3), rf: +rf.toFixed(3), dose: +dose.toFixed(3) });
    }
    return d;
}
const DATA = genData();

export default function DataDriftPsiTrend() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Data Drift 모니터링 — PSI 추이
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Population Stability Index — PSI {'>'} 0.2 시 재학습 트리거
            </p>

            <ResponsiveContainer width="100%" height={340}>
                <LineChart data={DATA} margin={{ top: 30, right: 80, left: 10, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="day" type="number" domain={[1, 60]} ticks={[1, 10, 20, 30, 40, 50, 60]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '배포 후 경과일', position: 'bottom', offset: 6, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        domain={[0, 0.4]} ticks={[0, 0.1, 0.2, 0.3, 0.4]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: 'PSI', angle: -90, position: 'insideLeft', offset: 4, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
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
                                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: '#22d3ee', marginBottom: 4 }}>Day {d.day}</div>
                                    <div style={{ fontSize: FONT.small, color: '#ef4444' }}>PEB 온도 PSI = {d.peb}</div>
                                    <div style={{ fontSize: FONT.small, color: '#3b82f6' }}>RF Power PSI = {d.rf}</div>
                                    <div style={{ fontSize: FONT.small, color: '#22c55e' }}>Dose PSI = {d.dose}</div>
                                </div>
                            );
                        }}
                    />
                    {/* 임계선 */}
                    <ReferenceLine y={0.1} stroke="#f59e0b" strokeDasharray="6 4" label={{ value: '주의', position: 'right', fill: '#f59e0b', fontSize: FONT.min }} />
                    <ReferenceLine y={0.2} stroke="#ef4444" strokeDasharray="4 2" label={{ value: '재학습 트리거', position: 'right', fill: '#ef4444', fontSize: FONT.min }} />
                    {/* 이벤트 마커 */}
                    <ReferenceLine x={31} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'PM', position: 'top', fill: '#f59e0b', fontSize: FONT.min }} />
                    <ReferenceLine x={45} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '레지스트 변경', position: 'top', fill: '#ef4444', fontSize: FONT.min }} />
                    <ReferenceArea x1={45} x2={60} fill="#ef4444" fillOpacity={0.04} />
                    {/* 시리즈 */}
                    <Line dataKey="peb" stroke="#ef4444" strokeWidth={1.5} dot={false} name="PEB 온도" />
                    <Line dataKey="rf" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="RF Power" />
                    <Line dataKey="dose" stroke="#22c55e" strokeWidth={1.5} dot={false} name="Dose" />
                </LineChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4, flexWrap: 'wrap' }}>
                {[{ c: '#ef4444', n: 'PEB 온도' }, { c: '#3b82f6', n: 'RF Power' }, { c: '#22c55e', n: 'Dose' }].map(s => (
                    <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 14, height: 0, borderTop: `2px solid ${s.c}` }} />
                        <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>{s.n}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
