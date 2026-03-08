'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type Side = 'dishing' | 'erosion' | null;

const sideInfo: Record<Exclude<Side, null>, { label: string; sub: string; desc: string; accent: string }> = {
    dishing: {
        label: '디싱 (Dishing)',
        sub: 'Wide Metal Recess',
        desc: '넓은 금속 영역이 주변 절연체보다 오목하게 파인다. 금속이 절연체보다 빨리 깎이기 때문이며, 넓을수록 심해진다. 다음 층과의 접촉 불량, 배선 저항 증가를 유발한다.',
        accent: '#ef4444',
    },
    erosion: {
        label: '에로전 (Erosion)',
        sub: 'Dense Pattern Thinning',
        desc: '금속 패턴이 밀집된 영역에서 절연체까지 과도하게 깎인다. 금속과 절연체가 빽빽하게 교차하는 곳에서 전체적으로 가라앉는 현상이다.',
        accent: '#f59e0b',
    },
};

/* ─── Geometry ─── */
const W = 620, H = 240;
const GAP = 50;
const BLOCK_W = (W - GAP) / 2 - 20;
const BLOCK_H = 160;
const BASE_Y = 20;
const leftOx = W / 2 - GAP / 2 - BLOCK_W;
const rightOx = W / 2 + GAP / 2;

function DishingSection({ ox }: { ox: number }) {
    const pad = 15;
    const x1 = ox + pad;
    const x2 = ox + BLOCK_W - pad;
    const midY = BASE_Y + 50;
    const subH = 40;
    const metalW = 120; // wide metal
    const metalX = (x1 + x2) / 2 - metalW / 2;
    const oxideH = 30;

    return (
        <g>
            {/* Substrate */}
            <rect x={x1} y={midY + oxideH} width={x2 - x1} height={subH} fill="#3b82f6" opacity={0.5} rx={2} />
            {/* Oxide with metal trench */}
            <rect x={x1} y={midY} width={metalX - x1} height={oxideH} fill="#8b5cf6" opacity={0.35} rx={1} />
            <rect x={metalX + metalW} y={midY} width={x2 - metalX - metalW} height={oxideH} fill="#8b5cf6" opacity={0.35} rx={1} />
            {/* Metal — dished (curved down) */}
            <path d={`M${metalX},${midY} Q${metalX + metalW / 2},${midY + 12} ${metalX + metalW},${midY} L${metalX + metalW},${midY + oxideH} L${metalX},${midY + oxideH} Z`} fill="#f59e0b" opacity={0.7} />
            {/* Ideal top line */}
            <line x1={x1} y1={midY} x2={x2} y2={midY} stroke="#22c55e" strokeWidth={1} strokeDasharray="4,2" opacity={0.5} />
            <text x={x2 + 2} y={midY + 4} fontSize={FONT.min} fill="#22c55e">이상</text>
            {/* Dishing depth arrow */}
            <line x1={metalX + metalW / 2} y1={midY} x2={metalX + metalW / 2} y2={midY + 12} stroke="#ef4444" strokeWidth={1.5} />
            <text x={metalX + metalW / 2 + 6} y={midY + 10} fontSize={FONT.min} fill="#ef4444" fontWeight={600}>디싱</text>
            {/* Labels */}
            <text x={(x1 + metalX) / 2} y={midY + oxideH / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textBright}>절연체</text>
            <text x={metalX + metalW / 2} y={midY + oxideH + 4 - 6} textAnchor="middle" fontSize={FONT.min} fill="white" fontWeight={600}>넓은 Cu</text>
        </g>
    );
}

