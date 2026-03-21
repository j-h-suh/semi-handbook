'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 패널 데이터 ─── */
type PanelId = 'design' | 'opc' | 'wafer' | null;

interface PanelInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const PANELS: Record<Exclude<PanelId, null>, PanelInfo> = {
    design: {
        label: '설계 의도', sub: 'Design Intent',
        desc: '직각 모서리, 일정한 선폭의 깔끔한 직사각형 패턴. 설계자가 원하는 이상적 형태. 하지만 빛의 회절 때문에 이 패턴이 그대로 웨이퍼에 전사되지 않는다.',
        color: '#3b82f6',
    },
    opc: {
        label: 'OPC 보정 마스크', sub: 'OPC-Corrected Mask',
        desc: '세리프(Serif), 해머헤드(Hammerhead), 선폭 바이어스가 적용된 마스크. 의도적으로 왜곡하여, 광학 왜곡과 상쇄되도록 한다. 인간이 보기에 비직관적이지만 광학적으로 최적화된 형태.',
        color: '#f59e0b',
    },
    wafer: {
        label: '웨이퍼 결과', sub: 'Wafer Result',
        desc: 'OPC 보정 덕분에 설계 의도에 가깝게 전사된 패턴. 모서리가 약간 둥글지만, OPC 없이 찍혔을 때보다 훨씬 정확. OPC의 핵심 가치가 여기서 드러난다.',
        color: '#22c55e',
    },
};

const PANEL_ORDER: Exclude<PanelId, null>[] = ['design', 'opc', 'wafer'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 600;
const SVG_H = 200;
const PANEL_W = 160;
const GAP = 30;
const TOTAL_W = PANEL_W * 3 + GAP * 2;
const START_X = (SVG_W - TOTAL_W) / 2;
const PAT_Y = 30;
const PAT_H = 140;

/* ─── 패턴 렌더 ─── */
function DesignPattern({ x }: { x: number }) {
    // 깔끔한 직사각형 라인-스페이스
    const lines = [0, 1, 2];
    const lineW = 20;
    const lineGap = 28;
    const startX = x + (PANEL_W - (lines.length * lineW + (lines.length - 1) * (lineGap - lineW))) / 2;
    return (
        <g>
            {lines.map(i => (
                <rect key={i} x={startX + i * lineGap} y={PAT_Y + 20} width={lineW} height={PAT_H - 40}
                    fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.5)" strokeWidth={1.2} rx={0} />
            ))}
        </g>
    );
}

function OPCPattern({ x }: { x: number }) {
    // 세리프 + 해머헤드가 적용된 마스크 패턴
    const cx = x + PANEL_W / 2;
    const lines = [0, 1, 2];
    const lineW = 20;
    const lineGap = 28;
    const startX = x + (PANEL_W - (lines.length * lineW + (lines.length - 1) * (lineGap - lineW))) / 2;
    const serifW = 6;
    const serifH = 6;
    return (
        <g>
            {lines.map(i => {
                const lx = startX + i * lineGap;
                const ly = PAT_Y + 20;
                const lh = PAT_H - 40;
                return (
                    <g key={i}>
                        {/* 메인 라인 */}
                        <rect x={lx} y={ly} width={lineW} height={lh}
                            fill="rgba(245,158,11,0.2)" stroke="rgba(245,158,11,0.5)" strokeWidth={1.2} />
                        {/* 세리프 (4코너) */}
                        <rect x={lx - serifW} y={ly - serifH} width={serifW} height={serifH}
                            fill="rgba(245,158,11,0.3)" stroke="rgba(245,158,11,0.4)" strokeWidth={0.8} />
                        <rect x={lx + lineW} y={ly - serifH} width={serifW} height={serifH}
                            fill="rgba(245,158,11,0.3)" stroke="rgba(245,158,11,0.4)" strokeWidth={0.8} />
                        <rect x={lx - serifW} y={ly + lh} width={serifW} height={serifH}
                            fill="rgba(245,158,11,0.3)" stroke="rgba(245,158,11,0.4)" strokeWidth={0.8} />
                        <rect x={lx + lineW} y={ly + lh} width={serifW} height={serifH}
                            fill="rgba(245,158,11,0.3)" stroke="rgba(245,158,11,0.4)" strokeWidth={0.8} />
                        {/* 해머헤드 (상하) */}
                        <rect x={lx - 3} y={ly - serifH - 4} width={lineW + 6} height={4}
                            fill="rgba(245,158,11,0.25)" stroke="rgba(245,158,11,0.35)" strokeWidth={0.6} />
                        <rect x={lx - 3} y={ly + lh + serifH} width={lineW + 6} height={4}
                            fill="rgba(245,158,11,0.25)" stroke="rgba(245,158,11,0.35)" strokeWidth={0.6} />
                    </g>
                );
            })}
        </g>
    );
}

