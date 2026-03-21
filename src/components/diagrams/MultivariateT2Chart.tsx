'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, ReferenceArea } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const RAW_DATA = [
    2.1, 3.5, 1.8, 4.2, 2.9, 3.1, 2.4, 5.0, 3.3, 2.7,
    4.1, 3.8, 2.2, 3.6, 4.5, 2.8, 3.0, 12.5, 15.3, 8.7,
    3.2, 2.5, 4.0, 3.7, 2.6, 3.4, 2.0, 3.9, 4.3, 2.3,
];

const UCL = 9.49;
const DATA = RAW_DATA.map((v, i) => ({ wafer: i + 1, t2: v, ooc: v > UCL }));

export default function MultivariateT2Chart() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                다변량 SPC — PCA 기반 T² 관리도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                개별 변수는 정상이나 변수 조합이 비정상 → 단변량 SPC가 놓치는 이상을 T²가 탐지
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={280} maxHeight={280}>
                    <LineChart data={DATA} margin={{ top: 8, right: 30, left: 10, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <ReferenceArea x1={17} x2={20} fill="rgba(239,68,68,0.08)" label={{ value: 'OOC 구간', fill: COLOR.textDim, fontSize: FONT.min, position: 'insideTop' }} />
                        <XAxis dataKey="wafer" type="number" domain={[1, 30]} ticks={[1, 5, 10, 15, 20, 25, 30]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: '웨이퍼 번호', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis domain={[0, 18]} ticks={[0, 5, 10, 15]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'T² 통계량', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small, color: COLOR.textMuted }}
                            formatter={((v: number | undefined) => [`${(v ?? 0).toFixed(1)}`, 'T²']) as never}
                            labelFormatter={(l) => `Wafer #${l}`} />
                        <ReferenceLine y={UCL} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6 3"
                            label={{ value: `UCL = ${UCL}`, fill: '#ef4444', fontSize: FONT.min, position: 'right' }} />
                        <Line dataKey="t2" stroke="#3b82f6" strokeWidth={1.5} dot={((props: Record<string, unknown>) => {
                            const cx = props.cx as number ?? 0;
                            const cy = props.cy as number ?? 0;
                            const payload = props.payload as { ooc: boolean };
                            return <circle cx={cx} cy={cy} r={payload.ooc ? 4 : 2.5} fill={payload.ooc ? '#ef4444' : '#3b82f6'} opacity={payload.ooc ? 1 : 0.6} />;
                        }) as never} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
