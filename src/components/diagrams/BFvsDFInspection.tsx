'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type ModeId = 'bf' | 'df' | null;

const MODES: Record<Exclude<ModeId, null>, { label: string; desc: string; color: string; result: string }> = {
    bf: { label: 'Bright Field (BF)', desc: '광원 → 빔 스플리터(BS)가 빛을 아래로 반사 → 렌즈 → 웨이퍼. 정반사가 렌즈 → BS 투과 → 검출기로 도달. 결함이 있으면 산란으로 정반사 손실 → 어두운 점. 패턴 결함 탐지에 우수.', color: '#f59e0b', result: '정상: 밝음 / 결함: 어두운 점' },
    df: { label: 'Dark Field (DF)', desc: '비스듬한 입사 → 산란광만 관찰. 정상면은 정반사가 검출기 밖으로 나가 어둡고, 파티클은 빛을 산란시켜 밝은 점으로 빛남. 파티클 탐지에 우수.', color: '#ef4444', result: '정상: 어두움 / 파티클: 밝은 점' },
};

const SVG_W = 640;
const SVG_H = 240;
const PANEL_W = 260;
const BF_CX = SVG_W / 2 - PANEL_W / 2 - 20;
const DF_CX = SVG_W / 2 + PANEL_W / 2 + 20;
const WAFER_Y = 185;
const LENS_Y = 120;
const SRC_Y = 40;

const COLORS = { light: '#f59e0b', scatter: '#ef4444', lens: '#3b82f6', wafer: '#71717a', defect: '#ef4444' };

