'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 호버 데이터 ─── */
type NodeId = 'fdc' | 'mes' | 'metrology' | 'join' | 'result' | 'ch_time' | 'ch_id' | 'ch_sample' | 'ch_scale' | 'ch_history' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; desc: string; color: string }> = {
    fdc:      { label: 'FDC Summary', desc: '웨이퍼 단위. Wafer_ID, Equip_ID, Chamber, RF_Mean, Pressure_Avg 등 센서 통계값. 수만 행/일.', color: '#3b82f6' },
    mes:      { label: 'MES 이력', desc: '스텝 단위. Lot_ID, Wafer_No, Step, Equip_ID, 시작/종료 시간. ID 표기 불일치 문제 (L123456 vs LOT-123456).', color: '#ef4444' },
    metrology: { label: '계측 데이터', desc: '사이트 단위 (5~50점/웨이퍼). Wafer_ID, Site_X/Y, CD, OVL. 전체 웨이퍼의 5~10%만 존재 — 90% 누락.', color: '#22c55e' },
    join:     { label: 'Join (⋈)', desc: 'Wafer_ID, Equip_ID, Timestamp를 키로 3개 테이블을 결합. 데이터 과학자 시간의 60~80%가 이 작업에 소비된다.', color: '#f59e0b' },
    result:   { label: '통합 학습 테이블', desc: '(Wafer_ID, 센서 피처들, 장비 이력, CD 실측값) 형태. 전체의 5~10%만 완전한 행 — 나머지는 계측 누락.', color: '#a78bfa' },
    ch_time:  { label: '⏱ 시간 동기화', desc: '장비마다 내부 시계 오차 수 초. NTP로도 완전 동기화 불가. 매칭 실패나 잘못된 웨이퍼 연결 위험.', color: '#ef4444' },
    ch_id:    { label: '🆔 ID 불일치', desc: 'MES: "L123456", FDC: "LOT-123456", 계측: "123456". 웨이퍼 번호도 0-기반/1-기반 혼재.', color: '#f59e0b' },
    ch_sample: { label: '📉 샘플링 누락', desc: '전체 웨이퍼의 5~10%만 계측. 90%는 타겟 변수(CD) 없음. ML 학습 데이터가 극도로 제한.', color: '#3b82f6' },
    ch_scale: { label: '📐 공간 스케일', desc: 'FDC=웨이퍼 단위, 계측=사이트 단위, 결함=XY 좌표, 테스트=다이 단위. 스케일 간 매핑 필요.', color: '#22c55e' },
    ch_history: { label: '🔗 이력 추적', desc: '하나의 웨이퍼가 수십~수백 공정 단계를 거치며 다른 장비 사용. 전체 Process Genealogy 연결 필요.', color: '#a78bfa' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 620;
const SVG_H = 340;
const CX = SVG_W / 2;

/* 테이블 위치 */
const TABLE_W = 140;
const TABLE_H = 50;
const TABLE_Y = 30;
const TABLE_GAP = 30;
const TABLE_TOTAL = 3 * TABLE_W + 2 * TABLE_GAP;
const TABLE_START_X = (SVG_W - TABLE_TOTAL) / 2;

const TABLE_POS = [
    { id: 'fdc' as const, x: TABLE_START_X },
    { id: 'mes' as const, x: TABLE_START_X + TABLE_W + TABLE_GAP },
    { id: 'metrology' as const, x: TABLE_START_X + 2 * (TABLE_W + TABLE_GAP) },
];

/* Join 노드 */
const JOIN_Y = TABLE_Y + TABLE_H + 60;
const JOIN_R = 24;

/* 결과 테이블 */
const RESULT_Y = JOIN_Y + 60;
const RESULT_W = 240;
const RESULT_H = 40;

/* Challenge 뱃지 */
const BADGE_Y = RESULT_Y + RESULT_H + 30;
const BADGE_W = 100;
const BADGE_H = 32;
const BADGE_GAP = 16;
const CHALLENGES: Exclude<NodeId, null>[] = ['ch_time', 'ch_id', 'ch_sample', 'ch_scale', 'ch_history'];
const BADGES_TOTAL = CHALLENGES.length * BADGE_W + (CHALLENGES.length - 1) * BADGE_GAP;
const BADGE_START_X = (SVG_W - BADGES_TOTAL) / 2;

export default function DataMatchingJoin() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    const renderBox = (id: Exclude<NodeId, null>, x: number, y: number, w: number, h: number, rx = 8) => {
        const info = NODES[id];
        const active = hovered === id;
        const dimmed = isDimmed(id);
        return (
            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={x - 6} y={y - 4} width={w + 12} height={h + 8} fill="transparent" />
                <rect x={x} y={y} width={w} height={h} rx={rx}
                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle"
                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
            </motion.g>
        );
    };

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                이기종 데이터 매칭
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Heterogeneous Data Join — 5 Structural Challenges
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 620 }}>
                    {/* 테이블 → Join 화살표 */}
                    {TABLE_POS.map(t => (
                        <line key={`arr-${t.id}`} x1={t.x + TABLE_W / 2} y1={TABLE_Y + TABLE_H} x2={CX} y2={JOIN_Y - JOIN_R}
                            stroke={`${NODES[t.id].color}30`} strokeWidth={1} />
                    ))}
                    {/* Join → Result 화살표 */}
                    <line x1={CX} y1={JOIN_Y + JOIN_R} x2={CX} y2={RESULT_Y}
                        stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
                    <polygon points={`${CX},${RESULT_Y} ${CX - 5},${RESULT_Y - 8} ${CX + 5},${RESULT_Y - 8}`}
                        fill="rgba(255,255,255,0.2)" />

                    {/* 테이블 박스 */}
                    {TABLE_POS.map(t => renderBox(t.id, t.x, TABLE_Y, TABLE_W, TABLE_H))}

                    {/* Join 원 */}
                    <motion.g onMouseEnter={() => setHovered('join')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('join') ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                        <circle cx={CX} cy={JOIN_Y} r={JOIN_R + 6} fill="transparent" />
                        <circle cx={CX} cy={JOIN_Y} r={JOIN_R}
                            fill={hovered === 'join' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)'}
                            stroke={hovered === 'join' ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'} strokeWidth={1.5} />
                        <text x={CX} y={JOIN_Y + 5} textAnchor="middle"
                            fill={hovered === 'join' ? '#f59e0b' : COLOR.textMuted} fontSize={FONT.body} fontWeight={700}>⋈</text>
                    </motion.g>

                    {/* 결과 테이블 */}
                    {renderBox('result', CX - RESULT_W / 2, RESULT_Y, RESULT_W, RESULT_H)}

                    {/* Challenge 뱃지 */}
                    {CHALLENGES.map((id, i) => {
                        const x = BADGE_START_X + i * (BADGE_W + BADGE_GAP);
                        return renderBox(id, x, BADGE_Y, BADGE_W, BADGE_H, 6);
                    })}
                </svg>
            </div>

            {/* 툴팁 */}
            <div style={{ maxWidth: 640, margin: '12px auto 0', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: NODES[hovered].color, marginBottom: 2 }}>{NODES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{NODES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 요소를 호버하여 데이터 매칭의 구조와 5가지 어려움을 확인하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
