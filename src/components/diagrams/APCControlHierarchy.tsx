'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'spc' | 'fdc' | 'apc' | 'eng' | 'tool' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    spc:  { label: 'SPC', sub: '감시: 이탈 알람', desc: '공정 결과(CD, OVL)를 모니터링하여 관리 한계 이탈 시 알람. 엔지니어에게 알림.', color: '#3b82f6' },
    fdc:  { label: 'FDC', sub: '탐지: 장비 이상', desc: '장비 센서 데이터를 실시간 감시하여 장비 이상을 탐지. 엔지니어에게 알림.', color: '#22c55e' },
    eng:  { label: '엔지니어', sub: '수동 조치', desc: 'SPC/FDC 알람을 받아 원인 분석 후 수동으로 장비 레시피를 수정.', color: '#f59e0b' },
    apc:  { label: 'APC', sub: '제어: 자동 조정', desc: '계측 데이터 기반으로 공정 조건(Dose/Focus/Offset)을 자동 조정. 사람 개입 불필요.', color: '#a855f7' },
    tool: { label: '장비', sub: '레시피 수정', desc: '엔지니어의 수동 조치 또는 APC의 자동 조정 결과가 장비에 반영되어 다음 로트 실행.', color: '#ef4444' },
};

const SVG_W = 560;
const SVG_H = 130;
const NODE_W = 90;
const NODE_H = 50;

/* Node positions */
const POS: Record<Exclude<NodeId, null>, { x: number; y: number }> = {
    spc:  { x: 70, y: 36 },
    fdc:  { x: 70, y: 94 },
    eng:  { x: 245, y: 65 },
    apc:  { x: 350, y: 65 },
    tool: { x: 490, y: 65 },
};

export default function APCControlHierarchy() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDim = (id: NodeId) => hovered !== null && hovered !== id;

    const renderNode = (id: Exclude<NodeId, null>) => {
        const { x, y } = POS[id];
        const info = NODES[id];
        const active = hovered === id;
        return (
            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={x - NODE_W / 2 - 4} y={y - NODE_H / 2 - 4} width={NODE_W + 8} height={NODE_H + 8} fill="transparent" />
                <rect x={x - NODE_W / 2} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                <text x={x} y={y - 6} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                <text x={x} y={y + 12} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
            </motion.g>
        );
    };

    const arrow = (x1: number, y1: number, x2: number, y2: number, dashed = false) => (
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray={dashed ? '4 3' : 'none'} />
    );

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                공정 제어 체계 — SPC · FDC · APC
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                SPC/FDC = 알려주는 시스템 · APC = 스스로 고치는 시스템
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 560 }}>
                    {/* Arrows */}
                    {arrow(POS.spc.x + NODE_W / 2, POS.spc.y, POS.eng.x - NODE_W / 2, POS.eng.y)}
                    {arrow(POS.fdc.x + NODE_W / 2, POS.fdc.y, POS.eng.x - NODE_W / 2, POS.eng.y)}
                    {arrow(POS.eng.x + NODE_W / 2, POS.eng.y, POS.tool.x - NODE_W / 2, POS.tool.y, true)}
                    {arrow(POS.apc.x + NODE_W / 2, POS.apc.y, POS.tool.x - NODE_W / 2, POS.tool.y)}
                    {/* Labels */}
                    <text x={(POS.eng.x + POS.tool.x) / 2} y={POS.eng.y - 30} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min} opacity={0.5}>수동 조치</text>
                    <text x={(POS.apc.x + POS.tool.x) / 2} y={POS.apc.y + 36} textAnchor="middle" fill="#a855f7" fontSize={FONT.min} opacity={0.5}>자동 조정</text>

                    {/* Nodes */}
                    {renderNode('spc')}
                    {renderNode('fdc')}
                    {renderNode('eng')}
                    {renderNode('apc')}
                    {renderNode('tool')}
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 노드를 호버하세요. SPC/FDC는 알림, APC는 자동 제어 — 감시에서 제어로의 진화입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
