'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 (04_01.json 스펙 기준) ─── */
const pareto = [
    { cd: 0.3, ovl: 2.8 }, { cd: 0.5, ovl: 2.2 }, { cd: 0.7, ovl: 1.8 },
    { cd: 1.0, ovl: 1.5 }, { cd: 1.3, ovl: 1.3 }, { cd: 1.6, ovl: 1.2 }, { cd: 2.0, ovl: 1.1 },
];
const dominated = [
    { cd: 1.0, ovl: 2.5 }, { cd: 1.5, ovl: 2.0 }, { cd: 0.8, ovl: 2.8 },
    { cd: 1.2, ovl: 2.2 }, { cd: 1.8, ovl: 1.8 }, { cd: 2.2, ovl: 1.5 },
    { cd: 0.5, ovl: 3.0 }, { cd: 1.5, ovl: 2.5 },
];

export default function ParetoFrontCdOvl() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Pareto Front — CD vs Overlay 트레이드오프
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Multi-Objective Optimization — 하나를 개선하면 다른 하나가 악화되는 경계선
            </p>

            <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="cd" type="number" domain={[0, 2.5]}
                        ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: 'CD 오차 3σ (nm)', position: 'bottom', offset: 6, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        dataKey="ovl" type="number" domain={[0.5, 3.5]}
                        ticks={[1.0, 1.5, 2.0, 2.5, 3.0]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: 'Overlay 오차 3σ (nm)', angle: -90, position: 'insideLeft', offset: 4, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <Tooltip
                        isAnimationActive={false}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        content={({ payload }: any) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            const isPareto = pareto.some(p => p.cd === d.cd && p.ovl === d.ovl);
                            return (
                                <div style={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: isPareto ? '#ef4444' : COLOR.textDim, marginBottom: 2 }}>
                                        {isPareto ? '★ Pareto 최적해' : '○ 열등해 (Dominated)'}
                                    </div>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted }}>CD 3σ = {d.cd} nm · OVL 3σ = {d.ovl} nm</div>
                                </div>
                            );
                        }}
                    />
                    <ReferenceLine x={0} stroke="rgba(255,255,255,0.1)" />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                    {/* Dominated points */}
                    <Scatter data={dominated} fill="#666666"
                        shape={(props: { cx?: number; cy?: number }) => (
                            <circle cx={props.cx} cy={props.cy} r={5} fill="#666666" opacity={0.4} />
                        )} />
                    {/* Pareto front */}
                    <Scatter data={pareto} fill="#ef4444" line={{ stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '4 3' }}
                        shape={(props: { cx?: number; cy?: number }) => (
                            <circle cx={props.cx} cy={props.cy} r={6} fill="#ef4444" opacity={0.85} />
                        )} />
                </ScatterChart>
            </ResponsiveContainer>

            {/* 범례 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>Pareto Front (최적해)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#666666' }} />
                    <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>열등해 (Dominated)</span>
                </div>
            </div>
        </div>
    );
}
