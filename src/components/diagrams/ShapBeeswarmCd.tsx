'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type FeatureId = 'peb' | 'dose' | 'resist' | 'pm' | 'radius' | 'focus' | null;

const FEATURES: Record<Exclude<FeatureId, null>, { label: string; desc: string; spread: number; bias: number }> = {
    peb:    { label: 'PEB 온도', desc: '값이 높을수록(빨강) SHAP이 양 → CD 증가. 가장 넓은 분포 = 가장 영향력 큰 피처.', spread: 1.2, bias: 0.15 },
    dose:   { label: 'Dose', desc: '값이 높을수록(빨강) SHAP이 음 → CD 감소 (포지티브 PR). 물리적 방향과 일치.', spread: 0.9, bias: -0.1 },
    resist: { label: 'Resist 두께', desc: '두꺼울수록 SHAP 양. 중간 정도 영향력.', spread: 0.7, bias: 0.08 },
    pm:     { label: 'PM 이후 시간', desc: 'PM 후 시간이 길수록 SHAP 양(드리프트). 장비 상태 피처의 효과.', spread: 0.6, bias: 0.05 },
    radius: { label: 'Radius', desc: '에지(높은 값)에서 SHAP 양 → CD 크게 변동. Center-Edge 효과 반영.', spread: 0.5, bias: 0.03 },
    focus:  { label: 'Focus 오차²', desc: '디포커스 클수록 SHAP 양. 2차 관계가 잘 포착됨.', spread: 0.4, bias: 0.02 },
};

const ORDER: Exclude<FeatureId, null>[] = ['peb', 'dose', 'resist', 'pm', 'radius', 'focus'];

const SVG_W = 520;
const SVG_H = 220;
const LEFT = 100;
const RIGHT = SVG_W - 30;
const PLOT_W = RIGHT - LEFT;
const TOP = 20;
const ROW_H = 28;
const DOT_R = 3;
const N_DOTS = 40;

/* Seeded random for consistent dots */
function seededRandom(seed: number) {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

export default function ShapBeeswarmCd() {
    const [hovered, setHovered] = useState<FeatureId>(null);
    const isDim = (id: FeatureId) => hovered !== null && hovered !== id;

    const dots = useMemo(() => {
        const result: Record<string, { cx: number; cy: number; color: string; featureId: Exclude<FeatureId, null> }[]> = {};
        ORDER.forEach((id, rowIdx) => {
            const rng = seededRandom(rowIdx * 1000 + 42);
            const info = FEATURES[id];
            const cy = TOP + rowIdx * ROW_H + ROW_H / 2;
            const centerX = LEFT + PLOT_W / 2 + info.bias * PLOT_W * 0.4;
            const arr: typeof result[string] = [];
            for (let i = 0; i < N_DOTS; i++) {
                const t = rng(); // 0~1 = feature value (low→high)
                const shapDir = id === 'dose' ? (1 - t) : t; // dose is inverse
                const shapVal = (shapDir - 0.5) * 2 * info.spread; // -spread ~ +spread
                const jitter = (rng() - 0.5) * 8;
                const cx = centerX + shapVal * PLOT_W * 0.25 + (rng() - 0.5) * 10;
                // Color: blue(low) → red(high)
                const r = Math.round(60 + t * 195);
                const b = Math.round(200 - t * 160);
                const g = Math.round(40 + Math.sin(t * Math.PI) * 60);
                arr.push({ cx: Math.max(LEFT + 2, Math.min(RIGHT - 2, cx)), cy: cy + jitter, color: `rgb(${r},${g},${b})`, featureId: id });
            }
            result[id] = arr;
        });
        return result;
    }, []);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                SHAP Beeswarm Plot — 피처별 기여 분포
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                각 점 = 하나의 샘플, 색상 = 피처값(파랑=낮음, 빨강=높음), x축 = SHAP
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 520 }}>
                    {/* Zero line */}
                    <line x1={LEFT + PLOT_W / 2} y1={TOP} x2={LEFT + PLOT_W / 2} y2={TOP + ORDER.length * ROW_H}
                        stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} strokeDasharray="3 2" />

                    {/* Feature rows */}
                    {ORDER.map((id, i) => {
                        const cy = TOP + i * ROW_H + ROW_H / 2;
                        return (
                            <motion.g key={id} animate={{ opacity: isDim(id) ? 0.1 : 1 }} transition={{ duration: 0.15 }}>
                                {/* Label */}
                                <text x={LEFT - 8} y={cy + 1} textAnchor="end" dominantBaseline="central"
                                    fill={hovered === id ? '#f59e0b' : COLOR.textMuted} fontSize={FONT.min} fontWeight={hovered === id ? 600 : 400}>{FEATURES[id].label}</text>
                                {/* Hit area */}
                                <rect x={LEFT} y={cy - ROW_H / 2} width={PLOT_W} height={ROW_H} fill="transparent"
                                    onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }} />
                                {/* Dots */}
                                {dots[id].map((d, j) => (
                                    <circle key={j} cx={d.cx} cy={d.cy} r={hovered === id ? DOT_R + 0.5 : DOT_R} fill={d.color}
                                        opacity={0.7} onMouseEnter={() => setHovered(id)} style={{ cursor: 'pointer' }} />
                                ))}
                            </motion.g>
                        );
                    })}

                    {/* X axis */}
                    <line x1={LEFT} y1={TOP + ORDER.length * ROW_H + 4} x2={RIGHT} y2={TOP + ORDER.length * ROW_H + 4}
                        stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
                    <text x={LEFT + PLOT_W / 2} y={TOP + ORDER.length * ROW_H + 18} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>SHAP value (impact on CD)</text>
                    <text x={LEFT} y={TOP + ORDER.length * ROW_H + 18} textAnchor="start" fill={COLOR.textDim} fontSize={FONT.min}>← CD 감소</text>
                    <text x={RIGHT} y={TOP + ORDER.length * ROW_H + 18} textAnchor="end" fill={COLOR.textDim} fontSize={FONT.min}>CD 증가 →</text>

                    {/* Color legend (gradient bar) */}
                    <defs>
                        <linearGradient id="shapColorGrad" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="rgb(60,40,200)" />
                            <stop offset="50%" stopColor="rgb(160,100,140)" />
                            <stop offset="100%" stopColor="rgb(255,40,40)" />
                        </linearGradient>
                    </defs>
                    <rect x={RIGHT - 80} y={TOP - 14} width={60} height={6} rx={3} fill="url(#shapColorGrad)" opacity={0.8} />
                    <text x={RIGHT - 82} y={TOP - 8} textAnchor="end" fill={COLOR.textDim} fontSize={FONT.min}>Low</text>
                    <text x={RIGHT + 2} y={TOP - 8} textAnchor="start" fill={COLOR.textDim} fontSize={FONT.min}>High</text>
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: '#f59e0b', marginBottom: 2 }}>{FEATURES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{FEATURES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 행을 호버하세요. 점이 넓게 퍼진 피처가 영향력이 큰 피처입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
