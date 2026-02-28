'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type Side = 'normal' | 'channeling' | null;

const sideInfo: Record<Exclude<Side, null>, { label: string; sub: string; desc: string; accent: string }> = {
    normal: {
        label: '정상 주입 (Off-axis)',
        sub: 'Random Scattering',
        desc: '이온이 격자 원자와 연속 충돌하며 에너지를 잃고, 예측 가능한 깊이(Rp)에 멈춘다. 틸트 주입(~7°)이나 사전 비정질화(PAI)로 달성한다.',
        accent: '#3b82f6',
    },
    channeling: {
        label: '채널링 (On-axis)',
        sub: 'Channeling Effect',
        desc: '이온이 격자 원자 열 사이의 빈 통로를 따라 충돌 없이 깊이 침투한다. 접합 깊이가 설계보다 깊어져 단채널 효과와 인접 소자 간섭을 유발한다.',
        accent: '#ef4444',
    },
};

/* ─── Geometry ─── */
const W = 620, H = 310;
const ATOM_R = 5;
const GRID_COLS = 7, GRID_ROWS = 9;
const GRID_GAP_X = 22, GRID_GAP_Y = 20;
const GAP = 40;

const BLOCK_W = (GRID_COLS - 1) * GRID_GAP_X + 2 * 20;    // 132 + 40 = 172
const BLOCK_H = (GRID_ROWS - 1) * GRID_GAP_Y + 2 * 10;    // 160 + 20 = 180
const BASE_Y = 60;

const leftOx = W / 2 - GAP / 2 - BLOCK_W;
const rightOx = W / 2 + GAP / 2;

function LatticeGrid({ ox, oy, highlight }: { ox: number; oy: number; highlight?: 'channel' }) {
    const atoms: React.ReactNode[] = [];
    const startX = ox + 20;
    const startY = oy + 10;
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const cx = startX + c * GRID_GAP_X;
            const cy = startY + r * GRID_GAP_Y;
            // For channel mode, dim the middle two columns to show the channel
            const isChannel = highlight === 'channel' && (c === 3);
            atoms.push(
                <circle
                    key={`${r}-${c}`}
                    cx={cx} cy={cy} r={isChannel ? ATOM_R - 1 : ATOM_R}
                    fill={isChannel ? 'rgba(113,113,122,0.2)' : '#52525b'}
                    stroke={isChannel ? '#71717a' : '#3f3f46'}
                    strokeWidth={0.5}
                />
            );
        }
    }
    return <g>{atoms}</g>;
}

function NormalPath({ ox, oy }: { ox: number; oy: number }) {
    const startX = ox + 20 + 3 * GRID_GAP_X + 2;
    const startY = oy - 6;
    // Zigzag path hitting atoms
    const points = [
        { x: startX, y: startY },
        { x: startX - 8, y: oy + 30 },
        { x: startX + 6, y: oy + 55 },
        { x: startX - 4, y: oy + 80 },
        { x: startX + 3, y: oy + 100 },
    ];
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const stopped = points[points.length - 1];
    return (
        <g>
            <path d={d} fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4,2" />
            {/* Impact markers */}
            {points.slice(1, -1).map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3} fill="#f59e0b" opacity={0.6} />
            ))}
            {/* Stop marker */}
            <circle cx={stopped.x} cy={stopped.y} r={5} fill="#3b82f6" stroke="#60a5fa" strokeWidth={1.5} />
            {/* Projected Range band */}
            {(() => {
                const rangeHalf = 18;
                const lineLeft = ox + 10;
                const lineRight = ox + BLOCK_W - 10;
                return (
                    <>
                        <line x1={lineLeft} y1={stopped.y - rangeHalf} x2={lineRight} y2={stopped.y - rangeHalf} stroke="#60a5fa" strokeWidth={1} strokeDasharray="3,2" opacity={0.6} />
                        <line x1={lineLeft} y1={stopped.y + rangeHalf} x2={lineRight} y2={stopped.y + rangeHalf} stroke="#60a5fa" strokeWidth={1} strokeDasharray="3,2" opacity={0.6} />
                        <text x={ox + BLOCK_W - 8} y={stopped.y + 4} textAnchor="end" fontSize={FONT.min} fill="#60a5fa" opacity={0.8}>Rₚ</text>
                    </>
                );
            })()}
        </g>
    );
}

