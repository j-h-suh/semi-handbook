'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StepId = 1 | 2 | 3 | 4 | null;

const STEP_INFO: Record<Exclude<StepId, null>, { label: string; desc: string; color: string }> = {
    1: { label: '① 맨드릴 형성', desc: '리소+식각으로 코어 패턴(피치 2P) 생성. 목표 피치의 2배 — 단일 노광 해상도 한계 내.', color: '#3b82f6' },
    2: { label: '② 스페이서 증착 (ALD)', desc: 'ALD로 맨드릴 양 측벽에 균일 박막 증착. 스페이서 두께 t = 최종 CD. 원자층 수준 균일도가 핵심.', color: '#f59e0b' },
    3: { label: '③ 맨드릴 제거', desc: '선택적 식각으로 맨드릴만 제거. 측벽 스페이서만 남아 피치 P(원래의 1/2) 패턴 형성.', color: '#ef4444' },
    4: { label: '④ 패턴 전사', desc: '스페이서를 식각 마스크로 하부층에 패턴 전사. Self-Aligned — Overlay 오차 원천 차단.', color: '#22c55e' },
};

/* Layout constants */
const SVG_W = 600;
const PANEL_H = 110;
const GAP = 10;
const TOP_PAD = 8;
const SUB_Y = TOP_PAD + 4 * (PANEL_H + GAP);
const SVG_H = SUB_Y + 10;

/* Cross-section geometry */
const GROUND_Y = 72;
const GROUND_H = 14;
const MAND_W = 30;
const MAND_H = 36;
const SPACER_T = 8;
const MAND_PITCH = 120;
const CX = SVG_W / 2;
const MAND_POSITIONS = [-1, 0, 1].map(i => CX + i * MAND_PITCH);

const COLORS = {
    substrate: '#71717a',
    mandrel: '#3b82f6',
    spacer: '#f59e0b',
    final: '#22c55e',
};

