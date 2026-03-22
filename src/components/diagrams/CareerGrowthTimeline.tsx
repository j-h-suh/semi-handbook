'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StageId = 'junior' | 'senior' | 'leader' | 'ic' | null;

const STAGES: Record<Exclude<StageId, null>, { label: string; years: string; desc: string; color: string }> = {
    junior: { label: '주니어', years: '0~3년', desc: '하나의 공정/장비에 대한 깊은 이해. 데이터 분석, 모델 개발, 파이프라인 구축. "이 스캐너를 누구보다 잘 아는 사람"이 목표.', color: '#3b82f6' },
    senior: { label: '시니어', years: '3~7년', desc: '여러 공정을 아우르는 AI 시스템 설계. 주니어 멘토링. 기술 커뮤니케이션 역량 핵심. 엔지니어 신뢰 구축.', color: '#22c55e' },
    leader: { label: '리더', years: '7년+', desc: 'AI 전략 수립, 팀 빌딩, 비즈니스 임팩트 주도. "수율 몇 % → 매출 얼마 임팩트"를 말할 수 있어야 한다.', color: '#f59e0b' },
    ic:     { label: 'IC Track', years: '전문가', desc: 'Distinguished Engineer / Fellow. Comp Litho, Digital Twin 등 특정 도메인 세계적 전문가. 기술의 깊이가 곧 경쟁력.', color: '#a855f7' },
};

const ORDER: Exclude<StageId, null>[] = ['junior', 'senior', 'leader', 'ic'];

const SVG_W = 700;
const SVG_H = 120;
const NODE_W = 140;
const NODE_H = 60;
const GAP = 16;
const TOTAL = ORDER.length * NODE_W + (ORDER.length - 1) * GAP;
const X0 = (SVG_W - TOTAL) / 2 + NODE_W / 2;
const CY = 56;

export default function CareerGrowthTimeline() {
    const [hovered, setHovered] = useState<StageId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                반도체 AI 엔지니어 성장 경로
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                깊이(주니어) → 넓이(시니어) → 전략(리더) 또는 전문가(IC)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    <defs>
                        <marker id="arrowCG" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {/* Arrows: junior→senior→leader, senior→ic (branch) */}
                    {[0, 1].map(i => {
                        const x1 = X0 + i * (NODE_W + GAP) + NODE_W / 2;
                        const x2 = X0 + (i + 1) * (NODE_W + GAP) - NODE_W / 2;
                        return <line key={i} x1={x1} y1={CY} x2={x2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrowCG)" />;
                    })}
                    {/* senior → ic (branch arrow) */}
                    <line x1={X0 + 1 * (NODE_W + GAP) + NODE_W / 2} y1={CY}
                        x2={X0 + 3 * (NODE_W + GAP) - NODE_W / 2} y2={CY}
                        stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="4 2" markerEnd="url(#arrowCG)" />
                    {ORDER.map((id, i) => {
                        const cx = X0 + i * (NODE_W + GAP);
                        const info = STAGES[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: hovered !== null && hovered !== id ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={cx - NODE_W / 2 - 4} y={CY - NODE_H / 2 - 4} width={NODE_W + 8} height={NODE_H + 8} fill="transparent" />
                                <rect x={cx - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={cx} y={CY - 10} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>{info.label}</text>
                                <text x={cx} y={CY + 10} textAnchor="middle" dominantBaseline="central"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.years}</text>
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STAGES[hovered].color, marginBottom: 2 }}>{STAGES[hovered].label} ({STAGES[hovered].years})</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{STAGES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. 매니지먼트(리더) 또는 전문가(IC) 트랙으로 분기합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
