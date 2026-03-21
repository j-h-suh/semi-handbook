'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { month: 0, yield: 30 }, { month: 1, yield: 35 }, { month: 2, yield: 40 },
    { month: 3, yield: 48 }, { month: 4, yield: 55 }, { month: 5, yield: 62 },
    { month: 6, yield: 68 }, { month: 7, yield: 73 }, { month: 8, yield: 77 },
    { month: 9, yield: 80 }, { month: 10, yield: 83 }, { month: 11, yield: 85 },
    { month: 12, yield: 87 }, { month: 14, yield: 89 }, { month: 16, yield: 91 },
    { month: 18, yield: 92 }, { month: 20, yield: 93 }, { month: 22, yield: 94 },
    { month: 24, yield: 94.5 },
];

const PHASES = [
    { name: '초기', x1: 0, x2: 3, fill: 'rgba(239,68,68,0.06)' },
    { name: '램프업', x1: 3, x2: 12, fill: 'rgba(34,197,94,0.08)' },
    { name: '성숙', x1: 12, x2: 20, fill: 'rgba(59,130,246,0.05)' },
    { name: '한계', x1: 20, x2: 24, fill: 'rgba(245,158,11,0.05)' },
];

export default function YieldRampupSCurve() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                수율 램프업 S-커브
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                새 공정 노드의 수율 개선 궤적 — 램프업 구간에서 AI 가치 극대화
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={300} maxHeight={300}>
                    <LineChart data={DATA} margin={{ top: 8, right: 30, left: 10, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        {PHASES.map(p => (
                            <ReferenceArea key={p.name} x1={p.x1} x2={p.x2} fill={p.fill} label={{ value: p.name, fill: COLOR.textDim, fontSize: FONT.min, position: 'insideTop' }} />
                        ))}
                        <XAxis dataKey="month" type="number" domain={[0, 24]} ticks={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: '시간 (개월)', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'Die Yield (%)', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small, color: COLOR.textMuted }}
                            formatter={(v: number | undefined) => [`${v ?? 0}%`, 'Yield']} labelFormatter={(l) => `${l}개월`} />
                        <ReferenceLine y={90} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 3" label={{ value: '목표 90%', fill: COLOR.textDim, fontSize: FONT.min, position: 'right' }} />
                        <Line dataKey="yield" stroke="#22c55e" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
