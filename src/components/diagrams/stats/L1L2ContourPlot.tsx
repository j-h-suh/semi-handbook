'use client';

import React, { useState, useMemo } from 'react';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── 상수 ─── */
const SVG_SIZE = 320;
const CENTER = SVG_SIZE / 2;
const SCALE = 12; // px per unit

/** 손실 등고선: 타원 (β₁ - 3)² + (β₂ - 2)² = c */
const LOSS_CENTER: [number, number] = [3, 2];
const CONTOUR_LEVELS = [1, 2, 4, 7, 11, 16, 22];

/** β 좌표를 SVG 좌표로 변환 */
function toSvg(beta1: number, beta2: number): [number, number] {
    return [CENTER + beta1 * SCALE, CENTER - beta2 * SCALE];
}

/** L1 다이아몬드의 꼭짓점 */
function l1Diamond(t: number): [number, number][] {
    return [
        toSvg(0, t), toSvg(t, 0), toSvg(0, -t), toSvg(-t, 0),
    ];
}

/** L2 원의 반지름 (SVG px) */
function l2RadiusPx(t: number): number {
    return t * SCALE;
}

/** 타원 등고선 경로 (원형 — 동일 스케일 가정) */
function contourPath(level: number): string {
    const r = Math.sqrt(level) * SCALE;
    const [cx, cy] = toSvg(LOSS_CENTER[0], LOSS_CENTER[1]);
    return `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy}`;
}

/** L1 제약과 등고선의 접점 (근사) */
function l1Tangent(t: number): [number, number] {
    // L1 꼭짓점 중 손실 중심에 가장 가까운 것 근처
    const vertices: [number, number][] = [[0, t], [t, 0], [0, -t], [-t, 0]];
    let best = vertices[0];
    let bestDist = Infinity;
    for (const [b1, b2] of vertices) {
        const d = (b1 - LOSS_CENTER[0]) ** 2 + (b2 - LOSS_CENTER[1]) ** 2;
        if (d < bestDist) { bestDist = d; best = [b1, b2]; }
    }
    // 가장 가까운 꼭짓점과 인접 변의 중점 사이에서 더 정확한 접점 찾기
    // 간단히 꼭짓점에서 손실 중심 방향으로 변 위의 점
    if (best[0] === 0) {
        // 세로축 꼭짓점 → 인접 변은 기울기 ±1
        const dir = LOSS_CENTER[0] > 0 ? 1 : -1;
        const step = Math.min(t * 0.8, Math.abs(LOSS_CENTER[0]));
        return [dir * step, best[1] > 0 ? t - step : -t + step];
    }
    const dir = LOSS_CENTER[1] > 0 ? 1 : -1;
    const step = Math.min(t * 0.8, Math.abs(LOSS_CENTER[1]));
    return [best[0] > 0 ? t - step : -t + step, dir * step];
}

/** L2 제약과 등고선의 접점 (원 위에서 손실 중심에 가장 가까운 점) */
function l2Tangent(t: number): [number, number] {
    const [cx, cy] = LOSS_CENTER;
    const dist = Math.sqrt(cx * cx + cy * cy);
    if (dist === 0) return [t, 0];
    return [(cx / dist) * t, (cy / dist) * t];
}

