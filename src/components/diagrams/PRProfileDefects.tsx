'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 프로파일 데이터 ─── */
type ProfileId = 'ideal' | 'ttopping' | 'footing' | 'rounding' | 'taper' | 'reverse_taper' | null;

interface ProfileInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const PROFILES: Record<Exclude<ProfileId, null>, ProfileInfo> = {
    ideal: { label: '이상적', sub: '90° 수직 측벽', desc: '완벽한 수직 프로파일. 마스크 패턴이 그대로 전사. 현실에서는 다양한 이상이 발생하여 이 프로파일에서 벗어난다.', color: '#22c55e' },
    ttopping: { label: 'T-topping', sub: '상단 돌출 (T자)', desc: '대기 중 아민(Amine)이 레지스트 표면의 산(Acid)을 중화시켜, 표면의 보호기가 제거되지 않아 녹지 않는다. 상단이 양 옆으로 튀어나와 T자 형태.', color: '#ef4444' },
    footing: { label: 'Footing', sub: '하단 확장', desc: '기판(질화물 등)에서 방출되는 아민이 레지스트 바닥의 산을 중화시켜 발생. 바닥이 넓어져 식각 전사 오차의 원인.', color: '#f59e0b' },
    rounding: { label: 'Rounding', sub: '상단 둥글어짐', desc: '패턴 상단 모서리가 둥글어지는 현상. 과도한 Dose나 PEB 조건에 의해 발생. 이후 식각에서 패턴 전사 정확도 저하.', color: '#8b5cf6' },
    taper: { label: 'Taper', sub: '경사 측벽 (상단 좁음)', desc: '현상 시간이 길거나 Dose가 과도할 때 상단이 더 많이 깎여 사다리꼴 형태. 측벽 각도가 90°보다 작아져 패턴 CD가 좁아진다.', color: '#06b6d4' },
    reverse_taper: { label: 'Reverse Taper', sub: '역경사 (하단 좁음)', desc: '현상 부족이나 Dose 부족 시 하단이 덜 반응하여 역사다리꼴 형태. 식각 시 리프트오프(Lift-off) 문제를 유발한다.', color: '#ec4899' },
};

const PROFILE_ORDER: Exclude<ProfileId, null>[] = ['ideal', 'ttopping', 'footing', 'rounding', 'taper', 'reverse_taper'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 720;
const SVG_H = 170;
const PANEL_W = 95;
const PANEL_GAP = 14;
const TOTAL_W = PANEL_W * 6 + PANEL_GAP * 5;
const START_X = (SVG_W - TOTAL_W) / 2;

const SUB_Y = 120;
const SUB_H = 16;
const PR_BOT = SUB_Y;
const PR_H = 70;
const PR_TOP = PR_BOT - PR_H;
const PR_W = 40;

function ProfileShape({ cx, type, color, active }: { cx: number; type: Exclude<ProfileId, null>; color: string; active: boolean }) {
    const fill = active ? `${color}30` : `${color}15`;
    const stroke = active ? color : `${color}60`;
    const halfW = PR_W / 2;

    const paths: Record<string, string> = {
        ideal: `M${cx - halfW},${PR_BOT} L${cx - halfW},${PR_TOP} L${cx + halfW},${PR_TOP} L${cx + halfW},${PR_BOT} Z`,
        ttopping: `M${cx - halfW},${PR_BOT} L${cx - halfW},${PR_TOP + 10} L${cx - halfW - 8},${PR_TOP + 10} L${cx - halfW - 8},${PR_TOP} L${cx + halfW + 8},${PR_TOP} L${cx + halfW + 8},${PR_TOP + 10} L${cx + halfW},${PR_TOP + 10} L${cx + halfW},${PR_BOT} Z`,
        footing: `M${cx - halfW - 10},${PR_BOT} Q${cx - halfW - 10},${PR_BOT - 15} ${cx - halfW},${PR_BOT - 15} L${cx - halfW},${PR_TOP} L${cx + halfW},${PR_TOP} L${cx + halfW},${PR_BOT - 15} Q${cx + halfW + 10},${PR_BOT - 15} ${cx + halfW + 10},${PR_BOT} Z`,
        rounding: `M${cx - halfW},${PR_BOT} L${cx - halfW},${PR_TOP + 12} Q${cx - halfW},${PR_TOP} ${cx - halfW + 12},${PR_TOP} L${cx + halfW - 12},${PR_TOP} Q${cx + halfW},${PR_TOP} ${cx + halfW},${PR_TOP + 12} L${cx + halfW},${PR_BOT} Z`,
        taper: `M${cx - halfW},${PR_BOT} L${cx - halfW + 8},${PR_TOP} L${cx + halfW - 8},${PR_TOP} L${cx + halfW},${PR_BOT} Z`,
        reverse_taper: `M${cx - halfW + 8},${PR_BOT} L${cx - halfW},${PR_TOP} L${cx + halfW},${PR_TOP} L${cx + halfW - 8},${PR_BOT} Z`,
    };

    return (
        <path d={paths[type]} fill={fill} stroke={stroke} strokeWidth={1.2} />
    );
}

export default function PRProfileDefects() {
    const [hovered, setHovered] = useState<ProfileId>(null);
    const isDimmed = (id: Exclude<ProfileId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                현상 후 프로파일 이상 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                PR Profile Defects — T-topping, Footing, Rounding, Taper
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(SVG_W, 720)} style={{ maxWidth: '100%' }}>
                    {PROFILE_ORDER.map((id, i) => {
                        const x = START_X + i * (PANEL_W + PANEL_GAP);
                        const cx = x + PANEL_W / 2;
                        const info = PROFILES[id];
                        const active = hovered === id;

                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDimmed(id) ? 0.2 : 1 }} transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                <rect x={x} y={0} width={PANEL_W} height={SVG_H} fill="transparent" />

                                {/* 기판 */}
                                <rect x={x + 4} y={SUB_Y} width={PANEL_W - 8} height={SUB_H} rx={2}
                                    fill="rgba(113,113,122,0.12)" stroke="rgba(113,113,122,0.25)" strokeWidth={0.5} />

                                {/* 프로파일 형태 */}
                                <ProfileShape cx={cx} type={id} color={info.color} active={active} />

                                {/* 라벨 */}
                                <text x={cx} y={PR_TOP - 10} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>
                                    {info.label}
                                </text>
                                <text x={cx} y={SUB_Y + SUB_H + 14} textAnchor="middle"
                                    fill={COLOR.textDim} fontSize={FONT.min}>
                                    {info.sub}
                                </text>

                                {/* 이상적 체크/결함 X */}
                                {id === 'ideal' ? (
                                    <text x={cx} y={PR_TOP + PR_H / 2 + 4} textAnchor="middle"
                                        fill="rgba(34,197,94,0.5)" fontSize={FONT.body}>✓</text>
                                ) : (
                                    <text x={cx} y={PR_TOP + PR_H / 2 + 4} textAnchor="middle"
                                        fill="rgba(239,68,68,0.3)" fontSize={FONT.body}>✕</text>
                                )}
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: PROFILES[hovered].color, marginBottom: 2 }}>
                                {PROFILES[hovered].label} — {PROFILES[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {PROFILES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 프로파일을 호버하세요. 이상적 수직 프로파일과 결함 유형을 비교합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
