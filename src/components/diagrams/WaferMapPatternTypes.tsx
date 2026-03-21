'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type PatternId = 'random' | 'edge' | 'cluster' | 'ring' | 'repeat' | null;

const PATTERNS: Record<Exclude<PatternId, null>, { label: string; desc: string; color: string }> = {
    random:  { label: 'Random', desc: '파티클, 스크래치 등 예측 불가 결함. 위치가 랜덤이며 D₀로 모델링.', color: '#ef4444' },
    edge:    { label: 'Edge', desc: '웨이퍼 가장자리에 집중. 코팅 불균일, EBR(엣지 비드 제거), CMP 등 에지 공정 문제.', color: '#f59e0b' },
    cluster: { label: 'Cluster', desc: '특정 영역에 결함 밀집. 장비 오염, 국부적 파티클, 챔버 내 이물 등이 원인.', color: '#3b82f6' },
    ring:    { label: 'Ring', desc: '동심원 형태 불량. 스핀코팅, 척(Chuck) 접촉, CMP 불균일 등 회전 대칭 공정 문제.', color: '#22c55e' },
    repeat:  { label: 'Repeat', desc: '레티클 필드 내 동일 위치 반복. 마스크 결함(Reticle Defect)이 원인. 모든 필드에 동일 패턴.', color: '#a855f7' },
};

const ORDER: Exclude<PatternId, null>[] = ['random', 'edge', 'cluster', 'ring', 'repeat'];

/* Seeded random for consistent rendering */
function seededRandom(seed: number) {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/* Generate die positions within a wafer circle */
function generateDies(cx: number, cy: number, r: number, spacing: number) {
    const dies: { x: number; y: number }[] = [];
    for (let gx = cx - r; gx <= cx + r; gx += spacing) {
        for (let gy = cy - r; gy <= cy + r; gy += spacing) {
            const dx = gx - cx, dy = gy - cy;
            if (dx * dx + dy * dy <= (r - 3) * (r - 3)) {
                dies.push({ x: gx, y: gy });
            }
        }
    }
    return dies;
}

/* Determine if a die is defective based on pattern */
function isDefective(pattern: Exclude<PatternId, null>, x: number, y: number, cx: number, cy: number, r: number, rand: () => number): boolean {
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    switch (pattern) {
        case 'random': return rand() < 0.08;
        case 'edge': return dist > r * 0.75 && rand() < 0.45;
        case 'cluster': {
            const clx = cx + r * 0.3, cly = cy - r * 0.2;
            const cd = Math.sqrt((x - clx) ** 2 + (y - cly) ** 2);
            return cd < r * 0.3 && rand() < 0.55;
        }
        case 'ring': return Math.abs(dist - r * 0.55) < r * 0.1 && rand() < 0.5;
        case 'repeat': {
            // Reticle field grid: defect at same position in each field
            const fieldW = 24, fieldH = 24; // 3×3 dies per field
            const rx = ((x - (cx - r)) % fieldW + fieldW) % fieldW;
            const ry = ((y - (cy - r)) % fieldH + fieldH) % fieldH;
            return Math.abs(rx) < 2 && Math.abs(ry) < 2;
        }
    }
}

const WAFER_R = 42;
const DIE_SIZE = 5;
const SPACING = 8;
const SVG_W = 600;
const SVG_H = 120;
const WAFER_Y = 52;
const WAFER_POSITIONS = ORDER.map((_, i) => 60 + i * ((SVG_W - 120) / 4));

export default function WaferMapPatternTypes() {
    const [hovered, setHovered] = useState<PatternId>(null);

    const waferData = useMemo(() => {
        return ORDER.map((pattern, wi) => {
            const wcx = WAFER_POSITIONS[wi];
            const dies = generateDies(wcx, WAFER_Y, WAFER_R, SPACING);
            const rand = seededRandom(42 + wi * 137);
            return dies.map(d => ({
                ...d,
                bad: isDefective(pattern, d.x, d.y, wcx, WAFER_Y, WAFER_R, rand),
            }));
        });
    }, []);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                웨이퍼맵 불량 패턴 5종
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                불량 다이의 공간 패턴에서 결함 원인을 추정
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {ORDER.map((pattern, wi) => {
                        const wcx = WAFER_POSITIONS[wi];
                        const info = PATTERNS[pattern];
                        const active = hovered === pattern;
                        const dimmed = hovered !== null && hovered !== pattern;
                        const dies = waferData[wi];
                        return (
                            <motion.g key={pattern}
                                onMouseEnter={() => setHovered(pattern)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                {/* hit area */}
                                <rect x={wcx - WAFER_R - 10} y={0} width={WAFER_R * 2 + 20} height={SVG_H} fill="transparent" />
                                {/* wafer outline */}
                                <circle cx={wcx} cy={WAFER_Y} r={WAFER_R} fill="none" stroke={active ? `${info.color}40` : 'rgba(255,255,255,0.08)'} strokeWidth={1} />
                                {/* notch */}
                                <line x1={wcx - 3} y1={WAFER_Y + WAFER_R} x2={wcx + 3} y2={WAFER_Y + WAFER_R} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
                                {/* dies */}
                                {dies.map((d, di) => (
                                    <rect key={di} x={d.x - DIE_SIZE / 2} y={d.y - DIE_SIZE / 2} width={DIE_SIZE} height={DIE_SIZE} rx={1}
                                        fill={d.bad ? info.color : 'rgba(34,197,94,0.25)'}
                                        opacity={d.bad ? 0.85 : 0.4} />
                                ))}
                                {/* label */}
                                <text x={wcx} y={WAFER_Y + WAFER_R + 14} textAnchor="middle" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: PATTERNS[hovered].color, marginBottom: 2 }}>{PATTERNS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{PATTERNS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 패턴을 호버하세요. 불량 분포 패턴으로 결함 원인을 추정 — CNN으로 자동 분류 가능.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
