'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 ─── */
type ModelId = 'idm' | 'fabless' | 'foundry' | null;

interface ModelInfo {
    label: string;
    sub: string;
    examples: string;
    desc: string;
    color: string;
}

const MODELS: Record<Exclude<ModelId, null>, ModelInfo> = {
    idm: {
        label: 'IDM',
        sub: 'Integrated Device Manufacturer',
        examples: 'Intel, Samsung, TI, SK hynix',
        desc: '설계 + 제조 + 판매를 모두 자체 수행. 설계-공정 동시 최적화가 가능하지만, 팹 건설 비용(~$20B)의 부담이 크다. 메모리 반도체에 적합.',
        color: '#ef4444',
    },
    fabless: {
        label: 'Fabless',
        sub: '팹리스 (설계 전문)',
        examples: 'Apple, NVIDIA, AMD, Qualcomm',
        desc: '설계와 판매만 수행, 제조는 파운드리에 위탁. 팹 투자 부담 없이 설계 역량에 집중. 각 제품에 최적 공정 자유롭게 선택 가능.',
        color: '#3b82f6',
    },
    foundry: {
        label: 'Foundry',
        sub: '파운드리 (제조 전문)',
        examples: 'TSMC, Samsung Foundry, GF',
        desc: '자체 브랜드 칩 없이 위탁 제조만 수행. TSMC가 시장 67~70% 점유. 최첨단 공정(3nm 이하)은 90% 이상 독점.',
        color: '#22c55e',
    },
};

/* ─── 박스 상수 ─── */
const BOX_W = 200;
const BOX_H = 80;
const GAP_X = 40;
const ARROW_LEN = 40;
const SVG_W = BOX_W * 3 + GAP_X * 2;
const SVG_H = BOX_H + 80; // 박스 + 화살표 영역

/* ─── 위치 계산 ─── */
const positions: Record<Exclude<ModelId, null>, { x: number; y: number }> = {
    idm: { x: 0, y: 0 },
    fabless: { x: BOX_W + GAP_X, y: 0 },
    foundry: { x: (BOX_W + GAP_X) * 2, y: 0 },
};

export default function SemiIndustryStructure() {
    const [hovered, setHovered] = useState<ModelId>(null);

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                반도체 산업의 세 가지 비즈니스 모델
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                IDM · Fabless · Foundry
            </p>

            <svg viewBox={`-10 -10 ${SVG_W + 20} ${SVG_H + 20}`} width="100%" style={{ maxWidth: 700, display: 'block', margin: '0 auto' }}>
                {/* 세 박스 */}
                {(Object.keys(MODELS) as Exclude<ModelId, null>[]).map((id) => {
                    const pos = positions[id];
                    const m = MODELS[id];
                    const isActive = hovered === id;
                    const isDimmed = hovered !== null && hovered !== id;
                    return (
                        <motion.g key={id}
                            onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                            animate={{ opacity: isDimmed ? 0.3 : 1 }}
                            transition={{ duration: 0.15 }}
                            style={{ cursor: 'pointer' }}>
                            <rect x={pos.x} y={pos.y} width={BOX_W} height={BOX_H} rx={10}
                                fill={isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}
                                stroke={isActive ? m.color : 'rgba(255,255,255,0.1)'} strokeWidth={isActive ? 2 : 1} />
                            <text x={pos.x + BOX_W / 2} y={pos.y + 28} textAnchor="middle"
                                fill={m.color} fontSize={FONT.cardHeader} fontWeight={700}>
                                {m.label}
                            </text>
                            <text x={pos.x + BOX_W / 2} y={pos.y + 48} textAnchor="middle"
                                fill={COLOR.textMuted} fontSize={FONT.min}>
                                {m.sub}
                            </text>
                            <text x={pos.x + BOX_W / 2} y={pos.y + 65} textAnchor="middle"
                                fill={COLOR.textDim} fontSize={FONT.min}>
                                {m.examples}
                            </text>
                        </motion.g>
                    );
                })}

                {/* 화살표: Fabless → Foundry (위탁 제조) */}
                <motion.g animate={{ opacity: hovered !== null && hovered !== 'fabless' && hovered !== 'foundry' ? 0.2 : 0.8 }}
                    transition={{ duration: 0.15 }}>
                    <defs>
                        <marker id="arrowHead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
                        </marker>
                    </defs>
                    <line x1={positions.fabless.x + BOX_W} y1={BOX_H / 2}
                        x2={positions.foundry.x} y2={BOX_H / 2}
                        stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#arrowHead)" />
                    <text x={positions.fabless.x + BOX_W + ARROW_LEN / 2} y={BOX_H / 2 - 8}
                        textAnchor="middle" fill="#f59e0b" fontSize={FONT.min}>
                        위탁 제조
                    </text>
                </motion.g>

                {/* IDM 자체 팹 (자기 순환 화살표) */}
                <motion.g animate={{ opacity: hovered !== null && hovered !== 'idm' ? 0.2 : 0.8 }}
                    transition={{ duration: 0.15 }}>
                    <path d={`M ${positions.idm.x + BOX_W / 2 - 15} ${BOX_H} 
                              C ${positions.idm.x + BOX_W / 2 - 15} ${BOX_H + 30}, 
                                ${positions.idm.x + BOX_W / 2 + 15} ${BOX_H + 30}, 
                                ${positions.idm.x + BOX_W / 2 + 15} ${BOX_H}`}
                        fill="none" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2"
                        markerEnd="url(#arrowHeadRed)" />
                    <defs>
                        <marker id="arrowHeadRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
                        </marker>
                    </defs>
                    <text x={positions.idm.x + BOX_W / 2} y={BOX_H + 44}
                        textAnchor="middle" fill="#ef4444" fontSize={FONT.min}>
                        자체 팹 보유
                    </text>
                </motion.g>
            </svg>

            {/* Tooltip */}
            <div style={{ maxWidth: 600, margin: '8px auto 0', height: 72 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 16px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: MODELS[hovered].color, marginBottom: 2 }}>
                                {MODELS[hovered].label} — {MODELS[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.6 }}>
                                {MODELS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 16px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.6 }}>
                                각 모델을 호버하여 상세 설명을 확인하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
