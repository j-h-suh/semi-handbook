'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type PartId = 'quartz' | 'heater' | 'wafer' | 'boat' | 'gasIn' | 'exhaust' | 'door' | null;

interface PartInfo {
    label: string;
    sub: string;
    desc: string;
    accent: string;
}

const parts: Record<Exclude<PartId, null>, PartInfo> = {
    quartz: {
        label: '석영 튜브', sub: 'Quartz Tube',
        desc: '순도 99.99%의 석영(SiO₂)으로 만든 반응 챔버. 고온(1200°C)에서도 안정적이며, 오염 원소를 방출하지 않는다.',
        accent: '#e8e0d0',
    },
    heater: {
        label: '저항 가열 코일', sub: 'Heating Coil',
        desc: '석영 튜브를 감싸는 전기 저항 히터. 800~1,200°C의 균일한 온도 분포(Flat Zone)를 형성한다.',
        accent: '#f5a030',
    },
    wafer: {
        label: '웨이퍼', sub: 'Si Wafer',
        desc: '산화 대상인 실리콘 웨이퍼. 수직으로 배열되어 가스가 양면에 균일하게 접촉한다.',
        accent: '#93c5fd',
    },
    boat: {
        label: '웨이퍼 보트', sub: 'Wafer Boat (25-50장)',
        desc: '석영 또는 SiC 재질의 웨이퍼 지지대. 한 번에 25~50장의 웨이퍼를 적재한다.',
        accent: '#a1a1aa',
    },
    gasIn: {
        label: '가스 유입구', sub: 'Gas Inlet (O₂ / H₂O)',
        desc: '산화용 가스 공급구. 건식 산화는 O₂, 습식 산화는 H₂O(수증기)를 사용한다.',
        accent: '#86efac',
    },
    exhaust: {
        label: '배기구', sub: 'Exhaust',
        desc: '반응 부산물과 미반응 가스를 외부로 배출. 챔버 내 압력을 일정하게 유지한다.',
        accent: '#fca5a5',
    },
    door: {
        label: '로딩 도어', sub: 'Loading Door',
        desc: '웨이퍼 보트의 투입과 회수를 위한 개폐구. 공정 중에는 밀폐되어 외부 오염을 차단한다.',
        accent: '#d4d4d8',
    },
};

const SVG_W = 780;
const SVG_H = 260;