function Panel({ step, y, hovered, setHovered }: { step: 1 | 2 | 3 | 4; y: number; hovered: StepId; setHovered: (s: StepId) => void }) {
    const active = hovered === step;
    const dimmed = hovered !== null && hovered !== step;
    const info = STEP_INFO[step];

    return (
        <motion.g
            onMouseEnter={() => setHovered(step)} onMouseLeave={() => setHovered(null)}
            animate={{ opacity: dimmed ? 0.15 : 1 }} transition={{ duration: 0.15 }}
            style={{ cursor: 'pointer' }}>
            {/* hit area */}
            <rect x={40} y={y} width={SVG_W - 80} height={PANEL_H} fill="transparent" />
            {/* panel border */}
            <rect x={60} y={y} width={SVG_W - 120} height={PANEL_H} rx={8}
                fill={active ? `${info.color}08` : 'transparent'}
                stroke={active ? `${info.color}30` : 'rgba(255,255,255,0.04)'} strokeWidth={active ? 1 : 0.5} />
            {/* step label */}
            <text x={80} y={y + 16} fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={700}>{info.label}</text>
            {/* substrate — centered on CX, skip for step 4 (custom etched profile) */}
            {step !== 4 && <rect x={CX - MAND_PITCH - MAND_W} y={y + GROUND_Y} width={2 * MAND_PITCH + 2 * MAND_W} height={GROUND_H} fill={COLORS.substrate} opacity={0.3} rx={2} />}

            {step === 1 && MAND_POSITIONS.map((mx, i) => (
                <rect key={i} x={mx - MAND_W / 2} y={y + GROUND_Y - MAND_H} width={MAND_W} height={MAND_H} fill={COLORS.mandrel} opacity={0.7} rx={2} />
            ))}
            {step === 2 && MAND_POSITIONS.map((mx, i) => (
                <g key={i}>
                    <rect x={mx - MAND_W / 2} y={y + GROUND_Y - MAND_H} width={MAND_W} height={MAND_H} fill={COLORS.mandrel} opacity={0.5} rx={2} />
                    {/* spacer left */}
                    <rect x={mx - MAND_W / 2 - SPACER_T} y={y + GROUND_Y - MAND_H} width={SPACER_T} height={MAND_H + 2} fill={COLORS.spacer} opacity={0.8} rx={1} />
                    {/* spacer right */}
                    <rect x={mx + MAND_W / 2} y={y + GROUND_Y - MAND_H} width={SPACER_T} height={MAND_H + 2} fill={COLORS.spacer} opacity={0.8} rx={1} />
                    {/* spacer top */}
                    <rect x={mx - MAND_W / 2 - SPACER_T} y={y + GROUND_Y - MAND_H - SPACER_T + 2} width={MAND_W + 2 * SPACER_T} height={SPACER_T} fill={COLORS.spacer} opacity={0.5} rx={1} />
                </g>
            ))}
            {step === 3 && MAND_POSITIONS.map((mx, i) => (
                <g key={i}>
                    {/* spacer pairs only */}
                    <rect x={mx - MAND_W / 2 - SPACER_T} y={y + GROUND_Y - MAND_H} width={SPACER_T} height={MAND_H + 2} fill={COLORS.spacer} opacity={0.8} rx={1} />
                    <rect x={mx + MAND_W / 2} y={y + GROUND_Y - MAND_H} width={SPACER_T} height={MAND_H + 2} fill={COLORS.spacer} opacity={0.8} rx={1} />
                </g>
            ))}
            {step === 4 && (() => {
                const ETCH_DEPTH = 10;
                const subL = CX - MAND_PITCH - MAND_W;
                const subR = CX + MAND_PITCH + MAND_W;
                // Collect all spacer x-positions for building trench profile
                const pillars = MAND_POSITIONS.flatMap(mx => [
                    { x: mx - MAND_W / 2 - SPACER_T, w: SPACER_T },
                    { x: mx + MAND_W / 2, w: SPACER_T },
                ]).sort((a, b) => a.x - b.x);
                return (
                    <g>
                        {/* Bottom base (etched level) */}
                        <rect x={subL} y={y + GROUND_Y + ETCH_DEPTH} width={subR - subL} height={GROUND_H - 2} fill={COLORS.substrate} opacity={0.12} rx={1} />
                        {/* Pillars: un-etched substrate under each spacer */}
                        {pillars.map((p, i) => (
                            <rect key={i} x={p.x} y={y + GROUND_Y} width={p.w} height={GROUND_H + ETCH_DEPTH - 2} fill={COLORS.substrate} opacity={0.5} rx={1} />
                        ))}
                    </g>
                );
            })()}

            {/* pitch annotation */}
            {step === 1 && (
                <g>
                    <line x1={MAND_POSITIONS[0]} y1={y + GROUND_Y + GROUND_H + 4} x2={MAND_POSITIONS[1]} y2={y + GROUND_Y + GROUND_H + 4} stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                    <text x={(MAND_POSITIONS[0] + MAND_POSITIONS[1]) / 2} y={y + GROUND_Y + GROUND_H + 14} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={FONT.min}>2P</text>
                </g>
            )}
            {step === 3 && (
                <g>
                    <line x1={MAND_POSITIONS[0] - MAND_W / 2 - SPACER_T / 2} y1={y + GROUND_Y + GROUND_H + 4} x2={MAND_POSITIONS[0] + MAND_W / 2 + SPACER_T / 2} y2={y + GROUND_Y + GROUND_H + 4} stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                    <text x={MAND_POSITIONS[0]} y={y + GROUND_Y + GROUND_H + 14} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={FONT.min}>P</text>
                </g>
            )}
        </motion.g>
    );
}

export default function SADP4StepCrossSection() {
    const [hovered, setHovered] = useState<StepId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                SADP 공정 4단계 단면도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                맨드릴 → 스페이서 증착 → 맨드릴 제거 → 패턴 전사 (피치 2P → P)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {([1, 2, 3, 4] as const).map((step, i) => (
                        <Panel key={step} step={step} y={TOP_PAD + i * (PANEL_H + GAP)} hovered={hovered} setHovered={setHovered} />
                    ))}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STEP_INFO[hovered].color, marginBottom: 2 }}>{STEP_INFO[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{STEP_INFO[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. 맨드릴 측벽에 스페이서가 자기정렬되어 피치가 2P→P로 줄어드는 과정입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
