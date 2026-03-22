'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type LayerId = 'equip' | 'kafka' | 'feat' | 'vm' | 'apc' | 'monitor' | 'train' | 'registry' | null;

const NODES: Record<Exclude<LayerId, null>, { label: string; sub: string; desc: string; color: string }> = {
    equip:    { label: '장비 레이어', sub: '스캐너/트랙/계측', desc: 'ASML 스캐너(EDA), TEL 트랙(SECS/GEM), KLA 계측기(API). 3종 프로토콜로 실시간 데이터 스트리밍.', color: '#3b82f6' },
    kafka:    { label: 'Kafka', sub: '메시지 브로커', desc: '모든 FDC/계측 데이터의 중앙 허브. 토픽별 데이터 분리. 장비↔AI 시스템 디커플링.', color: '#22c55e' },
    feat:     { label: '피처 엔진', sub: '실시간 변환', desc: 'Kafka → Summary 피처 + 도메인 피처 실시간 계산. Flink/Spark Streaming.', color: '#f59e0b' },
    vm:       { label: 'VM 서버', sub: 'XGBoost + RI', desc: 'FastAPI 기반 추론 서비스. RI로 신뢰도 평가. 실시간 CD/OVL 예측.', color: '#a855f7' },
    apc:      { label: 'APC 서버', sub: 'EWMA+VM 하이브리드', desc: '보정값 계산 → 스캐너 전송. Safety Guard(클램핑, Fallback). α = f(RI).', color: '#ef4444' },
    monitor:  { label: '모니터링', sub: 'Grafana + PSI', desc: 'VM 성능 추이, Data Drift(PSI/KS), APC 보정 현황. 임계값 초과 → 알림.', color: '#06b6d4' },
    train:    { label: '학습 서버', sub: 'Spark + GPU', desc: '재학습 트리거 수신 → Optuna + Time-Based CV → 새 모델 학습. Central 레이어.', color: '#ec4899' },
    registry: { label: 'Model Registry', sub: 'MLflow', desc: '모델 버전 관리, A/B 테스트, 롤백. 새 모델 → VM 서버에 자동 배포.', color: '#f97316' },
};

const SVG_W = 780;
const SVG_H = 220;

export default function SmileSystemArchitecture() {
    const [hovered, setHovered] = useState<LayerId>(null);
    const isDim = (id: LayerId) => hovered !== null && hovered !== id;

    const W = 120; const H = 48;
    /* Two-row layout: Edge row (top) and Central row (bottom) */
    const ROW1_Y = 60;
    const ROW2_Y = 170;
    const positions: Record<Exclude<LayerId, null>, { x: number; y: number }> = {
        equip:    { x: 80,  y: ROW1_Y },
        kafka:    { x: 220, y: ROW1_Y },
        feat:     { x: 360, y: ROW1_Y },
        vm:       { x: 500, y: ROW1_Y },
        apc:      { x: 660, y: ROW1_Y },
        train:    { x: 300, y: ROW2_Y },
        registry: { x: 460, y: ROW2_Y },
        monitor:  { x: 620, y: ROW2_Y },
    };

    /* Explicit arrow endpoints: [x1, y1, x2, y2, dash?] */
    const edgeArrows: { x1: number; y1: number; x2: number; y2: number; dash?: boolean }[] = [
        /* Edge row: horizontal */
        { x1: 80 + W / 2, y1: ROW1_Y, x2: 220 - W / 2, y2: ROW1_Y },
        { x1: 220 + W / 2, y1: ROW1_Y, x2: 360 - W / 2, y2: ROW1_Y },
        { x1: 360 + W / 2, y1: ROW1_Y, x2: 500 - W / 2, y2: ROW1_Y },
        { x1: 500 + W / 2, y1: ROW1_Y, x2: 660 - W / 2, y2: ROW1_Y },
        /* APC → Monitor: vertical down on right side */
        { x1: 660, y1: ROW1_Y + H / 2, x2: 620, y2: ROW2_Y - H / 2, dash: true },
        /* Monitor → Train: horizontal left on bottom */
        { x1: 620 - W / 2, y1: ROW2_Y, x2: 460 + W / 2, y2: ROW2_Y, dash: true },
        /* Train ← Registry: horizontal */
        { x1: 460 - W / 2, y1: ROW2_Y, x2: 300 + W / 2, y2: ROW2_Y, dash: true },
        /* Registry → VM: vertical up */
        { x1: 460, y1: ROW2_Y - H / 2, x2: 500, y2: ROW1_Y + H / 2, dash: true },
    ];

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                SMILE 시스템 아키텍처 종합
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Edge(VM/APC) + Central(학습/레지스트리) 2계층
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 780 }}>
                    <defs>
                        <marker id="arrowSA" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {/* Layer labels — horizontal, above each row */}
                    <text x={80 - W / 2} y={ROW1_Y - H / 2 - 8} fill={COLOR.textDim} fontSize={FONT.min} opacity={0.4}>Edge</text>
                    <text x={300 - W / 2} y={ROW2_Y - H / 2 - 8} fill={COLOR.textDim} fontSize={FONT.min} opacity={0.4}>Central</text>
                    {/* Arrows */}
                    {edgeArrows.map(({ x1, y1, x2, y2, dash }, i) => (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray={dash ? '4 2' : undefined} markerEnd="url(#arrowSA)" />
                    ))}
                    {/* Nodes */}
                    {Object.entries(positions).map(([id, { x, y }]) => {
                        const info = NODES[id as Exclude<LayerId, null>];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id as Exclude<LayerId, null>)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDim(id as LayerId) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - W / 2 - 4} y={y - H / 2 - 4} width={W + 8} height={H + 8} fill="transparent" />
                                <rect x={x - W / 2} y={y - H / 2} width={W} height={H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x} y={y - 6} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>{info.label}</text>
                                <text x={x} y={y + 12} textAnchor="middle" dominantBaseline="central"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 컴포넌트를 호버하세요. Edge + Central 2계층 아키텍처.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
