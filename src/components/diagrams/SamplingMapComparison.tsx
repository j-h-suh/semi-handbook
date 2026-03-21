'use client';

import React from 'react';
import { FONT, COLOR } from './diagramTokens';

export default function SamplingMapComparison() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                샘플링 맵 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                고정 격자 vs AI 최적화 — 같은 측정 수, 더 높은 정보량
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 540, borderRadius: 8, overflow: 'hidden' }}>
                    <img src="/content/images/02_09/sampling_map_comparison.png?v=1"
                        alt="샘플링 맵 비교 (고정 격자 vs AI 최적화)"
                        style={{ width: '100%', display: 'block' }} />
                </div>
            </div>
            <div style={{ maxWidth: 640, margin: '8px auto 0' }}>
                <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                        AI 최적화는 변동이 큰 Edge에 포인트를 집중하여 같은 측정 수로 더 정확한 Overlay 모델을 구축합니다.
                    </div>
                </div>
            </div>
        </div>
    );
}
