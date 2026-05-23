'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const stepStyle: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: FONT.small,
    color: COLOR.text,
    padding: '6px 4px',
};

const QUEUE_ITEMS = [
    { label: '사용자 입력', priority: 'next' },
    { label: '워커(Agent) 결과', priority: 'later' },
    { label: '팀원 메일', priority: 'later' },
    { label: '시스템 알림', priority: '…' },
];

export default function QueueLoopModel() {
    return (
        <div
            className="mt-8 mb-12"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                메시지 큐 + query 루프 모델
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                큐에 누적되는 메시지를 _매 turn 시작 시_ 꺼내 컨텍스트에 합류
            </p>

            {/* query loop — 큰 박스 */}
            <div
                style={{
                    border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                    background: CLAUDE_COLOR.accentBg,
                    borderRadius: 10,
                    padding: '14px 18px',
                    width: '100%',
                    maxWidth: 560,
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
                    query loop (계속 돔)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={stepStyle}>① await queue.get() — 큐가 비면 _대기_ (idle)</div>
                    <div style={{ ...stepStyle, color: COLOR.textDim, fontSize: FONT.min }}>
                        [메시지 enqueue 됨 → await resume]
                    </div>
                    <div style={stepStyle}>② 큐에서 꺼냄 → 히스토리에 user 메시지로 append</div>
                    <div style={stepStyle}>③ API call (누적 히스토리 전체)</div>
                    <div style={stepStyle}>④ 모델 응답 → 히스토리에 assistant 메시지로 append</div>
                    <div style={stepStyle}>
                        ⑤ 도구 호출 있나?
                    </div>
                    <div style={{ paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={stepStyle}>
                            <span style={{ color: CLAUDE_COLOR.accent, fontWeight: 600 }}>├ 있음</span>
                            <span style={{ color: COLOR.textDim }}>  → tool 실행 → tool_result 로 ③ 로 (같은 turn)</span>
                        </div>
                        <div style={stepStyle}>
                            <span style={{ color: CLAUDE_COLOR.accent, fontWeight: 600 }}>└ 없음</span>
                            <span style={{ color: COLOR.textDim }}>  → turn 종료 → ① 로 돌아감</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* queue 박스 (병렬) */}
            <div
                style={{
                    border: '1px dashed rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 10,
                    padding: '10px 16px',
                    width: '100%',
                    maxWidth: 320,
                    fontFamily: MONO,
                }}
            >
                <div
                    style={{
                        fontSize: FONT.small,
                        color: COLOR.textBright,
                        fontWeight: 600,
                        marginBottom: 8,
                        textAlign: 'center',
                    }}
                >
                    queue
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {QUEUE_ITEMS.map((q) => (
                        <div
                            key={q.label}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: FONT.small,
                                color: COLOR.text,
                            }}
                        >
                            <span>· {q.label}</span>
                            <span style={{ color: CLAUDE_COLOR.accent, fontSize: FONT.min, fontWeight: 600 }}>
                                {q.priority}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
