'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const arrowStyle: React.CSSProperties = {
    color: COLOR.textDim,
    textAlign: 'center',
    fontSize: FONT.small,
    lineHeight: 1,
    fontFamily: MONO,
};

const stepStyle: React.CSSProperties = {
    fontSize: FONT.small,
    color: COLOR.text,
    fontFamily: MONO,
};

export default function TwoLayerAgentLoop() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                두 계층의 에이전트 루프
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                외부 루프 (한 턴) · 내부 루프 (LLM 1 번 호출 + 도구 처리)
            </p>

            {/* 외부 박스 */}
            <div
                style={{
                    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                    background: CLAUDE_COLOR.accentBgSoft,
                    borderRadius: 10,
                    padding: '14px 18px',
                    width: '100%',
                    maxWidth: 580,
                    fontFamily: MONO,
                }}
            >
                <div
                    style={{
                        fontSize: FONT.small,
                        color: CLAUDE_COLOR.accent,
                        fontWeight: 600,
                        marginBottom: 10,
                        textAlign: 'center',
                    }}
                >
                    외부 루프 — 한 턴 (한 사용자 입력에 대한 응답 전체)
                </div>

                {/* 내부 박스 */}
                <div
                    style={{
                        border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                        background: CLAUDE_COLOR.accentBg,
                        borderRadius: 8,
                        padding: '14px 18px',
                    }}
                >
                    <div
                        style={{
                            fontSize: FONT.small,
                            color: CLAUDE_COLOR.accent,
                            fontWeight: 600,
                            marginBottom: 10,
                            textAlign: 'center',
                        }}
                    >
                        내부 루프 — LLM 한 번 호출 + 도구 처리
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={stepStyle}>① 메시지 리스트 정규화</div>
                        <div style={arrowStyle}>↓</div>
                        <div style={stepStyle}>② 시스템 프롬프트 빌드</div>
                        <div style={arrowStyle}>↓</div>
                        <div style={stepStyle}>③ Anthropic API 호출 (스트리밍)</div>
                        <div style={arrowStyle}>↓</div>
                        <div style={stepStyle}>④ 응답을 토큰 단위로 받음</div>
                        <div style={arrowStyle}>↓</div>
                        <div style={stepStyle}>⑤ 도구 호출 블록이 들어왔는가?</div>

                        <div style={{ paddingLeft: 14, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={stepStyle}>
                                <span style={{ color: CLAUDE_COLOR.accent, fontWeight: 600 }}>├─ Yes</span>
                                <span style={{ color: COLOR.textDim }}>  →  도구 실행 → 메시지에 결과 추가 → ↻ 내부 루프 처음으로</span>
                            </div>
                            <div style={stepStyle}>
                                <span style={{ color: CLAUDE_COLOR.accent, fontWeight: 600 }}>└─ No</span>
                                <span style={{ color: COLOR.textDim }}>   →  응답 종료</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        fontSize: FONT.min,
                        color: COLOR.textDim,
                        marginTop: 10,
                        textAlign: 'center',
                        lineHeight: 1.6,
                    }}
                >
                    ↑ 내부 루프 종료 → 한 턴 끝
                    <br />
                    ↑ 다음 사용자 입력 대기
                </div>
            </div>
        </div>
    );
}
