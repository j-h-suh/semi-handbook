'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 층 데이터 ─── */
type LayerId = 'absorber' | 'capping' | 'multilayer' | 'substrate' | null;

interface LayerInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const LAYERS: Record<Exclude<LayerId, null>, LayerInfo> = {
    absorber: { label: 'TaBN 흡수체', sub: 'Absorber ~60nm', desc: '탄탈륨 기반 흡수체(TaBN). EUV를 흡수하여 패턴을 형성. 흡수체가 있는 곳은 EUV가 흡수되어 어둡고, 없는 곳은 다층 반사경에서 반사되어 밝다. 두께 ~60nm가 Mask 3D 효과의 원인.', color: '#71717a' },
    capping: { label: '캡핑층', sub: 'Ru (Ruthenium) ~2.5nm', desc: '루테늄(Ru) 박막으로 Mo/Si 다층 반사경의 최상층을 보호. 산화 방지 및 세정 내구성 확보. 반사율에 미치는 영향을 최소화하면서 보호 기능 수행.', color: '#eab308' },
    multilayer: { label: 'Mo/Si 다층 반사경', sub: '~40쌍, 반사율 ~67%', desc: '몰리브덴(Mo)과 실리콘(Si)을 각 ~6.9nm 두께로 약 40쌍 교대 적층. 보강 간섭(Constructive Interference)에 의해 13.5nm EUV를 ~67% 반사. 거울 11개 통과 시 ~2%만 도달.', color: '#3b82f6' },
    substrate: { label: '초저열팽창 유리 기판', sub: 'LTEM Glass', desc: '초저열팽창 유리(Low Thermal Expansion Material). DUV 마스크의 석영과 다르게 빛이 투과하지 않아도 되지만, 극한의 평탄도(<50pm RMS)와 열적 안정성이 필수.', color: '#6366f1' },
};