function ChannelingPath({ ox, oy }: { ox: number; oy: number }) {
    const channelX = ox + 20 + 3 * GRID_GAP_X;
    const startY = oy - 6;
    const endY = oy + BLOCK_H - 10;
    return (
        <g>
            {/* Straight deep path through channel */}
            <line x1={channelX} y1={startY} x2={channelX} y2={endY} stroke="#ef4444" strokeWidth={2} strokeDasharray="4,2" />
            {/* Arrow tip */}
            <polygon points={`${channelX - 4},${endY - 6} ${channelX + 4},${endY - 6} ${channelX},${endY}`} fill="#ef4444" />
            {/* Ion marker */}
            <circle cx={channelX} cy={endY} r={5} fill="#ef4444" stroke="#f87171" strokeWidth={1.5} />
            {/* Channel highlight */}
            <rect x={channelX - GRID_GAP_X / 2 + 2} y={oy} width={GRID_GAP_X - 4} height={BLOCK_H - 10} fill="rgba(239,68,68,0.06)" rx={3} />
            {/* Expected Rₚ band (same as normal side) */}
            {(() => {
                const expectedRpY = oy + 100;
                const rangeHalf = 18;
                const lineLeft = ox + 10;
                const lineRight = ox + BLOCK_W - 10;
                return (
                    <>
                        <line x1={lineLeft} y1={expectedRpY - rangeHalf} x2={lineRight} y2={expectedRpY - rangeHalf} stroke="#60a5fa" strokeWidth={1} strokeDasharray="3,2" opacity={0.3} />
                        <line x1={lineLeft} y1={expectedRpY + rangeHalf} x2={lineRight} y2={expectedRpY + rangeHalf} stroke="#60a5fa" strokeWidth={1} strokeDasharray="3,2" opacity={0.3} />
                        <text x={ox + BLOCK_W - 8} y={expectedRpY + 4} textAnchor="end" fontSize={FONT.min} fill="#60a5fa" opacity={0.4}>Rₚ</text>
                    </>
                );
            })()}
        </g>
    );
}

export default function ChannelingEffect() {
    const [hovered, setHovered] = useState<Side>(null);
    const normalDimmed = hovered !== null && hovered !== 'normal';
    const channelDimmed = hovered !== null && hovered !== 'channeling';

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                채널링 현상 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Normal Implant vs Channeling Effect in Crystal Lattice
            </p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 720, margin: '0 auto', display: 'block' }}>
                {/* Center divider */}
                <line x1={W / 2} y1={45} x2={W / 2} y2={BASE_Y + BLOCK_H} stroke="#3f3f46" strokeWidth={1} strokeDasharray="4,4" />

                {/* Normal side */}
                <g onMouseEnter={() => setHovered('normal')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: normalDimmed ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <rect x={leftOx} y={BASE_Y} width={BLOCK_W} height={BLOCK_H} rx={4} fill="rgba(59,130,246,0.04)" stroke="#3f3f46" strokeWidth={0.5} />
                        <LatticeGrid ox={leftOx} oy={BASE_Y} />
                        <NormalPath ox={leftOx} oy={BASE_Y} />
                        <text x={leftOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 18} textAnchor="middle" fontSize={FONT.cardHeader} fill={COLOR.textBright} fontWeight={600}>정상 주입</text>
                        <text x={leftOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 34} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>Off-axis (~7° tilt)</text>
                    </motion.g>
                </g>

                {/* Channeling side */}
                <g onMouseEnter={() => setHovered('channeling')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: channelDimmed ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <rect x={rightOx} y={BASE_Y} width={BLOCK_W} height={BLOCK_H} rx={4} fill="rgba(239,68,68,0.04)" stroke="#3f3f46" strokeWidth={0.5} />
                        <LatticeGrid ox={rightOx} oy={BASE_Y} highlight="channel" />
                        <ChannelingPath ox={rightOx} oy={BASE_Y} />
                        <text x={rightOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 18} textAnchor="middle" fontSize={FONT.cardHeader} fill={COLOR.textBright} fontWeight={600}>채널링</text>
                        <text x={rightOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 34} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>On-axis (0° — 격자 통로 정렬)</text>
                    </motion.g>
                </g>

                {/* Ion beam arrows at top */}
                <text x={leftOx + BLOCK_W / 2 + 10} y={BASE_Y - 14} textAnchor="middle" fontSize={FONT.min} fill="#3b82f6">이온 빔 ↙</text>
                <text x={rightOx + BLOCK_W / 2} y={BASE_Y - 14} textAnchor="middle" fontSize={FONT.min} fill="#ef4444">이온 빔 ↓</text>
            </svg>

            <AnimatePresence>
                {hovered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', maxWidth: 460, pointerEvents: 'none', zIndex: 10 }}>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: sideInfo[hovered].accent, marginBottom: 4 }}>
                            {sideInfo[hovered].label}
                            <span style={{ fontSize: FONT.min, fontWeight: 400, color: COLOR.textDim, marginLeft: 8 }}>{sideInfo[hovered].sub}</span>
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{sideInfo[hovered].desc}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
