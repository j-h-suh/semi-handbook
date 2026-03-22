'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type TechId = 'euv' | 'highna' | 'dsa' | 'nil' | null;

const TECHS: Record<Exclude<TechId, null>, { label: string; area: string; timeline: string; desc: string; color: string }> = {
    euv:    { label: 'EUV (현재)', area: '로직 최첨단', timeline: '양산 중', desc: 'NA 0.33, ~13nm 해상도. 3nm/2nm 노드 양산 주력. 멀티패터닝 필요.', color: '#3b82f6' },
    highna: { label: 'High-NA EUV', area: '로직 1nm 이하', timeline: '2026~27', desc: 'NA 0.55, ~8nm 해상도. 단일 노광으로 극한 해상도. Anamorphic 광학.', color: '#f59e0b' },
    dsa:    { label: 'DSA', area: 'Contact/Fin 보조', timeline: '2028+', desc: '주기적 패턴(CH, Fin) 보조. 해상도 증폭. 로직 메인 공정에는 부적합.', color: '#22c55e' },
    nil:    { label: 'NIL', area: 'NAND 메모리', timeline: 'NAND 양산 중', desc: '비용 혁명. 주기적 패턴 반복. 스루풋 낮지만 메모리에는 충분.', color: '#a855f7' },
};

const SVG_W = 700;
const SVG_H = 160;
const BOX_W = 140;
const BOX_H = 100;
const GAP = 20;
const TOTAL = 4 * BOX_W + 3 * GAP;
const X0 = (SVG_W - TOTAL) / 2 + BOX_W / 2;

export default function LithoTechApplicationMap() {
    const [hovered, setHovered] = useState<TechId>(null);

    const ORDER: Exclude<TechId, null>[] = ['euv', 'highna', 'dsa', 'nil'];

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                차세대 리소그래피 — 기술별 적용 영역
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                경쟁이 아닌 공존 — 각 기술이 최적 영역에서 활용
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    {ORDER.map((id, i) => {
                        const cx = X0 + i * (BOX_W + GAP);
                        const info = TECHS[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: hovered !== null && hovered !== id ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={cx - BOX_W / 2} y={20} width={BOX_W} height={BOX_H} rx={10}
                                    fill={active ? `${info.color}10` : 'rgba(255,255,255,0.02)'}
                                    stroke={active ? `${info.color}40` : 'rgba(255,255,255,0.06)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={cx} y={42} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={700}>{info.label}</text>
                                <text x={cx} y={64} textAnchor="middle" dominantBaseline="central"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.area}</text>
                                <text x={cx} y={84} textAnchor="middle" dominantBaseline="central"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.timeline}</text>
                                {/* Progress bar */}
                                <rect x={cx - BOX_W / 2 + 16} y={100} width={BOX_W - 32} height={4} rx={2} fill="rgba(255,255,255,0.04)" />
                                <rect x={cx - BOX_W / 2 + 16} y={100}
                                    width={(BOX_W - 32) * (id === 'euv' ? 1 : id === 'nil' ? 0.7 : id === 'highna' ? 0.4 : 0.2)}
                                    height={4} rx={2} fill={active ? info.color : `${info.color}40`} />
                                <text x={cx} y={118} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min} opacity={0.5}>
                                    {id === 'euv' ? '성숙' : id === 'nil' ? 'NAND 양산' : id === 'highna' ? '도입기' : '연구'}
                                </text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: TECHS[hovered].color, marginBottom: 2 }}>{TECHS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{TECHS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 기술을 호버하세요. 로직은 High-NA, 메모리는 NIL, 주기적 패턴은 DSA.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
