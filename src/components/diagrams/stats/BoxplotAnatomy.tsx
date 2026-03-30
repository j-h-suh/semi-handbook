'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

type PartId = 'min' | 'q1' | 'median' | 'q3' | 'max' | 'iqr' | 'whisker' | 'outlier' | null;

const PARTS: Record<Exclude<PartId, null>, { label: string; desc: string; color: string }> = {
    min: { label: '최솟값 (하한 fence)', desc: 'Q1 − 1.5×IQR 이상인 값 중 가장 작은 값. 이보다 작으면 아웃라이어.', color: STATS_COLOR.series[1] },
    q1: { label: 'Q1 (25번째 백분위수)', desc: '하위 25% 지점. 박스의 아래쪽 경계.', color: STATS_COLOR.series[0] },
    median: { label: '중앙값 (Q2)', desc: '데이터의 정확히 가운데. 박스 안의 굵은 선.', color: STATS_COLOR.series[3] },
    q3: { label: 'Q3 (75번째 백분위수)', desc: '상위 25% 지점. 박스의 위쪽 경계.', color: STATS_COLOR.series[0] },
    max: { label: '최댓값 (상한 fence)', desc: 'Q3 + 1.5×IQR 이하인 값 중 가장 큰 값. 이보다 크면 아웃라이어.', color: STATS_COLOR.series[1] },
    iqr: { label: 'IQR (사분위 범위)', desc: 'Q3 − Q1. 데이터 중간 50%의 퍼짐. 박스의 높이가 IQR이다.', color: STATS_COLOR.series[4] },
    whisker: { label: '수염 (Whisker)', desc: '박스에서 fence까지의 선분. 데이터의 범위를 표현한다.', color: COLOR.textMuted },
    outlier: { label: '아웃라이어', desc: 'fence 바깥의 값. 개별 점으로 표시된다. Q1−1.5×IQR 미만 또는 Q3+1.5×IQR 초과.', color: STATS_COLOR.series[2] },
};

// Layout constants (SVG coordinates)
const SVG_W = 600, SVG_H = 320;
const X_LEFT = 100, X_RIGHT = 500; // data axis
const CY = 140; // center Y of boxplot
const BOX_H = 80; // box height

// Data values (mapped to pixel x)
const DATA = { min: 15, q1: 30, median: 42, q3: 58, max: 78, outlierLow: 5, outlierHigh: 92 };

function dataToX(val: number) {
    return X_LEFT + ((val - 0) / 100) * (X_RIGHT - X_LEFT);
}

