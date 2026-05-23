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
    width: '100%',
    maxWidth: 460,
};

const arrowStyle: React.CSSProperties = {
    color: COLOR.textDim,
    fontSize: 18,
    lineHeight: 1,
    fontFamily: MONO,
};

const titleStyle: React.CSSProperties = {
    fontWeight: 600,
    color: CLAUDE_COLOR.accent,
    fontSize: FONT.small,
    marginBottom: 4,
};

const subStyle: React.CSSProperties = {
    fontSize: FONT.min,
    color: COLOR.textMuted,
    lineHeight: 1.6,
};

const STAGES = [
    {
        title: 'Event triggered',
        sub: 'PreToolUse / PostToolUse / Stop / …',
    },
    {
        title: '1. 매칭 — registry.find_matching()',
        sub: 'event + (도구 이름) → 매칭된 spec 들',
    },
    {
        title: '2. 실행 — execute_hook()',
        sub: 'subprocess.shell + stdin JSON → wait_for(timeout) → stdout JSON',
    },
    {
        title: '3. 반영 — agent.py / main.py 의 자리',
        sub: 'permissionDecision: deny ⇒ 차단 · updatedInput: 입력 교체 · additionalContext: 결과 보강',
    },
];

export default function HookLifecycle() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                Hook 의 생명주기 — 3 단계
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                이벤트 발생 → 매칭 → 실행 → 반영
            </p>

            {STAGES.map((s, i) => (
                <React.Fragment key={s.title}>
                    <div style={boxStyle}>
                        <div style={titleStyle}>{s.title}</div>
                        <div style={subStyle}>{s.sub}</div>
                    </div>
                    {i < STAGES.length - 1 && <div style={arrowStyle}>↓</div>}
                </React.Fragment>
            ))}
        </div>
    );
}
