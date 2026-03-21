'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type ZoneId = 'cl' | 'ucl' | 'lcl' | 'usl' | 'lsl' | 'margin' | null;

const ZONES: Record<Exclude<ZoneId, null>, { label: string; desc: string; color: string }> = {
    cl:  { label: 'CL (중심선)', desc: '공정 평균(μ). 정상 상태에서 측정값이 이 선 주변에 모여야 함.', color: '#3b82f6' },
    ucl: { label: 'UCL (상한 관리 한계)', desc: 'μ + 3σ. 공정 데이터에서 산출. 이 위로 나가면 공정 이상 의심 → 조사 필요.', color: '#ef4444' },
    lcl: { label: 'LCL (하한 관리 한계)', desc: 'μ - 3σ. 99.73% 데이터가 UCL~LCL 안에 포함. 벗어나면 0.27% 확률 사건.', color: '#ef4444' },
    usl: { label: 'USL (규격 상한)', desc: '설계/고객이 정하는 값. 이 위로 나가면 제품 불량 → 폐기/재작업.', color: '#a855f7' },
    lsl: { label: 'LSL (규격 하한)', desc: '설계/고객이 정하는 값. 이 아래로 나가면 제품 불량.', color: '#a855f7' },
    margin: { label: '마진 (여유)', desc: '관리 한계와 규격 한계 사이 여유. 이 마진이 클수록 공정이 안정적. Cp/Cpk로 정량화.', color: '#22c55e' },
};

const SVG_W = 600;
const SVG_H = 220;
const CHART_L = 80;
const CHART_R = SVG_W - 40;
const CHART_W = CHART_R - CHART_L;
const CY = 110;
const UCL_Y = 60;
const LCL_Y = 160;
const USL_Y = 38;
const LSL_Y = 182;

/* Normal distribution curve points */
function gaussCurve(cx: number, cy: number, sigma: number, amplitude: number, n: number) {
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
        const t = (i / n) * 6 - 3; // -3σ to +3σ
        const y = cy - amplitude * Math.exp(-0.5 * t * t);
        const x = cx + (t / 3) * (CHART_W * 0.35);
        pts.push(`${x},${y}`);
    }
    return pts.join(' ');
}

const CURVE_CX = CHART_L + CHART_W * 0.5;
const CURVE_POINTS = gaussCurve(CURVE_CX, CY, 1, 40, 60);

