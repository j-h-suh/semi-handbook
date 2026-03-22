'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type PanelId = 'pred' | 'drift' | 'resid' | 'alert' | null;

const PANELS: Record<Exclude<PanelId, null>, { label: string; sub: string; desc: string; color: string }> = {
    pred:  { label: '예측 성능', sub: 'RMSE 추이', desc: '온라인 RMSE를 실시간 추적. 시간에 따라 오차가 증가하면 모델 열화(Model Degradation) 진행 중. 임계값 초과 시 재학습 트리거.', color: '#3b82f6' },
    drift: { label: 'Data Drift', sub: 'PSI / KS 추이', desc: 'PSI(Population Stability Index)로 입력 분포 변화 감지. PSI > 0.2이면 유의미한 변화. 성능 저하의 선행 지표.', color: '#22c55e' },
    resid: { label: '잔차 분석', sub: '평균 / 분산 추이', desc: '잔차 평균이 0에서 벗어나면 편향(Bias), 분산이 커지면 정밀도 저하. 시간적 패턴이 남아 있으면 Drift 미추적.', color: '#f59e0b' },
    alert: { label: '알람', sub: '재학습 트리거', desc: '성능/Drift/잔차 중 하나라도 임계값 초과 시 알람 발생. 성능 기반, Drift 기반, 이벤트 기반, 주기 기반 4가지 트리거.', color: '#ef4444' },
};

const PANEL_ORDER: Exclude<PanelId, null>[] = ['pred', 'drift', 'resid', 'alert'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 600;
const SVG_H = 100;
const BOX_W = 120;
const BOX_H = 50;
const GAP = 20;
const TOTAL_W = 4 * BOX_W + 3 * GAP;
const START_X = (SVG_W - TOTAL_W) / 2;
const BOX_Y = (SVG_H - BOX_H) / 2;

export default function MonitoringDashboard() {
    const [hovered, setHovered] = useState<PanelId>(null);
    const isDimmed = (id: Exclude<PanelId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                모니터링 대시보드
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                예측 성능 + Data Drift + 잔차 분석 → 알람
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 650 }}>
                    {PANEL_ORDER.map((id, i) => {
                        const x = START_X + i * (BOX_W + GAP);
                        const info = PANELS[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);
                        const isAlert = id === 'alert';
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - 4} y={BOX_Y - 4} width={BOX_W + 8} height={BOX_H + 8} fill="transparent" />
                                <rect x={x} y={BOX_Y} width={BOX_W} height={BOX_H} rx={10}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x + BOX_W / 2} y={BOX_Y + 20} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.body} fontWeight={700}>{info.label}</text>
                                <text x={x + BOX_W / 2} y={BOX_Y + 36} textAnchor="middle"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
                                {/* 화살표 (처음 3개 → alert) */}
                                {!isAlert && (
                                    <line x1={x + BOX_W + 2} y1={SVG_H / 2} x2={x + BOX_W + GAP - 6} y2={SVG_H / 2}
                                        stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                                )}
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ maxWidth: 650, margin: '8px auto 0', height: 48 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: PANELS[hovered].color, marginBottom: 2 }}>{PANELS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{PANELS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 패널을 호버하여 모니터링 항목의 상세를 확인하세요.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