export default function BoxplotAnatomy() {
    const [hovered, setHovered] = useState<PartId>(null);

    const isActive = (id: PartId) => hovered === id;
    const isDimmed = (id: PartId) => hovered !== null && hovered !== id;

    const xMin = dataToX(DATA.min);
    const xQ1 = dataToX(DATA.q1);
    const xMed = dataToX(DATA.median);
    const xQ3 = dataToX(DATA.q3);
    const xMax = dataToX(DATA.max);
    const xOL = dataToX(DATA.outlierLow);
    const xOH = dataToX(DATA.outlierHigh);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                박스플롯 해부도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Boxplot Anatomy — hover to explore each part
            </p>

            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ maxWidth: 600, display: 'block', margin: '0 auto' }}>
                {/* Axis */}
                <line x1={X_LEFT - 20} y1={CY + BOX_H / 2 + 40} x2={X_RIGHT + 20} y2={CY + BOX_H / 2 + 40} stroke={COLOR.border} strokeWidth={1} />

                {/* Whisker lines */}
                <motion.g
                    onMouseEnter={() => setHovered('whisker')}
                    onMouseLeave={() => setHovered(null)}
                    animate={{ opacity: isDimmed('whisker') ? 0.2 : 1 }}
                    style={{ cursor: 'pointer' }}
                >
                    <line x1={xMin} y1={CY} x2={xQ1} y2={CY} stroke={isActive('whisker') ? COLOR.textBright : COLOR.textMuted} strokeWidth={isActive('whisker') ? 3 : 2} />
                    <line x1={xQ3} y1={CY} x2={xMax} y2={CY} stroke={isActive('whisker') ? COLOR.textBright : COLOR.textMuted} strokeWidth={isActive('whisker') ? 3 : 2} />
                </motion.g>

                {/* IQR highlight */}
                <motion.rect
                    x={xQ1} y={CY - BOX_H / 2}
                    width={xQ3 - xQ1} height={BOX_H}
                    rx={4}
                    fill={isActive('iqr') ? STATS_COLOR.accentBg : 'rgba(255,255,255,0.03)'}
                    stroke={isActive('iqr') ? STATS_COLOR.accent : COLOR.border}
                    strokeWidth={isActive('iqr') ? 2 : 1}
                    onMouseEnter={() => setHovered('iqr')}
                    onMouseLeave={() => setHovered(null)}
                    animate={{ opacity: isDimmed('iqr') ? 0.2 : 1 }}
                    style={{ cursor: 'pointer' }}
                />

                {/* Q1 line */}
                <motion.line
                    x1={xQ1} y1={CY - BOX_H / 2} x2={xQ1} y2={CY + BOX_H / 2}
                    stroke={isActive('q1') ? PARTS.q1.color : COLOR.textMuted}
                    strokeWidth={isActive('q1') ? 3 : 2}
                    onMouseEnter={() => setHovered('q1')}
                    onMouseLeave={() => setHovered(null)}
                    animate={{ opacity: isDimmed('q1') ? 0.2 : 1 }}
                    style={{ cursor: 'pointer' }}
                />

                {/* Q3 line */}
                <motion.line
                    x1={xQ3} y1={CY - BOX_H / 2} x2={xQ3} y2={CY + BOX_H / 2}
                    stroke={isActive('q3') ? PARTS.q3.color : COLOR.textMuted}
                    strokeWidth={isActive('q3') ? 3 : 2}
                    onMouseEnter={() => setHovered('q3')}
                    onMouseLeave={() => setHovered(null)}
                    animate={{ opacity: isDimmed('q3') ? 0.2 : 1 }}
                    style={{ cursor: 'pointer' }}
                />

                {/* Median line */}
                <motion.line
                    x1={xMed} y1={CY - BOX_H / 2} x2={xMed} y2={CY + BOX_H / 2}
                    stroke={isActive('median') ? PARTS.median.color : STATS_COLOR.series[3]}
                    strokeWidth={isActive('median') ? 4 : 3}
                    onMouseEnter={() => setHovered('median')}
                    onMouseLeave={() => setHovered(null)}
                    animate={{ opacity: isDimmed('median') ? 0.2 : 1 }}
                    style={{ cursor: 'pointer' }}
                />

                {/* Min fence */}
                <motion.g
                    onMouseEnter={() => setHovered('min')}
                    onMouseLeave={() => setHovered(null)}
                    animate={{ opacity: isDimmed('min') ? 0.2 : 1 }}
                    style={{ cursor: 'pointer' }}
                >
                    <line x1={xMin} y1={CY - 20} x2={xMin} y2={CY + 20}
                        stroke={isActive('min') ? PARTS.min.color : COLOR.textMuted} strokeWidth={isActive('min') ? 3 : 2} />
                </motion.g>

                {/* Max fence */}
                <motion.g
                    onMouseEnter={() => setHovered('max')}
                    onMouseLeave={() => setHovered(null)}
                    animate={{ opacity: isDimmed('max') ? 0.2 : 1 }}
                    style={{ cursor: 'pointer' }}
                >
                    <line x1={xMax} y1={CY - 20} x2={xMax} y2={CY + 20}
                        stroke={isActive('max') ? PARTS.max.color : COLOR.textMuted} strokeWidth={isActive('max') ? 3 : 2} />
                </motion.g>

                {/* Outliers */}
                <motion.g
                    onMouseEnter={() => setHovered('outlier')}
                    onMouseLeave={() => setHovered(null)}
                    animate={{ opacity: isDimmed('outlier') ? 0.2 : 1 }}
                    style={{ cursor: 'pointer' }}
                >
                    <circle cx={xOL} cy={CY} r={isActive('outlier') ? 7 : 5}
                        fill="none" stroke={PARTS.outlier.color} strokeWidth={2} />
                    <circle cx={xOH} cy={CY} r={isActive('outlier') ? 7 : 5}
                        fill="none" stroke={PARTS.outlier.color} strokeWidth={2} />
                </motion.g>

                {/* Labels on axis */}
                {[
                    { x: xOL, label: '아웃라이어' },
                    { x: xMin, label: 'Min' },
                    { x: xQ1, label: 'Q₁' },
                    { x: xMed, label: 'Q₂' },
                    { x: xQ3, label: 'Q₃' },
                    { x: xMax, label: 'Max' },
                    { x: xOH, label: '아웃라이어' },
                ].map(({ x, label }, i) => (
                    <text key={i} x={x} y={CY + BOX_H / 2 + 30} textAnchor="middle"
                        fill={COLOR.textDim} fontSize={FONT.min}>
                        {label}
                    </text>
                ))}

                {/* IQR brace label */}
                <text x={(xQ1 + xQ3) / 2} y={CY - BOX_H / 2 - 14} textAnchor="middle"
                    fill={STATS_COLOR.accent} fontSize={FONT.small} fontWeight={600}>
                    IQR
                </text>
                <line x1={xQ1 + 4} y1={CY - BOX_H / 2 - 6} x2={xQ3 - 4} y2={CY - BOX_H / 2 - 6}
                    stroke={STATS_COLOR.accent} strokeWidth={1.5} markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
            </svg>

            {/* Info panel */}
            <AnimatePresence mode="wait">
                {hovered && (
                    <motion.div
                        key={hovered}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            maxWidth: 460, margin: '12px auto 0',
                            padding: '12px 16px', borderRadius: 10,
                            background: COLOR.cardBg,
                            border: `1px solid ${PARTS[hovered].color}40`,
                        }}
                    >
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 600, color: PARTS[hovered].color, marginBottom: 4 }}>
                            {PARTS[hovered].label}
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                            {PARTS[hovered].desc}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!hovered && (
                <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.min, marginTop: 12 }}>
                    각 부분에 마우스를 올려 설명을 확인하세요
                </p>
            )}
        </div>
    );
}
