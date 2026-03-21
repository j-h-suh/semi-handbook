'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 비교 데이터 ─── */
type SideId = 'binary' | 'psm' | null;

interface SideInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const SIDES: Record<Exclude<SideId, null>, SideInfo> = {
    binary: {
        label: '이진 마스크 (Binary Mask)', sub: '빛 차단 or 투과만',
        desc: '크롬이 있으면 빛 차단(0), 없으면 투과(1). 단순하지만 인접 패턴 경계에서 빛이 퍼져 해상도에 한계. 회절에 의해 패턴 경계가 둥글게 흐려진다.',
        color: '#60a5fa',
    },
    psm: {
        label: '교대형 위상 반전 마스크 (Alternating Phase-Shift Mask)', sub: '0° / 180° 위상으로 상쇄 간섭',
        desc: '인접 투과 영역에 0°와 180° 위상을 교대 배치. 경계에서 빛이 상쇄 간섭(Destructive Interference)하여 진폭이 0이 되므로, 패턴 경계가 극도로 선명해진다. 같은 λ, NA에서 해상도를 크게 향상.',
        color: '#c084fc',
    },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 560;
const SVG_H = 310;
const PANEL_W = 230;
const GAP = 40;
const LEFT_X = (SVG_W - PANEL_W * 2 - GAP) / 2;
const RIGHT_X = LEFT_X + PANEL_W + GAP;

/* 각 패널 내 좌표 */
const MASK_Y = 34;
const MASK_H = 30;
const WAVE_Y = MASK_Y + MASK_H + 30;
const WAVE_H = 70;
const INTENS_Y = WAVE_Y + WAVE_H + 30;
const INTENS_H = 55;

function BinaryPanel({ x, w, active }: { x: number; w: number; active: boolean }) {
    const cx = x + w / 2;
    const barW = 20;
    const gapW = 30;
    const maskColor = active ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.1)';
    const strokeC = active ? '#60a5fa' : 'rgba(255,255,255,0.2)';

    return (
        <g>
            {/* 마스크 바 */}
            <text x={cx} y={MASK_Y - 6} textAnchor="middle" fill={active ? '#60a5fa' : COLOR.textDim} fontSize={FONT.min}>이진 마스크</text>
            {[-2, -1, 0, 1, 2].map(i => (
                <rect key={i} x={cx + i * (barW + gapW) - barW / 2} y={MASK_Y} width={barW} height={MASK_H}
                    fill={maskColor} stroke={strokeC} strokeWidth={0.8} rx={1} />
            ))}
            {/* 투과 영역 라벨 */}
            {[-1.5, -0.5, 0.5, 1.5].map((i, idx) => (
                <text key={idx} x={cx + i * (barW + gapW)} y={MASK_Y + MASK_H / 2 + 4} textAnchor="middle"
                    fill="rgba(251,191,36,0.4)" fontSize={FONT.min}>↓</text>
            ))}

            {/* 파형 — 동위상, 경계에서 둥글게 */}
            <text x={cx} y={WAVE_Y - 6} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>빛 진폭 (동위상)</text>
            {[-1.5, -0.5, 0.5, 1.5].map((i, idx) => {
                const px = cx + i * (barW + gapW);
                return (
                    <ellipse key={idx} cx={px} cy={WAVE_Y + WAVE_H / 2} rx={18} ry={WAVE_H / 2 - 4}
                        fill="none" stroke={active ? 'rgba(96,165,250,0.5)' : 'rgba(96,165,250,0.25)'} strokeWidth={1.5} />
                );
            })}

            {/* 강도 프로필 — 둥근 피크, 경계에서 부드러운 전환 */}
            <text x={cx} y={INTENS_Y - 6} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>빛 강도</text>
            <path d={(() => {
                const baseline = INTENS_Y + INTENS_H - 4;
                const peakH = INTENS_H - 10;
                const centers = [-75, -25, 25, 75]; // gap centers
                const pts: string[] = [];
                for (let dx = -100; dx <= 100; dx += 1) {
                    let val = 0;
                    for (const c of centers) {
                        const dist = Math.abs(dx - c);
                        if (dist < 22) val = Math.max(val, Math.cos(dist / 22 * Math.PI / 2));
                    }
                    // Binary: broad peaks with gradual falloff, boundaries don't reach zero
                    const overlap = centers.some((c, i) => {
                        const next = centers[i + 1];
                        if (!next) return false;
                        return dx > c + 10 && dx < next - 10;
                    });
                    if (overlap) val = Math.max(val, 0.4); // boundary stays high = blur
                    pts.push(`${cx + dx},${baseline - val * peakH}`);
                }
                return `M ${pts.join(' L ')}`;
            })()}
                fill="none" stroke={active ? 'rgba(96,165,250,0.6)' : 'rgba(96,165,250,0.3)'} strokeWidth={1.5} />
            {/* 경계 흐림 표시 */}
            {[-50, 0, 50].map((bx, i) => (
                <g key={i}>
                    <line x1={cx + bx} y1={INTENS_Y} x2={cx + bx} y2={INTENS_Y + INTENS_H}
                        stroke="rgba(239,68,68,0.2)" strokeWidth={0.8} strokeDasharray="2 2" />
                    <text x={cx + bx} y={INTENS_Y + INTENS_H + 14} textAnchor="middle"
                        fill="rgba(239,68,68,0.5)" fontSize={FONT.min}>흐림</text>
                </g>
            ))}
        </g>
    );
}

