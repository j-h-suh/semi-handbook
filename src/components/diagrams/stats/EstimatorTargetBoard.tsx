'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── 타겟 타입 정의 ─── */
type TargetId = 'ideal' | 'unbiasedInefficient' | 'biasedConsistent' | 'worst';

interface TargetConfig {
    id: TargetId;
    title: string;
    subtitle: string;
    description: string;
    color: string;
    /** Base dart positions — (dx, dy) offsets from target center */
    darts: [number, number][];
}

/* ─── 시드 기반 dart 위치 (결정론적) ─── */
const TARGETS: TargetConfig[] = [
    {
        id: 'ideal',
        title: '이상적 추정량',
        subtitle: 'Low Bias + Low Variance',
        description: '반복 추정 시 참값 근처에 일관되게 모인다. 편향도 작고 분산도 작은 최선의 추정량.',
        color: STATS_COLOR.series[0], // emerald
        darts: [
            [2, -3], [-1, 4], [3, 1], [-2, -2], [0, 3],
            [1, -1], [-3, 2], [2, 2], [-1, -3], [0, -1],
        ],
    },
    {
        id: 'unbiasedInefficient',
        title: '불편이지만 비효율적',
        subtitle: 'Low Bias + High Variance',
        description: '평균적으로는 참값을 맞추지만, 개별 추정치가 크게 흩어진다. 표본이 작을 때 흔히 발생.',
        color: STATS_COLOR.series[1], // sky
        darts: [
            [18, -22], [-25, 12], [8, 28], [-15, -18], [22, 5],
            [-8, -26], [26, -10], [-20, 20], [5, -15], [-12, 8],
        ],
    },
    {
        id: 'biasedConsistent',
        title: '편향되지만 일관적',
        subtitle: 'High Bias + Low Variance',
        description: '추정치끼리는 모여 있지만 참값에서 체계적으로 벗어나 있다. 모델이 잘못 설정된 경우.',
        color: STATS_COLOR.series[3], // amber
        darts: [
            [22, -18], [19, -21], [24, -16], [20, -20], [23, -19],
            [18, -17], [21, -22], [25, -15], [20, -18], [22, -20],
        ],
    },
    {
        id: 'worst',
        title: '최악의 추정량',
        subtitle: 'High Bias + High Variance',
        description: '참값에서도 멀고 추정치끼리도 흩어져 있다. 모든 것이 잘못된 상태.',
        color: STATS_COLOR.series[2], // pink
        darts: [
            [30, -10], [12, -32], [35, -25], [8, -8], [28, -35],
            [18, -28], [38, -15], [15, -20], [25, -5], [32, -30],
        ],
    },
];

/* ─── 상수 ─── */
const TARGET_SIZE = 150;
const CENTER = TARGET_SIZE / 2;
const RING_RADII = [55, 37, 18];
const DART_RADIUS = 3.5;
const CROSSHAIR_SIZE = 8;
const JITTER_RANGE = 6;

/** 시드 기반 의사난수 jitter 생성 */
function jitter(seed: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return ((x - Math.floor(x)) - 0.5) * 2 * JITTER_RANGE;
}

