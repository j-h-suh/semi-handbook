'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type Step = 0 | 1 | 2 | 3 | 4 | 5 | null;

const steps: { label: string; sub: string; desc: string; accent: string }[] = [
    { label: '① 유전체 증착', sub: 'ILD 증착', desc: 'Low-k 절연체(SiCOH 등)를 증착한다. 배선 사이의 절연과 RC 지연 감소를 위해 유전율이 낮은 재료를 사용한다.', accent: '#8b5cf6' },
    { label: '② 트렌치 식각', sub: 'Trench 식각', desc: '포토리소+식각으로 배선 형태의 홈(Trench)을 판다. 듀얼 다마신에서는 비아(Via)와 트렌치를 한번에 식각한다.', accent: '#ef4444' },
    { label: '③ 배리어 증착', sub: 'TaN/Ta', desc: 'ALD 또는 PVD로 TaN/Ta 배리어 메탈을 증착한다. Cu가 절연체로 확산되는 것을 차단하는 방화벽 역할이다.', accent: '#71717a' },
    { label: '④ Cu 씨앗층', sub: 'Cu Seed', desc: 'PVD 스퍼터링으로 얇은 Cu 씨앗층을 깐다. 이후 전기도금의 전극 역할을 한다.', accent: '#f59e0b' },
    { label: '⑤ 전기도금', sub: 'Cu 도금', desc: '전해액에 웨이퍼를 담가 전기도금으로 홈을 Cu로 가득 채운다. 홈 밖으로도 넘치게 채워야 완전 충전이 보장된다.', accent: '#f59e0b' },
    { label: '⑥ CMP', sub: 'Cu CMP', desc: 'CMP로 홈 밖에 넘친 Cu와 배리어를 갈아내면, 홈 안에만 깔끔한 Cu 배선이 남는다.', accent: '#22c55e' },
];

/* ─── Geometry ─── */
const W = 680, H = 180;
const PAD = 20;
const STEP_COUNT = 6;
const STEP_GAP = 8;
const STEP_W = (W - 2 * PAD - (STEP_COUNT - 1) * STEP_GAP) / STEP_COUNT;
const CROSS_Y = 40;
const CROSS_H = 60;
const TRENCH_W = STEP_W * 0.4;

function StepBlock({ idx, ox }: { idx: number; ox: number }) {
    const cx = ox + STEP_W / 2;
    const trenchX = cx - TRENCH_W / 2;
    const trenchD = CROSS_H * 0.5;

    switch (idx) {
        case 0: // ILD deposition — solid block
            return <rect x={ox + 4} y={CROSS_Y} width={STEP_W - 8} height={CROSS_H} fill="#8b5cf6" opacity={0.4} rx={3} />;
        case 1: // Trench etch — block with trench cut
            return (
                <g>
                    <rect x={ox + 4} y={CROSS_Y} width={STEP_W - 8} height={CROSS_H} fill="#8b5cf6" opacity={0.4} rx={3} />
                    <rect x={trenchX} y={CROSS_Y} width={TRENCH_W} height={trenchD} fill="#18181b" rx={2} />
                </g>
            );
        case 2: // Barrier deposition — U-shape (open top)
            return (
                <g>
                    <rect x={ox + 4} y={CROSS_Y} width={STEP_W - 8} height={CROSS_H} fill="#8b5cf6" opacity={0.4} rx={3} />
                    <rect x={trenchX} y={CROSS_Y} width={TRENCH_W} height={trenchD} fill="#18181b" rx={2} />
                    {/* U-shape barrier: left wall, bottom, right wall */}
                    <path d={`M${trenchX + 2},${CROSS_Y} L${trenchX + 2},${CROSS_Y + trenchD - 2} L${trenchX + TRENCH_W - 2},${CROSS_Y + trenchD - 2} L${trenchX + TRENCH_W - 2},${CROSS_Y}`}
                        fill="none" stroke="#a1a1aa" strokeWidth={3} />
                </g>
            );
        case 3: // Cu seed layer — thinner U-shape inside barrier
            return (
                <g>
                    <rect x={ox + 4} y={CROSS_Y} width={STEP_W - 8} height={CROSS_H} fill="#8b5cf6" opacity={0.4} rx={3} />
                    <rect x={trenchX} y={CROSS_Y} width={TRENCH_W} height={trenchD} fill="#18181b" rx={2} />
                    {/* Barrier U */}
                    <path d={`M${trenchX + 2},${CROSS_Y} L${trenchX + 2},${CROSS_Y + trenchD - 2} L${trenchX + TRENCH_W - 2},${CROSS_Y + trenchD - 2} L${trenchX + TRENCH_W - 2},${CROSS_Y}`}
                        fill="none" stroke="#a1a1aa" strokeWidth={3} />
                    {/* Cu seed U (inside barrier) */}
                    <path d={`M${trenchX + 5},${CROSS_Y} L${trenchX + 5},${CROSS_Y + trenchD - 5} L${trenchX + TRENCH_W - 5},${CROSS_Y + trenchD - 5} L${trenchX + TRENCH_W - 5},${CROSS_Y}`}
                        fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.8} />
                </g>
            );
        case 4: // Electroplating — Cu fills trench and overflows
            return (
                <g>
                    <rect x={ox + 4} y={CROSS_Y} width={STEP_W - 8} height={CROSS_H} fill="#8b5cf6" opacity={0.4} rx={3} />
                    {/* Cu fills full trench */}
                    <rect x={trenchX} y={CROSS_Y} width={TRENCH_W} height={trenchD} fill="#f59e0b" opacity={0.7} rx={2} />
                    {/* Cu overflow layer on top of ILD surface */}
                    <rect x={ox + 4} y={CROSS_Y - 10} width={STEP_W - 8} height={10} fill="#f59e0b" opacity={0.7} rx={2} />
                </g>
            );
        case 5: // CMP — clean flat
            return (
                <g>
                    <rect x={ox + 4} y={CROSS_Y} width={STEP_W - 8} height={CROSS_H} fill="#8b5cf6" opacity={0.4} rx={3} />
                    <rect x={trenchX} y={CROSS_Y} width={TRENCH_W} height={trenchD} fill="#f59e0b" opacity={0.8} rx={2} />
                    {/* CMP line */}
                    <line x1={ox + 4} y1={CROSS_Y} x2={ox + STEP_W - 4} y2={CROSS_Y} stroke="#22c55e" strokeWidth={2} />
                </g>
            );
        default:
            return null;
    }
}

