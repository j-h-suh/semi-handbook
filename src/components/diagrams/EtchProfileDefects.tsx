'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type ProfileId = 'ideal' | 'bowing' | 'taper' | 'notching' | 'undercut' | 'microtrenching' | 'reentrant' | null;

interface ProfileInfo {
    label: string;
    sub: string;
    desc: string;
    accent: string;
}

const PROFILES: Record<Exclude<ProfileId, null>, ProfileInfo> = {
    ideal: { label: '이상적 (Ideal)', sub: '완벽한 수직 90°', desc: '측벽이 완벽하게 수직인 이상적 프로파일. 이온의 수직 가속과 화학적 패시베이션이 균형을 이루면 달성할 수 있다. CD 오차 최소화의 핵심 조건이다.', accent: '#22c55e' },
    bowing: { label: '보잉 (Bowing)', sub: '측벽 볼록 변형', desc: '트렌치 중간부 측벽이 바깥으로 볼록하게 휘는 현상. 입사 이온이 마스크 가장자리에서 산란되어 측벽 중간부를 추가로 깎아내기 때문에 발생한다. 고종횡비 식각에서 빈번하다.', accent: '#ef4444' },
    taper: { label: '테이퍼 (Taper)', sub: '경사진 측벽 < 90°', desc: '트렌치가 아래로 갈수록 좁아지는 경사 프로파일. 식각 부산물의 재증착(Redeposition)이 측벽 하단에 집중되거나, 이온 에너지가 부족할 때 발생한다.', accent: '#f59e0b' },
    notching: { label: '노칭 (Notching)', sub: '바닥부 과식각', desc: '트렌치 바닥 모서리가 과도하게 파이는 현상. 하부 절연층에 축적된 전하가 이온 궤적을 편향시켜 바닥 모서리를 추가로 깎는다. 특히 SOI 웨이퍼에서 빈번하게 발생한다.', accent: '#8b5cf6' },
    undercut: { label: '언더컷 (Undercut)', sub: '마스크 하부 침식', desc: '등방성 식각 성분에 의해 마스크 아래로 수평 방향 침식이 발생하는 현상. 화학적 식각이 과도하거나 패시베이션이 부족할 때 나타난다. 유효 CD가 설계값보다 넓어지는 원인이다.', accent: '#06b6d4' },
    microtrenching: { label: '마이크로 트렌칭', sub: 'Micro-trenching', desc: '트렌치 바닥의 가장자리가 중앙보다 더 깊이 파이는 현상. 이온이 측벽에서 반사(Reflection)되어 바닥 모서리에 집중되기 때문이다. 높은 이온 에너지와 수직 측벽에서 두드러진다.', accent: '#ec4899' },
    reentrant: { label: '역테이퍼 (Re-entrant)', sub: '역경사 측벽 > 90°', desc: '트렌치가 아래로 갈수록 넓어지는 역경사 프로파일. 측벽 패시베이션이 과도하거나 이온 산란이 하부에 집중될 때 발생한다. 의도적으로 리프트오프(Lift-off) 공정에 활용되기도 한다.', accent: '#f97316' },
};

/* ─── Geometry ─── */
const W = 640, H = 400;
const COL_W = W / 4;
const MASK_H = 14, MAT_W = 26;
const TW = 40, TH = 95;
const ROW1_Y = 50, ROW2_Y = 230;
const ROW2_X = (W - 3 * COL_W) / 2;

interface TP { cx: number; by: number }

/* ─── Trench Components ─── */

function IdealTrench({ cx, by }: TP) {
    const tTop = by + MASK_H;
    const left = cx - TW / 2, right = cx + TW / 2;
    return (
        <g>
            <rect x={left - MAT_W} y={tTop} width={MAT_W} height={TH} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={right} y={tTop} width={MAT_W} height={TH} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={left} y={tTop} width={TW} height={TH} fill="#18181b" stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={left - MAT_W} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <rect x={right} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <path d={`M${left},${tTop + TH - 8} h8 v8`} fill="none" stroke="#22c55e" strokeWidth={1} />
            <text x={cx} y={tTop + TH + 16} textAnchor="middle" fontSize={FONT.min} fill="#22c55e" fontWeight={600}>&#10003; 수직</text>
        </g>
    );
}

