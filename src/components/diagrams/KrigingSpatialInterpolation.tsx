'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type PointId = 'measured' | 'interpolated' | 'uncertainty' | null;

const ITEMS: Record<Exclude<PointId, null>, { label: string; desc: string; color: string }> = {
    measured:     { label: '측정 포인트', desc: '실제 CD/OVL이 계측된 사이트 (웨이퍼당 5~13개). 값이 정확하고 불확실성(σ)이 0에 가까움.', color: '#3b82f6' },
    interpolated: { label: '보간된 영역', desc: 'Kriging/GP가 예측한 미측정 영역. 인접 측정 포인트의 공간 상관을 활용하여 값 추정.', color: '#22c55e' },
    uncertainty:  { label: '불확실성 높은 영역', desc: '측정 포인트에서 멀어 예측 불확실성(σ)이 큼. 추가 계측을 권고하는 영역.', color: '#f59e0b' },
};

const SVG_W = 400;
const SVG_H = 260;
const CX = SVG_W / 2;
const CY = 120;
const R = 100;

/* Measured site positions (normalized -1~1) */
const SITES = [
    { nx: 0, ny: 0 },
    { nx: 0.55, ny: 0 },
    { nx: -0.55, ny: 0 },
    { nx: 0, ny: 0.55 },
    { nx: 0, ny: -0.55 },
    { nx: 0.38, ny: 0.38 },
    { nx: -0.38, ny: -0.38 },
    { nx: 0.38, ny: -0.38 },
    { nx: -0.38, ny: 0.38 },
];

/* Generate heatmap cells */
function generateCells() {
    const cells: { nx: number; ny: number; dist: number }[] = [];
    const DIV = 16;
    for (let gy = -DIV; gy <= DIV; gy++) {
        for (let gx = -DIV; gx <= DIV; gx++) {
            const nx = gx / DIV;
            const ny = gy / DIV;
            if (Math.sqrt(nx * nx + ny * ny) > 1.0) continue;
            /* Distance to nearest measured site */
            let minD = 99;
            for (const s of SITES) {
                const d = Math.sqrt((nx - s.nx) ** 2 + (ny - s.ny) ** 2);
                if (d < minD) minD = d;
            }
            cells.push({ nx, ny, dist: minD });
        }
    }
    return cells;
}

export default function KrigingSpatialInterpolation() {
    const [hovered, setHovered] = useState<PointId>(null);
    const cells = useMemo(() => generateCells(), []);
    const maxDist = useMemo(() => Math.max(...cells.map(c => c.dist)), [cells]);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                공간 보간(Kriging) — 측정점에서 전체 웨이퍼 맵으로
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                소수 측정 포인트 → 공간 상관 활용 → 전체 분포 추정 + 불확실성
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 400 }}>
                    {/* Wafer outline */}
                    <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />

                    {/* Heatmap cells — color by distance to nearest site */}
                    <motion.g animate={{ opacity: hovered === 'measured' ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
                        {cells.map((c, i) => {
                            const t = c.dist / maxDist;
                            const isUncertain = t > 0.6;
                            const green = isUncertain ? 0 : Math.round(180 * (1 - t));
                            const red = isUncertain ? Math.round(200 * t) : 0;
                            const blue = isUncertain ? 0 : Math.round(100 * (1 - t));
                            const color = isUncertain ? `rgba(${red + 100},${160 - red},50,0.3)` : `rgba(${red + 30},${green + 60},${blue + 80},0.25)`;
                            return (
                                <rect key={i} x={CX + c.nx * (R - 3) - 3} y={CY + c.ny * (R - 3) - 3} width={6} height={6} rx={1}
                                    fill={color}
                                    onMouseEnter={() => setHovered(isUncertain ? 'uncertainty' : 'interpolated')}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{ cursor: 'pointer' }} />
                            );
                        })}
                    </motion.g>

                    {/* Measured sites */}
                    <motion.g animate={{ opacity: hovered !== null && hovered !== 'measured' ? 0.3 : 1 }} transition={{ duration: 0.15 }}>
                        {SITES.map((s, i) => (
                            <g key={i} onMouseEnter={() => setHovered('measured')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                                <circle cx={CX + s.nx * R} cy={CY + s.ny * R} r={6} fill="transparent" />
                                <circle cx={CX + s.nx * R} cy={CY + s.ny * R} r={4} fill="#3b82f6" opacity={0.9} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
                            </g>
                        ))}
                    </motion.g>

                    {/* Legend */}
                    <circle cx={CX - 60} cy={CY + R + 20} r={4} fill="#3b82f6" />
                    <text x={CX - 52} y={CY + R + 24} fill={COLOR.textDim} fontSize={FONT.min}>측정점</text>
                    <rect x={CX + 10} y={CY + R + 16} width={8} height={8} rx={1} fill="rgba(60,180,140,0.4)" />
                    <text x={CX + 22} y={CY + R + 24} fill={COLOR.textDim} fontSize={FONT.min}>보간</text>
                    <rect x={CX + 60} y={CY + R + 16} width={8} height={8} rx={1} fill="rgba(200,120,50,0.4)" />
                    <text x={CX + 72} y={CY + R + 24} fill={COLOR.textDim} fontSize={FONT.min}>불확실</text>
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: ITEMS[hovered].color, marginBottom: 2 }}>{ITEMS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{ITEMS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>웨이퍼를 호버하세요. 파란 점=측정 사이트, 녹색=보간 영역, 주황=불확실 영역.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
