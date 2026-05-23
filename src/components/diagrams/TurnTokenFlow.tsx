'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const STEPS: { num: number; type: 'text' | 'spinner' | 'box' | 'end'; label: string }[] = [
    { num: 1, type: 'text', label: '"확인해볼게요" 같은 짧은 텍스트가 토큰 단위로 흐름' },
    { num: 2, type: 'spinner', label: 'Bash: git status' },
    { num: 3, type: 'box', label: '결과 박스 (변경된 파일 목록)' },
    { num: 4, type: 'spinner', label: 'Bash: git diff --stat' },
    { num: 5, type: 'box', label: '결과 박스' },
    { num: 6, type: 'spinner', label: 'Read: src/foo.py' },
    { num: 7, type: 'box', label: '결과 박스 (파일 내용)' },
    { num: 8, type: 'text', label: '"변경 사항을 정리하면..." 더 긴 텍스트 토큰 흐름' },
    { num: 9, type: 'text', label: '추천 커밋 메시지' },
    { num: 10, type: 'end', label: '응답 종료' },
];

const ICONS: Record<typeof STEPS[number]['type'], string> = {
    text: '▍',
    spinner: '⠋',
    box: '▭',
    end: '■',
};

export default function TurnTokenFlow() {
    return (
        <div className="mt-8 mb-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                한 턴에서 일어나는 일 — 10 단계
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                /commit 한 번 = API 4 호출 + 도구 3 회 + 텍스트 스트림 3 회
            </p>

            <div
                style={{
                    width: '100%',
                    maxWidth: 540,
                    fontFamily: MONO,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}
            >
                {STEPS.map((s) => (
                    <div
                        key={s.num}
                        style={{
                            display: 'flex',
                            gap: 10,
                            alignItems: 'baseline',
                            padding: '6px 12px',
                            background:
                                s.type === 'end'
                                    ? CLAUDE_COLOR.accentBg
                                    : 'rgba(255,255,255,0.02)',
                            border:
                                s.type === 'end'
                                    ? `1px solid ${CLAUDE_COLOR.accentBorder}`
                                    : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 6,
                            fontSize: FONT.small,
                            color: COLOR.text,
                        }}
                    >
                        <span
                            style={{
                                color: CLAUDE_COLOR.accent,
                                fontWeight: 600,
                                minWidth: 22,
                            }}
                        >
                            {s.num}.
                        </span>
                        <span style={{ color: COLOR.textMuted, minWidth: 14 }}>{ICONS[s.type]}</span>
                        <span>{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
