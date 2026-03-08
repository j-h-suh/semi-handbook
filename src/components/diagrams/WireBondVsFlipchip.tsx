'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type Side = 'wire' | 'flip' | null;

const sideInfo: Record<Exclude<Side, null>, { label: string; sub: string; desc: string; accent: string }> = {
    wire: {
        label: '와이어 본딩 (Wire Bonding)',
        sub: 'Traditional, Low Cost',
        desc: '금(Au) 또는 구리(Cu) 와이어로 다이 패드와 리드프레임을 연결한다. 저렴하고 유연하지만, 와이어 길이가 길어 기생 인덕턴스가 높고 고속 신호에 불리하다.',
        accent: '#3b82f6',
    },
    flip: {
        label: '플립칩 (Flip Chip)',
        sub: 'High Performance, Short Path',
        desc: '다이를 뒤집어 범프(솔더볼)로 기판에 직접 연결한다. 경로가 극도로 짧아 고속 신호에 유리하고, 다이 전면에 I/O 배치가 가능하여 고밀도 연결을 달성한다.',
        accent: '#f59e0b',
    },
};

/* ─── Geometry ─── */
const W = 620, H = 210;
const GAP = 40;
const BLOCK_W = (W - GAP) / 2 - 20;
const BLOCK_H = 130;
const BASE_Y = 10;

/* Sub-geometry constants */
const DIE_W = BLOCK_W * 0.5;
const DIE_H = 20;
const SUBSTRATE_W = BLOCK_W - 20;
const SUBSTRATE_H = 18;
const MOLD_PAD = 6;

