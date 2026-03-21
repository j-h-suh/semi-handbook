'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'prev' | 'thick' | 'apc' | 'scanner' | 'cdmet' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    prev:    { label: '이전 로트 CD', sub: 'Feedback', desc: '이전 로트의 CD 측정 결과에서 체계적 드리프트를 파악하여 Dose/Focus 기준값을 업데이트.', color: '#ef4444' },
    thick:   { label: '레지스트 두께', sub: 'Feed-Forward', desc: '엘립소미터로 측정한 두께 맵. 두꺼운 곳에 Dose를 더 주어 CD를 선제적으로 보정.', color: '#3b82f6' },
    apc:     { label: 'APC 컨트롤러', sub: 'Dose/Focus 보정값', desc: 'Feedback + Feed-Forward를 종합하여 최적 Dose/Focus 보정값을 산출.', color: '#22c55e' },
    scanner: { label: '스캐너 노광', sub: '보정 적용', desc: 'APC 보정값을 적용하여 노광. Dose Mapper로 위치별 미세 조정.', color: '#f59e0b' },
    cdmet:   { label: 'CD 계측', sub: 'CD-SEM / OCD', desc: '노광+식각 후 CD를 측정하여 APC에 피드백. 다음 로트 보정에 반영.', color: '#a78bfa' },
};

const SVG_W = 600;
const SVG_H = 160;
const CY = 80;
const POS: Record<Exclude<NodeId, null>, { x: number; y: number }> = {
    prev:    { x: 60, y: 40 },
    thick:   { x: 60, y: 120 },
    apc:     { x: 230, y: CY },
    scanner: { x: 400, y: CY },
    cdmet:   { x: 540, y: CY },
};
const NODE_W = 120;
const NODE_H = 44;

export default function CDApcLoop() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                CD APC 보정 루프
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Feed-Forward(두께) + Feedback(CD) → Dose/Focus 자동 보정
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {/* 화살표 */}
                    <line x1={POS.prev.x + NODE_W / 2} y1={POS.prev.y} x2={POS.apc.x - NODE_W / 2} y2={POS.apc.y} stroke="rgba(239,68,68,0.3)" strokeWidth={1} />
                    <line x1={POS.thick.x + NODE_W / 2} y1={POS.thick.y} x2={POS.apc.x - NODE_W / 2} y2={POS.apc.y} stroke="rgba(59,130,246,0.3)" strokeWidth={1} />
                    <line x1={POS.apc.x + NODE_W / 2} y1={POS.apc.y} x2={POS.scanner.x - NODE_W / 2} y2={POS.scanner.y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    <line x1={POS.scanner.x + NODE_W / 2} y1={POS.scanner.y} x2={POS.cdmet.x - NODE_W / 2} y2={POS.cdmet.y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    {/* Feedback loop */}
                    <path d={`M ${POS.cdmet.x} ${POS.cdmet.y - NODE_H / 2 - 4} C ${POS.cdmet.x} ${10}, ${POS.prev.x} ${10}, ${POS.prev.x} ${POS.prev.y - NODE_H / 2 - 4}`}
                        fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth={1} strokeDasharray="4 3" />

                    {(Object.keys(NODES) as Exclude<NodeId, null>[]).map(id => {
                        const pos = POS[id];
                        const info = NODES[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={pos.x - NODE_W / 2 - 6} y={pos.y - NODE_H / 2 - 4} width={NODE_W + 12} height={NODE_H + 8} fill="transparent" />
                                <rect x={pos.x - NODE_W / 2} y={pos.y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={pos.x} y={pos.y - 4} textAnchor="middle" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                                <text x={pos.x} y={pos.y + 12} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 노드를 호버하세요. 레지스트 두께(Feed-Forward)와 이전 CD(Feedback)로 Dose/Focus를 자동 보정합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
