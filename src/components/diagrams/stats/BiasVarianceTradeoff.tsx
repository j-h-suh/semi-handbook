'use client';

import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    ReferenceLine, Tooltip, Legend,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── 편향-분산 곡선 데이터 생성 ─── */
const IRREDUCIBLE_NOISE = 0.8;

function generateCurves() {
    const pts: {
        complexity: number;
        bias2: number;
        variance: number;
        totalError: number;
    }[] = [];

    for (let c = 1; c <= 20; c += 0.5) {
        // 편향²: 복잡도 증가 → 지수 감소
        const bias2 = 8 * Math.exp(-0.25 * c) + 0.1;
        // 분산: 복잡도 증가 → 증가 (저복잡도에서 천천히, 고복잡도에서 급격히)
        const variance = 0.05 * c ** 1.6;
        const totalError = bias2 + variance + IRREDUCIBLE_NOISE;

        pts.push({
            complexity: c,
            bias2: Math.round(bias2 * 1000) / 1000,
            variance: Math.round(variance * 1000) / 1000,
            totalError: Math.round(totalError * 1000) / 1000,
        });
    }
    return pts;
}

const CURVE_DATA = generateCurves();

// Sweet spot: 총 오차 최소 지점
const sweetSpot = CURVE_DATA.reduce((best, pt) =>
    pt.totalError < best.totalError ? pt : best
);

/* ─── 과녁 미니 SVG ─── */
const MINI_TARGET_SIZE = 80;
const MC = MINI_TARGET_SIZE / 2;
const RING_RADII = [30, 20, 10];

function seededJitter(seed: number, range: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return ((x - Math.floor(x)) - 0.5) * 2 * range;
}

interface TargetConfig {
    label: string;
    biasX: number;
    biasY: number;
    spread: number;
    color: string;
}

function MiniTarget({ config, isActive }: { config: TargetConfig; isActive: boolean }) {
    const darts = useMemo(() => {
        const pts: [number, number][] = [];
        for (let i = 0; i < 8; i++) {
            pts.push([
                config.biasX + seededJitter(i * 7 + 1, config.spread),
                config.biasY + seededJitter(i * 7 + 3, config.spread),
            ]);
        }
        return pts;
    }, [config]);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            opacity: isActive ? 1 : 0.35,
            transition: 'opacity 0.3s',
        }}>
            <svg viewBox={`0 0 ${MINI_TARGET_SIZE} ${MINI_TARGET_SIZE}`} width={MINI_TARGET_SIZE} height={MINI_TARGET_SIZE}>
                {RING_RADII.map((r, i) => (
                    <circle key={i} cx={MC} cy={MC} r={r} fill="none" stroke={COLOR.textDim} strokeWidth={0.8} opacity={0.4} />
                ))}
                <line x1={MC - 5} y1={MC} x2={MC + 5} y2={MC} stroke={COLOR.textMuted} strokeWidth={0.5} />
                <line x1={MC} y1={MC - 5} x2={MC} y2={MC + 5} stroke={COLOR.textMuted} strokeWidth={0.5} />
                {darts.map(([dx, dy], i) => (
                    <circle key={i} cx={MC + dx} cy={MC + dy} r={2.5} fill={config.color} opacity={0.8} />
                ))}
                <circle cx={MC} cy={MC} r={1.5} fill={COLOR.textBright} />
            </svg>
            <span style={{ fontSize: FONT.min - 1, color: config.color, fontWeight: 600, marginTop: 2 }}>
                {config.label}
            </span>
        </div>
    );
}

/* ─── 복잡도 구간별 과녁 매핑 ─── */
const TARGET_CONFIGS: TargetConfig[] = [
    { label: '과소적합', biasX: 15, biasY: -12, spread: 4, color: STATS_COLOR.series[3] },
    { label: '최적', biasX: 2, biasY: -1, spread: 5, color: STATS_COLOR.series[0] },
    { label: '과적합', biasX: 1, biasY: 0, spread: 18, color: STATS_COLOR.series[2] },
];

function getActiveTarget(complexity: number): number {
    if (complexity <= 5) return 0;      // 과소적합
    if (complexity <= 12) return 1;     // 최적
    return 2;                           // 과적합
}

