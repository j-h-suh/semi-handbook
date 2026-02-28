'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type Side = 'wet' | 'dry' | null;

interface SideInfo {
    label: string;
    sub: string;
    desc: string;
    accent: string;
}

const sideInfo: Record<Exclude<Side, null>, SideInfo> = {
    wet: {
        label: '습식 식각 (Wet Etch)',
        sub: 'Isotropic',
        desc: '화학 용액이 모든 방향으로 동일하게 반응하여 등방성 식각이 일어난다. 아래로 10nm를 깎으면 옆으로도 10nm가 깎여 언더컷(Undercut)이 발생한다. 선폭이 수백 nm 이상이던 시절에는 문제없었지만, 현대 미세 공정에서는 패턴 붕괴의 원인이 된다.',
        accent: '#22c55e',
    },
    dry: {
        label: '건식 식각 (Dry Etch / RIE)',
        sub: 'Anisotropic',
        desc: '플라즈마 이온이 전기장 방향(수직)으로만 가속되어 이방성 식각을 실현한다. 측벽은 거의 깎이지 않고 바닥면만 식각되어 수직 프로파일(90°)을 달성한다. 현대 반도체 양산의 핵심 식각 기술이다.',
        accent: '#3b82f6',
    },
};

/* ─── Geometry constants ─── */
const W = 620;
const H = 310;

// Substrate & layer
const SUBSTRATE_H = 35;
const LAYER_H = 90;
const MASK_H = 18;
const MASK_OPENING = 80;       // opening width in mask
const SHOULDER_W = 50;         // mask shoulder on each side
const BLOCK_W = SHOULDER_W * 2 + MASK_OPENING;  // total block width

// Positions
const BASE_Y = 80;            // top of target layer
const GAP = 40;               // gap between left and right blocks

// Wet etch cavity
const WET_DEPTH = 75;         // vertical etch depth
const UNDERCUT = 28;          // horizontal undercut on each side

// Dry etch cavity
const DRY_DEPTH = 85;         // vertical etch depth (slightly deeper, faster)

/* ─── Computed positions ─── */
const leftOx = W / 2 - GAP / 2 - BLOCK_W;
const rightOx = W / 2 + GAP / 2;

function WetEtchBlock({ ox }: { ox: number }) {
    const layerTop = BASE_Y;
    const layerBot = BASE_Y + LAYER_H;
    const maskY = layerTop - MASK_H;
    const maskLeftEnd = ox + SHOULDER_W;
    const maskRightStart = ox + SHOULDER_W + MASK_OPENING;

    // Bowl-shaped isotropic cavity
    const cavityCx = ox + SHOULDER_W + MASK_OPENING / 2;
    const cavityBottom = layerTop + WET_DEPTH;
    // Undercut measured at widest point (bowl mid-height)
    const cavityMidY = layerTop + WET_DEPTH / 2;
    // The bowl extends UNDERCUT px beyond mask edges at the bottom
    const cavityLeft = maskLeftEnd - UNDERCUT;
    const cavityRight = maskRightStart + UNDERCUT;

    return (
        <g>
            {/* Target layer (yellow) */}
            <rect x={ox} y={layerTop} width={BLOCK_W} height={LAYER_H} fill="#f59e0b" opacity={0.25} stroke="#f59e0b" strokeWidth={0.5} />

            {/* Substrate below */}
            <rect x={ox} y={layerBot} width={BLOCK_W} height={SUBSTRATE_H} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
            <text x={ox + BLOCK_W / 2} y={layerBot + SUBSTRATE_H / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>Si Substrate</text>

            {/* Isotropic etch cavity (bowl) — white to "erase" the layer */}
            <path
                d={`M${maskLeftEnd},${layerTop} C${maskLeftEnd},${cavityBottom - 10} ${cavityLeft},${cavityBottom} ${cavityCx},${cavityBottom} C${cavityRight},${cavityBottom} ${maskRightStart},${cavityBottom - 10} ${maskRightStart},${layerTop} Z`}
                fill="#18181b"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="3,2"
            />

            {/* Mask (resist) */}
            <rect x={ox} y={maskY} width={SHOULDER_W} height={MASK_H} fill="#ef4444" opacity={0.6} rx={2} />
            <rect x={maskRightStart} y={maskY} width={SHOULDER_W} height={MASK_H} fill="#ef4444" opacity={0.6} rx={2} />

            {/* Undercut dimension arrows — just below PR mask */}
            {(() => {
                const ucY = maskY + MASK_H + 6;
                const ucLeft = maskLeftEnd - UNDERCUT * 0.25;
                return (
                    <>
                        <line x1={ucLeft} y1={ucY} x2={maskLeftEnd} y2={ucY} stroke="#ef4444" strokeWidth={1.2} />
                        <line x1={ucLeft} y1={ucY - 4} x2={ucLeft} y2={ucY + 4} stroke="#ef4444" strokeWidth={1} />
                        <line x1={maskLeftEnd} y1={ucY - 4} x2={maskLeftEnd} y2={ucY + 4} stroke="#ef4444" strokeWidth={1} />
                        <text x={(ucLeft + maskLeftEnd) / 2} y={ucY + 14} textAnchor="middle" fontSize={FONT.min} fill="#ef4444" fontWeight={600}>Undercut</text>
                    </>
                );
            })()}

            {/* Chemical arrows (multi-directional) */}
            {[-12, 0, 12].map((dx) => (
                <line
                    key={dx}
                    x1={cavityCx + dx}
                    y1={maskY - 18}
                    x2={cavityCx + dx + (dx < 0 ? -6 : dx > 0 ? 6 : 0)}
                    y2={maskY - 4}
                    stroke="#22c55e"
                    strokeWidth={1.5}
                    markerEnd="none"
                    opacity={0.7}
                />
            ))}
            <text x={cavityCx} y={maskY - 22} textAnchor="middle" fontSize={FONT.min} fill="#22c55e" opacity={0.8}>화학 용액</text>

            {/* "등방성" label — at mid-height of layer */}
            <text x={cavityCx} y={layerTop + LAYER_H / 2 - 2} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textMuted}>등방성</text>
            <text x={cavityCx} y={layerTop + LAYER_H / 2 + 12} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>(Isotropic)</text>
        </g>
    );
}

