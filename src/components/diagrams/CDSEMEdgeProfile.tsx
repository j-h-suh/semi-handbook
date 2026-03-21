'use client';

import React from 'react';
import { FONT, COLOR } from './diagramTokens';

export default function CDSEMEdgeProfile() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                CD-SEM 에지 밝기 프로파일
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                이차전자 강도 피크 사이 거리 = CD
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 440, borderRadius: 8, overflow: 'hidden' }}>
                    <img src="/content/images/02_12/cd_sem_edge_profile.png?v=1" alt="CD-SEM 에지 프로파일" style={{ width: '100%', display: 'block' }} />
                </div>
            </div>
            <div style={{ maxWidth: 640, margin: '8px auto 0' }}>
                <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                        에지에서 이차전자 방출이 급증하여 밝기 피크 형성. 피크 위치(50% 임계값)로 에지를 정의하고 두 에지 사이 거리가 CD.
                    </div>
                </div>
            </div>
        </div>
    );
}
