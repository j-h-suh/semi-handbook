'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type RuleId = 'r1' | 'r2' | 'r3' | 'r4' | null;

const RULES: Record<Exclude<RuleId, null>, { title: string; sub: string; desc: string; color: string; data: number[]; highlight: number[] }> = {
    r1: { title: 'Rule 1: 3σ 이탈', sub: 'Critical', desc: '1개 점이 UCL/LCL 벗어남. 가장 확실한 이상 신호.', color: '#ef4444',
          data: [0.2, -0.5, 0.3, 0.8, -0.4, 0.1, 3.5, 0.2, -0.3], highlight: [6] },
    r2: { title: 'Rule 2: 2σ 경고', sub: 'Warning', desc: '연속 3개 중 2개가 같은 쪽 2σ~3σ. 아직 3σ는 넘지 않았지만 확률적으로 매우 드문 사건.', color: '#f59e0b',
          data: [0.1, 0.3, -0.2, 2.3, 0.5, 2.6, 2.4, 0.3, -0.1], highlight: [3, 5, 6] },
    r3: { title: 'Rule 3: 1σ 추세', sub: 'Warning', desc: '연속 5개 중 4개가 같은 쪽 1σ 밖. 평균이 서서히 이동(Drift) 중.', color: '#f97316',
          data: [0.1, 1.2, 0.8, 1.5, 1.3, 1.8, 1.1, 0.3, -0.2], highlight: [1, 3, 4, 5, 6] },
    r4: { title: 'Rule 4: 평균 이동', sub: 'Shift', desc: '연속 8개가 CL 같은 쪽. 확률 (1/2)⁸ = 0.4%. 평균이 이동한 것.', color: '#a855f7',
          data: [0.3, 0.5, 0.8, 0.2, 0.6, 0.4, 0.9, 0.7, 1.1, 0.5], highlight: [0, 1, 2, 3, 4, 5, 6, 7] },
};

const ORDER: Exclude<RuleId, null>[] = ['r1', 'r2', 'r3', 'r4'];
const PANEL_W = 155;
const PANEL_H = 90;
const SVG_W = PANEL_W * 4 + 40;
const SVG_H = PANEL_H + 20;
const CHART_PAD = 12;

function MiniChart({ x, y, data, highlight, color, dimmed }: { x: number; y: number; data: number[]; highlight: number[]; color: string; dimmed: boolean }) {
    const cw = PANEL_W - CHART_PAD * 2;
    const ch = PANEL_H - 34;
    const cx = x + CHART_PAD;
    const cy = y + 28;
    const xStep = cw / (data.length - 1);
    const yScale = ch / 8; // ±4σ range
    const midY = cy + ch / 2;

    return (
        <motion.g animate={{ opacity: dimmed ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
            {/* UCL/LCL lines */}
            <line x1={cx} y1={midY - 3 * yScale} x2={cx + cw} y2={midY - 3 * yScale} stroke="rgba(239,68,68,0.3)" strokeWidth={0.5} strokeDasharray="3 2" />
            <line x1={cx} y1={midY + 3 * yScale} x2={cx + cw} y2={midY + 3 * yScale} stroke="rgba(239,68,68,0.3)" strokeWidth={0.5} strokeDasharray="3 2" />
            {/* CL */}
            <line x1={cx} y1={midY} x2={cx + cw} y2={midY} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
            {/* ±1σ, ±2σ zone hints */}
            <line x1={cx} y1={midY - yScale} x2={cx + cw} y2={midY - yScale} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            <line x1={cx} y1={midY + yScale} x2={cx + cw} y2={midY + yScale} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            <line x1={cx} y1={midY - 2 * yScale} x2={cx + cw} y2={midY - 2 * yScale} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            <line x1={cx} y1={midY + 2 * yScale} x2={cx + cw} y2={midY + 2 * yScale} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            {/* Data line */}
            <polyline fill="none" stroke="rgba(59,130,246,0.4)" strokeWidth={1}
                points={data.map((v, i) => `${cx + i * xStep},${midY - v * yScale}`).join(' ')} />
            {/* Data points */}
            {data.map((v, i) => {
                const isHL = highlight.includes(i);
                return <circle key={i} cx={cx + i * xStep} cy={midY - v * yScale} r={isHL ? 3 : 2}
                    fill={isHL ? color : '#3b82f6'} opacity={isHL ? 1 : 0.5} />;
            })}
        </motion.g>
    );
}

export default function WECORulesPatterns() {
    const [hovered, setHovered] = useState<RuleId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                WECO Rules — SPC 이상 패턴 4종
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                관리 한계 안에서도 체계적 패턴을 감지하여 이상 조기 경보
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 680 }}>
                    {ORDER.map((id, i) => {
                        const x = 10 + i * (PANEL_W + 6);
                        const y = 5;
                        const info = RULES[id];
                        const active = hovered === id;
                        const dimmed = hovered !== null && hovered !== id;
                        return (
                            <g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                                <rect x={x - 2} y={y - 2} width={PANEL_W + 4} height={PANEL_H + 4} fill="transparent" />
                                <rect x={x} y={y} width={PANEL_W} height={PANEL_H} rx={8}
                                    fill={active ? `${info.color}08` : 'rgba(255,255,255,0.02)'}
                                    stroke={active ? `${info.color}30` : 'rgba(255,255,255,0.06)'} strokeWidth={active ? 1.5 : 0.5} />
                                <text x={x + PANEL_W / 2} y={y + 14} textAnchor="middle" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.title}</text>
                                <MiniChart x={x} y={y} data={info.data} highlight={info.highlight} color={info.color} dimmed={dimmed} />
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: RULES[hovered].color, marginBottom: 2 }}>{RULES[hovered].title} — {RULES[hovered].sub}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{RULES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 패턴을 호버하세요. 빨간 점선은 ±3σ 관리 한계, 색칠된 점은 이상 트리거 포인트입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
