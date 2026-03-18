'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 스펙 카드 데이터 ─── */
type SpecId = 'resolution' | 'overlay' | 'throughput' | 'na' | 'field' | null;

interface SpecInfo {
    label: string;
    value: string;
    desc: string;
    color: string;
}

const SPECS: Record<Exclude<SpecId, null>, SpecInfo> = {
    resolution: { label: '해상도', value: '~36nm (SP)', desc: 'Single Patterning 기준 최소 패턴 크기. Multi-Patterning 적용 시 7nm 이하 노드까지 가능.', color: '#3b82f6' },
    overlay: { label: 'Overlay', value: '< 1.4nm (MMO)', desc: '층간 정렬 정확도. Machine Matched Overlay 기준. 원자 수 개 수준의 정밀도.', color: '#22c55e' },
    throughput: { label: '처리량', value: '~300 wph', desc: '시간당 웨이퍼 처리 수. 12초에 1장. 수백 개 다이를 나노미터 정밀도로 12초 안에 처리.', color: '#f59e0b' },
    na: { label: 'NA', value: '1.35', desc: '렌즈 집광 능력(Numerical Aperture). 침수(Immersion) 기술로 공기 한계 1.0을 넘어 1.35 달성.', color: '#8b5cf6' },
    field: { label: '노광 필드', value: '26 × 33mm', desc: '한 번에 노광하는 영역 크기. 슬릿 스캐닝으로 넓은 필드를 고해상도로 커버.', color: '#ef4444' },
};

const SPEC_ORDER: Exclude<SpecId, null>[] = ['resolution', 'overlay', 'throughput', 'na', 'field'];

export default function ASMLTwinscanScanner() {
    const [hovered, setHovered] = useState<SpecId>(null);

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                ArF 침수 스캐너 — ASML TWINSCAN NXT:2100i
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Core Performance Specifications
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* 이미지 */}
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)',
                    maxWidth: 360, flexShrink: 0 }}>
                    <img src="/content/images/02_02/asml_twinscan_scanner.png" alt="ASML TWINSCAN Scanner"
                        style={{ width: '100%', display: 'block', filter: 'brightness(0.9)' }} />
                </div>

                {/* 스펙 카드 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 280 }}>
                    {SPEC_ORDER.map(id => {
                        const spec = SPECS[id];
                        const active = hovered === id;
                        return (
                            <motion.div key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: hovered !== null && !active ? 0.3 : 1, scale: active ? 1.02 : 1 }}
                                transition={{ duration: 0.12 }}
                                style={{ background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${active ? spec.color + '40' : 'rgba(255,255,255,0.06)'}`,
                                    borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: FONT.small, fontWeight: 600, color: active ? spec.color : COLOR.textMuted }}>
                                    {spec.label}
                                </div>
                                <div style={{ fontSize: FONT.body, fontWeight: 700, color: active ? spec.color : COLOR.textBright }}>
                                    {spec.value}
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* 설명 */}
                    <div style={{ height: 62, marginTop: 4 }}>
                        <AnimatePresence mode="wait">
                            {hovered ? (
                                <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                                    style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px' }}>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                        {SPECS[hovered].desc}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                                    style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 12px' }}>
                                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                        각 스펙을 호버하여 상세 설명을 확인하세요. 최신 ArF 침수 스캐너의 핵심 성능 지표입니다.
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
