'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StageId = 'ingot' | 'slicing' | 'lapping' | 'etching' | 'cmp' | null;

interface StageInfo {
    label: string;
    sub: string;
    color: string;
    surface: 'rough' | 'lessRough' | 'clean' | 'mirror';
    details: string[];
    spec: string;
    tool: string;
}

const stages: Record<Exclude<StageId, 'ingot' | null>, StageInfo> = {
    slicing: {
        label: '① 슬라이싱',
        sub: 'Slicing',
        color: '#3b82f6',
        surface: 'rough',
        details: [
            '다이아몬드 와이어 소로 잉곳 절단',
            '한 번에 수백 장 동시 절단',
            '잉곳 1개 → 200~300장 웨이퍼',
        ],
        spec: '725~775μm',
        tool: '다이아몬드 와이어 소',
    },
    lapping: {
        label: '② 래핑',
        sub: 'Lapping',
        color: '#22c55e',
        surface: 'lessRough',
        details: [
            '연마재로 양면을 갈아 평탄화',
            '두께 편차 < 수 μm으로 줄임',
            '서브서피스 손상(Sub-surface Damage) 잔존',
        ],
        spec: '두께 편차 < 수μm',
        tool: '연마재',
    },
    etching: {
        label: '③ 에칭',
        sub: 'Etching',
        color: '#f59e0b',
        surface: 'clean',
        details: [
            '화학 용액으로 손상층 제거',
            '깨끗한 단결정면 노출',
            '눈에 보이지 않는 결함 제거',
        ],
        spec: '손상층 완전 제거',
        tool: '화학 용액',
    },
    cmp: {
        label: '④ CMP',
        sub: 'Polishing',
        color: '#8b5cf6',
        surface: 'mirror',
        details: [
            '화학 반응 + 기계적 연마 동시 적용',
            '슬러리가 표면을 녹이고 패드가 밀어냄',
            '축구장 크기에서 0.5mm 이하 편차',
        ],
        spec: '< 0.2nm RMS',
        tool: '슬러리 + 패드',
    },
};

const stageOrder: Exclude<StageId, 'ingot' | null>[] = ['slicing', 'lapping', 'etching', 'cmp'];

/* Wafer cross-section surface visualization */
function WaferCrossSection({ surface }: { surface: StageInfo['surface'] }) {
    const h = 55;
    const w = 140;
    return (
        <svg width={w} height={h + 10} viewBox={`0 0 ${w} ${h + 10}`}>
            <defs>
                <filter id="mirrorGlow" x="-20%" y="-50%" width="140%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="glow" />
                    <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            {/* Main body */}
            <rect x={5} y={10} width={w - 10} height={h - 10} rx={2}
                fill="#93c5fd" fillOpacity={0.25}
                stroke="#60a5fa" strokeWidth={1}
            />
            {/* Top surface */}
            {surface === 'rough' && (
                <>
                    <polyline points="5,10 15,7 25,13 35,6 45,14 55,8 65,12 75,6 85,13 95,7 105,12 115,9" fill="none" stroke="#f87171" strokeWidth={2} />
                    <rect x={5} y={5} width={w - 10} height={8} rx={1} fill="#f87171" fillOpacity={0.15} />
                </>
            )}
            {surface === 'lessRough' && (
                <>
                    <polyline points="5,10 15,9 25,11 35,9 45,11 55,9 65,11 75,9 85,11 95,9 105,11 115,10" fill="none" stroke="#fbbf24" strokeWidth={1.5} />
                    <rect x={5} y={7} width={w - 10} height={6} rx={1} fill="#fbbf24" fillOpacity={0.12} />
                </>
            )}
            {surface === 'clean' && (
                <>
                    <rect x={5} y={7} width={w - 10} height={6} rx={1} fill="#4ade80" fillOpacity={0.08} />
                    <line x1={5} y1={10} x2={w - 5} y2={10} stroke="#4ade80" strokeWidth={2} />
                </>
            )}
            {surface === 'mirror' && (
                <>
                    {/* Bright glowing top surface line = mirror polish */}
                    <line x1={5} y1={10} x2={w - 5} y2={10} stroke="white" strokeWidth={2} filter="url(#mirrorGlow)" />
                    <line x1={5} y1={10} x2={w - 5} y2={10} stroke="#c4b5fd" strokeWidth={1.5} />
                </>
            )}
            {/* Bottom surface (mirrors top) */}
            {surface === 'rough' && (
                <rect x={5} y={h - 5} width={w - 10} height={8} rx={1} fill="#f87171" fillOpacity={0.15} />
            )}
            {surface === 'lessRough' && (
                <rect x={5} y={h - 3} width={w - 10} height={6} rx={1} fill="#fbbf24" fillOpacity={0.12} />
            )}
        </svg>
    );
}

