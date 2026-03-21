'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 보정 유형 데이터 ─── */
type CorrId = 'corner' | 'lineend' | 'bias' | null;

interface CorrInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const CORRS: Record<Exclude<CorrId, null>, CorrInfo> = {
    corner: {
        label: '코너 라운딩 → 세리프', sub: 'Corner Rounding → Serif',
        desc: '직각 모서리가 회절로 둥글어지는 것을 방지하기 위해, 마스크의 코너에 작은 사각형 돌기(Serif)를 추가. 에너지를 코너에 집중시켜 직각에 가까운 전사를 달성.',
        color: '#f59e0b',
    },
    lineend: {
        label: '라인엔드 숏트닝 → 해머헤드', sub: 'Line-End Shortening → Hammerhead',
        desc: '선 끝이 세 방향 회절로 짧아지는 것을 보상하기 위해, T자형 확장(Hammerhead)을 추가. 선 끝의 광 강도를 보강하여 설계 길이를 유지.',
        color: '#3b82f6',
    },
    bias: {
        label: 'ISO-Dense Bias → 선폭 조정', sub: 'Width Bias Adjustment',
        desc: '고립 패턴이 밀집 패턴보다 넓게 전사되는 현상. 마스크에서 고립 라인을 미리 좁게(Negative Bias) 만들어, 웨이퍼에서 동일한 CD를 달성.',
        color: '#22c55e',
    },
};

const CORR_ORDER: Exclude<CorrId, null>[] = ['corner', 'lineend', 'bias'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 600;
const SVG_H = 180;
const PANEL_W = 170;
const GAP = 22;
const TOTAL_W = PANEL_W * 3 + GAP * 2;
const START_X = (SVG_W - TOTAL_W) / 2;
const BASE_Y = 44;
const BLOCK_H = 100;

/* ─── 패턴 렌더 ─── */
function CornerSerif({ x }: { x: number }) {
    const cx = x + PANEL_W / 2;
    const w = 50; const h = 70;
    const sx = cx - w / 2; const sy = BASE_Y + (BLOCK_H - h) / 2;
    const s = 8; // serif size
    return (
        <g>
            <text x={x + PANEL_W / 2} y={BASE_Y - 10} textAnchor="middle" fill="#f59e0b" fontSize={FONT.min} fontWeight={700}>Serif</text>
            {/* 원래 패턴 (좌, 점선) */}
            <rect x={sx - 36} y={sy} width={w} height={h} fill="none"
                stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="3 2" />
            <text x={sx - 36 + w / 2} y={sy + h + 14} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>Before</text>
            {/* 보정 패턴 (우) */}
            <rect x={sx + 36} y={sy} width={w} height={h} fill="rgba(245,158,11,0.1)"
                stroke="rgba(245,158,11,0.4)" strokeWidth={1.2} />
            {/* 세리프 4개 */}
            {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([dx, dy], i) => (
                <rect key={i}
                    x={sx + 36 + (dx === 0 ? -s : w)}
                    y={sy + (dy === 0 ? -s : h)}
                    width={s} height={s}
                    fill="rgba(245,158,11,0.3)" stroke="rgba(245,158,11,0.6)" strokeWidth={0.8} />
            ))}
            <text x={sx + 36 + w / 2} y={sy + h + 14} textAnchor="middle" fill="#f59e0b" fontSize={FONT.min} fontWeight={600}>Serif</text>
        </g>
    );
}

