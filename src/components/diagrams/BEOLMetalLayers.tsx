'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type Layer = 'local' | 'intermediate' | 'global' | null;

const layerInfo: Record<Exclude<Layer, null>, { label: string; sub: string; desc: string; accent: string; metals: string }> = {
    local: {
        label: 'Local 배선 (M1~M3)',
        sub: 'Fine Pitch, Short Distance',
        desc: '폭 ~20nm의 가장 가느다란 배선. 인접 트랜지스터를 직접 연결한다. 네트워크로 치면 서버 내부 버스(Bus)에 해당한다.',
        accent: '#ef4444',
        metals: 'M1~3',
    },
    intermediate: {
        label: 'Intermediate 배선 (M4~M9)',
        sub: 'Medium Pitch, Block-to-Block',
        desc: '기능 블록 간을 연결하는 중간 규모 배선. 데이터센터 내 스위치 간 연결에 해당한다.',
        accent: '#3b82f6',
        metals: 'M4~9',
    },
    global: {
        label: 'Global 배선 (M10~M15)',
        sub: 'Wide Pitch, Chip-wide',
        desc: '폭 수 μm의 가장 두꺼운 배선. 전원(VDD/VSS)과 클럭 신호를 칩 전체에 분배한다. 백본 네트워크에 해당한다.',
        accent: '#22c55e',
        metals: 'M10~15',
    },
};

/* ─── Geometry ─── */
const W = 400, H = 340;
const PAD_X = 60;
const STACK_W = W - 2 * PAD_X;
const BASE_Y = 310;

/* Layers from bottom to top */
const layers: { key: Exclude<Layer, null>; count: number; color: string; widthFactor: number; heightFactor: number }[] = [
    { key: 'local', count: 3, color: '#ef4444', widthFactor: 0.5, heightFactor: 0.7 },
    { key: 'intermediate', count: 6, color: '#3b82f6', widthFactor: 0.75, heightFactor: 1.0 },
    { key: 'global', count: 4, color: '#22c55e', widthFactor: 1.0, heightFactor: 1.5 },
];

const LAYER_H = 16;
const LAYER_GAP = 4;
const GROUP_GAP = 10;

export default function BEOLMetalLayers() {
    const [hovered, setHovered] = useState<Layer>(null);

    let currentY = BASE_Y;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                BEOL 배선 계층 구조
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Hierarchical Metal Interconnect Stack (M1–M15)
            </p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 460, margin: '0 auto', display: 'block' }}>
                {/* Chip outline background */}
                {(() => {
                    let stackH = 0;
                    layers.forEach(g => { stackH += g.count * (Math.round(LAYER_H * g.heightFactor) + LAYER_GAP); });
                    stackH += (layers.length - 1) * GROUP_GAP;
                    const chipTop = BASE_Y - stackH - 6;
                    const chipBottom = BASE_Y + 20 + 6;
                    const chipPad = 10;
                    return (
                        <rect x={PAD_X - chipPad} y={chipTop} width={STACK_W + chipPad * 2} height={chipBottom - chipTop}
                            fill="rgba(255,255,255,0.02)" stroke="#3f3f46" strokeWidth={1} rx={6} strokeDasharray="6,3" />
                    );
                })()}

                {/* FEOL base */}
                <rect x={PAD_X} y={currentY} width={STACK_W} height={20} fill="#71717a" opacity={0.3} rx={3} />
                <text x={W / 2} y={currentY + 14} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>트랜지스터 (FEOL)</text>

                {layers.map((group) => {
                    const groupStartY = currentY;
                    const rects: React.ReactNode[] = [];
                    const layerH = Math.round(LAYER_H * group.heightFactor);
                    for (let i = 0; i < group.count; i++) {
                        currentY -= (layerH + LAYER_GAP);
                        const layerW = STACK_W * group.widthFactor;
                        const layerX = W / 2 - layerW / 2;
                        const dimmed = hovered !== null && hovered !== group.key;
                        rects.push(
                            <motion.rect key={`${group.key}-${i}`}
                                x={layerX} y={currentY} width={layerW} height={layerH}
                                fill={group.color} rx={3}
                                animate={{ opacity: dimmed ? 0.1 : 0.6 }}
                                transition={{ duration: 0.2 }}
                            />
                        );
                        // Via dots between layers
                        if (i > 0) {
                            rects.push(
                                <motion.circle key={`via-${group.key}-${i}`}
                                    cx={W / 2} cy={currentY + layerH + LAYER_GAP / 2}
                                    r={2} fill={group.color}
                                    animate={{ opacity: dimmed ? 0.1 : 0.4 }}
                                    transition={{ duration: 0.2 }}
                                />
                            );
                        }
                    }
                    currentY -= GROUP_GAP;
                    const groupEndY = currentY + GROUP_GAP;
                    const dimmed = hovered !== null && hovered !== group.key;

                    return (
                        <g key={group.key} onMouseEnter={() => setHovered(group.key)} style={{ cursor: 'pointer' }}>
                            {rects}
                            {/* Label to the right */}
                            <motion.text
                                x={W / 2 + STACK_W * group.widthFactor / 2 + 8}
                                y={(groupEndY + groupStartY - (LAYER_H + LAYER_GAP) * group.count / 2) / 2 + (groupStartY - groupEndY) / 4}
                                fontSize={FONT.min} fill={group.color} fontWeight={600}
                                animate={{ opacity: dimmed ? 0.2 : 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                {layerInfo[group.key].metals}
                            </motion.text>
                        </g>
                    );
                })}
                {/* Thin lines connecting groups */}
                {(() => {
                    let y = BASE_Y;
                    const lines: React.ReactNode[] = [];
                    layers.forEach((group, gi) => {
                        const lh = Math.round(LAYER_H * group.heightFactor);
                        for (let i = 0; i < group.count; i++) {
                            y -= (lh + LAYER_GAP);
                        }
                        if (gi < layers.length - 1) {
                            lines.push(
                                <line key={`gline-${gi}`} x1={W / 2} y1={y} x2={W / 2} y2={y - GROUP_GAP}
                                    stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="2,2" />
                            );
                        }
                        y -= GROUP_GAP;
                    });
                    return lines;
                })()}
                {/* Width comparison — vertically centered arrow */}
                {(() => {
                    let stackH = 0;
                    layers.forEach(g => { stackH += g.count * (Math.round(LAYER_H * g.heightFactor) + LAYER_GAP); });
                    stackH += (layers.length - 1) * GROUP_GAP;
                    const topY = BASE_Y - stackH;
                    const bottomY = BASE_Y;
                    const arrowX = PAD_X - 28;
                    return (
                        <g>
                            <text x={arrowX} y={bottomY - 4} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>가늘고</text>
                            <line x1={arrowX} y1={bottomY - 16} x2={arrowX} y2={topY + 16} stroke={COLOR.textDim} strokeWidth={1} />
                            <polygon points={`${arrowX - 3},${topY + 18} ${arrowX + 3},${topY + 18} ${arrowX},${topY + 12}`} fill={COLOR.textDim} />
                            <text x={arrowX} y={topY + 8} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>두껍고</text>
                        </g>
                    );
                })()}
            </svg>

            <AnimatePresence>
                {hovered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', maxWidth: 460, pointerEvents: 'none', zIndex: 10 }}>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: layerInfo[hovered].accent, marginBottom: 4 }}>
                            {layerInfo[hovered].label}
                            <span style={{ fontSize: FONT.min, fontWeight: 400, color: COLOR.textDim, marginLeft: 8 }}>{layerInfo[hovered].sub}</span>
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{layerInfo[hovered].desc}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
