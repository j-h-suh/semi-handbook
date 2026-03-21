'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 요소 데이터 ─── */
type PartId = 'barrel' | 'lens' | 'water' | 'nozzle' | 'wafer' | 'stage' | null;

interface PartInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const PARTS: Record<Exclude<PartId, null>, PartInfo> = {
    barrel: { label: '투영 렌즈 배럴', sub: 'Projection Lens Barrel', desc: '수십 장의 석영·형석 렌즈가 정밀 정렬된 원통형 하우징. 수백 kg의 광학계 전체를 감싸며, 최종 렌즈 소자가 맨 아래에 위치한다.', color: '#60a5fa' },
    lens: { label: '최종 렌즈 소자', sub: 'Last Lens Element', desc: '투영 렌즈계의 마지막 렌즈. 웨이퍼와의 간격(Working Distance)은 약 1~2mm. 이 좁은 간격에 물이 채워진다.', color: '#3b82f6' },
    water: { label: '초순수 막', sub: 'Water Meniscus (n=1.44)', desc: '렌즈와 웨이퍼 사이의 좁은 공간에만 존재하는 초순수(Ultra-Pure Water). 웨이퍼 전체를 담그는 것이 아니라, 렌즈 바로 아래 국소 영역에만 물막을 유지한다. 굴절률 1.44로 NA를 1.0 이상으로 확장.', color: '#06b6d4' },
    nozzle: { label: '급수/배수 노즐', sub: 'Supply & Recovery Nozzle', desc: '렌즈 주변에 배치된 노즐이 초순수를 공급하고 동시에 회수. 물막의 형태와 두께를 안정적으로 유지. 웨이퍼가 고속 이동 중에도 물이 뒤로 흘러내리지 않도록 제어.', color: '#22c55e' },
    wafer: { label: '웨이퍼 + 레지스트', sub: 'Topcoat 보호막', desc: '레지스트 위에 Topcoat(보호막)을 도포하여 레지스트 성분이 물에 용출되는 것을 방지. 이 용출이 렌즈를 오염시키는 Immersion Defect의 주요 원인이었다.', color: '#a1a1aa' },
    stage: { label: '웨이퍼 스테이지', sub: 'Scanning at ~600mm/s', desc: '스테이지가 고속 이동하면서 다이별로 스캔. 물막은 렌즈에 고정되고 웨이퍼가 아래를 통과하는 구조. 물이 뒤에 남으면 Watermark 결함이 발생하므로 완벽한 회수가 필수.', color: '#71717a' },
};

