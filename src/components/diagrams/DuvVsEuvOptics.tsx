'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 비교 데이터 ─── */
type SideId = 'duv' | 'euv' | null;

interface SideInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
    specs: { key: string; value: string }[];
}

const SIDES: Record<Exclude<SideId, null>, SideInfo> = {
    duv: {
        label: 'DUV (ArF 193nm)', sub: '굴절 광학 — Refractive Optics',
        desc: '석영(SiO₂)과 형석(CaF₂) 렌즈를 통해 빛을 굴절시켜 전달. 공기 또는 물(침수) 속에서 동작 가능. 투과형 마스크 사용.',
        color: '#3b82f6',
        specs: [
            { key: '광원', value: '엑시머 레이저' },
            { key: '매질', value: '공기/물 투과' },
            { key: '렌즈', value: '굴절 렌즈 (투과)' },
            { key: '마스크', value: '투과형' },
            { key: 'NA', value: '1.35 (침수)' },
        ],
    },
    euv: {
        label: 'EUV (13.5nm)', sub: '반사 광학 — Reflective Optics',
        desc: '13.5nm 파장은 모든 물질이 흡수. 진공 필수. Mo/Si 다층 반사 거울로 빛을 반사시켜 전달. 반사형 마스크 사용.',
        color: '#c084fc',
        specs: [
            { key: '광원', value: 'Sn 플라즈마' },
            { key: '매질', value: '진공 필수' },
            { key: '렌즈', value: '반사 거울 (Mo/Si)' },
            { key: '마스크', value: '반사형' },
            { key: 'NA', value: '0.33 → 0.55 (High-NA)' },
        ],
    },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 560;
const SVG_H = 280;
const PANEL_W = 230;
const GAP = 40;
const LEFT_X = (SVG_W - PANEL_W * 2 - GAP) / 2;
const RIGHT_X = LEFT_X + PANEL_W + GAP;
const TOP_Y = 20;
const LENS_Y = 80;
const BEAM_H = 140;

function LensStack({ x, w, isDuv, active }: { x: number; w: number; isDuv: boolean; active: boolean }) {
    const cx = x + w / 2;
    const lensColor = isDuv ? '#3b82f6' : '#c084fc';

    if (isDuv) {
        /* 굴절 렌즈 (세로 타원 3개) */
        return (
            <g>
                {[0, 40, 80].map((dy, i) => (
                    <ellipse key={i} cx={cx} cy={LENS_Y + 30 + dy} rx={30} ry={10}
                        fill={active ? lensColor + '20' : 'rgba(255,255,255,0.03)'}
                        stroke={active ? lensColor : 'rgba(255,255,255,0.15)'} strokeWidth={active ? 1.5 : 0.8} />
                ))}
                {/* 빔 (직선 통과) */}
                <polygon points={`${cx - 20},${TOP_Y + 10} ${cx + 20},${TOP_Y + 10} ${cx + 8},${LENS_Y + BEAM_H} ${cx - 8},${LENS_Y + BEAM_H}`}
                    fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.25)" strokeWidth={0.5} />
                {/* 라벨 */}
                <text x={cx} y={TOP_Y + 6} textAnchor="middle" fill={active ? lensColor : COLOR.textDim} fontSize={FONT.min}>
                    투과형 마스크
                </text>
                <text x={cx} y={LENS_Y + BEAM_H + 16} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>
                    웨이퍼
                </text>
                <text x={cx + 38} y={LENS_Y + 70} fill={COLOR.textDim} fontSize={FONT.min}>굴절 렌즈</text>
                <text x={cx - 70} y={LENS_Y + 50} fill="rgba(59,130,246,0.5)" fontSize={FONT.min} textAnchor="end">공기/물</text>
            </g>
        );
    } else {
        /* 반사 거울 — 거울이 좌우 교대로, 빛이 거울 앞면에서 반사 */
        const mirrors = [
            { y: LENS_Y + 20, side: 'left' as const },
            { y: LENS_Y + 70, side: 'right' as const },
            { y: LENS_Y + 120, side: 'left' as const },
        ];
        const mirrorW = 44;
        const mirrorH = 6;
        const offset = 35;

        return (
            <g>
                {/* 거울 — 좌측 거울은 \방향, 우측 거울은 /방향 (입사=반사각) */}
                {mirrors.map((m, i) => {
                    const mx = m.side === 'left' ? cx - offset : cx + offset;
                    const angle = m.side === 'left' ? 75 : -75;
                    return (
                        <g key={i} transform={`rotate(${angle}, ${mx}, ${m.y})`}>
                            {/* 거울 반사면 (두꺼운 쪽) */}
                            <rect x={mx - mirrorW / 2} y={m.y - mirrorH / 2} width={mirrorW} height={mirrorH} rx={1}
                                fill={active ? lensColor + '40' : 'rgba(255,255,255,0.1)'}
                                stroke={active ? lensColor : 'rgba(255,255,255,0.25)'} strokeWidth={active ? 1.5 : 1} />
                            {/* 뒷면 해칭 (거울 뒤) */}
                            <rect x={mx - mirrorW / 2} y={m.y + mirrorH / 2} width={mirrorW} height={3} rx={0.5}
                                fill="rgba(255,255,255,0.04)" stroke="none" />
                        </g>
                    );
                })}

                {/* 빔 — 거울 앞면에서 반사, 지그재그 */}
                <polyline
                    points={`${cx},${TOP_Y + 10} ${cx - offset + 5},${mirrors[0].y} ${cx + offset - 5},${mirrors[1].y} ${cx - offset + 5},${mirrors[2].y} ${cx},${LENS_Y + BEAM_H}`}
                    fill="none" stroke={active ? 'rgba(192,132,252,0.5)' : 'rgba(192,132,252,0.25)'} strokeWidth={1.5} />

                {/* 라벨 */}
                <text x={cx} y={TOP_Y + 6} textAnchor="middle" fill={active ? lensColor : COLOR.textDim} fontSize={FONT.min}>
                    반사형 마스크
                </text>
                <text x={cx} y={LENS_Y + BEAM_H + 16} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>
                    웨이퍼
                </text>
                <text x={cx + offset + 30} y={mirrors[1].y + 4} fill={COLOR.textDim} fontSize={FONT.min}>Mo/Si 거울</text>
                <text x={cx - offset - 30} y={mirrors[0].y + 16} fill="rgba(192,132,252,0.5)" fontSize={FONT.min} textAnchor="end">진공</text>
                {/* 진공 챔버 표시 */}
                <rect x={cx - offset - 40} y={TOP_Y - 5} width={(offset + 40) * 2} height={BEAM_H + LENS_Y - TOP_Y + 25} rx={8}
                    fill="none" stroke="rgba(192,132,252,0.15)" strokeWidth={1} strokeDasharray="6 4" />
            </g>
        );
    }
}

