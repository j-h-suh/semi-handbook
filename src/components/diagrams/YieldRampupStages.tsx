'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StageId = 'init' | 'rampup' | 'mature' | 'limit' | null;

const STAGES: Record<Exclude<StageId, null>, { label: string; sub: string; yield: string; desc: string; color: string }> = {
    init:   { label: '초기', sub: 'R&D 수율', yield: '30-50%', desc: '다양한 결함 모드 혼재. 파레토 분석으로 지배적 결함 파악, 장비 셋업 최적화가 주요 활동.', color: '#ef4444' },
    rampup: { label: '램프업', sub: '급속 개선', yield: '50-80%', desc: 'AI 가치가 가장 큰 구간. 주요 결함 모드를 하나씩 해결하며 수율이 계단식 상승. 1개월 단축 = 수백억 원.', color: '#22c55e' },
    mature: { label: '성숙', sub: '점진적 개선', yield: '80-95%', desc: '개선 속도 둔화. 복합 요인 결함, 랜덤 결함이 남음. 미세 변동 패턴 탐지와 이상 조기 경보에 AI 활용.', color: '#3b82f6' },
    limit:  { label: '한계', sub: '물리적 한계', yield: '95%+', desc: '물리적 한계에 접근. 추가 개선의 비용 대비 효과가 감소. 장기 안정성 및 제어 유지가 핵심 과제.', color: '#f59e0b' },
};

const SVG_W = 600;
const SVG_H = 90;
const NODE_W = 130;
const NODE_H = 54;
const CY = SVG_H / 2;
const ORDER: Exclude<StageId, null>[] = ['init', 'rampup', 'mature', 'limit'];
const GAP = (SVG_W - 4 * NODE_W) / 5;
const POSITIONS = ORDER.map((_, i) => GAP * (i + 1) + NODE_W * (i + 0.5));

export default function YieldRampupStages() {
    const [hovered, setHovered] = useState<StageId>(null);
    const isDimmed = (id: Exclude<StageId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                수율 램프업 단계
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                초기(30%) → 램프업(50-80%) → 성숙(80-95%) → 한계(95%+)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {[0, 1, 2].map(i => (
                        <line key={i} x1={POSITIONS[i] + NODE_W / 2} y1={CY} x2={POSITIONS[i + 1] - NODE_W / 2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    ))}
                    {ORDER.map((id, i) => {
                        const x = POSITIONS[i];
                        const info = STAGES[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - NODE_W / 2 - 6} y={CY - NODE_H / 2 - 4} width={NODE_W + 12} height={NODE_H + 8} fill="transparent" />
                                <rect x={x - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x} y={CY - 8} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.body} fontWeight={600}>{info.label} ({info.yield})</text>
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STAGES[hovered].color, marginBottom: 2 }}>{STAGES[hovered].label} — {STAGES[hovered].yield}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{STAGES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. 수율 S-커브의 네 구간 — 램프업 구간에서 AI 가치가 가장 큽니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
