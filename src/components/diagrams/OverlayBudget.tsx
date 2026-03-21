'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── Budget 항목 ─── */
type ItemId = 'scanner' | 'process' | 'wafer' | 'mask' | 'metrology' | 'margin' | null;

const ITEMS: Record<Exclude<ItemId, null>, { label: string; value: string; desc: string; color: string }> = {
    scanner:   { label: '스캐너', value: '~0.8nm', desc: '스테이지 정밀도, 렌즈 수차, 렌즈 가열, 스캔 동기화 — 장비 업체(ASML) 역량에 의존.', color: '#3b82f6' },
    process:   { label: '공정', value: '~0.6nm', desc: '막 응력, 열처리 변형, CMP, 식각 비대칭 — 리소그래피 이외 공정 단계에서 발생.', color: '#818cf8' },
    wafer:     { label: '웨이퍼', value: '~0.5nm', desc: '비선형 변형(Bowl/Saddle/Higher-order), 척 클램핑 오차, Edge 효과.', color: '#f59e0b' },
    mask:      { label: '마스크', value: '~0.3nm', desc: '마스크 배치 오차(MPE), 열변형, 펠리클 응력.', color: '#22c55e' },
    metrology: { label: '계측', value: '~0.2nm', desc: 'TMU, TIS, 마크 비대칭 — 측정 자체의 오차. 가짜 Overlay 유발 가능.', color: '#ef4444' },
    margin:    { label: '잔여 마진', value: '~0.3nm', desc: '예상치 못한 변동에 대한 여유분. 모든 항목이 최적화되어야 확보 가능.', color: '#a1a1aa' },
};

const ITEM_ORDER: Exclude<ItemId, null>[] = ['scanner', 'process', 'wafer', 'mask', 'metrology', 'margin'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 650;
const SVG_H = 260;
const CX = SVG_W / 2;
const TOP_Y = 30;
const NODE_W = 140;
const NODE_H = 36;
const CHILD_W = 100;
const CHILD_H = 32;
const CHILD_Y = 120;
const CHILD_GAP = 130; // CHILD_W(100) + 30px spacing

export default function OverlayBudget() {
    const [hovered, setHovered] = useState<ItemId>(null);
    const isDimmed = (id: Exclude<ItemId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Overlay Budget 구성
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                전체 2nm (3σ) = √(각 요인²의 합) — RSS 합산
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 650 }}>
                    {/* 상단 Total 노드 */}
                    <rect x={CX - NODE_W / 2} y={TOP_Y} width={NODE_W} height={NODE_H} rx={8}
                        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                    <text x={CX} y={TOP_Y + 15} textAnchor="middle" fill={COLOR.textBright} fontSize={FONT.min} fontWeight={700}>전체 Overlay 요구</text>
                    <text x={CX} y={TOP_Y + 28} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>2nm (3σ)</text>

                    {/* 자식 노드들 — 3+3 배치 */}
                    {ITEM_ORDER.map((id, i) => {
                        const row = Math.floor(i / 3);
                        const col = i % 3;
                        const x = CX + (col - 1) * CHILD_GAP;
                        const y = CHILD_Y + row * 70;
                        const info = ITEMS[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);

                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                {/* 연결선 */}
                                <line x1={CX} y1={TOP_Y + NODE_H} x2={x} y2={y - CHILD_H / 2}
                                    stroke={active ? `${info.color}40` : 'rgba(255,255,255,0.06)'} strokeWidth={0.8} />
                                <rect x={x - CHILD_W / 2 - 4} y={y - CHILD_H / 2 - 4} width={CHILD_W + 8} height={CHILD_H + 8} fill="transparent" />
                                <rect x={x - CHILD_W / 2} y={y - CHILD_H / 2} width={CHILD_W} height={CHILD_H} rx={6}
                                    fill={active ? `${info.color}12` : 'rgba(255,255,255,0.02)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.06)'}
                                    strokeWidth={active ? 1.2 : 0.8} />
                                <text x={x} y={y - 2} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>
                                    {info.label}
                                </text>
                                <text x={x} y={y + 11} textAnchor="middle"
                                    fill={COLOR.textDim} fontSize={FONT.min}>
                                    {info.value}
                                </text>
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: ITEMS[hovered].color, marginBottom: 2 }}>
                                {ITEMS[hovered].label} 기여분 — {ITEMS[hovered].value}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {ITEMS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 항목을 호버하세요. 전체 Overlay는 각 요인의 RSS(제곱합의 제곱근)로 합산됩니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
