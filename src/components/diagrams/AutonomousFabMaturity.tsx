'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type LevelId = 'l1' | 'l2' | 'l3' | 'l4' | 'l5' | null;

const LEVELS: Record<Exclude<LevelId, null>, { label: string; name: string; desc: string; current: boolean; color: string }> = {
    l1: { label: 'Level 1', name: '모니터링', desc: 'SPC/FDC 알람 자동. 판단/조치는 인간. 현재 대부분의 팹이 이 수준.', current: true, color: '#3b82f6' },
    l2: { label: 'Level 2', name: '추천', desc: 'AI가 원인 분석 + 조치 추천. 인간이 실행 여부 결정. 디스패칭/PM 스케줄링 영역.', current: true, color: '#22c55e' },
    l3: { label: 'Level 3', name: '반자율', desc: 'AI가 Safety Guard 내에서 자동 보정. 인간이 감독. 현재 APC가 이 수준.', current: true, color: '#f59e0b' },
    l4: { label: 'Level 4', name: '고자율', desc: '대부분 자동. 인간은 예외 처리만. 2029~2030 선도 팹 목표.', current: false, color: '#a855f7' },
    l5: { label: 'Level 5', name: '완전 자율', desc: 'AI가 전체 팹 운영. 인간은 전략만. "인간-AI 협업"이 더 현실적 경로.', current: false, color: '#ef4444' },
};

const ORDER: Exclude<LevelId, null>[] = ['l1', 'l2', 'l3', 'l4', 'l5'];

const SVG_W = 700;
const SVG_H = 110;
const BAR_W = 116;
const BAR_H = 56;
const GAP = 14;
const TOTAL = ORDER.length * BAR_W + (ORDER.length - 1) * GAP;
const X0 = (SVG_W - TOTAL) / 2 + BAR_W / 2;
const CY = 50;

export default function AutonomousFabMaturity() {
    const [hovered, setHovered] = useState<LevelId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                자율 팹 성숙도 모델 — Level 1~5
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                모니터링 → 추천 → 반자율 → 고자율 → 완전 자율
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    <defs>
                        <marker id="arrowAF" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {ORDER.slice(0, -1).map((_, i) => {
                        const x1 = X0 + i * (BAR_W + GAP) + BAR_W / 2;
                        const x2 = X0 + (i + 1) * (BAR_W + GAP) - BAR_W / 2;
                        return <line key={i} x1={x1} y1={CY} x2={x2} y2={CY}
                            stroke="rgba(255,255,255,0.08)" strokeWidth={1} markerEnd="url(#arrowAF)" />;
                    })}
                    {/* Current indicator line */}
                    <line x1={X0 + 2 * (BAR_W + GAP) + BAR_W / 2 + 4} y1={CY - BAR_H / 2 - 8} x2={X0 + 2 * (BAR_W + GAP) + BAR_W / 2 + 4} y2={CY + BAR_H / 2 + 8}
                        stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="3 2" />
                    <text x={X0 + 2 * (BAR_W + GAP) + BAR_W / 2 + 8} y={CY - BAR_H / 2 - 12} textAnchor="start" fill={COLOR.textDim} fontSize={FONT.min} opacity={0.5}>← 현재</text>
                    <text x={X0 + 2 * (BAR_W + GAP) + BAR_W / 2 + 8} y={CY + BAR_H / 2 + 18} textAnchor="start" fill={COLOR.textDim} fontSize={FONT.min} opacity={0.5}>미래 →</text>
                    {ORDER.map((id, i) => {
                        const cx = X0 + i * (BAR_W + GAP);
                        const info = LEVELS[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: hovered !== null && hovered !== id ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={cx - BAR_W / 2 - 4} y={CY - BAR_H / 2 - 4} width={BAR_W + 8} height={BAR_H + 8} fill="transparent" />
                                <rect x={cx - BAR_W / 2} y={CY - BAR_H / 2} width={BAR_W} height={BAR_H} rx={8}
                                    fill={active ? `${info.color}15` : info.current ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)'}
                                    stroke={active ? `${info.color}50` : info.current ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}
                                    strokeWidth={active ? 1.5 : 1} />
                                <text x={cx} y={CY - 8} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>{info.label}</text>
                                <text x={cx} y={CY + 12} textAnchor="middle" dominantBaseline="central"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.name}</text>
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: LEVELS[hovered].color, marginBottom: 2 }}>{LEVELS[hovered].label}: {LEVELS[hovered].name} {LEVELS[hovered].current ? '(현재)' : '(미래)'}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{LEVELS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 레벨을 호버하세요. 현재 팹은 Level 2~3. Level 4~5는 인간-AI 협업이 핵심.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
