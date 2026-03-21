'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'litho' | 'ins2' | 'etch' | 'ins3' | 'next' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string; isInspect: boolean }> = {
    litho: { label: '리소그래피', sub: 'Lithography', desc: '코팅→노광→현상. 패턴 형성의 핵심 단계.', color: '#71717a', isInspect: false },
    ins2:  { label: '검사 (ADI)', sub: 'After Develop', desc: 'After Develop Inspection — 식각 전 마지막 Rework 기회. 레지스트 패턴 결함 탐지.', color: '#ef4444', isInspect: true },
    etch:  { label: '식각', sub: 'Etch', desc: '레지스트 패턴을 마스크로 하부막 식각. 이후 되돌릴 수 없음.', color: '#71717a', isInspect: false },
    ins3:  { label: '검사 (AEI)', sub: 'After Etch', desc: 'After Etch Inspection — 최종 패턴 형태 확인. 식각 공정 자체의 문제 탐지.', color: '#3b82f6', isInspect: true },
    next:  { label: '다음 공정', sub: '...', desc: '후속 공정으로 진행. 결함 데이터는 FDC/SPC 시스템과 연동.', color: '#71717a', isInspect: false },
};

const ORDER: Exclude<NodeId, null>[] = ['litho', 'ins2', 'etch', 'ins3', 'next'];
const SVG_W = 700;
const SVG_H = 80;
const NODE_W = 88;
const NODE_H = 44;
const CY = SVG_H / 2;
const GAP = (SVG_W - ORDER.length * NODE_W) / (ORDER.length + 1);
const POS = ORDER.map((_, i) => GAP * (i + 1) + NODE_W * (i + 0.5));

export default function InspectionCheckpoints() {
    const [hovered, setHovered] = useState<NodeId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                공정 흐름 내 검사 포인트
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                ADI(식각 전)는 Rework 가능한 마지막 기회, AEI(식각 후)는 최종 패턴 확인
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    {ORDER.slice(0, -1).map((_, i) => (
                        <line key={i} x1={POS[i] + NODE_W / 2} y1={CY} x2={POS[i + 1] - NODE_W / 2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrow)" />
                    ))}
                    <defs><marker id="arrow" viewBox="0 0 6 6" refX={6} refY={3} markerWidth={4} markerHeight={4} orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill="rgba(255,255,255,0.15)" />
                    </marker></defs>
                    {ORDER.map((id, i) => {
                        const x = POS[i]; const info = NODES[id];
                        const active = hovered === id;
                        const dimmed = hovered !== null && hovered !== id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - NODE_W / 2 - 4} y={CY - NODE_H / 2 - 4} width={NODE_W + 8} height={NODE_H + 8} fill="transparent" />
                                <rect x={x - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={info.isInspect ? 20 : 8}
                                    fill={active ? `${info.color}15` : info.isInspect ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)'}
                                    stroke={active ? `${info.color}50` : info.isInspect ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'} strokeWidth={info.isInspect ? 1.5 : 1}
                                    strokeDasharray={info.isInspect ? '4 2' : 'none'} />
                                <text x={x} y={CY - 4} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                                <text x={x} y={CY + 10} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={10}>{info.sub}</text>
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: NODES[hovered].color, marginBottom: 2 }}>{NODES[hovered].label} ({NODES[hovered].sub})</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{NODES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 노드를 호버하세요. 점선 원형 노드가 검사 포인트입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
