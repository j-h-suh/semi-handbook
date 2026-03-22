'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StepId = 'guide' | 'coat' | 'anneal' | 'remove' | 'pattern' | null;

const STEPS: Record<Exclude<StepId, null>, { label: string; sub: string; desc: string; color: string }> = {
    guide:   { label: '1. 가이드 패턴', sub: '기존 리소', desc: '기존 리소그래피로 대략적 패턴(~20nm 피치) 형성. BCP 자기 조립의 방향을 결정하는 템플릿.', color: '#3b82f6' },
    coat:    { label: '2. BCP 코팅', sub: '공폴리머 도포', desc: '블록 공폴리머(PS-PMMA 등)를 스핀 코팅. 두 블록의 분자량이 최종 패턴 피치를 결정.', color: '#22c55e' },
    anneal:  { label: '3. 열처리', sub: '자기 조립 유도', desc: '열을 가하면 두 블록이 자발적으로 분리 → 규칙적 나노 패턴(라멜라/실린더). 열역학적 평형.', color: '#f59e0b' },
    remove:  { label: '4. 선택적 식각', sub: '한쪽 블록 제거', desc: 'PMMA를 선택적으로 제거(O₂ 플라즈마). PS만 남아 패턴으로 사용.', color: '#a855f7' },
    pattern: { label: '5. 미세 패턴', sub: '리소보다 작은 피치', desc: '가이드 20nm → BCP 자기 조립 → 5nm 피치 최종 패턴. 해상도 4× 증폭 달성.', color: '#ef4444' },
};

const ORDER: Exclude<StepId, null>[] = ['guide', 'coat', 'anneal', 'remove', 'pattern'];

const SVG_W = 700;
const SVG_H = 100;
const NODE_W = 118;
const NODE_H = 54;
const GAP = 12;
const TOTAL = ORDER.length * NODE_W + (ORDER.length - 1) * GAP;
const X0 = (SVG_W - TOTAL) / 2 + NODE_W / 2;
const CY = SVG_H / 2;

export default function DsaProcessFlow() {
    const [hovered, setHovered] = useState<StepId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                DSA 공정 흐름 — 분자의 자기 조립
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                가이드 패턴 → BCP 코팅 → 열처리 → 식각 → 미세 패턴
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    <defs>
                        <marker id="arrowDSA" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {ORDER.slice(0, -1).map((_, i) => {
                        const x1 = X0 + i * (NODE_W + GAP) + NODE_W / 2;
                        const x2 = X0 + (i + 1) * (NODE_W + GAP) - NODE_W / 2;
                        return <line key={i} x1={x1} y1={CY} x2={x2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrowDSA)" />;
                    })}
                    {ORDER.map((id, i) => {
                        const cx = X0 + i * (NODE_W + GAP);
                        const info = STEPS[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: hovered !== null && hovered !== id ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={cx - NODE_W / 2 - 4} y={CY - NODE_H / 2 - 4} width={NODE_W + 8} height={NODE_H + 8} fill="transparent" />
                                <rect x={cx - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={cx} y={CY - 6} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>{info.label}</text>
                                <text x={cx} y={CY + 12} textAnchor="middle" dominantBaseline="central"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STEPS[hovered].color, marginBottom: 2 }}>{STEPS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{STEPS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. 기존 리소 해상도를 BCP 자기 조립으로 4× 증폭합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
