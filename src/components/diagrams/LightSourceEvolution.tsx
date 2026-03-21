'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 광원 세대 데이터 ─── */
type GenId = 'gline' | 'iline' | 'krf' | 'arf' | 'arfi' | 'euv' | null;

interface GenInfo {
    label: string;
    wavelength: string;
    resolution: string;
    year: string;
    desc: string;
    color: string;
}

const GENS: Record<Exclude<GenId, null>, GenInfo> = {
    gline: { label: 'g-line', wavelength: '436nm', resolution: '~800nm', year: '1980s', desc: '수은 램프 광원. 반도체 리소그래피의 시작. MEMS, 파워 반도체 등에서 현재도 사용.', color: '#fbbf24' },
    iline: { label: 'i-line', wavelength: '365nm', resolution: '~350nm', year: '1990s', desc: '수은 램프 i-line. 장비 가격이 저렴하고 기술이 성숙. 패키징, MEMS에서 현역.', color: '#f59e0b' },
    krf: { label: 'KrF', wavelength: '248nm', resolution: '~180nm', year: '2000s', desc: 'DUV 엑시머 레이저의 시작. 크립톤 플루오라이드(KrF). Deep Ultraviolet 용어의 기원.', color: '#ef4444' },
    arf: { label: 'ArF', wavelength: '193nm', resolution: '~65nm', year: '2003~', desc: '아르곤 플루오라이드(ArF). 건식 기준. 현재까지 양산 주력. 형석(CaF₂) 렌즈 필요.', color: '#3b82f6' },
    arfi: { label: 'ArF-i', wavelength: '193nm 침수', resolution: '~7nm*', year: '2006~', desc: 'ArF 침수(Immersion). 물(n=1.44)로 NA 1.35 달성. 멀티패터닝 병용 시 7nm까지. *Multi-Patterning 필요.', color: '#818cf8' },
    euv: { label: 'EUV', wavelength: '13.5nm', resolution: '~3nm', year: '2019~', desc: '극자외선(Extreme UV). 파장 14배 감소. 진공+반사 광학계. 주석 플라즈마 광원. High-NA로 진화 중.', color: '#e879f9' },
};

const GEN_ORDER: Exclude<GenId, null>[] = ['gline', 'iline', 'krf', 'arf', 'arfi', 'euv'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 680;
const SVG_H = 100;
const PAD_X = 40;
const BOX_W = 80;
const BOX_H = 56;
const ARROW_W = 16;
const TOTAL = GEN_ORDER.length * BOX_W + (GEN_ORDER.length - 1) * ARROW_W;
const START_X = (SVG_W - TOTAL) / 2;

function xOf(i: number) { return START_X + i * (BOX_W + ARROW_W); }
const CY = SVG_H / 2;

export default function LightSourceEvolution() {
    const [hovered, setHovered] = useState<GenId>(null);

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                노광 광원의 진화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Light Source Evolution — g-line → EUV
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 680)} style={{ maxWidth: '100%' }}>
                    {GEN_ORDER.map((id, i) => {
                        const x = xOf(i);
                        const info = GENS[id];
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
                                {/* 라벨 */}
                                <text x={x + BOX_W / 2} y={CY - 8} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textBright} fontSize={FONT.min} fontWeight={700}>
                                    {info.label}
                                </text>
                                <text x={x + BOX_W / 2} y={CY + 6} textAnchor="middle"
                                    fill={COLOR.textDim} fontSize={FONT.min}>
                                    {info.wavelength}
                                </text>
                                <text x={x + BOX_W / 2} y={CY + 20} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min}>
                                    {info.resolution}
                                </text>
                            </motion.g>
                        );
                    })}

                    {/* 화살표 */}
                    {GEN_ORDER.slice(0, -1).map((_, i) => {
                        const x1 = xOf(i) + BOX_W;
                        const x2 = xOf(i + 1);
                        const mx = (x1 + x2) / 2;
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
            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 56 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: GENS[hovered].color, marginBottom: 2 }}>
                                {GENS[hovered].label} ({GENS[hovered].wavelength}) — {GENS[hovered].year}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {GENS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 광원 세대를 호버하여 특성을 확인하세요. 파장이 짧아질수록 더 미세한 패턴을 만들 수 있습니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
