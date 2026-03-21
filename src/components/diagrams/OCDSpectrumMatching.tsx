'use client';

import React from 'react';
import { FONT, COLOR } from './diagramTokens';

export default function OCDSpectrumMatching() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                OCD 스펙트럼 매칭
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                실측 vs RCWA 시뮬레이션 — 최적 매칭으로 3D 프로파일 추출
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 480, borderRadius: 8, overflow: 'hidden' }}>
                    <img src="/content/images/02_12/ocd_spectrum_matching.png?v=1" alt="OCD 스펙트럼 매칭" style={{ width: '100%', display: 'block' }} />
                </div>
            </div>
            <div style={{ maxWidth: 640, margin: '8px auto 0' }}>
                <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                        실측 엘립소메트리 스펙트럼(파란)과 RCWA 시뮬레이션(빨간)의 매칭. GOF=0.998 → CD=20.3nm, H=55.2nm, SWA=87.5° 추출.
                    </div>
                </div>
            </div>
        </div>
    );
}
