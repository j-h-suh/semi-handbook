'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 요소 데이터 ─── */
type ElemId = 'lens' | 'dof' | 'wafer' | null;

interface ElemInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const ELEMS: Record<Exclude<ElemId, null>, ElemInfo> = {
    lens: { label: '투영 렌즈', sub: 'Projection Lens — NA', desc: 'NA(개구수)가 클수록 빛을 더 넓은 각도로 수집하여 해상도가 향상된다. 하지만 카메라 조리개를 크게 여는 것과 같이, 피사계 심도(DOF)가 좁아진다.', color: '#3b82f6' },
    dof: { label: '초점 심도 (DOF)', sub: 'Depth of Focus', desc: 'Best Focus를 중심으로 패턴이 정상 전사되는 허용 범위. DOF = k₂ × λ / NA². NA를 높이면 DOF가 제곱으로 감소하여, 웨이퍼 높이 관리가 극도로 중요해진다.', color: '#22c55e' },
    wafer: { label: '웨이퍼 표면', sub: 'Topography — 높낮이 변동', desc: '증착/CMP/식각이 반복되면서 표면에 국부적 단차가 생긴다. 이 높낮이 변동이 DOF 이내여야 패턴이 정상 형성. 스캐너의 레벨링 시스템이 실시간 Z축 보정.', color: '#f59e0b' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 560;
const SVG_H = 280;
const PANEL_W = 220;
const GAP = 60;
const LEFT_X = (SVG_W - PANEL_W * 2 - GAP) / 2;
const RIGHT_X = LEFT_X + PANEL_W + GAP;

const LENS_Y = 30;
const LENS_W = 100;
const LENS_H = 18;
const FOCUS_Y_LOW = 180;
const FOCUS_Y_HIGH = 160;
const WAFER_Y = 210;
const WAFER_H = 14;

function DOFPanel({ x, naLabel, naAngle, dofH, panelLabel, cx: panelCx }: {
    x: number; naLabel: string; naAngle: number; dofH: number; panelLabel: string; cx: number;
}) {
    const lensX = panelCx - LENS_W / 2;
    const focusY = WAFER_Y - 30;
    const dofTop = focusY - dofH / 2;
    const dofBot = focusY + dofH / 2;

    return (
        <g>
            {/* 렌즈 */}
            <ellipse cx={panelCx} cy={LENS_Y + LENS_H / 2} rx={LENS_W / 2} ry={LENS_H / 2}
                fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.4)" strokeWidth={1.2} />
            <text x={panelCx} y={LENS_Y - 6} textAnchor="middle" fill={COLOR.textMuted} fontSize={FONT.min}>{naLabel}</text>

            {/* 수렴 광선 */}
            <line x1={panelCx - naAngle} y1={LENS_Y + LENS_H} x2={panelCx} y2={focusY}
                stroke="rgba(251,191,36,0.3)" strokeWidth={1} />
            <line x1={panelCx + naAngle} y1={LENS_Y + LENS_H} x2={panelCx} y2={focusY}
                stroke="rgba(251,191,36,0.3)" strokeWidth={1} />
            {/* 광선 표면 영역 */}
            <polygon points={`${panelCx - naAngle},${LENS_Y + LENS_H} ${panelCx},${focusY} ${panelCx + naAngle},${LENS_Y + LENS_H}`}
                fill="rgba(251,191,36,0.06)" stroke="none" />

            {/* DOF 범위 */}
            <rect x={x + 10} y={dofTop} width={PANEL_W - 20} height={dofH} rx={4}
                fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" strokeWidth={1} strokeDasharray="4 3" />
            {/* DOF 라벨 */}
            <text x={x + PANEL_W - 14} y={focusY + 4} textAnchor="end"
                fill="rgba(34,197,94,0.6)" fontSize={FONT.min}>DOF</text>
            {/* Best Focus 라인 */}
            <line x1={x + 14} y1={focusY} x2={x + PANEL_W - 14} y2={focusY}
                stroke="rgba(239,68,68,0.4)" strokeWidth={1} strokeDasharray="3 2" />
            <text x={x + 14} y={focusY - 6} fill="rgba(239,68,68,0.5)" fontSize={FONT.min}>Best Focus</text>

            {/* 웨이퍼 (단차 포함) */}
            <path d={`M${x + 20},${WAFER_Y} l10,0 l0,-4 l15,0 l0,4 l20,0 l0,-2 l10,0 l0,2 l${PANEL_W - 95},0 l0,${WAFER_H} l-${PANEL_W - 40},0 Z`}
                fill="rgba(192,192,192,0.12)" stroke="rgba(192,192,192,0.4)" strokeWidth={0.8} />

            {/* 패널 라벨 */}
            <text x={panelCx} y={WAFER_Y + WAFER_H + 20} textAnchor="middle"
                fill={COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{panelLabel}</text>
        </g>
    );
}

export default function DOFConceptDiagram() {
    const [hovered, setHovered] = useState<ElemId>(null);
    const isDimmed = (id: Exclude<ElemId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                초점 심도 (DOF) 개념도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Depth of Focus — Low NA vs High NA
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 560)} style={{ maxWidth: '100%' }}>
                    {/* 좌: Low NA */}
                    <motion.g
                        onMouseEnter={() => setHovered('lens')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('lens') ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                        style={{ cursor: 'pointer' }}>
                        <rect x={LEFT_X} y={0} width={PANEL_W} height={SVG_H} fill="transparent" />
                        <DOFPanel x={LEFT_X} naLabel="Low NA" naAngle={30} dofH={80} panelLabel="넓은 DOF, 낮은 해상도" cx={LEFT_X + PANEL_W / 2} />
                    </motion.g>

                    {/* 우: High NA */}
                    <motion.g
                        onMouseEnter={() => setHovered('dof')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('dof') ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                        style={{ cursor: 'pointer' }}>
                        <rect x={RIGHT_X} y={0} width={PANEL_W} height={SVG_H} fill="transparent" />
                        <DOFPanel x={RIGHT_X} naLabel="High NA" naAngle={55} dofH={36} panelLabel="좁은 DOF, 높은 해상도" cx={RIGHT_X + PANEL_W / 2} />
                    </motion.g>

                    {/* vs */}
                    <text x={SVG_W / 2} y={140} textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize={20} fontWeight={700}>vs</text>
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 58 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: ELEMS[hovered].color, marginBottom: 2 }}>
                                {ELEMS[hovered].label} — {ELEMS[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {ELEMS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                좌우 패널을 호버하세요. NA가 높으면 해상도는 좋지만 DOF가 좁아지는 트레이드오프를 비교합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
