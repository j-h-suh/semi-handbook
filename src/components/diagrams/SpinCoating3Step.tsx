'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 단계 데이터 ─── */
type StepId = 'dispense' | 'spin' | 'ebr' | null;

interface StepInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const STEPS: Record<Exclude<StepId, null>, StepInfo> = {
    dispense: { label: '① 디스펜스', sub: 'Dispense 1~2mL', desc: '노즐에서 PR 용액 1~2mL을 웨이퍼 중앙에 적하. 웨이퍼는 정지 또는 저속 회전(~500rpm) 상태. 300mm 웨이퍼 전체를 덮기에는 부족한 양이지만, 이후 고속 회전으로 퍼진다.', color: '#f59e0b' },
    spin: { label: '② 고속 회전', sub: '3,000~5,000 rpm', desc: '원심력에 의해 PR 용액이 바깥으로 균일하게 퍼진다. 여분의 용액은 가장자리에서 비산. 막 두께는 회전 속도의 제곱근에 반비례(두께 ∝ 1/√rpm). 회전이 빠를수록 얇은 막.', color: '#3b82f6' },
    ebr: { label: '③ 균일 박막 + EBR', sub: 'Edge Bead Removal', desc: '균일한 PR 박막 형성 완료. ArF: 80~150nm, EUV: 30~50nm. 가장자리에 두껍게 쌓인 Edge Bead를 용매로 제거(EBR). 균일도 목표: 300mm 웨이퍼에서 ±1nm.', color: '#22c55e' },
};

