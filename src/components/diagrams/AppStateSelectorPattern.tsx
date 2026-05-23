'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const componentBoxStyle: React.CSSProperties = {
    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
    background: CLAUDE_COLOR.accentBg,
    borderRadius: 6,
    padding: '8px 14px',
    color: COLOR.textBright,
    fontFamily: MONO,
    fontSize: FONT.small,
    fontWeight: 600,
    textAlign: 'center',
    minWidth: 110,
};

const selectorStyle: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: FONT.min,
    color: CLAUDE_COLOR.accent,
    textAlign: 'center',
    padding: '4px 8px',
    background: 'rgba(0, 212, 164, 0.04)',
    borderRadius: 4,
};

const arrowStyle: React.CSSProperties = {
    color: COLOR.textDim,
    fontSize: 16,
    lineHeight: 1,
    fontFamily: MONO,
    textAlign: 'center',
};

const branches = [
    { selector: 's => s.verbose', component: 'Header' },
    { selector: 's => s.model', component: 'Footer' },
    { selector: 's => s.permissions', component: 'PermDialog' },
];

export default function AppStateSelectorPattern() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                AppState 의 selector 분기 패턴
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                거대 단일 스토어 → 컴포넌트별 _자기 슬라이스_ 구독 (Object.is 비교 → 리렌더 최소화)
            </p>

            {/* AppState 박스 */}
            <div
                style={{
                    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                    background: CLAUDE_COLOR.accentBgSoft,
                    borderRadius: 8,
                    padding: '12px 18px',
                    fontFamily: MONO,
                    width: 280,
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        fontSize: FONT.body,
                        fontWeight: 700,
                        color: CLAUDE_COLOR.accent,
                        marginBottom: 8,
                    }}
                >
                    AppState
                </div>
                <div
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 6,
                        padding: '8px 12px',
                        fontSize: FONT.min,
                        color: COLOR.text,
                        textAlign: 'left',
                        lineHeight: 1.7,
                    }}
                >
                    verbose: false<br />
                    model: opus-4-6<br />
                    tasks: {'{…}'}<br />
                    permissions: {'{}'}<br />
                    <span style={{ color: COLOR.textDim }}>… 50 개 더</span>
                </div>
            </div>

            <div style={arrowStyle}>↓</div>
            <div style={{ ...arrowStyle, fontSize: FONT.min, color: COLOR.textMuted }}>
                useSyncExternalStore — Object.is 비교
            </div>
            <div style={arrowStyle}>↓</div>

            {/* 3 selector 분기 */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
                {branches.map((b) => (
                    <div
                        key={b.component}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                    >
                        <div style={selectorStyle}>{b.selector}</div>
                        <div style={arrowStyle}>▼</div>
                        <div style={componentBoxStyle}>{b.component}</div>
                    </div>
                ))}
            </div>

            <div
                style={{
                    marginTop: 8,
                    fontSize: FONT.min,
                    color: COLOR.textMuted,
                    fontFamily: MONO,
                    textAlign: 'center',
                }}
            >
                푸터의 `model` 이 바뀌어도 — _Header / PermDialog 안 다시 그려짐_
            </div>
        </div>
    );
}