function BFPanel({ cx, active, dimmed }: { cx: number; active: boolean; dimmed: boolean }) {
    const BS_Y = 70; // beam splitter Y
    return (
        <motion.g animate={{ opacity: dimmed ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
            {/* Panel border */}
            <rect x={cx - PANEL_W / 2} y={20} width={PANEL_W} height={SVG_H - 40} rx={12}
                fill={active ? 'rgba(245,158,11,0.04)' : 'transparent'}
                stroke={active ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)'} strokeWidth={active ? 1 : 0.5} />

            <text x={cx} y={36} textAnchor="middle" fill={active ? COLORS.light : COLOR.textMuted} fontSize={FONT.body} fontWeight={700}>Bright Field</text>

            {/* Light source (left) */}
            <circle cx={cx - 65} cy={BS_Y} r={8} fill={COLORS.light} opacity={0.6} />
            <text x={cx - 65} y={BS_Y - 14} textAnchor="middle" fill={COLOR.textDim} fontSize={10}>광원</text>

            {/* Beam: source → beam splitter */}
            <line x1={cx - 55} y1={BS_Y} x2={cx - 8} y2={BS_Y} stroke={COLORS.light} strokeWidth={2} opacity={0.4} />

            {/* Beam splitter (45° square) */}
            <rect x={cx - 8} y={BS_Y - 8} width={16} height={16} rx={2} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth={0.8} transform={`rotate(45 ${cx} ${BS_Y})`} />
            <text x={cx + 18} y={BS_Y - 6} fill={COLOR.textDim} fontSize={9}>BS</text>

            {/* Beam: splitter → down through lens → wafer */}
            <line x1={cx} y1={BS_Y + 10} x2={cx} y2={LENS_Y - 12} stroke={COLORS.light} strokeWidth={2} opacity={0.35} />

            {/* Lens */}
            <ellipse cx={cx} cy={LENS_Y} rx={40} ry={8} fill={COLORS.lens} opacity={0.25} stroke={COLORS.lens} strokeWidth={0.5} />
            <text x={cx + 46} y={LENS_Y + 4} fill={COLOR.textDim} fontSize={10}>대물렌즈</text>

            {/* Beam to wafer */}
            <line x1={cx} y1={LENS_Y + 10} x2={cx} y2={WAFER_Y - 6} stroke={COLORS.light} strokeWidth={2} opacity={0.3} />

            {/* Wafer */}
            <line x1={cx - 80} y1={WAFER_Y} x2={cx + 80} y2={WAFER_Y} stroke={COLORS.wafer} strokeWidth={4} />
            <text x={cx - 80} y={WAFER_Y + 16} fill={COLOR.textDim} fontSize={10}>웨이퍼</text>

            {/* Defect (on beam path) */}
            <circle cx={cx} cy={WAFER_Y - 5} r={5} fill={COLORS.defect} opacity={0.8} />
            <text x={cx - 12} y={WAFER_Y - 2} fill={COLORS.defect} fontSize={10} textAnchor="end">결함</text>

            {/* Reflected beam: wafer → lens → splitter (goes through) → detector */}
            <line x1={cx + 3} y1={WAFER_Y - 6} x2={cx + 3} y2={LENS_Y + 10} stroke={COLORS.light} strokeWidth={1.5} opacity={0.2} strokeDasharray="4 3" />
            <line x1={cx + 3} y1={LENS_Y - 10} x2={cx + 3} y2={BS_Y + 10} stroke={COLORS.light} strokeWidth={1.5} opacity={0.15} strokeDasharray="4 3" />
            {/* Beam splitter transmits reflected light → right to detector */}
            <line x1={cx + 10} y1={BS_Y} x2={cx + 55} y2={BS_Y} stroke={COLORS.light} strokeWidth={1.5} opacity={0.15} strokeDasharray="4 3" />

            {/* Detector (right) */}
            <rect x={cx + 55} y={BS_Y - 8} width={26} height={16} rx={4} fill="rgba(34,197,94,0.25)" stroke="rgba(34,197,94,0.4)" strokeWidth={0.5} />
            <text x={cx + 68} y={BS_Y + 18} textAnchor="middle" fill={COLOR.textDim} fontSize={10}>검출기</text>

            {/* Result */}
            <text x={cx} y={WAFER_Y + 30} textAnchor="middle" fill={COLOR.textMuted} fontSize={FONT.min}>정상: 밝음 / 결함: 어두운 점</text>
        </motion.g>
    );
}

function DFPanel({ cx, active, dimmed }: { cx: number; active: boolean; dimmed: boolean }) {
    return (
        <motion.g animate={{ opacity: dimmed ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
            {/* Panel border */}
            <rect x={cx - PANEL_W / 2} y={20} width={PANEL_W} height={SVG_H - 40} rx={12}
                fill={active ? 'rgba(239,68,68,0.04)' : 'transparent'}
                stroke={active ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)'} strokeWidth={active ? 1 : 0.5} />

            <text x={cx} y={36} textAnchor="middle" fill={active ? COLORS.light : COLOR.textMuted} fontSize={FONT.body} fontWeight={700}>Dark Field</text>

            {/* Light source (angled) */}
            <circle cx={cx - 70} cy={SRC_Y + 24} r={8} fill={COLORS.light} opacity={0.6} />
            <text x={cx - 70 + 14} y={SRC_Y + 28} fill={COLOR.textDim} fontSize={10}>광원</text>

            {/* Oblique beam */}
            <line x1={cx - 64} y1={SRC_Y + 34} x2={cx} y2={WAFER_Y - 6} stroke={COLORS.light} strokeWidth={2} opacity={0.3} />

            {/* Lens */}
            <ellipse cx={cx} cy={LENS_Y} rx={40} ry={8} fill={COLORS.lens} opacity={0.25} stroke={COLORS.lens} strokeWidth={0.5} />
            <text x={cx + 46} y={LENS_Y + 4} fill={COLOR.textDim} fontSize={10}>대물렌즈</text>

            {/* Detector */}
            <rect x={cx - 12} y={SRC_Y + 8} width={24} height={14} rx={4} fill="rgba(34,197,94,0.25)" stroke="rgba(34,197,94,0.4)" strokeWidth={0.5} />
            <text x={cx + 18} y={SRC_Y + 20} fill={COLOR.textDim} fontSize={10}>검출기</text>

            {/* Wafer */}
            <line x1={cx - 80} y1={WAFER_Y} x2={cx + 80} y2={WAFER_Y} stroke={COLORS.wafer} strokeWidth={4} />

            {/* Defect */}
            <circle cx={cx} cy={WAFER_Y - 5} r={5} fill={COLORS.defect} opacity={0.8} />
            <text x={cx + 10} y={WAFER_Y - 2} fill={COLORS.defect} fontSize={10}>결함</text>

            {/* Scatter light to detector */}
            <line x1={cx} y1={WAFER_Y - 10} x2={cx} y2={LENS_Y + 10} stroke={COLORS.light} strokeWidth={1.5} opacity={0.4} strokeDasharray="4 3" />
            <text x={cx + 10} y={(LENS_Y + SRC_Y) / 2 + 10} fill={COLOR.textDim} fontSize={10}>산란광</text>
            <line x1={cx} y1={LENS_Y - 10} x2={cx} y2={SRC_Y + 24} stroke={COLORS.light} strokeWidth={1.5} opacity={0.3} strokeDasharray="4 3" />

            {/* Specular goes away */}
            <line x1={cx} y1={WAFER_Y - 6} x2={cx + 64} y2={SRC_Y + 34} stroke={COLORS.light} strokeWidth={1} opacity={0.12} />
            <text x={cx + 56} y={SRC_Y + 46} fill={COLOR.textDim} fontSize={9} opacity={0.4}>정반사↗</text>

            {/* Result */}
            <text x={cx} y={WAFER_Y + 30} textAnchor="middle" fill={COLOR.textMuted} fontSize={FONT.min}>정상: 어두움 / 파티클: 밝은 점</text>
        </motion.g>
    );
}

export default function BFvsDFInspection() {
    const [hovered, setHovered] = useState<ModeId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Bright Field vs Dark Field 검사 원리
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                BF: 정반사 관찰 (패턴 결함) · DF: 산란광 관찰 (파티클 탐지)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 640 }}>
                    {/* Divider */}
                    <line x1={SVG_W / 2} y1={24} x2={SVG_W / 2} y2={SVG_H - 24} stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="4 3" />

                    <g onMouseEnter={() => setHovered('bf')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                        <rect x={BF_CX - PANEL_W / 2 - 8} y={16} width={PANEL_W + 16} height={SVG_H - 32} fill="transparent" />
                        <BFPanel cx={BF_CX} active={hovered === 'bf'} dimmed={hovered !== null && hovered !== 'bf'} />
                    </g>
                    <g onMouseEnter={() => setHovered('df')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                        <rect x={DF_CX - PANEL_W / 2 - 8} y={16} width={PANEL_W + 16} height={SVG_H - 32} fill="transparent" />
                        <DFPanel cx={DF_CX} active={hovered === 'df'} dimmed={hovered !== null && hovered !== 'df'} />
                    </g>
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: MODES[hovered].color, marginBottom: 2 }}>{MODES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{MODES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>BF 또는 DF 패널을 호버하세요. BF는 패턴 결함, DF는 파티클 탐지에 우수합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
