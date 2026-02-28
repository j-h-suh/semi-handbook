'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type ProfileId = 'ideal' | 'bowing' | 'taper' | 'notching' | null;

interface ProfileInfo {
    label: string;
    sub: string;
    desc: string;
    accent: string;
}

const profileInfo: Record<Exclude<ProfileId, null>, ProfileInfo> = {
    ideal: { label: '이상적 (Ideal)', sub: '완벽한 수직 90°', desc: '측벽이 완벽하게 수직인 이상적 프로파일. 이온의 수직 가속과 화학적 패시베이션이 균형을 이루면 달성할 수 있다. CD 오차 최소화의 핵심 조건이다.', accent: '#22c55e' },
    bowing: { label: '보잉 (Bowing)', sub: '측벽 볼록 변형', desc: '트렌치 중간부 측벽이 바깥으로 볼록하게 휘는 현상. 입사 이온이 마스크 가장자리에서 산란되어 측벽 중간부를 추가로 깎아내기 때문에 발생한다. 고종횡비 식각에서 빈번하다.', accent: '#ef4444' },
    taper: { label: '테이퍼 (Taper)', sub: '경사진 측벽 < 90°', desc: '트렌치가 아래로 갈수록 좁아지는 경사 프로파일. 식각 부산물의 재증착(Redeposition)이 측벽 하단에 집중되거나, 이온 에너지가 부족할 때 발생한다.', accent: '#f59e0b' },
    notching: { label: '노칭 (Notching)', sub: '바닥부 과식각', desc: '트렌치 바닥 모서리가 과도하게 파이는 현상. 하부 절연층에 축적된 전하가 이온 궤적을 편향시켜 바닥 모서리를 추가로 깎는다. 특히 SOI 웨이퍼에서 빈번하게 발생한다.', accent: '#8b5cf6' },
};

/* ─── Geometry ─── */
const W = 640, H = 260;
const COL_W = W / 4;
const MASK_H = 14, MASK_W = 28;
const TRENCH_W = 44, TRENCH_H = 110;
const MAT_W = MASK_W;
const BASE_Y = 55;

function IdealTrench({ cx }: { cx: number }) {
    const maskY = BASE_Y;
    const tTop = maskY + MASK_H;
    return (
        <g>
            <rect x={cx - MAT_W - TRENCH_W / 2} y={tTop} width={MAT_W} height={TRENCH_H} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={cx + TRENCH_W / 2} y={tTop} width={MAT_W} height={TRENCH_H} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={cx - TRENCH_W / 2} y={tTop} width={TRENCH_W} height={TRENCH_H} fill="#18181b" stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={cx - MAT_W - TRENCH_W / 2} y={maskY} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <rect x={cx + TRENCH_W / 2} y={maskY} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            {/* 90° marker */}
            <path d={`M${cx - TRENCH_W / 2},${tTop + TRENCH_H - 8} h8 v8`} fill="none" stroke="#22c55e" strokeWidth={1} />
            <text x={cx} y={tTop + TRENCH_H + 16} textAnchor="middle" fontSize={FONT.min} fill="#22c55e" fontWeight={600}>✓ 수직</text>
        </g>
    );
}

function BowingTrench({ cx }: { cx: number }) {
    const maskY = BASE_Y;
    const tTop = maskY + MASK_H;
    const left = cx - TRENCH_W / 2;
    const right = cx + TRENCH_W / 2;
    const bot = tTop + TRENCH_H;
    const bow = 12;
    return (
        <g>
            <rect x={cx - MAT_W - TRENCH_W / 2} y={tTop} width={MAT_W + bow} height={TRENCH_H} fill="#3b82f6" opacity={0.2} />
            <rect x={right - bow} y={tTop} width={MAT_W + bow} height={TRENCH_H} fill="#3b82f6" opacity={0.2} />
            <path d={`M${left},${tTop} Q${left - bow},${tTop + TRENCH_H / 2} ${left},${bot} H${right} Q${right + bow},${tTop + TRENCH_H / 2} ${right},${tTop} Z`} fill="#18181b" stroke="#ef4444" strokeWidth={1} />
            <path d={`M${left},${tTop} Q${left - bow},${tTop + TRENCH_H / 2} ${left},${bot}`} fill="none" stroke="#ef4444" strokeWidth={2} opacity={0.6} />
            <path d={`M${right},${tTop} Q${right + bow},${tTop + TRENCH_H / 2} ${right},${bot}`} fill="none" stroke="#ef4444" strokeWidth={2} opacity={0.6} />
            <rect x={cx - MAT_W - TRENCH_W / 2} y={maskY} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <rect x={cx + TRENCH_W / 2} y={maskY} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <text x={cx} y={tTop + TRENCH_H / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill="#ef4444">← →</text>
            <text x={cx} y={tTop + TRENCH_H + 16} textAnchor="middle" fontSize={FONT.min} fill="#ef4444" fontWeight={600}>✗ 볼록</text>
        </g>
    );
}

function TaperTrench({ cx }: { cx: number }) {
    const maskY = BASE_Y;
    const tTop = maskY + MASK_H;
    const bot = tTop + TRENCH_H;
    const taper = 12;
    const left = cx - TRENCH_W / 2;
    const right = cx + TRENCH_W / 2;
    return (
        <g>
            <path d={`M${left - MAT_W},${tTop} H${left} L${left + taper},${bot} H${left - MAT_W} Z`} fill="#3b82f6" opacity={0.2} />
            <path d={`M${right},${tTop} H${right + MAT_W} V${bot} H${right - taper} Z`} fill="#3b82f6" opacity={0.2} />
            <path d={`M${left},${tTop} L${left + taper},${bot} H${right - taper} L${right},${tTop} Z`} fill="#18181b" stroke="#f59e0b" strokeWidth={1} />
            <path d={`M${left},${tTop} L${left + taper},${bot}`} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.6} />
            <path d={`M${right},${tTop} L${right - taper},${bot}`} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.6} />
            <rect x={left - MAT_W} y={maskY} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <rect x={right} y={maskY} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <text x={left - 4} y={tTop + 30} textAnchor="end" fontSize={FONT.min} fill="#f59e0b">&lt;90°</text>
            <text x={cx} y={tTop + TRENCH_H + 16} textAnchor="middle" fontSize={FONT.min} fill="#f59e0b" fontWeight={600}>✗ 경사</text>
        </g>
    );
}

