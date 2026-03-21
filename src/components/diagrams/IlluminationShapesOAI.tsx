'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 조명 형태 데이터 ─── */
type ShapeId = 'annular' | 'dipole' | 'quadrupole' | 'freeform' | null;

interface ShapeInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
    k1: string;
}

const SHAPES: Record<Exclude<ShapeId, null>, ShapeInfo> = {
    annular: {
        label: 'Annular (고리형)', sub: '다방향 패턴 — 범용',
        desc: '링 형태의 조명. 모든 방향에 동일한 빛 분포를 제공하여 다방향 패턴(Contact Hole, Complex Logic)에 범용적. k₁ ≈ 0.4까지 달성 가능.',
        color: '#f59e0b', k1: '~0.4',
    },
    dipole: {
        label: 'Dipole (양극)', sub: '1방향 최적',
        desc: '두 개의 극으로 구성. 한 방향(수평 또는 수직) 라인 패턴에 최적화. 해당 방향의 해상도와 DOF를 극대화하지만, 수직 방향 패턴에는 효과 없음.',
        color: '#3b82f6', k1: '~0.3',
    },
    quadrupole: {
        label: 'Quadrupole (사극)', sub: '수직+수평 2방향',
        desc: '네 개의 극이 45° 간격으로 배치. 수직과 수평 패턴 모두에 효과적. Metal/Poly 레이어처럼 두 방향의 라인이 혼재하는 경우에 적합.',
        color: '#22c55e', k1: '~0.35',
    },
    freeform: {
        label: 'Freeform (SMO)', sub: '특정 설계 맞춤',
        desc: 'SMO(Source-Mask Optimization)로 최적화된 임의 형태. 인간이 직관적으로 선택할 수 없는 비정형 분포. 특정 칩/레이어에 최적화되어 k₁ ≈ 0.28까지 달성.',
        color: '#a855f7', k1: '~0.28',
    },
};

const SHAPE_ORDER: Exclude<ShapeId, null>[] = ['annular', 'dipole', 'quadrupole', 'freeform'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 600;
const SVG_H = 200;
const PANEL_W = 120;
const GAP = 20;
const TOTAL_W = PANEL_W * 4 + GAP * 3;
const START_X = (SVG_W - TOTAL_W) / 2;
const CY = 80;
const PUPIL_R = 40;

/* ─── 동공 패턴 렌더 ─── */
function PupilPattern({ cx, cy, type, color }: { cx: number; cy: number; type: Exclude<ShapeId, null>; color: string }) {
    const outerR = PUPIL_R;
    const fillColor = `${color}30`;
    const strokeColor = `${color}60`;

    switch (type) {
        case 'annular':
            return (
                <g>
                    <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                    <circle cx={cx} cy={cy} r={outerR * 0.85} fill={fillColor} stroke={strokeColor} strokeWidth={1.5} />
                    <circle cx={cx} cy={cy} r={outerR * 0.55} fill="rgba(24,24,27,0.95)" stroke={strokeColor} strokeWidth={1} />
                </g>
            );
        case 'dipole':
            return (
                <g>
                    <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                    <ellipse cx={cx} cy={cy - outerR * 0.5} rx={outerR * 0.35} ry={outerR * 0.3}
                        fill={fillColor} stroke={strokeColor} strokeWidth={1.5} />
                    <ellipse cx={cx} cy={cy + outerR * 0.5} rx={outerR * 0.35} ry={outerR * 0.3}
                        fill={fillColor} stroke={strokeColor} strokeWidth={1.5} />
                </g>
            );
        case 'quadrupole': {
            const offset = outerR * 0.45;
            const dotR = outerR * 0.22;
            return (
                <g>
                    <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], i) => (
                        <circle key={i} cx={cx + dx * offset} cy={cy + dy * offset} r={dotR}
                            fill={fillColor} stroke={strokeColor} strokeWidth={1.5} />
                    ))}
                </g>
            );
        }
        case 'freeform':
            return (
                <g>
                    <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                    <path d={`M${cx - 15},${cy - 25} Q${cx + 20},${cy - 30} ${cx + 25},${cy - 10} Q${cx + 30},${cy + 5} ${cx + 10},${cy + 20} Q${cx - 5},${cy + 30} ${cx - 20},${cy + 15} Q${cx - 30},${cy + 5} ${cx - 25},${cy - 10} Q${cx - 20},${cy - 20} ${cx - 15},${cy - 25} Z`}
                        fill={fillColor} stroke={strokeColor} strokeWidth={1.5} />
                </g>
            );
    }
}

export default function IlluminationShapesOAI() {
    const [hovered, setHovered] = useState<ShapeId>(null);
    const isDimmed = (id: Exclude<ShapeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Off-Axis 조명 형태
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                동공면(Pupil Plane) 강도 분포 — 조명 형태에 따른 k₁ 개선
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 600)} style={{ maxWidth: '100%' }}>
                    {SHAPE_ORDER.map((id, i) => {
                        const x = START_X + i * (PANEL_W + GAP);
                        const cx = x + PANEL_W / 2;
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        const info = SHAPES[id];

                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.15 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={x} y={CY - PUPIL_R - 10} width={PANEL_W} height={PUPIL_R * 2 + 60} fill="transparent" />
                                <PupilPattern cx={cx} cy={CY} type={id} color={info.color} />
                                <text x={cx} y={CY + PUPIL_R + 20} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>
                                    {id.charAt(0).toUpperCase() + id.slice(1)}
                                </text>
                                <text x={cx} y={CY + PUPIL_R + 36} textAnchor="middle"
                                    fill={COLOR.textDim} fontSize={FONT.min}>
                                    k₁ {info.k1}
                                </text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 58 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: SHAPES[hovered].color, marginBottom: 2 }}>
                                {SHAPES[hovered].label} — {SHAPES[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {SHAPES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 조명 형태를 호버하세요. 동공면의 빛 분포가 패턴 방향과 k₁에 미치는 영향을 보여줍니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
