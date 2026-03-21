'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 층 데이터 ─── */
type LayerId = 'pellicle' | 'chrome' | 'quartz' | null;

interface LayerInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const LAYERS: Record<Exclude<LayerId, null>, LayerInfo> = {
    pellicle: { label: '펠리클', sub: 'Pellicle Frame + Membrane', desc: '마스크 패턴면에서 ~6mm 위에 설치된 초박막 보호막. 파티클이 마스크 표면 대신 펠리클 위에 떨어지게 하여 초점 밖에 놓이게 한다. DUV용은 두께 ~800nm, 투과율 ~99%.', color: '#f59e0b' },
    chrome: { label: '크롬 패턴', sub: 'Cr ~60-100nm', desc: '빛을 차단하는 영역에 코팅된 크롬 박막. 크롬이 있는 곳은 DUV가 차단되고, 없는 곳은 석영을 투과한다. 이 밝고 어두운 패턴이 웨이퍼에 전사. 4:1 축소이므로 웨이퍼 패턴의 4배 크기.', color: '#71717a' },
    quartz: { label: '석영 기판', sub: 'Fused Silica 6" × 6" × 0.25"', desc: '고순도 합성 석영(SiO₂). 193nm DUV 빛이 높은 투과율로 통과. 불순물이 있으면 DUV를 흡수해 열 변형 발생. 극한의 열팽창 계수와 평탄도 필요.', color: '#3b82f6' },
};

