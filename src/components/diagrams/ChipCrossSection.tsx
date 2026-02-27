'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type LayerId = 'substrate' | 'sti' | 'transistor' | 'contact' | 'ild' | 'pmd' | 'm1' | 'via1' | 'm2' | 'via2' | 'm3' | 'm4' | 'passivation' | null;

interface LayerInfo {
    label: string;
    sub: string;
    desc: string;
    accent: string;
    region: 'FEOL' | 'BEOL' | 'TOP';
}

const info: Record<Exclude<LayerId, null>, LayerInfo> = {
    substrate: { label: '실리콘 기판', sub: 'Si Substrate', desc: 'P형 단결정 실리콘 웨이퍼. 모든 소자의 기반.', accent: '#93c5fd', region: 'FEOL' },
    sti: { label: '소자 분리', sub: 'STI', desc: 'Shallow Trench Isolation. SiO₂로 트랜지스터를 전기적으로 격리.', accent: '#fde68a', region: 'FEOL' },
    transistor: { label: '트랜지스터', sub: 'Gate (NMOS/PMOS)', desc: '게이트·소스·드레인 구조. 칩의 핵심 스위칭 소자.', accent: '#f87171', region: 'FEOL' },
    contact: { label: '컨택트', sub: 'Contact (W)', desc: '텅스텐(W) 플러그로 트랜지스터와 M1을 연결.', accent: '#c084fc', region: 'FEOL' },
    ild: { label: '층간 절연막', sub: 'ILD (Inter-Layer Dielectric)', desc: 'Low-k 유전체. 금속 배선 층(M1~M4)을 전기적으로 격리. 배선 간 기생 용량을 줄이기 위해 유전율이 낮은 재료 사용.', accent: '#60a5fa', region: 'BEOL' },
    pmd: { label: '금속전 절연막', sub: 'PMD (Pre-Metal Dielectric)', desc: 'SiO₂ 기반 절연막. 트랜지스터 위를 덮어 평탄화하고, 컨택트 홀을 형성하여 M1과 연결하는 기반.', accent: '#a78bfa', region: 'FEOL' },
    m1: { label: 'M1', sub: 'Metal 1 — 로컬 배선', desc: '가장 가는 배선. 인접 트랜지스터 간 연결.', accent: '#fb923c', region: 'BEOL' },
    via1: { label: 'Via 1', sub: 'M1 ↔ M2', desc: 'M1과 M2를 수직으로 연결하는 금속 플러그.', accent: '#d97706', region: 'BEOL' },
    m2: { label: 'M2', sub: 'Metal 2', desc: 'M1보다 넓은 중간 배선층.', accent: '#fb923c', region: 'BEOL' },
    via2: { label: 'Via 2', sub: 'M2 ↔ M3', desc: 'M2와 M3를 수직으로 연결.', accent: '#d97706', region: 'BEOL' },
    m3: { label: 'M3', sub: 'Metal 3', desc: '블록 간 신호 전달용 상위 배선.', accent: '#fb923c', region: 'BEOL' },
    m4: { label: 'M4', sub: 'Metal 4 — 글로벌 배선', desc: '가장 두꺼운 최상위 배선. 전원(VDD/VSS), 클럭 분배.', accent: '#fb923c', region: 'BEOL' },
    passivation: { label: '패시베이션', sub: 'Passivation + Bond Pad', desc: '칩 표면 보호막과 외부 연결용 금속 패드.', accent: '#6ee7b7', region: 'TOP' },
};

/* ===== GRID SYSTEM ===== */
const SVG_W = 750;
const SVG_H = 460;
const L = 110;  // left edge of chip (centered: chip center = 360 = SVG center)
const R = 610;  // right edge of chip
const CW = R - L; // chip width = 500

// 5 Gate columns (center x)
const G = [190, 270, 350, 430, 510];
const GW = 26;  // gate width

// STI between gates (center x) — placed between every pair of gates + edges
const STI_X = [150, 230, 310, 390, 470, 550];
const STI_W = 16;

/* Y bands */
const Y = {
    passT: 32, passB: 56,
    m4T: 70, m4B: 98,
    v3T: 98, v3B: 114,
    m3T: 114, m3B: 140,
    v2T: 140, v2B: 156,
    m2T: 156, m2B: 178,
    v1T: 178, v1B: 194,
    m1T: 194, m1B: 212,
    ctT: 212, ctB: 260,       // contact starts exactly at M1 bottom
    gateT: 260, gateB: 310,   // gate sits ON TOP of substrate
    subT: 310, subB: 420,     // substrate starts exactly at gate bottom
    stiT: 310, stiB: 350,     // STI trenches cut down from substrate surface
    sdT: 310, sdB: 336,       // source/drain implanted INTO substrate
};

