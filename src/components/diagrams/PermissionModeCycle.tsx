'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const MODES = [
    { icon: '', label: 'Default', desc: '위험 명령마다 다이얼로그' },
    { icon: '⏵⏵', label: 'Accept edits', desc: '파일 편집 조용히 통과' },
    { icon: '⏸', label: 'Plan Mode', desc: '아무것도 수정 안 함' },
    { icon: '⏵⏵', label: 'Bypass Permissions', desc: '모든 다이얼로그 사라짐' },
];

export default function PermissionModeCycle() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                권한 모드 4 가지 — Shift+Tab 순환
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                `mode` 한 글자가 같은 도구·같은 입력을 _전혀 다른 시스템처럼_ 동작시킨다
            </p>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: 8,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    fontFamily: MONO,
                }}
            >
                {MODES.map((m, i) => (
                    <React.Fragment key={m.label + i}>
                        <div
                            style={{
                                border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                                background: CLAUDE_COLOR.accentBg,
                                borderRadius: 8,
                                padding: '10px 14px',
                                minWidth: 130,
                                maxWidth: 160,
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                            }}
                        >
                            {m.icon && (
                                <div style={{ fontSize: FONT.body, color: CLAUDE_COLOR.accent }}>
                                    {m.icon}
                                </div>
                            )}
                            <div
                                style={{
                                    fontSize: FONT.small,
                                    fontWeight: 600,
                                    color: COLOR.textBright,
                                }}
                            >
                                {m.label}
                            </div>
                            <div style={{ fontSize: FONT.min, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {m.desc}
                            </div>
                        </div>
                        {i < MODES.length - 1 && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: COLOR.textDim,
                                    fontSize: FONT.body,
                                }}
                            >
                                →
                            </div>
                        )}
                    </React.Fragment>
                ))}
                {/* 순환 표시 */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: CLAUDE_COLOR.accent,
                        fontSize: FONT.body,
                        marginLeft: 4,
                    }}
                >
                    ↻
                </div>
            </div>
        </div>
    );
}
