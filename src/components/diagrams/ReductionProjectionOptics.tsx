'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 광학계 요소 데이터 ─── */
type ElementId = 'source' | 'condenser' | 'mask' | 'projection' | 'wafer' | null;

interface ElementInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const ELEMENTS: Record<Exclude<ElementId, null>, ElementInfo> = {
    source: { label: '광원', sub: 'Light Source (DUV 193nm / EUV 13.5nm)', desc: 'DUV는 ArF 엑시머 레이저(193nm), EUV는 주석 플라즈마에서 극자외선(13.5nm)을 생성. 파장이 짧을수록 더 미세한 패턴 가능.', color: '#fbbf24' },
    condenser: { label: '조명 광학계', sub: 'Illumination Optics', desc: '광원의 빛을 균일하게 정형하여 마스크 전면에 고르게 조사. 조명 형태(Conventional, Annular, Dipole, Quadrupole)가 해상도와 DOF에 영향.', color: '#818cf8' },
    mask: { label: '마스크 (Reticle)', sub: 'Pattern: 40nm (4× actual)', desc: '회로 패턴이 크롬으로 그려진 석영 유리판. 실제 웨이퍼 패턴의 4배 크기로 제작. DUV는 투과형, EUV는 반사형 마스크 사용.', color: '#e4e4e7' },
    projection: { label: '투영 렌즈', sub: 'Projection Optics — 4:1 Reduction', desc: '마스크 패턴을 4:1로 축소 투영. 수십 장의 정밀 연마 렌즈로 구성. NA(개구수)가 클수록 해상도 향상. 최신 DUV NA=1.35(이머전).', color: '#3b82f6' },
    wafer: { label: '웨이퍼', sub: 'Pattern: 10nm (on PR)', desc: '포토레지스트가 도포된 300mm 웨이퍼. 축소 투영된 빛이 PR의 화학 구조를 변화시켜 패턴을 형성. Dose와 Focus가 핵심 파라미터.', color: '#a1a1aa' },
};

/* ─── 레이아웃 상수 ─── */
const SVG_W = 360;
const SVG_H = 500;
const CX = SVG_W / 2;   // 중앙 x
const ELEM_W = 150;      // 요소 폭
const ELEM_H = 44;       // 요소 높이
const BEAM_W = 80;       // 빔 폭 (마스크 조사)
const BEAM_W_SRC = 24;   // 빔 폭 (광원, 좌음)
const BEAM_W_BOT = 24;   // 빔 폭 (하단, 축소)

// y 위치들
const SRC_Y = 20;
const COND_Y = 100;
const MASK_Y = 180;
const PROJ_Y = 270;
const WFR_Y = 380;

const positions: Record<Exclude<ElementId, null>, { y: number }> = {
    source: { y: SRC_Y },
    condenser: { y: COND_Y },
    mask: { y: MASK_Y },
    projection: { y: PROJ_Y },
    wafer: { y: WFR_Y },
};

