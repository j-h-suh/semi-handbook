'use client';

import React from 'react';
import { FONT, COLOR } from './diagramTokens';

export default function Linear6parVectorMap() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                선형 6성분 시각화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Translation · Rotation · Magnification — 웨이퍼 위의 Overlay 벡터맵
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 540, borderRadius: 8, overflow: 'hidden' }}>
                    <img src="/content/images/02_10/linear_6par_vector_map.png?v=1"
                        alt="선형 6성분 벡터맵"
                        style={{ width: '100%', display: 'block' }} />
                </div>
            </div>
            <div style={{ maxWidth: 640, margin: '8px auto 0' }}>
                <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                        Translation은 균일 이동, Rotation은 중심 기준 회전, Magnification은 중심에서 방사상 확대/축소. Combined는 6개 성분의 중첩.
                    </div>
                </div>
            </div>
        </div>
    );
}
