'use client';

import React from 'react';
import { FONT, COLOR } from './diagramTokens';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts';

const DATA = [
    { temp: 108.0, cd: 23.0 },
    { temp: 108.5, cd: 22.5 },
    { temp: 109.0, cd: 22.0 },
    { temp: 109.5, cd: 21.2 },
    { temp: 110.0, cd: 20.5 },
    { temp: 110.5, cd: 19.8 },
    { temp: 111.0, cd: 19.0 },
    { temp: 111.5, cd: 18.5 },
    { temp: 112.0, cd: 18.0 },
];

export default function PEBTempVsCD() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                PEB 온도 vs CD 변화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Post-Exposure Bake Temperature — Critical Dimension Relationship
            </p>

            <div style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={DATA} margin={{ top: 20, right: 40, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

                        <XAxis
                            dataKey="temp"
                            type="number"
                            domain={[108, 112]}
                            ticks={[108, 109, 110, 111, 112]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }}
                            label={{ value: 'PEB 온도 (°C)', position: 'insideBottom', offset: -8, fill: COLOR.textMuted, fontSize: FONT.body }}
                            stroke="rgba(255,255,255,0.15)"
                        />
                        <YAxis
                            domain={[17, 24]}
                            ticks={[18, 19, 20, 21, 22, 23]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }}
                            label={{ value: 'CD (nm)', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.body }}
                            stroke="rgba(255,255,255,0.15)"
                        />

                        {/* CD 규격 밴드 */}
                        <ReferenceArea y1={19} y2={21} fill="rgba(59,130,246,0.08)" stroke="none" />

                        {/* 목표 CD */}
                        <ReferenceLine y={20} stroke="rgba(59,130,246,0.4)" strokeDasharray="6 3"
                            label={{ value: '목표 CD: 20nm', position: 'right', fill: 'rgba(59,130,246,0.7)', fontSize: FONT.min }} />

                        {/* 규격 상한/하한 */}
                        <ReferenceLine y={21} stroke="rgba(59,130,246,0.2)" strokeDasharray="3 3" />
                        <ReferenceLine y={19} stroke="rgba(59,130,246,0.2)" strokeDasharray="3 3" />

                        <Tooltip
                            contentStyle={{
                                background: COLOR.tooltipBg,
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                backdropFilter: 'blur(8px)',
                                fontSize: FONT.small,
                                color: COLOR.textMuted,
                            }}
                            formatter={(value: any) => [`${value} nm`, 'CD']}
                            labelFormatter={(label: any) => `PEB: ${label}°C`}
                        />

                        <Line
                            type="monotone"
                            dataKey="cd"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ fill: '#ef4444', r: 3, strokeWidth: 0 }}
                            activeDot={{ fill: '#ef4444', r: 5, strokeWidth: 2, stroke: '#fff' }}
                        />
                    </LineChart>
                </ResponsiveContainer>

                {/* 어노테이션 */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4 }}>
                    <span style={{ fontSize: FONT.min, color: '#ef4444', fontWeight: 600 }}>기울기: ~1-2 nm/°C</span>
                    <span style={{ fontSize: FONT.min, color: 'rgba(59,130,246,0.7)' }}>■ CD 규격 ±1nm</span>
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>±0.1°C 제어 필요</span>
                </div>
            </div>
        </div>
    );
}
