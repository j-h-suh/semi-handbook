'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    ReferenceLine, Tooltip, Line as ReLine,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── OLS 계산 ─── */
function computeOLS(pts: { x: number; y: number }[]) {
    const n = pts.length;
    const sx = pts.reduce((s, p) => s + p.x, 0);
    const sy = pts.reduce((s, p) => s + p.y, 0);
    const sxy = pts.reduce((s, p) => s + p.x * p.y, 0);
    const sxx = pts.reduce((s, p) => s + p.x * p.x, 0);
    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    const intercept = (sy - slope * sx) / n;

    const yMean = sy / n;
    let ssRes = 0, ssTot = 0;
    for (const p of pts) {
        const yHat = slope * p.x + intercept;
        ssRes += (p.y - yHat) ** 2;
        ssTot += (p.y - yMean) ** 2;
    }
    const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

    return { slope, intercept, r2 };
}

/* ─── 초기 데이터 ─── */
const INITIAL_DATA = [
    { x: 1, y: 2.1 }, { x: 2, y: 3.8 }, { x: 3, y: 4.5 },
    { x: 4, y: 5.9 }, { x: 5, y: 7.2 }, { x: 6, y: 7.8 },
    { x: 7, y: 9.5 }, { x: 8, y: 10.1 }, { x: 9, y: 11.8 },
    { x: 10, y: 12.5 },
];

/* ─── 잔차선 커스텀 컴포넌트 ─── */
function ResidualLines({ data, slope, intercept }: {
    data: { x: number; y: number }[];
    slope: number;
    intercept: number;
}) {
    return (
        <>
            {data.map((pt, i) => {
                const yHat = slope * pt.x + intercept;
                return (
                    <ReLine
                        key={`res-${i}`}
                        type="linear"
                        dataKey="y"
                        data={[{ x: pt.x, y: pt.y }, { x: pt.x, y: yHat }]}
                        stroke={STATS_COLOR.series[2]}
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        dot={false}
                        isAnimationActive={false}
                    />
                );
            })}
        </>
    );
}

/* ─── 커스텀 Dot (드래그 가능) ─── */
function DraggableDot(props: {
    cx?: number;
    cy?: number;
    index?: number;
    onDragY: (index: number, newCy: number) => void;
}) {
    const { cx = 0, cy = 0, index = 0, onDragY } = props;
    const [dragging, setDragging] = useState(false);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        (e.target as Element).setPointerCapture(e.pointerId);
        setDragging(true);
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragging) return;
        const svg = (e.target as Element).closest('svg');
        if (!svg) return;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        onDragY(index, svgPt.y);
    }, [dragging, index, onDragY]);

    const handlePointerUp = useCallback(() => setDragging(false), []);

    return (
        <circle
            cx={cx}
            cy={cy}
            r={dragging ? 7 : 5}
            fill={STATS_COLOR.accent}
            stroke={dragging ? '#fff' : 'none'}
            strokeWidth={2}
            style={{ cursor: 'ns-resize', transition: 'r 0.15s' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        />
    );
}

export default function OLSFitVisualizer() {
    const [points, setPoints] = useState(INITIAL_DATA);
    const [showResiduals, setShowResiduals] = useState(true);

    const { slope, intercept, r2 } = useMemo(() => computeOLS(points), [points]);

    // 회귀선 데이터
    const lineData = useMemo(() => {
        return [
            { x: 0, y: intercept },
            { x: 11, y: slope * 11 + intercept },
        ];
    }, [slope, intercept]);

    // 잔차 데이터 (차트용)
    const residualSegments = useMemo(() => {
        return points.map(pt => ({
            ...pt,
            yHat: slope * pt.x + intercept,
            residual: pt.y - (slope * pt.x + intercept),
        }));
    }, [points, slope, intercept]);

    const handleReset = useCallback(() => setPoints(INITIAL_DATA), []);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                최소제곱법 (OLS) 시각화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Ordinary Least Squares — drag points to see how the fit changes
            </p>

            {/* 통계 배너 */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap',
            }}>
                {[
                    { label: '기울기 (β₁)', value: slope.toFixed(3) },
                    { label: '절편 (β₀)', value: intercept.toFixed(3) },
                    { label: 'R²', value: r2.toFixed(4) },
                ].map(({ label, value }) => (
                    <div key={label} style={{
                        textAlign: 'center', padding: '6px 14px', borderRadius: 8,
                        background: COLOR.cardBg, border: `1px solid ${COLOR.border}`,
                    }}>
                        <div style={{ fontSize: FONT.min, color: COLOR.textMuted }}>{label}</div>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STATS_COLOR.accent }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* 컨트롤 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
                <button
                    onClick={() => setShowResiduals(v => !v)}
                    style={{
                        background: showResiduals ? STATS_COLOR.accentDim : 'transparent',
                        color: showResiduals ? STATS_COLOR.accent : COLOR.textMuted,
                        border: `1px solid ${showResiduals ? STATS_COLOR.accentBorder : COLOR.border}`,
                        borderRadius: 6, padding: '4px 12px', fontSize: FONT.min, cursor: 'pointer',
                    }}
                >
                    {showResiduals ? '잔차 숨기기' : '잔차 표시'}
                </button>
                <button
                    onClick={handleReset}
                    style={{
                        background: 'transparent', color: COLOR.textMuted,
                        border: `1px solid ${COLOR.border}`,
                        borderRadius: 6, padding: '4px 12px', fontSize: FONT.min, cursor: 'pointer',
                    }}
                >
                    초기화
                </button>
            </div>

            <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        type="number" dataKey="x" domain={[0, 11]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'x', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        type="number" dataKey="y" domain={[0, 16]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: 'y', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <Tooltip
                        content={({ payload }) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            const yHat = slope * d.x + intercept;
                            return (
                                <div style={{
                                    background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 6, padding: '6px 10px', fontSize: FONT.min,
                                }}>
                                    <div style={{ color: COLOR.textMuted }}>x = {d.x}</div>
                                    <div style={{ color: STATS_COLOR.accent }}>y = {d.y.toFixed(1)}</div>
                                    <div style={{ color: COLOR.textDim }}>ŷ = {yHat.toFixed(2)}</div>
                                    <div style={{ color: STATS_COLOR.series[2] }}>잔차 = {(d.y - yHat).toFixed(2)}</div>
                                </div>
                            );
                        }}
                    />
                    {/* 잔차선 */}
                    {showResiduals && residualSegments.map((seg, i) => (
                        <ReferenceLine
                            key={`res-${i}`}
                            segment={[{ x: seg.x, y: seg.y }, { x: seg.x, y: seg.yHat }]}
                            stroke={STATS_COLOR.series[2]}
                            strokeWidth={1.5}
                            strokeDasharray="3 3"
                        />
                    ))}
                    {/* 회귀선 */}
                    <ReferenceLine
                        segment={[{ x: lineData[0].x, y: lineData[0].y }, { x: lineData[1].x, y: lineData[1].y }]}
                        stroke={STATS_COLOR.series[1]}
                        strokeWidth={2}
                    />
                    {/* 데이터 포인트 */}
                    <Scatter
                        data={points}
                        fill={STATS_COLOR.accent}
                        r={5}
                    />
                </ScatterChart>
            </ResponsiveContainer>

            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 8 }}>
                점 위에 마우스를 올리면 잔차 정보를 확인할 수 있다. 점선은 각 점에서 회귀선까지의 잔차(e = y − ŷ).
            </p>
        </div>
    );
}
