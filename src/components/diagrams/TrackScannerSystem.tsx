'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 스펙 ─── */
interface SpecItem { label: string; value: string; desc: string; color: string; }

const SPECS: SpecItem[] = [
    { label: 'TEL Track', value: '코터/디벨로퍼', desc: '포토레지스트 도포(Spin Coating), 베이크(Soft/Hard/PEB), 현상(Development)을 담당. 전 세계 시장의 ~90%를 TEL이 장악.', color: '#f59e0b' },
    { label: 'ASML Scanner', value: '노광 장비', desc: '마스크 패턴을 빛으로 웨이퍼에 전사하는 장비. DUV(TWINSCAN) 또는 EUV(NXE/NXT). 대당 $2~4억.', color: '#3b82f6' },
    { label: '인라인 연결', value: 'Wafer Transfer Bridge', desc: 'Track과 Scanner를 물리적으로 직결하는 밀폐형 웨이퍼 이송 브릿지. 대기 노출 없이 웨이퍼가 이동.', color: '#22c55e' },
    { label: 'FOUP', value: '웨이퍼 캐리어', desc: 'Front Opening Unified Pod. 25장의 300mm 웨이퍼를 보관·이송하는 밀폐 컨테이너. 자동화 시스템(AMHS)으로 이송.', color: '#818cf8' },
];

export default function TrackScannerSystem() {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="my-8 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Track + Scanner 인라인 시스템
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                TEL CLEAN TRACK + ASML TWINSCAN — Inline Lithography System
            </p>

            <div style={{ position: 'relative', maxWidth: 650, margin: '0 auto', borderRadius: 12, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)' }}>
                <img src="/content/images/02_01/track_scanner_inline_system.png" alt="Track + Scanner 인라인 시스템"
                    style={{ width: '100%', display: 'block', filter: hovered !== null ? 'brightness(0.55)' : 'brightness(0.85)',
                        transition: 'filter 0.3s' }} />

                <AnimatePresence>
                    {hovered !== null && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
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
