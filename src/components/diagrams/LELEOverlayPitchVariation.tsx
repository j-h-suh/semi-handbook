'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type ScenarioId = 'perfect' | 'error' | null;

const SVG_W = 600;
const SVG_H = 220;
const LINE_H = 50;
const LINE_W = 10;
const BASE_Y1 = 30;
const BASE_Y2 = 130;
const PITCH = 120;
const HALF_PITCH = PITCH / 2;
const NUM_PAIRS = 3;
const TOTAL_W = (NUM_PAIRS - 1) * PITCH + HALF_PITCH + LINE_W;
const START_X = (SVG_W - TOTAL_W) / 2;
const OVL_ERROR = 14;
const COLORS = { litho1: '#3b82f6', litho2: '#f59e0b', warn: '#ef4444' };

export default function LELEOverlayPitchVariation() {
    const [hovered, setHovered] = useState<ScenarioId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                LELE Overlay 오차 → 피치 불균일
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                위: 완벽 정렬 (OVL=0) · 아래: Overlay 오차 발생 시 피치 변동
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {/* === 상단: 완벽 정렬 === */}
                    <motion.g
                        onMouseEnter={() => setHovered('perfect')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: hovered === 'error' ? 0.3 : 1 }} transition={{ duration: 0.15 }}
                        style={{ cursor: 'pointer' }}>
                        <rect x={0} y={BASE_Y1 - 16} width={SVG_W} height={LINE_H + 32} fill="transparent" />
                        <text x={14} y={BASE_Y1 + LINE_H / 2} dominantBaseline="central" fill={COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>OVL = 0</text>
                        {Array.from({ length: NUM_PAIRS }).map((_, i) => {
                            const x1 = START_X + i * PITCH;
                            const x2 = START_X + i * PITCH + HALF_PITCH;
                            return (
                                <g key={`p-${i}`}>
                                    <rect x={x1} y={BASE_Y1} width={LINE_W} height={LINE_H} rx={2} fill={COLORS.litho1} opacity={0.8} />
                                    {i < NUM_PAIRS && <rect x={x2} y={BASE_Y1} width={LINE_W} height={LINE_H} rx={2} fill={COLORS.litho2} opacity={0.8} />}
                                </g>
                            );
                        })}
                        {/* 균일 간격 표시 */}
                        {[0, 1, 2].map(i => {
                            const xa = START_X + i * PITCH + LINE_W;
                            const xb = START_X + i * PITCH + HALF_PITCH;
                            const mid = (xa + xb) / 2;
                            return (
                                <g key={`d-${i}`}>
                                    <line x1={xa + 2} y1={BASE_Y1 + LINE_H + 8} x2={xb - 2} y2={BASE_Y1 + LINE_H + 8} stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                                    <text x={mid} y={BASE_Y1 + LINE_H + 18} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={FONT.min}>18</text>
                                </g>
                            );
                        })}
                    </motion.g>

                    {/* 구분선 */}
                    <line x1={30} y1={BASE_Y1 + LINE_H + 28} x2={SVG_W - 30} y2={BASE_Y1 + LINE_H + 28} stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="4 3" />

                    {/* === 하단: Overlay 오차 === */}
                    <motion.g
                        onMouseEnter={() => setHovered('error')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: hovered === 'perfect' ? 0.3 : 1 }} transition={{ duration: 0.15 }}
                        style={{ cursor: 'pointer' }}>
                        <rect x={0} y={BASE_Y2 - 16} width={SVG_W} height={LINE_H + 32} fill="transparent" />
                        <text x={14} y={BASE_Y2 + LINE_H / 2} dominantBaseline="central" fill={COLORS.warn} fontSize={FONT.min} fontWeight={600}>OVL ≠ 0</text>
                        {Array.from({ length: NUM_PAIRS }).map((_, i) => {
                            const x1 = START_X + i * PITCH;
                            const x2 = START_X + i * PITCH + HALF_PITCH + OVL_ERROR; // shifted
                            return (
                                <g key={`e-${i}`}>
                                    <rect x={x1} y={BASE_Y2} width={LINE_W} height={LINE_H} rx={2} fill={COLORS.litho1} opacity={0.8} />
                                    {i < NUM_PAIRS && <rect x={x2} y={BASE_Y2} width={LINE_W} height={LINE_H} rx={2} fill={COLORS.litho2} opacity={0.8} />}
                                </g>
                            );
                        })}
                        {/* 불균일 간격 표시 */}
                        {[0, 1].map(i => {
                            const xa = START_X + i * PITCH + LINE_W;
                            const xb = START_X + i * PITCH + HALF_PITCH + OVL_ERROR;
                            const midNarrow = (xa + xb) / 2;
                            const xc = xb + LINE_W;
                            const xd = START_X + (i + 1) * PITCH;
                            const midWide = (xc + xd) / 2;
                            return (
                                <g key={`de-${i}`}>
                                    {/* wide (1st→shifted 2nd) */}
                                    <line x1={xa + 2} y1={BASE_Y2 + LINE_H + 8} x2={xb - 2} y2={BASE_Y2 + LINE_H + 8} stroke="rgba(34,197,94,0.5)" strokeWidth={0.5} />
                                    <text x={midNarrow} y={BASE_Y2 + LINE_H + 18} textAnchor="middle" fill="rgba(34,197,94,0.7)" fontSize={FONT.min}>20</text>
                                    {/* narrow (shifted 2nd→next 1st) */}
                                    <line x1={xc + 2} y1={BASE_Y2 + LINE_H + 8} x2={xd - 2} y2={BASE_Y2 + LINE_H + 8} stroke={COLORS.warn} strokeWidth={0.5} />
                                    <text x={midWide} y={BASE_Y2 + LINE_H + 18} textAnchor="middle" fill={COLORS.warn} fontSize={FONT.min} fontWeight={600}>16</text>
                                </g>
                            );
                        })}
                    </motion.g>

                    {/* 범례 */}
                    <rect x={SVG_W / 2 - 80} y={6} width={12} height={12} rx={2} fill={COLORS.litho1} opacity={0.8} />
                    <text x={SVG_W / 2 - 64} y={14} dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>1차 노광</text>
                    <rect x={SVG_W / 2 + 10} y={6} width={12} height={12} rx={2} fill={COLORS.litho2} opacity={0.8} />
                    <text x={SVG_W / 2 + 26} y={14} dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>2차 노광</text>
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered === 'perfect' ? (
                        <motion.div key="perfect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: '#22c55e', marginBottom: 2 }}>완벽 정렬 (OVL = 0)</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>1차(파란)와 2차(주황) 패턴이 정확히 교대 배치. 모든 간격이 18nm로 균일.</div>
                        </motion.div>
                    ) : hovered === 'error' ? (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: COLORS.warn, marginBottom: 2 }}>Overlay 오차 발생</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>2차 패턴이 우측으로 밀려 간격이 16nm/20nm으로 불균일. 커패시턴스 변동 → 타이밍 불일치.</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>위/아래를 호버하세요. OVL 오차 2nm이 피치 불균일(16/20nm)로 직결되는 과정을 비교합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