function BowingTrench({ cx, by }: TP) {
    const tTop = by + MASK_H;
    const left = cx - TW / 2, right = cx + TW / 2, bot = tTop + TH;
    const bow = 10;
    return (
        <g>
            <rect x={left - MAT_W} y={tTop} width={MAT_W + bow} height={TH} fill="#3b82f6" opacity={0.2} />
            <rect x={right - bow} y={tTop} width={MAT_W + bow} height={TH} fill="#3b82f6" opacity={0.2} />
            <path d={`M${left},${tTop} Q${left - bow},${tTop + TH / 2} ${left},${bot} H${right} Q${right + bow},${tTop + TH / 2} ${right},${tTop} Z`} fill="#18181b" stroke="#ef4444" strokeWidth={1} />
            <path d={`M${left},${tTop} Q${left - bow},${tTop + TH / 2} ${left},${bot}`} fill="none" stroke="#ef4444" strokeWidth={2} opacity={0.6} />
            <path d={`M${right},${tTop} Q${right + bow},${tTop + TH / 2} ${right},${bot}`} fill="none" stroke="#ef4444" strokeWidth={2} opacity={0.6} />
            <rect x={left - MAT_W} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <rect x={right} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <text x={cx} y={tTop + TH / 2 + 4} textAnchor="middle" fontSize={FONT.min} fill="#ef4444">&larr; &rarr;</text>
            <text x={cx} y={tTop + TH + 16} textAnchor="middle" fontSize={FONT.min} fill="#ef4444" fontWeight={600}>&#10007; 볼록</text>
        </g>
    );
}

function TaperTrench({ cx, by }: TP) {
    const tTop = by + MASK_H;
    const bot = tTop + TH;
    const left = cx - TW / 2, right = cx + TW / 2;
    const taper = 10;
    return (
        <g>
            <path d={`M${left - MAT_W},${tTop} H${left} L${left + taper},${bot} H${left - MAT_W} Z`} fill="#3b82f6" opacity={0.2} />
            <path d={`M${right},${tTop} H${right + MAT_W} V${bot} H${right - taper} Z`} fill="#3b82f6" opacity={0.2} />
            <path d={`M${left},${tTop} L${left + taper},${bot} H${right - taper} L${right},${tTop} Z`} fill="#18181b" stroke="#f59e0b" strokeWidth={1} />
            <path d={`M${left},${tTop} L${left + taper},${bot}`} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.6} />
            <path d={`M${right},${tTop} L${right - taper},${bot}`} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.6} />
            <rect x={left - MAT_W} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <rect x={right} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <text x={left - 4} y={tTop + 26} textAnchor="end" fontSize={FONT.min} fill="#f59e0b">&lt;90&deg;</text>
            <text x={cx} y={tTop + TH + 16} textAnchor="middle" fontSize={FONT.min} fill="#f59e0b" fontWeight={600}>&#10007; 경사</text>
        </g>
    );
}

function NotchingTrench({ cx, by }: TP) {
    const tTop = by + MASK_H;
    const bot = tTop + TH;
    const left = cx - TW / 2, right = cx + TW / 2;
    const nr = 9;
    return (
        <g>
            <rect x={left - MAT_W} y={tTop} width={MAT_W} height={TH} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={right} y={tTop} width={MAT_W} height={TH} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={left} y={tTop} width={TW} height={TH} fill="#18181b" stroke="#3b82f6" strokeWidth={0.8} />
            <path d={`M${left},${bot} Q${left - nr},${bot} ${left - nr},${bot - nr} L${left},${bot - nr} Z`} fill="#18181b" stroke="#8b5cf6" strokeWidth={1.2} />
            <path d={`M${right},${bot} Q${right + nr},${bot} ${right + nr},${bot - nr} L${right},${bot - nr} Z`} fill="#18181b" stroke="#8b5cf6" strokeWidth={1.2} />
            <rect x={left - MAT_W} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <rect x={right} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <text x={cx} y={tTop + TH + 16} textAnchor="middle" fontSize={FONT.min} fill="#8b5cf6" fontWeight={600}>&#10007; 노치</text>
        </g>
    );
}

