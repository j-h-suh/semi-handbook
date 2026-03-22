'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type SideId = 'current' | 'highna' | null;

const SIDES: Record<Exclude<SideId, null>, { label: string; desc: string; color: string }> = {
    current: { label: '현재 EUV (NA 0.33)', desc: 'X/Y 모두 4:1 등방 축소. 동일한 마스크에서 동일한 비율로 축소. 표준 노광 필드 26×33mm.', color: '#3b82f6' },
    highna:  { label: 'High-NA EUV (NA 0.55)', desc: 'X 4:1, Y 8:1 비등방 축소. Y방향을 2배 더 축소하여 웨이퍼 필드가 세로로 절반. 노광 필드 26×16.5mm.', color: '#f59e0b' },
};

const SVG_W = 700;
const SVG_H = 280;
const U = 14; // base unit

export default function AnamorphicOpticsConcept() {
    const [hovered, setHovered] = useState<SideId>(null);

    const LEFT_CX = 175;
    const RIGHT_CX = 525;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Anamorphic 광학계 — 비등방 축소 (탑뷰)
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                동일 마스크 → 다른 웨이퍼 필드. Y축 축소 배율이 핵심
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    <defs>
                        <marker id="arrowAN" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                            <path d="M0,0 L8,4 L0,8 Z" fill="rgba(255,255,255,0.2)" />
                        </marker>
                    </defs>

                    {/* ===== LEFT: 현재 EUV ===== */}
                    <motion.g onMouseEnter={() => setHovered('current')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: hovered !== null && hovered !== 'current' ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>

                        {/* Title */}
                        <text x={LEFT_CX} y={24} textAnchor="middle" fill={hovered === 'current' ? '#3b82f6' : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>
                            현재 EUV (등방 축소)
                        </text>

                        {/* Mask: 4U × 4U square */}
                        <text x={LEFT_CX} y={46} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>마스크</text>
                        <rect x={LEFT_CX - 2 * U} y={54} width={4 * U} height={4 * U} rx={4}
                            fill={hovered === 'current' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)'}
                            stroke={hovered === 'current' ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'} strokeWidth={1.5} />
                        {/* Mask dimension */}
                        <text x={LEFT_CX + 2 * U + 10} y={54 + 2 * U} textAnchor="start" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>4×</text>
                        <text x={LEFT_CX} y={54 + 4 * U + 14} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>4×</text>

                        {/* Arrow down */}
                        <line x1={LEFT_CX} y1={54 + 4 * U + 28} x2={LEFT_CX} y2={180}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1.2} markerEnd="url(#arrowAN)" />
                        <text x={LEFT_CX - 14} y={160} textAnchor="end" dominantBaseline="central" fill="#3b82f6" fontSize={FONT.min} opacity={0.7}>X 4:1</text>
                        <text x={LEFT_CX + 14} y={160} textAnchor="start" dominantBaseline="central" fill="#3b82f6" fontSize={FONT.min} opacity={0.7}>Y 4:1</text>

                        {/* Wafer field: same proportions as mask = 4U × 4U */}
                        <text x={LEFT_CX} y={196} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>웨이퍼 필드</text>
                        <rect x={LEFT_CX - 2 * U} y={204} width={4 * U} height={4 * U} rx={4}
                            fill={hovered === 'current' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)'}
                            stroke={hovered === 'current' ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.12)'} strokeWidth={1.5} />
                        <text x={LEFT_CX} y={204 + 4 * U + 14} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>26 × 33 mm</text>
                    </motion.g>

                    {/* ===== VS ===== */}
                    <text x={SVG_W / 2} y={150} textAnchor="middle" fill="rgba(255,255,255,0.06)" fontSize={28} fontWeight={700}>VS</text>

                    {/* ===== RIGHT: High-NA ===== */}
                    <motion.g onMouseEnter={() => setHovered('highna')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: hovered !== null && hovered !== 'highna' ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>

                        {/* Title */}
                        <text x={RIGHT_CX} y={24} textAnchor="middle" fill={hovered === 'highna' ? '#f59e0b' : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>
                            High-NA (비등방 축소)
                        </text>

                        {/* Mask: identical 4U × 4U square */}
                        <text x={RIGHT_CX} y={46} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>마스크 (동일)</text>
                        <rect x={RIGHT_CX - 2 * U} y={54} width={4 * U} height={4 * U} rx={4}
                            fill={hovered === 'highna' ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)'}
                            stroke={hovered === 'highna' ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'} strokeWidth={1.5} />
                        <text x={RIGHT_CX + 2 * U + 10} y={54 + 2 * U} textAnchor="start" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>4×</text>
                        <text x={RIGHT_CX} y={54 + 4 * U + 14} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>4×</text>

                        {/* Arrow down */}
                        <line x1={RIGHT_CX} y1={54 + 4 * U + 28} x2={RIGHT_CX} y2={180}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1.2} markerEnd="url(#arrowAN)" />
                        <text x={RIGHT_CX - 14} y={160} textAnchor="end" dominantBaseline="central" fill="#f59e0b" fontSize={FONT.min} opacity={0.7}>X 4:1</text>
                        <text x={RIGHT_CX + 14} y={160} textAnchor="start" dominantBaseline="central" fill="#f59e0b" fontSize={FONT.min} opacity={0.7}>Y 8:1</text>

                        {/* Wafer field: X same, Y half → 4U × 2U */}
                        <text x={RIGHT_CX} y={196} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>웨이퍼 필드</text>
                        <rect x={RIGHT_CX - 2 * U} y={204} width={4 * U} height={2 * U} rx={4}
                            fill={hovered === 'highna' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)'}
                            stroke={hovered === 'highna' ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.12)'} strokeWidth={1.5} />
                        <text x={RIGHT_CX} y={204 + 2 * U + 14} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>26 × 16.5 mm (절반)</text>
                    </motion.g>
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: SIDES[hovered].color, marginBottom: 2 }}>{SIDES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{SIDES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 광학계를 호버하세요. 마스크는 동일 — High-NA는 Y방향 8:1 축소로 웨이퍼 필드가 절반.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