const LAYER_ORDER: Exclude<LayerId, null>[] = ['absorber', 'capping', 'multilayer', 'substrate'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 440;
const SVG_H = 270;
const CX = SVG_W / 2;
const W = 240;

const ABS_Y = 40;
const ABS_H = 20;
const CAP_Y = ABS_Y + ABS_H + 2;
const CAP_H = 6;
const ML_Y = CAP_Y + CAP_H + 2;
const ML_H = 100;
const SUB_Y = ML_Y + ML_H + 4;
const SUB_H = 80;

/* 입사각 */
const BEAM_ANGLE = 6; // degrees

export default function EuvReflectiveMask() {
    const [hovered, setHovered] = useState<LayerId>(null);
    const isDimmed = (id: Exclude<LayerId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                EUV 반사형 마스크 단면도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                EUV Reflective Mask — Mo/Si Multilayer + TaBN Absorber
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={380} style={{ flexShrink: 0 }}>

                    {/* 6° 경사 입사광 */}
                    <line x1={CX - 30} y1={6} x2={CX - 30 + Math.tan(BEAM_ANGLE * Math.PI / 180) * ABS_Y} y2={ABS_Y}
                        stroke="rgba(192,132,252,0.4)" strokeWidth={1.5} />
                    {/* 반사광 */}
                    <line x1={CX - 30 + Math.tan(BEAM_ANGLE * Math.PI / 180) * ABS_Y} y1={ABS_Y}
                        x2={CX - 30 + Math.tan(BEAM_ANGLE * Math.PI / 180) * ABS_Y * 2} y2={6}
                        stroke="rgba(192,132,252,0.25)" strokeWidth={1.5} strokeDasharray="4 3" />
                    <text x={CX + 20} y={16} fill="rgba(192,132,252,0.6)" fontSize={FONT.min}>EUV 6° 입사</text>

                    {/* TaBN 흡수체 (패턴) */}
                    <motion.g onMouseEnter={() => setHovered('absorber')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('absorber') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - W / 2} y={ABS_Y - 4} width={W} height={ABS_H + 8} fill="transparent" />
                        {/* 흡수체 패턴 바 (등간격) */}
                        {Array.from({ length: 8 }, (_, i) => {
                            const barW = 14;
                            const totalBars = 8;
                            const spacing = (W - 20 - barW * totalBars) / (totalBars - 1);
                            const x = CX - W / 2 + 10 + i * (barW + spacing);
                            return (
                                <rect key={i} x={x} y={ABS_Y} width={barW} height={ABS_H} rx={1}
                                    fill={hovered === 'absorber' ? 'rgba(113,113,122,0.4)' : 'rgba(113,113,122,0.2)'}
                                    stroke={hovered === 'absorber' ? '#71717a' : 'rgba(113,113,122,0.4)'} strokeWidth={0.8} />
                            );
                        })}
                        {/* Shadowing 힌트 */}
                        <text x={CX + W / 2 + 8} y={ABS_Y + ABS_H / 2 + 4}
                            fill={hovered === 'absorber' ? '#a1a1aa' : COLOR.textDim} fontSize={FONT.min}>TaBN 흡수체</text>
                    </motion.g>

                    {/* 캡핑층 */}
                    <motion.g onMouseEnter={() => setHovered('capping')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('capping') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - W / 2} y={CAP_Y - 4} width={W} height={CAP_H + 8} fill="transparent" />
                        <rect x={CX - W / 2} y={CAP_Y} width={W} height={CAP_H} rx={1}
                            fill={hovered === 'capping' ? 'rgba(234,179,8,0.2)' : 'rgba(234,179,8,0.08)'}
                            stroke={hovered === 'capping' ? '#eab308' : 'rgba(234,179,8,0.3)'} strokeWidth={0.8} />
                        <text x={CX + W / 2 + 8} y={CAP_Y + CAP_H / 2 + 3}
                            fill={hovered === 'capping' ? '#eab308' : COLOR.textDim} fontSize={FONT.min}>Ru 캡핑</text>
                    </motion.g>

                    {/* Mo/Si 다층 반사경 */}
                    <motion.g onMouseEnter={() => setHovered('multilayer')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('multilayer') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - W / 2} y={ML_Y - 2} width={W} height={ML_H + 4} fill="transparent" />
                        {/* 교대층 표시 */}
                        {Array.from({ length: 16 }, (_, i) => {
                            const ly = ML_Y + i * (ML_H / 16);
                            const isMo = i % 2 === 0;
                            return (
                                <rect key={i} x={CX - W / 2} y={ly} width={W} height={ML_H / 16} rx={0}
                                    fill={isMo
                                        ? (hovered === 'multilayer' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.06)')
                                        : (hovered === 'multilayer' ? 'rgba(147,197,253,0.12)' : 'rgba(147,197,253,0.04)')}
                                    stroke="none" />
                            );
                        })}
                        <rect x={CX - W / 2} y={ML_Y} width={W} height={ML_H} rx={2}
                            fill="none"
                            stroke={hovered === 'multilayer' ? '#3b82f6' : 'rgba(59,130,246,0.3)'} strokeWidth={1} />
                        <text x={CX} y={ML_Y + ML_H / 2 - 6} textAnchor="middle"
                            fill={hovered === 'multilayer' ? '#3b82f6' : COLOR.textMuted} fontSize={FONT.body} fontWeight={600}>Mo/Si × 40쌍</text>
                        <text x={CX} y={ML_Y + ML_H / 2 + 12} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>반사율 ~67%</text>
                    </motion.g>

                    {/* 기판 */}
                    <motion.g onMouseEnter={() => setHovered('substrate')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('substrate') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - W / 2 - 10} y={SUB_Y} width={W + 20} height={SUB_H} rx={4}
                            fill={hovered === 'substrate' ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.04)'}
                            stroke={hovered === 'substrate' ? '#6366f1' : 'rgba(99,102,241,0.25)'} strokeWidth={1} />
                        <text x={CX} y={SUB_Y + SUB_H / 2 - 4} textAnchor="middle"
                            fill={hovered === 'substrate' ? '#6366f1' : COLOR.textMuted} fontSize={FONT.body} fontWeight={600}>LTEM 유리 기판</text>
                        <text x={CX} y={SUB_Y + SUB_H / 2 + 14} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>평탄도 {'<'} 50pm RMS</text>
                    </motion.g>

                    {/* 반사/흡수 주석 */}
                    <g>
                        <text x={CX - W / 2 - 14} y={ABS_Y + ABS_H + ML_H / 2} textAnchor="end"
                            fill={hovered === 'multilayer' ? 'rgba(34,197,94,0.9)' : 'rgba(34,197,94,0.3)'} fontSize={FONT.min}>반사 →</text>
                        <text x={CX - W / 2 - 14} y={ABS_Y + 10} textAnchor="end"
                            fill={hovered === 'absorber' ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.3)'} fontSize={FONT.min}>흡수 ✕</text>
                    </g>
                </svg>

                {/* 우측 요소 버튼 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 200, marginTop: 20 }}>
                    {LAYER_ORDER.map(id => {
                        const info = LAYERS[id];
                        const active = hovered === id;
                        return (
                            <motion.div key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: active || hovered === null ? 1 : 0.3 }}
                                style={{ background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${active ? info.color + '40' : 'rgba(255,255,255,0.06)'}`,
                                    borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>
                                <div style={{ fontSize: FONT.min, fontWeight: 600, color: active ? info.color : COLOR.textMuted }}>{info.label}</div>
                                <div style={{ fontSize: FONT.min, color: COLOR.textDim }}>{info.sub}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 하단 툴팁 */}
            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 70 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: LAYERS[hovered].color, marginBottom: 2 }}>
                                {LAYERS[hovered].label} — {LAYERS[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {LAYERS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 층을 호버하여 EUV 반사형 마스크의 구조를 확인하세요. DUV와 달리 빛이 반사되는 구조입니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
