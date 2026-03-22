'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type PhaseId = 'p1' | 'p2' | 'p3' | 'p4' | null;

const PHASES: Record<Exclude<PhaseId, null>, { label: string; duration: string; goals: string[]; desc: string; color: string }> = {
    p1: { label: 'Phase 1', duration: '3개월', goals: ['CD VM 단일 장비 PoC', 'R² > 0.8, RMSE < 0.5nm'], desc: '데이터 수집 파이프라인 구축 + XGBoost VM 개발 + 오프라인 검증. 단일 장비에서 성공 증명.', color: '#3b82f6' },
    p2: { label: 'Phase 2', duration: '3개월', goals: ['VM 실전 배포 + APC', '계측 절감 30%', 'CD 3σ 10% 개선'], desc: 'Shadow Mode 시작 → EWMA+VM 하이브리드 APC. 모니터링 대시보드 + 재학습 파이프라인 구축.', color: '#22c55e' },
    p3: { label: 'Phase 3', duration: '6개월', goals: ['다장비/다제품 확장', '3장비 × 2제품'], desc: '전이 학습(4.7장)으로 다장비 확장. Overlay VM 추가. 멀티 팹 배포 준비.', color: '#f59e0b' },
    p4: { label: 'Phase 4', duration: '지속', goals: ['딥러닝(4.6장)', 'RL APC(4.8장)', 'LLM 인터페이스(4.9장)'], desc: 'Trace 직접 활용 딥러닝, 강화 학습 APC, LLM 기반 엔지니어 인터페이스.', color: '#a855f7' },
};

const ORDER: Exclude<PhaseId, null>[] = ['p1', 'p2', 'p3', 'p4'];

const SVG_W = 700;
const SVG_H = 90;
const BAR_H = 36;
const BAR_Y = (SVG_H - BAR_H) / 2;
const WIDTHS = [130, 130, 200, 160];
const GAP = 12;
const TOTAL = WIDTHS.reduce((a, b) => a + b, 0) + (ORDER.length - 1) * GAP;
const X0 = (SVG_W - TOTAL) / 2;

export default function SmileDevelopmentRoadmap() {
    const [hovered, setHovered] = useState<PhaseId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                SMILE 개발 로드맵 — 점진적 확장
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                단일 PoC → 실전 배포 → 다장비 확장 → 고도화
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    {ORDER.map((id, i) => {
                        const info = PHASES[id];
                        const active = hovered === id;
                        let x = X0;
                        for (let j = 0; j < i; j++) x += WIDTHS[j] + GAP;
                        const w = WIDTHS[i];
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: hovered !== null && hovered !== id ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x} y={BAR_Y} width={w} height={BAR_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x + w / 2} y={BAR_Y + BAR_H / 2 - 6} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                                <text x={x + w / 2} y={BAR_Y + BAR_H / 2 + 10} textAnchor="middle" dominantBaseline="central"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.duration}</text>
                            </motion.g>
                        );
                    })}
                    {/* Timeline arrow */}
                    <line x1={X0 - 10} y1={BAR_Y + BAR_H + 10} x2={X0 + TOTAL + 10} y2={BAR_Y + BAR_H + 10}
                        stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: PHASES[hovered].color, marginBottom: 2 }}>{PHASES[hovered].label} ({PHASES[hovered].duration})</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{PHASES[hovered].desc} <span style={{ color: COLOR.textDim }}>목표: {PHASES[hovered].goals.join(', ')}</span></div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 Phase를 호버하세요. 단일 장비 PoC에서 시작하여 점진적으로 확장합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
