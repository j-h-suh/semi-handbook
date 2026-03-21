'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 ─── */
type ActId = 'exposure' | 'peb' | 'development' | null;

interface ActInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const ACTS: Record<Exclude<ActId, null>, ActInfo> = {
    exposure: {
        label: '제1막: 노광', sub: 'Exposure — 스캐너에서',
        desc: '마스크를 통과한 빛(hν)이 레지스트 내 PAG(Photo-Acid Generator)를 분해하여 산(H⁺)을 생성한다. 광자 하나가 PAG 하나를 분해 → 산 하나. 이 단계에서 생성되는 산의 양은 적다.',
        color: '#f59e0b',
    },
    peb: {
        label: '제2막: PEB (증폭)', sub: 'Post-Exposure Bake — 핫플레이트에서',
        desc: '열에 의해 산이 확산하며 주변 수지의 보호기를 촉매 반응으로 연쇄 제거. 산은 소모되지 않고 재생 — 하나의 산이 수십~수백 개의 보호기를 제거. 이것이 "화학 증폭"의 본질. PEB 온도가 CD를 지배.',
        color: '#ef4444',
    },
    development: {
        label: '제3막: 현상', sub: 'Development — TMAH 2.38%',
        desc: '보호기가 제거된 수지는 극성 변화(소수성→친수성)로 TMAH 현상액에 녹는다. 보호기가 남은 수지는 녹지 않는다. 이 용해도 차이가 패턴을 형성.',
        color: '#3b82f6',
    },
};

