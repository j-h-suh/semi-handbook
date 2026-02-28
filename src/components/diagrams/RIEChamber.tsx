'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type PartId = 'gas' | 'upper' | 'plasma' | 'sheath' | 'wafer' | 'lower' | 'rf' | 'pump' | null;

interface PartInfo {
    label: string;
    sub: string;
    desc: string;
    accent: string;
}

const partInfo: Record<Exclude<PartId, null>, PartInfo> = {
    gas: { label: '가스 유입', sub: 'Gas Inlet', desc: 'CF₄, Cl₂, HBr 등 식각 기체가 샤워헤드를 통해 유입된다. 기체 종류와 유량은 식각 대상 막과 선택비에 따라 결정된다.', accent: '#22c55e' },
    upper: { label: '상부 전극 / 샤워헤드', sub: 'Upper Electrode', desc: '접지 전극으로 가스를 균일하게 분배하는 샤워헤드 역할을 겸한다.', accent: '#a1a1aa' },
    plasma: { label: '플라즈마 영역', sub: 'Plasma Glow Region', desc: 'RF 전력에 의해 기체가 이온화된 상태. 라디칼은 화학적 식각을, 이온은 물리적 식각을 담당한다.', accent: '#a78bfa' },
    sheath: { label: '시스 영역', sub: 'Sheath', desc: '플라즈마와 웨이퍼 사이의 전위 강하 영역. 양이온이 수직 가속되어 이방성 식각의 핵심이 된다.', accent: '#c084fc' },
    wafer: { label: '웨이퍼', sub: 'Wafer', desc: '식각 대상. 정전척(ESC) 위에 고정되며 헬륨 가스로 뒷면 냉각된다.', accent: '#60a5fa' },
    lower: { label: '하부 전극 / 정전척', sub: 'Lower Electrode / ESC', desc: 'RF 전력이 인가되는 전극. ESC(Electrostatic Chuck)는 정전기력으로 웨이퍼를 고정하는 척(Chuck)이며, 바이어스 전압으로 이온 에너지를 제어한다.', accent: '#94a3b8' },
    rf: { label: 'RF 전원', sub: '13.56 MHz', desc: 'RF(Radio Frequency, 라디오주파수) 전력을 하부 전극에 인가하여 플라즈마를 생성·유지한다. 소스 RF(플라즈마 밀도)와 바이어스 RF(이온 에너지)를 독립 제어하는 것이 최신 트렌드다.', accent: '#f59e0b' },
    pump: { label: '진공 펌프', sub: 'Vacuum Pump', desc: '챔버를 저압으로 유지하고 식각 부산물(SiF₄ 등)을 배출한다.', accent: '#6b7280' },
};

/* ─── Geometry ─── */
const W = 500, H = 420;
const CH_X = 80, CH_Y = 50, CH_W = 340, CH_H = 310;
const IN_X = CH_X + 15, IN_Y = CH_Y + 18, IN_W = CH_W - 30, IN_H = CH_H - 36;
const UE_X = IN_X + 15, UE_Y = IN_Y + 4, UE_W = IN_W - 30, UE_H = 26;
const GAS_W = 64, GAS_H = 36, GAS_X = W / 2 - GAS_W / 2, GAS_Y = CH_Y - GAS_H + 6;
const PL_X = IN_X + 15, PL_Y = UE_Y + UE_H + 20, PL_W = IN_W - 30, PL_H = 110;
const SH_Y = PL_Y + PL_H + 4, SH_H = 30;
const WF_Y = SH_Y + SH_H + 2, WF_H = 12, WF_X = PL_X + 30, WF_W = PL_W - 60;
const LE_Y = WF_Y + WF_H + 2, LE_H = 30, LE_X = PL_X + 15, LE_W = PL_W - 30;
const RF_Y = LE_Y + LE_H;
const PUMP_X = CH_X - 10, PUMP_Y = CH_Y + CH_H + 20;

