'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 ─── */
type NodeId = 'node65' | 'node7' | 'node3' | null;

interface NodeInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
    dofHalf: number;
    elHalf: number;
}

const NODES: Record<Exclude<NodeId, null>, NodeInfo> = {
    node65: {
        label: '65nm node', sub: 'ArF dry — 넓은 윈도우',
        desc: 'DOF ≈ ±120nm, EL ≈ ±8 mJ/cm². 공정 마진이 넓어 양산 안정성이 높다. 장비/웨이퍼 변동을 충분히 흡수.',
        color: '#3b82f6', dofHalf: 120, elHalf: 8,
    },
    node7: {
        label: '7nm node', sub: 'ArF-i + multi — 좁아진 윈도우',
        desc: 'DOF ≈ ±50nm, EL ≈ ±3 mJ/cm². 공정 마진이 크게 축소. Focus/Dose 변동에 민감하여 정밀 제어 필수.',
        color: '#ef4444', dofHalf: 50, elHalf: 3,
    },
    node3: {
        label: '3nm node', sub: 'EUV — 극도로 좁은 윈도우',
        desc: 'DOF ≈ ±30nm, EL ≈ ±1.5 mJ/cm². AI 기반 실시간 보정 없이는 양산 불가능한 수준. 모든 변동 요인을 nm 단위로 관리.',
        color: '#a855f7', dofHalf: 30, elHalf: 1.5,
    },
};

const NODE_ORDER: Exclude<NodeId, null>[] = ['node65', 'node7', 'node3'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 520;
const SVG_H = 320;
const CX = SVG_W / 2;
const CY = SVG_H / 2;
const SCALE_X = 1.6;    // px per nm (focus)
const SCALE_Y = 12;     // px per mJ/cm²
const AXIS_LEFT = CX - 160;
const AXIS_RIGHT = CX + 160;
const AXIS_TOP = CY - 120;
const AXIS_BOT = CY + 120;

export default function ProcessWindowDoseFocus() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                공정 윈도우 (Process Window)
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Dose-Focus Space — 공정 미세화에 따른 윈도우 축소
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 520)} style={{ maxWidth: '100%' }}>
                    {/* 축 */}
                    <line x1={AXIS_LEFT} y1={CY} x2={AXIS_RIGHT} y2={CY}
                        stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                    <line x1={CX} y1={AXIS_TOP} x2={CX} y2={AXIS_BOT}
                        stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                    {/* 축 라벨 */}
                    <text x={AXIS_RIGHT + 4} y={CY + 4} fill={COLOR.textDim} fontSize={FONT.min}>Focus (nm)</text>
                    <text x={CX + 6} y={AXIS_TOP - 4} fill={COLOR.textDim} fontSize={FONT.min}>Dose (mJ/cm²)</text>
                    {/* 축 눈금 */}
                    {[-100, -50, 50, 100].map(v => (
                        <g key={v}>
                            <line x1={CX + v * SCALE_X} y1={CY - 3} x2={CX + v * SCALE_X} y2={CY + 3}
                                stroke="rgba(255,255,255,0.1)" strokeWidth={0.8} />
                            <text x={CX + v * SCALE_X} y={CY + 16} textAnchor="middle"
                                fill={COLOR.textDim} fontSize={FONT.min}>{v}</text>
                        </g>
                    ))}
                    {[-5, 5].map(v => (
                        <g key={v}>
                            <line x1={CX - 3} y1={CY - v * SCALE_Y} x2={CX + 3} y2={CY - v * SCALE_Y}
                                stroke="rgba(255,255,255,0.1)" strokeWidth={0.8} />
                            <text x={CX - 8} y={CY - v * SCALE_Y + 4} textAnchor="end"
                                fill={COLOR.textDim} fontSize={FONT.min}>{v > 0 ? `+${v}` : v}</text>
                        </g>
                    ))}

                    {/* Best Focus / Best Dose 교차점 */}
                    <circle cx={CX} cy={CY} r={3} fill="rgba(239,68,68,0.6)" />
                    <text x={CX} y={CY - 8} textAnchor="middle" fill="rgba(239,68,68,0.5)" fontSize={FONT.min}>Best</text>

                    {/* 타원들 */}
                    {NODE_ORDER.map(id => {
                        const n = NODES[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        const rx = n.dofHalf * SCALE_X;
                        const ry = n.elHalf * SCALE_Y;

                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.15 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <ellipse cx={CX} cy={CY} rx={rx} ry={ry}
                                    fill={active ? `${n.color}20` : `${n.color}0a`}
                                    stroke={active ? n.color : `${n.color}60`}
                                    strokeWidth={active ? 2 : 1.2} />
                                <text
                                    x={id === 'node3' ? CX : CX + rx - 4}
                                    y={id === 'node7' ? CY - ry - 6 : id === 'node3' ? CY - ry - 6 : CY - ry + 14}
                                    textAnchor={id === 'node3' ? 'middle' : 'end'}
                                    fill={active ? n.color : `${n.color}80`} fontSize={FONT.min} fontWeight={600}>
                                    {n.label}
                                </text>
                            </motion.g>
                        );
                    })}


                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 58 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: NODES[hovered].color, marginBottom: 2 }}>
                                {NODES[hovered].label} — {NODES[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {NODES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 타원을 호버하세요. 공정이 미세해질수록 Dose-Focus 공정 윈도우가 극적으로 좁아집니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
