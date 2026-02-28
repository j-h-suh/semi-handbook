'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type Side = 'cvd' | 'ald' | null;

interface SideInfo {
    label: string;
    sub: string;
    desc: string;
    accent: string;
}

const sideInfo: Record<Exclude<Side, null>, SideInfo> = {
    cvd: {
        label: 'CVD 증착',
        sub: 'Non-conformal Coating',
        desc: '막 두께가 위치에 따라 크게 달라진다. 트렌치 상단은 두껍고, 측벽은 얇으며, 바닥은 거의 닿지 않는다. 깊은 트렌치에서는 입구가 먼저 막혀 내부에 빈 공간(Void)이 생기기도 한다.',
        accent: '#f59e0b',
    },
    ald: {
        label: 'ALD 증착',
        sub: 'Conformal Coating',
        desc: '자기 제한 반응 덕분에 표면 위치와 무관하게 동일한 두께로 증착된다. 트렌치 상단, 측벽, 바닥 모두 균일하다. FinFET, GAA 같은 3D 구조에서 ALD가 필수인 이유다.',
        accent: '#22d3ee',
    },
};

/* ─── Geometry constants ─── */
const W = 610;      // viewBox width
const H = 290;      // viewBox height

// Trench dimensions (shared between CVD & ALD)
const TW = 80;      // trench width
const TD = 110;     // trench depth
const SW = 60;      // shoulder width (substrate on each side of trench)
const SH = 30;      // substrate height below trench bottom
const BASE_Y = 70;  // top of substrate

// CVD coating thicknesses
const CVD_TOP = 14;
const CVD_SIDE = 3;
const CVD_BOT = 1;
const CVD_OVERHANG = 10;  // extra buildup at trench lip

// ALD coating thickness (uniform)
const ALD_T = 7;

/**
 * Draws one trench substrate (Si block with a rectangular trench cut)
 */
function Substrate({ ox }: { ox: number }) {
    const x = ox;
    const y = BASE_Y;
    const totalW = SW + TW + SW;
    const totalH = TD + SH;

    // Draw substrate as a path with trench cut-out
    const d = [
        `M${x},${y}`,
        `H${x + SW}`,
        `V${y + TD}`,
        `H${x + SW + TW}`,
        `V${y}`,
        `H${x + totalW}`,
        `V${y + totalH}`,
        `H${x}`,
        'Z',
    ].join(' ');

    return <path d={d} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />;
}

/**
 * CVD non-conformal coating path
 */
function CVDCoating({ ox }: { ox: number }) {
    const t = CVD_TOP;
    const s = CVD_SIDE;
    const b = CVD_BOT;
    const oh = CVD_OVERHANG;
    const y = BASE_Y;

    // Left shoulder top coating
    const leftTop = `M${ox},${y - t} H${ox + SW + oh} V${y} H${ox} Z`;
    // Right shoulder top coating
    const rightTop = `M${ox + SW + TW - oh},${y - t} H${ox + SW + TW + SW} V${y} H${ox + SW + TW} V${y - t} Z`;

    // Left overhang (tapers into sidewall)
    const leftOH = `M${ox + SW},${y - t} H${ox + SW + oh} V${y} H${ox + SW} Z`;
    // Left sidewall
    const leftSW = `M${ox + SW},${y} H${ox + SW + s} V${y + TD} H${ox + SW} Z`;
    // Right overhang
    const rightOH = `M${ox + SW + TW - oh},${y - t} H${ox + SW + TW} V${y} H${ox + SW + TW - oh} Z`;
    // Right sidewall
    const rightSW = `M${ox + SW + TW - s},${y} H${ox + SW + TW} V${y + TD} H${ox + SW + TW - s} Z`;
    // Bottom
    const bottom = `M${ox + SW},${y + TD} H${ox + SW + TW} V${y + TD + b} H${ox + SW} Z`;

    return (
        <g>
            <path d={leftTop} fill="#f59e0b" opacity={0.85} />
            <path d={rightTop} fill="#f59e0b" opacity={0.85} />
            <path d={leftOH} fill="#f59e0b" opacity={0.7} />
            <path d={rightOH} fill="#f59e0b" opacity={0.7} />
            <path d={leftSW} fill="#f59e0b" opacity={0.35} />
            <path d={rightSW} fill="#f59e0b" opacity={0.35} />
            <path d={bottom} fill="#f59e0b" opacity={0.2} />
        </g>
    );
}

/**
 * ALD conformal coating path
 */