const STEP_ORDER: Exclude<StepId, null>[] = ['dispense', 'spin', 'ebr'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 600;
const SVG_H = 180;
const PANEL_W = 160;
const PANEL_GAP = 20;
const TOTAL_W = PANEL_W * 3 + PANEL_GAP * 2;
const START_X = (SVG_W - TOTAL_W) / 2;

const WAFER_Y = 90;
const WAFER_H = 12;
const WAFER_W = 120;
const PR_H = 20;

function DispensePanel({ x, active }: { x: number; active: boolean }) {
    const cx = x + PANEL_W / 2;
    const wx = cx - WAFER_W / 2;
    const nozzleX = cx;
    const nozzleY = WAFER_Y - PR_H - 20;

    return (
        <g>
            {/* 웨이퍼 */}
            <rect x={wx} y={WAFER_Y} width={WAFER_W} height={WAFER_H} rx={2}
                fill="rgba(192,192,192,0.15)" stroke="rgba(192,192,192,0.4)" strokeWidth={0.8} />
            {/* 노즐 */}
            <rect x={nozzleX - 4} y={nozzleY - 20} width={8} height={20} rx={1}
                fill={active ? 'rgba(113,113,122,0.4)' : 'rgba(113,113,122,0.2)'}
                stroke={active ? '#71717a' : 'rgba(113,113,122,0.4)'} strokeWidth={0.8} />
            {/* PR 방울 */}
            <ellipse cx={nozzleX} cy={WAFER_Y - PR_H / 2 - 2} rx={16} ry={PR_H / 2}
                fill={active ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.15)'}
                stroke={active ? '#f59e0b' : 'rgba(245,158,11,0.4)'} strokeWidth={0.8} />
            {/* 적하선 */}
            <line x1={nozzleX} y1={nozzleY} x2={nozzleX} y2={WAFER_Y - PR_H - 2}
                stroke="rgba(245,158,11,0.4)" strokeWidth={1} strokeDasharray="3 2" />
        </g>
    );
}

function SpinPanel({ x, active }: { x: number; active: boolean }) {
    const cx = x + PANEL_W / 2;
    const wx = cx - WAFER_W / 2;

    return (
        <g>
            {/* 웨이퍼 */}
            <rect x={wx} y={WAFER_Y} width={WAFER_W} height={WAFER_H} rx={2}
                fill="rgba(192,192,192,0.15)" stroke="rgba(192,192,192,0.4)" strokeWidth={0.8} />
            {/* PR 확산 (넓은 막) */}
            <rect x={wx} y={WAFER_Y - 6} width={WAFER_W} height={6} rx={1}
                fill={active ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.12)'}
                stroke={active ? '#3b82f6' : 'rgba(59,130,246,0.3)'} strokeWidth={0.8} />
            {/* 확산 화살표 좌우 */}
            {[-1, 1].map(dir => (
                <g key={dir}>
                    <line x1={cx + dir * 30} y1={WAFER_Y - 24} x2={cx + dir * 55} y2={WAFER_Y - 24}
                        stroke="rgba(59,130,246,0.4)" strokeWidth={1} />
                    <polygon points={`${cx + dir * 53},${WAFER_Y - 27} ${cx + dir * 58},${WAFER_Y - 24} ${cx + dir * 53},${WAFER_Y - 21}`}
                        fill="rgba(59,130,246,0.4)" />
                </g>
            ))}
            {/* 회전 표시 */}
            <text x={cx} y={WAFER_Y + WAFER_H + 16} textAnchor="middle"
                fill={active ? '#3b82f6' : COLOR.textDim} fontSize={FONT.min}>↻ rpm</text>
            {/* 비산 방울 */}
            {[{ dx: -(WAFER_W / 2 - 4), dy: -7 }, { dx: (WAFER_W / 2 - 4), dy: -7 }].map((p, i) => (
                <circle key={i} cx={cx + p.dx} cy={WAFER_Y + p.dy} r={7}
                    fill="rgba(59,130,246,0.4)" />
            ))}
        </g>
    );
}

function EBRPanel({ x, active }: { x: number; active: boolean }) {
    const cx = x + PANEL_W / 2;
    const wx = cx - WAFER_W / 2;

    return (
        <g>
            {/* 웨이퍼 */}
            <rect x={wx} y={WAFER_Y} width={WAFER_W} height={WAFER_H} rx={2}
                fill="rgba(192,192,192,0.15)" stroke="rgba(192,192,192,0.4)" strokeWidth={0.8} />
            {/* 균일 PR 막 */}
            <rect x={wx + 10} y={WAFER_Y - 6} width={WAFER_W - 20} height={6} rx={1}
                fill={active ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.12)'}
                stroke={active ? '#3b82f6' : 'rgba(59,130,246,0.3)'} strokeWidth={0.8} />
            {/* EBR 표시 (가장자리 제거) */}
            {[-1, 1].map(dir => (
                <text key={dir} x={cx + dir * (WAFER_W / 2 + 8)} y={WAFER_Y - 6} textAnchor="middle"
                    fill={active ? '#ef4444' : 'rgba(239,68,68,0.7)'} fontSize={FONT.min}>✕</text>
            ))}
            {/* 두께 표시 */}
            <text x={cx} y={WAFER_Y - 12} textAnchor="middle"
                fill={active ? '#22c55e' : COLOR.textDim} fontSize={FONT.min}>80~150nm</text>
        </g>
    );
}

export default function SpinCoating3Step() {
    const [hovered, setHovered] = useState<StepId>(null);
    const isDimmed = (id: Exclude<StepId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                스핀 코팅 과정
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Spin Coating — Dispense → Spin → Uniform Film + EBR
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 600)} style={{ maxWidth: '100%' }}>
                    {STEP_ORDER.map((id, i) => {
                        const x = START_X + i * (PANEL_W + PANEL_GAP);
                        const PanelComp = i === 0 ? DispensePanel : i === 1 ? SpinPanel : EBRPanel;
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDimmed(id) ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={x} y={0} width={PANEL_W} height={SVG_H} fill="transparent" />
                                <PanelComp x={x} active={hovered === id} />
                                <text x={x + PANEL_W / 2} y={WAFER_Y + WAFER_H + 34} textAnchor="middle"
                                    fill={hovered === id ? STEPS[id].color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>
                                    {STEPS[id].label}
                                </text>
                            </motion.g>
                        );
                    })}

                    {/* 단계 간 화살표 */}
                    {[0, 1].map(i => {
                        const fromX = START_X + (i + 1) * PANEL_W + i * PANEL_GAP + PANEL_GAP * 0.1;
                        const toX = START_X + (i + 1) * (PANEL_W + PANEL_GAP) - PANEL_GAP * 0.1;
                        const ay = WAFER_Y;
                        return (
                            <g key={i}>
                                <line x1={fromX} y1={ay} x2={toX} y2={ay}
                                    stroke={COLOR.textDim} strokeWidth={0.8} />
                                <polygon points={`${toX - 4},${ay - 3} ${toX},${ay} ${toX - 4},${ay + 3}`}
                                    fill={COLOR.textDim} />
                            </g>
                        );
                    })}

                    {/* 공식 */}
                    <text x={SVG_W / 2} y={SVG_H - 6} textAnchor="middle"
                        fill={COLOR.textDim} fontSize={FONT.min}>두께 ∝ 1/√rpm</text>
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STEPS[hovered].color, marginBottom: 2 }}>
                                {STEPS[hovered].label} — {STEPS[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {STEPS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 단계를 호버하세요. 웨이퍼 중앙에 적하한 PR이 고속 회전으로 균일하게 퍼집니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
