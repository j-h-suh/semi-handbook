'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 요소 데이터 ─── */
type PartId = 'pellicle' | 'particle' | 'gap' | 'mask' | null;

interface PartInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const PARTS: Record<Exclude<PartId, null>, PartInfo> = {
    pellicle: { label: '펠리클 멤브레인', sub: 'DUV: ~800nm / EUV: ~50nm', desc: '마스크에서 ~6mm 위에 프레임으로 고정된 초박막. 파티클이 마스크가 아닌 펠리클 위에 떨어지도록 유도. DUV용은 투과율 ~99%이나, EUV용은 ~88%로 빛 손실이 크다.', color: '#22c55e' },
    particle: { label: '파티클 (먼지)', sub: '초점 밖 → 전사되지 않음', desc: '클린룸에서도 파티클은 완전히 제거할 수 없다. 펠리클 위에 떨어진 파티클은 초점면에서 6mm 떨어져 있어 웨이퍼에 선명하게 전사되지 않는다. 카메라 렌즈 앞 손가락 원리와 동일.', color: '#ef4444' },
    gap: { label: '6mm 간격 (핵심)', sub: 'Defocus Distance', desc: '펠리클과 마스크 사이 ~6mm 거리가 핵심. 이 거리만큼 파티클이 초점면에서 벗어나므로, 웨이퍼에 흐릿하게만 나타나거나 아예 보이지 않는다. 물리적으로 단순하지만 효과적인 해결책.', color: '#06b6d4' },
    mask: { label: '마스크 패턴면', sub: '초점면 — Focal Plane', desc: '투영 렌즈의 초점이 정확히 맞춰진 면. 이 면 위의 패턴과 결함만이 웨이퍼에 선명하게 전사된다. 펠리클이 이 면을 파티클로부터 물리적으로 보호한다.', color: '#c084fc' },
};

