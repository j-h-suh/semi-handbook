'use client';

import React from 'react';
import { FONT, COLOR } from './diagramTokens';

export default function BoxInBoxMicroscope() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Box-in-Box 마크
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                IBO 측정의 대표적 마크 — 외곽(이전 층) + 내부(현재 층)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 400, borderRadius: 8, overflow: 'hidden' }}>
                    <img src="/content/images/02_09/box_in_box_microscope.png?v=1"
                        alt="Box-in-Box 마크 현미경 이미지"
                        style={{ width: '100%', display: 'block' }} />
                </div>
            </div>
            <div style={{ maxWidth: 640, margin: '8px auto 0' }}>
                <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                        L(좌변 간격)과 R(우변 간격)의 차이로 x 방향 Overlay를 계산: OVL_x = (L-R)/2. 상하 간격(T, B)으로 y 방향도 동일하게 측정.
                    </div>
                </div>
            </div>
        </div>
    );
}