function UndercutTrench({ cx, by }: TP) {
    const tTop = by + MASK_H;
    const left = cx - TW / 2, right = cx + TW / 2;
    const uc = 8;
    return (
        <g>
            <rect x={left - MAT_W - uc} y={tTop} width={MAT_W + uc} height={TH} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={right} y={tTop} width={MAT_W + uc} height={TH} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={left - uc} y={tTop} width={TW + 2 * uc} height={TH} fill="#18181b" stroke="#06b6d4" strokeWidth={0.8} />
            <rect x={left - MAT_W} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <rect x={right} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            {/* Undercut dimension lines */}
            <line x1={left - uc} y1={tTop + 8} x2={left} y2={tTop + 8} stroke="#06b6d4" strokeWidth={1.5} />
            <line x1={right} y1={tTop + 8} x2={right + uc} y2={tTop + 8} stroke="#06b6d4" strokeWidth={1.5} />
            {/* Mask edge projection */}
            <line x1={left} y1={tTop} x2={left} y2={tTop + 20} stroke="#06b6d4" strokeWidth={0.5} strokeDasharray="2,2" opacity={0.5} />
            <line x1={right} y1={tTop} x2={right} y2={tTop + 20} stroke="#06b6d4" strokeWidth={0.5} strokeDasharray="2,2" opacity={0.5} />
            <text x={cx} y={tTop + TH + 16} textAnchor="middle" fontSize={FONT.min} fill="#06b6d4" fontWeight={600}>&#10007; 침식</text>
        </g>
    );
}

function MicrotrenchingTrench({ cx, by }: TP) {
    const tTop = by + MASK_H;
    const left = cx - TW / 2, right = cx + TW / 2;
    const mainBot = tTop + TH - 14;
    const fullBot = tTop + TH;
    const mtW = 10;
    return (
        <g>
            {/* Side material */}
            <rect x={left - MAT_W} y={tTop} width={MAT_W} height={TH} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={right} y={tTop} width={MAT_W} height={TH} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={0.8} />
            {/* Bottom material strip */}
            <rect x={left} y={mainBot} width={TW} height={fullBot - mainBot} fill="#3b82f6" opacity={0.15} />
            {/* Main trench */}
            <rect x={left} y={tTop} width={TW} height={mainBot - tTop} fill="#18181b" stroke="#3b82f6" strokeWidth={0.8} />
            {/* Micro-trench grooves */}
            <path d={`M${left},${mainBot} L${left + mtW},${mainBot} L${left},${fullBot} Z`} fill="#18181b" stroke="#ec4899" strokeWidth={1.2} />
            <path d={`M${right - mtW},${mainBot} L${right},${mainBot} L${right},${fullBot} Z`} fill="#18181b" stroke="#ec4899" strokeWidth={1.2} />
            {/* Mask */}
            <rect x={left - MAT_W} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <rect x={right} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            {/* Reflection arrows */}
            <path d={`M${left + 3},${mainBot - 20} L${left + 3},${mainBot - 8} L${left + 6},${mainBot - 2}`} fill="none" stroke="#ec4899" strokeWidth={1} opacity={0.6} />
            <path d={`M${right - 3},${mainBot - 20} L${right - 3},${mainBot - 8} L${right - 6},${mainBot - 2}`} fill="none" stroke="#ec4899" strokeWidth={1} opacity={0.6} />
            <text x={cx} y={fullBot + 16} textAnchor="middle" fontSize={FONT.min} fill="#ec4899" fontWeight={600}>&#10007; 홈</text>
        </g>
    );
}

