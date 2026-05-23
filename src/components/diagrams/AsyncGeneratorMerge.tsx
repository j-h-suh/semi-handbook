'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const SOURCES = [
    'Anthropic API stream',
    '도구 실행 결과',
    '컨텍스트 압축 이벤트',
];

const sourceStyle: React.CSSProperties = {
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 6,
    padding: '8px 14px',
    fontSize: FONT.small,
    color: COLOR.text,
    fontFamily: MONO,
    textAlign: 'right',
    minWidth: 200,
};

const hubStyle: React.CSSProperties = {
    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
    background: CLAUDE_COLOR.accentBg,
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: FONT.small,
    color: CLAUDE_COLOR.accent,
    fontWeight: 600,
    fontFamily: MONO,
    textAlign: 'center',
};

const sinkStyle: React.CSSProperties = {
    border: `1px solid ${CLAUDE_COLOR.accent}`,
    background: CLAUDE_COLOR.accentBg,
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: FONT.small,
    color: COLOR.textBright,
    fontWeight: 600,
    fontFamily: MONO,
    textAlign: 'center',
};

const arrowStyle: React.CSSProperties = {
    color: COLOR.textDim,
    fontSize: 16,
    fontFamily: MONO,
};

export default function AsyncGeneratorMerge() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                여러 비동기 흐름 → query.ts (yield*) → UI
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                에이전트 루프 전체를 단 하나의 비동기 제너레이터로 — 소비자는 값의 흐름만 본다
            </p>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                {/* 3 sources */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {SOURCES.map((s) => (
                        <div key={s} style={sourceStyle}>
                            {s}
                        </div>
                    ))}
                </div>

                {/* fan-in */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        color: CLAUDE_COLOR.accent,
                        fontFamily: MONO,
                        fontSize: 16,
                    }}
                >
                    <span>─┐</span>
                    <span>─┼─→</span>
                    <span>─┘</span>
                </div>

                {/* hub */}
                <div style={hubStyle}>
                    query.ts
                    <div style={{ fontSize: FONT.min, color: COLOR.textMuted, marginTop: 2, fontWeight: 400 }}>
                        yield*
                    </div>
                </div>

                <div style={arrowStyle}>→</div>

                {/* sink */}
                <div style={sinkStyle}>
                    터미널 UI
                    <div style={{ fontSize: FONT.min, color: COLOR.textMuted, marginTop: 2, fontWeight: 400 }}>
                        for await
                    </div>
                </div>
            </div>
        </div>
    );
}