/* ─── Wire Bonding Section ─── */
function WireBondSection({ ox }: { ox: number }) {
    const cx = ox + BLOCK_W / 2;
    const padX = 10;
    const dieX = cx - DIE_W / 2;
    const dieY = BASE_Y + 45;
    const substrateX = cx - SUBSTRATE_W / 2;
    const substrateY = dieY + DIE_H + 30;
    const wireCount = 5;

    return (
        <g>
            {/* Molding outline */}
            <rect x={ox + padX} y={BASE_Y + 30} width={BLOCK_W - 2 * padX} height={BLOCK_H - 30}
                fill="rgba(255,255,255,0.03)" stroke="#3f3f46" strokeWidth={0.5} rx={4} />
            {/* Die */}
            <rect x={dieX} y={dieY} width={DIE_W} height={DIE_H} fill="#3b82f6" opacity={0.6} rx={2} />
            <text x={cx} y={dieY + DIE_H / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill="white" fontWeight={600}>Die</text>
            {/* Substrate / Lead frame */}
            <rect x={substrateX} y={substrateY} width={SUBSTRATE_W} height={SUBSTRATE_H} fill="#71717a" opacity={0.4} rx={2} />
            <text x={cx} y={substrateY + SUBSTRATE_H / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>리드프레임</text>
            {/* Die attach layer */}
            <rect x={dieX + 10} y={dieY + DIE_H} width={DIE_W - 20} height={4} fill="#a1a1aa" opacity={0.3} />
            {/* Mount block under die */}
            <rect x={cx - 20} y={dieY + DIE_H + 4} width={40} height={substrateY - dieY - DIE_H - 4} fill="#52525b" opacity={0.3} rx={1} />
            {/* Wire bonds — curves from die pad to substrate */}
            {Array.from({ length: wireCount }).map((_, i) => {
                const t = (i + 1) / (wireCount + 1);
                const padDie = dieX + t * DIE_W;
                const padSub = substrateX + t * SUBSTRATE_W;
                const arcH = 18 + Math.abs(t - 0.5) * 12;
                return (
                    <path key={i}
                        d={`M${padDie},${dieY} Q${(padDie + padSub) / 2},${dieY - arcH} ${padSub},${substrateY}`}
                        fill="none" stroke="#f59e0b" strokeWidth={1.2} opacity={0.7} />
                );
            })}
        </g>
    );
}

/* ─── Flip Chip Section ─── */
function FlipChipSection({ ox }: { ox: number }) {
    const cx = ox + BLOCK_W / 2;
    const padX = 10;
    const substrateX = cx - SUBSTRATE_W / 2;
    const substrateY = BASE_Y + BLOCK_H - 15 - SUBSTRATE_H;
    const dieX = cx - DIE_W / 2;
    const dieY = substrateY - 25;
    const bumpCount = 7;
    const bumpR = 3;

    return (
        <g>
            {/* Molding outline */}
            <rect x={ox + padX} y={BASE_Y + 30} width={BLOCK_W - 2 * padX} height={BLOCK_H - 30}
                fill="rgba(255,255,255,0.03)" stroke="#3f3f46" strokeWidth={0.5} rx={4} />
            {/* Die (flipped — active side faces down) */}
            <rect x={dieX} y={dieY} width={DIE_W} height={DIE_H} fill="#f59e0b" opacity={0.6} rx={2} />
            <text x={cx} y={dieY + DIE_H / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill="white" fontWeight={600}>Die ↓</text>
            {/* Bumps */}
            {Array.from({ length: bumpCount }).map((_, i) => {
                const t = (i + 1) / (bumpCount + 1);
                const bx = dieX + t * DIE_W;
                return (
                    <g key={i}>
                        <circle cx={bx} cy={dieY + DIE_H + bumpR + 2} r={bumpR} fill="#f59e0b" opacity={0.8} />
                    </g>
                );
            })}
            {/* Underfill area */}
            <rect x={dieX} y={dieY + DIE_H} width={DIE_W} height={substrateY - dieY - DIE_H}
                fill="rgba(139,92,246,0.35)" rx={1} />
            {/* Substrate */}
            <rect x={substrateX} y={substrateY} width={SUBSTRATE_W} height={SUBSTRATE_H} fill="#71717a" opacity={0.4} rx={2} />
            <text x={cx} y={substrateY + SUBSTRATE_H / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>패키지 기판</text>
        </g>
    );
}

export default function WireBondVsFlipchip() {
    const [hovered, setHovered] = useState<Side>(null);
    const leftOx = W / 2 - GAP / 2 - BLOCK_W;
    const rightOx = W / 2 + GAP / 2;
    const wireDim = hovered !== null && hovered !== 'wire';
    const flipDim = hovered !== null && hovered !== 'flip';

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                와이어 본딩 vs 플립칩 단면 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Wire Bonding vs Flip Chip — Cross-Section Comparison
            </p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 720, margin: '0 auto', display: 'block' }}>
                <line x1={W / 2} y1={BASE_Y + 10} x2={W / 2} y2={BASE_Y + BLOCK_H + 10} stroke="#3f3f46" strokeWidth={1} strokeDasharray="4,4" />

                <g onMouseEnter={() => setHovered('wire')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: wireDim ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <WireBondSection ox={leftOx} />
                        <text x={leftOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 18} textAnchor="middle" fontSize={FONT.body} fill="#3b82f6" fontWeight={600}>와이어 본딩</text>
                        <text x={leftOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 32} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>긴 경로, 낮은 비용</text>
                    </motion.g>
                </g>

                <g onMouseEnter={() => setHovered('flip')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: flipDim ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <FlipChipSection ox={rightOx} />
                        <text x={rightOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 18} textAnchor="middle" fontSize={FONT.body} fill="#f59e0b" fontWeight={600}>플립칩</text>
                        <text x={rightOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 32} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>짧은 경로, 고성능</text>
                    </motion.g>
                </g>

                {/* Legend */}
                <g transform={`translate(${W / 2 - 130}, ${H - 16})`}>
                    <circle cx={6} cy={0} r={4} fill="#f59e0b" opacity={0.8} />
                    <text x={14} y={4} fontSize={FONT.min} fill={COLOR.textDim}>범프/와이어</text>
                    <rect x={100} y={-4} width={12} height={8} fill="#71717a" opacity={0.4} rx={1} />
                    <text x={116} y={4} fontSize={FONT.min} fill={COLOR.textDim}>기판</text>
                    <rect x={160} y={-4} width={12} height={8} fill="rgba(139,92,246,0.4)" rx={1} />
                    <text x={176} y={4} fontSize={FONT.min} fill={COLOR.textDim}>언더필</text>
                </g>
            </svg>

            <AnimatePresence>
                {hovered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', maxWidth: 480, pointerEvents: 'none', zIndex: 10 }}>
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
