'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'test' | 'pre' | 'cls' | 'root' | 'action' | 'trend' | 'alert' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    test:   { label: '전기적 테스트', sub: 'Bin Map 생성', desc: '각 다이의 Pass/Fail과 Bin 코드를 웨이퍼맵으로 생성.', color: '#3b82f6' },
    pre:    { label: '전처리', sub: '이미지화·정규화', desc: '다이 좌표를 정사각형 그리드로 매핑, 해상도 통일(64×64).', color: '#22c55e' },
    cls:    { label: 'CNN 분류', sub: '패턴 유형 식별', desc: 'CNN으로 8대 패턴 + 혼합 패턴 자동 분류. 95~98% 정확도.', color: '#f59e0b' },
    root:   { label: 'Root Cause', sub: '패턴→장비/공정', desc: '패턴→원인 매핑 DB(Knowledge Base) 기반 원인 후보 자동 추천.', color: '#a855f7' },
    action: { label: '대응 조치', sub: '장비 점검·PM·레시피', desc: 'Root Cause에 따른 장비 점검, PM 수행, 레시피 조정 실행.', color: '#ef4444' },
    trend:  { label: '패턴 추이', sub: '시간별 패턴 변화', desc: '패턴 발생 빈도의 시계열 분석. 점진적 증가→장비 열화 신호.', color: '#06b6d4' },
    alert:  { label: '이상 알람', sub: '새 패턴 출현', desc: '"None of the above" 빈도 증가 시 새로운 패턴 정의 필요 신호.', color: '#f97316' },
};

const SVG_W = 680;
const SVG_H = 160;
const NODE_W = 108;
const NODE_H = 50;

/* Main flow: horizontal top row. Branch: below CNN */
const MAIN_Y = 38;
const BRANCH_Y = 126;
const GAP = 16;
const TOTAL_MAIN = 5 * NODE_W + 4 * GAP;
const X0 = (SVG_W - TOTAL_MAIN) / 2 + NODE_W / 2;

const POS: Record<Exclude<NodeId, null>, { x: number; y: number }> = {
    test:   { x: X0, y: MAIN_Y },
    pre:    { x: X0 + (NODE_W + GAP), y: MAIN_Y },
    cls:    { x: X0 + (NODE_W + GAP) * 2, y: MAIN_Y },
    root:   { x: X0 + (NODE_W + GAP) * 3, y: MAIN_Y },
    action: { x: X0 + (NODE_W + GAP) * 4, y: MAIN_Y },
    trend:  { x: X0 + (NODE_W + GAP) * 3, y: BRANCH_Y },
    alert:  { x: X0 + (NODE_W + GAP) * 4, y: BRANCH_Y },
};

export default function WaferMapAnalysisPipeline() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDim = (id: NodeId) => hovered !== null && hovered !== id;

    const renderNode = (id: Exclude<NodeId, null>) => {
        const { x, y } = POS[id];
        const info = NODES[id];
        const active = hovered === id;
        return (
            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={x - NODE_W / 2 - 4} y={y - NODE_H / 2 - 4} width={NODE_W + 8} height={NODE_H + 8} fill="transparent" />
                <rect x={x - NODE_W / 2} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                <text x={x} y={y - 8} textAnchor="middle" dominantBaseline="central" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                <text x={x} y={y + 10} textAnchor="middle" dominantBaseline="central" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
            </motion.g>
        );
    };

    const arrow = (x1: number, y1: number, x2: number, y2: number, dashed = false) => (
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray={dashed ? '4 3' : 'none'} />
    );

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                웨이퍼맵 분석 실전 파이프라인
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                테스트 → 전처리 → CNN 분류 → Root Cause → 대응 조치 + 추이 분석
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 680 }}>
                    {/* Main horizontal flow */}
                    {arrow(POS.test.x + NODE_W / 2, MAIN_Y, POS.pre.x - NODE_W / 2, MAIN_Y)}
                    {arrow(POS.pre.x + NODE_W / 2, MAIN_Y, POS.cls.x - NODE_W / 2, MAIN_Y)}
                    {arrow(POS.cls.x + NODE_W / 2, MAIN_Y, POS.root.x - NODE_W / 2, MAIN_Y)}
                    {arrow(POS.root.x + NODE_W / 2, MAIN_Y, POS.action.x - NODE_W / 2, MAIN_Y)}
                    {/* Branch down from CNN to trend */}
                    {arrow(POS.cls.x, MAIN_Y + NODE_H / 2, POS.cls.x, BRANCH_Y - NODE_H / 2 - 6, true)}
                    {arrow(POS.cls.x, BRANCH_Y - NODE_H / 2 - 6, POS.trend.x - NODE_W / 2, BRANCH_Y, true)}
                    {arrow(POS.trend.x + NODE_W / 2, BRANCH_Y, POS.alert.x - NODE_W / 2, BRANCH_Y)}

                    {renderNode('test')}
                    {renderNode('pre')}
                    {renderNode('cls')}
                    {renderNode('root')}
                    {renderNode('action')}
                    {renderNode('trend')}
                    {renderNode('alert')}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. 패턴에서 원인, 원인에서 조치까지 — Knowledge Base가 핵심입니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
