'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type LayerId = 'layer3' | 'layer4' | 'layer5' | 'ai' | null;

const LAYERS: Record<Exclude<LayerId, null>, { label: string; sub: string; desc: string; color: string }> = {
    layer3: { label: 'Layer 3', sub: 'Gate', desc: 'Gate 형성 레이어. CD 보정 수행. 이 층의 Overlay 변형이 후속 레이어에 누적 영향.', color: '#3b82f6' },
    layer4: { label: 'Layer 4', sub: 'Contact', desc: 'Contact hole 형성. Layer 3의 보정이 정렬 마크를 통해 영향을 줌.', color: '#22c55e' },
    layer5: { label: 'Layer 5', sub: 'Metal 1', desc: '첫 배선 레이어. Layer 3, 4의 누적 변형을 고려한 보정 필요.', color: '#f59e0b' },
    ai:     { label: 'AI 통합 최적화', sub: 'Global Optimization', desc: '다수 레이어를 한꺼번에 보고 Layer N 보정이 N+1, N+2에 미치는 영향까지 고려한 전체 최적화.', color: '#a855f7' },
};

const SVG_W = 500;
const SVG_H = 150;
const LAYER_W = 110;
const LAYER_H = 46;
const CY = 46;
const GAP = 24;
const TOTAL_W = LAYER_W * 3 + GAP * 2;
const X0 = (SVG_W - TOTAL_W) / 2 + LAYER_W / 2;

export default function CrossLayerAPC() {
    const [hovered, setHovered] = useState<LayerId>(null);
    const isDim = (id: LayerId) => hovered !== null && hovered !== id;

    const renderLayer = (id: Exclude<LayerId, null>, x: number, y: number, w = LAYER_W) => {
        const info = LAYERS[id];
        const active = hovered === id;
        return (
            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={x - w / 2 - 4} y={y - LAYER_H / 2 - 4} width={w + 8} height={LAYER_H + 8} fill="transparent" />
                <rect x={x - w / 2} y={y - LAYER_H / 2} width={w} height={LAYER_H} rx={8}
                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                <text x={x} y={y - 7} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                <text x={x} y={y + 10} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
            </motion.g>
        );
    };

    const X3 = X0;
    const X4 = X0 + LAYER_W + GAP;
    const X5 = X0 + (LAYER_W + GAP) * 2;
    const AI_X = SVG_W / 2;
    const AI_Y = 118;
    const AI_W = TOTAL_W;
    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Cross-Layer APC — 다층 통합 최적화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Layer N 보정 → Layer N+1, N+2 영향 고려 → AI 전체 최적화
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 500 }}>
                    {/* Inter-layer arrows */}
                    <line x1={X3 + LAYER_W / 2} y1={CY} x2={X4 - LAYER_W / 2} y2={CY} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    <line x1={X4 + LAYER_W / 2} y1={CY} x2={X5 - LAYER_W / 2} y2={CY} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    {/* AI encompassing bracket */}
                    <line x1={X3} y1={CY + LAYER_H / 2 + 8} x2={X3} y2={AI_Y - LAYER_H / 2} stroke="rgba(168,85,247,0.15)" strokeWidth={1} strokeDasharray="3 2" />
                    <line x1={X4} y1={CY + LAYER_H / 2 + 8} x2={X4} y2={AI_Y - LAYER_H / 2} stroke="rgba(168,85,247,0.15)" strokeWidth={1} strokeDasharray="3 2" />
                    <line x1={X5} y1={CY + LAYER_H / 2 + 8} x2={X5} y2={AI_Y - LAYER_H / 2} stroke="rgba(168,85,247,0.15)" strokeWidth={1} strokeDasharray="3 2" />

                    {renderLayer('layer3', X3, CY)}
                    {renderLayer('layer4', X4, CY)}
                    {renderLayer('layer5', X5, CY)}
                    {renderLayer('ai', AI_X, AI_Y, AI_W)}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: LAYERS[hovered].color, marginBottom: 2 }}>{LAYERS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{LAYERS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 레이어를 호버하세요. 기존 APC는 레이어 독립 운영, AI Cross-Layer APC는 다층 통합 최적화.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
