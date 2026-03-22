'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type LayerId = 'pretrain' | 'foundation' | 'finetune' | null;

const LAYERS: Record<Exclude<LayerId, null>, { label: string; sub: string; desc: string; color: string }> = {
    pretrain:   { label: '사전 학습', sub: '수십 팹 × 수년 데이터', desc: '수십 개 팹 × 수년 × 수백 장비의 FDC/계측/MES 데이터. Federated Learning으로 프라이버시 보장.', color: '#3b82f6' },
    foundation: { label: 'Foundation Model', sub: '공정 물리/패턴 이해', desc: '반도체 공정의 일반적 물리 법칙과 패턴을 이해한 거대 사전학습 모델. NLP의 GPT에 해당.', color: '#22c55e' },
    finetune:   { label: 'Fine-Tuning', sub: '특정 팹/장비에 소량 적응', desc: '새 제품/장비에 수십 웨이퍼만으로 모델 구축(Few-Shot). Cross-Process 이해 가능.', color: '#f59e0b' },
};

const ORDER: Exclude<LayerId, null>[] = ['pretrain', 'foundation', 'finetune'];

const SVG_W = 700;
const SVG_H = 200;
const NODE_W = 240;
const NODE_H = 48;
const GAP_Y = 16;
const CX = SVG_W / 2;

export default function FoundationModelArchitecture() {
    const [hovered, setHovered] = useState<LayerId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                반도체 Foundation Model 아키텍처
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                대규모 사전학습 → 범용 모델 → 소량 적응
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    <defs>
                        <marker id="arrowFM" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {ORDER.map((id, i) => {
                        const cy = 36 + i * (NODE_H + GAP_Y);
                        const info = LAYERS[id];
                        const active = hovered === id;
                        // Funnel: wider on top, narrower on bottom
                        const w = NODE_W - i * 40;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: hovered !== null && hovered !== id ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={CX - w / 2 - 4} y={cy - NODE_H / 2 - 4} width={w + 8} height={NODE_H + 8} fill="transparent" />
                                <rect x={CX - w / 2} y={cy - NODE_H / 2} width={w} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={CX} y={cy - 6} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>{info.label}</text>
                                <text x={CX} y={cy + 12} textAnchor="middle" dominantBaseline="central"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
                            </motion.g>
                        );
                    })}
                    {/* Arrows between layers */}
                    {[0, 1].map(i => {
                        const y1 = 36 + i * (NODE_H + GAP_Y) + NODE_H / 2;
                        const y2 = 36 + (i + 1) * (NODE_H + GAP_Y) - NODE_H / 2;
                        return <line key={i} x1={CX} y1={y1} x2={CX} y2={y2}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrowFM)" />;
                    })}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 계층을 호버하세요. GPT↔반도체의 유사 구조 — 대규모 사전학습 후 소량 적응.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
