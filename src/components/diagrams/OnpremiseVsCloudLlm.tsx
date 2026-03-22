'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type SideId = 'cloud' | 'onprem' | null;

const SIDES: Record<Exclude<SideId, null>, { label: string; items: { icon: string; text: string }[]; pros: string[]; cons: string[]; color: string }> = {
    cloud: {
        label: 'Cloud LLM',
        items: [
            { icon: '☁️', text: 'OpenAI, Claude, Gemini' },
            { icon: '🌐', text: '외부 서버 추론' },
            { icon: '⚡', text: '최고 성능 모델' },
        ],
        pros: ['최신/최고 성능', '유지보수 불필요', '빠른 도입'],
        cons: ['데이터 유출 위험', '팹 데이터 결합 불가', 'NDA 제약'],
        color: '#3b82f6',
    },
    onprem: {
        label: 'On-Premise LLM',
        items: [
            { icon: '🏭', text: 'Llama, Mistral (오픈소스)' },
            { icon: '🔒', text: '팹 내부 서버 운영' },
            { icon: '🎯', text: '도메인 Fine-Tuning' },
        ],
        pros: ['데이터 유출 없음', '팹 데이터 Fine-Tune', 'NDA 준수'],
        cons: ['GPU 인프라 투자', '성능 제약 (모델 크기)', '유지보수 부담'],
        color: '#22c55e',
    },
};

const SVG_W = 560;
const SVG_H = 180;
const CARD_W = 240;
const CARD_H = 160;
const GAP = 40;

export default function OnpremiseVsCloudLlm() {
    const [hovered, setHovered] = useState<SideId>(null);

    const leftX = SVG_W / 2 - GAP / 2 - CARD_W / 2;
    const rightX = SVG_W / 2 + GAP / 2 + CARD_W / 2;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                On-Premise vs Cloud LLM 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                팹 보안 → On-Premise 필수 | 일반 지식 → Cloud 활용 가능
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 560 }}>
                    {([
                        { id: 'cloud' as const, cx: leftX },
                        { id: 'onprem' as const, cx: rightX },
                    ]).map(({ id, cx }) => {
                        const info = SIDES[id];
                        const active = hovered === id;
                        const tx = cx - CARD_W / 2 + 16;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: hovered !== null && hovered !== id ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={cx - CARD_W / 2} y={10} width={CARD_W} height={CARD_H} rx={10}
                                    fill={active ? `${info.color}08` : 'rgba(255,255,255,0.02)'}
                                    stroke={active ? `${info.color}40` : 'rgba(255,255,255,0.06)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={cx} y={32} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={700}>{info.label}</text>
                                {info.items.map((item, i) => (
                                    <text key={i} x={tx} y={54 + i * 18} dominantBaseline="central"
                                        fill={COLOR.textDim} fontSize={FONT.min}>{item.icon} {item.text}</text>
                                ))}
                                <line x1={cx - CARD_W / 2 + 12} y1={106} x2={cx + CARD_W / 2 - 12} y2={106} stroke="rgba(255,255,255,0.06)" />
                                {info.pros.map((p, i) => (
                                    <text key={'p' + i} x={tx} y={120 + i * 16} dominantBaseline="central"
                                        fill="#22c55e" fontSize={FONT.min}>✓ {p}</text>
                                ))}
                            </motion.g>
                        );
                    })}
                    {/* VS divider */}
                    <text x={SVG_W / 2} y={SVG_H / 2} textAnchor="middle" dominantBaseline="central"
                        fill="rgba(255,255,255,0.15)" fontSize={FONT.title} fontWeight={700}>VS</text>
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: SIDES[hovered].color, marginBottom: 2 }}>{SIDES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                <span style={{ color: '#22c55e' }}>장점: </span>{SIDES[hovered].pros.join(', ')}
                                <span style={{ marginLeft: 12, color: '#ef4444' }}>단점: </span>{SIDES[hovered].cons.join(', ')}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 카드를 호버하세요. 팹 내부 데이터 → On-Premise 필수, 일반 지식 → Cloud 활용 가능.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
