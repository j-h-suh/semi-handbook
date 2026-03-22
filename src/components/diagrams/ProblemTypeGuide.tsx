'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type NodeId = 'q1' | 'reg' | 'cls' | 'opt' | 'q2' | 'q3' | 'q4' | 'sup' | 'semi' | 'sup_cls' | 'unsup' | 'phys' | 'ml_opt' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; desc: string; color: string }> = {
    q1:      { label: '무엇을 원하는가?', desc: '문제의 본질을 파악하는 첫 번째 질문. 수치를 예측할지, 범주를 판별할지, 최적의 행동을 결정할지에 따라 접근법이 달라진다.', color: '#22d3ee' },
    reg:     { label: '회귀', desc: 'CD, Overlay, 막 두께 등 연속값 예측. VM(3.6장), APC(3.5장)의 핵심. 타겟 정의의 명확성과 오차 비대칭성에 주의.', color: '#3b82f6' },
    cls:     { label: '분류', desc: '결함 유형, 웨이퍼맵 패턴, 이상/정상 판별. 클래스 불균형과 비용 비대칭(FN >> FP)이 핵심 과제.', color: '#22c55e' },
    opt:     { label: '최적화', desc: 'Dose, 보정값, PM 스케줄 등 최적의 행동 결정. 예측 모델 위에 구축되며 안전 제약(Safety Constraints)이 필수.', color: '#f59e0b' },
    q2:      { label: '레이블 충분?', desc: '타겟 변수(Y)에 레이블이 충분한가? 반도체에서는 계측이 5~10%만 수행되어 데이터가 부족한 경우가 많다.', color: '#3b82f6' },
    q3:      { label: '이상 데이터 있음?', desc: '이상(불량) 샘플에 레이블이 있는가? 장비 이상은 전체의 ~1%로 매우 희귀하여 레이블이 부족한 경우가 대부분.', color: '#22c55e' },
    q4:      { label: '모델 유형?', desc: '물리 기반 모델(방정식으로 관계 기술)이 있는가, ML 모델(데이터에서 관계 학습)을 사용하는가?', color: '#f59e0b' },
    sup:     { label: 'Supervised', desc: '레이블이 충분할 때. XGBoost, Random Forest, Neural Network 등으로 지도학습. 가장 높은 예측 정확도.', color: '#818cf8' },
    semi:    { label: 'Semi-Supervised', desc: '레이블 부족 시. VM의 RI 기반 선택적 계측(3.6장)으로 효율적 레이블 확보. 능동학습으로 모델 점진 개선.', color: '#a78bfa' },
    sup_cls: { label: 'Supervised', desc: '이상 레이블이 충분할 때. CNN(이미지 기반 결함), Random Forest(FDC 기반 이상) 등 지도 분류.', color: '#818cf8' },
    unsup:   { label: 'Unsupervised', desc: '레이블 없을 때. 정상만으로 "정상의 경계"를 학습하고 경계 밖을 이상으로 판단. Autoencoder, Isolation Forest.', color: '#a78bfa' },
    phys:    { label: 'Model-Based', desc: '물리 모델이 있을 때. 선형/비선형 프로그래밍, 2차 계획법. APC의 EWMA가 대표적.', color: '#818cf8' },
    ml_opt:  { label: 'Surrogate Opt', desc: 'ML 모델 기반. Bayesian Optimization, Genetic Algorithm으로 블랙박스 모델의 최적 입력 탐색.', color: '#a78bfa' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 900;
const SVG_H = 320;
const CX = SVG_W / 2;

const DIA_W = 120;
const DIA_H = 36;
const BOX_W = 100;
const BOX_H = 36;
const SMALL_W = 115;
const SMALL_H = 32;

/* 3개 브랜치 중심: 회귀(150), 분류(375), 최적화(600) */
const BX1 = 160, BX2 = 450, BX3 = 740;
const LEAF_SPREAD = 70; /* 부모 중심에서 좌우 오프셋 */

/* 노드 위치 */
const POS: Record<Exclude<NodeId, null>, { x: number; y: number; type: 'diamond' | 'box' | 'small' }> = {
    q1:      { x: CX,   y: 30,   type: 'diamond' },
    reg:     { x: BX1,  y: 100,  type: 'box' },
    cls:     { x: BX2,  y: 100,  type: 'box' },
    opt:     { x: BX3,  y: 100,  type: 'box' },
    q2:      { x: BX1,  y: 180,  type: 'diamond' },
    q3:      { x: BX2,  y: 180,  type: 'diamond' },
    q4:      { x: BX3,  y: 180,  type: 'diamond' },
    sup:     { x: BX1 - LEAF_SPREAD, y: 270, type: 'small' },
    semi:    { x: BX1 + LEAF_SPREAD, y: 270, type: 'small' },
    sup_cls: { x: BX2 - LEAF_SPREAD, y: 270, type: 'small' },
    unsup:   { x: BX2 + LEAF_SPREAD, y: 270, type: 'small' },
    phys:    { x: BX3 - LEAF_SPREAD, y: 270, type: 'small' },
    ml_opt:  { x: BX3 + LEAF_SPREAD, y: 270, type: 'small' },
};

const EDGES: { from: Exclude<NodeId, null>; to: Exclude<NodeId, null>; label?: string }[] = [
    { from: 'q1', to: 'reg', label: '수치 예측' },
    { from: 'q1', to: 'cls', label: '범주 판별' },
    { from: 'q1', to: 'opt', label: '최적 행동' },
    { from: 'reg', to: 'q2' },
    { from: 'cls', to: 'q3' },
    { from: 'opt', to: 'q4' },
    { from: 'q2', to: 'sup', label: 'Yes' },
    { from: 'q2', to: 'semi', label: 'No' },
    { from: 'q3', to: 'sup_cls', label: 'Yes' },
    { from: 'q3', to: 'unsup', label: 'No' },
    { from: 'q4', to: 'phys', label: '물리 모델' },
    { from: 'q4', to: 'ml_opt', label: 'ML 모델' },
];

export default function ProblemTypeGuide() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    const renderNode = (id: Exclude<NodeId, null>) => {
        const p = POS[id];
        const info = NODES[id];
        const active = hovered === id;
        const dimmed = isDimmed(id);
        const w = p.type === 'small' ? SMALL_W : p.type === 'box' ? BOX_W : DIA_W;
        const h = p.type === 'small' ? SMALL_H : p.type === 'box' ? BOX_H : DIA_H;

        if (p.type === 'diamond') {
            const hw = w / 2, hh = h / 2;
            return (
                <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                    animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                    <rect x={p.x - hw - 6} y={p.y - hh - 6} width={w + 12} height={h + 12} fill="transparent" />
                    <polygon points={`${p.x},${p.y - hh} ${p.x + hw},${p.y} ${p.x},${p.y + hh} ${p.x - hw},${p.y}`}
                        fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                        stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                    <text x={p.x} y={p.y + 4} textAnchor="middle" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={700}>{info.label}</text>
                </motion.g>
            );
        }
        return (
            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={p.x - w / 2 - 6} y={p.y - h / 2 - 4} width={w + 12} height={h + 8} fill="transparent" />
                <rect x={p.x - w / 2} y={p.y - h / 2} width={w} height={h} rx={8}
                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={600}>{info.label}</text>
            </motion.g>
        );
    };

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                문제 유형 선택 가이드
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Problem Type Decision Tree — 회귀 · 분류 · 최적화
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 900 }}>
                    {/* 연결선 */}
                    {EDGES.map((e, i) => {
                        const f = POS[e.from], t = POS[e.to];
                        const fh = f.type === 'diamond' ? DIA_H / 2 : f.type === 'box' ? BOX_H / 2 : SMALL_H / 2;
                        const th = t.type === 'diamond' ? DIA_H / 2 : t.type === 'box' ? BOX_H / 2 : SMALL_H / 2;
                        const y1 = f.y + fh;
                        const y2 = t.y - th;
                        return (
                            <g key={i}>
                                <line x1={f.x} y1={y1} x2={t.x} y2={y2} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                                {e.label && (
                                    <text x={(f.x + t.x) / 2 + (f.x === t.x ? 8 : 0)} y={(y1 + y2) / 2}
                                        textAnchor={f.x === t.x ? 'start' : 'middle'} fill={COLOR.textDim} fontSize={FONT.min}>{e.label}</text>
                                )}
                            </g>
                        );
                    })}
                    {/* 노드 */}
                    {(Object.keys(NODES) as Exclude<NodeId, null>[]).map(id => renderNode(id))}
                </svg>
            </div>

            <div style={{ maxWidth: 700, margin: '0 auto', height: 52 }}>
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
                                각 노드를 호버하여 회귀 · 분류 · 최적화 문제의 세부 접근법을 확인하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
