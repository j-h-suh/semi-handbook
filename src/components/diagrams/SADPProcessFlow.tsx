'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StepId = 'mandrel' | 'spacer' | 'remove' | 'transfer' | null;

const STEPS: Record<Exclude<StepId, null>, { label: string; sub: string; desc: string; color: string }> = {
    mandrel:  { label: '① 맨드릴 형성', sub: '리소+식각 (피치 2P)', desc: '일반 리소+식각으로 코어 라인 패턴(맨드릴) 형성. 피치 2P — 단일 노광 해상도 한계 내.', color: '#3b82f6' },
    spacer:   { label: '② 스페이서 증착', sub: 'ALD 균일 박막', desc: 'ALD로 맨드릴 양 측벽에 균일한 박막(SiO₂, SiN) 증착. 스페이서 두께 = 최종 패턴의 CD. 원자층 수준 균일도.', color: '#f59e0b' },
    remove:   { label: '③ 맨드릴 제거', sub: '선택적 식각', desc: '맨드릴 재료만 선택적으로 식각 제거. 스페이서만 남아 피치 P(원래의 1/2) 패턴 형성. Self-Aligned의 핵심.', color: '#ef4444' },
    transfer: { label: '④ 패턴 전사', sub: '하부층 식각', desc: '남은 스페이서를 식각 마스크로 하부층에 패턴 전사. 최종 피치 = P. Overlay 오차 원천 차단.', color: '#22c55e' },
};

const SVG_W = 600;
const SVG_H = 100;
const NODE_W = 130;
const NODE_H = 54;
const CY = SVG_H / 2;
const ORDER: Exclude<StepId, null>[] = ['mandrel', 'spacer', 'remove', 'transfer'];
const GAP = (SVG_W - 4 * NODE_W) / 5;
const POSITIONS = ORDER.map((_, i) => GAP * (i + 1) + NODE_W * (i + 0.5));

export default function SADPProcessFlow() {
    const [hovered, setHovered] = useState<StepId>(null);
    const isDimmed = (id: Exclude<StepId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                SADP 공정 흐름
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                맨드릴 → 스페이서 → 제거 → 전사 (자기정렬 이중 패터닝)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {[0, 1, 2].map(i => (
                        <line key={i} x1={POSITIONS[i] + NODE_W / 2} y1={CY} x2={POSITIONS[i + 1] - NODE_W / 2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    ))}
                    {ORDER.map((id, i) => {
                        const x = POSITIONS[i];
                        const info = STEPS[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - NODE_W / 2 - 6} y={CY - NODE_H / 2 - 4} width={NODE_W + 12} height={NODE_H + 8} fill="transparent" />
                                <rect x={x - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x} y={CY - 8} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.body} fontWeight={600}>{info.label}</text>
                                <text x={x} y={CY + 10} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.small}>{info.sub}</text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STEPS[hovered].color, marginBottom: 2 }}>{STEPS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{STEPS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. 스페이서 위치가 물리법칙(증착 등방성)으로 결정되어 Overlay 오차가 원천 차단됩니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
