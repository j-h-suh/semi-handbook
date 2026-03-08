'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type Side = 'pkg25d' | 'pkg3d' | null;

const sideInfo: Record<Exclude<Side, null>, { label: string; sub: string; desc: string; accent: string }> = {
    pkg25d: {
        label: '2.5D 패키징',
        sub: 'Side-by-Side on Interposer',
        desc: '실리콘 인터포저 위에 칩렛과 HBM을 나란히 배치한다. TSMC CoWoS가 대표 기술이며, NVIDIA H100 GPU가 이 방식으로 HBM을 연결한다.',
        accent: '#3b82f6',
    },
    pkg3d: {
        label: '3D 패키징',
        sub: 'Vertical Stacking with TSV',
        desc: 'DRAM 다이를 수직으로 적층하고 TSV(Through-Silicon Via)로 연결한다. HBM이 대표 사례이며, 기존 DDR 대비 수 배~수십 배의 메모리 대역폭을 달성한다.',
        accent: '#22c55e',
    },
};

/* ─── Geometry ─── */
const W = 620, H = 220;
const GAP = 40;
const BLOCK_W = (W - GAP) / 2 - 20;
const BLOCK_H = 150;
const BASE_Y = 20;

/* ─── 2.5D Section ─── */
function Section2_5D({ ox }: { ox: number }) {
    const cx = ox + BLOCK_W / 2;
    const pad = 8;
    /* Substrate */
    const subW = BLOCK_W - 2 * pad;
    const subH = 18;
    const subY = BASE_Y + BLOCK_H - pad - subH;
    const subX = cx - subW / 2;
    /* Interposer */
    const intpH = 14;
    const intpY = subY - intpH - 6;
    const intpW = subW - 10;
    const intpX = cx - intpW / 2;
    /* Chiplets on interposer */
    const chipletW = intpW * 0.35;
    const chipletH = 22;
    const chipletY = intpY - chipletH - 4;
    const hbmW = intpW * 0.2;
    const hbmH = 30;
    const hbmY = intpY - hbmH - 4;
    const chipX = intpX + 8;
    const hbmX = intpX + intpW - hbmW - 8;

    return (
        <g>
            {/* Package substrate */}
            <rect x={subX} y={subY} width={subW} height={subH} fill="#71717a" opacity={0.4} rx={2} />
            <text x={cx} y={subY + subH / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>패키지 기판</text>
            {/* Silicon interposer */}
            <rect x={intpX} y={intpY} width={intpW} height={intpH} fill="#3b82f6" opacity={0.35} rx={2} />
            <text x={cx} y={intpY + intpH / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill="#60a5fa">인터포저</text>
            {/* Chiplet */}
            <rect x={chipX} y={chipletY} width={chipletW} height={chipletH} fill="#f59e0b" opacity={0.6} rx={2} />
            <text x={chipX + chipletW / 2} y={chipletY + chipletH / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill="white" fontWeight={600}>GPU</text>
            {/* HBM stack */}
            <rect x={hbmX} y={hbmY} width={hbmW} height={hbmH} fill="#22c55e" opacity={0.5} rx={2} />
            <text x={hbmX + hbmW / 2} y={hbmY + hbmH / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill="white" fontWeight={600}>HBM</text>
            {/* TSV lines through interposer */}
            {[0.2, 0.4, 0.6, 0.8].map(t => (
                <line key={t} x1={intpX + t * intpW} y1={intpY} x2={intpX + t * intpW} y2={intpY + intpH}
                    stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="2,2" opacity={0.6} />
            ))}
            <text x={intpX + intpW + 6} y={intpY + intpH / 2 + 4} fontSize={FONT.min} fill="#f59e0b">TSV</text>
            {/* Solder balls under substrate */}
            {[0.15, 0.35, 0.5, 0.65, 0.85].map(t => (
                <circle key={t} cx={subX + t * subW} cy={subY + subH + 5} r={3} fill="#a1a1aa" opacity={0.4} />
            ))}
        </g>
    );
}

/* ─── 3D Section ─── */
function Section3D({ ox }: { ox: number }) {
    const cx = ox + BLOCK_W / 2;
    const pad = 8;
    /* Substrate */
    const subW = BLOCK_W - 2 * pad;
    const subH = 18;
    const subY = BASE_Y + BLOCK_H - pad - subH;
    const subX = cx - subW / 2;
    /* HBM stack — multiple DRAM dies */
    const dramCount = 5;
    const dramW = subW * 0.4;
    const dramH = 12;
    const dramGap = 3;
    const stackX = cx - dramW / 2;
    const stackBottomY = subY - 10;
    /* Logic die */
    const logicW = dramW + 20;
    const logicH = 14;
    const logicX = cx - logicW / 2;
    const logicY = stackBottomY - logicH;

    return (
        <g>
            {/* Package substrate */}
            <rect x={subX} y={subY} width={subW} height={subH} fill="#71717a" opacity={0.4} rx={2} />
            <text x={cx} y={subY + subH / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>패키지 기판</text>
            {/* Logic die base */}
            <rect x={logicX} y={logicY} width={logicW} height={logicH} fill="#3b82f6" opacity={0.4} rx={2} />
            <text x={cx} y={logicY + logicH / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill="#60a5fa">Base Logic</text>
            {/* DRAM stack */}
            {Array.from({ length: dramCount }).map((_, i) => {
                const dy = logicY - (i + 1) * (dramH + dramGap);
                return (
                    <rect key={i} x={stackX} y={dy} width={dramW} height={dramH} fill="#22c55e" opacity={0.35 + i * 0.08} rx={1} />
                );
            })}
            {/* TSV lines through stack */}
            {[0.3, 0.5, 0.7].map(t => {
                const topDie = logicY - dramCount * (dramH + dramGap);
                return (
                    <line key={t} x1={stackX + t * dramW} y1={logicY} x2={stackX + t * dramW} y2={topDie + dramH}
                        stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="2,2" opacity={0.6} />
                );
            })}
            {/* Labels */}
            <text x={stackX + dramW + 8} y={logicY - dramCount * (dramH + dramGap) / 2} fontSize={FONT.min} fill="#22c55e" fontWeight={600}>DRAM ×{dramCount}</text>
            <text x={stackX - 8} y={logicY - dramCount * (dramH + dramGap) / 2 + 14} textAnchor="end" fontSize={FONT.min} fill="#f59e0b">TSV</text>
            {/* Micro bumps between logic die and substrate */}
            {[0.25, 0.5, 0.75].map(t => (
                <circle key={`mb-${t}`} cx={logicX + t * logicW} cy={(logicY + logicH + subY) / 2} r={2.5} fill="#a1a1aa" opacity={0.5} />
            ))}
            {/* Solder balls */}
            {[0.15, 0.35, 0.5, 0.65, 0.85].map(t => (
                <circle key={t} cx={subX + t * subW} cy={subY + subH + 5} r={3} fill="#a1a1aa" opacity={0.4} />
            ))}
        </g>
    );
}

export default function Packaging2_5D3D() {
    const [hovered, setHovered] = useState<Side>(null);
    const leftOx = W / 2 - GAP / 2 - BLOCK_W;
    const rightOx = W / 2 + GAP / 2;
    const dim25 = hovered !== null && hovered !== 'pkg25d';
    const dim3d = hovered !== null && hovered !== 'pkg3d';

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                2.5D / 3D 패키징 구조 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Advanced Packaging — Interposer vs Vertical Stacking
            </p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 720, margin: '0 auto', display: 'block' }}>
                <line x1={W / 2} y1={BASE_Y + 10} x2={W / 2} y2={BASE_Y + BLOCK_H + 35} stroke="#3f3f46" strokeWidth={1} strokeDasharray="4,4" />

                <g onMouseEnter={() => setHovered('pkg25d')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: dim25 ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <Section2_5D ox={leftOx} />
                        <text x={leftOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 18} textAnchor="middle" fontSize={FONT.body} fill="#3b82f6" fontWeight={600}>2.5D (CoWoS)</text>
                        <text x={leftOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 32} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>나란히 배치</text>
                    </motion.g>
                </g>

                <g onMouseEnter={() => setHovered('pkg3d')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: dim3d ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                        <Section3D ox={rightOx} />
                        <text x={rightOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 18} textAnchor="middle" fontSize={FONT.body} fill="#22c55e" fontWeight={600}>3D (HBM)</text>
                        <text x={rightOx + BLOCK_W / 2} y={BASE_Y + BLOCK_H + 32} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>수직 적층</text>
                    </motion.g>
                </g>
            </svg>

            <AnimatePresence>
                {hovered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', maxWidth: 480, pointerEvents: 'none', zIndex: 10 }}>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: sideInfo[hovered].accent, marginBottom: 4 }}>
                            {sideInfo[hovered].label}
                            <span style={{ fontSize: FONT.min, fontWeight: 400, color: COLOR.textDim, marginLeft: 8 }}>{sideInfo[hovered].sub}</span>
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{sideInfo[hovered].desc}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
