'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* Generate normal distribution data */
function normalPDF(x: number, mu: number, sigma: number) {
    return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

const LSL = 18.0, USL = 22.0, TARGET = 20.0;
const SIGMA = 0.5;
const POINTS = Array.from({ length: 81 }, (_, i) => {
    const x = 17 + i * 0.075;
    return {
        x: +x.toFixed(2),
        a: +(normalPDF(x, 20.0, SIGMA) * 100).toFixed(2),
        b: +(normalPDF(x, 20.5, SIGMA) * 100).toFixed(2),
    };
});

export default function CpVsCpkVisualization() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Cp vs Cpk — 공정 능력 지수 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                공정 A(중심 맞춤, Cpk=1.33) vs 공정 B(치우침, Cpk=1.0)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={280} maxHeight={280}>
                    <AreaChart data={POINTS} margin={{ top: 24, right: 30, left: 10, bottom: 8 }}>
                        <XAxis dataKey="x" type="number" domain={[17, 23]} ticks={[17, 18, 19, 20, 21, 22, 23]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false}
                            label={{ value: 'CD (nm)', position: 'insideBottom', offset: -4, fill: COLOR.textMuted, fontSize: FONT.small }} />
                        <YAxis hide domain={[0, 90]} />
                        <Tooltip isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small, color: COLOR.textMuted }}
                            formatter={((v: number | undefined, name: string | undefined) => {
                                const label = name === 'a' ? '공정 A' : '공정 B';
                                return [`${(v ?? 0).toFixed(1)}`, label];
                            }) as never} />
                        <ReferenceLine x={LSL} stroke="#a855f7" strokeWidth={2} label={{ value: 'LSL', fill: '#a855f7', fontSize: FONT.min, position: 'top' }} />
                        <ReferenceLine x={USL} stroke="#a855f7" strokeWidth={2} label={{ value: 'USL', fill: '#a855f7', fontSize: FONT.min, position: 'top' }} />
                        <ReferenceLine x={TARGET} stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4 3" label={{ value: 'Target', fill: COLOR.textDim, fontSize: FONT.min, position: 'top' }} />
                        <Area dataKey="a" name="a" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Area dataKey="b" name="b" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 3, background: '#3b82f6', borderRadius: 2 }} />
                    <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>공정 A: Cp=Cpk=1.33</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 3, background: '#ef4444', borderRadius: 2, borderTop: '1px dashed #ef4444' }} />
                    <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>공정 B: Cp=1.33, Cpk=1.0</span>
                </div>
            </div>
        </div>
    );
}