function ReentrantTrench({ cx, by }: TP) {
    const tTop = by + MASK_H;
    const bot = tTop + TH;
    const left = cx - TW / 2, right = cx + TW / 2;
    const spread = 10;
    return (
        <g>
            <path d={`M${left - MAT_W},${tTop} H${left} L${left - spread},${bot} H${left - MAT_W} Z`} fill="#3b82f6" opacity={0.2} />
            <path d={`M${right},${tTop} H${right + MAT_W} V${bot} H${right + spread} Z`} fill="#3b82f6" opacity={0.2} />
            <path d={`M${left},${tTop} L${left - spread},${bot} H${right + spread} L${right},${tTop} Z`} fill="#18181b" stroke="#f97316" strokeWidth={1} />
            <path d={`M${left},${tTop} L${left - spread},${bot}`} fill="none" stroke="#f97316" strokeWidth={2} opacity={0.6} />
            <path d={`M${right},${tTop} L${right + spread},${bot}`} fill="none" stroke="#f97316" strokeWidth={2} opacity={0.6} />
            <rect x={left - MAT_W} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <rect x={right} y={by} width={MAT_W} height={MASK_H} fill="#52525b" rx={1} />
            <text x={right + 6} y={tTop + 26} fontSize={FONT.min} fill="#f97316">&gt;90&deg;</text>
            <text x={cx} y={tTop + TH + 16} textAnchor="middle" fontSize={FONT.min} fill="#f97316" fontWeight={600}>&#10007; 역경사</text>
        </g>
    );
}

/* ─── Render Map ─── */

const RENDERERS: Record<Exclude<ProfileId, null>, (cx: number, by: number) => React.ReactNode> = {
    ideal: (cx, by) => <IdealTrench cx={cx} by={by} />,
    bowing: (cx, by) => <BowingTrench cx={cx} by={by} />,
    taper: (cx, by) => <TaperTrench cx={cx} by={by} />,
    notching: (cx, by) => <NotchingTrench cx={cx} by={by} />,
    undercut: (cx, by) => <UndercutTrench cx={cx} by={by} />,
    microtrenching: (cx, by) => <MicrotrenchingTrench cx={cx} by={by} />,
    reentrant: (cx, by) => <ReentrantTrench cx={cx} by={by} />,
};

const ROW1: Exclude<ProfileId, null>[] = ['ideal', 'bowing', 'taper', 'notching'];
const ROW2: Exclude<ProfileId, null>[] = ['undercut', 'microtrenching', 'reentrant'];

export default function EtchProfileDefects() {
    const [hovered, setHovered] = useState<ProfileId>(null);

    const renderItem = (id: Exclude<ProfileId, null>, cx: number, by: number) => {
        const dimmed = hovered !== null && hovered !== id;
        const info = PROFILES[id];
        return (
            <g key={id} onMouseEnter={() => setHovered(id)} style={{ cursor: 'pointer' }}>
                <motion.g animate={{ opacity: dimmed ? 0.3 : 1 }} transition={{ duration: 0.2 }}>
                    <text x={cx} y={by - 10} textAnchor="middle" fontSize={FONT.body} fill={info.accent} fontWeight={600}>
                        {info.label}
                    </text>
                    {RENDERERS[id](cx, by)}
                </motion.g>
            </g>
        );
    };

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                식각 프로파일 이상 유형
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Etch Profile Defects — 이상적 프로파일과 6가지 결함 유형
            </p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 740, margin: '0 auto', display: 'block' }}>
                {/* Row 1 */}
                {ROW1.map((id, i) => renderItem(id, COL_W * i + COL_W / 2, ROW1_Y))}

                {/* Row divider */}
                <line x1={60} y1={198} x2={W - 60} y2={198} stroke="#3f3f46" strokeWidth={0.5} strokeDasharray="3,3" />

                {/* Row 2 (centered) */}
                {ROW2.map((id, i) => renderItem(id, ROW2_X + COL_W * i + COL_W / 2, ROW2_Y))}

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
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: PROFILES[hovered].accent, marginBottom: 4 }}>
                            {PROFILES[hovered].label}
                            <span style={{ fontSize: FONT.min, fontWeight: 400, color: COLOR.textDim, marginLeft: 8 }}>{PROFILES[hovered].sub}</span>
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{PROFILES[hovered].desc}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
