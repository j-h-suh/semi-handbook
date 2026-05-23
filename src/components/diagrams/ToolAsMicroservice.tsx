'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const ROWS: { label: string; detail: string }[] = [
    { label: '입력 스키마', detail: 'Pydantic / Zod' },
    { label: '권한 체크', detail: 'validateInput' },
    { label: '권한 묻기', detail: 'checkPermissions' },
    { label: '실행', detail: 'call' },
    { label: '진행 상황 보고', detail: 'onProgress' },
    { label: '결과 렌더링', detail: 'renderResult' },
    { label: '에러 렌더링', detail: 'renderError' },
    { label: '메타데이터', detail: 'isReadOnly, …' },
];

export default function ToolAsMicroservice() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                도구 = 작은 마이크로서비스
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                예 — `Read` 도구의 8 가지 구성 요소
            </p>

            <div
                style={{
                    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                    background: CLAUDE_COLOR.accentBgSoft,
                    borderRadius: 10,
                    padding: '14px 18px',
                    width: '100%',
                    maxWidth: 520,
                    fontFamily: MONO,
                }}
            >
                <div
                    style={{
                        fontSize: FONT.body,
                        color: CLAUDE_COLOR.accent,
                        fontWeight: 600,
                        marginBottom: 12,
                        textAlign: 'center',
                    }}
                >
                    도구: Read
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ROWS.map((row, i) => {
                        const isLast = i === ROWS.length - 1;
                        const marker = isLast ? '└─' : '├─';
                        return (
                            <div
                                key={row.label}
                                style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: 8,
                                    fontSize: FONT.small,
                                    color: COLOR.text,
                                }}
                            >
                                <span style={{ color: CLAUDE_COLOR.accent, fontWeight: 600 }}>{marker}</span>
                                <span style={{ fontWeight: 600 }}>{row.label}</span>
                                <span style={{ color: COLOR.textMuted, fontSize: FONT.min }}>
                                    ({row.detail})
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