export default function ControlVsSpecLimits() {
    const [hovered, setHovered] = useState<ZoneId>(null);
    const isDim = (id: ZoneId) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                관리 한계 vs 규격 한계
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Control Limit(공정 기반) ≠ Spec Limit(설계 기반) — 혼동 금지
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {/* Zone fills */}
                    {/* Normal zone: UCL ~ LCL */}
                    <rect x={CHART_L} y={UCL_Y} width={CHART_W} height={LCL_Y - UCL_Y} fill="#3b82f6" opacity={0.06} />
                    {/* Margin zones */}
                    <rect x={CHART_L} y={USL_Y} width={CHART_W} height={UCL_Y - USL_Y} fill="#22c55e" opacity={0.06} />
                    <rect x={CHART_L} y={LCL_Y} width={CHART_W} height={LSL_Y - LCL_Y} fill="#22c55e" opacity={0.06} />

                    {/* Zone labels */}
                    <text x={CHART_L + CHART_W / 2} y={CY} textAnchor="middle" fill="#3b82f6" fontSize={FONT.min} opacity={0.4}>정상 영역 (99.73%)</text>
                    <text x={CHART_L + CHART_W / 2} y={(USL_Y + UCL_Y) / 2 + 4} textAnchor="middle" fill="#22c55e" fontSize={10} opacity={0.4}>마진</text>
                    <text x={CHART_L + CHART_W / 2} y={(LCL_Y + LSL_Y) / 2 + 4} textAnchor="middle" fill="#22c55e" fontSize={10} opacity={0.4}>마진</text>

                    {/* CL */}
                    <motion.g onMouseEnter={() => setHovered('cl')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}
                        animate={{ opacity: isDim('cl') ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
                        <rect x={CHART_L} y={CY - 6} width={CHART_W} height={12} fill="transparent" />
                        <line x1={CHART_L} y1={CY} x2={CHART_R} y2={CY} stroke="#3b82f6" strokeWidth={2} />
                        <text x={CHART_L - 8} y={CY + 4} textAnchor="end" fill="#3b82f6" fontSize={FONT.min} fontWeight={600}>CL (μ)</text>
                    </motion.g>

                    {/* UCL */}
                    <motion.g onMouseEnter={() => setHovered('ucl')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}
                        animate={{ opacity: isDim('ucl') ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
                        <rect x={CHART_L} y={UCL_Y - 6} width={CHART_W} height={12} fill="transparent" />
                        <line x1={CHART_L} y1={UCL_Y} x2={CHART_R} y2={UCL_Y} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6 3" />
                        <text x={CHART_L - 8} y={UCL_Y + 4} textAnchor="end" fill="#ef4444" fontSize={FONT.min}>UCL</text>
                    </motion.g>

                    {/* LCL */}
                    <motion.g onMouseEnter={() => setHovered('lcl')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}
                        animate={{ opacity: isDim('lcl') ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
                        <rect x={CHART_L} y={LCL_Y - 6} width={CHART_W} height={12} fill="transparent" />
                        <line x1={CHART_L} y1={LCL_Y} x2={CHART_R} y2={LCL_Y} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6 3" />
                        <text x={CHART_L - 8} y={LCL_Y + 4} textAnchor="end" fill="#ef4444" fontSize={FONT.min}>LCL</text>
                    </motion.g>

                    {/* USL */}
                    <motion.g onMouseEnter={() => setHovered('usl')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}
                        animate={{ opacity: isDim('usl') ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
                        <rect x={CHART_L} y={USL_Y - 6} width={CHART_W} height={12} fill="transparent" />
                        <line x1={CHART_L} y1={USL_Y} x2={CHART_R} y2={USL_Y} stroke="#a855f7" strokeWidth={2} />
                        <text x={CHART_L - 8} y={USL_Y + 4} textAnchor="end" fill="#a855f7" fontSize={FONT.min}>USL</text>
                    </motion.g>

                    {/* LSL */}
                    <motion.g onMouseEnter={() => setHovered('lsl')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}
                        animate={{ opacity: isDim('lsl') ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
                        <rect x={CHART_L} y={LSL_Y - 6} width={CHART_W} height={12} fill="transparent" />
                        <line x1={CHART_L} y1={LSL_Y} x2={CHART_R} y2={LSL_Y} stroke="#a855f7" strokeWidth={2} />
                        <text x={CHART_L - 8} y={LSL_Y + 4} textAnchor="end" fill="#a855f7" fontSize={FONT.min}>LSL</text>
                    </motion.g>

                    {/* Margin arrows */}
                    <motion.g onMouseEnter={() => setHovered('margin')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}
                        animate={{ opacity: isDim('margin') ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
                        <rect x={CHART_R + 4} y={USL_Y} width={30} height={UCL_Y - USL_Y} fill="transparent" />
                        <line x1={CHART_R + 16} y1={USL_Y + 2} x2={CHART_R + 16} y2={UCL_Y - 2} stroke="#22c55e" strokeWidth={1.5} />
                        <text x={CHART_R + 20} y={(USL_Y + UCL_Y) / 2 + 4} fill="#22c55e" fontSize={10}>마진</text>
                        <rect x={CHART_R + 4} y={LCL_Y} width={30} height={LSL_Y - LCL_Y} fill="transparent" />
                        <line x1={CHART_R + 16} y1={LCL_Y + 2} x2={CHART_R + 16} y2={LSL_Y - 2} stroke="#22c55e" strokeWidth={1.5} />
                        <text x={CHART_R + 20} y={(LCL_Y + LSL_Y) / 2 + 4} fill="#22c55e" fontSize={10}>마진</text>
                    </motion.g>

                    {/* Labels */}
                    <text x={CHART_R - 60} y={USL_Y - 6} fill="#a855f7" fontSize={FONT.min} opacity={0.6}>규격 한계</text>
                    <text x={CHART_R - 60} y={UCL_Y - 6} fill="#ef4444" fontSize={FONT.min} opacity={0.6}>관리 한계</text>
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: ZONES[hovered].color, marginBottom: 2 }}>{ZONES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{ZONES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 선을 호버하세요. 관리 한계(공정 데이터 산출)와 규격 한계(설계 요구)의 차이를 이해하는 것이 SPC의 핵심입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
