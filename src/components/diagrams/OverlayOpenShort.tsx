'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 케이스 데이터 ─── */
type CaseId = 'good' | 'minor' | 'open' | 'short' | null;

interface CaseInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
    status: string;
}

const CASES: Record<Exclude<CaseId, null>, CaseInfo> = {
    good: {
        label: '① 완벽 정렬', sub: 'Perfect Alignment',
        desc: 'Via가 하부 Metal의 정중앙에 정확히 배치. 접촉 면적 최대, 접촉 저항 최소. 이것이 이상적 상태.',
        color: '#22c55e', status: 'good',
    },
    minor: {
        label: '② 미세 오차 (~1nm)', sub: 'Minor Shift',
        desc: 'Via가 약간 벗어남. 접촉 면적 감소로 저항 증가. 성능 저하는 있지만 기능은 유지. Overlay 규격 경계선.',
        color: '#f59e0b', status: 'warning',
    },
    open: {
        label: '③ 단선 (Open)', sub: 'Open Failure',
        desc: 'Via가 하부 Metal에서 크게 벗어나 전기적 연결 끊김. 회로가 동작하지 않는 치명적 불량.',
        color: '#ef4444', status: 'fail',
    },
    short: {
        label: '④ 단락 (Short)', sub: 'Short Failure',
        desc: 'Via가 인접 배선과 접촉하여 의도하지 않은 전류 경로 형성. 논리 오류 유발. 역시 치명적 불량.',
        color: '#ef4444', status: 'fail',
    },
};

const CASE_ORDER: Exclude<CaseId, null>[] = ['good', 'minor', 'open', 'short'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 720;
const SVG_H = 280;
const PANEL_W = 150;
const GAP = 20;
const TOTAL_W = PANEL_W * 4 + GAP * 3;
const START_X = (SVG_W - TOTAL_W) / 2;

/* 단면도 요소 */
const METAL_H = 30;
const DIELECTRIC_H = 66;
const VIA_W = 26;
const VIA_H = DIELECTRIC_H;
const BASE_Y = 55;
const METAL_W = 60;

function CrossSection({ x, caseId }: { x: number; caseId: Exclude<CaseId, null> }) {
    const cx = x + PANEL_W / 2;
    // 하부 Metal
    const metalY = BASE_Y + METAL_H + DIELECTRIC_H;
    // Via offset
    const viaOffset = caseId === 'good' ? 0 : caseId === 'minor' ? 8 : caseId === 'open' ? 42 : -26;
    const metalColor = 'rgba(245,200,50,0.3)';
    const metalStroke = 'rgba(245,200,50,0.5)';
    const viaColor = 'rgba(255,140,0,0.4)';
    const viaStroke = 'rgba(255,140,0,0.6)';
    const dielColor = 'rgba(65,105,225,0.15)';
    const dielStroke = 'rgba(65,105,225,0.25)';

    return (
        <g>
            {/* 상부 Metal (current layer) */}
            <rect x={cx - METAL_W / 2} y={BASE_Y} width={METAL_W} height={METAL_H}
                fill={metalColor} stroke={metalStroke} strokeWidth={1} rx={2} />
            <text x={cx} y={BASE_Y + METAL_H / 2 + 3} textAnchor="middle" fill="rgba(245,200,50,0.7)" fontSize={FONT.min - 2}>M(N+1)</text>
            {/* 절연막 */}
            <rect x={cx - METAL_W / 2 - 10} y={BASE_Y + METAL_H} width={METAL_W + 20} height={DIELECTRIC_H}
                fill={dielColor} stroke={dielStroke} strokeWidth={0.8} />
            {/* Via */}
            <rect x={cx - VIA_W / 2 + viaOffset} y={BASE_Y + METAL_H} width={VIA_W} height={VIA_H}
                fill={viaColor} stroke={viaStroke} strokeWidth={1} rx={1} />
            <text x={cx + viaOffset} y={BASE_Y + METAL_H + VIA_H / 2 + 3} textAnchor="middle"
                fill="rgba(255,140,0,0.8)" fontSize={FONT.min - 2} fontWeight={600}>Via</text>
            {/* 하부 Metal (reference layer) */}
            <rect x={cx - METAL_W / 2} y={metalY} width={METAL_W} height={METAL_H}
                fill={metalColor} stroke={metalStroke} strokeWidth={1} rx={2} />
            <text x={cx} y={metalY + METAL_H / 2 + 3} textAnchor="middle" fill="rgba(245,200,50,0.7)" fontSize={FONT.min - 2}>M(N)</text>
            {/* 인접 배선 (short 케이스) */}
            {caseId === 'short' && (
                <g>
                    <rect x={cx - METAL_W / 2 - 32} y={metalY} width={28} height={METAL_H}
                        fill="rgba(245,200,50,0.25)" stroke="rgba(239,68,68,0.5)" strokeWidth={1} rx={2} />
                    <text x={cx - METAL_W / 2 - 18} y={metalY + METAL_H / 2 + 3} textAnchor="middle"
                        fill="#ef4444" fontSize={FONT.min - 2} fontWeight={700}>인접</text>
                </g>
            )}
            {/* 상태 표시 */}
            <circle cx={cx} cy={metalY + METAL_H + 16} r={4}
                fill={CASES[caseId].color} opacity={0.6} />
        </g>
    );
}

export default function OverlayOpenShort() {
    const [hovered, setHovered] = useState<CaseId>(null);
    const isDimmed = (id: Exclude<CaseId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Overlay 오차에 의한 단선/단락
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Via-Metal 정렬 오차가 수율에 미치는 영향
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 720 }}>
                    {CASE_ORDER.map((id, i) => {
                        const x = START_X + i * (PANEL_W + GAP);
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        const info = CASES[id];
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={x} y={BASE_Y - 10} width={PANEL_W} height={190} fill="transparent" />
                                <rect x={x} y={BASE_Y - 6} width={PANEL_W} height={185} rx={6}
                                    fill={active ? `${info.color}08` : 'transparent'}
                                    stroke={active ? `${info.color}30` : 'rgba(255,255,255,0.04)'}
                                    strokeWidth={0.8} />
                                <CrossSection x={x} caseId={id} />
                                <text x={x + PANEL_W / 2} y={BASE_Y + METAL_H + DIELECTRIC_H + METAL_H + 36}
                                    textAnchor="middle" fill={active ? info.color : COLOR.textMuted}
                                    fontSize={FONT.min} fontWeight={600}>
                                    {info.label}
                                </text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: CASES[hovered].color, marginBottom: 2 }}>
                                {CASES[hovered].label} — {CASES[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {CASES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 케이스를 호버하세요. Via의 위치가 하부 Metal에서 벗어날수록 불량 위험이 증가합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
