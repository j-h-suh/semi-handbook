'use client';

import React from 'react';
import { FONT, COLOR } from './diagramTokens';

export default function WaferDistortionPatterns() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                웨이퍼 변형 패턴
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Bowl (접시형) · Saddle (안장형) · Higher-order (고차 변형)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 640, borderRadius: 8, overflow: 'hidden', aspectRatio: '1.7/1' }}>
                    <img
                        src="/content/images/02_08/wafer_distortion_patterns.png?v=2"
                        alt="웨이퍼 변형 패턴 (Bowl/Saddle/Higher-order)"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 56%' }}
                    />
                </div>
            </div>
            <div style={{ maxWidth: 640, margin: '8px auto 0' }}>
                <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                        화살표 색상은 변형 크기(파란=작음, 빨강=큼). Bowl은 균일 팽창, Saddle은 비등방 변형, Higher-order는 Edge에서 특히 불규칙.
                    </div>
                </div>
            </div>
        </div>
    );
}