function NotchingTrench({ cx }: { cx: number }) {
    const maskY = BASE_Y;
    const tTop = maskY + MASK_H;
    const bot = tTop + TRENCH_H;
    const left = cx - TRENCH_W / 2;
    const right = cx + TRENCH_W / 2;
    const nr = 10;
    return (
        <g>
            <rect x={left - MAT_W} y={tTop} width={MAT_W} height={TRENCH_H} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={right} y={tTop} width={MAT_W} height={TRENCH_H} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={left} y={tTop} width={TRENCH_W} height={TRENCH_H} fill="#18181b" stroke="#3b82f6" strokeWidth={0.8} />
            {/* Notch at bottom corners */}
            <path d={`M${left},${bot} Q${left - nr},${bot} ${left - nr},${bot - nr} L${left},${bot - nr} Z`} fill="#18181b" stroke="#8b5cf6" strokeWidth={1.2} />
            <path d={`M${right},${bot} Q${right + nr},${bot} ${right + nr},${bot - nr} L${right},${bot - nr} Z`} fill="#18181b" stroke="#8b5cf6" strokeWidth={1.2} />
            <rect x={left - MAT_W} y={maskY} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <rect x={right} y={maskY} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <text x={cx} y={tTop + TRENCH_H + 16} textAnchor="middle" fontSize={FONT.min} fill="#8b5cf6" fontWeight={600}>✗ 노치</text>
        </g>
    );
}

const profiles: { id: Exclude<ProfileId, null>; render: (cx: number) => React.ReactNode }[] = [
    { id: 'ideal', render: (cx) => <IdealTrench cx={cx} /> },
    { id: 'bowing', render: (cx) => <BowingTrench cx={cx} /> },
    { id: 'taper', render: (cx) => <TaperTrench cx={cx} /> },
    { id: 'notching', render: (cx) => <NotchingTrench cx={cx} /> },
];

export default function EtchProfileDefects() {
    const [hovered, setHovered] = useState<ProfileId>(null);

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                식각 프로파일 이상 유형
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Etch Profile Defects — Ideal vs Bowing vs Taper vs Notching
            </p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 740, margin: '0 auto', display: 'block' }}>
                {/* Column dividers */}
                {[1, 2, 3].map(i => <line key={i} x1={COL_W * i} y1={35} x2={COL_W * i} y2={H - 20} stroke="#3f3f46" strokeWidth={0.5} strokeDasharray="3,3" />)}

                {profiles.map((p, i) => {
                    const cx = COL_W * i + COL_W / 2;
                    const dimmed = hovered !== null && hovered !== p.id;
                    return (
                        <g key={p.id} onMouseEnter={() => setHovered(p.id)} style={{ cursor: 'pointer' }}>
                            <motion.g animate={{ opacity: dimmed ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                                {/* Column header */}
                                <text x={cx} y={45} textAnchor="middle" fontSize={FONT.body} fill={profileInfo[p.id].accent} fontWeight={600}>
                                    {profileInfo[p.id].label}
                                </text>
                                {p.render(cx)}
                            </motion.g>
                        </g>
                    );
                })}

                {/* Legend */}
                <g transform={`translate(${W / 2 - 100}, ${H - 14})`}>
                    <rect x={0} y={0} width={10} height={8} fill="#52525b" rx={1} />
                    <text x={14} y={8} fontSize={FONT.min} fill={COLOR.textDim}>Mask</text>
                    <rect x={60} y={0} width={10} height={8} fill="#3b82f6" opacity={0.3} rx={1} />
                    <text x={74} y={8} fontSize={FONT.min} fill={COLOR.textDim}>Material</text>
                    <rect x={140} y={0} width={10} height={8} fill="#18181b" stroke="#3f3f46" strokeWidth={0.5} rx={1} />
                    <text x={154} y={8} fontSize={FONT.min} fill={COLOR.textDim}>Etched</text>
                </g>
            </svg>

            <AnimatePresence>
                {hovered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', maxWidth: 460, pointerEvents: 'none', zIndex: 10 }}>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: profileInfo[hovered].accent, marginBottom: 4 }}>
                            {profileInfo[hovered].label}
                            <span style={{ fontSize: FONT.min, fontWeight: 400, color: COLOR.textDim, marginLeft: 8 }}>{profileInfo[hovered].sub}</span>
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{profileInfo[hovered].desc}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
