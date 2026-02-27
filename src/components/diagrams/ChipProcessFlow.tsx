'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StepId = 'wafer' | 'frontend' | 'oxidation' | 'deposition' | 'litho' | 'etch' | 'implant' | 'cmp' | 'backend' | 'test' | 'ship' | null;

interface StepInfo {
    label: string;
    sub?: string;
    desc: string;
}

const stepData: Record<Exclude<StepId, null>, StepInfo> = {
    wafer: { label: '실리콘 웨이퍼 제조', sub: 'Silicon Wafer', desc: '고순도 실리콘 잉곳을 얇게 잘라 연마한 원판. 모든 반도체의 출발점.' },
    frontend: { label: '전공정', sub: 'Front-End', desc: '트랜지스터와 회로를 형성하는 핵심 공정 단계. 아래 6개 세부 공정을 수십~수백 회 반복한다.' },
    oxidation: { label: '산화', sub: 'Oxidation', desc: '웨이퍼 표면에 SiO₂ 절연막을 성장시키는 공정.' },
    deposition: { label: '증착', sub: 'Deposition', desc: '화학기상증착(CVD) 등으로 박막을 쌓는 공정.' },
    litho: { label: '포토리소그래피', sub: 'Photolithography', desc: '빛으로 회로 패턴을 웨이퍼에 전사하는 핵심 공정. 전체 비용의 30~35%.' },
    etch: { label: '식각', sub: 'Etching', desc: '불필요한 부분을 깎아내어 패턴을 형성하는 공정.' },
    implant: { label: '이온 주입', sub: 'Ion Implantation', desc: '불순물 이온을 주입하여 N형/P형 영역을 만드는 공정.' },
    cmp: { label: 'CMP', sub: 'Chemical Mechanical Polish', desc: '표면을 화학적·기계적으로 평탄화하는 공정.' },
    backend: { label: '후공정', sub: 'Back-End', desc: '금속 배선을 형성하여 트랜지스터들을 연결하는 공정.' },
    test: { label: '테스트 & 패키징', sub: 'Test & Packaging', desc: '웨이퍼 검사, 다이싱, 패키지 조립, 최종 테스트.' },
    ship: { label: '출하', sub: 'Shipment', desc: '품질 검증을 통과한 완성 칩을 고객에게 전달.' },
};

function Arrow() {
    return (
        <svg width="24" height="16" viewBox="0 0 24 16" className="flex-shrink-0">
            <line x1="0" y1="8" x2="16" y2="8" stroke="#4b5563" strokeWidth="1.5" />
            <polygon points="14,3 22,8 14,13" fill="#4b5563" />
        </svg>
    );
}

function StepBox({
    id,
    isHovered,
    isDimmed,
    onHover,
    onMouseMove,
    highlight,
    compact,
}: {
    id: Exclude<StepId, null>;
    isHovered: boolean;
    isDimmed: boolean;
    onHover: (id: StepId) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    highlight?: boolean;
    compact?: boolean;
}) {
    const info = stepData[id];
    return (
        <motion.div
            onMouseEnter={() => onHover(id)}
            onMouseMove={onMouseMove}
            animate={{ opacity: isDimmed ? 0.35 : 1, scale: isHovered ? 1.04 : 1 }}
            transition={{ duration: 0.15 }}
            style={{
                background: isHovered
                    ? 'rgba(255,255,255,0.08)'
                    : highlight
                        ? 'rgba(129, 140, 248, 0.1)'
                        : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isHovered ? '#818cf8' : highlight ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: compact ? 6 : 8,
                padding: compact ? '6px 10px' : '8px 14px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: isHovered ? '0 0 12px rgba(129,140,248,0.15)' : 'none',
                flex: compact ? '1 1 0' : undefined,
                minWidth: compact ? 0 : undefined,
            }}
        >
            <div style={{ color: '#e4e4e7', fontSize: compact ? 12 : 13, fontWeight: 600, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                {info.label}
            </div>
            {info.sub && (
                <div style={{ color: '#71717a', fontSize: compact ? 9 : 10, marginTop: 1 }}>
                    {info.sub}
                </div>
            )}
        </motion.div>
    );
}

export default function ChipProcessFlow() {
    const [hovered, setHovered] = useState<StepId>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };

    const isDimmed = (id: StepId) => hovered !== null && hovered !== id;
    const bp = (id: Exclude<StepId, null>, opts?: { highlight?: boolean; compact?: boolean }) => ({
        id,
        isHovered: hovered === id,
        isDimmed: isDimmed(id),
        onHover: setHovered,
        onMouseMove: handleMouseMove,
        ...opts,
    });

    return (
        <div className="my-8 relative" ref={containerRef} onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 16 }}>
                칩 제조 공정 흐름
            </h3>

            {/* Row 1: 대공정 흐름 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                <StepBox {...bp('wafer')} />
                <Arrow />
                <StepBox {...bp('frontend', { highlight: true })} />
                <Arrow />
                <StepBox {...bp('backend')} />
                <Arrow />
                <StepBox {...bp('test')} />
                <Arrow />
                <StepBox {...bp('ship')} />
            </div>

            {/* Row 2: 전공정 세부 */}
            <div style={{
                border: '1px solid rgba(129, 140, 248, 0.2)',
                borderRadius: 10,
                padding: '10px 12px',
                background: 'rgba(129, 140, 248, 0.03)',
            }}>
                <div style={{ color: '#818cf8', fontSize: FONT.small, fontWeight: 600, textAlign: 'center', marginBottom: 8 }}>
                    ↑ 전공정 세부 공정 (수십~수백 회 반복)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <StepBox {...bp('oxidation', { compact: true })} />
                    <Arrow />
                    <StepBox {...bp('deposition', { compact: true })} />
                    <Arrow />
                    <StepBox {...bp('litho', { compact: true, highlight: true })} />
                    <Arrow />
                    <StepBox {...bp('etch', { compact: true })} />
                    <Arrow />
                    <StepBox {...bp('implant', { compact: true })} />
                    <Arrow />
                    <StepBox {...bp('cmp', { compact: true })} />
                </div>
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
                        style={{ left: Math.min(tooltipPos.x + 16, 500), top: tooltipPos.y - 60 }}
                    >
                        <div style={{
                            background: 'rgba(24, 24, 27, 0.95)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            padding: '10px 14px',
                            maxWidth: 260,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        }}>
                            <p style={{ color: '#818cf8', fontWeight: 600, fontSize: FONT.cardHeader, margin: '0 0 4px' }}>
                                {stepData[hovered].label}
                            </p>
                            <p style={{ color: COLOR.textMuted, fontSize: FONT.subtitle, margin: 0, lineHeight: 1.5 }}>
                                {stepData[hovered].desc}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
