'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const sideStyle: React.CSSProperties = {
    fontSize: FONT.small,
    fontWeight: 600,
    color: CLAUDE_COLOR.accent,
    fontFamily: MONO,
    margin: '8px 0 4px',
};

const stepStyle: React.CSSProperties = {
    fontSize: FONT.small,
    color: COLOR.text,
    fontFamily: MONO,
    padding: '4px 12px',
};

const diskBoxStyle: React.CSSProperties = {
    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
    background: CLAUDE_COLOR.accentBg,
    borderRadius: 8,
    padding: '10px 14px',
    color: COLOR.textBright,
    fontFamily: MONO,
    fontSize: FONT.small,
    textAlign: 'center',
    margin: '4px 0',
};

const arrowStyle: React.CSSProperties = {
    color: COLOR.textDim,
    fontSize: 14,
    lineHeight: 1,
    fontFamily: MONO,
    textAlign: 'center',
    padding: '2px 0',
};

const tagStyle: React.CSSProperties = {
    fontSize: FONT.min,
    color: COLOR.textMuted,
    fontFamily: MONO,
};

export default function TeamMailboxFlow() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                팀원 mailbox 흐름 — 발신/수신 분리
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                디스크 jsonl 이 공통 매체 — 발신자는 수신자의 프로세스를 _몰라도_ 됨
            </p>

            <div style={{ width: '100%', maxWidth: 520, fontFamily: MONO }}>
                {/* 발신자 측 */}
                <div style={sideStyle}>[발신자 측]</div>
                <div style={stepStyle}>① writeToMailbox(recipient, message)</div>
                <div style={{ ...tagStyle, padding: '0 12px' }}>jsonl 한 줄 append</div>
                <div style={arrowStyle}>↓</div>

                {/* 디스크 박스 */}
                <div style={diskBoxStyle}>
                    <div style={{ fontWeight: 600 }}>~/.claude/teams/&lt;team&gt;/&lt;recipient&gt;.jsonl</div>
                    <div style={{ ...tagStyle, marginTop: 2 }}>발신자/수신자 공통 매체</div>
                </div>

                {/* 수신자 측 */}
                <div style={sideStyle}>[수신자 측]</div>
                <div style={arrowStyle}>↓</div>
                <div style={stepStyle}>② watcher (또는 polling) — 자기 메일박스 파일 변경 감지</div>
                <div style={arrowStyle}>↓</div>
                <div style={stepStyle}>③ 새 메시지를 _자기 commandQueue (메모리 큐)_ 에 enqueue</div>
                <div style={arrowStyle}>↓</div>
                <div
                    style={{
                        ...tagStyle,
                        padding: '0 12px',
                        color: CLAUDE_COLOR.accent,
                        textAlign: 'center',
                    }}
                >
                    (이하 _기본 큐-루프 모델_ 그대로)
                </div>
                <div style={stepStyle}>④ query loop 가 다음 turn 시작 시 큐에서 꺼냄</div>
                <div style={stepStyle}>⑤ 히스토리에 append → API call</div>
            </div>
        </div>
    );
}
