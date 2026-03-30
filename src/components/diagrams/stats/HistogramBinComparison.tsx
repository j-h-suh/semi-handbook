'use client';

import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

// Seeded pseudo-random (mulberry32)
function mulberry32(seed: number) {
    return () => {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// Generate bimodal data
function generateData(): number[] {
    const rng = mulberry32(42);
    const data: number[] = [];
    for (let i = 0; i < 500; i++) {
        // Box-Muller for normal
        const u1 = rng(), u2 = rng();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        if (rng() < 0.4) {
            data.push(30 + z * 8); // left mode
        } else {
            data.push(65 + z * 10); // right mode
        }
    }
    return data;
}

function binData(values: number[], nBins: number) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / nBins;
    const bins = Array.from({ length: nBins }, (_, i) => ({
        label: Math.round(min + (i + 0.5) * binWidth),
        range: `${(min + i * binWidth).toFixed(0)}–${(min + (i + 1) * binWidth).toFixed(0)}`,
        count: 0,
    }));
    for (const v of values) {
        const idx = Math.min(Math.floor((v - min) / binWidth), nBins - 1);
        bins[idx].count++;
    }
    return bins;
}

const RAW_DATA = generateData();
const BIN_OPTIONS = [5, 10, 20, 30, 50];

export default function HistogramBinComparison() {
    const [nBins, setNBins] = useState(20);
    const bins = useMemo(() => binData(RAW_DATA, nBins), [nBins]);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                bin 수에 따른 히스토그램 변화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Histogram Bin Width — same data, different stories
            </p>

            {/* Bin slider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>bins = </span>
                <span style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STATS_COLOR.accent, minWidth: 28, textAlign: 'center' }}>{nBins}</span>
                <input
                    type="range" min="5" max="50" step="1"
                    value={nBins}
                    onChange={(e) => setNBins(parseInt(e.target.value))}
                    style={{ width: 240, accentColor: STATS_COLOR.accent }}
                />
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={bins} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }}
                        tickLine={false}
                        interval={nBins > 30 ? Math.floor(nBins / 10) : nBins > 15 ? 1 : 0}
                    />
                    <YAxis
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }}
                        tickLine={false}
                        label={{ value: '빈도', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
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
                                    <div style={{ color: STATS_COLOR.accent, fontWeight: 600 }}>구간: {d.range}</div>
                                    <div style={{ color: COLOR.textMuted }}>빈도: {d.count}</div>
                                </div>
                            );
                        }}
                    />
                    <Bar dataKey="count" fill={STATS_COLOR.accent} opacity={0.7} radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

            {/* Quick presets */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                {BIN_OPTIONS.map(n => (
                    <button
                        key={n}
                        onClick={() => setNBins(n)}
                        style={{
                            padding: '4px 12px', borderRadius: 6, fontSize: FONT.min,
                            color: nBins === n ? '#fff' : COLOR.textDim,
                            background: nBins === n ? STATS_COLOR.accentDim : 'transparent',
                            border: `1px solid ${nBins === n ? STATS_COLOR.accent : COLOR.border}`,
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                    >
                        {n}
                    </button>
                ))}
            </div>

            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 12 }}>
                {nBins <= 8 ? '너무 적은 bin — 이봉분포 구조가 보이지 않는다.' :
                 nBins <= 25 ? '적절한 bin 수 — 이봉분포의 두 봉우리가 드러난다.' :
                 'bin이 너무 많으면 노이즈에 의한 톱니 패턴이 나타난다.'}
            </p>
        </div>
    );
}