function DryEtchBlock({ ox }: { ox: number }) {
    const layerTop = BASE_Y;
    const layerBot = BASE_Y + LAYER_H;
    const maskY = layerTop - MASK_H;
    const maskLeftEnd = ox + SHOULDER_W;
    const maskRightStart = ox + SHOULDER_W + MASK_OPENING;

    const trenchBot = layerTop + DRY_DEPTH;

    return (
        <g>
            {/* Target layer */}
            <rect x={ox} y={layerTop} width={BLOCK_W} height={LAYER_H} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.5} />

            {/* Substrate below */}
            <rect x={ox} y={layerBot} width={BLOCK_W} height={SUBSTRATE_H} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
            <text x={ox + BLOCK_W / 2} y={layerBot + SUBSTRATE_H / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>Si Substrate</text>

            {/* Vertical trench (anisotropic) */}
            <rect x={maskLeftEnd} y={layerTop} width={MASK_OPENING} height={DRY_DEPTH} fill="#18181b" stroke="#3b82f6" strokeWidth={1} />

            {/* 90° angle markers */}
            <path d={`M${maskLeftEnd},${trenchBot - 10} L${maskLeftEnd + 10},${trenchBot - 10} L${maskLeftEnd + 10},${trenchBot}`} fill="none" stroke="#22d3ee" strokeWidth={1} />
            <text x={maskLeftEnd - 4} y={trenchBot - 4} textAnchor="end" fontSize={FONT.min} fill="#22d3ee" fontWeight={600}>90°</text>

            {/* Mask (resist) */}
            <rect x={ox} y={maskY} width={SHOULDER_W} height={MASK_H} fill="#ef4444" opacity={0.6} rx={2} />
            <rect x={maskRightStart} y={maskY} width={SHOULDER_W} height={MASK_H} fill="#ef4444" opacity={0.6} rx={2} />

            {/* Plasma ion arrows (straight down) */}
            {[0.25, 0.5, 0.75].map((frac) => {
                const ax = maskLeftEnd + MASK_OPENING * frac;
                return (
                    <g key={frac}>
                        <line x1={ax} y1={maskY - 18} x2={ax} y2={maskY - 4} stroke="#3b82f6" strokeWidth={1.5} opacity={0.7} />
                        <polygon points={`${ax - 3},${maskY - 6} ${ax + 3},${maskY - 6} ${ax},${maskY - 1}`} fill="#3b82f6" opacity={0.7} />
                    </g>
                );
            })}
            <text x={ox + BLOCK_W / 2} y={maskY - 22} textAnchor="middle" fontSize={FONT.min} fill="#3b82f6" opacity={0.8}>플라즈마 이온</text>

            {/* "이방성" label — at mid-height of layer */}
            <text x={ox + BLOCK_W / 2} y={layerTop + LAYER_H / 2 - 2} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textMuted}>이방성</text>
            <text x={ox + BLOCK_W / 2} y={layerTop + LAYER_H / 2 + 12} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>(Anisotropic)</text>
        </g>
    );
}

