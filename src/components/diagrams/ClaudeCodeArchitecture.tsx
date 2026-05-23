'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const outerBoxStyle: React.CSSProperties = {
    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
    background: CLAUDE_COLOR.accentBg,
    borderRadius: 8,
    padding: '10px 14px',
    color: COLOR.textBright,
    fontFamily: MONO,
    fontSize: FONT.small,
    textAlign: 'center',
    width: '100%',
    fontWeight: 600,
};

const subBoxStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: FONT.small,
    color: COLOR.text,
    fontFamily: MONO,
    textAlign: 'left',
    flex: 1,
};

const kernelBoxStyle: React.CSSProperties = {
    border: `2px solid ${CLAUDE_COLOR.accent}`,
    background: CLAUDE_COLOR.accentBg,
    borderRadius: 8,
    padding: '12px 16px',
    color: CLAUDE_COLOR.accent,
    fontFamily: MONO,
    fontSize: FONT.small,
    textAlign: 'center',
    width: '100%',
    fontWeight: 600,
};

const apiBoxStyle: React.CSSProperties = {
    border: `1px solid ${COLOR.border}`,
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding: '12px 16px',
    color: COLOR.textBright,
    fontFamily: MONO,
    fontSize: FONT.small,
    textAlign: 'center',
    width: '100%',
    fontWeight: 600,
};

const subBoxLabelStyle: React.CSSProperties = {
    fontSize: FONT.small,
    fontWeight: 600,
    color: COLOR.textBright,
    marginBottom: 6,
    textAlign: 'center' as const,
};

const subBoxListStyle: React.CSSProperties = {
    fontSize: FONT.min,
    color: COLOR.textMuted,
    lineHeight: 1.6,
};

export default function ClaudeCodeArchitecture() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                Claude Code 의 마이크로커널 아키텍처
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                6 레이어 — 사용자에서 LLM 까지, 아래에서 위로 읽기
            </p>

            <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* 사용자 (터미널 / IDE) */}
                <div style={outerBoxStyle}>사용자 (터미널 / IDE)</div>

                {/* 입력 / 응답 / 확장 — 3 박스 횡렬 */}
                <div style={{ display: 'flex', gap: 6 }}>
                    <div style={subBoxStyle}>
                        <div style={subBoxLabelStyle}>입력 처리</div>
                        <div style={subBoxListStyle}>
                            · 슬래시 명령<br />
                            · 시스템 프롬프트 조립<br />
                            · 컨텍스트 주입
                        </div>
                    </div>
                    <div style={subBoxStyle}>
                        <div style={subBoxLabelStyle}>응답 처리</div>
                        <div style={subBoxListStyle}>
                            · 스트리밍<br />
                            · 파싱<br />
                            · UI 렌더링
                        </div>
                    </div>
                    <div style={subBoxStyle}>
                        <div style={subBoxLabelStyle}>확장 시스템</div>
                        <div style={subBoxListStyle}>
                            · MCP 클라이언트<br />
                            · 멀티 에이전트<br />
                            · IDE 브릿지 · 스킬
                        </div>
                    </div>
                </div>

                {/* 도구 실행 + 권한 */}
                <div style={{ ...outerBoxStyle, textAlign: 'left', padding: '10px 14px' }}>
                    <div style={subBoxLabelStyle}>도구 실행 + 권한 시스템</div>
                    <div style={subBoxListStyle}>
                        · 40+ 도구 (Read, Write, Bash, Edit, Glob, …)<br />
                        · 5 가지 권한 모드 / Hook 시스템 / 보안 검사 23 개
                    </div>
                </div>

                {/* 메모리 + 컨텍스트 */}
                <div style={{ ...outerBoxStyle, textAlign: 'left', padding: '10px 14px' }}>
                    <div style={subBoxLabelStyle}>메모리 + 컨텍스트 관리</div>
                    <div style={subBoxListStyle}>
                        · 자동 압축 / 세션 저장 / CLAUDE.md 로딩
                    </div>
                </div>

                {/* 마이크로커널 — 강조 */}
                <div style={kernelBoxStyle}>
                    마이크로커널 : query.ts while(true)
                    <div style={{ ...subBoxListStyle, color: CLAUDE_COLOR.accent, marginTop: 4, textAlign: 'center' }}>
                        메시지 전송 → 응답 수신 → 도구 호출 분기 → 반복
                    </div>
                </div>

                {/* Claude API */}
                <div style={apiBoxStyle}>Claude API (LLM = CPU)</div>
            </div>
        </div>
    );
}
