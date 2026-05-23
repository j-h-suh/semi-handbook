'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const PATHS = [
    { cause: '429 (rate limit)', action: '잠시 대기 후 재시도' },
    { cause: '토큰 한도 초과', action: '자동 압축 (autocompact) 트리거' },
    { cause: '스트리밍 도중 연결 끊김', action: '부분 결과로 폴백' },
    { cause: '도구 결과가 너무 큼', action: '디스크에 저장하고 요약본만 LLM 에' },
];

export default function RecoveryPaths() {
    return (
        <div className="mt-8 mb-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                내부 루프 복구 경로 — 4 자리
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                단순한 `while True` 가 아니라 상태 머신 — 한 루프 안에서 일어날 수 있음
            </p>

            <div
                style={{
                    width: '100%',
                    maxWidth: 560,
                    fontFamily: MONO,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                }}
            >
                <div
                    style={{
                        fontSize: FONT.small,
                        color: CLAUDE_COLOR.accent,
                        fontWeight: 600,
                        marginBottom: 4,
                    }}
                >
                    내부 루프 안에서:
                </div>
                {PATHS.map((p, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'baseline',
                            padding: '8px 12px',
                            background: CLAUDE_COLOR.accentBg,
                            border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                            borderRadius: 6,
                            fontSize: FONT.small,
                            color: COLOR.text,
                        }}
                    >
                        <span style={{ color: CLAUDE_COLOR.accent }}>→</span>
                        <span style={{ flex: 1 }}>
                            <span style={{ fontWeight: 600 }}>{p.cause}</span>
                            <span style={{ color: COLOR.textMuted, margin: '0 6px' }}>→</span>
                            <span style={{ color: CLAUDE_COLOR.accent }}>{p.action}</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
