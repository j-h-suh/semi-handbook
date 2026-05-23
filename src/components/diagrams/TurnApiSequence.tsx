'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const CALLS: {
    n: number;
    user?: string;
    response: string;
    after?: string[];
    endTurn?: boolean;
}[] = [
    {
        n: 1,
        user: '"이 프로젝트의 변경사항 보고 커밋 메시지 작성해줘"',
        response: '"확인해볼게요" + tool_use(Bash, "git status")',
        after: ['"git status" 실행', '결과를 메시지에 추가'],
    },
    {
        n: 2,
        user: '(위 메시지들 누적)',
        response: 'tool_use(Bash, "git diff --stat")',
        after: ['실행 → 결과 추가'],
    },
    {
        n: 3,
        response: 'tool_use(Read, "src/foo.py")',
        after: ['실행 → 결과 추가'],
    },
    {
        n: 4,
        response: '"변경 사항을 정리하면..." + 추천 커밋 메시지',
        after: ['stopreason = "endturn"', '내부 루프 종료 → 한 턴 끝'],
        endTurn: true,
    },
];

export default function TurnApiSequence() {
    return (
        <div className="mt-8 mb-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                한 턴 = LLM API 4 호출
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                /commit 작업 — 3 도구 호출 + 1 최종 응답
            </p>

            <div
                style={{
                    width: '100%',
                    maxWidth: 620,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    fontFamily: MONO,
                }}
            >
                {CALLS.map((c) => (
                    <div
                        key={c.n}
                        style={{
                            border: `1px solid ${c.endTurn ? CLAUDE_COLOR.accent : CLAUDE_COLOR.accentBorder}`,
                            background: CLAUDE_COLOR.accentBg,
                            borderRadius: 8,
                            padding: '10px 14px',
                            fontSize: FONT.small,
                            color: COLOR.text,
                        }}
                    >
                        <div
                            style={{
                                color: CLAUDE_COLOR.accent,
                                fontWeight: 600,
                                marginBottom: 6,
                            }}
                        >
                            [API 호출 {c.n}]
                        </div>
                        {c.user && (
                            <div style={{ marginBottom: 4 }}>
                                <span style={{ color: COLOR.textMuted }}>사용자: </span>
                                {c.user}
                            </div>
                        )}
                        <div style={{ marginBottom: c.after ? 4 : 0 }}>
                            <span style={{ color: COLOR.textMuted }}>Claude 응답: </span>
                            <span style={{ color: COLOR.textBright }}>{c.response}</span>
                        </div>
                        {c.after && (
                            <div style={{ paddingLeft: 16, fontSize: FONT.min, color: COLOR.textMuted }}>
                                {c.after.map((a, i) => (
                                    <div key={i}>→ {a}</div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
