'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StageId = 'shadow' | 'advisory' | 'semi' | 'full' | null;

const STAGES: Record<Exclude<StageId, null>, { label: string; sub: string; period: string; desc: string; color: string }> = {
    shadow:   { label: 'Shadow Mode', sub: '병렬 실행', period: '1~2개월', desc: '기존 방식 유지, 모델 예측만 기록. 리스크 제로로 실전 성능 검증. "적용했더라면?" 분석.', color: '#6b7280' },
    advisory: { label: 'Advisory Mode', sub: '추천 제시', period: '2~3개월', desc: '모델 추천값을 엔지니어에게 제시, 최종 결정은 인간. 경험과 비교하며 신뢰 축적.', color: '#3b82f6' },
    semi:     { label: 'Semi-Auto', sub: '부분 자동', period: '3~6개월', desc: 'Safety Guard 통과 시 자동 적용, 범위 밖은 인간 확인. 루틴 보정 자동화.', color: '#22c55e' },
    full:     { label: 'Full Auto', sub: '전면 자동', period: '6개월~', desc: '전면 자동화 + 모니터링/Fallback 유지. 성능 열화 시 EWMA 등으로 자동 복귀.', color: '#a855f7' },
};

const ORDER: Exclude<StageId, null>[] = ['shadow', 'advisory', 'semi', 'full'];

const SVG_W = 600;
const SVG_H = 70;
const NODE_W = 120;
const NODE_H = 46;
const GAP = 16;
const TOTAL = 4 * NODE_W + 3 * GAP;
const X0 = (SVG_W - TOTAL) / 2 + NODE_W / 2;
const CY = SVG_H / 2;

export default function TrustBuildingRoadmap() {
    const [hovered, setHovered] = useState<StageId>(null);
    const isDim = (id: StageId) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                신뢰 구축 로드맵 — Shadow에서 Full Auto까지
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                각 단계 → 성능 메트릭 + 엔지니어 합의 → 다음 단계
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {/* Arrows between stages */}
                    {[0, 1, 2].map(i => {
                        const x1 = X0 + i * (NODE_W + GAP) + NODE_W / 2;
                        const x2 = X0 + (i + 1) * (NODE_W + GAP) - NODE_W / 2;
                        return <line key={i} x1={x1} y1={CY} x2={x2} y2={CY} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />;
                    })}
                    {ORDER.map((id, i) => {
                        const cx = X0 + i * (NODE_W + GAP);
                        const info = STAGES[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={cx - NODE_W / 2 - 4} y={CY - NODE_H / 2 - 4} width={NODE_W + 8} height={NODE_H + 8} fill="transparent" />
                                <rect x={cx - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={cx} y={CY - 8} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                                <text x={cx} y={CY + 10} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                <span style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STAGES[hovered].color }}>{STAGES[hovered].label}</span>
                                <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>{STAGES[hovered].period}</span>
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{STAGES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. 신뢰는 한 번에 얻지 않습니다 — 단계적으로 쌓아가야 합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