/* Ingot illustration */
function IngotIcon() {
    return (
        <svg width={90} height={170} viewBox="0 0 90 170">
            {/* Cylinder body */}
            <ellipse cx={45} cy={20} rx={34} ry={10} fill="#93c5fd" fillOpacity={0.3} stroke="#60a5fa" strokeWidth={1} />
            <rect x={11} y={20} width={68} height={105} fill="#93c5fd" fillOpacity={0.2} stroke="#60a5fa" strokeWidth={1} />
            <ellipse cx={45} cy={125} rx={34} ry={10} fill="#60a5fa" fillOpacity={0.3} stroke="#60a5fa" strokeWidth={1} />
            {/* Slicing direction lines */}
            <line x1={11} y1={42} x2={79} y2={42} stroke="#f87171" strokeWidth={0.6} strokeDasharray="4 3" />
            <line x1={11} y1={60} x2={79} y2={60} stroke="#f87171" strokeWidth={0.6} strokeDasharray="4 3" />
            <line x1={11} y1={78} x2={79} y2={78} stroke="#f87171" strokeWidth={0.6} strokeDasharray="4 3" />
            <line x1={11} y1={96} x2={79} y2={96} stroke="#f87171" strokeWidth={0.6} strokeDasharray="4 3" />
            <line x1={11} y1={114} x2={79} y2={114} stroke="#f87171" strokeWidth={0.6} strokeDasharray="4 3" />
            {/* Dimension */}
            <text x={45} y={150} textAnchor="middle" fill="#a1a1aa" fontSize={11}>⌀300mm</text>
            <text x={45} y={164} textAnchor="middle" fill="#71717a" fontSize={10}>1.5~2m</text>
        </svg>
    );
}

function Arrow() {
    return (
        <svg width={24} height={16} viewBox="0 0 24 16" className="flex-shrink-0 mx-1">
            <line x1={0} y1={8} x2={16} y2={8} stroke="#4b5563" strokeWidth={1.5} />
            <polygon points="14,3 22,8 14,13" fill="#4b5563" />
        </svg>
    );
}

export default function IngotToWafer() {
    const [hovered, setHovered] = useState<StageId>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };

    const isDimmed = (id: StageId) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" ref={containerRef} onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                잉곳에서 웨이퍼까지의 가공 단계
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Ingot to Wafer Process
            </p>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                {[
                    { color: '#f87171', label: '손상층' },
                    { color: '#fbbf24', label: '미세 손상' },
                    { color: '#4ade80', label: '세정면' },
                    { color: '#818cf8', label: '경면' },
                ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
                        <span style={{ color: COLOR.textDim, fontSize: FONT.min }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Main flow */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, overflow: 'visible', padding: '8px 16px' }}>
                {/* Ingot */}
                <motion.div
                    animate={{ opacity: isDimmed('ingot') ? 0.35 : 1 }}
                    onMouseEnter={() => setHovered('ingot')}
                    onMouseMove={handleMouseMove}
                    style={{ textAlign: 'center', cursor: 'pointer', padding: '8px 12px' }}
                >
                    <IngotIcon />
                    <div style={{ color: COLOR.textBright, fontSize: FONT.cardHeader, fontWeight: 600, marginTop: 4 }}>잉곳</div>
                    <div style={{ color: COLOR.textDim, fontSize: FONT.min }}>Ingot</div>
                </motion.div>

                {/* 4 Stages */}
                {stageOrder.map((id, i) => {
                    const stage = stages[id];
                    return (
                        <React.Fragment key={id}>
                            <motion.div
                                onMouseEnter={() => setHovered(id)}
                                onMouseMove={handleMouseMove}
                                animate={{ opacity: isDimmed(id) ? 0.35 : 1, scale: hovered === id ? 1.03 : 1 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    background: hovered === id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${hovered === id ? stage.color : 'rgba(255,255,255,0.06)'}`,
                                    borderRadius: 10,
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    minWidth: 150,
                                    boxShadow: hovered === id ? `0 0 16px ${stage.color}22` : 'none',
                                }}
                            >
                                {/* Header */}
                                <div style={{
                                    background: stage.color,
                                    borderRadius: 6,
                                    padding: '5px 0',
                                    marginBottom: 8,
                                }}>
                                    <div style={{ color: 'white', fontSize: FONT.cardHeader, fontWeight: 700 }}>{stage.label}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: FONT.min }}>{stage.sub}</div>
                                </div>
                                {/* Cross-section */}
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                                    <WaferCrossSection surface={stage.surface} />
                                </div>
                                {/* Spec */}
                                <div style={{
                                    color: stage.color,
                                    fontSize: FONT.small,
                                    fontWeight: 600,
                                    marginBottom: 4,
                                }}>
                                    {stage.spec}
                                </div>
                                {/* Tool */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: 4,
                                    padding: '4px 8px',
                                    fontSize: FONT.min,
                                    color: COLOR.textMuted,
                                }}>
                                    {stage.tool}
                                </div>
                            </motion.div>
                            {i < stageOrder.length - 1 && <Arrow />}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {hovered && hovered !== 'ingot' && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.12 }}
                        className="absolute pointer-events-none z-50"
                        style={{ left: Math.min(tooltipPos.x + 16, 500), top: tooltipPos.y - 80 }}
                    >
                        <div style={{
                            background: 'rgba(24, 24, 27, 0.95)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            padding: '10px 14px',
                            maxWidth: 280,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        }}>
                            <p style={{ color: stages[hovered as keyof typeof stages]?.color, fontWeight: 600, fontSize: FONT.cardHeader, margin: '0 0 6px' }}>
                                {stages[hovered as keyof typeof stages]?.label}
                            </p>
                            <ul style={{ margin: 0, paddingLeft: 16 }}>
                                {stages[hovered as keyof typeof stages]?.details.map((d, i) => (
                                    <li key={i} style={{ color: COLOR.textMuted, fontSize: FONT.small, lineHeight: 1.6 }}>{d}</li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
                {hovered === 'ingot' && (
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
                            <p style={{ color: '#60a5fa', fontWeight: 600, fontSize: FONT.cardHeader, margin: '0 0 4px' }}>
                                실리콘 잉곳 (Ingot)
                            </p>
                            <p style={{ color: COLOR.textMuted, fontSize: FONT.small, margin: 0, lineHeight: 1.5 }}>
                                직경 300mm, 길이 1.5~2m, 무게 100~150kg의 단결정 실리콘 기둥.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
