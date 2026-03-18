'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 스테이지 데이터 ─── */
type StageId = 'measure' | 'expose' | null;

interface StageInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
    icon: string;
}

const STAGES: Record<Exclude<StageId, null>, StageInfo> = {
    measure: {
        label: '측정 스테이지',
        sub: 'Measure (Alignment + Leveling)',
        desc: '웨이퍼의 Alignment Mark를 광학적으로 읽어 이전 층과 정렬하고, 표면 높낮이(Focus Map)를 측정. 이 데이터로 노광 시 실시간 보정 수행. 노광과 동시에 다음 웨이퍼를 준비하여 처리량 극대화.',
        color: '#3b82f6',
        icon: '🔍',
    },
    expose: {
        label: '노광 스테이지',
        sub: 'Expose (Scanning)',
        desc: '투영 렌즈 아래에서 실제 노광 수행. 측정 스테이지에서 받은 정렬/레벨링 데이터를 기반으로 실시간 보정하며 스캔. 12초에 웨이퍼 1장 처리(300 wph).',
        color: '#22c55e',
        icon: '⚡',
    },
};

/* ─── SVG 레이아웃 상수 ─── */
const SVG_W = 560;
const SVG_H = 280;
const STAGE_W = 200;
const STAGE_H = 150;
const GAP = 80;
const LEFT_X = (SVG_W - STAGE_W * 2 - GAP) / 2;
const RIGHT_X = LEFT_X + STAGE_W + GAP;
const STAGE_Y = 40;

