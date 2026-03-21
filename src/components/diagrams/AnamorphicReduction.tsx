'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 호버 데이터 ─── */
type ZoneId = 'current' | 'highna' | 'stitch' | null;

interface ZoneInfo {
    label: string;
    desc: string;
    color: string;
}

const ZONES: Record<Exclude<ZoneId, null>, ZoneInfo> = {
    current: {
        label: 'Current EUV (NA = 0.33)',
        desc: 'ASML NXE 시리즈. 4:1 대칭 축소(x, y 동일). 노광 필드 26×33mm. ~1대당 4억 달러. 해상도 R = k₁ × 41nm (k₁=0.3일 때 ~12nm half-pitch).',
        color: '#3b82f6',
    },
    highna: {
        label: 'High-NA EUV (NA = 0.55)',
        desc: 'ASML EXE:5000. Anamorphic 광학계: x방향 4:1, y방향 8:1 축소. 노광 필드가 26×16.5mm로 절반. 해상도 R = k₁ × 24.5nm (k₁=0.3일 때 ~7.4nm). DOF는 (0.33/0.55)² ≈ 1/3로 감소.',
        color: '#a78bfa',
    },
    stitch: {
        label: 'Stitching (필드 이어붙이기)',
        desc: '큰 다이(GPU, AI 가속기)는 절반 필드에 들어가지 않으므로 두 번 노광하여 이어붙여야 한다. 이음새의 Overlay 정밀도(Stitch Overlay)가 완전히 새로운 기술적 도전이 된다.',
        color: '#f59e0b',
    },
};

/* ─── SVG 레이아웃 상수 ─── */
const SVG_W = 580;
const SVG_H = 310;
const CX = SVG_W / 2;
const GAP = 40;

/* 좌우 패널 위치 */
const PANEL_W = 240;
const PANEL_TOP = 12;

/* 마스크/필드 크기 (비례) */
const MASK_W = 100;
const MASK_H_CURRENT = 130;      // 4:1 대칭 → 그대로
const MASK_H_HIGHNA = 130;

const FIELD_W = MASK_W;           // x축 4:1 동일
const FIELD_H_CURRENT = MASK_H_CURRENT;  // y축 4:1 동일
const FIELD_H_HIGHNA = MASK_H_CURRENT / 2;  // y축 8:1 → 절반

/* 좌측 패널 중심 */
const LEFT_CX = CX - GAP / 2 - PANEL_W / 2;
const RIGHT_CX = CX + GAP / 2 + PANEL_W / 2;

/* 마스크 위치 (상단) */
const MASK_Y = PANEL_TOP + 30;

/* 화살표 */
const ARROW_Y = MASK_Y + MASK_H_CURRENT + 16;
const ARROW_LEN = 30;

/* 필드 위치 (하단) */
const FIELD_Y = ARROW_Y + ARROW_LEN + 10;

/* Stitching 영역 (우측 하단) */
const STITCH_Y = FIELD_Y;