const LAYER_ORDER: Exclude<LayerId, null>[] = ['pellicle', 'chrome', 'quartz'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 420;
const SVG_H = 230;
const CX = SVG_W / 2;
const LAYER_W = 220;

/* 층 좌표 */
const PEL_Y = 30;
const PEL_H = 8;
const FRAME_Y = PEL_Y + PEL_H;
const FRAME_H = 30;
const GAP_H = 40;
const CR_Y = FRAME_Y + FRAME_H + GAP_H;
const CR_H = 16;
const QZ_Y = CR_Y + CR_H + 4;
const QZ_H = 80;

/* 빔 */
const BEAM_TOP = 4;

export default function DuvMaskStructure() {
    const [hovered, setHovered] = useState<LayerId>(null);
    const isDimmed = (id: Exclude<LayerId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                DUV 마스크 단면 구조
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                DUV Mask Cross-Section — Transmissive Type
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={360} style={{ flexShrink: 0 }}>

                    {/* 빔 — 위에서 내려옴 */}
                    <polygon points={`${CX - 8},${BEAM_TOP} ${CX + 8},${BEAM_TOP} ${CX + 50},${PEL_Y} ${CX - 50},${PEL_Y}`}
                        fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.2)" strokeWidth={0.5} />
                    <text x={CX + 56} y={PEL_Y - 6} fill="rgba(251,191,36,0.6)" fontSize={FONT.min}>DUV 193nm ↓</text>

                    {/* 펠리클 */}
                    <motion.g onMouseEnter={() => setHovered('pellicle')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('pellicle') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        {/* 멤브레인 */}
                        <rect x={CX - LAYER_W / 2 + 10} y={PEL_Y} width={LAYER_W - 20} height={PEL_H} rx={1}
                            fill={hovered === 'pellicle' ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.08)'}
                            stroke={hovered === 'pellicle' ? '#f59e0b' : 'rgba(245,158,11,0.4)'} strokeWidth={1} />
                        {/* 프레임 (좌우) */}
                        <rect x={CX - LAYER_W / 2} y={PEL_Y} width={12} height={FRAME_H + PEL_H} rx={2}
                            fill={hovered === 'pellicle' ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.06)'}
                            stroke={hovered === 'pellicle' ? '#f59e0b' : 'rgba(245,158,11,0.3)'} strokeWidth={0.8} />
                        <rect x={CX + LAYER_W / 2 - 12} y={PEL_Y} width={12} height={FRAME_H + PEL_H} rx={2}
                            fill={hovered === 'pellicle' ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.06)'}
                            stroke={hovered === 'pellicle' ? '#f59e0b' : 'rgba(245,158,11,0.3)'} strokeWidth={0.8} />
                        <text x={CX + LAYER_W / 2 + 10} y={PEL_Y + PEL_H + FRAME_H / 2 + 4}
                            fill={hovered === 'pellicle' ? '#f59e0b' : COLOR.textDim} fontSize={FONT.min}>펠리클</text>
                        {/* 히트 영역 */}
                        <rect x={CX - LAYER_W / 2 - 4} y={PEL_Y - 4} width={LAYER_W + 8} height={FRAME_H + PEL_H + 8} fill="transparent" />
                    </motion.g>

                    {/* 6mm 간격 표시 */}
                    <g opacity={hovered === 'pellicle' || hovered === 'chrome' ? 1 : 0.7}>
                        <line x1={CX - LAYER_W / 2 - 20} y1={FRAME_Y + FRAME_H} x2={CX - LAYER_W / 2 - 20} y2={CR_Y}
                            stroke="rgba(255,255,255,0.5)" strokeWidth={1} strokeDasharray="3 2" />
                        <line x1={CX - LAYER_W / 2 - 24} y1={FRAME_Y + FRAME_H} x2={CX - LAYER_W / 2 - 16} y2={FRAME_Y + FRAME_H}
                            stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
                        <line x1={CX - LAYER_W / 2 - 24} y1={CR_Y} x2={CX - LAYER_W / 2 - 16} y2={CR_Y}
                            stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
                        <text x={CX - LAYER_W / 2 - 24} y={(FRAME_Y + FRAME_H + CR_Y) / 2 + 4} textAnchor="end"
                            fill={COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>~6mm</text>
                    </g>

                    {/* 크롬 패턴 */}
                    <motion.g onMouseEnter={() => setHovered('chrome')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('chrome') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - LAYER_W / 2} y={CR_Y} width={LAYER_W} height={CR_H + 8} fill="transparent" />
                        {/* 크롬 바 패턴 (등간격) */}
                        {Array.from({ length: 8 }, (_, i) => {
                            const barW = 14;
                            const totalBars = 8;
                            const spacing = (LAYER_W - 20 - barW * totalBars) / (totalBars - 1);
                            const x = CX - LAYER_W / 2 + 10 + i * (barW + spacing);
                            return (
                                <rect key={i} x={x} y={CR_Y} width={barW} height={CR_H} rx={1}
                                    fill={hovered === 'chrome' ? 'rgba(113,113,122,0.4)' : 'rgba(113,113,122,0.25)'}
                                    stroke={hovered === 'chrome' ? '#71717a' : 'rgba(113,113,122,0.5)'} strokeWidth={0.8} />
                            );
                        })}
                        <text x={CX + LAYER_W / 2 + 10} y={CR_Y + CR_H / 2 + 4}
                            fill={hovered === 'chrome' ? '#a1a1aa' : COLOR.textDim} fontSize={FONT.min}>Cr 패턴</text>
                    </motion.g>

                    {/* 석영 기판 */}
                    <motion.g onMouseEnter={() => setHovered('quartz')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('quartz') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - LAYER_W / 2} y={QZ_Y} width={LAYER_W} height={QZ_H} rx={4}
                            fill={hovered === 'quartz' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.06)'}
                            stroke={hovered === 'quartz' ? '#3b82f6' : 'rgba(59,130,246,0.35)'} strokeWidth={1} />
                        <text x={CX} y={QZ_Y + QZ_H / 2 - 4} textAnchor="middle"
                            fill={hovered === 'quartz' ? '#3b82f6' : COLOR.textMuted} fontSize={FONT.body} fontWeight={600}>석영 기판</text>
                        <text x={CX} y={QZ_Y + QZ_H / 2 + 14} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>Fused Silica (SiO₂)</text>
                    </motion.g>

                    {/* 빔 — 펠리클 멤브레인 하단→크롬 구간 */}
                    <rect x={CX - 45} y={PEL_Y + PEL_H} width={90} height={CR_Y - PEL_Y - PEL_H}
                        fill="rgba(251,191,36,0.06)" stroke="none" />
                    {/* 빔 — 석영 투과 */}
                    <rect x={CX - 45} y={CR_Y + CR_H} width={90} height={QZ_Y + QZ_H - CR_Y - CR_H}
                        fill="rgba(251,191,36,0.06)" stroke="none" />

                    {/* 마스크 범위 표시 (크롬+석영) */}
                    <g opacity={0.6}>
                        <line x1={CX + LAYER_W / 2 + 50} y1={CR_Y} x2={CX + LAYER_W / 2 + 50} y2={QZ_Y + QZ_H}
                            stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
                        <line x1={CX + LAYER_W / 2 + 46} y1={CR_Y} x2={CX + LAYER_W / 2 + 54} y2={CR_Y}
                            stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
                        <line x1={CX + LAYER_W / 2 + 46} y1={QZ_Y + QZ_H} x2={CX + LAYER_W / 2 + 54} y2={QZ_Y + QZ_H}
                            stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
                        <text x={CX + LAYER_W / 2 + 58} y={(CR_Y + QZ_Y + QZ_H) / 2 + 4}
                            fill={COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>마스크</text>
                    </g>
                </svg>

                {/* 우측 요소 버튼 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 200, marginTop: 20 }}>
                    {LAYER_ORDER.map(id => {
                        const info = LAYERS[id];
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: LAYERS[hovered].color, marginBottom: 2 }}>
                                {LAYERS[hovered].label} — {LAYERS[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {LAYERS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 층을 호버하여 DUV 투과형 마스크의 구조를 확인하세요. 빛은 위에서 석영 기판을 투과합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