export default function ThermalOxidationFurnace() {
    const [hovered, setHovered] = useState<PartId>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };

    const op = (id: PartId) => (hovered !== null && hovered !== id) ? 0.2 : 1;
    const hi = (id: PartId) => hovered === id;

    const hp = (id: Exclude<PartId, null>) => ({
        onMouseEnter: () => setHovered(id),
        onMouseMove: handleMouseMove,
        style: { cursor: 'pointer' as const },
    });

    /* Layout: gas flows LEFT → RIGHT */
    const tubeL = 120, tubeR = 680, tubeY = 55, tubeH = 170;
    const tubeMidY = tubeY + tubeH / 2;

    /* Wafer boat inside tube — exactly centered */
    const tubeCenter = (tubeL + tubeR) / 2; // 400
    const boatW = 330;
    const boatL = tubeCenter - boatW / 2;  // 235
    const boatR = tubeCenter + boatW / 2;  // 565

    return (
        <div className="my-8 relative" ref={containerRef} onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                열산화 퍼니스 단면도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                Horizontal Thermal Oxidation Furnace
            </p>

            <div className="flex justify-center">
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 780, height: 'auto' }}>

                    {/* ===== Temperature annotation (top) ===== */}
                    <text x={(tubeL + tubeR) / 2} y={tubeY - 30}
                        textAnchor="middle" fill="#f5a030" style={{ fontSize: FONT.min, fontWeight: 600 }}>
                        🔥 800 ~ 1,200°C (균일 온도 영역 Flat Zone)
                    </text>

                    {/* ===== HEATING COILS (wrapping tube) ===== */}
                    <motion.g animate={{ opacity: op('heater') }} transition={{ duration: 0.15 }} {...hp('heater')}>
                        {/* Top and bottom heater strips */}
                        <rect x={tubeL + 10} y={tubeY - 16} width={tubeR - tubeL - 20} height={10}
                            fill={hi('heater') ? '#f5a030' : '#92400e'} fillOpacity={hi('heater') ? 0.6 : 0.35} rx={3} />
                        <rect x={tubeL + 10} y={tubeY + tubeH + 6} width={tubeR - tubeL - 20} height={10}
                            fill={hi('heater') ? '#f5a030' : '#92400e'} fillOpacity={hi('heater') ? 0.6 : 0.35} rx={3} />
                        {/* Vertical coil bars */}
                        {Array.from({ length: 16 }, (_, i) => {
                            const cx = tubeL + 30 + i * 35;
                            if (cx > tubeR - 20) return null;
                            return (
                                <React.Fragment key={`hc-${i}`}>
                                    <rect x={cx} y={tubeY - 16} width={4} height={10}
                                        fill={hi('heater') ? '#f5a030' : '#92400e'} fillOpacity={0.6} rx={1} />
                                    <rect x={cx} y={tubeY + tubeH + 6} width={4} height={10}
                                        fill={hi('heater') ? '#f5a030' : '#92400e'} fillOpacity={0.6} rx={1} />
                                </React.Fragment>
                            );
                        })}
                    </motion.g>
                    {/* Heater label */}
                    <text x={tubeR + 6} y={tubeY - 8} fill={hovered === 'heater' ? '#f5a030' : COLOR.textDim}
                        style={{ fontSize: FONT.min, fontWeight: hovered === 'heater' ? 700 : 400 }}>가열 코일</text>

                    {/* ===== QUARTZ TUBE ===== */}
                    <motion.rect animate={{ opacity: op('quartz') }} transition={{ duration: 0.15 }}
                        x={tubeL} y={tubeY} width={tubeR - tubeL} height={tubeH}
                        fill={hi('quartz') ? 'rgba(232,224,208,0.12)' : 'rgba(232,224,208,0.04)'}
                        stroke={hi('quartz') ? '#e8e0d0' : 'rgba(232,224,208,0.25)'}
                        strokeWidth={hi('quartz') ? 2 : 1.5} rx={6}
                        {...hp('quartz')}
                    />
                    {/* Quartz tube label (inside, top-right) */}
                    <text x={tubeR - 8} y={tubeY + 16} textAnchor="end"
                        fill="rgba(232,224,208,0.35)" style={{ fontSize: FONT.min, fontStyle: 'italic' }}>
                        석영 튜브 (Quartz Tube)
                    </text>

                    {/* ===== GAS INLET (LEFT side) ===== */}
                    <motion.g animate={{ opacity: op('gasIn') }} transition={{ duration: 0.15 }} {...hp('gasIn')}>
                        <rect x={tubeL - 58} y={tubeMidY - 20} width={52} height={40}
                            fill={hi('gasIn') ? '#86efac' : '#166534'} fillOpacity={hi('gasIn') ? 0.4 : 0.2}
                            stroke="#86efac" strokeWidth={1} rx={4} />
                        <text x={tubeL - 32} y={tubeMidY - 4} textAnchor="middle"
                            fill="#86efac" style={{ fontSize: FONT.min, fontWeight: 600 }}>
                            가스 유입
                        </text>
                        <text x={tubeL - 32} y={tubeMidY + 8} textAnchor="middle"
                            fill="#86efac" style={{ fontSize: FONT.min }}>
                            O₂ / H₂O
                        </text>
                    </motion.g>

                    {/* Gas flow arrows (LEFT → RIGHT inside tube) */}
                    <defs>
                        <marker id="gas-arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
                            <polygon points="0,0 8,4 0,8" fill="rgba(134,239,172,0.6)" />
                        </marker>
                    </defs>
                    {[tubeMidY - 28, tubeMidY + 28].map((gy, i) => (
                        <line key={`gas-${i}`}
                            x1={tubeL + 16} y1={gy} x2={tubeR - 16} y2={gy}
                            stroke="rgba(134,239,172,0.25)" strokeWidth={1.5} strokeDasharray="8 5"
                            markerEnd="url(#gas-arrow)" />
                    ))}
                    {/* Gas flow label (near right arrowhead) */}
                    <text x={tubeR - 24} y={tubeMidY - 36} textAnchor="end"
                        fill="rgba(134,239,172,0.5)" style={{ fontSize: FONT.min, fontWeight: 600 }}>
                        가스 흐름
                    </text>

                    {/* ===== LOADING DOOR (LEFT end of tube) ===== */}
                    <motion.rect animate={{ opacity: op('door') }} transition={{ duration: 0.15 }}
                        x={tubeL - 2} y={tubeY + 8} width={14} height={tubeH - 16}
                        fill={hi('door') ? '#d4d4d8' : '#52525b'} fillOpacity={hi('door') ? 0.6 : 0.35}
                        stroke="#d4d4d8" strokeWidth={0.8} rx={2}
                        {...hp('door')}
                    />

                    {/* ===== WAFER BOAT ===== */}
                    <motion.g animate={{ opacity: op('boat') }} transition={{ duration: 0.15 }} {...hp('boat')}>
                        {/* Boat rails (top & bottom) */}
                        <rect x={boatL} y={tubeY + tubeH - 30} width={boatR - boatL} height={3}
                            fill={hi('boat') ? '#a1a1aa' : '#52525b'} fillOpacity={0.5} rx={1} />
                        <rect x={boatL} y={tubeY + 27} width={boatR - boatL} height={3}
                            fill={hi('boat') ? '#a1a1aa' : '#52525b'} fillOpacity={0.5} rx={1} />
                        {/* Boat end plates */}
                        <rect x={boatL - 2} y={tubeY + 24} width={3} height={tubeH - 48}
                            fill={hi('boat') ? '#a1a1aa' : '#52525b'} fillOpacity={0.5} rx={1} />
                        <rect x={boatR - 1} y={tubeY + 24} width={3} height={tubeH - 48}
                            fill={hi('boat') ? '#a1a1aa' : '#52525b'} fillOpacity={0.5} rx={1} />
                    </motion.g>
                    {/* Boat label — right below boat bottom rail, inside tube */}
                    <text x={(boatL + boatR) / 2} y={tubeY + tubeH - 16} textAnchor="middle"
                        fill={hovered === 'boat' ? '#a1a1aa' : COLOR.textDim}
                        style={{ fontSize: FONT.min, fontWeight: hovered === 'boat' ? 700 : 400 }}>
                        웨이퍼 보트 (25~50장)
                    </text>

                    {/* ===== WAFERS (evenly spaced inside boat) ===== */}
                    <motion.g animate={{ opacity: op('wafer') }} transition={{ duration: 0.15 }} {...hp('wafer')}>
                        {(() => {
                            const numWafers = 14;
                            const pad = 18; // padding from boat edges
                            const firstX = boatL + pad;
                            const lastX = boatR - pad;
                            const spacing = (lastX - firstX) / (numWafers - 1);
                            return Array.from({ length: numWafers }, (_, i) => (
                                <rect key={`w-${i}`}
                                    x={firstX + i * spacing} y={tubeY + 34} width={3} height={tubeH - 68}
                                    fill={hi('wafer') ? '#93c5fd' : '#3b82f6'}
                                    fillOpacity={hi('wafer') ? 0.8 : 0.45} rx={1}
                                />
                            ));
                        })()}
                    </motion.g>

                    {/* ===== EXHAUST (RIGHT side) ===== */}
                    <motion.g animate={{ opacity: op('exhaust') }} transition={{ duration: 0.15 }} {...hp('exhaust')}>
                        <rect x={tubeR + 6} y={tubeMidY - 20} width={52} height={40}
                            fill={hi('exhaust') ? '#fca5a5' : '#7f1d1d'} fillOpacity={hi('exhaust') ? 0.4 : 0.2}
                            stroke="#fca5a5" strokeWidth={1} rx={4} />
                        <text x={tubeR + 32} y={tubeMidY - 2} textAnchor="middle"
                            fill="#fca5a5" style={{ fontSize: FONT.min, fontWeight: 600 }}>
                            배기
                        </text>
                        <text x={tubeR + 32} y={tubeMidY + 10} textAnchor="middle"
                            fill="#fca5a5" style={{ fontSize: FONT.min }}>
                            Exhaust
                        </text>
                    </motion.g>

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
                        style={{ left: Math.min(tooltipPos.x + 16, 500), top: tooltipPos.y - 80 }}
                    >
                        <div style={{
                            background: COLOR.tooltipBg,
                            backdropFilter: 'blur(8px)',
                            border: `1px solid ${COLOR.border}`,
                            borderRadius: 8,
                            padding: '10px 14px',
                            maxWidth: 280,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        }}>
                            <p style={{ color: parts[hovered].accent, fontWeight: 600, fontSize: FONT.cardHeader, margin: '0 0 2px' }}>
                                {parts[hovered].label}
                            </p>
                            <p style={{ color: COLOR.textDim, fontSize: FONT.min, margin: '0 0 6px' }}>
                                {parts[hovered].sub}
                            </p>
                            <p style={{ color: COLOR.textMuted, fontSize: FONT.small, margin: 0, lineHeight: 1.5 }}>
                                {parts[hovered].desc}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