export default function RIEChamber() {
    const [hovered, setHovered] = useState<PartId>(null);
    const op = (id: PartId) => (hovered !== null && hovered !== id) ? 0.3 : 1;
    const hp = (id: Exclude<PartId, null>) => ({ onMouseEnter: () => setHovered(id), style: { cursor: 'pointer' as const } });

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                RIE 챔버 구조 단면도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Reactive Ion Etching Chamber Cross-Section
            </p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 600, margin: '0 auto', display: 'block' }}>
                {/* Chamber walls */}
                <rect x={CH_X} y={CH_Y} width={CH_W} height={CH_H} rx={8} fill="#27272a" stroke="#52525b" strokeWidth={2} />
                <rect x={IN_X} y={IN_Y} width={IN_W} height={IN_H} rx={4} fill="#18181b" stroke="#3f3f46" strokeWidth={1} />

                {/* Gas inlet */}
                <g {...hp('gas')}><motion.g animate={{ opacity: op('gas') }} transition={{ duration: 0.2 }}>
                    <rect x={GAS_X} y={GAS_Y} width={GAS_W} height={GAS_H} rx={3} fill="#166534" stroke="#22c55e" strokeWidth={1.2} />
                    <text x={W / 2} y={GAS_Y + 15} textAnchor="middle" fontSize={FONT.min} fill="#86efac">Gas In</text>
                    <text x={W / 2} y={GAS_Y + 29} textAnchor="middle" fontSize={FONT.min} fill="#4ade80" opacity={0.7}>CF₄, Cl₂…</text>
                    {[0.25, 0.5, 0.75].map(f => <line key={f} x1={UE_X + UE_W * f} y1={UE_Y + UE_H + 2} x2={UE_X + UE_W * f} y2={UE_Y + UE_H + 14} stroke="#22c55e" strokeWidth={1.2} opacity={0.6} />)}
                </motion.g></g>

                {/* Upper electrode */}
                <g {...hp('upper')}><motion.g animate={{ opacity: op('upper') }} transition={{ duration: 0.2 }}>
                    <rect x={UE_X} y={UE_Y} width={UE_W} height={UE_H} rx={3} fill="#52525b" stroke="#71717a" strokeWidth={1.2} />
                    {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={UE_X + UE_W * (i + 1) / 8} cy={UE_Y + UE_H - 3} r={2} fill="#3f3f46" />)}
                    <text x={W / 2} y={UE_Y + UE_H / 2 + 2} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textMuted}>상부 전극 / 샤워헤드</text>
                </motion.g></g>

                {/* Plasma region */}
                <g {...hp('plasma')}><motion.g animate={{ opacity: op('plasma') }} transition={{ duration: 0.2 }}>
                    <rect x={PL_X} y={PL_Y} width={PL_W} height={PL_H} rx={6} fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth={1} strokeDasharray="4,2" />
                    <text x={W / 2} y={PL_Y + PL_H / 2 - 4} textAnchor="middle" fontSize={FONT.body} fill="#a78bfa" fontWeight={600}>플라즈마 영역</text>
                    <text x={W / 2} y={PL_Y + PL_H / 2 + 12} textAnchor="middle" fontSize={FONT.min} fill="#7c3aed" opacity={0.7}>Plasma Glow Region</text>
                </motion.g></g>

                {/* Sheath */}
                <g {...hp('sheath')}><motion.g animate={{ opacity: op('sheath') }} transition={{ duration: 0.2 }}>
                    <rect x={PL_X} y={SH_Y} width={PL_W} height={SH_H} rx={2} fill="rgba(192,132,252,0.08)" stroke="#c084fc" strokeWidth={0.8} strokeDasharray="3,2" />
                    <text x={PL_X + PL_W - 8} y={SH_Y + SH_H / 2 + 4} textAnchor="end" fontSize={FONT.min} fill="#c084fc">Sheath</text>
                    {[0.2, 0.4, 0.6, 0.8].map(f => <line key={f} x1={PL_X + PL_W * f} y1={SH_Y + 3} x2={PL_X + PL_W * f} y2={SH_Y + SH_H - 3} stroke="#ef4444" strokeWidth={1.5} opacity={0.6} />)}
                    <text x={PL_X + 8} y={SH_Y + SH_H / 2 + 4} textAnchor="start" fontSize={FONT.min} fill="#ef4444" fontWeight={600}>이온 ↓</text>
                </motion.g></g>

                {/* Wafer */}
                <g {...hp('wafer')}><motion.g animate={{ opacity: op('wafer') }} transition={{ duration: 0.2 }}>
                    <rect x={WF_X} y={WF_Y} width={WF_W} height={WF_H} rx={2} fill="#1e40af" stroke="#3b82f6" strokeWidth={1.2} />
                    <text x={W / 2} y={WF_Y + WF_H / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill="#93c5fd">웨이퍼</text>
                </motion.g></g>

                {/* Lower electrode */}
                <g {...hp('lower')}><motion.g animate={{ opacity: op('lower') }} transition={{ duration: 0.2 }}>
                    <rect x={LE_X} y={LE_Y} width={LE_W} height={LE_H} rx={3} fill="#52525b" stroke="#71717a" strokeWidth={1.2} />
                    <text x={W / 2} y={LE_Y + LE_H / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textMuted}>하부 전극 / ESC</text>
                </motion.g></g>

                {/* RF power */}
                <g {...hp('rf')}><motion.g animate={{ opacity: op('rf') }} transition={{ duration: 0.2 }}>
                    <line x1={W / 2} y1={RF_Y} x2={W / 2} y2={RF_Y + 20} stroke="#f59e0b" strokeWidth={2} />
                    <path d={`M${W / 2 - 18},${RF_Y + 28} Q${W / 2 - 9},${RF_Y + 18} ${W / 2},${RF_Y + 28} Q${W / 2 + 9},${RF_Y + 38} ${W / 2 + 18},${RF_Y + 28}`} fill="none" stroke="#f59e0b" strokeWidth={2} />
                    <rect x={W / 2 - 36} y={RF_Y + 38} width={72} height={20} rx={4} fill="#422006" stroke="#f59e0b" strokeWidth={1} />
                    <text x={W / 2} y={RF_Y + 52} textAnchor="middle" fontSize={FONT.min} fill="#fbbf24" fontWeight={600}>RF 전원</text>
                </motion.g></g>

                {/* Pump */}
                <g {...hp('pump')}><motion.g animate={{ opacity: op('pump') }} transition={{ duration: 0.2 }}>
                    <line x1={PUMP_X + 30} y1={CH_Y + CH_H} x2={PUMP_X + 30} y2={PUMP_Y} stroke="#6b7280" strokeWidth={1.5} />
                    <rect x={PUMP_X} y={PUMP_Y} width={60} height={24} rx={3} fill="#1f2937" stroke="#6b7280" strokeWidth={1} />
                    <text x={PUMP_X + 30} y={PUMP_Y + 16} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>Pump ↓</text>
                </motion.g></g>

                {/* Legend */}
                <g transform={`translate(${W / 2 - 85}, ${PUMP_Y + 7})`}>
                    <line x1={0} y1={5} x2={16} y2={5} stroke="#22c55e" strokeWidth={1.5} />
                    <text x={20} y={9} fontSize={FONT.min} fill={COLOR.textDim}>가스 유입</text>
                    <line x1={90} y1={5} x2={106} y2={5} stroke="#ef4444" strokeWidth={1.5} />
                    <text x={110} y={9} fontSize={FONT.min} fill={COLOR.textDim}>이온 가속</text>
                </g>

                <text x={CH_X + CH_W - 12} y={CH_Y + 16} textAnchor="end" fontSize={FONT.min} fill="#71717a">Vacuum Chamber</text>
            </svg>

            <AnimatePresence>
                {hovered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', maxWidth: 480, pointerEvents: 'none', zIndex: 10 }}>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: partInfo[hovered].accent, marginBottom: 4 }}>
                            {partInfo[hovered].label}
                            <span style={{ fontSize: FONT.min, fontWeight: 400, color: COLOR.textDim, marginLeft: 8 }}>{partInfo[hovered].sub}</span>
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{partInfo[hovered].desc}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
