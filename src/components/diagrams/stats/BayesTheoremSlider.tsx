'use client';

import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    ReferenceLine, Tooltip, ReferenceArea,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

export default function BayesTheoremSlider() {
    const [prevalence, setPrevalence] = useState(1.0); // %
    const [sensitivity, setSensitivity] = useState(99); // %
    const [specificity, setSpecificity] = useState(99); // %

    // PPV curve: vary prevalence from 0.01% to 50%
    const data = useMemo(() => {
        const pts: { prev: number; ppv: number }[] = [];
        const sens = sensitivity / 100;
        const spec = specificity / 100;
        for (let p = 0.01; p <= 50; p += 0.25) {
            const pDec = p / 100;
            const ppv = (sens * pDec) / (sens * pDec + (1 - spec) * (1 - pDec));
            pts.push({ prev: Math.round(p * 100) / 100, ppv: Math.round(ppv * 10000) / 100 });
        }
        return pts;
    }, [sensitivity, specificity]);

    // Current PPV
    const pDec = prevalence / 100;
    const sens = sensitivity / 100;
    const spec = specificity / 100;
    const currentPPV = (sens * pDec) / (sens * pDec + (1 - spec) * (1 - pDec));

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                유병률 vs 양성예측도 (PPV)
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Bayes&apos; Theorem — Why a 99% accurate test can be mostly wrong
            </p>

            {/* Sliders */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                    { label: '유병률', value: prevalence, set: setPrevalence, min: 0.1, max: 30, step: 0.1, unit: '%' },
                    { label: '민감도', value: sensitivity, set: setSensitivity, min: 80, max: 100, step: 0.5, unit: '%' },
                    { label: '특이도', value: specificity, set: setSpecificity, min: 80, max: 100, step: 0.5, unit: '%' },
                ].map(({ label, value, set, min, max, step, unit }) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>{label}</span>
                        <span style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STATS_COLOR.accent }}>{value}{unit}</span>
                        <input
                            type="range" min={min} max={max} step={step} value={value}
                            onChange={e => set(parseFloat(e.target.value))}
                            style={{ width: 140, accentColor: STATS_COLOR.accent }}
                        />
                    </div>
                ))}
            </div>

            {/* Result banner */}
            <div style={{
                textAlign: 'center', padding: '10px 16px', borderRadius: 8,
                background: COLOR.cardBg, border: `1px solid ${STATS_COLOR.accentBorder}`,
                marginBottom: 16, maxWidth: 400, margin: '0 auto 16px',
            }}>
                <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>양성 판정 시 실제 양성일 확률 (PPV) = </span>
                <span style={{ fontSize: FONT.title, fontWeight: 700, color: currentPPV > 0.5 ? STATS_COLOR.accent : STATS_COLOR.series[2] }}>
                    {(currentPPV * 100).toFixed(1)}%
                </span>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        dataKey="prev" type="number" domain={[0, 50]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: '유병률 (%)', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'PPV (%)', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <Tooltip
                        content={({ payload }) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            return (
                                <div style={{
                                    background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 6, padding: '6px 10px', fontSize: FONT.min,
                                }}>
                                    <div style={{ color: COLOR.textMuted }}>유병률: {d.prev}%</div>
                                    <div style={{ color: STATS_COLOR.accent, fontWeight: 600 }}>PPV: {d.ppv.toFixed(1)}%</div>
                                </div>
                            );
                        }}
                    />
                    <ReferenceArea x1={0} x2={5} fill={STATS_COLOR.series[2]} fillOpacity={0.05} />
                    <ReferenceLine x={prevalence} stroke={STATS_COLOR.series[3]} strokeDasharray="4 3" strokeWidth={1.5} />
                    <ReferenceLine y={50} stroke={COLOR.textDim} strokeDasharray="2 2" strokeWidth={1} />
                    <Line
                        type="monotone" dataKey="ppv" dot={false}
                        stroke={STATS_COLOR.accent} strokeWidth={2}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>

            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 8 }}>
                유병률이 낮은 구간(핑크 영역)에서는 99% 정확한 검사도 PPV가 50% 미만이다.
            </p>
        </div>
    );
}
