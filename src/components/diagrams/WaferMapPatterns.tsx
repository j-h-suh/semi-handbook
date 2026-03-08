'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type PatternKey = 'ring' | 'scratch' | 'edge' | 'cluster' | null;

const patternInfo: Record<Exclude<PatternKey, null>, { label: string; sub: string; desc: string; accent: string }> = {
    ring: {
        label: '링 패턴 (Ring)',
        sub: 'CMP Non-uniformity',
        desc: '동심원 형태의 불량 분포. CMP의 연마 불균일이나 CVD 증착의 중심-가장자리 두께 차이가 원인이다.',
        accent: '#ef4444',
    },
    scratch: {
        label: '스크래치 (Scratch)',
        sub: 'Handling Damage',
        desc: '대각선 또는 직선 형태의 불량. 웨이퍼 핸들링, 이송, 또는 CMP 중 이물질에 의한 물리적 손상이 원인이다.',
        accent: '#f59e0b',
    },
    edge: {
        label: '엣지 집중 (Edge)',
        sub: 'Edge Effect',
        desc: '웨이퍼 가장자리에 불량이 집중. 포토레지스트 코팅, 식각, CMP 등 대부분의 공정이 가장자리에서 균일도가 떨어진다.',
        accent: '#3b82f6',
    },
    cluster: {
        label: '클러스터 (Cluster)',
        sub: 'Localized Defect',
        desc: '특정 영역에 불량이 뭉쳐 발생. 국부적 파티클 오염이나 장비의 특정 위치 이상이 원인이다.',
        accent: '#8b5cf6',
    },
};

/* ─── Geometry ─── */
const WAFER_R = 60;
const GRID_STEP = 10;
const W = 580, H = 165;
const MAP_GAP = 20;

/* Generate die positions within circle */
function generateDiePositions() {
    const positions: { x: number; y: number }[] = [];
    for (let dx = -WAFER_R + GRID_STEP; dx < WAFER_R; dx += GRID_STEP) {
        for (let dy = -WAFER_R + GRID_STEP; dy < WAFER_R; dy += GRID_STEP) {
            if (dx * dx + dy * dy < (WAFER_R - GRID_STEP / 2) ** 2) {
                positions.push({ x: dx, y: dy });
            }
        }
    }
    return positions;
}

/* Check if die is defective for each pattern */
function isDefective(pattern: Exclude<PatternKey, null>, dx: number, dy: number, r: number): boolean {
    const dist = Math.sqrt(dx * dx + dy * dy);
    switch (pattern) {
        case 'ring': {
            const ringR = r * 0.55;
            return Math.abs(dist - ringR) < GRID_STEP * 1.2;
        }
        case 'scratch': {
            const angle = Math.atan2(dy, dx);
            const projDist = Math.abs(dy - dx * 0.6) / Math.sqrt(1 + 0.36);
            return projDist < GRID_STEP * 0.8 && angle > -1 && angle < 1.5;
        }
        case 'edge':
            return dist > r * 0.75;
        case 'cluster': {
            const cx = r * 0.25, cy = -r * 0.2;
            const clusterDist = Math.sqrt((dx - cx) ** 2 + (dy - cy) ** 2);
            return clusterDist < r * 0.3;
        }
    }
}

function WaferMap({ cx, cy, pattern }: { cx: number; cy: number; pattern: Exclude<PatternKey, null> }) {
    const dies = useMemo(() => generateDiePositions(), []);
    const dieSize = GRID_STEP - 2;

    return (
        <g>
            {/* Wafer circle */}
            <circle cx={cx} cy={cy} r={WAFER_R} fill="rgba(255,255,255,0.03)" stroke="#3f3f46" strokeWidth={1} />
            {/* Notch */}
            <rect x={cx - 4} y={cy + WAFER_R - 3} width={8} height={4} fill="#18181b" />
            {/* Dies */}
            {dies.map((d, i) => {
                const defective = isDefective(pattern, d.x, d.y, WAFER_R);
                return (
                    <rect key={i}
                        x={cx + d.x - dieSize / 2} y={cy + d.y - dieSize / 2}
                        width={dieSize} height={dieSize}
                        fill={defective ? patternInfo[pattern].accent : '#22c55e'}
                        opacity={defective ? 0.8 : 0.2}
                        rx={1}
                    />
                );
            })}
        </g>
    );
}

const patterns: Exclude<PatternKey, null>[] = ['ring', 'scratch', 'edge', 'cluster'];

export default function WaferMapPatterns() {
    const [hovered, setHovered] = useState<PatternKey>(null);

    /* 4 maps in a row */
    const totalW = 4 * WAFER_R * 2 + 3 * MAP_GAP;
    const startX = (W - totalW) / 2 + WAFER_R;
    const mapY = 66;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                웨이퍼 맵 불량 패턴 4종
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Wafer Map Defect Patterns — CNN Classification Targets
            </p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 720, margin: '0 auto', display: 'block' }}>
                {patterns.map((pat, i) => {
                    const mapCx = startX + i * (WAFER_R * 2 + MAP_GAP);
                    const dimmed = hovered !== null && hovered !== pat;
                    return (
                        <g key={pat} onMouseEnter={() => setHovered(pat)} style={{ cursor: 'pointer' }}>
                            <motion.g animate={{ opacity: dimmed ? 0.25 : 1 }} transition={{ duration: 0.2 }}>
                                <WaferMap cx={mapCx} cy={mapY} pattern={pat} />
                                <text x={mapCx} y={mapY + WAFER_R + 18} textAnchor="middle" fontSize={FONT.min} fill={patternInfo[pat].accent} fontWeight={600}>
                                    {patternInfo[pat].label.split(' (')[0]}
                                </text>
                                <text x={mapCx} y={mapY + WAFER_R + 32} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>
                                    {patternInfo[pat].sub}
                                </text>
                            </motion.g>
                        </g>
                    );
                })}
            </svg>

            <AnimatePresence>
                {hovered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', maxWidth: 460, pointerEvents: 'none', zIndex: 10 }}>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: patternInfo[hovered].accent, marginBottom: 4 }}>
                            {patternInfo[hovered].label}
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{patternInfo[hovered].desc}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
