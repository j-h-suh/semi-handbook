'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ReferenceLine, ReferenceArea } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 생성 (포물선) ─── */
function makeParabola(peakCd: number, bestFocus: number, curvature: number, inverted: boolean, range: [number, number], step: number) {
    const data = [];
    for (let f = range[0]; f <= range[1]; f += step) {
        const df = f - bestFocus;
        const cd = inverted
            ? peakCd - curvature * df * df
            : peakCd + curvature * df * df;
        data.push({ focus: f, cd: Math.round(cd * 100) / 100 });
    }
    return data;
}

const DENSE_LOW = makeParabola(22, 0, 0.0004, true, [-100, 100], 5);
const DENSE_OPT = makeParabola(20, 0, 0.0003, true, [-100, 100], 5);
const DENSE_HIGH = makeParabola(18, 0, 0.0004, true, [-100, 100], 5);
const ISO_OPT = makeParabola(19, 5, 0.0003, false, [-100, 100], 5);

/* 데이터 합치기 — 같은 focus key */
const CHART_DATA = DENSE_LOW.map((d, i) => ({
    focus: d.focus,
    dense_low: d.cd,
    dense_opt: DENSE_OPT[i].cd,
    dense_high: DENSE_HIGH[i].cd,
    iso_opt: ISO_OPT[i].cd,
}));

export default function BossungCurve() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Bossung 곡선
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Focus vs CD — Dense (역U자) vs Isolated (U자)
            </p>

            <div style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}>
                <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={CHART_DATA} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                        <XAxis
                            dataKey="focus" type="number"
                            domain={[-100, 100]}
                            ticks={[-100, -75, -50, -25, 0, 25, 50, 75, 100]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }}
                            label={{ value: 'Focus (nm)', position: 'insideBottom', offset: -10, fill: COLOR.textMuted, fontSize: FONT.min }}
                            stroke="rgba(255,255,255,0.1)"
                        />
                        <YAxis
                            domain={[14, 26]}
                            ticks={[14, 16, 18, 20, 22, 24, 26]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }}
                            label={{ value: 'CD (nm)', angle: -90, position: 'insideLeft', offset: 10, fill: COLOR.textMuted, fontSize: FONT.min }}
                            stroke="rgba(255,255,255,0.1)"
                        />
                        <Tooltip
                            isAnimationActive={false}
                            contentStyle={{
                                background: COLOR.tooltipBg,
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                fontSize: FONT.small,
                                color: COLOR.text,
                            }}
                            formatter={(value: any, name: any) => {
                                const labels: Record<string, string> = {
                                    dense_low: 'Dense 30mJ',
                                    dense_opt: 'Dense 35mJ',
                                    dense_high: 'Dense 40mJ',
                                    iso_opt: 'Iso 35mJ',
                                };
                                return [`${value} nm`, labels[name] || name];
                            }}
                            labelFormatter={(label: any) => `Focus: ${label} nm`}
                        />
                        <Legend
                            verticalAlign="top"
                            align="center"
                            wrapperStyle={{ fontSize: FONT.min, color: COLOR.textMuted, paddingBottom: 8 }}
                        />

                        {/* CD 규격 밴드 */}
                        <ReferenceArea y1={19} y2={21} fill="rgba(34,197,94,0.06)" stroke="none" />
                        <ReferenceLine y={21} stroke="rgba(34,197,94,0.3)" strokeDasharray="4 3"
                            label={{ value: 'CD 상한', position: 'left', fill: 'rgba(34,197,94,0.5)', fontSize: FONT.min }} />
                        <ReferenceLine y={19} stroke="rgba(34,197,94,0.3)" strokeDasharray="4 3"
                            label={{ value: 'CD 하한', position: 'left', fill: 'rgba(34,197,94,0.5)', fontSize: FONT.min }} />

                        {/* Dense 곡선들 (역U자) */}
                        <Line dataKey="dense_low" name="Dense 30mJ" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                        <Line dataKey="dense_opt" name="Dense 35mJ (최적)" stroke="#22c55e" strokeWidth={2} dot={false} />
                        <Line dataKey="dense_high" name="Dense 40mJ" stroke="#ef4444" strokeWidth={1.5} dot={false} />

                        {/* Isolated (U자) */}
                        <Line dataKey="iso_opt" name="Iso 35mJ" stroke="#f59e0b" strokeWidth={2} dot={false}
                            strokeDasharray="6 3" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
