'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'light' | 'grating' | 'spectrum' | 'library' | 'result' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    light:    { label: '광대역 광원', sub: '190–850nm', desc: 'DUV에서 근적외선까지 넓은 파장 범위의 빛을 격자 타겟에 조사.', color: '#3b82f6' },
    grating:  { label: '주기적 격자', sub: '타겟 구조물', desc: '반복 패턴이 있는 전용 계측 타겟. 형상에 따라 반사 스펙트럼이 고유하게 변화.', color: '#f59e0b' },
    spectrum: { label: '반사 스펙트럼', sub: 'Ψ, Δ 측정', desc: '반사된 빛의 편광 상태 변화(엘립소메트리)를 파장별로 측정. Mueller Matrix로 풍부한 정보 추출.', color: '#22c55e' },
    library:  { label: '라이브러리 매칭', sub: 'RCWA 시뮬레이션', desc: '다양한 형상 조합에 대한 이론적 스펙트럼(라이브러리)과 실측값을 비교. 최소 자승 피팅.', color: '#a78bfa' },
    result:   { label: '3D 프로파일', sub: 'CD, Height, SWA', desc: '최적 매칭된 형상 파라미터를 추출. CD뿐 아니라 높이, 측벽 각도까지 한 번에 측정.', color: '#ef4444' },
};

const SVG_W = 740;
const SVG_H = 100;
const NODE_W = 130;
const NODE_H = 54;
const CY = SVG_H / 2;
const ORDER: Exclude<NodeId, null>[] = ['light', 'grating', 'spectrum', 'library', 'result'];
const GAP = (SVG_W - 5 * NODE_W) / 6;
const POSITIONS = ORDER.map((_, i) => GAP * (i + 1) + NODE_W * (i + 0.5));

export default function OCDPrinciple() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                OCD (Scatterometry) 측정 원리
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                광원 → 격자 → 스펙트럼 → 라이브러리 매칭 → 3D 프로파일
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. 빛의 산란 패턴으로 3D 형상을 역추정하는 OCD의 원리입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
