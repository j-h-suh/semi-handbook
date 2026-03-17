'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 대응 항목 ─── */
interface CompareItem {
    photo: string;
    litho: string;
    desc: string;
    color: string;
}

const ITEMS: CompareItem[] = [
    { photo: '필름 (네거티브)', litho: '마스크 (Reticle)', desc: '회로 패턴이 크롬으로 그려진 석영 유리판. 4:1 축소 투영되므로, 마스크의 패턴은 실제보다 4배 크게 제작된다.', color: '#818cf8' },
    { photo: '인화지', litho: '포토레지스트 (PR)', desc: '빛에 반응하여 화학적 성질이 변하는 감광 물질. 웨이퍼 위에 수십~수백 nm 두께로 균일하게 도포된다.', color: '#f59e0b' },
    { photo: '확대기 (Enlarger)', litho: '스캐너 (Scanner)', desc: 'ASML이 독점 제조하는 노광 장비. DUV(193nm) 또는 EUV(13.5nm) 광원으로 패턴을 웨이퍼에 전사한다. 대당 ~$2~4억.', color: '#3b82f6' },
    { photo: '현상액 (Developer)', litho: '현상액 (Developer)', desc: '노광된 레지스트를 선택적으로 용해. TMAH 2.38% 수용액이 업계 표준. 사진 현상과 원리가 동일하다.', color: '#22c55e' },
    { photo: '완성된 사진', litho: '패턴이 전사된 웨이퍼', desc: '수 nm 정밀도의 회로 패턴이 형성된 웨이퍼. 1nm 오차가 수십억 원의 수율 손실로 직결된다.', color: '#ef4444' },
];

export default function PhotoPrintingVsLitho() {
    const [activeIdx, setActiveIdx] = useState<number | null>(null);

    return (
        <div className="my-8 relative" onMouseLeave={() => setActiveIdx(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                사진 인화 vs 포토리소그래피
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Photo Printing vs Photolithography — Same Principle, 10⁷× Precision
            </p>

            {/* 이미지 */}
            <div style={{ maxWidth: 650, margin: '0 auto', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <img src="/content/images/02_01/photo_printing_vs_lithography.png" alt="사진 인화 vs 포토리소그래피"
                    style={{ width: '100%', display: 'block', filter: 'brightness(0.92)' }} />
            </div>

            {/* 대응표 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {ITEMS.map((item, idx) => (
                    <div key={idx}
                        onMouseEnter={() => setActiveIdx(idx)} onMouseLeave={() => setActiveIdx(null)}
                        style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: 6,
                            background: activeIdx === idx ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${activeIdx === idx ? item.color : 'rgba(255,255,255,0.06)'}`,
                            transition: 'all 0.15s' }}>
                        <span style={{ fontSize: FONT.min, color: activeIdx === idx ? item.color : COLOR.textDim, fontWeight: activeIdx === idx ? 600 : 400 }}>
                            {item.photo} ↔ {item.litho}
                        </span>
                    </div>
                ))}
            </div>

            {/* Tooltip */}
            <div style={{ maxWidth: 600, margin: '8px auto 0', height: 72 }}>
                <AnimatePresence mode="wait">
                    {activeIdx !== null && (
                        <motion.div key={activeIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: ITEMS[activeIdx].color, marginBottom: 2 }}>
                                {ITEMS[activeIdx].photo} → {ITEMS[activeIdx].litho}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {ITEMS[activeIdx].desc}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