export default function DamasceneProcessSteps() {
    const [hovered, setHovered] = useState<Step>(null);

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                다마신(Damascene) 공정 6단계
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Cu Damascene Process — Trench First, Fill Second
            </p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 780, margin: '0 auto', display: 'block' }}>
                {steps.map((step, i) => {
                    const ox = PAD + i * (STEP_W + STEP_GAP);
                    const dimmed = hovered !== null && hovered !== i;
                    return (
                        <g key={i} onMouseEnter={() => setHovered(i as Step)} style={{ cursor: 'pointer' }}>
                            <motion.g animate={{ opacity: dimmed ? 0.25 : 1 }} transition={{ duration: 0.2 }}>
                                <StepBlock idx={i} ox={ox} />
                                {/* Step number */}
                                <text x={ox + STEP_W / 2} y={CROSS_Y + CROSS_H + 18} textAnchor="middle" fontSize={FONT.min} fill={step.accent} fontWeight={700}>
                                    {step.sub}
                                </text>
                                {/* Arrow to next */}
                                {i < 5 && (
                                    <text x={ox + STEP_W + STEP_GAP / 2} y={CROSS_Y + CROSS_H / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>→</text>
                                )}
                            </motion.g>
                        </g>
                    );
                })}

                {/* Legend */}
                <g transform={`translate(${W / 2 - 160}, ${CROSS_Y + CROSS_H + 35})`}>
                    <rect x={0} y={0} width={12} height={12} fill="#8b5cf6" opacity={0.4} rx={2} />
                    <text x={16} y={10} fontSize={FONT.min} fill={COLOR.textDim}>ILD (절연체)</text>
                    <rect x={110} y={0} width={12} height={12} fill="#f59e0b" opacity={0.8} rx={2} />
                    <text x={126} y={10} fontSize={FONT.min} fill={COLOR.textDim}>Cu (구리)</text>
                    <rect x={200} y={0} width={12} height={12} fill="#a1a1aa" opacity={0.6} rx={2} />
                    <text x={216} y={10} fontSize={FONT.min} fill={COLOR.textDim}>TaN/Ta (배리어)</text>
                </g>
            </svg>

            <AnimatePresence>
                {hovered !== null && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', maxWidth: 480, pointerEvents: 'none', zIndex: 10 }}>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: steps[hovered].accent, marginBottom: 4 }}>
                            {steps[hovered].label}
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{steps[hovered].desc}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