export default function AnamorphicReduction() {
    const [hovered, setHovered] = useState<ZoneId>(null);
    const isDimmed = (id: Exclude<ZoneId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Anamorphic 축소 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Current EUV 4:1 Symmetric vs. High-NA 4:1 × 8:1 Anamorphic
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 580 }}>
                    <defs>
                        <marker id="arrowDown" viewBox="0 0 10 10" refX="5" refY="10" markerWidth={6} markerHeight={6} orient="auto">
                            <path d="M0 0 L5 10 L10 0 z" fill="rgba(255,255,255,0.3)" />
                        </marker>
                    </defs>

                    {/* ─── 좌측: Current EUV ─── */}
                    <motion.g
                        onMouseEnter={() => setHovered('current')}
                        onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('current') ? 0.2 : 1 }}
                        transition={{ duration: 0.15 }}
                        style={{ cursor: 'pointer' }}
                    >
                        {/* 히트 영역 */}
                        <rect x={LEFT_CX - PANEL_W / 2} y={PANEL_TOP} width={PANEL_W} height={SVG_H - PANEL_TOP - 20} fill="transparent" />

                        {/* 패널 제목 */}
                        <text x={LEFT_CX} y={MASK_Y - 8} textAnchor="middle"
                            fill={hovered === 'current' ? ZONES.current.color : COLOR.textMuted}
                            fontSize={FONT.body} fontWeight={700}>
                            Current EUV (NA = 0.33)
                        </text>

                        {/* 마스크 */}
                        <rect x={LEFT_CX - MASK_W / 2} y={MASK_Y} width={MASK_W} height={MASK_H_CURRENT} rx={4}
                            fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" strokeWidth={1} />
                        <text x={LEFT_CX} y={MASK_Y + MASK_H_CURRENT / 2 + 5} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>Mask</text>

                        {/* 축소 화살표 */}
                        <line x1={LEFT_CX} y1={ARROW_Y} x2={LEFT_CX} y2={ARROW_Y + ARROW_LEN}
                            stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} markerEnd="url(#arrowDown)" />
                        <text x={LEFT_CX + 40} y={ARROW_Y + ARROW_LEN / 2 + 4} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>4:1 × 4:1</text>

                        {/* 필드 */}
                        <rect x={LEFT_CX - FIELD_W / 2} y={FIELD_Y} width={FIELD_W} height={FIELD_H_CURRENT} rx={4}
                            fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.4)" strokeWidth={1.5} />
                        <text x={LEFT_CX} y={FIELD_Y + FIELD_H_CURRENT / 2 - 6} textAnchor="middle"
                            fill={COLOR.text} fontSize={FONT.min} fontWeight={600}>26 × 33 mm</text>
                        <text x={LEFT_CX} y={FIELD_Y + FIELD_H_CURRENT / 2 + 10} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>Full Field</text>
                    </motion.g>

                    {/* ─── 우측: High-NA EUV ─── */}
                    <motion.g
                        onMouseEnter={() => setHovered('highna')}
                        onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('highna') ? 0.2 : 1 }}
                        transition={{ duration: 0.15 }}
                        style={{ cursor: 'pointer' }}
                    >
                        {/* 히트 영역 */}
                        <rect x={RIGHT_CX - PANEL_W / 2} y={PANEL_TOP} width={PANEL_W} height={FIELD_Y - PANEL_TOP + FIELD_H_HIGHNA + 6} fill="transparent" />

                        {/* 패널 제목 */}
                        <text x={RIGHT_CX} y={MASK_Y - 8} textAnchor="middle"
                            fill={hovered === 'highna' ? ZONES.highna.color : COLOR.textMuted}
                            fontSize={FONT.body} fontWeight={700}>
                            High-NA EUV (NA = 0.55)
                        </text>

                        {/* 마스크 */}
                        <rect x={RIGHT_CX - MASK_W / 2} y={MASK_Y} width={MASK_W} height={MASK_H_HIGHNA} rx={4}
                            fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.3)" strokeWidth={1} />
                        <text x={RIGHT_CX} y={MASK_Y + MASK_H_HIGHNA / 2 + 5} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>Mask</text>

                        {/* 축소 화살표 */}
                        <line x1={RIGHT_CX} y1={ARROW_Y} x2={RIGHT_CX} y2={ARROW_Y + ARROW_LEN}
                            stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} markerEnd="url(#arrowDown)" />
                        <text x={RIGHT_CX + 44} y={ARROW_Y + ARROW_LEN / 2 + 4} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>4:1 × 8:1</text>

                        {/* 필드 — 절반 높이 */}
                        <rect x={RIGHT_CX - FIELD_W / 2} y={FIELD_Y} width={FIELD_W} height={FIELD_H_HIGHNA} rx={4}
                            fill="rgba(167,139,250,0.12)" stroke="rgba(167,139,250,0.4)" strokeWidth={1.5} />
                        <text x={RIGHT_CX} y={FIELD_Y + FIELD_H_HIGHNA / 2 - 2} textAnchor="middle"
                            fill={COLOR.text} fontSize={FONT.min} fontWeight={600}>26 × 16.5 mm</text>
                        <text x={RIGHT_CX} y={FIELD_Y + FIELD_H_HIGHNA / 2 + 14} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>Half Field</text>
                    </motion.g>

                    {/* ─── Stitching 표시 (우측 하단) ─── */}
                    <motion.g
                        onMouseEnter={() => setHovered('stitch')}
                        onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('stitch') ? 0.2 : 1 }}
                        transition={{ duration: 0.15 }}
                        style={{ cursor: 'pointer' }}
                    >
                        {/* 두 번째 절반 필드 아래 */}
                        <rect x={RIGHT_CX - FIELD_W / 2} y={FIELD_Y + FIELD_H_HIGHNA + 4} width={FIELD_W} height={FIELD_H_HIGHNA} rx={4}
                            fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.3)" strokeWidth={1} strokeDasharray="4 3" />
                        <text x={RIGHT_CX} y={FIELD_Y + FIELD_H_HIGHNA + 4 + FIELD_H_HIGHNA / 2 + 5} textAnchor="middle"
                            fill={COLOR.textDim} fontSize={FONT.min}>2nd Exposure</text>

                        {/* Stitch 라인 */}
                        <line x1={RIGHT_CX - FIELD_W / 2 - 10} y1={FIELD_Y + FIELD_H_HIGHNA + 2}
                            x2={RIGHT_CX + FIELD_W / 2 + 10} y2={FIELD_Y + FIELD_H_HIGHNA + 2}
                            stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" />

                        {/* 히트 영역 */}
                        <rect x={RIGHT_CX - FIELD_W / 2 - 12} y={FIELD_Y + FIELD_H_HIGHNA - 6}
                            width={FIELD_W + 24} height={FIELD_H_HIGHNA + 18} fill="transparent" />

                        {/* Stitch 라벨 */}
                        <text x={RIGHT_CX + FIELD_W / 2 + 18} y={FIELD_Y + FIELD_H_HIGHNA + 6} textAnchor="start"
                            fill="#f59e0b" fontSize={FONT.min} fontWeight={600}>Stitch</text>
                    </motion.g>
                </svg>
            </div>

            {/* 툴팁 */}
            <div style={{ maxWidth: 640, margin: '0 auto', height: 64 }}>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 영역을 호버하여 Current EUV와 High-NA EUV의 차이를 확인하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
