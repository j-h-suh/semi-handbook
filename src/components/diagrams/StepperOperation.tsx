'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 스텝 데이터 ─── */
type StepId = 'source' | 'mask' | 'lens' | 'wafer' | null;

interface StepInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const STEPS: Record<Exclude<StepId, null>, StepInfo> = {
    source: { label: '광원', sub: 'Light Source', desc: 'ArF(193nm) 또는 KrF(248nm) 엑시머 레이저. 단색광을 생성하여 마스크에 조사.', color: '#fbbf24' },
    mask: { label: '마스크', sub: '4× 크기 패턴', desc: '회로 패턴이 실제의 4배 크기로 제작된 석영 유리판. 크게 만들어 제작 난이도를 낮추고, 결함 영향을 1/4로 축소.', color: '#e4e4e7' },
    lens: { label: '투영 렌즈', sub: '4:1 축소', desc: '수십 장의 정밀 연마 렌즈로 구성. 마스크 패턴을 1/4로 축소하여 웨이퍼에 투영. 수차를 극한까지 보정.', color: '#3b82f6' },
    wafer: { label: '웨이퍼', sub: 'Step & Repeat', desc: '한 다이를 노광 후 웨이퍼 스테이지를 다음 위치로 이동(Step)하고 같은 노광을 반복(Repeat). 수백 개 다이를 순차적으로 노광하여 웨이퍼 전체를 커버.', color: '#a1a1aa' },
};

const STEP_ORDER: Exclude<StepId, null>[] = ['source', 'mask', 'lens', 'wafer'];

/* ─── 좌측 광학 컬럼 상수 ─── */
const COL_W = 200;
const COL_H = 240;
const COL_CX = COL_W / 2;
const BOX_W = 130;
const BOX_H = 36;
const GAP_Y = 12;
const yPos = STEP_ORDER.map((_, i) => 10 + i * (BOX_H + GAP_Y));

/* ─── 우측 웨이퍼 다이 격자 상수 ─── */
const WFR_SIZE = 180;
const WFR_CX = WFR_SIZE / 2;
const WFR_CY = WFR_SIZE / 2;
const WFR_R = 80;
const DIE_COLS = 7;
const DIE_ROWS = 7;
const DIE_W = (WFR_R * 2) / DIE_COLS;
const DIE_H = (WFR_R * 2) / DIE_ROWS;

/* 원 내부의 다이 좌표 계산 */
function getDieGrid() {
    const dies: { x: number; y: number; col: number; row: number }[] = [];
    for (let r = 0; r < DIE_ROWS; r++) {
        for (let c = 0; c < DIE_COLS; c++) {
            const x = WFR_CX - WFR_R + c * DIE_W;
            const y = WFR_CY - WFR_R + r * DIE_H;
            // 다이 중심이 원 안에 있는지 체크
            const cx = x + DIE_W / 2;
            const cy = y + DIE_H / 2;
            const dist = Math.sqrt((cx - WFR_CX) ** 2 + (cy - WFR_CY) ** 2);
            if (dist < WFR_R - 4) {
                dies.push({ x, y, col: c, row: r });
            }
        }
    }
    return dies;
}

const DIE_GRID = getDieGrid();
/* 스캔 순서: 왼→오, 오→왼 교대 (S자 패턴) */
const SCAN_ORDER = DIE_GRID.slice().sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.row % 2 === 0 ? a.col - b.col : b.col - a.col;
});

