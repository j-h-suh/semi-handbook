'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 ─── */
type PanelId = 'high' | 'low' | null;

interface PanelInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
    pros: string[];
    cons: string[];
}

const PANELS: Record<Exclude<PanelId, null>, PanelInfo> = {
    high: {
        label: 'Dose 높이면',
        sub: 'High Dose Strategy',
        desc: '광자 수 증가 → Shot Noise 감소 → 확률적 결함 발생 확률 감소. 그러나 노광 시간이 늘어 처리량이 감소하고, 웨이퍼당 비용이 증가한다.',
        color: '#3b82f6',
        pros: ['결함 감소 ✅'],
        cons: ['처리량 감소 ❌', '비용 증가 ❌'],
    },
    low: {
        label: 'Dose 낮추면',
        sub: 'Low Dose Strategy',
        desc: '노광 시간 단축 → 처리량(wph) 증가 → 비용 절감. 그러나 광자 수 감소로 Shot Noise가 커지고, 확률적 결함이 증가하여 수율이 떨어진다.',
        color: '#f59e0b',
        pros: ['처리량 증가 ✅'],
        cons: ['결함 증가 ❌', '수율 감소 ❌'],
    },
};

/* ─── SVG 레이아웃 상수 ─── */
const SVG_W = 520;
const SVG_H = 200;
const CX = SVG_W / 2;

/* 패널 크기 및 위치 */
const PANEL_W = 190;
const PANEL_H = 140;
const PANEL_GAP = 20;
const PANEL_Y = 28;
const LEFT_X = CX - PANEL_GAP / 2 - PANEL_W;
const RIGHT_X = CX + PANEL_GAP / 2;
const PANEL_RX = 10;

/* 중앙 화살표 */
const ARROW_Y_TOP = PANEL_Y + 30;
const ARROW_Y_BOT = PANEL_Y + PANEL_H - 30;

/* 항목 행 높이 */
const ITEM_START_Y = PANEL_Y + 54;
const ITEM_GAP = 26;

export default function StochasticDefectsDilemma() {
    const [hovered, setHovered] = useState<PanelId>(null);
    const isDimmed = (id: Exclude<PanelId, null>) => hovered !== null && hovered !== id;

    const renderPanel = (id: Exclude<PanelId, null>, px: number) => {
        const info = PANELS[id];
        const active = hovered === id;
        const dimmed = isDimmed(id);
        const items = [...info.pros, ...info.cons];

        return (
            <motion.g
                key={id}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                animate={{ opacity: dimmed ? 0.2 : 1 }}
                transition={{ duration: 0.15 }}
                style={{ cursor: 'pointer' }}
            >
                {/* 히트 영역 */}
                <rect x={px - 6} y={PANEL_Y - 6} width={PANEL_W + 12} height={PANEL_H + 12} fill="transparent" />
                {/* 배경 */}
                <rect
                    x={px} y={PANEL_Y} width={PANEL_W} height={PANEL_H} rx={PANEL_RX}
                    fill={active ? `${info.color}12` : 'rgba(255,255,255,0.02)'}
                    stroke={active ? `${info.color}40` : 'rgba(255,255,255,0.08)'}
                    strokeWidth={active ? 1.5 : 1}
                />
                {/* 제목 */}
                <text x={px + PANEL_W / 2} y={PANEL_Y + 24} textAnchor="middle"
                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.cardHeader} fontWeight={700}>
                    {info.label}
                </text>
                {/* 항목 */}
                {items.map((item, i) => (
                    <text key={i} x={px + PANEL_W / 2} y={ITEM_START_Y + i * ITEM_GAP} textAnchor="middle"
                        fill={item.includes('✅') ? '#22c55e' : '#ef4444'} fontSize={FONT.body}>
                        {item}
                    </text>
                ))}
            </motion.g>
        );
    };

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                확률적 결함의 딜레마
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                EUV Stochastic Defect — Dose vs. Throughput Trade-off
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 520 }}>
                    {/* 중앙 양방향 화살표 */}
                    <defs>
                        <marker id="arrowL" viewBox="0 0 10 10" refX="0" refY="5" markerWidth={6} markerHeight={6} orient="auto">
                            <path d="M10 0 L0 5 L10 10 z" fill="rgba(255,255,255,0.25)" />
                        </marker>
                        <marker id="arrowR" viewBox="0 0 10 10" refX="10" refY="5" markerWidth={6} markerHeight={6} orient="auto">
                            <path d="M0 0 L10 5 L0 10 z" fill="rgba(255,255,255,0.25)" />
                        </marker>
                    </defs>
                    <line x1={CX} y1={ARROW_Y_TOP} x2={CX} y2={ARROW_Y_BOT}
                        stroke="rgba(255,255,255,0.15)" strokeWidth={1.5}
                        markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
                    <text x={CX} y={PANEL_Y + PANEL_H / 2 + 5} textAnchor="middle"
                        fill={COLOR.textDim} fontSize={FONT.min} fontWeight={600}>
                        Trade-off
                    </text>

                    {/* 패널 */}
                    {renderPanel('high', LEFT_X)}
                    {renderPanel('low', RIGHT_X)}
                </svg>
            </div>

            {/* 툴팁 */}
            <div style={{ maxWidth: 640, margin: '0 auto', height: 56 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: PANELS[hovered].color, marginBottom: 2 }}>{PANELS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{PANELS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 패널을 호버하여 Dose–처리량 트레이드오프의 상세 설명을 확인하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
