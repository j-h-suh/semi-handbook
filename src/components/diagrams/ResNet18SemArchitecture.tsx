'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type BlockId = 'input' | 'conv1' | 'res1' | 'res2' | 'res3' | 'res4' | 'pool' | 'fc' | null;

const BLOCKS: Record<Exclude<BlockId, null>, { label: string; sub: string; desc: string; color: string; w: number }> = {
    input: { label: 'Input', sub: '64×64×1', desc: 'SEM 결함 이미지. Grayscale 64×64 또는 128×128. 다양한 결함 유형(Bridge, Break, Particle 등)이 입력.', color: '#6b7280', w: 64 },
    conv1: { label: 'Conv1', sub: '7×7, 64', desc: '초기 대형 커널로 저수준 특징(에지, 텍스처) 추출. BatchNorm + ReLU + MaxPool 포함.', color: '#3b82f6', w: 64 },
    res1:  { label: 'Res Block ×2', sub: '64ch', desc: 'ResNet Skip Connection. 입력을 출력에 더해 기울기 소실 방지. 64채널에서 기본 패턴 학습.', color: '#22c55e', w: 80 },
    res2:  { label: 'Res Block ×2', sub: '128ch', desc: '채널 2배 증가 + Stride 2로 다운샘플링. 중간 수준 특징(결함 경계, 형태) 학습.', color: '#22c55e', w: 80 },
    res3:  { label: 'Res Block ×2', sub: '256ch', desc: '고수준 특징(결함 유형별 패턴) 학습. SEM 이미지가 작아서 여기서 충분히 구분.', color: '#22c55e', w: 80 },
    res4:  { label: 'Res Block ×2', sub: '512ch', desc: '최고 수준 추상화. 64×64 이미지에서는 이 블록이 과도할 수 있어 ResNet-18을 권장.', color: '#22c55e', w: 80 },
    pool:  { label: 'GAP', sub: '1×1×512', desc: 'Global Average Pooling. 공간 차원을 완전히 제거하여 위치 불변 특징 벡터 생성.', color: '#a855f7', w: 60 },
    fc:    { label: 'FC', sub: 'N classes', desc: 'Fully Connected 분류층. Bridge, Break, Particle, Residue 등 N개 결함 유형으로 분류. Softmax 출력.', color: '#f59e0b', w: 64 },
};

const ORDER: Exclude<BlockId, null>[] = ['input', 'conv1', 'res1', 'res2', 'res3', 'res4', 'pool', 'fc'];

const SVG_W = 760;
const SVG_H = 70;
const NODE_H = 42;
const GAP = 10;

const TOTAL_W = ORDER.reduce((s, id) => s + BLOCKS[id].w, 0) + (ORDER.length - 1) * GAP;
const X0 = (SVG_W - TOTAL_W) / 2;
const CY = SVG_H / 2;

export default function ResNet18SemArchitecture() {
    const [hovered, setHovered] = useState<BlockId>(null);
    const isDim = (id: BlockId) => hovered !== null && hovered !== id;

    let cx = X0;
    const positions = ORDER.map(id => {
        const w = BLOCKS[id].w;
        const x = cx + w / 2;
        cx += w + GAP;
        return { id, x, w };
    });

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                ResNet-18 아키텍처 — SEM 결함 분류용
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Conv1 → 4 Residual Blocks → Global Average Pooling → FC → 결함 유형
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 760 }}>
                    <defs>
                        <marker id="arrowR" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {/* Arrows */}
                    {positions.slice(0, -1).map((p, i) => (
                        <line key={i} x1={p.x + p.w / 2} y1={CY} x2={positions[i + 1].x - positions[i + 1].w / 2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrowR)" />
                    ))}
                    {/* Blocks */}
                    {positions.map(({ id, x, w }) => {
                        const info = BLOCKS[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - w / 2 - 4} y={CY - NODE_H / 2 - 4} width={w + 8} height={NODE_H + 8} fill="transparent" />
                                <rect x={x - w / 2} y={CY - NODE_H / 2} width={w} height={NODE_H} rx={6}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x} y={CY - 6} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                                <text x={x} y={CY + 10} textAnchor="middle" dominantBaseline="central"
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: BLOCKS[hovered].color, marginBottom: 2 }}>{BLOCKS[hovered].label} ({BLOCKS[hovered].sub})</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{BLOCKS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 블록을 호버하세요. SEM 64×64 이미지에서는 ResNet-18이 가장 보편적입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