function PSMPanel({ x, w, active }: { x: number; w: number; active: boolean }) {
    const cx = x + w / 2;
    const barW = 20;
    const gapW = 30;
    const maskColor = active ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.1)';
    const strokeC = active ? '#c084fc' : 'rgba(255,255,255,0.2)';

    return (
        <g>
            {/* 마스크 바 — 교대 위상 색 표시 */}
            <text x={cx} y={MASK_Y - 6} textAnchor="middle" fill={active ? '#c084fc' : COLOR.textDim} fontSize={FONT.min}>교대형 위상 반전 마스크</text>
            {[-2, -1, 0, 1, 2].map(i => (
                <rect key={i} x={cx + i * (barW + gapW) - barW / 2} y={MASK_Y} width={barW} height={MASK_H}
                    fill={maskColor} stroke={strokeC} strokeWidth={0.8} rx={1} />
            ))}
            {/* 위상 라벨 — 교대 */}
            {[-1.5, -0.5, 0.5, 1.5].map((i, idx) => (
                <text key={idx} x={cx + i * (barW + gapW)} y={MASK_Y + MASK_H / 2 + 4} textAnchor="middle"
                    fill={idx % 2 === 0 ? 'rgba(96,165,250,0.6)' : 'rgba(239,68,68,0.6)'} fontSize={FONT.min} fontWeight={600}>
                    {idx % 2 === 0 ? '0°' : '180°'}
                </text>
            ))}

            {/* 파형 — 반대 위상 */}
            <text x={cx} y={WAVE_Y - 6} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>빛 진폭 (반대 위상)</text>
            {[-1.5, -0.5, 0.5, 1.5].map((i, idx) => {
                const px = cx + i * (barW + gapW);
                const isInverted = idx % 2 === 1;
                return (
                    <ellipse key={idx} cx={px} cy={WAVE_Y + WAVE_H / 2} rx={18} ry={WAVE_H / 2 - 4}
                        fill="none"
                        stroke={isInverted ? 'rgba(239,68,68,0.5)' : active ? 'rgba(192,132,252,0.5)' : 'rgba(192,132,252,0.25)'}
                        strokeWidth={1.5}
                        strokeDasharray={isInverted ? '4 2' : 'none'} />
                );
            })}

            {/* 강도 프로필 — 모든 gap에 피크 있음 (180°도 강도는 양수), 경계에서만 0 */}
            <text x={cx} y={INTENS_Y - 6} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>빛 강도</text>
            <path d={(() => {
                const baseline = INTENS_Y + INTENS_H - 4;
                const peakH = INTENS_H - 10;
                const centers = [-75, -25, 25, 75];
                const boundaries = [-50, 0, 50]; // where destructive interference occurs
                const pts: string[] = [];
                for (let dx = -100; dx <= 100; dx += 1) {
                    let val = 0;
                    for (const c of centers) {
                        const dist = Math.abs(dx - c);
                        if (dist < 20) val = Math.max(val, Math.cos(dist / 20 * Math.PI / 2));
                    }
                    // PSM: sharp zero at boundaries due to destructive interference
                    for (const b of boundaries) {
                        const dist = Math.abs(dx - b);
                        if (dist < 6) val *= dist / 6;
                    }
                    pts.push(`${cx + dx},${baseline - val * peakH}`);
                }
                return `M ${pts.join(' L ')}`;
            })()}
                fill="none" stroke={active ? 'rgba(192,132,252,0.6)' : 'rgba(192,132,252,0.3)'} strokeWidth={1.5} />
            {/* 상쇄 간섭 표시 */}
            {[-50, 0, 50].map((bx, i) => (
                <g key={i}>
                    <line x1={cx + bx} y1={INTENS_Y} x2={cx + bx} y2={INTENS_Y + INTENS_H}
                        stroke="rgba(34,197,94,0.25)" strokeWidth={0.8} strokeDasharray="2 2" />
                    <text x={cx + bx} y={INTENS_Y + INTENS_H + 14} textAnchor="middle"
                        fill="rgba(34,197,94,0.6)" fontSize={FONT.min}>↑0</text>
                </g>
            ))}
        </g>
    );
}

export default function PSMInterference() {
    const [hovered, setHovered] = useState<SideId>(null);
    const isDimmed = (id: Exclude<SideId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                이진 마스크 vs 위상 반전 마스크 (PSM)
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Binary Mask vs. Phase-Shift Mask — Destructive Interference
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 560)} style={{ maxWidth: '100%' }}>
                    <motion.g onMouseEnter={() => setHovered('binary')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('binary') ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                        <rect x={LEFT_X} y={0} width={PANEL_W} height={SVG_H} fill="transparent" />
                        <BinaryPanel x={LEFT_X} w={PANEL_W} active={hovered === 'binary'} />
                    </motion.g>

                    <motion.g onMouseEnter={() => setHovered('psm')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('psm') ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                        <rect x={RIGHT_X} y={0} width={PANEL_W} height={SVG_H} fill="transparent" />
                        <PSMPanel x={RIGHT_X} w={PANEL_W} active={hovered === 'psm'} />
                    </motion.g>

                    <text x={SVG_W / 2} y={SVG_H / 2 + 4} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={20} fontWeight={700}>vs</text>
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 62 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: SIDES[hovered].color, marginBottom: 2 }}>
                                {SIDES[hovered].label}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {SIDES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 패널을 호버하여 비교하세요. PSM은 빛의 위상을 활용해 같은 파장에서 해상도를 크게 향상시킵니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