export default function StepperOperation() {
    const [hovered, setHovered] = useState<StepId>(null);
    const isDimmed = (id: Exclude<StepId, null>) => hovered !== null && hovered !== id;
    const [activeDie, setActiveDie] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveDie(prev => (prev + 1) % SCAN_ORDER.length);
        }, 400);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                스테퍼 동작 원리
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Stepper — Step & Repeat Projection
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* 좌측: 광학 컬럼 */}
                <svg viewBox={`0 0 ${COL_W} ${COL_H}`} width={200} style={{ flexShrink: 0 }}>
                    {/* 빔 경로 */}
                    <motion.polygon
                        points={`${COL_CX - 14},${yPos[0] + BOX_H} ${COL_CX + 14},${yPos[0] + BOX_H} ${COL_CX + 22},${yPos[1]} ${COL_CX - 22},${yPos[1]}`}
                        fill="rgba(251,191,36,0.25)" stroke="rgba(251,191,36,0.4)" strokeWidth={0.5}
                        animate={{ opacity: isDimmed('source') && isDimmed('mask') ? 0.15 : 0.7 }} />
                    <motion.polygon
                        points={`${COL_CX - 22},${yPos[1] + BOX_H} ${COL_CX + 22},${yPos[1] + BOX_H} ${COL_CX + 22},${yPos[2]} ${COL_CX - 22},${yPos[2]}`}
                        fill="rgba(251,191,36,0.18)" stroke="rgba(251,191,36,0.3)" strokeWidth={0.5}
                        animate={{ opacity: isDimmed('mask') && isDimmed('lens') ? 0.15 : 0.6 }} />
                    <motion.polygon
                        points={`${COL_CX - 22},${yPos[2] + BOX_H} ${COL_CX + 22},${yPos[2] + BOX_H} ${COL_CX + 8},${yPos[3]} ${COL_CX - 8},${yPos[3]}`}
                        fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.2)" strokeWidth={0.5}
                        animate={{ opacity: isDimmed('lens') && isDimmed('wafer') ? 0.15 : 0.6 }} />

                    {/* 4:1 축소 표시 */}
                    <motion.text x={COL_CX + BOX_W / 2 + 8} y={yPos[2] + BOX_H / 2 + 5}
                        fill="#3b82f6" fontSize={FONT.min} fontWeight={700}
                        animate={{ opacity: isDimmed('lens') ? 0.2 : 0.7 }}>
                        4:1
                    </motion.text>

                    {/* 단계 박스 */}
                    {STEP_ORDER.map((id, i) => {
                        const y = yPos[i];
                        const info = STEPS[id];
                        const active = hovered === id;
                        const dim = isDimmed(id);
                        const isLens = id === 'lens';
                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dim ? 0.25 : 1 }}
                                transition={{ duration: 0.15 }}
                                style={{ cursor: 'pointer' }}>
                                {isLens ? (
                                    <ellipse cx={COL_CX} cy={y + BOX_H / 2} rx={BOX_W / 2} ry={BOX_H / 2.5}
                                        fill={active ? 'rgba(135,206,235,0.15)' : 'rgba(135,206,235,0.05)'}
                                        stroke={active ? info.color : 'rgba(255,255,255,0.15)'} strokeWidth={active ? 2 : 1} />
                                ) : (
                                    <rect x={COL_CX - BOX_W / 2} y={y} width={BOX_W} height={BOX_H} rx={6}
                                        fill={active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}
                                        stroke={active ? info.color : 'rgba(255,255,255,0.12)'} strokeWidth={active ? 2 : 1} />
                                )}
                                <text x={COL_CX} y={y + BOX_H / 2 + 5} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.body} fontWeight={active ? 700 : 500}>
                                    {info.label}
                                </text>
                            </motion.g>
                        );
                    })}

                    {/* 화살표 */}
                    {yPos.slice(0, -1).map((y, i) => (
                        <g key={i}>
                            <line x1={COL_CX} y1={y + BOX_H} x2={COL_CX} y2={y + BOX_H + GAP_Y - 4} stroke="#4b5563" strokeWidth={1.5} />
                            <polygon points={`${COL_CX - 4},${y + BOX_H + GAP_Y - 8} ${COL_CX},${y + BOX_H + GAP_Y - 2} ${COL_CX + 4},${y + BOX_H + GAP_Y - 8}`} fill="#4b5563" />
                        </g>
                    ))}
                </svg>

                {/* 우측: 웨이퍼 다이 격자 (Step & Repeat 시각화) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <svg viewBox={`0 0 ${WFR_SIZE} ${WFR_SIZE}`} width={180}>
                        {/* 웨이퍼 원 */}
                        <circle cx={WFR_CX} cy={WFR_CY} r={WFR_R} fill="rgba(161,161,170,0.06)" stroke="rgba(161,161,170,0.25)" strokeWidth={1} />
                        {/* 노치 */}
                        <line x1={WFR_CX - 6} y1={WFR_CY + WFR_R} x2={WFR_CX + 6} y2={WFR_CY + WFR_R} stroke="rgba(161,161,170,0.4)" strokeWidth={2} />

                        {/* 다이 격자 */}
                        {SCAN_ORDER.map((die, idx) => {
                            const isActive = idx === activeDie;
                            const isDone = idx < activeDie;
                            return (
                                <rect key={`${die.col}-${die.row}`}
                                    x={die.x + 0.5} y={die.y + 0.5} width={DIE_W - 1} height={DIE_H - 1} rx={1}
                                    fill={isActive ? 'rgba(251,191,36,0.5)' : isDone ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)'}
                                    stroke={isActive ? '#fbbf24' : isDone ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}
                                    strokeWidth={isActive ? 1.5 : 0.5} />
                            );
                        })}
                    </svg>
                    <div style={{ fontSize: FONT.min, color: COLOR.textDim, textAlign: 'center' }}>
                        Step & Repeat
                    </div>
                </div>

                {/* 설명 패널 */}
                <div style={{ width: 240, minHeight: 80 }}>
                    <AnimatePresence mode="wait">
                        {hovered ? (
                            <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                                style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px' }}>
                                <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STEPS[hovered].color, marginBottom: 2 }}>
                                    {STEPS[hovered].label}
                                </div>
                                <div style={{ fontSize: FONT.min, color: COLOR.textDim, marginBottom: 4 }}>
                                    {STEPS[hovered].sub}
                                </div>
                                <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                    {STEPS[hovered].desc}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                                style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px' }}>
                                <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                    각 요소를 호버하여 설명을 확인하세요. 우측 웨이퍼에서 다이가 순차적으로 노광되는 과정을 볼 수 있습니다.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
