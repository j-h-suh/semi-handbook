'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'global' | 'local' | 'ler' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    global: { label: 'Global CDU', sub: '웨이퍼 전체 · 수 nm', desc: '웨이퍼 전체에 걸친 CD 변동. 센터-엣지 프로파일이 전형적. 레지스트 두께, PEB 온도, 스캐너 Dose 불균일이 원인. Dose Mapper로 보정 가능.', color: '#3b82f6' },
    local:  { label: 'Local CDU', sub: '필드/다이 내부 · 수 nm', desc: '노광 필드 내부의 CD 변동. 렌즈 수차, 마스크 CD 불균일, 슬릿 조명 프로파일이 원인. 모든 필드에서 반복적으로 나타남.', color: '#f59e0b' },
    ler:    { label: 'LER / LWR', sub: '패턴 에지 · 서브-nm', desc: 'Line Edge/Width Roughness. 광자 통계(Shot Noise)에 의한 확률적 변동. 물리적 한계이므로 보정이 근본적으로 어려움. RLS 트릴레마와 직결.', color: '#ef4444' },
};

const SVG_W = 560;
const SVG_H = 80;
const CY = SVG_H / 2;
const NODE_W = 140;
const NODE_H = 44;
const GAP = (SVG_W - 3 * NODE_W) / 4;
const POSITIONS = [
    { x: GAP + NODE_W / 2, y: CY },
    { x: 2 * GAP + NODE_W * 1.5, y: CY },
    { x: 3 * GAP + NODE_W * 2.5, y: CY },
];
const ORDER: Exclude<NodeId, null>[] = ['global', 'local', 'ler'];

export default function CDUHierarchy() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                CD 균일도 계층
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Global → Local → LER/LWR — 공간 스케일별 분해
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 560 }}>
                    {[0, 1].map(i => (
                        <line key={i} x1={POSITIONS[i].x + NODE_W / 2} y1={CY} x2={POSITIONS[i + 1].x - NODE_W / 2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    ))}
                    {ORDER.map((id, i) => {
                        const pos = POSITIONS[i];
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 노드를 호버하세요. CDU는 세 가지 공간 스케일로 분해됩니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