const ACT_ORDER: Exclude<ActId, null>[] = ['exposure', 'peb', 'development'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 700;
const SVG_H = 230;
const PANEL_W = 200;
const PANEL_GAP = 24;
const TOTAL_W = PANEL_W * 3 + PANEL_GAP * 2;
const START_X = (SVG_W - TOTAL_W) / 2;

const BOX_Y = 30;
const BOX_H = 140;
const ICON_CY = BOX_Y + 42;
const TEXT_Y1 = BOX_Y + 85;
const TEXT_Y2 = BOX_Y + 102;
const TEXT_Y3 = BOX_Y + 119;

function ExposurePanel({ x, active }: { x: number; active: boolean }) {
    const cx = x + PANEL_W / 2;
    return (
        <g>
            {/* hν 빛 */}
            <line x1={cx} y1={BOX_Y - 8} x2={cx} y2={ICON_CY - 12}
                stroke="rgba(251,191,36,0.5)" strokeWidth={1} />
            <text x={cx} y={BOX_Y - 12} textAnchor="middle"
                fill="rgba(251,191,36,0.6)" fontSize={FONT.min}>hν</text>

            {/* PAG 분자 */}
            <circle cx={cx - 24} cy={ICON_CY} r={14}
                fill={active ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.1)'}
                stroke={active ? '#f59e0b' : 'rgba(245,158,11,0.4)'} strokeWidth={1.5} />
            <text x={cx - 24} y={ICON_CY + 5} textAnchor="middle"
                fill={active ? '#f59e0b' : COLOR.textDim} fontSize={FONT.min} fontWeight={700}>PAG</text>

            {/* 화살표 */}
            <line x1={cx - 6} y1={ICON_CY} x2={cx + 10} y2={ICON_CY}
                stroke={COLOR.textDim} strokeWidth={1.2} />
            <polygon points={`${cx + 8},${ICON_CY - 4} ${cx + 14},${ICON_CY} ${cx + 8},${ICON_CY + 4}`}
                fill={COLOR.textDim} />

            {/* H⁺ 산 */}
            <circle cx={cx + 28} cy={ICON_CY} r={14}
                fill={active ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.1)'}
                stroke={active ? '#ef4444' : 'rgba(239,68,68,0.4)'} strokeWidth={1.5} />
            <text x={cx + 28} y={ICON_CY + 5} textAnchor="middle"
                fill={active ? '#ef4444' : COLOR.textDim} fontSize={FONT.min} fontWeight={700}>H⁺</text>

            {/* 설명 */}
            <text x={cx} y={TEXT_Y1} textAnchor="middle" fill={COLOR.textMuted} fontSize={FONT.min}>광자 → PAG 분해</text>
            <text x={cx} y={TEXT_Y2} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>→ 산(H⁺) 생성</text>
            <text x={cx} y={TEXT_Y3} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>(소량)</text>
        </g>
    );
}

function PEBPanel({ x, active }: { x: number; active: boolean }) {
    const cx = x + PANEL_W / 2;
    return (
        <g>
            {/* 열 표시 */}
            <text x={cx} y={BOX_Y - 12} textAnchor="middle"
                fill="rgba(239,68,68,0.6)" fontSize={FONT.min}>🔥 열 (PEB)</text>

            {/* 산 촉매 연쇄 반응 */}
            <circle cx={cx - 40} cy={ICON_CY} r={12}
                fill={active ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.1)'}
                stroke={active ? '#ef4444' : 'rgba(239,68,68,0.4)'} strokeWidth={1.5} />
            <text x={cx - 40} y={ICON_CY + 5} textAnchor="middle"
                fill={active ? '#ef4444' : COLOR.textDim} fontSize={FONT.min} fontWeight={700}>H⁺</text>

            {/* 화살표 */}
            <line x1={cx - 25} y1={ICON_CY} x2={cx - 16} y2={ICON_CY}
                stroke={COLOR.textDim} strokeWidth={1} />
            <polygon points={`${cx - 18},${ICON_CY - 3} ${cx - 13},${ICON_CY} ${cx - 18},${ICON_CY + 3}`}
                fill={COLOR.textDim} />

            {/* 보호기들 */}
            {[0, 24, 48].map((dx, i) => (
                <g key={i}>
                    <rect x={cx - 10 + dx} y={ICON_CY - 10} width={20} height={20} rx={3}
                        fill={active ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.08)'}
                        stroke={active ? '#22c55e' : 'rgba(34,197,94,0.3)'} strokeWidth={1} />
                    <text x={cx + dx} y={ICON_CY + 5} textAnchor="middle"
                        fill={active ? '#22c55e' : COLOR.textDim} fontSize={FONT.min}>P</text>
                </g>
            ))}


            {/* 설명 */}
            <text x={cx} y={TEXT_Y1} textAnchor="middle" fill={COLOR.textMuted} fontSize={FONT.min}>1개 H⁺ → 수백 개</text>
            <text x={cx} y={TEXT_Y2} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>보호기(P) 제거</text>
            <text x={cx} y={TEXT_Y3} textAnchor="middle" fill="#ef4444" fontSize={FONT.min} fontWeight={600}>화학 증폭!</text>
        </g>
    );
}

function DevelopmentPanel({ x, active }: { x: number; active: boolean }) {
    const cx = x + PANEL_W / 2;
    return (
        <g>
            <text x={cx} y={BOX_Y - 12} textAnchor="middle"
                fill="rgba(59,130,246,0.6)" fontSize={FONT.min}>TMAH 현상액</text>

            {/* 녹는 부분 (보호기 없음) */}
            <rect x={cx - 48} y={ICON_CY - 16} width={40} height={32} rx={4}
                fill={active ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.06)'}
                stroke={active ? '#3b82f6' : 'rgba(59,130,246,0.3)'} strokeWidth={1.2}
                strokeDasharray="4 3" />
            <text x={cx - 28} y={ICON_CY + 5} textAnchor="middle"
                fill={active ? '#3b82f6' : COLOR.textDim} fontSize={FONT.min}>용해</text>

            {/* vs */}
            <text x={cx} y={ICON_CY + 5} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>vs</text>

            {/* 안 녹는 부분 (보호기 있음) */}
            <rect x={cx + 8} y={ICON_CY - 16} width={40} height={32} rx={4}
                fill={active ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.06)'}
                stroke={active ? '#f59e0b' : 'rgba(245,158,11,0.3)'} strokeWidth={1.2} />
            <text x={cx + 28} y={ICON_CY + 5} textAnchor="middle"
                fill={active ? '#f59e0b' : COLOR.textDim} fontSize={FONT.min}>잔류</text>

            {/* 설명 */}
            <text x={cx} y={TEXT_Y1} textAnchor="middle" fill={COLOR.textMuted} fontSize={FONT.min}>보호기 없음 → 녹음</text>
            <text x={cx} y={TEXT_Y2} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>보호기 있음 → 안 녹음</text>
            <text x={cx} y={TEXT_Y3} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>→ 패턴 형성</text>
        </g>
    );
}

export default function CARMechanism() {
    const [hovered, setHovered] = useState<ActId>(null);
    const isDimmed = (id: Exclude<ActId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                CAR의 동작 원리: 세 막의 드라마
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Chemically Amplified Resist — 3-Act Mechanism
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 600)} style={{ maxWidth: '100%' }}>
                    {ACT_ORDER.map((id, i) => {
                        const x = START_X + i * (PANEL_W + PANEL_GAP);
                        const active = hovered === id;
                        const PanelComp = i === 0 ? ExposurePanel : i === 1 ? PEBPanel : DevelopmentPanel;

                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDimmed(id) ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={x} y={BOX_Y} width={PANEL_W} height={BOX_H} rx={8}
                                    fill={active ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)'}
                                    stroke={active ? `${ACTS[id].color}30` : 'rgba(255,255,255,0.06)'} strokeWidth={1} />
                                <PanelComp x={x} active={active} />
                                {/* 막 제목 */}
                                <text x={x + PANEL_W / 2} y={BOX_Y + BOX_H + 18} textAnchor="middle"
                                    fill={active ? ACTS[id].color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>
                                    {ACTS[id].label}
                                </text>
                            </motion.g>
                        );
                    })}

                    {/* 단계 간 화살표 */}
                    {[0, 1].map(i => {
                        const fromX = START_X + (i + 1) * PANEL_W + i * PANEL_GAP + 4;
                        const toX = START_X + (i + 1) * (PANEL_W + PANEL_GAP) - 4;
                        const ay = BOX_Y + BOX_H / 2;
                        return (
                            <g key={i}>
                                <line x1={fromX} y1={ay} x2={toX} y2={ay}
                                    stroke={COLOR.textDim} strokeWidth={0.8} />
                                <polygon points={`${toX - 4},${ay - 3} ${toX},${ay} ${toX - 4},${ay + 3}`}
                                    fill={COLOR.textDim} />
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 58 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: ACTS[hovered].color, marginBottom: 2 }}>
                                {ACTS[hovered].label} — {ACTS[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {ACTS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 단계를 호버하세요. 광자 하나가 트리거가 되어, PEB에서 연쇄 반응으로 증폭되는 과정입니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
