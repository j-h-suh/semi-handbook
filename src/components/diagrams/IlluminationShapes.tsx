'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 조명 형태 데이터 ─── */
type ShapeId = 'conventional' | 'annular' | 'dipole' | 'quadrupole' | null;

interface ShapeInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const SHAPES: Record<Exclude<ShapeId, null>, ShapeInfo> = {
    conventional: { label: 'Conventional', sub: '중앙 원형', desc: '가장 기본적인 원형 조명. 범용적으로 사용되지만 해상도와 DOF가 제한적. 큰 피처나 고립 패턴에 적합.', color: '#fbbf24' },
    annular: { label: 'Annular', sub: '고리형', desc: '중심을 비우고 고리 형태로 조사. Conventional 대비 해상도와 DOF 향상. 다방향 패턴에 범용적으로 효과적.', color: '#f59e0b' },
    dipole: { label: 'Dipole', sub: '양극', desc: '두 극에만 조명을 집중. 한 방향의 밀집 라인 패턴에서 최대 해상도와 DOF 달성. 수직 라인에는 수평 Dipole 사용.', color: '#3b82f6' },
    quadrupole: { label: 'Quadrupole', sub: '사극', desc: '네 극에 조명 배치. 수직+수평 두 방향 패턴에 모두 효과적. 메모리 셀처럼 직교 방향 패턴이 혼합된 경우에 최적.', color: '#8b5cf6' },
};

const SHAPE_ORDER: Exclude<ShapeId, null>[] = ['conventional', 'annular', 'dipole', 'quadrupole'];

/* ─── SVG 레이아웃 ─── */
const PANEL_SIZE = 100;
const PANEL_GAP = 16;
const PADDING_X = 30;
const SVG_W = SHAPE_ORDER.length * PANEL_SIZE + (SHAPE_ORDER.length - 1) * PANEL_GAP + 2 * PADDING_X;
const SVG_H = 160;
const CIRCLE_R = 38;
const CY = 60;

function PupilPattern({ shape, cx }: { shape: Exclude<ShapeId, null>; cx: number }) {
    const info = SHAPES[shape];
    switch (shape) {
        case 'conventional':
            return <circle cx={cx} cy={CY} r={CIRCLE_R * 0.5} fill={info.color} opacity={0.5} />;
        case 'annular':
            return (
                <>
                    <circle cx={cx} cy={CY} r={CIRCLE_R * 0.75} fill={info.color} opacity={0.35} />
                    <circle cx={cx} cy={CY} r={CIRCLE_R * 0.4} fill="#0f0f17" />
                </>
            );
        case 'dipole':
            return (
                <>
                    <circle cx={cx} cy={CY - CIRCLE_R * 0.45} r={CIRCLE_R * 0.3} fill={info.color} opacity={0.5} />
                    <circle cx={cx} cy={CY + CIRCLE_R * 0.45} r={CIRCLE_R * 0.3} fill={info.color} opacity={0.5} />
                </>
            );
        case 'quadrupole':
            return (
                <>
                    <circle cx={cx - CIRCLE_R * 0.38} cy={CY - CIRCLE_R * 0.38} r={CIRCLE_R * 0.22} fill={info.color} opacity={0.5} />
                    <circle cx={cx + CIRCLE_R * 0.38} cy={CY - CIRCLE_R * 0.38} r={CIRCLE_R * 0.22} fill={info.color} opacity={0.5} />
                    <circle cx={cx - CIRCLE_R * 0.38} cy={CY + CIRCLE_R * 0.38} r={CIRCLE_R * 0.22} fill={info.color} opacity={0.5} />
                    <circle cx={cx + CIRCLE_R * 0.38} cy={CY + CIRCLE_R * 0.38} r={CIRCLE_R * 0.22} fill={info.color} opacity={0.5} />
                </>
            );
    }
}

export default function IlluminationShapes() {
    const [hovered, setHovered] = useState<ShapeId>(null);
    const isDimmed = (id: Exclude<ShapeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                조명 형태 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Illumination Shapes — Pupil Plane Intensity
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 600)} style={{ maxWidth: '100%' }}>
                    {SHAPE_ORDER.map((id, i) => {
                        const cx = PADDING_X + PANEL_SIZE / 2 + i * (PANEL_SIZE + PANEL_GAP);
                        const info = SHAPES[id];
                        const active = hovered === id;
                        const dim = isDimmed(id);
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dim ? 0.2 : 1, scale: active ? 1.02 : 1 }}
                                transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer', transformOrigin: `${cx}px ${CY}px` }}>
                                {/* 히트 영역 (투명) */}
                                <circle cx={cx} cy={CY} r={CIRCLE_R} fill="transparent" />
                                {/* 동공면 외곽 원 */}
                                <circle cx={cx} cy={CY} r={CIRCLE_R} fill="none"
                                    stroke={active ? info.color : 'rgba(255,255,255,0.2)'} strokeWidth={active ? 2 : 1} />
                                {/* 십자선 */}
                                <line x1={cx - CIRCLE_R} y1={CY} x2={cx + CIRCLE_R} y2={CY} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
                                <line x1={cx} y1={CY - CIRCLE_R} x2={cx} y2={CY + CIRCLE_R} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
                                {/* 조명 패턴 */}
                                <PupilPattern shape={id} cx={cx} />
                                {/* 라벨 */}
                                <text x={cx} y={CY + CIRCLE_R + 18} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={active ? 700 : 400}>
                                    {info.label}
                                </text>
                                <text x={cx} y={CY + CIRCLE_R + 32} textAnchor="middle"
                                    fill={COLOR.textDim} fontSize={FONT.min}>
                                    {info.sub}
                                </text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            {/* 설명 툴팁 */}
            <div style={{ maxWidth: 600, margin: '8px auto 0', height: 56 }}>
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
                                각 조명 형태를 호버하여 특성을 확인하세요. 패턴의 방향과 밀도에 따라 최적의 조명 형태가 달라집니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
