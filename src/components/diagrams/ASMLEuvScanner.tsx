'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 스펙 데이터 ─── */
interface SpecItem {
    label: string;
    value: string;
    desc: string;
    color: string;
}

const SPECS: SpecItem[] = [
    { label: '파장', value: '13.5nm (EUV)', desc: 'ArF(193nm) 대비 1/14 파장. 더 미세한 패턴을 단일 노광으로 구현.', color: '#818cf8' },
    { label: '대당 가격', value: '~$2억 (High-NA ~$4억)', desc: '세계에서 가장 비싼 단일 제조 장비. ASML만이 유일하게 제조 가능.', color: '#ef4444' },
    { label: '크기', value: '약 버스 1대 크기', desc: '길이 ~13m, 무게 ~180톤. 설치에 40개 컨테이너, 250명 인력, 6개월 소요.', color: '#22c55e' },
    { label: '전력 소비', value: '~1MW', desc: '한 대가 일반 가정 수백 가구 전력을 소비. 팹 전력의 상당 부분을 차지.', color: '#f59e0b' },
    { label: '처리 속도', value: '시간당 ~160장', desc: '300mm 웨이퍼 기준. ArF 대비 낮지만 멀티 패터닝 불필요로 총 효율 우수.', color: '#3b82f6' },
];

export default function ASMLEuvScanner() {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="my-8 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                ASML EUV 노광기
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                ASML EUV Lithography Scanner — NXE:3400C
            </p>

            {/* Image + Overlay */}
            <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto', borderRadius: 12, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)' }}>
                <img src="/content/images/01_10/asml_euv_scanner.png" alt="ASML EUV 노광기"
                    style={{ width: '100%', display: 'block', filter: hovered !== null ? 'brightness(0.6)' : 'brightness(0.85)',
                        transition: 'filter 0.3s' }} />

                {/* Spec overlay on hover */}
                <AnimatePresence>
                    {hovered !== null && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: 24 }}>
                            <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 12,
                                padding: '20px 24px', maxWidth: 360 }}>
                                <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: SPECS[hovered].color, marginBottom: 6 }}>
                                    {SPECS[hovered].label}: {SPECS[hovered].value}
                                </div>
                                <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.6 }}>
                                    {SPECS[hovered].desc}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Spec buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {SPECS.map((spec, idx) => (
                    <div key={spec.label}
                        onMouseEnter={() => setHovered(idx)} onMouseLeave={() => setHovered(null)}
                        style={{ cursor: 'pointer', padding: '5px 12px', borderRadius: 6,
                            background: hovered === idx ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${hovered === idx ? spec.color : 'rgba(255,255,255,0.06)'}`,
                            transition: 'all 0.15s' }}>
                        <span style={{ fontSize: FONT.min, color: hovered === idx ? spec.color : COLOR.textDim, fontWeight: hovered === idx ? 600 : 400 }}>
                            {spec.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
