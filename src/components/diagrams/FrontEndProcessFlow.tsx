'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StepId =
    | 'oxidation' | 'deposition' | 'litho' | 'etch'
    | 'implant' | 'anneal' | 'cmp' | 'cleaning'
    | null;

interface StepInfo {
    num: number;
    label: string;
    sub: string;
    desc: string;
    color: string;
    highlight?: boolean;
}

const steps: Record<Exclude<StepId, null>, StepInfo> = {
    oxidation: {
        num: 1, label: '산화', sub: 'Oxidation', color: '#3b82f6',
        desc: '웨이퍼 표면에 SiO₂ 절연막을 성장시키는 공정. 게이트 산화막, 소자 분리(STI), 표면 보호 역할.',
    },
    deposition: {
        num: 2, label: '증착', sub: 'Deposition', color: '#06b6d4',
        desc: 'CVD·PVD·ALD 등으로 원하는 재료(산화막, 질화막, 금속)를 웨이퍼 위에 쌓는 공정.',
    },
    litho: {
        num: 3, label: '포토리소그래피', sub: 'Photolithography', color: '#f97316',
        desc: '빛(UV/EUV)으로 회로 패턴을 웨이퍼에 전사하는 핵심 공정. 전체 비용의 30~35%, 5nm급 칩 기준 80회 이상.',
        highlight: true,
    },
    etch: {
        num: 4, label: '식각', sub: 'Etching', color: '#ef4444',
        desc: '플라즈마(건식) 또는 화학 용액(습식)으로 불필요한 부분을 깎아내어 패턴을 형성.',
    },
    implant: {
        num: 5, label: '이온 주입', sub: 'Ion Implantation', color: '#8b5cf6',
        desc: '불순물 이온을 가속하여 웨이퍼의 특정 영역에 주입. N형/P형 영역을 만들어 트랜지스터 특성을 결정.',
    },
    anneal: {
        num: 6, label: '확산/어닐링', sub: 'Annealing', color: '#ec4899',
        desc: '고온 열처리로 이온 주입 손상을 복구하고 도핑 원자를 전기적으로 활성화.',
    },
    cmp: {
        num: 7, label: 'CMP', sub: '평탄화', color: '#22c55e',
        desc: '슬러리 + 패드로 표면을 평탄화. 다층 배선 구조와 정밀 포토리소그래피를 위한 필수 공정.',
    },
    cleaning: {
        num: 8, label: '세정', sub: 'Cleaning', color: '#64748b',
        desc: '전체 스텝의 약 30%. 매 공정 사이마다 파티클·금속 오염·유기물을 제거하여 결함을 방지.',
    },
};

const row1: Exclude<StepId, null>[] = ['oxidation', 'deposition', 'litho', 'etch'];
const row2: Exclude<StepId, null>[] = ['cleaning', 'cmp', 'anneal', 'implant']; // reversed for snake layout (4→5 connects naturally)

function Arrow() {
    return (
        <svg width={28} height={16} viewBox="0 0 28 16" className="flex-shrink-0">
            <line x1={2} y1={8} x2={20} y2={8} stroke="#4b5563" strokeWidth={1.5} />
            <polygon points="18,3 26,8 18,13" fill="#4b5563" />
        </svg>
    );
}

