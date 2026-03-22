'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type NodeId = 'vm' | 'ri' | 'use' | 'actual' | 'update' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    vm:     { label: 'VM 예측 실행', sub: 'FDC → 예측값', desc: '장비 센서 데이터(FDC)를 VM 모델에 입력하여 CD/Overlay/막 두께를 예측한다. 모든 웨이퍼에 대해 공정 직후 즉시 실행.', color: '#3b82f6' },
    ri:     { label: 'RI ≥ 임계값?', sub: 'Reliance Index 판단', desc: 'RI(신뢰도 지표)를 계산하여 이 예측을 믿어도 되는지 판단. 입력 데이터가 학습 분포 안에 있으면 RI가 높고, 벗어나면 낮다.', color: '#f59e0b' },
    use:    { label: 'VM 예측값 사용', sub: '계측 생략 ✅', desc: 'RI가 임계값 이상이면 VM 예측이 신뢰할 수 있으므로, 실제 계측을 생략하고 VM 예측값을 APC/모니터링에 사용. 계측 비용 50~80% 절감.', color: '#22c55e' },
    actual: { label: '실제 계측 수행', sub: 'CD-SEM / OCD 측정', desc: 'RI가 임계값 미만이면 VM 예측을 불신하고 실제 계측을 수행. 모델이 불확실한 영역의 데이터를 확보하는 Active Learning 원리.', color: '#ef4444' },
    update: { label: '모델 업데이트', sub: '학습 데이터 추가 + 재학습', desc: '실제 계측 결과를 학습 데이터에 추가하여 모델을 미세조정. 불확실한 영역의 데이터가 보강되어 시간이 갈수록 RI 낮은 영역이 줄어든다.', color: '#a78bfa' },
};

/* ─── SVG 레이아웃 상수 ─── */
const SVG_W = 600;
const SVG_H = 330;
const CX = SVG_W / 2;

/* 노드 위치 (세로 플로우) */
const NODE_W = 180;
const NODE_H = 50;
const STEP_GAP = 80;
const BRANCH_OFFSET = 140;

const POS: Record<Exclude<NodeId, null>, { x: number; y: number }> = {
    vm:     { x: CX, y: 40 },
    ri:     { x: CX, y: 40 + STEP_GAP },
    use:    { x: CX - BRANCH_OFFSET, y: 40 + STEP_GAP * 2 },
    actual: { x: CX + BRANCH_OFFSET, y: 40 + STEP_GAP * 2 },
    update: { x: CX + BRANCH_OFFSET, y: 40 + STEP_GAP * 3 },
};

/* 다이아몬드 크기 */
const DIAMOND_W = 170;
const DIAMOND_H = 56;

export default function RIHybridStrategy() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    const renderNode = (id: Exclude<NodeId, null>) => {
        const pos = POS[id];
        const info = NODES[id];
        const active = hovered === id;
        const dimmed = isDimmed(id);
        const isDecision = id === 'ri';
        const w = isDecision ? DIAMOND_W : NODE_W;
        const h = isDecision ? DIAMOND_H : NODE_H;

        return (
            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={pos.x - w / 2 - 8} y={pos.y - h / 2 - 6} width={w + 16} height={h + 12} fill="transparent" />
                {isDecision ? (
                    <polygon
                        points={`${pos.x},${pos.y - h / 2} ${pos.x + w / 2},${pos.y} ${pos.x},${pos.y + h / 2} ${pos.x - w / 2},${pos.y}`}
                        fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                        stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1}
                    />
                ) : (
                    <rect x={pos.x - w / 2} y={pos.y - h / 2} width={w} height={h} rx={10}
                        fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                        stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                )}
                <text x={pos.x} y={pos.y - 4} textAnchor="middle" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.body} fontWeight={700}>{info.label}</text>
                <text x={pos.x} y={pos.y + 14} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
            </motion.g>
        );
    };

    /* 화살표 헬퍼 */
    const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, label?: string) => {
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len, uy = dy / len;
        const tipX = x2, tipY = y2;
        const baseX = tipX - ux * 10, baseY = tipY - uy * 10;
        const perpX = -uy * 5, perpY = ux * 5;
        return (
            <g>
                <line x1={x1} y1={y1} x2={baseX} y2={baseY} stroke={color} strokeWidth={1.5} />
                <polygon points={`${tipX},${tipY} ${baseX + perpX},${baseY + perpY} ${baseX - perpX},${baseY - perpY}`} fill={color} />
                {label && (
                    <text x={(x1 + x2) / 2 + (dx === 0 ? 16 : 0)} y={(y1 + y2) / 2 + (dy === 0 ? -8 : 0)}
                        textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min} fontWeight={600}>{label}</text>
                )}
            </g>
        );
    };

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                RI 기반 하이브리드 전략
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Reliance Index — Adaptive Measurement Strategy (Active Learning)
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 600 }}>
                    {/* 연결선 */}
                    {arrow(POS.vm.x, POS.vm.y + NODE_H / 2, POS.ri.x, POS.ri.y - DIAMOND_H / 2, 'rgba(255,255,255,0.2)')}
                    {arrow(POS.ri.x - DIAMOND_W / 2, POS.ri.y, POS.use.x, POS.use.y - NODE_H / 2, 'rgba(34,197,94,0.4)', 'Yes')}
                    {arrow(POS.ri.x + DIAMOND_W / 2, POS.ri.y, POS.actual.x, POS.actual.y - NODE_H / 2, 'rgba(239,68,68,0.4)', 'No')}
                    {arrow(POS.actual.x, POS.actual.y + NODE_H / 2, POS.update.x, POS.update.y - NODE_H / 2, 'rgba(167,139,250,0.4)')}
                    {/* Feedback loop */}
                    <path d={`M ${POS.update.x + NODE_W / 2 + 4} ${POS.update.y} C ${POS.update.x + NODE_W / 2 + 50} ${POS.update.y}, ${POS.vm.x + NODE_W / 2 + 50} ${POS.vm.y}, ${POS.vm.x + NODE_W / 2 + 4} ${POS.vm.y}`}
                        fill="none" stroke="rgba(167,139,250,0.3)" strokeWidth={1} strokeDasharray="4 3" />

                    {/* 노드 */}
                    {renderNode('vm')}
                    {renderNode('ri')}
                    {renderNode('use')}
                    {renderNode('actual')}
                    {renderNode('update')}
                </svg>
            </div>

            {/* 툴팁 */}
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 노드를 호버하세요. RI가 높으면 계측을 생략하고, 낮으면 실측 후 모델을 업데이트합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