function ErosionSection({ ox }: { ox: number }) {
    const pad = 15;
    const x1 = ox + pad;
    const x2 = ox + BLOCK_W - pad;
    const midY = BASE_Y + 50;
    const subH = 40;
    const oxideH = 30;
    const lineW = 12;
    const lineGap = 8;
    const totalLines = 8;
    const denseStart = x1 + 30;

    return (
        <g>
            {/* Substrate */}
            <rect x={x1} y={midY + oxideH} width={x2 - x1} height={subH} fill="#3b82f6" opacity={0.5} rx={2} />
            {/* Oxide base — eroded in dense area */}
            <rect x={x1} y={midY} width={denseStart - x1} height={oxideH} fill="#8b5cf6" opacity={0.35} />
            {/* Dense metal lines — eroded lower */}
            {Array.from({ length: totalLines }).map((_, i) => {
                const lx = denseStart + i * (lineW + lineGap);
                if (lx + lineW > x2 - 30) return null;
                return (
                    <g key={i}>
                        <rect x={lx} y={midY + 8} width={lineW} height={oxideH - 8} fill="#f59e0b" opacity={0.7} />
                        <rect x={lx + lineW} y={midY + 8} width={lineGap} height={oxideH - 8} fill="#8b5cf6" opacity={0.25} />
                    </g>
                );
            })}
            {/* Remaining oxide */}
            <rect x={denseStart + totalLines * (lineW + lineGap)} y={midY} width={x2 - denseStart - totalLines * (lineW + lineGap)} height={oxideH} fill="#8b5cf6" opacity={0.35} />
            {/* Ideal top line */}
            <line x1={x1} y1={midY} x2={x2} y2={midY} stroke="#22c55e" strokeWidth={1} strokeDasharray="4,2" opacity={0.5} />
            {/* Erosion depth */}
            <line x1={(denseStart + denseStart + totalLines * (lineW + lineGap)) / 2} y1={midY} x2={(denseStart + denseStart + totalLines * (lineW + lineGap)) / 2} y2={midY + 8} stroke="#f59e0b" strokeWidth={1.5} />
            <text x={(denseStart + denseStart + totalLines * (lineW + lineGap)) / 2 + 6} y={midY + 7} fontSize={FONT.min} fill="#f59e0b" fontWeight={600}>에로전</text>
            {/* Label */}
            <text x={(denseStart + denseStart + totalLines * (lineW + lineGap)) / 2} y={midY + oxideH + 14} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textBright}>밀집 패턴 영역</text>
        </g>
    );
}

export default function DishingErosion() {
    const [hovered, setHovered] = useState<Side>(null);
    const dishDim = hovered !== null && hovered !== 'dishing';
    const eroDim = hovered !== null && hovered !== 'erosion';

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                CMP 디싱과 에로전 현상
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Dishing &amp; Erosion — Pattern-Dependent Non-uniformity
            </p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 720, margin: '0 auto', display: 'block' }}>
                <line x1={W / 2} y1={BASE_Y} x2={W / 2} y2={BASE_Y + BLOCK_H} stroke="#3f3f46" strokeWidth={1} strokeDasharray="4,4" />

                <g onMouseEnter={() => setHovered('dishing')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: dishDim ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <rect x={leftOx} y={BASE_Y} width={BLOCK_W} height={BLOCK_H} rx={4} fill="rgba(239,68,68,0.03)" stroke="#3f3f46" strokeWidth={0.5} />
                        <DishingSection ox={leftOx} />
                        <text x={leftOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 18} textAnchor="middle" fontSize={FONT.cardHeader} fill={COLOR.textBright} fontWeight={600}>디싱</text>
                        <text x={leftOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 34} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>넓은 금속 → 오목하게 파임</text>
                    </motion.g>
                </g>

                <g onMouseEnter={() => setHovered('erosion')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: eroDim ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <rect x={rightOx} y={BASE_Y} width={BLOCK_W} height={BLOCK_H} rx={4} fill="rgba(245,158,11,0.03)" stroke="#3f3f46" strokeWidth={0.5} />
                        <ErosionSection ox={rightOx} />
                        <text x={rightOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 18} textAnchor="middle" fontSize={FONT.cardHeader} fill={COLOR.textBright} fontWeight={600}>에로전</text>
                        <text x={rightOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 34} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>밀집 패턴 → 전체가 가라앉음</text>
                    </motion.g>
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
