'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type NodeId = 'fdc' | 'trace' | 'meta' | 'prev' | 'vm' | 'cd' | 'ovl' | 'thk' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    fdc:   { label: 'FDC Summary', sub: '센서 평균/σ/min/max', desc: '각 센서 × 스텝별 통계값. 센서 100개 × 스텝 5개 × 통계량 5종 = ~2,500개 피처가 전형적. 가장 보편적인 VM 입력.', color: '#3b82f6' },
    trace: { label: 'FDC Trace', sub: '시계열 센서 신호', desc: 'Summary에서 손실되는 시간적 패턴(Transient)을 포착. FFT, Wavelet, PCA 등으로 특징 추출 후 사용. 차원이 수만~수십만.', color: '#8b5cf6' },
    meta:  { label: '메타데이터', sub: '장비ID, 챔버, 레시피', desc: '장비/챔버 ID로 장비 간 차이 포착. PM 이후 경과 웨이퍼 수, 슬롯 번호 등이 공정 상태의 대리 변수로 기능.', color: '#f59e0b' },
    prev:  { label: '이전 공정', sub: '이전 층 CD/OVL/두께', desc: '이전 공정의 측정값(또는 VM 예측값). 이전 층의 변형이 현재 층에 미치는 영향을 직접 학습할 수 있어 정확도가 유의미하게 향상.', color: '#ef4444' },
    vm:    { label: 'VM 모델', sub: 'PLS / XGBoost / NN', desc: '입력 피처로부터 공정 결과를 예측하는 ML 모델. 상황에 따라 PLS(선형, 해석), XGBoost(비선형, 실전), Neural Network(최고성능)을 선택.', color: '#22d3ee' },
    cd:    { label: 'CD 예측', sub: 'Critical Dimension', desc: '공정 후 패턴의 선폭(CD)을 실제 계측(CD-SEM) 없이 예측. APC Feed-Forward에 즉시 활용 가능.', color: '#22c55e' },
    ovl:   { label: 'Overlay 예측', sub: '정합 오차', desc: '층간 정합 오차를 예측. 실제 Overlay 계측 없이 APC에 Feed-Forward하여 다음 층 보정에 즉시 반영.', color: '#22c55e' },
    thk:   { label: '막 두께 예측', sub: 'Film Thickness', desc: '박막의 두께를 예측. 식각, 증착 공정에서 주로 사용. 엘립소미터 계측을 대체하여 전수 모니터링 가능.', color: '#22c55e' },
};

/* ─── SVG 레이아웃 상수 ─── */
const SVG_W = 640;
const SVG_H = 200;

const INPUT_X = 80;
const VM_X = SVG_W / 2;
const OUTPUT_X = SVG_W - 80;

const INPUT_ITEMS: Exclude<NodeId, null>[] = ['fdc', 'trace', 'meta', 'prev'];
const OUTPUT_ITEMS: Exclude<NodeId, null>[] = ['cd', 'ovl', 'thk'];

const INPUT_GAP = 40;
const INPUT_START_Y = (SVG_H - (INPUT_ITEMS.length - 1) * INPUT_GAP) / 2;
const OUTPUT_GAP = 44;
const OUTPUT_START_Y = (SVG_H - (OUTPUT_ITEMS.length - 1) * OUTPUT_GAP) / 2;
const VM_Y = SVG_H / 2;

const NODE_W = 110;
const NODE_H = 40;
const VM_W = 100;
const VM_H = 48;

export default function VMInputOutputFlow() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    const renderNode = (id: Exclude<NodeId, null>, cx: number, cy: number, w: number, h: number) => {
        const info = NODES[id];
        const active = hovered === id;
        const dimmed = isDimmed(id);
        return (
            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={cx - w / 2 - 6} y={cy - h / 2 - 4} width={w + 12} height={h + 8} fill="transparent" />
                <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={8}
                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                <text x={cx} y={cy - 4} textAnchor="middle" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
            </motion.g>
        );
    };

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                VM 입출력 구조
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                FDC Sensor Data → VM Model → Predicted Metrology
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 640 }}>
                    {/* 입력 → VM 화살표 */}
                    {INPUT_ITEMS.map((id, i) => {
                        const y = INPUT_START_Y + i * INPUT_GAP;
                        return <line key={`in-${id}`} x1={INPUT_X + NODE_W / 2} y1={y} x2={VM_X - VM_W / 2} y2={VM_Y}
                            stroke={`${NODES[id].color}30`} strokeWidth={1} />;
                    })}
                    {/* VM → 출력 화살표 */}
                    {OUTPUT_ITEMS.map((id, i) => {
                        const y = OUTPUT_START_Y + i * OUTPUT_GAP;
                        return (
                            <g key={`out-${id}`}>
                                <line x1={VM_X + VM_W / 2} y1={VM_Y} x2={OUTPUT_X - NODE_W / 2} y2={y}
                                    stroke="rgba(34,197,94,0.3)" strokeWidth={1} />
                                <polygon
                                    points={`${OUTPUT_X - NODE_W / 2},${y} ${OUTPUT_X - NODE_W / 2 - 8},${y - 4} ${OUTPUT_X - NODE_W / 2 - 8},${y + 4}`}
                                    fill="rgba(34,197,94,0.3)" />
                            </g>
                        );
                    })}

                    {/* 노드 */}
                    {INPUT_ITEMS.map((id, i) => renderNode(id, INPUT_X, INPUT_START_Y + i * INPUT_GAP, NODE_W, NODE_H))}
                    {renderNode('vm', VM_X, VM_Y, VM_W, VM_H)}
                    {OUTPUT_ITEMS.map((id, i) => renderNode(id, OUTPUT_X, OUTPUT_START_Y + i * OUTPUT_GAP, NODE_W, NODE_H))}
                </svg>
            </div>

            {/* 툴팁 */}
            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 52 }}>
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
                                각 노드를 호버하여 VM의 입력 데이터와 출력 예측값을 확인하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
