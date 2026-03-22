'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type PatternId = 'random' | 'edge' | 'center' | 'cluster' | 'scratch' | 'ring' | 'zone' | 'repeat' | null;

const PATTERNS: Record<Exclude<PatternId, null>, { label: string; desc: string; color: string }> = {
    random:  { label: 'Random', desc: '파티클/랜덤 결함. 전체에 흩어짐. D₀와 직결. 클린룸 관리가 유일한 대책.', color: '#ef4444' },
    edge:    { label: 'Edge', desc: '에지 5~10mm 집중. 스핀 코팅 비드, CMP 에지 효과, 로봇암 접촉.', color: '#f59e0b' },
    center:  { label: 'Center', desc: '중심부 집중. 스핀 코팅 두께 이상, CMP 과연마, 가스 흐름 집중.', color: '#22c55e' },
    cluster: { label: 'Cluster', desc: '특정 영역 밀집. 국부 오염, 척 손상, 화학물질 얼룩. 위치=오염 소스.', color: '#3b82f6' },
    scratch: { label: 'Scratch', desc: '직선/곡선 선형. CMP 슬러리 파티클, 웨이퍼 이송 중 긁힘.', color: '#a855f7' },
    ring:    { label: 'Ring', desc: '동심원. 회전 공정(스핀/CMP) 특성 반영. 핫플레이트 온도 불균일.', color: '#06b6d4' },
    zone:    { label: 'Zone', desc: '반쪽/사분면 집중. 가스 흐름 비대칭, 챔버 한쪽 벽면 오염.', color: '#f97316' },
    repeat:  { label: 'Repeat', desc: '모든 필드 동일 위치 반복. 거의 확실히 마스크 결함. 마스크 교체 필요.', color: '#ec4899' },
};

const ORDER: Exclude<PatternId, null>[] = ['random', 'edge', 'center', 'cluster', 'scratch', 'ring', 'zone', 'repeat'];

/* Layout: 4×2 grid of wafer circles */
const SVG_W = 600;
const SVG_H = 280;
const COLS = 4;
const ROWS = 2;
const WAFER_R = 52;
const GAP_X = (SVG_W - COLS * WAFER_R * 2) / (COLS + 1);
const GAP_Y = 20;
const START_Y = WAFER_R + 10;

/* Pseudo-random seeded positions */
function seeded(seed: number) {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function generateDies(pattern: Exclude<PatternId, null>): { dx: number; dy: number; fail: boolean }[] {
    const rng = seeded(pattern.length * 137 + pattern.charCodeAt(0) * 31);
    const dies: { dx: number; dy: number; fail: boolean }[] = [];
    const GRID = 12;
    for (let gy = -GRID; gy <= GRID; gy++) {
        for (let gx = -GRID; gx <= GRID; gx++) {
            const nx = gx / GRID;
            const ny = gy / GRID;
            const dist = Math.sqrt(nx * nx + ny * ny);
            if (dist > 1.0) continue;
            let fail = false;
            const r = rng();
            switch (pattern) {
                case 'random': fail = r < 0.12; break;
                case 'edge': fail = dist > 0.82 && r < 0.55; break;
                case 'center': fail = dist < 0.35 && r < 0.5; break;
                case 'cluster': fail = Math.sqrt((nx - 0.3) ** 2 + (ny + 0.25) ** 2) < 0.28 && r < 0.6; break;
                case 'scratch': fail = Math.abs(ny - nx * 0.8 - 0.1) < 0.1 && r < 0.65; break;
                case 'ring': fail = Math.abs(dist - 0.6) < 0.1 && r < 0.55; break;
                case 'zone': fail = nx > 0.05 && r < 0.35; break;
                case 'repeat': fail = (Math.abs(gx) % 4 === 2) && (Math.abs(gy) % 4 === 2) && r < 0.7; break;
            }
            dies.push({ dx: nx, dy: ny, fail });
        }
    }
    return dies;
}

export default function WaferMap8Patterns() {
    const [hovered, setHovered] = useState<PatternId>(null);

    const dieData = useMemo(() => {
        const d: Record<string, { dx: number; dy: number; fail: boolean }[]> = {};
        ORDER.forEach(p => { d[p] = generateDies(p); });
        return d;
    }, []);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                8대 불량 패턴 — 웨이퍼맵 시각 예시
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                각 패턴을 호버하여 원인과 특징을 확인하세요
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {ORDER.map((id, i) => {
                        const col = i % COLS;
                        const row = Math.floor(i / COLS);
                        const cx = GAP_X * (col + 1) + WAFER_R * (2 * col + 1);
                        const cy = START_Y + row * (WAFER_R * 2 + GAP_Y + 16);
                        const info = PATTERNS[id];
                        const active = hovered === id;
                        const dimmed = hovered !== null && hovered !== id;
                        const dies = dieData[id];

                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.12 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                {/* Hit area */}
                                <rect x={cx - WAFER_R - 4} y={cy - WAFER_R - 4} width={WAFER_R * 2 + 8} height={WAFER_R * 2 + 24} fill="transparent" />
                                {/* Wafer circle */}
                                <circle cx={cx} cy={cy} r={WAFER_R} fill="rgba(255,255,255,0.02)"
                                    stroke={active ? `${info.color}60` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 0.5} />
                                {/* Dies */}
                                {dies.map((d, j) => (
                                    <rect key={j} x={cx + d.dx * (WAFER_R - 4) - 2} y={cy + d.dy * (WAFER_R - 4) - 2} width={4} height={4} rx={0.5}
                                        fill={d.fail ? info.color : 'rgba(34,197,94,0.4)'} opacity={d.fail ? (active ? 0.9 : 0.7) : 0.15} />
                                ))}
                                {/* Label */}
                                <text x={cx} y={cy + WAFER_R + 14} textAnchor="middle" fill={active ? info.color : COLOR.textDim} fontSize={FONT.min} fontWeight={active ? 600 : 400}>{info.label}</text>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 웨이퍼를 호버하세요. 불량의 공간 패턴이 원인의 물리적 특성을 반영합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