export default function DuvVsEuvOptics() {
    const [hovered, setHovered] = useState<SideId>(null);
    const isDimmed = (id: Exclude<SideId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                DUV 굴절 광학 vs EUV 반사 광학
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Refractive Optics vs. Reflective Optics
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 560)} style={{ maxWidth: '100%' }}>
                    {/* DUV 패널 */}
                    <motion.g onMouseEnter={() => setHovered('duv')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('duv') ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                        <rect x={LEFT_X} y={0} width={PANEL_W} height={SVG_H} fill="transparent" />
                        <text x={LEFT_X + PANEL_W / 2} y={SVG_H - 16} textAnchor="middle"
                            fill={hovered === 'duv' ? '#3b82f6' : COLOR.textBright} fontSize={FONT.body} fontWeight={700}>
                            DUV (193nm)
                        </text>
                        <text x={LEFT_X + PANEL_W / 2} y={SVG_H - 2} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>
                            굴절 광학
                        </text>
                        <LensStack x={LEFT_X} w={PANEL_W} isDuv={true} active={hovered === 'duv'} />
                    </motion.g>

                    {/* EUV 패널 */}
                    <motion.g onMouseEnter={() => setHovered('euv')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('euv') ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                        <rect x={RIGHT_X} y={0} width={PANEL_W} height={SVG_H} fill="transparent" />
                        <text x={RIGHT_X + PANEL_W / 2} y={SVG_H - 16} textAnchor="middle"
                            fill={hovered === 'euv' ? '#c084fc' : COLOR.textBright} fontSize={FONT.body} fontWeight={700}>
                            EUV (13.5nm)
                        </text>
                        <text x={RIGHT_X + PANEL_W / 2} y={SVG_H - 2} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>
                            반사 광학
                        </text>
                        <LensStack x={RIGHT_X} w={PANEL_W} isDuv={false} active={hovered === 'euv'} />
                    </motion.g>

                    {/* vs 표시 */}
                    <text x={SVG_W / 2} y={SVG_H / 2 + 4} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={20} fontWeight={700}>
                        vs
                    </text>
                </svg>
            </div>

            {/* 하단 툴팁 */}
            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 70 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: SIDES[hovered].color, marginBottom: 2 }}>
                                {SIDES[hovered].label} — {SIDES[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {SIDES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 패널을 호버하여 비교하세요. DUV는 렌즈를 투과하는 굴절 방식, EUV는 거울로 반사하는 반사 방식입니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