function StepBox({
    id,
    hovered,
    hoveredId,
    onHover,
    onMouseMove,
}: {
    id: Exclude<StepId, null>;
    hovered: boolean;
    hoveredId: StepId;
    onHover: (id: StepId) => void;
    onMouseMove: (e: React.MouseEvent) => void;
}) {
    const step = steps[id];
    const isDimmed = hoveredId !== null && !hovered;

    return (
        <motion.div
            onMouseEnter={() => onHover(id)}
            onMouseMove={onMouseMove}
            animate={{ opacity: isDimmed ? 0.35 : 1, scale: hovered ? 1.04 : 1 }}
            transition={{ duration: 0.15 }}
            style={{
                background: hovered
                    ? 'rgba(255,255,255,0.08)'
                    : step.highlight
                        ? `${step.color}18`
                        : 'rgba(255,255,255,0.03)',
                border: `1px solid ${hovered ? step.color : step.highlight ? `${step.color}50` : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10,
                padding: '10px 8px',
                cursor: 'pointer',
                textAlign: 'center',
                flex: '1 1 0',
                minWidth: 0,
                boxShadow: hovered ? `0 0 16px ${step.color}22` : 'none',
            }}
        >
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: step.color,
                color: 'white',
                fontSize: FONT.min,
                fontWeight: 700,
                marginBottom: 6,
            }}>
                {step.num}
            </div>
            <div style={{
                color: step.highlight ? step.color : COLOR.textBright,
                fontSize: FONT.cardHeader,
                fontWeight: 700,
                lineHeight: 1.3,
            }}>
                {step.label}
            </div>
            <div style={{ color: COLOR.textDim, fontSize: FONT.min, marginTop: 2 }}>
                {step.sub}
            </div>
            {step.highlight && (
                <div style={{
                    marginTop: 6,
                    background: `${step.color}20`,
                    border: `1px solid ${step.color}40`,
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 11,
                    color: step.color,
                    fontWeight: 600,
                }}>
                    ⭐ 핵심 공정
                </div>
            )}
        </motion.div>
    );
}

export default function FrontEndProcessFlow() {
    const [hovered, setHovered] = useState<StepId>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };

    return (
        <div className="my-8 relative" ref={containerRef} onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                전공정 8대 공정
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Front-End of Line (FEOL) — 수십~수백 회 반복
            </p>

            {/* Row 1: Steps 1–4 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {row1.map((id, i) => (
                    <React.Fragment key={id}>
                        <StepBox id={id} hovered={hovered === id} hoveredId={hovered} onHover={setHovered} onMouseMove={handleMouseMove} />
                        {i < row1.length - 1 && <Arrow />}
                    </React.Fragment>
                ))}
            </div>

            {/* Arrows between rows: 8→1 (left, dashed up) and 4→5 (right, solid down) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0 20px' }}>
                {/* 8→1: dashed upward arrow aligned with first column */}
                <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'center' }}>
                    <svg width={16} height={24} viewBox="0 0 16 24">
                        <line x1={8} y1={22} x2={8} y2={6} stroke="#4b5563" strokeWidth={1.5} strokeDasharray="4 3" />
                        <polygon points="3,8 8,1 13,8" fill="#4b5563" />
                    </svg>
                </div>
                <div style={{ width: 28 }} />
                <div style={{ flex: '1 1 0' }} />
                <div style={{ width: 28 }} />
                <div style={{ flex: '1 1 0' }} />
                <div style={{ width: 28 }} />
                {/* 4→5: solid downward arrow aligned with last column */}
                <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'center' }}>
                    <svg width={16} height={24} viewBox="0 0 16 24">
                        <line x1={8} y1={2} x2={8} y2={18} stroke="#4b5563" strokeWidth={1.5} />
                        <polygon points="3,16 8,23 13,16" fill="#4b5563" />
                    </svg>
                </div>
            </div>

            {/* Row 2: Steps 8←7←6←5 (reversed, snake layout) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {row2.map((id, i) => (
                    <React.Fragment key={id}>
                        <StepBox id={id} hovered={hovered === id} hoveredId={hovered} onHover={setHovered} onMouseMove={handleMouseMove} />
                        {i < row2.length - 1 && (
                            <svg width={28} height={16} viewBox="0 0 28 16" className="flex-shrink-0" style={{ transform: 'scaleX(-1)' }}>
                                <line x1={2} y1={8} x2={20} y2={8} stroke="#4b5563" strokeWidth={1.5} />
                                <polygon points="18,3 26,8 18,13" fill="#4b5563" />
                            </svg>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.12 }}
                        className="absolute pointer-events-none z-50"
                        style={{ left: Math.min(tooltipPos.x + 16, 500), top: tooltipPos.y - 70 }}
                    >
                        <div style={{
                            background: COLOR.tooltipBg,
                            backdropFilter: 'blur(8px)',
                            border: `1px solid ${COLOR.border}`,
                            borderRadius: 8,
                            padding: '10px 14px',
                            maxWidth: 280,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        }}>
                            <p style={{
                                color: steps[hovered].color,
                                fontWeight: 600,
                                fontSize: FONT.cardHeader,
                                margin: '0 0 4px',
                            }}>
                                {steps[hovered].num}. {steps[hovered].label}
                                <span style={{ color: COLOR.textDim, fontWeight: 400, fontSize: FONT.small, marginLeft: 6 }}>
                                    {steps[hovered].sub}
                                </span>
                            </p>
                            <p style={{ color: COLOR.textMuted, fontSize: FONT.small, margin: 0, lineHeight: 1.5 }}>
                                {steps[hovered].desc}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