export default function ReductionProjectionOptics() {
    const [hovered, setHovered] = useState<ElementId>(null);
    const isDimmed = (id: Exclude<ElementId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                노광 축소 투영 광학계
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                4:1 Reduction Projection Optics
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* SVG 광학계 */}
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={340} style={{ flexShrink: 0 }}>
                    {/* 광선 (빔 경로) */}
                    {/* 광원 → 조명 광학계: 가장 밝은 빔 */}
                    <motion.polygon
                        points={`${CX - BEAM_W_SRC / 2},${SRC_Y + ELEM_H} ${CX + BEAM_W_SRC / 2},${SRC_Y + ELEM_H} ${CX + BEAM_W_SRC / 2},${COND_Y} ${CX - BEAM_W_SRC / 2},${COND_Y}`}
                        fill="rgba(251,191,36,0.35)" stroke="rgba(251,191,36,0.5)" strokeWidth={0.5}
                        animate={{ opacity: isDimmed('source') && isDimmed('condenser') ? 0.15 : 0.8 }} />
                    {/* 조명 광학계 → 마스크: 넓혀진 빔 */}
                    <motion.polygon
                        points={`${CX - BEAM_W_SRC / 2},${COND_Y + ELEM_H} ${CX + BEAM_W_SRC / 2},${COND_Y + ELEM_H} ${CX + BEAM_W / 2},${MASK_Y} ${CX - BEAM_W / 2},${MASK_Y}`}
                        fill="rgba(251,191,36,0.25)" stroke="rgba(251,191,36,0.4)" strokeWidth={0.5}
                        animate={{ opacity: isDimmed('condenser') && isDimmed('mask') ? 0.15 : 0.7 }} />
                    {/* 마스크 → 투영 렌즈: 수직 (같은 폭) */}
                    <motion.polygon
                        points={`${CX - BEAM_W / 2},${MASK_Y + ELEM_H} ${CX + BEAM_W / 2},${MASK_Y + ELEM_H} ${CX + BEAM_W / 2},${PROJ_Y} ${CX - BEAM_W / 2},${PROJ_Y}`}
                        fill="rgba(251,191,36,0.18)" stroke="rgba(251,191,36,0.3)" strokeWidth={0.5}
                        animate={{ opacity: isDimmed('mask') && isDimmed('projection') ? 0.15 : 0.6 }} />
                    {/* 투영 렌즈 → 웨이퍼: 4:1 축소 */}
                    <motion.polygon
                        points={`${CX - BEAM_W / 2},${PROJ_Y + ELEM_H} ${CX + BEAM_W / 2},${PROJ_Y + ELEM_H} ${CX + BEAM_W_BOT / 2},${WFR_Y} ${CX - BEAM_W_BOT / 2},${WFR_Y}`}
                        fill="rgba(251,191,36,0.2)" stroke="rgba(251,191,36,0.4)" strokeWidth={0.5}
                        animate={{ opacity: isDimmed('projection') && isDimmed('wafer') ? 0.15 : 0.6 }} />

                    {/* 4:1 축소 표시 — 투영 렌즈 옆 */}
                    <motion.g animate={{ opacity: isDimmed('projection') ? 0.2 : 0.7 }}>
                        <text x={CX + ELEM_W / 2 + 12} y={PROJ_Y + ELEM_H / 2 + 5} fill="#3b82f6" fontSize={14} fontWeight={700}>4:1 축소</text>
                    </motion.g>

                    {/* 광학 요소 박스들 */}
                    {(Object.keys(ELEMENTS) as Exclude<ElementId, null>[]).map(id => {
                        const pos = positions[id];
                        const info = ELEMENTS[id];
                        const active = hovered === id;
                        const dim = isDimmed(id);

                        // 렌즈 형태 (condenser, projection) vs 직사각형
                        const isLens = id === 'condenser' || id === 'projection';
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dim ? 0.25 : 1 }}
                                transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                {isLens ? (
                                    <ellipse cx={CX} cy={pos.y + ELEM_H / 2} rx={ELEM_W / 2} ry={ELEM_H / 2.5}
                                        fill={active ? 'rgba(135,206,235,0.15)' : 'rgba(135,206,235,0.05)'}
                                        stroke={active ? info.color : 'rgba(255,255,255,0.15)'} strokeWidth={active ? 2 : 1} />
                                ) : (
                                    <rect x={CX - ELEM_W / 2} y={pos.y} width={ELEM_W} height={ELEM_H} rx={6}
                                        fill={active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}
                                        stroke={active ? info.color : 'rgba(255,255,255,0.12)'} strokeWidth={active ? 2 : 1} />
                                )}
                                <text x={CX} y={pos.y + ELEM_H / 2 + 5} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={15} fontWeight={active ? 700 : 500}>
                                    {info.label}
                                </text>
                            </motion.g>
                        );
                    })}
                </svg>

                {/* 우측 설명 패널 */}
                <div style={{ width: 300, minHeight: 120 }}>
                    <AnimatePresence mode="wait">
                        {hovered ? (
                            <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                                style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '12px 16px' }}>
                                <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: ELEMENTS[hovered].color, marginBottom: 4 }}>
                                    {ELEMENTS[hovered].label}
                                </div>
                                <div style={{ fontSize: FONT.min, color: COLOR.textDim, marginBottom: 6 }}>
                                    {ELEMENTS[hovered].sub}
                                </div>
                                <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.6 }}>
                                    {ELEMENTS[hovered].desc}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                                style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '12px 16px' }}>
                                <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.6 }}>
                                    각 광학 요소를 호버하여 상세 설명을 확인하세요. 빛이 위에서 아래로 이동하며 마스크 패턴이 4:1로 축소되어 웨이퍼에 전사됩니다.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
