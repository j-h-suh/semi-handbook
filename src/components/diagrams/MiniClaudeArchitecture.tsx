'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const boxStyle: React.CSSProperties = {
    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
    background: CLAUDE_COLOR.accentBg,
    borderRadius: 8,
    padding: '12px 18px',
    textAlign: 'center',
    color: COLOR.textBright,
    fontFamily: MONO,
};

const chapterTagStyle: React.CSSProperties = {
    display: 'inline-block',
    marginLeft: 8,
    padding: '1px 6px',
    borderRadius: 4,
    background: CLAUDE_COLOR.accentBg,
    border: `1px solid ${CLAUDE_COLOR.accentBorderSoft}`,
    color: CLAUDE_COLOR.accent,
    fontSize: FONT.min,
    fontWeight: 600,
    verticalAlign: 'middle',
};

const arrowStyle: React.CSSProperties = {
    color: COLOR.textDim,
    fontSize: 18,
    lineHeight: 1,
    fontFamily: MONO,
};

const subBoxStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    padding: '7px 11px',
    fontSize: FONT.small,
    color: COLOR.text,
    fontFamily: MONO,
    textAlign: 'left',
};

const subArrowStyle: React.CSSProperties = {
    color: COLOR.textDim,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 1,
    fontFamily: MONO,
};

export default function MiniClaudeArchitecture() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                미니 클로드 골격
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                5 부품 · while 루프 · 챕터 매핑
            </p>

            {/* main.py */}
            <div style={{ ...boxStyle, width: 220 }}>
                <div style={{ fontWeight: 600, fontSize: FONT.body }}>main.py</div>
                <div style={{ fontSize: FONT.min, color: COLOR.textMuted, marginTop: 3 }}>
                    CLI 입력 루프 · argparse
                </div>
            </div>

            <div style={arrowStyle}>↓</div>

            {/* query() — 큰 박스 + 내부 4 단계 */}
            <div style={{ ...boxStyle, width: 380, padding: '16px 22px' }}>
                <div style={{ marginBottom: 10, fontSize: FONT.body }}>
                    <span style={{ fontWeight: 600 }}>query() (agent.py)</span>
                    <span style={chapterTagStyle}>9.2</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={subBoxStyle}>① LLM API 호출</div>
                    <div style={subArrowStyle}>↓</div>
                    <div style={subBoxStyle}>② tool_use 블록 파싱</div>
                    <div style={subArrowStyle}>↓</div>
                    <div style={subBoxStyle}>
                        ③ 권한 체크 <span style={chapterTagStyle}>9.4</span>
                    </div>
                    <div style={subArrowStyle}>↓</div>
                    <div style={subBoxStyle}>
                        ④ 도구 실행 <span style={chapterTagStyle}>9.3</span>
                    </div>
                </div>
                <div
                    style={{
                        marginTop: 10,
                        paddingTop: 8,
                        borderTop: `1px dashed ${CLAUDE_COLOR.accentBorderSoft}`,
                        fontSize: FONT.min,
                        color: COLOR.textDim,
                        textAlign: 'center',
                    }}
                >
                    ↓ tool_result 추가 · ↻ while not done
                </div>
            </div>

            <div style={arrowStyle}>↓</div>

            {/* streaming.py */}
            <div style={{ ...boxStyle, width: 260 }}>
                <div style={{ fontSize: FONT.body }}>
                    <span style={{ fontWeight: 600 }}>streaming.py</span>
                    <span style={chapterTagStyle}>9.5</span>
                </div>
                <div style={{ fontSize: FONT.min, color: COLOR.textMuted, marginTop: 3 }}>
                    화면 출력 · 글자 단위 async for
                </div>
            </div>

            <div style={arrowStyle}>↓</div>

            {/* tools/agent.py */}
            <div style={{ ...boxStyle, width: 260 }}>
                <div style={{ fontSize: FONT.body }}>
                    <span style={{ fontWeight: 600 }}>tools/agent.py</span>
                    <span style={chapterTagStyle}>9.5</span>
                </div>
                <div style={{ fontSize: FONT.min, color: COLOR.textMuted, marginTop: 3 }}>
                    AgentTool 재귀
                </div>
            </div>
        </div>
    );
}
