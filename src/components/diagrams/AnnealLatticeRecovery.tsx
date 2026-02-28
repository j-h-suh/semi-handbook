'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type Side = 'before' | 'after' | null;

const sideInfo: Record<Exclude<Side, null>, { label: string; sub: string; desc: string; accent: string }> = {
    before: {
        label: '주입 직후',
        sub: 'As-Implanted (Damaged)',
        desc: '격자 원자가 충돌로 제자리에서 밀려나 결정 구조가 깨진 상태(Amorphous). 불순물 원자는 격자 사이 빈 공간(Interstitial Site)에 끼어 전기적으로 비활성 상태다.',
        accent: '#ef4444',
    },
    after: {
        label: '어닐링 후',
        sub: 'Post-Anneal (Recovered)',
        desc: '고온 열처리로 격자 원자가 원래 위치로 복귀하고(재결정화), 불순물 원자가 치환 자리(Substitutional Site)에 안착하여 전기적으로 활성화된다.',
        accent: '#22c55e',
    },
};

/* ─── Geometry ─── */
const W = 620, H = 300;
const ATOM_R = 5;
const GRID_COLS = 7, GRID_ROWS = 7;
const GRID_GAP = 22;
const GAP = 40;
const BLOCK_W = (GRID_COLS - 1) * GRID_GAP + 2 * 20;    // 132 + 40 = 172
const BLOCK_H = (GRID_ROWS - 1) * GRID_GAP + 2 * 15;    // 132 + 30 = 162
const BASE_Y = 60;

const leftOx = W / 2 - GAP / 2 - BLOCK_W;
const rightOx = W / 2 + GAP / 2;

/* Displaced atom offsets for the "before" side */
const displaced = new Set([
    '1-3', '2-2', '2-4', '3-3', '3-5', '4-2', '4-3', '4-4', '5-3', '5-4'
]);
const displacementMap: Record<string, { dx: number; dy: number }> = {
    '1-3': { dx: 4, dy: -5 }, '2-2': { dx: -6, dy: 3 }, '2-4': { dx: 5, dy: 4 },
    '3-3': { dx: -3, dy: -6 }, '3-5': { dx: 7, dy: -2 }, '4-2': { dx: -5, dy: 5 },
    '4-3': { dx: 6, dy: -4 }, '4-4': { dx: -4, dy: 6 }, '5-3': { dx: 3, dy: 5 },
    '5-4': { dx: -6, dy: -3 },
};

/* Dopant positions */
const dopants = ['2-3', '3-4', '4-3', '5-3'];

function LatticeBlock({ ox, mode }: { ox: number; mode: 'before' | 'after' }) {
    const atoms: React.ReactNode[] = [];
    const startX = ox + 20;
    const startY = BASE_Y + 15;

    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const key = `${r}-${c}`;
            let cx = startX + c * GRID_GAP;
            let cy = startY + r * GRID_GAP;
            const isDopant = dopants.includes(key);
            const isDisplaced = displaced.has(key);

            if (mode === 'before' && isDisplaced && !isDopant) {
                const d = displacementMap[key] || { dx: 0, dy: 0 };
                cx += d.dx;
                cy += d.dy;
            }

            if (isDopant) {
                // Dopant atom: different color + position depending on mode
                const dopantCx = mode === 'before' ? cx + 6 : cx;
                const dopantCy = mode === 'before' ? cy + 5 : cy;
                atoms.push(
                    <circle key={`d-${key}`} cx={dopantCx} cy={dopantCy} r={ATOM_R + 1}
                        fill={mode === 'before' ? '#f59e0b' : '#22c55e'}
                        stroke={mode === 'before' ? '#fbbf24' : '#4ade80'}
                        strokeWidth={1.2} opacity={0.9}
                    />
                );
            } else {
                const fill = mode === 'before' && isDisplaced ? '#71717a' : '#52525b';
                const strokeCol = mode === 'before' && isDisplaced ? '#a1a1aa' : '#3f3f46';
                atoms.push(
                    <circle key={key} cx={cx} cy={cy} r={ATOM_R}
                        fill={fill} stroke={strokeCol} strokeWidth={0.5}
                    />
                );
            }
        }
    }

    return <g>{atoms}</g>;
}

export default function AnnealLatticeRecovery() {
    const [hovered, setHovered] = useState<Side>(null);
    const beforeDimmed = hovered !== null && hovered !== 'before';
    const afterDimmed = hovered !== null && hovered !== 'after';

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                어닐링 전후 격자 구조 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Lattice Recovery &amp; Dopant Activation After Annealing
            </p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 720, margin: '0 auto', display: 'block' }}>
                {/* Center divider */}
                <line x1={W / 2} y1={BASE_Y} x2={W / 2} y2={BASE_Y + BLOCK_H} stroke="#3f3f46" strokeWidth={1} strokeDasharray="4,4" />

                {/* Arrow between titles */}
                <text x={W / 2} y={BASE_Y - 10} textAnchor="middle" fontSize={FONT.body} fill={COLOR.textDim}>→ 어닐링 →</text>

                {/* Before side */}
                <g onMouseEnter={() => setHovered('before')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: beforeDimmed ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <rect x={leftOx} y={BASE_Y} width={BLOCK_W} height={BLOCK_H} rx={4} fill="rgba(239,68,68,0.04)" stroke="#3f3f46" strokeWidth={0.5} />
                        <LatticeBlock ox={leftOx} mode="before" />
                        {/* Damage zone indicator */}
                        <rect x={leftOx + 20 + 1.5 * GRID_GAP} y={BASE_Y + 15 + 0.5 * GRID_GAP} width={3 * GRID_GAP} height={5 * GRID_GAP} rx={6} fill="none" stroke="#ef4444" strokeWidth={1} strokeDasharray="4,2" opacity={0.5} />
                        <text x={leftOx + BLOCK_W / 2} y={BASE_Y - 10} textAnchor="middle" fontSize={FONT.cardHeader} fill={COLOR.textBright} fontWeight={600}>주입 직후</text>
                    </motion.g>
                </g>

                {/* After side */}
                <g onMouseEnter={() => setHovered('after')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: afterDimmed ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <rect x={rightOx} y={BASE_Y} width={BLOCK_W} height={BLOCK_H} rx={4} fill="rgba(34,197,94,0.04)" stroke="#3f3f46" strokeWidth={0.5} />
                        <LatticeBlock ox={rightOx} mode="after" />
                        <text x={rightOx + BLOCK_W / 2} y={BASE_Y - 10} textAnchor="middle" fontSize={FONT.cardHeader} fill={COLOR.textBright} fontWeight={600}>어닐링 후</text>
                    </motion.g>
                </g>

                {/*Legend */}
                <g transform={`translate(${W / 2 - 110}, ${BASE_Y + BLOCK_H + 30})`}>
                    <circle cx={6} cy={5} r={5} fill="#52525b" stroke="#3f3f46" strokeWidth={0.5} />
                    <text x={16} y={9} fontSize={FONT.min} fill={COLOR.textDim}>Si 격자</text>
                    <circle cx={76} cy={5} r={5} fill="#f59e0b" stroke="#fbbf24" strokeWidth={1} />
                    <text x={86} y={9} fontSize={FONT.min} fill={COLOR.textDim}>비활성 불순물</text>
                    <circle cx={186} cy={5} r={5} fill="#22c55e" stroke="#4ade80" strokeWidth={1} />
                    <text x={196} y={9} fontSize={FONT.min} fill={COLOR.textDim}>활성 불순물</text>
                </g>
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
