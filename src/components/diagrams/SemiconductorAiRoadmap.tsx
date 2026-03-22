'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type YearId = 'y2026' | 'y2027' | 'y2028' | 'y2930' | 'y30p' | null;

const YEARS: Record<Exclude<YearId, null>, { label: string; items: string[]; desc: string; color: string }> = {
    y2026: { label: '2026', items: ['High-NA EUV 양산', 'MLOps 표준화', 'AI-APC 보편화 (L3)'], desc: 'High-NA EUV 양산 시작. AI-assisted APC가 Level 3로 보편화. MLOps 파이프라인이 팹 표준이 됨.', color: '#3b82f6' },
    y2027: { label: '2027', items: ['장비 디지털 트윈', 'LLM 엔지니어 어시스턴트', 'Cross-Fab 전이 학습'], desc: '단일 장비 디지털 트윈 상용화. LLM 기반 엔지니어 어시스턴트가 팹에 도입됨. Cross-Fab 전이 학습 모델.', color: '#22c55e' },
    y2028: { label: '2028', items: ['DSA 파일럿', 'NIL NAND 확대', '반자율 팹 (L3~4)'], desc: 'DSA 파일럿 양산 시작. NIL이 NAND에서 확대. 선도 팹에서 반자율(Level 3~4) 운영 시작.', color: '#f59e0b' },
    y2930: { label: '2029~30', items: ['High-NA 2세대', '팹 디지털 트윈', '자율 팹 Level 4'], desc: 'High-NA EUV 2세대. 팹 전체 레벨 디지털 트윈 상용화. 선도 기업 자율 팹 Level 4.', color: '#a855f7' },
    y30p:  { label: '2030+', items: ['0.7nm 노드', 'Foundation Model', '양자 컴퓨팅 초기'], desc: '0.7nm 노드 진입. 반도체 Foundation Model 업계 표준. 양자 컴퓨팅 초기 적용.', color: '#ef4444' },
};

const ORDER: Exclude<YearId, null>[] = ['y2026', 'y2027', 'y2028', 'y2930', 'y30p'];

const SVG_W = 740;
const SVG_H = 100;
const BAR_W = 126;
const BAR_H = 52;
const GAP = 12;
const TOTAL = ORDER.length * BAR_W + (ORDER.length - 1) * GAP;
const X0 = (SVG_W - TOTAL) / 2 + BAR_W / 2;
const CY = SVG_H / 2;

export default function SemiconductorAiRoadmap() {
    const [hovered, setHovered] = useState<YearId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                반도체 AI 5~10년 로드맵
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                2026 MLOps → 2027 디지털 트윈 → 2028 반자율 → 2030+ Foundation Model
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 740 }}>
                    {/* Timeline line */}
                    <line x1={X0 - BAR_W / 2} y1={CY + BAR_H / 2 + 10} x2={X0 + (ORDER.length - 1) * (BAR_W + GAP) + BAR_W / 2} y2={CY + BAR_H / 2 + 10}
                        stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                    {ORDER.map((id, i) => {
                        const cx = X0 + i * (BAR_W + GAP);
                        const info = YEARS[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: hovered !== null && hovered !== id ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={cx - BAR_W / 2} y={CY - BAR_H / 2} width={BAR_W} height={BAR_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.06)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={cx} y={CY - 8} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={700}>{info.label}</text>
                                <text x={cx} y={CY + 12} textAnchor="middle" dominantBaseline="central"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.items[0]}</text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 64 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: YEARS[hovered].color, marginBottom: 2 }}>{YEARS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{YEARS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 연도를 호버하세요. 지금 시작해야 2~3년 후에 준비된 팀이 됩니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
