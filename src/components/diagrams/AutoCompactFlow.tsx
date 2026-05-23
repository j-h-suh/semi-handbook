'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

type Item = { kind: 'state' | 'trigger' | 'call' | 'done'; label: string; meta?: string };

const STEPS: Item[] = [
    { kind: 'state', label: '원본 메시지', meta: '200K 토큰' },
    { kind: 'trigger', label: 'autocompact 트리거' },
    { kind: 'call', label: '요약 LLM 호출', meta: '별도 turn — 보통 더 작은 모델' },
    { kind: 'state', label: '요약본 + 최근 메시지', meta: '50K 토큰' },
    { kind: 'trigger', label: '원래 호출 재시도' },
    { kind: 'done', label: '정상 응답' },
];

const palette: Record<Item['kind'], { bg: string; border: string; color: string }> = {
    state: {
        bg: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.10)',
        color: COLOR.textBright,
    },
    trigger: {
        bg: CLAUDE_COLOR.accentBgSoft,
        border: CLAUDE_COLOR.accentBorderSoft,
        color: CLAUDE_COLOR.accent,
    },
    call: {
        bg: CLAUDE_COLOR.accentBg,
        border: CLAUDE_COLOR.accentBorder,
        color: COLOR.textBright,
    },
    done: {
        bg: CLAUDE_COLOR.accentBg,
        border: CLAUDE_COLOR.accent,
        color: CLAUDE_COLOR.accent,
    },
};

export default function AutoCompactFlow() {
    return (
        <div className="mt-8 mb-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                autocompact — 메시지 압축 흐름
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                200K 토큰 한도 직전 → 별도 LLM 호출로 요약 → 50K 로 재시도
            </p>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    fontFamily: MONO,
                    width: '100%',
                    maxWidth: 400,
                }}
            >
                {STEPS.map((s, i) => {
                    const p = palette[s.kind];
                    return (
                        <React.Fragment key={i}>
                            <div
                                style={{
                                    border: `1px solid ${p.border}`,
                                    background: p.bg,
                                    color: p.color,
                                    borderRadius: 8,
                                    padding: '10px 14px',
                                    textAlign: 'center',
                                }}
                            >
                                <div style={{ fontSize: FONT.small, fontWeight: 600 }}>{s.label}</div>
                                {s.meta && (
                                    <div
                                        style={{
                                            fontSize: FONT.min,
                                            color: COLOR.textMuted,
                                            marginTop: 2,
                                        }}
                                    >
                                        {s.meta}
                                    </div>
                                )}
                            </div>
                            {i < STEPS.length - 1 && (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        color: COLOR.textDim,
                                        fontSize: 16,
                                    }}
                                >
                                    ↓
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
