'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 챕터 데이터 ─── */
interface ChapterInfo {
    id: string;
    label: string;
    desc: string;
    color: string;
    group: string;
}

const CHAPTERS: ChapterInfo[] = [
    { id: '2.1', label: '포토리소그래피란 ✅', desc: '사진 인화와의 유사성, 공정 흐름, 핵심 데이터 (CD, Overlay).', color: '#22c55e', group: '기초' },
    { id: '2.2', label: '노광 시스템', desc: '스테퍼 vs 스캐너. 스캔 방식의 원리와 TWINSCAN 듀얼 스테이지.', color: '#3b82f6', group: '기초' },
    { id: '2.3', label: '광원의 진화', desc: 'g-line → i-line → KrF → ArF → EUV. 파장 단축의 역사.', color: '#3b82f6', group: '기초' },
    { id: '2.4', label: '마스크와 펠리클', desc: '마스크 제작, 펠리클의 역할, EUV 마스크의 반사형 구조.', color: '#818cf8', group: '재료' },
    { id: '2.5', label: '포토레지스트', desc: 'CAR 원리, PAG/Quencher, EUV 레지스트, 감도/해상도/LWR 트레이드오프.', color: '#818cf8', group: '재료' },
    { id: '2.6', label: '해상도와 DOF', desc: 'Rayleigh 방정식, k1 팩터, NA, 프로세스 윈도우.', color: '#f59e0b', group: '물리' },
    { id: '2.7', label: 'OPC와 RET', desc: '광근접효과 보정, 위상시프트 마스크, 이머전 리소그래피.', color: '#f59e0b', group: '물리' },
    { id: '2.8', label: 'Overlay ①', desc: 'Overlay란 무엇인가, 측정 원리, 오차 분해 (Inter/Intra-field).', color: '#ef4444', group: 'Overlay' },
    { id: '2.9', label: 'Overlay ②', desc: 'APC(Advanced Process Control), 피드백/피드포워드 보정.', color: '#ef4444', group: 'Overlay' },
    { id: '2.10', label: 'Overlay ③', desc: 'AI 기반 Overlay 최적화. SMILE 플랫폼의 핵심 타겟.', color: '#ef4444', group: 'Overlay' },
    { id: '2.11', label: 'CD ①', desc: 'CD란 무엇인가, SEM/OCD 측정, CD 균일도(CDU).', color: '#c084fc', group: 'CD' },
    { id: '2.12', label: 'CD ②', desc: 'Dose-Focus 매트릭스, AI 기반 CD 최적화.', color: '#c084fc', group: 'CD' },
    { id: '2.13', label: '멀티 패터닝', desc: 'LELE, SADP, SAQP. 파장 한계를 넘는 미세화 기법.', color: '#fb923c', group: '심화' },
    { id: '2.14', label: 'EUV 리소그래피', desc: '13.5nm 극자외선. 반사광학계, 광원, High-NA EUV.', color: '#fb923c', group: '심화' },
];

export default function Part2Roadmap() {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    return (
        <div className="my-8 relative" onMouseLeave={() => setHoveredIdx(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Part 2 로드맵
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                Part 2: Photolithography Deep Dive — 14 Chapters
            </p>

            {/* 그리드 레이아웃 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6,
                maxWidth: 700, margin: '0 auto' }}>
                {CHAPTERS.map((ch, idx) => {
                    const active = hoveredIdx === idx;
                    const dim = hoveredIdx !== null && hoveredIdx !== idx;
                    return (
                        <motion.div key={ch.id}
                            onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}
                            animate={{ opacity: dim ? 0.25 : 1, scale: active ? 1.04 : 1 }}
                            transition={{ duration: 0.12 }}
                            style={{
                                background: active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${active ? ch.color : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: 8, padding: '8px 10px', cursor: 'pointer', textAlign: 'center',
                                boxShadow: active ? `0 0 10px ${ch.color}20` : 'none',
                            }}>
                            <div style={{ fontSize: FONT.min, fontWeight: 700, color: ch.color }}>{ch.id}</div>
                            <div style={{ fontSize: FONT.min - 1, color: COLOR.textMuted, marginTop: 2, lineHeight: 1.3 }}>{ch.label}</div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Tooltip */}
            <div style={{ maxWidth: 600, margin: '10px auto 0', height: 62 }}>
                <AnimatePresence mode="wait">
                    {hoveredIdx !== null && (
                        <motion.div key={hoveredIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: CHAPTERS[hoveredIdx].color, marginBottom: 2 }}>
                                {CHAPTERS[hoveredIdx].id} {CHAPTERS[hoveredIdx].label}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {CHAPTERS[hoveredIdx].desc}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
