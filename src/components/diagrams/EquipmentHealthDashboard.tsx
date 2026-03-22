'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type TileId = 'etch_a' | 'etch_b' | 'cvd' | 'litho' | null;

const TILES: Record<Exclude<TileId, null>, { name: string; health: number; status: 'healthy' | 'warning' | 'alert'; metric: string; desc: string; color: string; sparkline: number[] }> = {
    etch_a: { name: 'Etch Chamber A', health: 98, status: 'healthy', metric: 'RF Power 안정', desc: '모든 센서 정상 범위. 마지막 PM 후 350 웨이퍼 처리. 다음 PM까지 여유 충분.', color: '#22c55e', sparkline: [50, 52, 49, 51, 50, 53, 50, 51, 49, 50] },
    etch_b: { name: 'Etch Chamber B', health: 72, status: 'warning', metric: 'RF Power Drift ↗', desc: 'RF Power가 서서히 상승 추세. PM 예정 시점 48시간 이내. 모니터링 강화 필요.', color: '#f59e0b', sparkline: [48, 49, 50, 51, 52, 53, 55, 56, 58, 60] },
    cvd:    { name: 'CVD Chamber', health: 96, status: 'healthy', metric: '증착 두께 안정', desc: '막 두께 균일도 정상. 가스 유량 안정. 다음 PM까지 500 웨이퍼 가용.', color: '#22c55e', sparkline: [100, 101, 99, 100, 102, 100, 99, 101, 100, 100] },
    litho:  { name: 'Litho Scanner', health: 45, status: 'alert', metric: 'Focus Error ↑', desc: 'Focus 에러 급증. 레벨링 센서 점검 필요. 즉시 PM 권장. 생산 웨이퍼 Hold 검토.', color: '#ef4444', sparkline: [10, 15, 12, 25, 30, 18, 35, 45, 40, 50] },
};

const ORDER: Exclude<TileId, null>[] = ['etch_a', 'etch_b', 'cvd', 'litho'];
const SVG_W = 600;
const SVG_H = 180;
const TILE_W = 136;
const TILE_H = 78;
const GAP = 8;
const GRID_W = TILE_W * 2 + GAP;
const GRID_H = TILE_H * 2 + GAP;
const OX = (SVG_W - GRID_W) / 2;
const OY = (SVG_H - GRID_H) / 2;

function Sparkline({ x, y, w, h, data, color }: { x: number; y: number; w: number; h: number; data: number[]; color: string }) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => `${x + (i / (data.length - 1)) * w},${y + h - ((v - min) / range) * h}`).join(' ');
    return <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />;
}

function StatusIcon({ x, y, status, color }: { x: number; y: number; status: string; color: string }) {
    if (status === 'healthy') return <circle cx={x} cy={y} r={5} fill={color} opacity={0.8} />;
    if (status === 'warning') return <polygon points={`${x},${y - 5} ${x + 5},${y + 4} ${x - 5},${y + 4}`} fill={color} opacity={0.8} />;
    return <rect x={x - 4} y={y - 4} width={8} height={8} fill={color} opacity={0.8} transform={`rotate(45 ${x} ${y})`} />;
}

export default function EquipmentHealthDashboard() {
    const [hovered, setHovered] = useState<TileId>(null);

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Equipment Health Index 대시보드
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                장비별 건강 점수 + 센서 추이 — 실시간 상태 모니터링
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {ORDER.map((id, i) => {
                        const col = i % 2;
                        const row = Math.floor(i / 2);
                        const x = OX + col * (TILE_W + GAP);
                        const y = OY + row * (TILE_H + GAP);
                        const tile = TILES[id];
                        const active = hovered === id;
                        const dimmed = hovered !== null && hovered !== id;

                        /* Inner layout constants — relative to tile (x, y) */
                        const PAD_X = 10;
                        const ROW1_Y = y + 14;          /* status icon + name */
                        const ROW2_Y = y + 42;          /* health % + sparkline */
                        const ROW3_Y = y + 62;          /* metric label */
                        const SPARK_X = x + 68;
                        const SPARK_W = TILE_W - 68 - PAD_X;
                        const SPARK_H = 18;

                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - 2} y={y - 2} width={TILE_W + 4} height={TILE_H + 4} fill="transparent" />
                                <rect x={x} y={y} width={TILE_W} height={TILE_H} rx={8}
                                    fill={active ? `${tile.color}10` : 'rgba(255,255,255,0.02)'}
                                    stroke={active ? `${tile.color}40` : 'rgba(255,255,255,0.06)'} strokeWidth={active ? 1.5 : 0.5} />
                                {/* Row 1: Status icon + Name */}
                                <StatusIcon x={x + PAD_X} y={ROW1_Y} status={tile.status} color={tile.color} />
                                <text x={x + PAD_X + 12} y={ROW1_Y + 3} fill={active ? tile.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{tile.name}</text>
                                {/* Row 2: Health % (left) + Sparkline (right) */}
                                <text x={x + PAD_X} y={ROW2_Y} fill={tile.color} fontSize={18} fontWeight={700}>{tile.health}%</text>
                                <Sparkline x={SPARK_X} y={ROW2_Y - SPARK_H + 2} w={SPARK_W} h={SPARK_H} data={tile.sparkline} color={tile.color} />
                                {/* Row 3: Metric label */}
                                <text x={x + PAD_X} y={ROW3_Y} fill={COLOR.textDim} fontSize={FONT.min}>{tile.metric}</text>
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: TILES[hovered].color, marginBottom: 2 }}>{TILES[hovered].name} — {TILES[hovered].health}%</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{TILES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 장비 타일을 호버하세요. ● 정상 ▲ 경고 ◆ 이상 상태를 건강 점수와 센서 추이로 확인합니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
