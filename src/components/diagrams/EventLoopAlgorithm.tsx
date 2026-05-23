'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const STEPS = [
    { num: '1', label: '큐에서 깨어 있는 코루틴 하나 꺼냄', sub: null },
    { num: '2', label: '그 코루틴을 다음 `await` 까지 진행시킴', sub: null },
    {
        num: '3',
        label: '`await` 가 기다리는 작업을 OS (또는 다른 코루틴) 에 위임',
        sub: '→ 코루틴은 "대기" 상태로 보류 (1번에서 큐 밖으로 나간 그대로)',
    },
    {
        num: '4',
        label: '위임된 작업이 끝나면',
        sub: '→ 콜백을 통해 그 코루틴이 큐에 다시 들어감',
    },
    { num: '5', label: '처음으로', sub: null },
];

export default function EventLoopAlgorithm() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                이벤트 루프 — 큐 하나 + 무한 반복
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                single-threaded · cooperative scheduling
            </p>

            <div
                style={{
                    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                    background: CLAUDE_COLOR.accentBg,
                    borderRadius: 10,
                    padding: '14px 20px',
                    width: '100%',
                    maxWidth: 520,
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
                    ↻ 무한 반복
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {STEPS.map((s) => (
                        <div key={s.num} style={{ fontSize: FONT.small, color: COLOR.text }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                                <span style={{ color: CLAUDE_COLOR.accent, fontWeight: 600, minWidth: 18 }}>
                                    {s.num}.
                                </span>
                                <span>{s.label}</span>
                            </div>
                            {s.sub && (
                                <div
                                    style={{
                                        marginLeft: 26,
                                        marginTop: 2,
                                        fontSize: FONT.min,
                                        color: COLOR.textMuted,
                                    }}
                                >
                                    {s.sub}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