const PART_ORDER: Exclude<PartId, null>[] = ['pellicle', 'particle', 'gap', 'mask'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 440;
const SVG_H = 310;
const CX = SVG_W / 2;
const W = 240;

/* 좌표 */
const LENS_Y = 20;
const LENS_H = 30;
const PEL_Y = 90;
const PEL_H = 6;
const GAP_BOT = PEL_Y + PEL_H + 100;
const MASK_Y = GAP_BOT;
const MASK_H = 24;
const STAGE_Y = MASK_Y + MASK_H + 6;
const STAGE_H = 50;

export default function PelliclePrinciple() {
    const [hovered, setHovered] = useState<PartId>(null);
    const isDimmed = (id: Exclude<PartId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                펠리클의 원리
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Pellicle — Keeping Particles Out of Focus
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={380} style={{ flexShrink: 0 }}>

                    {/* ── 투영 렌즈 (상단) ── */}
                    <ellipse cx={CX} cy={LENS_Y + LENS_H / 2} rx={60} ry={LENS_H / 2}
                        fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.25)" strokeWidth={1} />
                    <text x={CX} y={LENS_Y + LENS_H / 2 + 4} textAnchor="middle"
                        fill={COLOR.textDim} fontSize={FONT.min}>투영 렌즈</text>

                    {/* ── 빔 — 렌즈에서 마스크로 ── */}
                    <polygon points={`${CX - 30},${LENS_Y + LENS_H} ${CX + 30},${LENS_Y + LENS_H} ${CX + 60},${MASK_Y} ${CX - 60},${MASK_Y}`}
                        fill="rgba(251,191,36,0.06)" stroke="none" />
                    {/* 초점면 수렴선 */}
                    <line x1={CX - 30} y1={LENS_Y + LENS_H} x2={CX} y2={MASK_Y + MASK_H / 2}
                        stroke="rgba(251,191,36,0.15)" strokeWidth={0.8} strokeDasharray="4 3" />
                    <line x1={CX + 30} y1={LENS_Y + LENS_H} x2={CX} y2={MASK_Y + MASK_H / 2}
                        stroke="rgba(251,191,36,0.15)" strokeWidth={0.8} strokeDasharray="4 3" />

                    {/* ── 펠리클 멤브레인 ── */}
                    <motion.g onMouseEnter={() => setHovered('pellicle')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('pellicle') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - W / 2 - 4} y={PEL_Y - 8} width={W + 8} height={PEL_H + 16} fill="transparent" />
                        {/* 프레임 좌우 */}
                        <rect x={CX - W / 2 - 8} y={PEL_Y - 20} width={8} height={PEL_H + 40} rx={2}
                            fill={hovered === 'pellicle' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.06)'}
                            stroke={hovered === 'pellicle' ? '#22c55e' : 'rgba(34,197,94,0.25)'} strokeWidth={0.8} />
                        <rect x={CX + W / 2} y={PEL_Y - 20} width={8} height={PEL_H + 40} rx={2}
                            fill={hovered === 'pellicle' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.06)'}
                            stroke={hovered === 'pellicle' ? '#22c55e' : 'rgba(34,197,94,0.25)'} strokeWidth={0.8} />
                        <rect x={CX - W / 2} y={PEL_Y} width={W} height={PEL_H} rx={1}
                            fill={hovered === 'pellicle' ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.08)'}
                            stroke={hovered === 'pellicle' ? '#22c55e' : 'rgba(34,197,94,0.35)'} strokeWidth={1} />
                        <text x={CX + W / 2 + 16} y={PEL_Y + 4} fill={hovered === 'pellicle' ? '#22c55e' : COLOR.textDim} fontSize={FONT.min}>펠리클</text>
                    </motion.g>

                    {/* ── 파티클 (펠리클 위) ── */}
                    <motion.g onMouseEnter={() => setHovered('particle')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('particle') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        {/* 파티클 */}
                        {[{ x: CX - 50, r: 5 }, { x: CX + 30, r: 4 }, { x: CX + 65, r: 3 }].map((p, i) => (
                            <g key={i}>
                                <circle cx={p.x} cy={PEL_Y - p.r} r={p.r}
                                    fill={hovered === 'particle' ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.2)'}
                                    stroke={hovered === 'particle' ? '#ef4444' : 'rgba(239,68,68,0.5)'} strokeWidth={0.8} />
                            </g>
                        ))}
                        {/* 히트 영역 */}
                        <rect x={CX - W / 2} y={PEL_Y - 20} width={W} height={20} fill="transparent" />
                    </motion.g>

                    {/* ── 6mm 간격 ── */}
                    <motion.g onMouseEnter={() => setHovered('gap')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('gap') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - W / 2} y={PEL_Y + PEL_H} width={W} height={GAP_BOT - PEL_Y - PEL_H} fill="transparent" />
                        {/* 치수선 */}
                        <line x1={CX - W / 2 - 20} y1={PEL_Y + PEL_H} x2={CX - W / 2 - 20} y2={MASK_Y}
                            stroke={hovered === 'gap' ? '#06b6d4' : 'rgba(6,182,212,0.3)'} strokeWidth={1.2} />
                        <line x1={CX - W / 2 - 24} y1={PEL_Y + PEL_H} x2={CX - W / 2 - 16} y2={PEL_Y + PEL_H}
                            stroke={hovered === 'gap' ? '#06b6d4' : 'rgba(6,182,212,0.3)'} strokeWidth={1} />
                        <line x1={CX - W / 2 - 24} y1={MASK_Y} x2={CX - W / 2 - 16} y2={MASK_Y}
                            stroke={hovered === 'gap' ? '#06b6d4' : 'rgba(6,182,212,0.3)'} strokeWidth={1} />
                        <text x={CX - W / 2 - 28} y={(PEL_Y + PEL_H + MASK_Y) / 2 + 4} textAnchor="end"
                            fill={hovered === 'gap' ? '#06b6d4' : COLOR.textDim} fontSize={FONT.min} fontWeight={600}>~6mm</text>
                    </motion.g>

                    {/* ── 마스크 패턴면 ── */}
                    <motion.g onMouseEnter={() => setHovered('mask')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('mask') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - W / 2 - 10} y={MASK_Y - 4} width={W + 20} height={MASK_H + 8} fill="transparent" />
                        <rect x={CX - W / 2 - 10} y={MASK_Y} width={W + 20} height={MASK_H} rx={3}
                            fill={hovered === 'mask' ? 'rgba(192,132,252,0.12)' : 'rgba(192,132,252,0.05)'}
                            stroke={hovered === 'mask' ? '#c084fc' : 'rgba(192,132,252,0.3)'} strokeWidth={1} />
                        {/* 크롬 패턴 힌트 */}
                        {[0, 30, 55, 90, 115, 150, 165, 200].map((dx, i) => (
                            <rect key={i} x={CX - W / 2 - 5 + dx} y={MASK_Y + 3} width={i % 3 === 0 ? 16 : 10} height={MASK_H - 6} rx={1}
                                fill="rgba(192,132,252,0.08)" stroke="none" />
                        ))}
                        <text x={CX} y={MASK_Y + MASK_H / 2 + 4} textAnchor="middle"
                            fill={hovered === 'mask' ? '#c084fc' : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>마스크 패턴면 (초점면)</text>
                        <text x={CX + W / 2 + 16} y={MASK_Y + MASK_H / 2 + 4}
                            fill={hovered === 'mask' ? '#c084fc' : COLOR.textDim} fontSize={FONT.min}>← 초점</text>
                    </motion.g>

                    {/* ── 마스크 기판 ── */}
                    <rect x={CX - W / 2 - 10} y={STAGE_Y} width={W + 20} height={STAGE_H} rx={4}
                        fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)" strokeWidth={0.8} />
                    <text x={CX} y={STAGE_Y + STAGE_H / 2 + 4} textAnchor="middle"
                        fill={COLOR.textDim} fontSize={FONT.min}>석영 기판</text>
                </svg>

                {/* 우측 요소 버튼 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 200, marginTop: 20 }}>
                    {PART_ORDER.map(id => {
                        const info = PARTS[id];
                        const active = hovered === id;
                        return (
                            <motion.div key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: active || hovered === null ? 1 : 0.3 }}
                                style={{ background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${active ? info.color + '40' : 'rgba(255,255,255,0.06)'}`,
                                    borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>
                                <div style={{ fontSize: FONT.min, fontWeight: 600, color: active ? info.color : COLOR.textMuted }}>{info.label}</div>
                                <div style={{ fontSize: FONT.min, color: COLOR.textDim }}>{info.sub}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 하단 툴팁 */}
            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 62 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: PARTS[hovered].color, marginBottom: 2 }}>
                                {PARTS[hovered].label} — {PARTS[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {PARTS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 요소를 호버하세요. 파티클이 마스크가 아닌 펠리클 위에 떨어져 초점 밖에 놓이는 원리입니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
