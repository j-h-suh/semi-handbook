'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type AreaId = 'ai' | 'semi' | 'cross' | null;

const AREAS: Record<Exclude<AreaId, null>, { label: string; desc: string; color: string }> = {
    ai:    { label: 'CS / AI 전문가', desc: 'ML/DL, 데이터 엔지니어링, 시스템 설계. 매년 수만 명 배출. 반도체 도메인 지식 부족.', color: '#3b82f6' },
    semi:  { label: '반도체 엔지니어', desc: '공정, 장비, 물리/화학, 수율 관리. 수십만 명이 팹에서 근무. AI/ML 역량 부족.', color: '#22c55e' },
    cross: { label: '교차 역량 인재', desc: 'AI + 반도체 둘 다 아는 희소 인재. Focus², Dose×두께 같은 도메인 피처를 설계하고 모델에 적용 가능. 대체 불가능한 가치.', color: '#f59e0b' },
};

const SVG_W = 500;
const SVG_H = 220;
const CX = SVG_W / 2;
const CY = 110;
const R = 80;
const OFFSET = 50;

export default function CrossCompetencyVenn() {
    const [hovered, setHovered] = useState<AreaId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                CS/AI × 반도체 — 교차 역량
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                두 세계의 교차점에서 대체 불가능한 가치를 만든다
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 500 }}>
                    {/* AI circle */}
                    <motion.circle cx={CX - OFFSET} cy={CY} r={R}
                        fill={hovered === 'ai' ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.05)'}
                        stroke={hovered === 'ai' ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.15)'} strokeWidth={1.5}
                        onMouseEnter={() => setHovered('ai')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: hovered !== null && hovered !== 'ai' && hovered !== 'cross' ? 0.3 : 1 }}
                        style={{ cursor: 'pointer' }} />
                    <text x={CX - OFFSET - 30} y={CY - 8} textAnchor="middle" fill={hovered === 'ai' ? '#3b82f6' : COLOR.textMuted} fontSize={FONT.small} fontWeight={600} pointerEvents="none">CS / AI</text>
                    <text x={CX - OFFSET - 30} y={CY + 12} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min} pointerEvents="none">전문가 多</text>

                    {/* Semi circle */}
                    <motion.circle cx={CX + OFFSET} cy={CY} r={R}
                        fill={hovered === 'semi' ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.05)'}
                        stroke={hovered === 'semi' ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.15)'} strokeWidth={1.5}
                        onMouseEnter={() => setHovered('semi')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: hovered !== null && hovered !== 'semi' && hovered !== 'cross' ? 0.3 : 1 }}
                        style={{ cursor: 'pointer' }} />
                    <text x={CX + OFFSET + 30} y={CY - 8} textAnchor="middle" fill={hovered === 'semi' ? '#22c55e' : COLOR.textMuted} fontSize={FONT.small} fontWeight={600} pointerEvents="none">반도체</text>
                    <text x={CX + OFFSET + 30} y={CY + 12} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min} pointerEvents="none">엔지니어 多</text>

                    {/* Intersection */}
                    <motion.rect x={CX - 28} y={CY - 20} width={56} height={40} rx={8} fill="transparent"
                        onMouseEnter={() => setHovered('cross')} onMouseLeave={() => setHovered(null)}
                        style={{ cursor: 'pointer' }} />
                    <text x={CX} y={CY - 6} textAnchor="middle" fill={hovered === 'cross' ? '#f59e0b' : 'rgba(245,158,11,0.6)'} fontSize={FONT.min} fontWeight={700} pointerEvents="none">교차</text>
                    <text x={CX} y={CY + 10} textAnchor="middle" fill={hovered === 'cross' ? '#f59e0b' : 'rgba(245,158,11,0.5)'} fontSize={FONT.min} fontWeight={700} pointerEvents="none">희소 ★</text>
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: AREAS[hovered].color, marginBottom: 2 }}>{AREAS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{AREAS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 영역을 호버하세요. 교차점의 희소 인재가 대체 불가능한 가치를 만듭니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
