'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const boxStyle: React.CSSProperties = {
    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
    background: CLAUDE_COLOR.accentBg,
    borderRadius: 8,
    padding: '10px 16px',
    textAlign: 'center',
    color: COLOR.textBright,
    fontFamily: MONO,
    fontSize: FONT.small,
};

const leafStyle: React.CSSProperties = {
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 6,
    padding: '6px 12px',
    color: COLOR.text,
    fontFamily: MONO,
    fontSize: FONT.small,
    textAlign: 'center',
};

const arrowStyle: React.CSSProperties = {
    color: COLOR.textDim,
    fontSize: 16,
    lineHeight: 1,
    fontFamily: MONO,
};

const noteStyle: React.CSSProperties = {
    fontSize: FONT.min,
    color: COLOR.textMuted,
    fontFamily: MONO,
};

export default function AgentLoopBranch() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                에이전트 루프 (단순 버전)
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                응답이 도구 호출이면 다시, 텍스트면 종료
            </p>

            <div style={{ ...boxStyle, width: 220 }}>사용자 입력</div>
            <div style={arrowStyle}>↓</div>

            <div style={{ ...boxStyle, width: 280 }}>
                <div style={{ fontWeight: 600 }}>Claude API 호출</div>
                <div style={{ ...noteStyle, marginTop: 3 }}>메시지 + 도구 · 매 호출마다 누적</div>
            </div>
            <div style={arrowStyle}>↓</div>

            <div style={{ color: COLOR.textBright, fontFamily: MONO, fontSize: FONT.small }}>Claude의 응답</div>

            {/* 분기 */}
            <div style={{ ...arrowStyle, fontSize: 18 }}>┌────┴────┐</div>
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                {/* 왼쪽: 텍스트 → 종료 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ ...leafStyle, minWidth: 130 }}>그냥 텍스트</div>
                    <div style={arrowStyle}>↓</div>
                    <div style={{ ...leafStyle, minWidth: 130 }}>화면 표시</div>
                    <div style={arrowStyle}>↓</div>
                    <div style={{ ...leafStyle, minWidth: 130, color: COLOR.textMuted }}>끝</div>
                </div>

                {/* 오른쪽: 도구 호출 → 루프 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ ...leafStyle, minWidth: 160 }}>도구 호출 요청</div>
                    <div style={arrowStyle}>↓</div>
                    <div style={{ ...leafStyle, minWidth: 160 }}>도구 실행</div>
                    <div style={arrowStyle}>↓</div>
                    <div style={{ ...leafStyle, minWidth: 160 }}>결과를 메시지에 추가</div>
                    <div style={{ ...arrowStyle, color: CLAUDE_COLOR.accent }}>↻</div>
                    <div style={{ ...noteStyle, color: CLAUDE_COLOR.accent }}>위의 API 호출로</div>
                </div>
            </div>
        </div>
    );
}
