'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const spacerStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    borderTop: '1px dashed rgba(255,255,255,0.10)',
    borderBottom: '1px dashed rgba(255,255,255,0.10)',
    padding: '14px 16px',
    fontSize: FONT.min,
    color: COLOR.textDim,
    fontFamily: MONO,
    textAlign: 'center' as const,
};

const itemStyle: React.CSSProperties = {
    padding: '3px 16px',
    fontSize: FONT.small,
    color: COLOR.text,
    fontFamily: MONO,
};

const viewportStyle: React.CSSProperties = {
    background: CLAUDE_COLOR.accentBg,
    borderLeft: `3px solid ${CLAUDE_COLOR.accent}`,
    padding: '4px 0',
};

const scrollMarkerStyle: React.CSSProperties = {
    fontSize: FONT.min,
    color: COLOR.textMuted,
    fontFamily: MONO,
    fontStyle: 'italic',
    padding: '2px 16px',
};

export default function VirtualScrollViewport() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                가상 스크롤 — 보이는 부분만 mount
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                27,000 메시지 중 _viewport + overscan 80 rows × 2_ 만 (~200~300 개) mount
            </p>

            <div style={{ display: 'flex', alignItems: 'stretch', gap: 12, width: '100%', maxWidth: 600 }}>
                {/* 좌측 viewport 라벨 */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: CLAUDE_COLOR.accent,
                        fontSize: FONT.small,
                        fontFamily: MONO,
                        fontWeight: 600,
                        gap: 4,
                        minWidth: 70,
                    }}
                >
                    <span>↑</span>
                    <span>viewport</span>
                    <span style={{ fontSize: FONT.min, color: COLOR.textMuted }}>80 rows</span>
                    <span>↓</span>
                </div>

                {/* 박스 */}
                <div
                    style={{
                        flex: 1,
                        border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                        borderRadius: 8,
                        overflow: 'hidden',
                        fontFamily: MONO,
                    }}
                >
                    <div style={scrollMarkerStyle}>scrollTop = 0</div>
                    <div style={spacerStyle}>
                        메시지 1 … 메시지 14000<br />
                        <span style={{ color: COLOR.textDim }}>(top spacer — 안 보임)</span>
                    </div>

                    <div style={viewportStyle}>
                        <div style={{ ...itemStyle, color: CLAUDE_COLOR.accent, fontWeight: 600 }}>
                            메시지 14001
                        </div>
                        <div style={itemStyle}>메시지 14002</div>
                        <div style={itemStyle}>…</div>
                        <div style={{ ...itemStyle, color: CLAUDE_COLOR.accent, fontWeight: 600 }}>
                            메시지 14060
                        </div>
                        <div
                            style={{
                                ...scrollMarkerStyle,
                                color: CLAUDE_COLOR.accent,
                                fontWeight: 600,
                                fontStyle: 'normal',
                            }}
                        >
                            ← 진짜 mount 된 것 (~200~300 개)
                        </div>
                    </div>

                    <div style={spacerStyle}>
                        메시지 14061 … 메시지 27000<br />
                        <span style={{ color: COLOR.textDim }}>(bottom spacer — 안 보임)</span>
                    </div>
                    <div style={scrollMarkerStyle}>scrollTop = max</div>
                </div>
            </div>
        </div>
    );
}