function ALDCoating({ ox }: { ox: number }) {
    const t = ALD_T;
    const y = BASE_Y;

    // Single continuous path for uniform coating
    // Outer edge (top-left → clockwise around the trench → back)
    const d = [
        // Start at top-left of left shoulder coating
        `M${ox},${y - t}`,
        // Right along left shoulder top
        `H${ox + SW + t}`,
        // Down left inner wall
        `V${y + TD - t}`,
        // Right along bottom
        `H${ox + SW + TW - t}`,
        // Up right inner wall
        `V${y - t}`,
        // Right along right shoulder top
        `H${ox + SW + TW + SW}`,
        // Down to substrate top
        `V${y}`,
        // Left to right trench edge
        `H${ox + SW + TW}`,
        // Down right outer wall
        `V${y + TD}`,
        // Left along trench bottom
        `H${ox + SW}`,
        // Up left outer wall
        `V${y}`,
        // Left back to start
        `H${ox}`,
        'Z',
    ].join(' ');

    return <path d={d} fill="#22d3ee" opacity={0.8} />;
}

/**
 * Dimension annotation arrow
 */
function DimLabel({ x, y, label, color }: { x: number; y: number; label: string; color: string }) {
    return (
        <text x={x} y={y} textAnchor="middle" fontSize={FONT.min} fill={color} opacity={0.8} fontFamily="monospace">
            {label}
        </text>
    );
}

export default function ALDvsCVDConformality() {
    const [hovered, setHovered] = useState<Side>(null);

    const diagramW = SW + TW + SW; // 200
    const gap = 30; // gap from each diagram edge to center divider
    const aldOx = W / 2 - gap - diagramW;
    const cvdOx = W / 2 + gap;

    const cvdCenter = cvdOx + SW + TW / 2;
    const aldCenter = aldOx + SW + TW / 2;

    const cvdDimmed = hovered !== null && hovered !== 'cvd';
    const aldDimmed = hovered !== null && hovered !== 'ald';

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                ALD vs CVD: 트렌치 피복 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Conformal vs Non-conformal Coating on Trench Structure
            </p>

            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${W} ${H}`}
                className="w-full"
                style={{ maxWidth: 700, margin: '0 auto', display: 'block' }}
            >
                {/* Center divider */}
                <line x1={W / 2} y1={40} x2={W / 2} y2={H - 10} stroke="#3f3f46" strokeWidth={1} strokeDasharray="4,4" />

                {/* ─── CVD side ─── */}
                <g
                    onMouseEnter={() => setHovered('cvd')}
                    style={{ cursor: 'pointer' }}
                >
                    <motion.g animate={{ opacity: cvdDimmed ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <Substrate ox={cvdOx} />
                        <CVDCoating ox={cvdOx} />


                        {/* Overhang annotation */}
                        <text
                            x={cvdOx + SW} y={BASE_Y - CVD_TOP - 4}
                            textAnchor="start" fontSize={FONT.min} fill="#f59e0b" opacity={0.7}
                        >
                            ↓ Overhang(돌출)
                        </text>

                        {/* Dimension labels */}
                        <DimLabel x={cvdOx + SW / 2} y={BASE_Y - CVD_TOP - 4} label={`${CVD_TOP}nm`} color="#f59e0b" />
                        <DimLabel x={cvdOx + SW - 12} y={BASE_Y + TD / 2} label={`${CVD_SIDE}nm`} color="#f59e0b" />
                        <DimLabel x={cvdCenter} y={BASE_Y + TD + 14} label={`~${CVD_BOT}nm`} color="#f59e0b" />

                        {/* Label */}
                        <text x={cvdCenter} y={BASE_Y + TD + SH + 30} textAnchor="middle"
                            fontSize={FONT.cardHeader} fill={COLOR.textBright} fontWeight={600}>CVD</text>
                        <text x={cvdCenter} y={BASE_Y + TD + SH + 46} textAnchor="middle"
                            fontSize={FONT.min} fill={COLOR.textDim}>Non-conformal</text>
                    </motion.g>
                </g>

                {/* ─── ALD side ─── */}
                <g
                    onMouseEnter={() => setHovered('ald')}
                    style={{ cursor: 'pointer' }}
                >
                    <motion.g animate={{ opacity: aldDimmed ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <Substrate ox={aldOx} />
                        <ALDCoating ox={aldOx} />

                        {/* Dimension labels — all the same */}
                        <DimLabel x={aldOx + SW / 2} y={BASE_Y - ALD_T - 4} label={`${ALD_T}nm`} color="#22d3ee" />
                        <DimLabel x={aldOx + SW - 12} y={BASE_Y + TD / 2} label={`${ALD_T}nm`} color="#22d3ee" />
                        <DimLabel x={aldCenter} y={BASE_Y + TD + 14} label={`${ALD_T}nm`} color="#22d3ee" />

                        {/* Label */}
                        <text x={aldCenter} y={BASE_Y + TD + SH + 30} textAnchor="middle"
                            fontSize={FONT.cardHeader} fill={COLOR.textBright} fontWeight={600}>ALD</text>
                        <text x={aldCenter} y={BASE_Y + TD + SH + 46} textAnchor="middle"
                            fontSize={FONT.min} fill={COLOR.textDim}>Conformal</text>
                    </motion.g>
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
                            background: 'rgba(24,24,27,0.95)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            padding: '12px 16px',
                            maxWidth: 440,
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
