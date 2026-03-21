'use client';

import React from 'react';
import { FONT, COLOR } from './diagramTokens';

export default function GlobalCDUWaferHeatmap() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Global CDU 웨이퍼 맵
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Center-Edge 프로파일 — 중심 20nm, 가장자리 22.5nm
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 440, borderRadius: 8, overflow: 'hidden' }}>
                    <img src="/content/images/02_11/global_cdu_wafer_heatmap.png?v=1" alt="Global CDU 웨이퍼 히트맵" style={{ width: '100%', display: 'block' }} />
                </div>
            </div>
            <div style={{ maxWidth: 640, margin: '8px auto 0' }}>
                <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                        레지스트 두께 불균일, PEB 온도 편차, 식각 로딩이 주요 원인. Dose Mapper로 보정 가능.
                    </div>
                </div>
            </div>
        </div>
    );
}
