'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 단계 데이터 ─── */
type StepId = 'droplet' | 'prepulse' | 'mainpulse' | 'plasma' | 'collector' | 'output' | null;

interface StepInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
    icon: string;
}

const STEPS: Record<Exclude<StepId, null>, StepInfo> = {
    droplet: { label: 'Sn 드롭릿', sub: '직경 ~25μm', desc: '녹은 주석(Sn)을 노즐에서 직경 약 25μm의 미세 방울로 분사. 초당 50,000개의 방울이 정확한 간격으로 생성된다.', color: '#a1a1aa', icon: '💧' },
    prepulse: { label: 'Pre-pulse', sub: 'CO₂ 레이저', desc: '첫 번째 레이저 펄스가 주석 방울을 팬케이크처럼 평탄하게 펴뜨린다. 표면적을 넓혀 Main pulse의 에너지 흡수 효율을 극대화.', color: '#ef4444', icon: '🔴' },
    mainpulse: { label: 'Main pulse', sub: '~25kW CO₂', desc: '출력 약 25kW의 메인 레이저가 평탄화된 주석을 약 50만°C의 플라즈마로 가열. 이 과정에서 13.5nm EUV 광자가 방출된다.', color: '#f59e0b', icon: '⚡' },
    plasma: { label: 'Sn 플라즈마', sub: '~50만°C', desc: '극고온 주석 플라즈마가 13.5nm 파장의 EUV 광을 전방향으로 방출. 광원 변환 효율은 약 5~6% 수준.', color: '#e879f9', icon: '🌟' },
    collector: { label: 'Collector', sub: '포물면 거울', desc: '포물면 거울(Collector Mirror)이 플라즈마에서 방출된 EUV 광을 모아 스캐너 방향으로 집광. 주석 오염으로 정기 교체 필요.', color: '#c0c0c0', icon: '🪞' },
    output: { label: 'EUV 출력', sub: '~500W → 스캐너', desc: '집광된 EUV 빛이 스캐너의 조명 광학계로 전달. 현재 약 500W 수준이며, 이것이 처리량(~185 wph)의 핵심 병목.', color: '#c084fc', icon: '📡' },
};

const STEP_ORDER: Exclude<StepId, null>[] = ['droplet', 'prepulse', 'mainpulse', 'plasma', 'collector', 'output'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 700;
const SVG_H = 100;
const BOX_W = 88;
const BOX_H = 56;
const ARROW_W = 16;
const TOTAL = STEP_ORDER.length * BOX_W + (STEP_ORDER.length - 1) * ARROW_W;
const START_X = (SVG_W - TOTAL) / 2;
const CY = SVG_H / 2;

function xOf(i: number) { return START_X + i * (BOX_W + ARROW_W); }

export default function EuvSourceMechanism() {
    const [hovered, setHovered] = useState<StepId>(null);

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                EUV 광원 동작 개념도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                EUV Source — Sn Droplet + CO₂ Laser (50,000 Hz)
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 700)} style={{ maxWidth: '100%' }}>
                    {STEP_ORDER.map((id, i) => {
                        const x = xOf(i);
                        const info = STEPS[id];
                        const active = hovered === id;
                        const dim = hovered !== null && !active;
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dim ? 0.2 : 1 }}
                                transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                {/* 히트 영역 */}
                                <rect x={x} y={CY - BOX_H / 2} width={BOX_W} height={BOX_H} fill="transparent" />
                                {/* 박스 */}
                                <rect x={x} y={CY - BOX_H / 2} width={BOX_W} height={BOX_H} rx={8}
                                    fill={active ? info.color + '20' : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? info.color : 'rgba(255,255,255,0.12)'} strokeWidth={active ? 2 : 1} />
                                {/* 아이콘 + 라벨 */}
                                <text x={x + BOX_W / 2} y={CY - 8} textAnchor="middle" fontSize={14}>{info.icon}</text>
                                <text x={x + BOX_W / 2} y={CY + 8} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textBright} fontSize={FONT.min} fontWeight={600}>
                                    {info.label}
                                </text>
                                <text x={x + BOX_W / 2} y={CY + 22} textAnchor="middle"
                                    fill={COLOR.textDim} fontSize={FONT.min}>
                                    {info.sub}
                                </text>
                            </motion.g>
                        );
                    })}

                    {/* 화살표 */}
                    {STEP_ORDER.slice(0, -1).map((_, i) => {
                        const x1 = xOf(i) + BOX_W;
                        const x2 = xOf(i + 1);
                        return (
                            <g key={`arrow-${i}`}>
                                <line x1={x1 + 2} y1={CY} x2={x2 - 6} y2={CY} stroke="#4b5563" strokeWidth={1.2} />
                                <polygon points={`${x2 - 8},${CY - 3} ${x2 - 2},${CY} ${x2 - 8},${CY + 3}`} fill="#4b5563" />
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* 하단 툴팁 */}
            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 62 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STEPS[hovered].color, marginBottom: 2 }}>
                                {STEPS[hovered].label} — {STEPS[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {STEPS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 단계를 호버하여 EUV 광원 생성 과정을 확인하세요. 이 전체 과정이 초당 50,000번 반복됩니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
