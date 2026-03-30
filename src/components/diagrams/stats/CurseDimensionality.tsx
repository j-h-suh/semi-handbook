'use client';

import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    Tooltip, Cell,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── 시드 기반 난수 ─── */
function seededRandom(seed: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
}

/** d차원 유클리드 거리 */
function euclidean(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
    return Math.sqrt(sum);
}

/** n개 랜덤 점 사이의 거리 분포 시뮬레이션 */
function simulateDistances(dim: number, nPoints: number, seed: number): number[] {
    // 점 생성
    const points: number[][] = [];
    for (let i = 0; i < nPoints; i++) {
        const pt: number[] = [];
        for (let d = 0; d < dim; d++) {
            pt.push(seededRandom(seed + i * 1000 + d));
        }
        points.push(pt);
    }
    // 모든 쌍의 거리
    const dists: number[] = [];
    for (let i = 0; i < nPoints; i++) {
        for (let j = i + 1; j < nPoints; j++) {
            dists.push(euclidean(points[i], points[j]));
        }
    }
    return dists;
}

const N_POINTS = 50;
const N_BINS = 20;
const DIMS = [2, 5, 10, 50, 100, 500];

export default function CurseDimensionality() {
    const [dim, setDim] = useState(2);

    const { histData, stats } = useMemo(() => {
        const dists = simulateDistances(dim, N_POINTS, 42);
        const minD = Math.min(...dists);
        const maxD = Math.max(...dists);
        const meanD = dists.reduce((s, d) => s + d, 0) / dists.length;
        const ratio = (maxD - minD) / minD;

        // 히스토그램 빌드
        const binWidth = (maxD - minD) / N_BINS || 0.01;
        const bins: { center: number; count: number }[] = [];
        for (let i = 0; i < N_BINS; i++) {
            const lo = minD + i * binWidth;
            const hi = lo + binWidth;
            const center = Math.round((lo + hi) / 2 * 1000) / 1000;
            const count = dists.filter(d => d >= lo && (i === N_BINS - 1 ? d <= hi : d < hi)).length;
            bins.push({ center, count });
        }

        // 껍데기 부피 비율: 1 - 0.9^d
        const shellRatio = 1 - Math.pow(0.9, dim);

        return {
            histData: bins,
            stats: {
                minD: minD.toFixed(3),
                maxD: maxD.toFixed(3),
                meanD: meanD.toFixed(3),
                ratio: ratio.toFixed(2),
                shellRatio: (shellRatio * 100).toFixed(2),
            },
        };
    }, [dim]);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                차원의 저주
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Curse of Dimensionality — all points become equidistant in high dimensions
            </p>

            {/* 차원 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: FONT.min, color: COLOR.textMuted, alignSelf: 'center' }}>차원 d =</span>
                {DIMS.map(d => (
                    <button
                        key={d}
                        onClick={() => setDim(d)}
                        style={{
                            background: dim === d ? STATS_COLOR.accentDim : 'transparent',
                            color: dim === d ? STATS_COLOR.accent : COLOR.textMuted,
                            border: `1px solid ${dim === d ? STATS_COLOR.accentBorder : COLOR.border}`,
                            borderRadius: 6, padding: '4px 12px',
                            fontSize: FONT.small, fontWeight: dim === d ? 600 : 400,
                            cursor: 'pointer',
                        }}
                    >
                        {d}
                    </button>
                ))}
            </div>

            {/* 통계 배너 */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap',
            }}>
                {[
                    { label: '최소 거리', value: stats.minD, color: STATS_COLOR.series[1] },
                    { label: '최대 거리', value: stats.maxD, color: STATS_COLOR.series[2] },
                    { label: '(max-min)/min', value: `${stats.ratio}`, color: STATS_COLOR.series[3] },
                    { label: '껍데기 부피', value: `${stats.shellRatio}%`, color: STATS_COLOR.series[4] },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        textAlign: 'center', padding: '4px 10px', borderRadius: 6,
                        background: COLOR.cardBg, border: `1px solid ${COLOR.border}`,
                    }}>
                        <div style={{ fontSize: FONT.min, color: COLOR.textMuted }}>{label}</div>
                        <div style={{ fontSize: FONT.body, fontWeight: 700, color }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* 거리 히스토그램 */}
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={histData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        dataKey="center" type="number"
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: '쌍별 유클리드 거리', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                    />
                    <Tooltip
                        content={({ payload }) => {
                            if (!payload?.[0]) return null;
                            const d = payload[0].payload;
                            return (
                                <div style={{
                                    background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 6, padding: '6px 10px', fontSize: FONT.min,
                                }}>
                                    <div style={{ color: COLOR.textMuted }}>거리 ≈ {d.center}</div>
                                    <div style={{ color: STATS_COLOR.accent }}>빈도: {d.count}</div>
                                </div>
                            );
                        }}
                    />
                    <Bar dataKey="count" isAnimationActive={false}>
                        {histData.map((_, i) => (
                            <Cell key={i} fill={STATS_COLOR.accent} fillOpacity={0.6} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 8 }}>
                차원이 높아질수록 거리 분포가 좁은 범위에 집중된다 — 모든 점이 &quot;비슷하게 멀어지면&quot; KNN은 무력화된다.
            </p>
        </div>
    );
}
