'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'ins' | 'rev' | 'adc' | 'db' | 'pa' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    ins: { label: '검사 장비', sub: '결함 좌표 리스트', desc: '광학/e-beam 검사로 웨이퍼 스캔. 결함 후보의 (X,Y) 좌표 리스트 출력.', color: '#3b82f6' },
    rev: { label: 'Review SEM', sub: '결함 고배율 이미지', desc: '결함 좌표로 이동 → 고배율 SEM 이미지 촬영. 30,000~100,000× 배율.', color: '#22c55e' },
    adc: { label: 'ADC 엔진', sub: '자동 분류', desc: 'CNN/딥러닝으로 SEM 이미지에서 결함 유형 자동 분류. 정확도 95%+.', color: '#f59e0b' },
    db:  { label: '결함 DB', sub: '유형별 집계/추이', desc: '분류 결과를 DB에 저장. 시간대별·장비별·유형별 추이 모니터링.', color: '#a855f7' },
    pa:  { label: 'Pareto 분석', sub: '우선순위 결정', desc: '상위 20% 원인 → 80% 결함. 결함 빈도 순 정렬로 대응 우선순위 결정.', color: '#ef4444' },
};

const ORDER: Exclude<NodeId, null>[] = ['ins', 'rev', 'adc', 'db', 'pa'];
const SVG_W = 720;
const SVG_H = 100;
const NODE_W = 125;
const NODE_H = 62;
const CY = SVG_H / 2;
const GAP = (SVG_W - 5 * NODE_W) / 6;
const POS = ORDER.map((_, i) => GAP * (i + 1) + NODE_W * (i + 0.5));

export default function ADCPipeline() {
    const [hovered, setHovered] = useState<NodeId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                ADC(자동 결함 분류) 파이프라인
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                검사 → Review SEM → ADC 엔진 → 결함 DB → Pareto 분석
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 720 }}>
                    {ORDER.slice(0, -1).map((_, i) => (
                        <line key={i} x1={POS[i] + NODE_W / 2} y1={CY} x2={POS[i + 1] - NODE_W / 2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    ))}
                    {ORDER.map((id, i) => {
                        const x = POS[i]; const info = NODES[id];
                        const active = hovered === id;
                        const dimmed = hovered !== null && hovered !== id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - NODE_W / 2 - 4} y={CY - NODE_H / 2 - 4} width={NODE_W + 8} height={NODE_H + 8} fill="transparent" />
                                <rect x={x - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x} y={CY - 8} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>{info.label}</text>
                                <text x={x} y={CY + 12} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: NODES[hovered].color, marginBottom: 2 }}>{NODES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{NODES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. 검사→Review→ADC→DB→Pareto의 결함 분류 파이프라인입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