/* Metal routing — each segment {x, w} is aligned so vias connect */
const M1 = G.map(gx => ({ x: gx - 25, w: 50 })); // one M1 bar per gate

const V1 = [G[0], G[2], G[4]]; // via1 at gate cols 0, 2, 4

const M2 = [
    { x: G[0] - 40, w: G[1] - G[0] + 60 },   // spans G0–G1 (ends at 260)
    { x: G[2] - 20, w: G[3] - G[2] + 60 },   // spans G2–G3 (starts at 300)
    { x: G[4] - 30, w: 60 },                    // over G4
];

const V2 = [G[0] + 20, G[3] - 10]; // via2 positions (within M2 ranges)

const M3 = [
    { x: L + 20, w: 210 },
    { x: L + 260, w: 220 },
];

const V3 = [L + 120, L + 370]; // via3 (M3→M4)

const M4 = [
    { x: L + 10, w: 240 },
    { x: L + 270, w: 220 },
];

export default function ChipCrossSection() {
    const [hovered, setHovered] = useState<LayerId>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };

    const op = (id: LayerId) => (hovered !== null && hovered !== id) ? 0.2 : 1;
    const hi = (id: LayerId) => hovered === id;
    const rc = (r: string) => r === 'FEOL' ? '#f87171' : r === 'BEOL' ? '#fbbf24' : '#6ee7b7';

    const hoverProps = (id: Exclude<LayerId, null>) => ({
        onMouseEnter: () => setHovered(id),
        onMouseMove: handleMouseMove,
        style: { cursor: 'pointer' as const },
    });

    return (
        <div className="my-8 relative" ref={containerRef} onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                칩 단면 구조도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                FEOL (트랜지스터) + BEOL (금속 배선) 적층 구조
            </p>

            <div className="flex justify-center">
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 740, height: 'auto' }}>

                    {/* ===== CHIP BOUNDARY ===== */}
                    <rect x={L} y={Y.passT - 6} width={CW} height={Y.subB - Y.passT + 12}
                        fill="rgba(148,163,184,0.04)" stroke="rgba(148,163,184,0.15)" strokeWidth={1} rx={4} />

                    {/* ===== ILD (Inter-Layer Dielectric) — BEOL region ===== */}
                    <motion.rect
                        animate={{ opacity: op('ild') }} transition={{ duration: 0.15 }}
                        x={L + 2} y={Y.m4T - 4} width={CW - 4} height={Y.m1B - Y.m4T + 4}
                        fill={hi('ild') ? 'rgba(96,165,250,0.18)' : 'rgba(96,165,250,0.07)'}
                        stroke={hi('ild') ? 'rgba(96,165,250,0.3)' : 'none'} strokeWidth={1}
                        rx={2}
                        {...hoverProps('ild')}
                    />
                    <text x={R - 6} y={Y.v1B + 2} textAnchor="end" fill="rgba(96,165,250,0.4)"
                        style={{ fontSize: 10, fontStyle: 'italic', pointerEvents: 'none' }}>ILD (Low-k)</text>

                    {/* ===== PMD (Pre-Metal Dielectric) — Contact + Gate region ===== */}
                    <motion.rect
                        animate={{ opacity: op('pmd') }} transition={{ duration: 0.15 }}
                        x={L + 2} y={Y.ctT + 4} width={CW - 4} height={Y.subT - Y.ctT - 4}
                        fill={hi('pmd') ? 'rgba(167,139,250,0.18)' : 'rgba(167,139,250,0.06)'}
                        stroke={hi('pmd') ? 'rgba(167,139,250,0.3)' : 'none'} strokeWidth={1}
                        rx={2}
                        {...hoverProps('pmd')}
                    />
                    <text x={R - 6} y={Y.gateT + 14} textAnchor="end" fill="rgba(167,139,250,0.4)"
                        style={{ fontSize: 10, fontStyle: 'italic', pointerEvents: 'none' }}>PMD (SiO₂)</text>

                    {/* ===== SUBSTRATE ===== */}
                    <motion.rect animate={{ opacity: op('substrate') }} transition={{ duration: 0.15 }}
                        x={L} y={Y.subT} width={CW} height={Y.subB - Y.subT}
                        fill={hi('substrate') ? '#93c5fd' : '#1e3a5f'} fillOpacity={hi('substrate') ? 0.5 : 0.6}
                        stroke="#93c5fd" strokeWidth={1} rx={2}
                        {...hoverProps('substrate')}
                    />
                    <text x={L + CW / 2} y={Y.subB - 30} textAnchor="middle" fill="#93c5fd"
                        style={{ fontSize: FONT.body, fontWeight: 600, pointerEvents: 'none' }}>
                        Si Substrate (P-type)
                    </text>

                    {/* ===== STI TRENCHES (cut into substrate from top) ===== */}
                    {STI_X.map((sx, i) => (
                        <motion.rect key={`sti-${i}`}
                            animate={{ opacity: op('sti') }} transition={{ duration: 0.15 }}
                            x={sx - STI_W / 2} y={Y.stiT} width={STI_W} height={Y.stiB - Y.stiT}
                            fill={hi('sti') ? '#fde68a' : '#a08520'} fillOpacity={hi('sti') ? 0.7 : 0.45}
                            stroke="#fde68a" strokeWidth={0.5} rx={1}
                            {...hoverProps('sti')}
                        />
                    ))}

                    {/* ===== TRANSISTOR GATES (sit on top of substrate) ===== */}
                    {G.map((gx, i) => (
                        <motion.g key={`gate-${i}`}
                            animate={{ opacity: op('transistor') }} transition={{ duration: 0.15 }}
                            {...hoverProps('transistor')}
                        >
                            {/* Source region (implanted into substrate) */}
                            <rect x={gx - GW / 2 - 14} y={Y.sdT} width={12} height={Y.sdB - Y.sdT}
                                fill={hi('transistor') ? '#fca5a5' : '#7f1d1d'} fillOpacity={0.5} rx={1} />
                            {/* Drain region (implanted into substrate) */}
                            <rect x={gx + GW / 2 + 2} y={Y.sdT} width={12} height={Y.sdB - Y.sdT}
                                fill={hi('transistor') ? '#fca5a5' : '#7f1d1d'} fillOpacity={0.5} rx={1} />
                            {/* Gate oxide (thin, at substrate surface) */}
                            <rect x={gx - GW / 2} y={Y.gateB - 4} width={GW} height={4}
                                fill="#fde68a" fillOpacity={0.5} />
                            {/* Gate electrode (above substrate) */}
                            <rect x={gx - GW / 2} y={Y.gateT} width={GW} height={Y.gateB - Y.gateT - 4}
                                fill={hi('transistor') ? '#f87171' : '#991b1b'} fillOpacity={hi('transistor') ? 0.7 : 0.5}
                                stroke="#f87171" strokeWidth={hi('transistor') ? 1.5 : 0.8} rx={2} />
                        </motion.g>
                    ))}

                    {/* ===== CONTACTS (gate → M1, aligned per gate) ===== */}
                    {G.map((gx, i) => (
                        <motion.rect key={`ct-${i}`}
                            animate={{ opacity: op('contact') }} transition={{ duration: 0.15 }}
                            x={gx - 4} y={Y.ctT} width={8} height={Y.ctB - Y.ctT}
                            fill={hi('contact') ? '#c084fc' : '#6d28d9'} fillOpacity={hi('contact') ? 0.7 : 0.45}
                            stroke="#c084fc" strokeWidth={0.5} rx={1}
                            {...hoverProps('contact')}
                        />
                    ))}

                    {/* ===== M1 (one bar per gate, directly above contacts) ===== */}
                    {M1.map((ml, i) => (
                        <motion.rect key={`m1-${i}`}
                            animate={{ opacity: op('m1') }} transition={{ duration: 0.15 }}
                            x={ml.x} y={Y.m1T} width={ml.w} height={Y.m1B - Y.m1T}
                            fill={hi('m1') ? '#fb923c' : '#9a3412'} fillOpacity={hi('m1') ? 0.65 : 0.4}
                            stroke="#fb923c" strokeWidth={hi('m1') ? 1.5 : 0.8} rx={1}
                            {...hoverProps('m1')}
                        />
                    ))}

                    {/* ===== VIA 1 (connects M1 → M2) ===== */}
                    {V1.map((vx, i) => (
                        <motion.rect key={`v1-${i}`}
                            animate={{ opacity: op('via1') }} transition={{ duration: 0.15 }}
                            x={vx - 4} y={Y.v1T} width={8} height={Y.v1B - Y.v1T}
                            fill={hi('via1') ? '#fbbf24' : '#78350f'} fillOpacity={hi('via1') ? 0.7 : 0.4}
                            rx={1}
                            {...hoverProps('via1')}
                        />
                    ))}

                    {/* ===== M2 ===== */}
                    {M2.map((ml, i) => (
                        <motion.rect key={`m2-${i}`}
                            animate={{ opacity: op('m2') }} transition={{ duration: 0.15 }}
                            x={ml.x} y={Y.m2T} width={ml.w} height={Y.m2B - Y.m2T}
                            fill={hi('m2') ? '#fb923c' : '#9a3412'} fillOpacity={hi('m2') ? 0.65 : 0.4}
                            stroke="#fb923c" strokeWidth={hi('m2') ? 1.5 : 0.8} rx={1}
                            {...hoverProps('m2')}
                        />
                    ))}

                    {/* ===== VIA 2 (connects M2 → M3) ===== */}
                    {V2.map((vx, i) => (
                        <motion.rect key={`v2-${i}`}
                            animate={{ opacity: op('via2') }} transition={{ duration: 0.15 }}
                            x={vx - 5} y={Y.v2T} width={10} height={Y.v2B - Y.v2T}
                            fill={hi('via2') ? '#fbbf24' : '#78350f'} fillOpacity={hi('via2') ? 0.7 : 0.4}
                            rx={1}
                            {...hoverProps('via2')}
                        />
                    ))}

                    {/* ===== M3 ===== */}
                    {M3.map((ml, i) => (
                        <motion.rect key={`m3-${i}`}
                            animate={{ opacity: op('m3') }} transition={{ duration: 0.15 }}
                            x={ml.x} y={Y.m3T} width={ml.w} height={Y.m3B - Y.m3T}
                            fill={hi('m3') ? '#fb923c' : '#9a3412'} fillOpacity={hi('m3') ? 0.65 : 0.4}
                            stroke="#fb923c" strokeWidth={hi('m3') ? 1.5 : 0.8} rx={1}
                            {...hoverProps('m3')}
                        />
                    ))}

                    {/* ===== VIA 3 (M3 → M4) ===== */}
                    {V3.map((vx, i) => (
                        <motion.rect key={`v3-${i}`}
                            animate={{ opacity: op('via2') }} transition={{ duration: 0.15 }}
                            x={vx - 5} y={Y.v3T} width={10} height={Y.v3B - Y.v3T}
                            fill={hi('via2') ? '#fbbf24' : '#78350f'} fillOpacity={0.35}
                            rx={1}
                            {...hoverProps('via2')}
                        />
                    ))}

                    {/* ===== M4 ===== */}
                    {M4.map((ml, i) => (
                        <motion.rect key={`m4-${i}`}
                            animate={{ opacity: op('m4') }} transition={{ duration: 0.15 }}
                            x={ml.x} y={Y.m4T} width={ml.w} height={Y.m4B - Y.m4T}
                            fill={hi('m4') ? '#fb923c' : '#9a3412'} fillOpacity={hi('m4') ? 0.65 : 0.4}
                            stroke="#fb923c" strokeWidth={hi('m4') ? 1.5 : 0.8} rx={2}
                            {...hoverProps('m4')}
                        />
                    ))}

                    {/* ===== PASSIVATION ===== */}
                    <motion.rect
                        animate={{ opacity: op('passivation') }} transition={{ duration: 0.15 }}
                        x={L + 4} y={Y.passT} width={CW - 8} height={Y.passB - Y.passT}
                        fill={hi('passivation') ? '#6ee7b7' : '#064e3b'} fillOpacity={hi('passivation') ? 0.5 : 0.3}
                        stroke="#6ee7b7" strokeWidth={1} rx={2}
                        {...hoverProps('passivation')}
                    />
                    {/* Bond pads */}
                    {[L + 130, L + 330].map((bx, i) => (
                        <motion.rect key={`bp-${i}`}
                            animate={{ opacity: op('passivation') }} transition={{ duration: 0.15 }}
                            x={bx} y={Y.passT + 4} width={40} height={Y.passB - Y.passT - 8}
                            fill="#6ee7b7" fillOpacity={0.4} rx={2}
                            style={{ pointerEvents: 'none' }}
                        />
                    ))}

                    {/* ===== BRACKETS ===== */}
                    {/* FEOL */}
                    <line x1={L - 22} y1={Y.gateT} x2={L - 22} y2={Y.subB} stroke="#f87171" strokeWidth={2} />
                    <line x1={L - 22} y1={Y.gateT} x2={L - 16} y2={Y.gateT} stroke="#f87171" strokeWidth={2} />
                    <line x1={L - 22} y1={Y.subB} x2={L - 16} y2={Y.subB} stroke="#f87171" strokeWidth={2} />
                    <text x={L - 26} y={(Y.gateT + Y.subB) / 2} textAnchor="middle" fill="#f87171"
                        style={{ fontSize: FONT.small, fontWeight: 700 }}
                        transform={`rotate(-90, ${L - 26}, ${(Y.gateT + Y.subB) / 2})`}>FEOL</text>

                    {/* BEOL */}
                    <line x1={L - 22} y1={Y.m4T} x2={L - 22} y2={Y.m1B} stroke="#fbbf24" strokeWidth={2} />
                    <line x1={L - 22} y1={Y.m4T} x2={L - 16} y2={Y.m4T} stroke="#fbbf24" strokeWidth={2} />
                    <line x1={L - 22} y1={Y.m1B} x2={L - 16} y2={Y.m1B} stroke="#fbbf24" strokeWidth={2} />
                    <text x={L - 26} y={(Y.m4T + Y.m1B) / 2} textAnchor="middle" fill="#fbbf24"
                        style={{ fontSize: FONT.small, fontWeight: 700 }}
                        transform={`rotate(-90, ${L - 26}, ${(Y.m4T + Y.m1B) / 2})`}>BEOL</text>

                    {/* ===== RIGHT LABELS ===== */}
                    {[
                        { y: (Y.passT + Y.passB) / 2, label: 'Passivation', id: 'passivation' as const },
                        { y: (Y.m4T + Y.m4B) / 2, label: 'M4 — 글로벌 배선', id: 'm4' as const },
                        { y: (Y.m3T + Y.m3B) / 2, label: 'M3', id: 'm3' as const },
                        { y: (Y.m2T + Y.m2B) / 2, label: 'M2', id: 'm2' as const },
                        { y: (Y.m1T + Y.m1B) / 2, label: 'M1 — 로컬 배선', id: 'm1' as const },
                        { y: (Y.ctT + Y.ctB) / 2, label: 'Contact', id: 'contact' as const },
                        { y: (Y.gateT + Y.gateB) / 2, label: 'Gate', id: 'transistor' as const },
                        { y: (Y.subT + Y.subB) / 2 + 10, label: 'Si Substrate', id: 'substrate' as const },
                    ].map(({ y, label, id }) => (
                        <text key={`rl-${id}`} x={R + 16} y={y + 4}
                            fill={hovered === id ? info[id].accent : COLOR.textDim}
                            style={{ fontSize: FONT.min, fontWeight: hovered === id ? 700 : 400 }}>
                            {label}
                        </text>
                    ))}

                    {/* Annotation */}
                    <text x={L + CW / 2} y={Y.subB + 20} textAnchor="middle" fill="#71717a" style={{ fontSize: FONT.min }}>
                        ▲ 위로 갈수록 배선이 넓고 두꺼워짐
                    </text>
                </svg>
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.12 }}
                        className="absolute pointer-events-none z-50"
                        style={{ left: Math.min(tooltipPos.x + 16, 400), top: tooltipPos.y - 80 }}
                    >
                        <div style={{
                            background: COLOR.tooltipBg,
                            backdropFilter: 'blur(8px)',
                            border: `1px solid ${COLOR.border}`,
                            borderRadius: 8,
                            padding: '10px 14px',
                            maxWidth: 260,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        }}>
                            <p style={{ color: info[hovered].accent, fontWeight: 600, fontSize: FONT.cardHeader, margin: '0 0 2px' }}>
                                {info[hovered].label}
                            </p>
                            <p style={{ color: COLOR.textDim, fontSize: FONT.min, margin: '0 0 6px' }}>
                                {info[hovered].sub}
                            </p>
                            <p style={{ color: COLOR.textMuted, fontSize: FONT.small, margin: 0, lineHeight: 1.5 }}>
                                {info[hovered].desc}
                            </p>
                            <span style={{ display: 'inline-block', marginTop: 6, fontSize: FONT.min, fontWeight: 600, color: rc(info[hovered].region) }}>
                                ● {info[hovered].region === 'FEOL' ? '전공정 (FEOL)' : info[hovered].region === 'BEOL' ? '후공정 배선 (BEOL)' : '최종 보호층'}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