/* ─── 개별 타겟 컴포넌트 ─── */
function Target({
    config,
    isHovered,
    onHover,
    onLeave,
    resampleKey,
}: {
    config: TargetConfig;
    isHovered: boolean;
    onHover: () => void;
    onLeave: () => void;
    resampleKey: number;
}) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
            }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >
            <svg
                viewBox={`0 0 ${TARGET_SIZE} ${TARGET_SIZE}`}
                width="100%"
                style={{
                    maxWidth: 180,
                    display: 'block',
                    filter: isHovered ? `drop-shadow(0 0 12px ${config.color}40)` : 'none',
                    transition: 'filter 0.3s ease',
                }}
            >
                {/* 동심원 링 */}
                {RING_RADII.map((r, i) => (
                    <circle
                        key={i}
                        cx={CENTER}
                        cy={CENTER}
                        r={r}
                        fill="none"
                        stroke={COLOR.textDim}
                        strokeWidth={1}
                        opacity={0.4 + i * 0.15}
                    />
                ))}

                {/* 십자선 — 참값 위치 */}
                <line
                    x1={CENTER - CROSSHAIR_SIZE} y1={CENTER}
                    x2={CENTER + CROSSHAIR_SIZE} y2={CENTER}
                    stroke={COLOR.textMuted}
                    strokeWidth={0.8}
                    opacity={0.6}
                />
                <line
                    x1={CENTER} y1={CENTER - CROSSHAIR_SIZE}
                    x2={CENTER} y2={CENTER + CROSSHAIR_SIZE}
                    stroke={COLOR.textMuted}
                    strokeWidth={0.8}
                    opacity={0.6}
                />

                {/* Dart 점들 */}
                {config.darts.map(([dx, dy], i) => {
                    const jx = jitter(resampleKey * 100 + i * 7 + 1);
                    const jy = jitter(resampleKey * 100 + i * 7 + 3);
                    return (
                        <motion.circle
                            key={i}
                            cx={CENTER + dx + (resampleKey > 0 ? jx : 0)}
                            cy={CENTER + dy + (resampleKey > 0 ? jy : 0)}
                            r={DART_RADIUS}
                            fill={config.color}
                            opacity={0.85}
                            animate={{
                                cx: CENTER + dx + (resampleKey > 0 ? jx : 0),
                                cy: CENTER + dy + (resampleKey > 0 ? jy : 0),
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        />
                    );
                })}

                {/* 참값 점 (중심) */}
                <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={2}
                    fill={COLOR.textBright}
                />
            </svg>

            {/* 라벨 */}
            <p style={{
                color: config.color,
                fontSize: FONT.small,
                fontWeight: 600,
                marginTop: 8,
                marginBottom: 2,
                textAlign: 'center',
            }}>
                {config.title}
            </p>
            <p style={{
                color: COLOR.textDim,
                fontSize: FONT.min,
                textAlign: 'center',
            }}>
                {config.subtitle}
            </p>

            {/* 호버 툴팁 */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            bottom: -60,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: COLOR.tooltipBg,
                            border: `1px solid ${config.color}30`,
                            borderRadius: 8,
                            padding: '8px 12px',
                            width: 220,
                            zIndex: 10,
                        }}
                    >
                        <p style={{
                            color: COLOR.text,
                            fontSize: FONT.min,
                            lineHeight: 1.5,
                            margin: 0,
                        }}>
                            {config.description}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── 메인 컴포넌트 ─── */
export default function EstimatorTargetBoard() {
    const [hoveredId, setHoveredId] = useState<TargetId | null>(null);
    const [resampleKey, setResampleKey] = useState(0);

    return (
        <div className="my-8" style={{ position: 'relative' }}>
            {/* 제목 */}
            <h3 style={{
                textAlign: 'center',
                color: COLOR.textBright,
                fontSize: FONT.title,
                fontWeight: 700,
                marginBottom: 4,
            }}>
                편향 vs 분산 — 과녁 비유
            </h3>
            <p style={{
                textAlign: 'center',
                color: COLOR.textDim,
                fontSize: FONT.subtitle,
                marginBottom: 20,
            }}>
                Bias–Variance Tradeoff — each dot is one estimate from repeated sampling
            </p>

            {/* 2x2 그리드 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 32,
                maxWidth: 480,
                margin: '0 auto',
                paddingBottom: 60,
            }}>
                {TARGETS.map((t) => (
                    <Target
                        key={t.id}
                        config={t}
                        isHovered={hoveredId === t.id}
                        onHover={() => setHoveredId(t.id)}
                        onLeave={() => setHoveredId(null)}
                        resampleKey={resampleKey}
                    />
                ))}
            </div>

            {/* 열 헤더 라벨 */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 24,
                marginTop: 8,
                marginBottom: 16,
            }}>
                <span style={{ color: COLOR.textMuted, fontSize: FONT.min }}>
                    ✛ = 참값(모수) &nbsp;&nbsp; ● = 개별 추정치
                </span>
            </div>

            {/* 재추정 버튼 */}
            <div style={{ textAlign: 'center' }}>
                <motion.button
                    onClick={() => setResampleKey((k) => k + 1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        background: STATS_COLOR.accentDim,
                        color: STATS_COLOR.accent,
                        border: `1px solid ${STATS_COLOR.accentBorder}`,
                        borderRadius: 8,
                        padding: '8px 20px',
                        fontSize: FONT.body,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                    }}
                >
                    재추정 (Resample)
                </motion.button>
                <p style={{
                    color: COLOR.textDim,
                    fontSize: FONT.min,
                    marginTop: 6,
                }}>
                    버튼을 누르면 반복 표본추출 효과를 시뮬레이션합니다
                </p>
            </div>
        </div>
    );
}
