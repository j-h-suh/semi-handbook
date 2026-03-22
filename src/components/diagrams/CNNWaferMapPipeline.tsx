'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'wm' | 'cnn' | 'fc' | 'out' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    wm:  { label: '웨이퍼맵', sub: '2D 이미지화', desc: '다이 좌표를 64×64 또는 128×128 정사각형 그리드로 매핑. Pass=0, Fail=1 이진 인코딩.', color: '#3b82f6' },
    cnn: { label: 'CNN', sub: '특징 자동 추출', desc: 'Conv→ReLU→Pool 반복. 에지 곡률, 클러스터 밀도, 링 반경 등을 자동 학습. 피처 엔지니어링 불필요.', color: '#22c55e' },
    fc:  { label: 'Fully Connected', sub: '분류', desc: '추출된 특징 벡터를 입력받아 패턴 유형별 확률 출력. Softmax(단일) 또는 Sigmoid(혼합).', color: '#f59e0b' },
    out: { label: '패턴 유형', sub: 'Edge/Center/Ring/…', desc: '8대 패턴 + None 분류. WM-811K 벤치마크 기준 95~98% 정확도.', color: '#a855f7' },
};

const ORDER: Exclude<NodeId, null>[] = ['wm', 'cnn', 'fc', 'out'];
const SVG_W = 620;
const SVG_H = 80;
const NODE_W = 120;
const NODE_H = 52;
const CY = SVG_H / 2;
const GAP = (SVG_W - 4 * NODE_W) / 5;
const POS = ORDER.map((_, i) => GAP * (i + 1) + NODE_W * (i + 0.5));

export default function CNNWaferMapPipeline() {
    const [hovered, setHovered] = useState<NodeId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                CNN 기반 웨이퍼맵 분류 파이프라인
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                이미지화 → CNN 특징 추출 → FC 분류 → 패턴 유형 출력
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 620 }}>
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
                                <text x={x} y={CY - 7} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>{info.label}</text>
                                <text x={x} y={CY + 10} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. 피처 엔지니어링 없이 CNN이 웨이퍼맵에서 패턴을 자동 학습합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
