'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const boxStyle: React.CSSProperties = {
    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
    background: CLAUDE_COLOR.accentBg,
    borderRadius: 8,
    padding: '12px 16px',
    color: COLOR.textBright,
    fontFamily: MONO,
    fontSize: FONT.small,
    textAlign: 'center',
};

const subBoxStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    padding: '10px 14px',
    color: COLOR.text,
    fontFamily: MONO,
    fontSize: FONT.small,
    textAlign: 'center',
    minWidth: 200,
};

const arrowStyle: React.CSSProperties = {
    color: COLOR.textDim,
    fontSize: 16,
    lineHeight: 1,
    fontFamily: MONO,
    textAlign: 'center',
};

const noteStyle: React.CSSProperties = {
    fontSize: FONT.min,
    color: COLOR.textMuted,
    marginTop: 2,
};

export default function APIClientAdapter() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                API 클라이언트 어댑터 패턴
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                _family B (vLLM)_ 를 family A (Anthropic) 인터페이스 위로 흉내 — agent.py 는 무지
            </p>

            {/* agent.py — 구조적 타이핑 */}
            <div style={{ ...boxStyle, maxWidth: 480 }}>
                <div style={{ fontWeight: 600 }}>agent.py — 구조적 타이핑 (호출자 무지)</div>
                <div style={{ ...noteStyle, color: COLOR.textMuted }}>
                    client.messages.stream(...)
                </div>
            </div>

            <div style={arrowStyle}>┌────┴────┐</div>

            {/* 두 분기 */}
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                {/* 왼쪽: Anthropic */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={subBoxStyle}>
                        <div style={{ fontWeight: 600, color: CLAUDE_COLOR.accent }}>AsyncAnthropic*</div>
                        <div style={noteStyle}>가족 — SDK 그대로</div>
                    </div>
                </div>

                {/* 오른쪽: vLLM 어댑터 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={subBoxStyle}>
                        <div style={{ fontWeight: 600, color: CLAUDE_COLOR.accent }}>VLLMClient (어댑터)</div>
                    </div>
                    <div style={arrowStyle}>↓</div>
                    <div style={subBoxStyle}>
                        <div>openai.AsyncOpenAI</div>
                        <div style={noteStyle}>OpenAI 호환</div>
                    </div>
                    <div style={arrowStyle}>↓</div>
                    <div style={subBoxStyle}>
                        <div>vLLM 서버</div>
                        <div style={noteStyle}>/v1/chat/completions</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
