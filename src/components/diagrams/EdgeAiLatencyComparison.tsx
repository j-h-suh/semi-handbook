'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type SideId = 'server' | 'edge' | null;

const SIDES: Record<Exclude<SideId, null>, { label: string; latency: string; items: string[]; desc: string; color: string }> = {
    server: { label: '현재: 서버 AI', latency: '수 초~수 분', items: ['장비→수집→서버 전송', '서버 분석→보정 계산', '보정값→장비 전송'], desc: '데이터가 장비→서버→장비로 왕복. 네트워크 지연 + 대역폭 소모. 웨이퍼 간(Inter-Wafer) 보정만 가능.', color: '#3b82f6' },
    edge:   { label: '미래: Edge AI', latency: '밀리초', items: ['장비 내 AI 칩', '실시간 추론/보정', '데이터 외부 비유출'], desc: '장비 자체에서 추론 완결. 웨이퍼 내(Intra-Wafer) 실시간 보정 가능. 프라이버시 보장.', color: '#22c55e' },
};

const SVG_W = 700;
const SVG_H = 180;
const BOX_W = 280;
const BOX_H = 140;
const LEFT_CX = SVG_W / 2 - BOX_W / 2 - 30;
const RIGHT_CX = SVG_W / 2 + BOX_W / 2 + 30;

export default function EdgeAiLatencyComparison() {
    const [hovered, setHovered] = useState<SideId>(null);

    const drawSide = (cx: number, id: Exclude<SideId, null>) => {
        const info = SIDES[id];
        const active = hovered === id;
        return (
            <motion.g onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: hovered !== null && hovered !== id ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={cx - BOX_W / 2} y={20} width={BOX_W} height={BOX_H} rx={10}
                    fill={active ? `${info.color}10` : 'rgba(255,255,255,0.02)'}
                    stroke={active ? `${info.color}40` : 'rgba(255,255,255,0.06)'} strokeWidth={active ? 1.5 : 1} />
                <text x={cx} y={48} textAnchor="middle" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.cardHeader} fontWeight={700}>{info.label}</text>
                <text x={cx} y={74} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.small}>레이턴시: {info.latency}</text>
                {info.items.map((item, i) => (
                    <text key={i} x={cx} y={98 + i * 18} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.small} opacity={0.6}>{item}</text>
                ))}
            </motion.g>
        );
    };

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Edge AI vs 서버 AI — 레이턴시 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                서버 왕복(초~분) vs 장비 내 추론(밀리초)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 700 }}>
                    {drawSide(LEFT_CX, 'server')}
                    <text x={SVG_W / 2} y={90} textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize={FONT.title} fontWeight={700}>→</text>
                    {drawSide(RIGHT_CX, 'edge')}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: SIDES[hovered].color, marginBottom: 2 }}>{SIDES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{SIDES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 쪽을 호버하세요. Edge AI로 웨이퍼 내 실시간 보정이 가능해집니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