function WaferPattern({ x }: { x: number }) {
    // 약간 둥근 모서리의 결과 패턴 — 설계 의도에 가까움
    const lines = [0, 1, 2];
    const lineW = 20;
    const lineGap = 28;
    const startX = x + (PANEL_W - (lines.length * lineW + (lines.length - 1) * (lineGap - lineW))) / 2;
    return (
        <g>
            {lines.map(i => (
                <rect key={i} x={startX + i * lineGap} y={PAT_Y + 20} width={lineW} height={PAT_H - 40}
                    fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" strokeWidth={1.2} rx={3} />
            ))}
        </g>
    );
}

const PATTERN_RENDER: Record<Exclude<PanelId, null>, (x: number) => React.ReactElement> = {
    design: (x) => <DesignPattern x={x} />,
    opc: (x) => <OPCPattern x={x} />,
    wafer: (x) => <WaferPattern x={x} />,
};

export default function OPCBeforeAfter() {
    const [hovered, setHovered] = useState<PanelId>(null);
    const isDimmed = (id: Exclude<PanelId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                OPC 보정 전/후 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Design Intent → OPC Mask → Wafer Result
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 600)} style={{ maxWidth: '100%' }}>
                    {PANEL_ORDER.map((id, i) => {
                        const x = START_X + i * (PANEL_W + GAP);
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        const info = PANELS[id];

                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                {/* 히트 영역 */}
                                <rect x={x} y={PAT_Y - 10} width={PANEL_W} height={PAT_H + 20} fill="transparent" />
                                {/* 패널 배경 */}
                                <rect x={x} y={PAT_Y} width={PANEL_W} height={PAT_H} rx={6}
                                    fill={active ? `${info.color}10` : 'rgba(255,255,255,0.02)'}
                                    stroke={active ? `${info.color}40` : 'rgba(255,255,255,0.06)'}
                                    strokeWidth={1} />
                                {/* 패턴 */}
                                {PATTERN_RENDER[id](x)}
                                {/* 라벨 */}
                                <text x={x + PANEL_W / 2} y={PAT_Y + PAT_H + 18} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>
                                    {info.label}
                                </text>
                            </motion.g>
                        );
                    })}

                    {/* 화살표 */}
                    {[0, 1].map(i => {
                        const x1 = START_X + (i + 1) * PANEL_W + i * GAP + GAP * 0.15;
                        const x2 = START_X + (i + 1) * (PANEL_W + GAP) - GAP * 0.15;
                        const y = PAT_Y + PAT_H / 2;
                        return (
                            <g key={i}>
                                <line x1={x1} y1={y} x2={x2 - 6} y2={y}
                                    stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
                                <polygon points={`${x2},${y} ${x2 - 6},${y - 4} ${x2 - 6},${y + 4}`}
                                    fill="rgba(255,255,255,0.2)" />
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 58 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: PANELS[hovered].color, marginBottom: 2 }}>
                                {PANELS[hovered].label} — {PANELS[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {PANELS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 패널을 호버하세요. 설계 패턴이 OPC 보정을 거쳐 웨이퍼에 정확하게 전사되는 과정을 보여줍니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
