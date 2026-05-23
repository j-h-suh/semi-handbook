'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const boxStyle: React.CSSProperties = {
    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
    background: CLAUDE_COLOR.accentBg,
    borderRadius: 8,
    padding: '12px 18px',
    color: COLOR.textBright,
    fontFamily: MONO,
    fontSize: FONT.small,
    textAlign: 'center',
};

const extTagStyle: React.CSSProperties = {
    fontSize: FONT.min,
    color: CLAUDE_COLOR.accent,
    fontWeight: 600,
    fontFamily: MONO,
    marginLeft: 8,
};

const arrowStyle: React.CSSProperties = {
    color: COLOR.textDim,
    fontSize: 16,
    lineHeight: 1,
    fontFamily: MONO,
    textAlign: 'center',
};

const subBoxStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: FONT.small,
    color: COLOR.text,
    fontFamily: MONO,
};

const noteStyle: React.CSSProperties = {
    fontSize: FONT.min,
    color: COLOR.textMuted,
    fontFamily: MONO,
};

export default function Part10Architecture() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                Part 10 의 골격 — 9.1 위의 8 확장
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                9.1 의 박스를 _깨뜨리지 않고_ 곁에 확장만 더한다 — `┊ 10.x` 가 확장 자리
            </p>

            {/* main.py */}
            <div style={{ ...boxStyle, width: 320 }}>
                <div style={{ fontWeight: 600 }}>main.py · CLI 입력 루프</div>
                <div style={{ marginTop: 4, ...noteStyle }}>
                    <span style={extTagStyle}>┊ 10.1 슬래시 명령 (/name → md 치환)</span>
                </div>
            </div>

            <div style={{ ...arrowStyle, fontSize: 11, color: COLOR.textDim, fontFamily: MONO }}>
                async for chunk in query(...): ← 9.5 streaming
            </div>
            <div style={arrowStyle}>↓</div>

            {/* query() — 큰 박스 */}
            <div style={{ ...boxStyle, width: 520, padding: '14px 18px', textAlign: 'left' }}>
                <div style={{ textAlign: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>query() (agent.py)</span>
                    <span style={extTagStyle}>← 9.2</span>
                </div>
                <div style={{ textAlign: 'center', marginBottom: 10 }}>
                    <span style={extTagStyle}>┊ 10.3 Hook (5 이벤트, 단계 사이)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={subBoxStyle}>
                        ① 클라이언트 호출
                        <span style={extTagStyle}>┊ 10.5 provider 분기</span>
                    </div>
                    <div style={arrowStyle}>↓</div>
                    <div style={{ ...subBoxStyle, background: 'transparent', border: 'none', padding: '4px 12px' }}>
                        ② tool_use 블록 파싱 <span style={noteStyle}>(stop_reason 분기)</span>
                    </div>
                    <div style={arrowStyle}>↓</div>
                    <div style={{ ...subBoxStyle, background: 'transparent', border: 'none', padding: '4px 12px' }}>
                        ③ 권한 체크 (permissions.py) <span style={{ ...extTagStyle, marginLeft: 4 }}>← 9.4</span>
                    </div>
                    <div style={arrowStyle}>↓</div>
                    <div style={subBoxStyle}>
                        ④ 도구 실행 (tools/*) <span style={{ ...extTagStyle, marginLeft: 4 }}>← 9.3</span>
                        <div style={{ ...noteStyle, marginTop: 4 }}>
                            Read / Write / Bash / Edit · AgentTool ↻ → query (재귀)
                        </div>
                        <div style={{ marginTop: 4 }}>
                            <span style={extTagStyle}>┊ 10.2 스킬</span>
                            <span style={extTagStyle}>┊ 10.4 MCP</span>
                            <span style={extTagStyle}>┊ 10.6 사용자 정의</span>
                            <span style={extTagStyle}>┊ 10.8 팀</span>
                        </div>
                    </div>
                    <div style={arrowStyle}>↓</div>
                    <div style={{ ...subBoxStyle, background: 'transparent', border: 'none', padding: '4px 12px' }}>
                        tool_result 메시지에 추가
                    </div>
                    <div style={arrowStyle}>↓</div>
                    <div
                        style={{
                            ...subBoxStyle,
                            background: 'transparent',
                            border: 'none',
                            padding: '4px 12px',
                            color: CLAUDE_COLOR.accent,
                        }}
                    >
                        ↻ while not done: 반복 · yield chunk (TextDelta / ToolUse)
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 16, color: COLOR.textDim, fontSize: FONT.small, fontFamily: MONO }}>
                (query 간 공유 채널 — 직렬 흐름 _아님_)
            </div>
            <div style={{ ...boxStyle, width: 320 }}>
                <span style={{ fontWeight: 600 }}>message_queue</span>
                <span style={extTagStyle}>┊ 10.7 모듈 싱글턴 deque (10.8 의 토대)</span>
            </div>
        </div>
    );
}
