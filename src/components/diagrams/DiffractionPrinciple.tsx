'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 요소 데이터 ─── */
type ElemId = 'incident' | 'grating' | 'plus1' | 'minus1' | null;

const ELEMS: Record<Exclude<ElemId, null>, { label: string; desc: string; color: string }> = {
    incident: { label: '입사광 (광대역)', desc: '격자 마크에 수직으로 조사되는 광대역 빛. 여러 파장과 편광을 조합하여 측정 최적 조건을 탐색.', color: '#ffd700' },
    grating: { label: '합성 격자 (이전층 + 현재층)', desc: '이전 층과 현재 층의 격자가 겹쳐 형성된 합성 격자. 피치 P. 두 격자의 상대적 오프셋이 곧 Overlay.', color: '#a1a1aa' },
    plus1: { label: '+1차 회절광 (+I₁)', desc: '+θ 방향으로 회절된 빛의 강도. 격자가 대칭이면 -I₁과 동일, 비대칭(OVL≠0)이면 차이 발생.', color: '#3b82f6' },
    minus1: { label: '-1차 회절광 (-I₁)', desc: '-θ 방향으로 회절된 빛의 강도. +1차와의 강도 차이 ΔI = +I₁ - (-I₁)이 Overlay에 비례.', color: '#ef4444' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 500;
const SVG_H = 250;
const CX = SVG_W / 2;
const GRATING_Y = 180;
const GRATING_W = 200;
const GRATING_H = 24;
const BAR_W = 12;
const BAR_COUNT = 9;
const BAR_GAP = GRATING_W / BAR_COUNT;

export default function DiffractionPrinciple() {
    const [hovered, setHovered] = useState<ElemId>(null);
    const isDimmed = (id: Exclude<ElemId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                DBO 회절 원리
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                ±1차 회절 강도 차이 → Overlay 추출
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 500 }}>
                    {/* 입사광 */}
                    <motion.g animate={{ opacity: isDimmed('incident') ? 0.15 : 1 }} transition={{ duration: 0.15 }}
                        onMouseEnter={() => setHovered('incident')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                        <rect x={CX - 30} y={10} width={60} height={GRATING_Y - 20} fill="transparent" />
                        <line x1={CX} y1={30} x2={CX} y2={GRATING_Y - 6} stroke="rgba(255,215,0,0.4)" strokeWidth={2} />
                        <polygon points={`${CX},${GRATING_Y - 6} ${CX - 5},${GRATING_Y - 16} ${CX + 5},${GRATING_Y - 16}`} fill="rgba(255,215,0,0.5)" />
                        <text x={CX + 12} y={50} fill={hovered === 'incident' ? '#ffd700' : COLOR.textDim} fontSize={FONT.min}>입사광</text>
                    </motion.g>

                    {/* 격자 */}
                    <motion.g animate={{ opacity: isDimmed('grating') ? 0.15 : 1 }} transition={{ duration: 0.15 }}
                        onMouseEnter={() => setHovered('grating')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                        <rect x={CX - GRATING_W / 2 - 8} y={GRATING_Y - 4} width={GRATING_W + 16} height={GRATING_H + 8} fill="transparent" />
                        <rect x={CX - GRATING_W / 2} y={GRATING_Y} width={GRATING_W} height={GRATING_H}
                            fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.8} />
                        {Array.from({ length: BAR_COUNT }).map((_, i) => (
                            <rect key={i} x={CX - GRATING_W / 2 + i * BAR_GAP + (BAR_GAP - BAR_W) / 2} y={GRATING_Y}
                                width={BAR_W} height={GRATING_H} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />
                        ))}
                        <text x={CX} y={GRATING_Y + GRATING_H + 18} textAnchor="middle" fill={hovered === 'grating' ? '#a1a1aa' : COLOR.textDim} fontSize={FONT.min}>
                            합성 격자 (피치 P)
                        </text>
                    </motion.g>

                    {/* +1차 회절 */}
                    <motion.g animate={{ opacity: isDimmed('plus1') ? 0.15 : 1 }} transition={{ duration: 0.15 }}
                        onMouseEnter={() => setHovered('plus1')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                        <rect x={CX + 60} y={40} width={120} height={GRATING_Y - 40} fill="transparent" />
                        <line x1={CX + 10} y1={GRATING_Y - 6} x2={CX + 140} y2={50} stroke="rgba(59,130,246,0.4)" strokeWidth={2} />
                        <polygon points={`${CX + 140},${50} ${CX + 128},${54} ${CX + 134},${62}`} fill="rgba(59,130,246,0.5)" />
                        <text x={CX + 145} y={60} fill={hovered === 'plus1' ? '#3b82f6' : COLOR.textDim} fontSize={FONT.min}>+1차 (+I₁)</text>
                    </motion.g>

                    {/* -1차 회절 */}
                    <motion.g animate={{ opacity: isDimmed('minus1') ? 0.15 : 1 }} transition={{ duration: 0.15 }}
                        onMouseEnter={() => setHovered('minus1')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                        <rect x={CX - 180} y={40} width={120} height={GRATING_Y - 40} fill="transparent" />
                        <line x1={CX - 10} y1={GRATING_Y - 6} x2={CX - 140} y2={50} stroke="rgba(239,68,68,0.4)" strokeWidth={2} />
                        <polygon points={`${CX - 140},${50} ${CX - 128},${54} ${CX - 134},${62}`} fill="rgba(239,68,68,0.5)" />
                        <text x={CX - 145} y={60} fill={hovered === 'minus1' ? '#ef4444' : COLOR.textDim} fontSize={FONT.min} textAnchor="end">-1차 (-I₁)</text>
                    </motion.g>


                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: ELEMS[hovered].color, marginBottom: 2 }}>
                                {ELEMS[hovered].label}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {ELEMS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 요소를 호버하세요. 격자가 대칭이면 I₊₁ = I₋₁, 비대칭(OVL≠0)이면 강도 차이가 발생합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
