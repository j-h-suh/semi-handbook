'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type CompId = 'ff' | 'fb' | 'offset' | 'sum' | null;

const ITEMS: Record<Exclude<CompId, null>, { label: string; sub: string; desc: string; color: string }> = {
    ff:     { label: 'Feed-Forward', sub: '현재 웨이퍼 상태', desc: '현재 웨이퍼의 레지스트 두께, 정렬 마크 등을 공정 전에 측정하여 즉시 반영. 시간 지연 없음.', color: '#3b82f6' },
    fb:     { label: 'Feedback', sub: '이전 로트 추세', desc: 'EWMA로 이전 로트들의 CD/OVL 추세를 추적. 장기적 Drift를 보정. 시간 지연(2~3로트) 존재.', color: '#22c55e' },
    offset: { label: '고정 오프셋', sub: '장비/챔버 고유', desc: '장비마다 다른 고유 특성(챔버 벽면 상태, 가스 배관 차이)을 보정하는 상수.', color: '#f59e0b' },
    sum:    { label: '최종 보정값', sub: 'FF + FB + Offset', desc: 'Feed-Forward + Feedback + 고정 오프셋의 합산. 이 값이 장비 레시피에 적용됨.', color: '#a855f7' },
};

const SVG_W = 520;
const SVG_H = 100;
const BOX_W = 110;
const BOX_H = 48;
const CY = SVG_H / 2;
const X_FF = 70;
const X_FB = 200;
const X_OFF = 330;
const X_SUM = 460;

export default function FFBCombinedCorrection() {
    const [hovered, setHovered] = useState<CompId>(null);
    const isDim = (id: CompId) => hovered !== null && hovered !== id;

    const renderBox = (id: Exclude<CompId, null>, x: number) => {
        const info = ITEMS[id];
        const active = hovered === id;
        return (
            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={x - BOX_W / 2 - 4} y={CY - BOX_H / 2 - 4} width={BOX_W + 8} height={BOX_H + 8} fill="transparent" />
                <rect x={x - BOX_W / 2} y={CY - BOX_H / 2} width={BOX_W} height={BOX_H} rx={8}
                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                <text x={x} y={CY - 6} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                <text x={x} y={CY + 12} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
            </motion.g>
        );
    };

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Feed-Forward + Feedback 결합 보정
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                세 성분의 합산으로 최적 보정값 산출
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 520 }}>
                    {/* Plus signs */}
                    <text x={(X_FF + X_FB) / 2} y={CY + 3} textAnchor="middle" fill={COLOR.textDim} fontSize={16}>+</text>
                    <text x={(X_FB + X_OFF) / 2} y={CY + 3} textAnchor="middle" fill={COLOR.textDim} fontSize={16}>+</text>
                    <text x={(X_OFF + X_SUM) / 2} y={CY + 3} textAnchor="middle" fill={COLOR.textDim} fontSize={16}>=</text>

                    {renderBox('ff', X_FF)}
                    {renderBox('fb', X_FB)}
                    {renderBox('offset', X_OFF)}
                    {renderBox('sum', X_SUM)}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: ITEMS[hovered].color, marginBottom: 2 }}>{ITEMS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{ITEMS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 성분을 호버하세요. FF(현재 웨이퍼) + FB(Drift 추적) + Offset(장비 차이) = 최종 보정값.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
