'use client';

import React from 'react';
import { FONT, COLOR } from './diagramTokens';

export default function CDSAXSConcept() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                CD-SAXS 측정 개념도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                X선 소각 산란 → 매몰 구조(GAA 나노시트)까지 비파괴 측정
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 540, borderRadius: 8, overflow: 'hidden' }}>
                    <img src="/content/images/02_12/cd_saxs_concept.png?v=1" alt="CD-SAXS 개념도" style={{ width: '100%', display: 'block' }} />
                </div>
            </div>
            <div style={{ maxWidth: 640, margin: '8px auto 0' }}>
                <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                        X선(λ~0.1nm)이 주기 패턴을 투과. 2D 산란 패턴에서 내부 채널 형상까지 비파괴 측정. GAA 시대의 핵심 계측 기술.
                    </div>
                </div>
            </div>
        </div>
    );
}