export default function WetVsDryEtchProfile() {
    const [hovered, setHovered] = useState<Side>(null);

    const wetDimmed = hovered !== null && hovered !== 'wet';
    const dryDimmed = hovered !== null && hovered !== 'dry';

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                습식 vs 건식 식각 단면 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Wet Etch (Isotropic) vs Dry Etch / RIE (Anisotropic)
            </p>

            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${W} ${H}`}
                className="w-full"
                style={{ maxWidth: 720, margin: '0 auto', display: 'block' }}
            >
                {/* Center divider */}
                <line x1={W / 2} y1={50} x2={W / 2} y2={BASE_Y + LAYER_H + SUBSTRATE_H} stroke="#3f3f46" strokeWidth={1} strokeDasharray="4,4" />

                {/* ─── Wet Etch side ─── */}
                <g onMouseEnter={() => setHovered('wet')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: wetDimmed ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <WetEtchBlock ox={leftOx} />
                        {/* Side label */}
                        <text x={leftOx + BLOCK_W / 2} y={BASE_Y + LAYER_H + SUBSTRATE_H + 28} textAnchor="middle"
                            fontSize={FONT.cardHeader} fill={COLOR.textBright} fontWeight={600}>습식 식각</text>
                        <text x={leftOx + BLOCK_W / 2} y={BASE_Y + LAYER_H + SUBSTRATE_H + 44} textAnchor="middle"
                            fontSize={FONT.min} fill={COLOR.textDim}>Wet Etch</text>
                    </motion.g>
                </g>

                {/* ─── Dry Etch side ─── */}
                <g onMouseEnter={() => setHovered('dry')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: dryDimmed ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <DryEtchBlock ox={rightOx} />
                        {/* Side label */}
                        <text x={rightOx + BLOCK_W / 2} y={BASE_Y + LAYER_H + SUBSTRATE_H + 28} textAnchor="middle"
                            fontSize={FONT.cardHeader} fill={COLOR.textBright} fontWeight={600}>건식 식각</text>
                        <text x={rightOx + BLOCK_W / 2} y={BASE_Y + LAYER_H + SUBSTRATE_H + 44} textAnchor="middle"
                            fontSize={FONT.min} fill={COLOR.textDim}>Dry Etch / RIE</text>
                    </motion.g>
                </g>

                {/* Legend */}
                <g transform={`translate(${W / 2 - 120}, ${H - 18})`}>
                    <rect x={0} y={0} width={12} height={10} fill="#ef4444" opacity={0.6} rx={1} />
                    <text x={16} y={9} fontSize={FONT.min} fill={COLOR.textDim}>Photoresist</text>
                    <rect x={90} y={0} width={12} height={10} fill="#f59e0b" opacity={0.4} rx={1} />
                    <text x={106} y={9} fontSize={FONT.min} fill={COLOR.textDim}>Etch Target</text>
                    <rect x={190} y={0} width={12} height={10} fill="#27272a" stroke="#3f3f46" strokeWidth={0.5} rx={1} />
                    <text x={206} y={9} fontSize={FONT.min} fill={COLOR.textDim}>Si</text>
                </g>
            </svg>

            {/* Floating tooltip */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: COLOR.tooltipBg,
                            backdropFilter: 'blur(8px)',
                            border: `1px solid rgba(255,255,255,0.1)`,
                            borderRadius: 8,
                            padding: '12px 16px',
                            maxWidth: 460,
                            pointerEvents: 'none',
                            zIndex: 10,
                        }}
                    >
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: sideInfo[hovered].accent, marginBottom: 4 }}>
                            {sideInfo[hovered].label}
                            <span style={{ fontSize: FONT.min, fontWeight: 400, color: COLOR.textDim, marginLeft: 8 }}>
                                {sideInfo[hovered].sub}
                            </span>
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                            {sideInfo[hovered].desc}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