export default function BiasVarianceTradeoff() {
    const [complexity, setComplexity] = useState(sweetSpot.complexity);

    const activeTarget = getActiveTarget(complexity);

    // 현재 복잡도의 값
    const current = useMemo(() => {
        const closest = CURVE_DATA.reduce((best, pt) =>
            Math.abs(pt.complexity - complexity) < Math.abs(best.complexity - complexity) ? pt : best
        );
        return closest;
    }, [complexity]);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                편향-분산 트레이드오프
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Bias–Variance Tradeoff — the fundamental tension of supervised learning
            </p>

            {/* 복잡도 슬라이더 */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>모델 복잡도</span>
                <input
                    type="range" min={1} max={20} step={0.5} value={complexity}
                    onChange={e => setComplexity(parseFloat(e.target.value))}
                    style={{ width: 240, accentColor: STATS_COLOR.accent }}
                />
                <span style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STATS_COLOR.accent, minWidth: 30 }}>
                    {complexity.toFixed(1)}
                </span>
            </div>

            {/* 현재 값 배너 */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap',
            }}>
                {[
                    { label: 'Bias²', value: current.bias2.toFixed(2), color: STATS_COLOR.series[1] },
                    { label: 'Variance', value: current.variance.toFixed(2), color: STATS_COLOR.series[3] },
                    { label: 'ε (noise)', value: IRREDUCIBLE_NOISE.toFixed(1), color: COLOR.textDim },
                    { label: 'Total Error', value: current.totalError.toFixed(2), color: STATS_COLOR.series[2] },
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

            {/* U자 곡선 차트 */}
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={CURVE_DATA} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        dataKey="complexity" type="number" domain={[1, 20]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: '모델 복잡도', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        domain={[0, 12]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: '오차', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
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
                                    <div style={{ color: COLOR.textMuted }}>복잡도: {d.complexity}</div>
                                    <div style={{ color: STATS_COLOR.series[1] }}>Bias²: {d.bias2.toFixed(3)}</div>
                                    <div style={{ color: STATS_COLOR.series[3] }}>Variance: {d.variance.toFixed(3)}</div>
                                    <div style={{ color: STATS_COLOR.series[2], fontWeight: 600 }}>Total: {d.totalError.toFixed(3)}</div>
                                </div>
                            );
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        wrapperStyle={{ fontSize: FONT.min, paddingBottom: 8 }}
                    />
                    {/* Sweet spot 표시 */}
                    <ReferenceLine x={sweetSpot.complexity} stroke={STATS_COLOR.accent} strokeDasharray="4 3" strokeWidth={1} />
                    {/* 현재 복잡도 */}
                    <ReferenceLine x={complexity} stroke={COLOR.textBright} strokeWidth={1.5} strokeDasharray="2 2" />
                    {/* 환원 불가능 오차 */}
                    <ReferenceLine y={IRREDUCIBLE_NOISE} stroke={COLOR.textDim} strokeDasharray="6 3" strokeWidth={1} />

                    <Line name="Bias²" type="monotone" dataKey="bias2" dot={false}
                        stroke={STATS_COLOR.series[1]} strokeWidth={2} isAnimationActive={false} />
                    <Line name="Variance" type="monotone" dataKey="variance" dot={false}
                        stroke={STATS_COLOR.series[3]} strokeWidth={2} isAnimationActive={false} />
                    <Line name="Total Error" type="monotone" dataKey="totalError" dot={false}
                        stroke={STATS_COLOR.series[2]} strokeWidth={2.5} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>

            {/* 과녁 비유 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
                {TARGET_CONFIGS.map((tc, i) => (
                    <MiniTarget key={tc.label} config={tc} isActive={activeTarget === i} />
                ))}
            </div>

            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 12 }}>
                복잡도를 높이면 편향은 줄지만 분산이 커진다. 총 오차의 최솟값이 sweet spot.
                점선은 환원 불가능 오차(ε) — 아무리 좋은 모델도 이 아래로 내려갈 수 없다.
            </p>
        </div>
    );
}
