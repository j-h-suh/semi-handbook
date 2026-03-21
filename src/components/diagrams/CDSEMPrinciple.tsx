'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'beam' | 'surface' | 'se' | 'detector' | 'algo' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    beam:     { label: '전자빔 조사', sub: '~500eV–1keV', desc: '가속 전압으로 전자빔을 패턴 표면에 주사. 드브로이 파장 수 pm — 가시광선보다 수만 배 짧아 nm 해상도 가능.', color: '#3b82f6' },
    surface:  { label: '패턴 표면', sub: '스캔 영역', desc: '전자빔이 좌우로 래스터 스캔하며 패턴 표면을 훑음. 에지 부분에서 기하학적 조건이 변화.', color: '#a1a1aa' },
    se:       { label: '이차전자 방출', sub: '표면 형상 정보', desc: '전자빔에 의해 방출되는 이차전자. 에지(측벽)에서 방출이 급증 — 기하학적으로 탈출이 쉬움.', color: '#f59e0b' },
    detector: { label: 'SEM 이미지', sub: 'Top-Down View', desc: '이차전자 강도를 2D 이미지로 변환. 에지가 밝은 선으로 나타남.', color: '#22c55e' },
    algo:     { label: '에지 검출', sub: 'CD 측정', desc: '밝기 프로파일에서 좌/우 에지 위치를 결정하고 두 에지 사이 거리로 CD를 산출. 임계값 정의가 핵심.', color: '#ef4444' },
};

const SVG_W = 740;
const SVG_H = 100;
const NODE_W = 130;
const NODE_H = 54;
const CY = SVG_H / 2;
const ORDER: Exclude<NodeId, null>[] = ['beam', 'surface', 'se', 'detector', 'algo'];
const GAP = (SVG_W - 5 * NODE_W) / 6;
const POSITIONS = ORDER.map((_, i) => GAP * (i + 1) + NODE_W * (i + 0.5));

export default function CDSEMPrinciple() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                CD-SEM 측정 원리
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                전자빔 → 이차전자 → 에지 검출 → CD
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {[0, 1, 2, 3].map(i => (
                        <line key={i} x1={POSITIONS[i] + NODE_W / 2} y1={CY} x2={POSITIONS[i + 1] - NODE_W / 2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    ))}
                    {ORDER.map((id, i) => {
                        const x = POSITIONS[i];
                        const info = NODES[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - NODE_W / 2 - 6} y={CY - NODE_H / 2 - 4} width={NODE_W + 12} height={NODE_H + 8} fill="transparent" />
                                <rect x={x - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x} y={CY - 8} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.body} fontWeight={600}>{info.label}</text>
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: NODES[hovered].color, marginBottom: 2 }}>{NODES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{NODES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. 전자빔으로 패턴을 직접 관찰하는 CD-SEM의 측정 원리입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