const PART_ORDER: Exclude<PartId, null>[] = ['barrel', 'lens', 'water', 'nozzle', 'wafer', 'stage'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 480;
const SVG_H = 430;
const CX = SVG_W / 2;

/* 좌표 상수 — 세로 여유 확보 */
const BARREL_Y = 60;
const BARREL_W = 110;
const BARREL_H = 130;
const LENS_Y = BARREL_Y + BARREL_H + 8;
const LENS_W = 130;
const LENS_H = 44;
const WATER_TOP = LENS_Y + LENS_H + 8;
const WATER_H = 65;
const WATER_BOT = WATER_TOP + WATER_H;
const WAFER_Y = WATER_BOT + 8;
const WAFER_H = 30;
const STAGE_Y = WAFER_Y + WAFER_H + 8;
const STAGE_H = 34;
const NOZZLE_W = 24;
const NOZZLE_GAP = 12;

export default function ImmersionStructure() {
    const [hovered, setHovered] = useState<PartId>(null);
    const isDimmed = (id: Exclude<PartId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                침수 리소그래피 실제 구조
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Immersion Lithography — Localized Water Meniscus
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={420} style={{ flexShrink: 0 }}>

                    {/* ── 투영렌즈 배럴 ── */}
                    <motion.g onMouseEnter={() => setHovered('barrel')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('barrel') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - BARREL_W / 2} y={BARREL_Y} width={BARREL_W} height={BARREL_H} rx={6} fill="transparent" />
                        {/* 배럴 몸통 */}
                        <rect x={CX - BARREL_W / 2} y={BARREL_Y} width={BARREL_W} height={BARREL_H} rx={6}
                            fill={hovered === 'barrel' ? 'rgba(96,165,250,0.2)' : 'rgba(96,165,250,0.08)'}
                            stroke={hovered === 'barrel' ? '#60a5fa' : 'rgba(96,165,250,0.4)'} strokeWidth={hovered === 'barrel' ? 2 : 1.2} />
                        {/* 내부 렌즈 힌트 (점선 타원 3개) */}
                        {[30, 60, 90].map(dy => (
                            <ellipse key={dy} cx={CX} cy={BARREL_Y + dy} rx={BARREL_W / 2 - 12} ry={6}
                                fill="none" stroke="rgba(96,165,250,0.3)" strokeWidth={1} strokeDasharray="4 3" />
                        ))}
                        <text x={CX} y={BARREL_Y + BARREL_H / 2 + 4} textAnchor="middle"
                            fill={hovered === 'barrel' ? '#60a5fa' : COLOR.textDim} fontSize={FONT.min} fontWeight={500}>
                            투영 렌즈 배럴
                        </text>
                        {/* 빛 표시 — 배럴 외부 좌측 텍스트만 */}
                        <text x={CX - BARREL_W / 2 - 14} y={BARREL_Y + BARREL_H / 2 + 4} textAnchor="end"
                            fill="rgba(251,191,36,0.7)" fontSize={FONT.min}>노광 빛 ↓</text>
                    </motion.g>

                    {/* ── 최종 렌즈 소자 ── */}
                    <motion.g onMouseEnter={() => setHovered('lens')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('lens') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - LENS_W / 2} y={LENS_Y} width={LENS_W} height={LENS_H} fill="transparent" />
                        {/* 렌즈 (타원) */}
                        <ellipse cx={CX} cy={LENS_Y + LENS_H / 2} rx={LENS_W / 2} ry={LENS_H / 2}
                            fill={hovered === 'lens' ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.12)'}
                            stroke={hovered === 'lens' ? '#3b82f6' : 'rgba(59,130,246,0.5)'} strokeWidth={hovered === 'lens' ? 2 : 1.2} />
                        <text x={CX} y={LENS_Y + LENS_H / 2 + 5} textAnchor="middle"
                            fill={hovered === 'lens' ? '#3b82f6' : COLOR.textMuted} fontSize={FONT.body} fontWeight={600}>
                            최종 렌즈 소자
                        </text>
                    </motion.g>

                    {/* ── 노즐 (좌우) ── */}
                    <motion.g onMouseEnter={() => setHovered('nozzle')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('nozzle') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        {/* 좌측 — 급수 */}
                        <rect x={CX - LENS_W / 2 - NOZZLE_GAP - NOZZLE_W} y={WATER_TOP - 10} width={NOZZLE_W} height={WATER_H + 16}
                            rx={4} fill={hovered === 'nozzle' ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.08)'}
                            stroke={hovered === 'nozzle' ? '#22c55e' : 'rgba(34,197,94,0.4)'} strokeWidth={hovered === 'nozzle' ? 1.5 : 1} />
                        <text x={CX - LENS_W / 2 - NOZZLE_GAP - NOZZLE_W / 2} y={WATER_TOP - 18}
                            textAnchor="middle" fill={hovered === 'nozzle' ? '#22c55e' : COLOR.textDim} fontSize={FONT.min}>급수</text>
                        {/* 급수 화살표 */}
                        <line x1={CX - LENS_W / 2 - NOZZLE_GAP} y1={WATER_TOP + 16} x2={CX - LENS_W / 2 - 2} y2={WATER_TOP + 16}
                            stroke="#22c55e" strokeWidth={1.2} opacity={0.6} markerEnd="url(#arrowGreen)" />
                        <line x1={CX - LENS_W / 2 - NOZZLE_GAP} y1={WATER_TOP + 32} x2={CX - LENS_W / 2 - 2} y2={WATER_TOP + 32}
                            stroke="#22c55e" strokeWidth={1.2} opacity={0.6} markerEnd="url(#arrowGreen)" />

                        {/* 우측 — 배수 */}
                        <rect x={CX + LENS_W / 2 + NOZZLE_GAP} y={WATER_TOP - 10} width={NOZZLE_W} height={WATER_H + 16}
                            rx={4} fill={hovered === 'nozzle' ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.08)'}
                            stroke={hovered === 'nozzle' ? '#22c55e' : 'rgba(34,197,94,0.4)'} strokeWidth={hovered === 'nozzle' ? 1.5 : 1} />
                        <text x={CX + LENS_W / 2 + NOZZLE_GAP + NOZZLE_W / 2} y={WATER_TOP - 18}
                            textAnchor="middle" fill={hovered === 'nozzle' ? '#22c55e' : COLOR.textDim} fontSize={FONT.min}>배수</text>
                        {/* 배수 화살표 */}
                        <line x1={CX + LENS_W / 2 + 2} y1={WATER_TOP + 16} x2={CX + LENS_W / 2 + NOZZLE_GAP} y2={WATER_TOP + 16}
                            stroke="#22c55e" strokeWidth={1.2} opacity={0.6} markerEnd="url(#arrowGreen)" />
                        <line x1={CX + LENS_W / 2 + 2} y1={WATER_TOP + 32} x2={CX + LENS_W / 2 + NOZZLE_GAP} y2={WATER_TOP + 32}
                            stroke="#22c55e" strokeWidth={1.2} opacity={0.6} markerEnd="url(#arrowGreen)" />
                    </motion.g>

                    {/* ── 물 (메니스커스) ── */}
                    <motion.g onMouseEnter={() => setHovered('water')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('water') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - LENS_W / 2 - 6} y={WATER_TOP} width={LENS_W + 12} height={WATER_H} fill="transparent" />
                        {/* 물막 형태 — 아래쪽 볼록 */}
                        <path d={`M ${CX - LENS_W / 2 - 2},${WATER_TOP} L ${CX + LENS_W / 2 + 2},${WATER_TOP} L ${CX + LENS_W / 2 + 8},${WATER_BOT} Q ${CX},${WATER_BOT + 12} ${CX - LENS_W / 2 - 8},${WATER_BOT} Z`}
                            fill={hovered === 'water' ? 'rgba(6,182,212,0.3)' : 'rgba(6,182,212,0.15)'}
                            stroke={hovered === 'water' ? '#06b6d4' : 'rgba(6,182,212,0.45)'} strokeWidth={hovered === 'water' ? 1.5 : 1} />
                        {/* 빛이 물을 통과하는 표시 */}
                        <polygon points={`${CX - 16},${WATER_TOP} ${CX + 16},${WATER_TOP} ${CX + 10},${WATER_BOT - 4} ${CX - 10},${WATER_BOT - 4}`}
                            fill="rgba(251,191,36,0.15)" stroke="none" />
                        <text x={CX} y={WATER_TOP + WATER_H / 2 + 2} textAnchor="middle"
                            fill={hovered === 'water' ? '#06b6d4' : 'rgba(6,182,212,0.6)'} fontSize={FONT.body} fontWeight={600}>
                            H₂O
                        </text>
                        <text x={CX} y={WATER_TOP + WATER_H / 2 + 18} textAnchor="middle"
                            fill={hovered === 'water' ? '#06b6d4' : 'rgba(6,182,212,0.4)'} fontSize={FONT.min}>
                            n = 1.44
                        </text>
                    </motion.g>

                    {/* ── 웨이퍼 ── */}
                    <motion.g onMouseEnter={() => setHovered('wafer')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('wafer') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - 180} y={WAFER_Y} width={360} height={WAFER_H} rx={2}
                            fill={hovered === 'wafer' ? 'rgba(161,161,170,0.25)' : 'rgba(161,161,170,0.15)'}
                            stroke={hovered === 'wafer' ? '#a1a1aa' : 'rgba(161,161,170,0.5)'} strokeWidth={hovered === 'wafer' ? 1.5 : 1} />
                        {/* Topcoat 층 */}
                        <rect x={CX - 180} y={WAFER_Y} width={360} height={4} rx={1}
                            fill="rgba(251,191,36,0.2)" />
                        {/* 라벨 — 웨이퍼 안에 */}
                        <text x={CX} y={WAFER_Y + 10} textAnchor="middle"
                            fill="rgba(251,191,36,0.6)" fontSize={FONT.min}>Topcoat</text>
                        <text x={CX} y={WAFER_Y + WAFER_H - 6} textAnchor="middle"
                            fill={hovered === 'wafer' ? '#a1a1aa' : COLOR.textMuted} fontSize={FONT.min}>레지스트 + 웨이퍼</text>
                    </motion.g>

                    {/* ── 스테이지 ── */}
                    <motion.g onMouseEnter={() => setHovered('stage')} onMouseLeave={() => setHovered(null)}
                        animate={{ opacity: isDimmed('stage') ? 0.2 : 1 }} style={{ cursor: 'pointer' }}>
                        <rect x={CX - 190} y={STAGE_Y} width={380} height={STAGE_H} rx={4}
                            fill={hovered === 'stage' ? 'rgba(113,113,122,0.2)' : 'rgba(113,113,122,0.1)'}
                            stroke={hovered === 'stage' ? '#71717a' : 'rgba(113,113,122,0.35)'} strokeWidth={hovered === 'stage' ? 1.5 : 1} />
                        <text x={CX} y={STAGE_Y + STAGE_H / 2 + 5} textAnchor="middle"
                            fill={hovered === 'stage' ? '#71717a' : COLOR.textDim} fontSize={FONT.body}>
                            웨이퍼 스테이지
                        </text>
                    </motion.g>

                    {/* ── 주석: 물 없는 영역 ── */}
                    <g opacity={isDimmed('water') ? 0.1 : 0.6}>
                        <text x={CX + LENS_W / 2 + NOZZLE_GAP + NOZZLE_W + 20} y={WATER_TOP + WATER_H / 2 + 4}
                            fill="#ef4444" fontSize={FONT.min} fontWeight={600}>
                            ← 이쪽에는 물 없음
                        </text>
                        <line x1={CX + LENS_W / 2 + NOZZLE_GAP + NOZZLE_W + 4} y1={WATER_TOP + WATER_H / 2}
                            x2={CX + LENS_W / 2 + NOZZLE_GAP + NOZZLE_W + 16} y2={WATER_TOP + WATER_H / 2}
                            stroke="rgba(239,68,68,0.3)" strokeWidth={1} />
                    </g>

                    {/* ── Working Distance 치수선 — 좌측 노즐 옆 ── */}
                    <g opacity={0.5}>
                        {(() => {
                            const dimX = CX - LENS_W / 2 - NOZZLE_GAP - NOZZLE_W - 16;
                            return (<>
                                <line x1={dimX} y1={LENS_Y + LENS_H} x2={dimX} y2={WAFER_Y}
                                    stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
                                <line x1={dimX - 3} y1={LENS_Y + LENS_H} x2={dimX + 3} y2={LENS_Y + LENS_H}
                                    stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
                                <line x1={dimX - 3} y1={WAFER_Y} x2={dimX + 3} y2={WAFER_Y}
                                    stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
                                <text x={dimX - 6} y={(LENS_Y + LENS_H + WAFER_Y) / 2 + 4} textAnchor="end"
                                    fill={COLOR.textDim} fontSize={FONT.min}>~1mm</text>
                            </>);
                        })()}
                    </g>

                    {/* 마커 */}
                    <defs>
                        <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                            <polygon points="0,0 6,3 0,6" fill="#22c55e" opacity={0.6} />
                        </marker>
                        <marker id="arrowGray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                            <polygon points="0,0 6,3 0,6" fill="#71717a" opacity={0.4} />
                        </marker>
                        <marker id="arrowGrayL" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
                            <polygon points="6,0 0,3 6,6" fill="#71717a" opacity={0.4} />
                        </marker>
                        <marker id="arrowYellow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                            <polygon points="0,0 6,3 0,6" fill="#fbbf24" opacity={0.6} />
                        </marker>
                    </defs>
                </svg>

                {/* 우측 요소 버튼 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 200, marginTop: 20 }}>
                    {PART_ORDER.map(id => {
                        const info = PARTS[id];
                        const active = hovered === id;
                        return (
                            <motion.div key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: active || hovered === null ? 1 : 0.3 }}
                                style={{ background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${active ? info.color + '40' : 'rgba(255,255,255,0.06)'}`,
                                    borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>
                                <div style={{ fontSize: FONT.min, fontWeight: 600, color: active ? info.color : COLOR.textMuted }}>{info.label}</div>
                                <div style={{ fontSize: FONT.min, color: COLOR.textDim }}>{info.sub}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 하단 툴팁 */}
            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 70 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: PARTS[hovered].color, marginBottom: 2 }}>
                                {PARTS[hovered].label} — {PARTS[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {PARTS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 요소를 호버하여 구조를 확인하세요. 웨이퍼 전체가 물에 잠기는 것이 아니라, 렌즈 바로 아래에만 국소적으로 물막을 형성합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