export default function L1L2ContourPlot() {
    const [lambda, setLambda] = useState(4.0);

    const t = useMemo(() => Math.max(0.5, 12 - lambda * 1.5), [lambda]);

    const diamond = useMemo(() => l1Diamond(t), [t]);
    const diamondPath = diamond.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]},${p[1]}`).join(' ') + ' Z';
    const l2r = l2RadiusPx(t);

    const l1Touch = useMemo(() => l1Tangent(t), [t]);
    const l2Touch = useMemo(() => l2Tangent(t), [t]);

    const [l1Svg] = [toSvg(l1Touch[0], l1Touch[1])];
    const [l2Svg] = [toSvg(l2Touch[0], l2Touch[1])];

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                L1 vs L2 제약 영역
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Why L1 produces sparse solutions — the geometry of Lasso vs Ridge
            </p>

            {/* λ 슬라이더 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>λ (정규화 강도)</span>
                <input
                    type="range" min={0} max={7} step={0.1} value={lambda}
                    onChange={e => setLambda(parseFloat(e.target.value))}
                    style={{ width: 200, accentColor: STATS_COLOR.accent }}
                />
                <span style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STATS_COLOR.accent, minWidth: 40 }}>
                    {lambda.toFixed(1)}
                </span>
            </div>

            {/* 두 플롯 나란히 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                {/* L1 (Lasso) */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: STATS_COLOR.series[3], fontSize: FONT.small, fontWeight: 600, marginBottom: 4 }}>
                        L1 (Lasso) — 다이아몬드
                    </p>
                    <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                        style={{ background: 'rgba(255,255,255,0.01)', borderRadius: 8, border: `1px solid ${COLOR.border}` }}>
                        {/* 축 */}
                        <line x1={0} y1={CENTER} x2={SVG_SIZE} y2={CENTER} stroke={COLOR.textDim} strokeWidth={0.5} />
                        <line x1={CENTER} y1={0} x2={CENTER} y2={SVG_SIZE} stroke={COLOR.textDim} strokeWidth={0.5} />
                        <text x={SVG_SIZE - 12} y={CENTER - 6} fill={COLOR.textDim} fontSize={FONT.min}>β₁</text>
                        <text x={CENTER + 6} y={14} fill={COLOR.textDim} fontSize={FONT.min}>β₂</text>

                        {/* 등고선 */}
                        {CONTOUR_LEVELS.map((lv, i) => (
                            <path key={i} d={contourPath(lv)} fill="none"
                                stroke={COLOR.textDim} strokeWidth={0.7} opacity={0.3 + i * 0.05} />
                        ))}

                        {/* OLS 해 (손실 중심) */}
                        <circle cx={toSvg(LOSS_CENTER[0], LOSS_CENTER[1])[0]} cy={toSvg(LOSS_CENTER[0], LOSS_CENTER[1])[1]}
                            r={3} fill={STATS_COLOR.series[1]} />
                        <text x={toSvg(LOSS_CENTER[0], LOSS_CENTER[1])[0] + 6} y={toSvg(LOSS_CENTER[0], LOSS_CENTER[1])[1] - 6}
                            fill={STATS_COLOR.series[1]} fontSize={FONT.min - 1}>OLS</text>

                        {/* L1 다이아몬드 */}
                        <path d={diamondPath} fill={`${STATS_COLOR.series[3]}15`}
                            stroke={STATS_COLOR.series[3]} strokeWidth={2} />

                        {/* 접점 */}
                        <circle cx={l1Svg[0]} cy={l1Svg[1]} r={5}
                            fill={STATS_COLOR.series[2]} stroke="#fff" strokeWidth={1.5} />

                        {/* 꼭짓점 강조 */}
                        {diamond.map(([px, py], i) => (
                            <circle key={i} cx={px} cy={py} r={2.5}
                                fill={STATS_COLOR.series[3]} opacity={0.7} />
                        ))}

                        {/* 접점에 β 값 표시 */}
                        <text x={l1Svg[0] + 8} y={l1Svg[1] + 4} fill={STATS_COLOR.series[2]}
                            fontSize={FONT.min - 1} fontWeight={600}>
                            ({l1Touch[0].toFixed(1)}, {l1Touch[1].toFixed(1)})
                        </text>
                    </svg>
                    <p style={{ color: COLOR.textMuted, fontSize: FONT.min, marginTop: 4 }}>
                        꼭짓점(축 위)에서 만남 → 희소 해
                    </p>
                </div>

                {/* L2 (Ridge) */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: STATS_COLOR.series[4], fontSize: FONT.small, fontWeight: 600, marginBottom: 4 }}>
                        L2 (Ridge) — 원
                    </p>
                    <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                        style={{ background: 'rgba(255,255,255,0.01)', borderRadius: 8, border: `1px solid ${COLOR.border}` }}>
                        {/* 축 */}
                        <line x1={0} y1={CENTER} x2={SVG_SIZE} y2={CENTER} stroke={COLOR.textDim} strokeWidth={0.5} />
                        <line x1={CENTER} y1={0} x2={CENTER} y2={SVG_SIZE} stroke={COLOR.textDim} strokeWidth={0.5} />
                        <text x={SVG_SIZE - 12} y={CENTER - 6} fill={COLOR.textDim} fontSize={FONT.min}>β₁</text>
                        <text x={CENTER + 6} y={14} fill={COLOR.textDim} fontSize={FONT.min}>β₂</text>

                        {/* 등고선 */}
                        {CONTOUR_LEVELS.map((lv, i) => (
                            <path key={i} d={contourPath(lv)} fill="none"
                                stroke={COLOR.textDim} strokeWidth={0.7} opacity={0.3 + i * 0.05} />
                        ))}

                        {/* OLS 해 */}
                        <circle cx={toSvg(LOSS_CENTER[0], LOSS_CENTER[1])[0]} cy={toSvg(LOSS_CENTER[0], LOSS_CENTER[1])[1]}
                            r={3} fill={STATS_COLOR.series[1]} />
                        <text x={toSvg(LOSS_CENTER[0], LOSS_CENTER[1])[0] + 6} y={toSvg(LOSS_CENTER[0], LOSS_CENTER[1])[1] - 6}
                            fill={STATS_COLOR.series[1]} fontSize={FONT.min - 1}>OLS</text>

                        {/* L2 원 */}
                        <circle cx={CENTER} cy={CENTER} r={l2r}
                            fill={`${STATS_COLOR.series[4]}10`}
                            stroke={STATS_COLOR.series[4]} strokeWidth={2} />

                        {/* 접점 */}
                        <circle cx={l2Svg[0]} cy={l2Svg[1]} r={5}
                            fill={STATS_COLOR.series[2]} stroke="#fff" strokeWidth={1.5} />

                        {/* 접점에 β 값 표시 */}
                        <text x={l2Svg[0] + 8} y={l2Svg[1] + 4} fill={STATS_COLOR.series[2]}
                            fontSize={FONT.min - 1} fontWeight={600}>
                            ({l2Touch[0].toFixed(1)}, {l2Touch[1].toFixed(1)})
                        </text>
                    </svg>
                    <p style={{ color: COLOR.textMuted, fontSize: FONT.min, marginTop: 4 }}>
                        원 위의 임의 점에서 만남 → 0이 아닌 해
                    </p>
                </div>
            </div>

            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 12 }}>
                λ가 커질수록 제약 영역이 작아져 해가 원점에 가까워진다. L1의 꼭짓점 구조가 계수를 정확히 0으로 만든다.
            </p>
        </div>
    );
}
