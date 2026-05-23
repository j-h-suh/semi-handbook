'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const STEPS = [
    { num: 1, name: 'validateInput', desc: '입력이 말이 되나?', disk: false },
    { num: 2, name: 'checkPermissions', desc: '사용자 권한 룰에 맞나?', disk: false },
    { num: 3, name: 'call', desc: '진짜 읽기', disk: true },
];

export default function FileReadFlow() {
    return (
        <div className="mt-8 mb-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                FileRead 의 3 단계 — 순서 = 보안
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                사용자가 본 0.3 초 안에 _순서대로_ 일어나는 일
            </p>

            <div style={{ width: '100%', maxWidth: 540, fontFamily: MONO }}>
                {/* 사용자가 본 것 */}
                <div
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        marginBottom: 14,
                    }}
                >
                    <div style={{ fontSize: FONT.min, color: COLOR.textMuted, marginBottom: 2 }}>
                        사용자가 본 것
                    </div>
                    <div style={{ fontSize: FONT.small, color: COLOR.textBright }}>
                        <span style={{ color: CLAUDE_COLOR.accent }}>⠋</span> Reading src/foo.ts
                    </div>
                </div>

                <div style={{ fontSize: FONT.min, color: COLOR.textMuted, marginBottom: 6 }}>
                    실제로 일어난 일:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {STEPS.map((s) => (
                        <div
                            key={s.num}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 14px',
                                background: s.disk ? CLAUDE_COLOR.accentBg : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${
                                    s.disk ? CLAUDE_COLOR.accentBorder : 'rgba(255,255,255,0.06)'
                                }`,
                                borderRadius: 6,
                            }}
                        >
                            <span
                                style={{
                                    color: CLAUDE_COLOR.accent,
                                    fontWeight: 600,
                                    fontSize: FONT.small,
                                    minWidth: 16,
                                }}
                            >
                                {s.num}.
                            </span>
                            <span
                                style={{
                                    fontSize: FONT.small,
                                    fontWeight: 600,
                                    color: COLOR.textBright,
                                    minWidth: 150,
                                }}
                            >
                                {s.name}
                            </span>
                            <span style={{ fontSize: FONT.small, color: COLOR.text, flex: 1 }}>
                                {s.desc}
                            </span>
                            <span
                                style={{
                                    fontSize: FONT.min,
                                    color: s.disk ? CLAUDE_COLOR.accent : COLOR.textDim,
                                    fontWeight: s.disk ? 600 : 400,
                                }}
                            >
                                {s.disk ? '드디어 디스크' : '디스크 안 만짐'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
