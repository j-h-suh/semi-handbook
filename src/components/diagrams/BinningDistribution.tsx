'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

type Bin = 'bin1' | 'bin2' | 'bin3' | 'fail' | null;

const binInfo: Record<Exclude<Bin, null>, { label: string; sub: string; desc: string; color: string; range: string }> = {
    bin1: { label: 'Bin 1 — Core i9', sub: '4.8~5.2 GHz', desc: '최고 성능 등급. 높은 주파수에서 안정적으로 동작하며 프리미엄 가격으로 판매된다.', color: '#ef4444', range: '4.8–5.2 GHz' },
    bin2: { label: 'Bin 2 — Core i7', sub: '4.3~4.7 GHz', desc: '중상위 등급. 대부분의 사용자에게 충분한 성능을 제공하며 가성비가 좋다.', color: '#3b82f6', range: '4.3–4.7 GHz' },
    bin3: { label: 'Bin 3 — Core i5', sub: '3.8~4.2 GHz', desc: '보급형 등급. 일상 업무에 적합한 성능을 합리적 가격으로 제공한다.', color: '#22c55e', range: '3.8–4.2 GHz' },
    fail: { label: 'Fail — 폐기', sub: '<3.8 GHz', desc: '최소 기준 미달. 동작 불량 또는 기준 주파수 미달로 폐기 처리된다.', color: '#71717a', range: '<3.8 GHz' },
};

/* Generate normal-distribution-like data */
function generateData() {
    const mean = 4.4;
    const std = 0.35;
    const bins: { freq: string; count: number; bin: Exclude<Bin, null> }[] = [];
    for (let f = 3.4; f <= 5.4; f += 0.1) {
        const fRound = Math.round(f * 10) / 10;
        const z = (f - mean) / std;
        const count = Math.round(200 * Math.exp(-0.5 * z * z));
        let bin: Exclude<Bin, null> = 'fail';
        if (fRound >= 4.8) bin = 'bin1';
        else if (fRound >= 4.3) bin = 'bin2';
        else if (fRound >= 3.8) bin = 'bin3';
        bins.push({ freq: fRound.toFixed(1), count, bin });
    }
    return bins;
}

const data = generateData();

const binBoundaries = [
    { x: '3.8', label: 'i5 ▸' },
    { x: '4.3', label: 'i7 ▸' },
    { x: '4.8', label: 'i9 ▸' },
];

export default function BinningDistribution() {
    const [hovered, setHovered] = useState<Bin>(null);

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                빈닝 수율 분포
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Binning Distribution — Same Die, Different Products
            </p>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 24, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="freq"
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '동작 주파수 (GHz)', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                        ticks={['3.4', '3.6', '3.8', '4.0', '4.2', '4.4', '4.6', '4.8', '5.0', '5.2', '5.4']}
                    />
                    <YAxis
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '다이 수', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    {binBoundaries.map(b => (
                        <ReferenceLine key={b.x} x={b.x} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1} opacity={0.6}
                            label={{ value: b.label, position: 'top', style: { fontSize: FONT.min, fill: '#f59e0b' } }} />
                    ))}
                    <Tooltip
                        contentStyle={{ background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, backdropFilter: 'blur(8px)', fontSize: FONT.small }}
                        itemStyle={{ color: COLOR.textMuted }}
                        labelStyle={{ color: COLOR.textBright, fontWeight: 700 }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any, _name: any, props: any) => {
                            const bin = (props?.payload?.bin as Exclude<Bin, null>) || 'fail';
                            return [`${value ?? 0}개 (${binInfo[bin].label})`, '다이 수'];
                        }}
                    />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onMouseEnter={(_data: any) => {
                            const bin = _data?.bin as Exclude<Bin, null> | undefined;
                            if (bin) setHovered(bin);
                        }}>
                        {data.map((entry, idx) => (
                            <Cell key={idx} fill={binInfo[entry.bin].color}
                                opacity={hovered !== null && hovered !== entry.bin ? 0.2 : 0.7} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4, flexWrap: 'wrap' }}>
                {(['fail', 'bin3', 'bin2', 'bin1'] as Exclude<Bin, null>[]).map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', opacity: hovered !== null && hovered !== b ? 0.3 : 1 }}
                        onMouseEnter={() => setHovered(b)} onMouseLeave={() => setHovered(null)}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: binInfo[b].color, opacity: 0.7 }} />
                        <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>{binInfo[b].range}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