function LineEndHammerhead({ x }: { x: number }) {
    const cx = x + PANEL_W / 2;
    const lw = 24; const lh = 70;
    const sx = cx - lw / 2; const sy = BASE_Y + (BLOCK_H - lh) / 2;
    const hw = 12; const hh = 8; // hammerhead extra
    return (
        <g>
            <text x={x + PANEL_W / 2} y={BASE_Y - 10} textAnchor="middle" fill="#3b82f6" fontSize={FONT.min} fontWeight={700}>Hammerhead</text>
            {/* Before */}
            <rect x={sx - 36} y={sy} width={lw} height={lh} fill="none"
                stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="3 2" />
            <text x={sx - 36 + lw / 2} y={sy + lh + 14} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>Before</text>
            {/* After */}
            <rect x={sx + 36} y={sy} width={lw} height={lh} fill="rgba(59,130,246,0.1)"
                stroke="rgba(59,130,246,0.4)" strokeWidth={1.2} />
            {/* 해머헤드 상단 */}
            <rect x={sx + 36 - hw / 2} y={sy - hh} width={lw + hw} height={hh}
                fill="rgba(59,130,246,0.25)" stroke="rgba(59,130,246,0.5)" strokeWidth={0.8} />
            {/* 해머헤드 하단 */}
            <rect x={sx + 36 - hw / 2} y={sy + lh} width={lw + hw} height={hh}
                fill="rgba(59,130,246,0.25)" stroke="rgba(59,130,246,0.5)" strokeWidth={0.8} />
            <text x={sx + 36 + lw / 2} y={sy + lh + 14 + hh} textAnchor="middle" fill="#3b82f6" fontSize={FONT.min} fontWeight={600}>Hammerhead</text>
        </g>
    );
}

function BiasAdjust({ x }: { x: number }) {
    const cx = x + PANEL_W / 2;
    const lw = 30; const lh = 70;
    const narrowW = 22; // biased narrower
    const sy = BASE_Y + (BLOCK_H - lh) / 2;
    return (
        <g>
            <text x={x + PANEL_W / 2} y={BASE_Y - 10} textAnchor="middle" fill="#22c55e" fontSize={FONT.min} fontWeight={700}>Bias</text>
            {/* Isolated (wide, before) */}
            <rect x={cx - 36 - lw / 2} y={sy} width={lw} height={lh} fill="none"
                stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="3 2" />
            <text x={cx - 36} y={sy + lh + 14} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>Before (Iso)</text>
            {/* Biased (narrow, after) */}
            <rect x={cx + 36 - narrowW / 2} y={sy} width={narrowW} height={lh} fill="rgba(34,197,94,0.1)"
                stroke="rgba(34,197,94,0.4)" strokeWidth={1.2} />
            {/* 좁아지는 화살표 — 양쪽에서 안쪽으로 */}
            <defs>
                <marker id="arrowGreen" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="rgba(34,197,94,0.6)" />
                </marker>
            </defs>
            {[-1, 1].map(dir => (
                <line key={dir}
                    x1={cx + 36 + dir * (narrowW / 2 + 14)} y1={sy + lh / 2}
                    x2={cx + 36 + dir * (narrowW / 2 + 2)} y2={sy + lh / 2}
                    stroke="rgba(34,197,94,0.5)" strokeWidth={1.2} markerEnd="url(#arrowGreen)" />
            ))}
            <text x={cx + 36} y={sy + lh + 14} textAnchor="middle" fill="#22c55e" fontSize={FONT.min} fontWeight={600}>Bias ↓</text>
        </g>
    );
}

export default function OPCCorrectionTypes() {
    const [hovered, setHovered] = useState<CorrId>(null);
    const isDimmed = (id: Exclude<CorrId, null>) => hovered !== null && hovered !== id;

    const renders = { corner: CornerSerif, lineend: LineEndHammerhead, bias: BiasAdjust };

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                OPC 보정 유형
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Serif · Hammerhead · Bias — 왜곡의 반대를 마스크에 적용
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 600)} style={{ maxWidth: '100%' }}>
                    {CORR_ORDER.map((id, i) => {
                        const x = START_X + i * (PANEL_W + GAP);
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        const Render = renders[id];
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={x} y={BASE_Y - 10} width={PANEL_W} height={BLOCK_H + 40} fill="transparent" />
                                <Render x={x} />
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto', height: 58 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: CORRS[hovered].color, marginBottom: 2 }}>
                                {CORRS[hovered].label}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {CORRS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 보정 유형을 호버하세요. 점선은 원래 패턴, 실선은 OPC 보정이 적용된 마스크 패턴입니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
