'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 버전 데이터 ─── */
type VersionId = 'v10' | 'v11' | 'v20' | 'v21' | null;

const VERSIONS: Record<Exclude<VersionId, null>, { label: string; date: string; r2: string; train: string; status: string; statusColor: string; desc: string }> = {
    v10: { label: 'v1.0', date: '01-15', r2: '0.82', train: 'Jan W1-2', status: 'Archived', statusColor: '#71717a', desc: '초기 모델. Jan W1-2 데이터로 학습. 기본 성능 확보.' },
    v11: { label: 'v1.1', date: '01-29', r2: '0.85', train: 'Jan W1-4', status: 'Archived', statusColor: '#71717a', desc: '2주간 추가 데이터로 재학습. R² 0.03 개선. 롤백 대상.' },
    v20: { label: 'v2.0', date: '02-12', r2: '0.88', train: 'Jan W3~Feb W2', status: 'Production ✅', statusColor: '#22c55e', desc: '현재 프로덕션. Sliding Window로 최근 4주 데이터 학습. 최고 성능.' },
    v21: { label: 'v2.1', date: '02-14', r2: '0.87', train: 'Feb W1-2', status: 'Staging', statusColor: '#f59e0b', desc: '검증 중. Shadow 테스트 병렬 실행. 통과 시 Production 승격.' },
};

const VER_ORDER: Exclude<VersionId, null>[] = ['v10', 'v11', 'v20', 'v21'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 700;
const SVG_H = 120;
const START_X = 80;
const END_X = SVG_W - 40;
const STEP = (END_X - START_X) / (VER_ORDER.length - 1);
const LINE_Y = 50;
const DOT_R = 16;

export default function ModelRegistryTimeline() {
    const [hovered, setHovered] = useState<VersionId>(null);
    const isDimmed = (id: Exclude<VersionId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Model Registry 버전 타임라인
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Git처럼 모델 버전을 관리 — 롤백은 수 분 내 완료
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 750 }}>
                    {/* 타임라인 축 */}
                    <line x1={START_X - 20} y1={LINE_Y} x2={END_X + 20} y2={LINE_Y} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />

                    {VER_ORDER.map((id, i) => {
                        const x = START_X + i * STEP;
                        const v = VERSIONS[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - DOT_R - 6} y={LINE_Y - DOT_R - 20} width={DOT_R * 2 + 12} height={DOT_R * 2 + 60} fill="transparent" />
                                <circle cx={x} cy={LINE_Y} r={active ? DOT_R + 2 : DOT_R}
                                    fill={active ? `${v.statusColor}30` : `${v.statusColor}15`}
                                    stroke={v.statusColor} strokeWidth={active ? 2 : 1.5} />
                                <text x={x} y={LINE_Y + 4} textAnchor="middle" fill={active ? v.statusColor : COLOR.textMuted}
                                    fontSize={FONT.min} fontWeight={700}>{v.label}</text>
                                {/* 날짜 (위) */}
                                <text x={x} y={LINE_Y - DOT_R - 8} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>{v.date}</text>
                                {/* R² + 상태 (아래) */}
                                <text x={x} y={LINE_Y + DOT_R + 20} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>R²={v.r2}</text>
                                <text x={x} y={LINE_Y + DOT_R + 34} textAnchor="middle" fill={v.statusColor} fontSize={FONT.min} fontWeight={600}>{v.status}</text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            {/* 툴팁 */}
            <div style={{ maxWidth: 700, margin: '8px auto 0', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: VERSIONS[hovered].statusColor, marginBottom: 2 }}>{VERSIONS[hovered].label} — {VERSIONS[hovered].status}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>R²={VERSIONS[hovered].r2} · Train: {VERSIONS[hovered].train} · {VERSIONS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 버전 노드를 호버하여 모델 버전 상세를 확인하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
