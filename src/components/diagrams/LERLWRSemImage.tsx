'use client';

import React from 'react';
import { FONT, COLOR } from './diagramTokens';

export default function LERLWRSemImage() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                LER/LWR 시각화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                CD-SEM으로 관찰한 에지 거칠기 — 이상 vs 실제
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 480, borderRadius: 8, overflow: 'hidden' }}>
                    <img src="/content/images/02_11/ler_lwr_sem_image.png?v=1" alt="LER/LWR SEM 이미지" style={{ width: '100%', display: 'block' }} />
                </div>
            </div>
            <div style={{ maxWidth: 640, margin: '8px auto 0' }}>
                <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                        LER: 한쪽 에지의 거칠기 (3σ ≈ 2nm). LWR: 선폭 변동 (3σ ≈ 3nm). 광자 통계(Shot Noise)가 지배적 원인.
                    </div>
                </div>
            </div>
        </div>
    );
}