export default function DualStageConcept() {
    const [hovered, setHovered] = useState<StageId>(null);
    const isDimmed = (id: Exclude<StageId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                듀얼 스테이지 동작 개념도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Dual Stage — Parallel Pipeline (Double Buffering)
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 560)} style={{ maxWidth: '100%' }}>
                    {/* 측정 스테이지 */}
                    <motion.g
                        onMouseEnter={() => setHovered('measure')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('measure') ? 0.2 : 1 }}
                        transition={{ duration: 0.15 }}
                        style={{ cursor: 'pointer' }}>
                        <rect x={LEFT_X} y={STAGE_Y} width={STAGE_W} height={STAGE_H} rx={10}
                            fill={hovered === 'measure' ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.03)'}
                            stroke={hovered === 'measure' ? '#3b82f6' : 'rgba(59,130,246,0.2)'}
                            strokeWidth={hovered === 'measure' ? 2 : 1} />
                        <text x={LEFT_X + STAGE_W / 2} y={STAGE_Y + 35} textAnchor="middle" fontSize={22}>🔍</text>
                        <text x={LEFT_X + STAGE_W / 2} y={STAGE_Y + 60} textAnchor="middle"
                            fill={hovered === 'measure' ? '#3b82f6' : COLOR.textBright} fontSize={FONT.body} fontWeight={700}>
                            Stage A
                        </text>
                        <text x={LEFT_X + STAGE_W / 2} y={STAGE_Y + 78} textAnchor="middle"
                            fill={COLOR.textMuted} fontSize={FONT.min}>
                            측정 (Measure)
                        </text>
                        {/* 웨이퍼 표시 */}
                        <ellipse cx={LEFT_X + STAGE_W / 2} cy={STAGE_Y + 110} rx={40} ry={12}
                            fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" strokeWidth={1} />
                        <text x={LEFT_X + STAGE_W / 2} y={STAGE_Y + 114} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>Wafer N+1</text>
                    </motion.g>

                    {/* 노광 스테이지 */}
                    <motion.g
                        onMouseEnter={() => setHovered('expose')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('expose') ? 0.2 : 1 }}
                        transition={{ duration: 0.15 }}
                        style={{ cursor: 'pointer' }}>
                        <rect x={RIGHT_X} y={STAGE_Y} width={STAGE_W} height={STAGE_H} rx={10}
                            fill={hovered === 'expose' ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.03)'}
                            stroke={hovered === 'expose' ? '#22c55e' : 'rgba(34,197,94,0.2)'}
                            strokeWidth={hovered === 'expose' ? 2 : 1} />
                        <text x={RIGHT_X + STAGE_W / 2} y={STAGE_Y + 35} textAnchor="middle" fontSize={22}>⚡</text>
                        <text x={RIGHT_X + STAGE_W / 2} y={STAGE_Y + 60} textAnchor="middle"
                            fill={hovered === 'expose' ? '#22c55e' : COLOR.textBright} fontSize={FONT.body} fontWeight={700}>
                            Stage B
                        </text>
                        <text x={RIGHT_X + STAGE_W / 2} y={STAGE_Y + 78} textAnchor="middle"
                            fill={COLOR.textMuted} fontSize={FONT.min}>
                            노광 (Expose)
                        </text>
                        {/* 웨이퍼 표시 */}
                        <ellipse cx={RIGHT_X + STAGE_W / 2} cy={STAGE_Y + 110} rx={40} ry={12}
                            fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" strokeWidth={1} />
                        <text x={RIGHT_X + STAGE_W / 2} y={STAGE_Y + 114} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>Wafer N</text>

                    </motion.g>

                    {/* 스왑 화살표 (양방향) */}
                    <motion.g animate={{ opacity: hovered === null ? 0.5 : 0.3 }}>
                        {/* 상단 화살표: A → B */}
                        <path d={`M ${LEFT_X + STAGE_W + 8},${STAGE_Y + 50} Q ${SVG_W / 2},${STAGE_Y + 25} ${RIGHT_X - 8},${STAGE_Y + 50}`}
                            fill="none" stroke="#818cf8" strokeWidth={1.2} strokeDasharray="4 3"
                            markerEnd="url(#arrowPurple)" />
                        {/* 하단 화살표: B → A */}
                        <path d={`M ${RIGHT_X - 8},${STAGE_Y + STAGE_H - 50} Q ${SVG_W / 2},${STAGE_Y + STAGE_H - 25} ${LEFT_X + STAGE_W + 8},${STAGE_Y + STAGE_H - 50}`}
                            fill="none" stroke="#818cf8" strokeWidth={1.2} strokeDasharray="4 3"
                            markerEnd="url(#arrowPurpleLeft)" />
                        <text x={SVG_W / 2} y={STAGE_Y + 18} textAnchor="middle" fill="#818cf8" fontSize={FONT.min}>SWAP</text>
                    </motion.g>

                    {/* 화살표 마커 */}
                    <defs>
                        <marker id="arrowPurple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                            <polygon points="0,0 6,3 0,6" fill="#818cf8" />
                        </marker>
                        <marker id="arrowPurpleLeft" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                            <polygon points="0,0 6,3 0,6" fill="#818cf8" />
                        </marker>
                    </defs>

                    {/* 타임라인 바 */}
                    <g>
                        <text x={SVG_W / 2} y={STAGE_Y + STAGE_H + 25} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>
                            ← 측정과 노광이 동시 진행 → 처리량 약 2배 →
                        </text>
                        {/* 타임라인 바 */}
                        <rect x={LEFT_X} y={STAGE_Y + STAGE_H + 35} width={STAGE_W} height={22} rx={4}
                            fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.3)" strokeWidth={0.5} />
                        <text x={LEFT_X + STAGE_W / 2} y={STAGE_Y + STAGE_H + 50} textAnchor="middle"
                            fill="#3b82f6" fontSize={FONT.min}>Measure N+1</text>

                        <rect x={RIGHT_X} y={STAGE_Y + STAGE_H + 35} width={STAGE_W} height={22} rx={4}
                            fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.3)" strokeWidth={0.5} />
                        <text x={RIGHT_X + STAGE_W / 2} y={STAGE_Y + STAGE_H + 50} textAnchor="middle"
                            fill="#22c55e" fontSize={FONT.min}>Expose N</text>
                    </g>
                </svg>
            </div>

            {/* 설명 */}
            <div style={{ maxWidth: 600, margin: '8px auto 0', height: 72 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STAGES[hovered].color, marginBottom: 2 }}>
                                {STAGES[hovered].label} — {STAGES[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {STAGES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 스테이지를 호버하여 설명을 확인하세요. 측정과 노광이 동시에 진행되는 더블 버퍼링 구조입니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
