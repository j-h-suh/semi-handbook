'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 10,
    alignItems: 'baseline',
    fontSize: FONT.small,
    color: COLOR.text,
    fontFamily: MONO,
    padding: '4px 0',
};

const starStyle: React.CSSProperties = {
    color: CLAUDE_COLOR.accent,
    fontWeight: 700,
    fontSize: FONT.body,
};

const hollowStyle: React.CSSProperties = {
    color: COLOR.textMuted,
    fontSize: FONT.body,
};

export default function CacheLayerBoundary() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                prompt caching — 두 캐시 계층
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                ★ 전 세계 공유 (global) · ☆ 자기 organization 안 (org)
            </p>

            <div
                style={{
                    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                    background: CLAUDE_COLOR.accentBgSoft,
                    borderRadius: 10,
                    padding: '14px 18px',
                    width: '100%',
                    maxWidth: 540,
                    fontFamily: MONO,
                }}
            >
                {/* 시스템 프롬프트 영역 */}
                <div
                    style={{
                        fontSize: FONT.small,
                        fontWeight: 600,
                        color: CLAUDE_COLOR.accent,
                        marginBottom: 6,
                    }}
                >
                    시스템 프롬프트 (Anthropic 이 관리하는 인프라 자산)
                </div>
                <div style={rowStyle}>
                    <span style={starStyle}>★</span>
                    <span>boundary 앞 → 전 세계 사용자 공유 캐시</span>
                </div>
                <div style={rowStyle}>
                    <span style={hollowStyle}>☆</span>
                    <span>boundary 뒤 → 자기 세션 안에서만 캐시</span>
                </div>

                <div
                    style={{
                        margin: '12px 0 8px',
                        borderTop: `1px dashed ${CLAUDE_COLOR.accentBorderSoft}`,
                    }}
                />

                {/* 메시지 영역 */}
                <div
                    style={{
                        fontSize: FONT.small,
                        fontWeight: 600,
                        color: CLAUDE_COLOR.accent,
                        marginBottom: 6,
                    }}
                >
                    메시지 영역 (사용자의 대화)
                </div>
                <div style={rowStyle}>
                    <span style={hollowStyle}>☆</span>
                    <span>메타 메시지 (CLAUDE.md, 날짜 등)</span>
                </div>
                <div style={rowStyle}>
                    <span style={hollowStyle}>☆</span>
                    <span>진짜 user / assistant 히스토리</span>
                </div>
            </div>

            <div
                style={{
                    marginTop: 10,
                    fontSize: FONT.min,
                    color: COLOR.textMuted,
                    fontFamily: MONO,
                    textAlign: 'center',
                }}
            >
                CLAUDE.md 는 사용자별 달라 ☆ 자리. ★ 에 두면 공유 효과 사라짐
            </div>
        </div>
    );
}
