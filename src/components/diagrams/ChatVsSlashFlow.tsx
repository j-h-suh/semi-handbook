'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

type Step = { label: string; tag?: string; muted?: boolean; highlight?: boolean };

const CHAT_STEPS: Step[] = [
    { label: '사용자: "이 함수 좀 리팩토링해줘"' },
    { label: '↓ (그대로)', muted: true },
    { label: 'PromptInput 컴포넌트' },
    { label: '↓', muted: true },
    { label: "messages.push({ role: 'user', content: \"이 함수 좀 리팩토링해줘\" })", tag: 'TypeScript' },
    { label: '↓', muted: true },
    { label: 'query.ts (2 장의 에이전트 루프)' },
    { label: '↓', muted: true },
    { label: 'LLM 이 본다: "이 함수 좀 리팩토링해줘"', highlight: true },
];

const SLASH_STEPS: Step[] = [
    { label: '사용자: "/commit"' },
    { label: '↓', muted: true },
    { label: 'PromptInput 컴포넌트' },
    { label: '↓', muted: true },
    { label: '"앗, / 로 시작하네 — 명령 디스패처로 보내자"', tag: '분기' },
    { label: '↓', muted: true },
    { label: 'COMMANDS 레지스트리 조회' },
    { label: '↓', muted: true },
    { label: 'commit 명령 객체 찾음 (src/commands/commit.ts)' },
    { label: '↓', muted: true },
    { label: "type: 'prompt' 명령 확인" },
    { label: '↓', muted: true },
    { label: 'getPromptForCommand("") 호출 → 진짜 프롬프트가 _생성됨_', tag: '치환' },
    { label: '↓', muted: true },
    {
        label: '생성된 프롬프트: ## Context · git status / diff / log · ## Git Safety · ## Your task …',
        tag: '거대한 프롬프트',
    },
    { label: '↓', muted: true },
    { label: 'messages.push({ role: "user", content: <위 거대한 프롬프트> })' },
    { label: '↓', muted: true },
    { label: 'query.ts — 여기서부터는 일반 채팅과 같음' },
    { label: '↓', muted: true },
    { label: 'LLM 이 본다: <위 거대한 프롬프트>', highlight: true },
];

function FlowColumn({ title, subtitle, steps }: { title: string; subtitle: string; steps: Step[] }) {
    return (
        <div
            style={{
                flex: 1,
                minWidth: 280,
                border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                background: CLAUDE_COLOR.accentBgSoft,
                borderRadius: 10,
                padding: '14px 16px',
                fontFamily: MONO,
            }}
        >
            <div
                style={{
                    fontSize: FONT.body,
                    fontWeight: 700,
                    color: CLAUDE_COLOR.accent,
                    textAlign: 'center',
                }}
            >
                {title}
            </div>
            <div
                style={{
                    fontSize: FONT.min,
                    color: COLOR.textMuted,
                    textAlign: 'center',
                    marginBottom: 10,
                }}
            >
                {subtitle}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {steps.map((s, i) => (
                    <div
                        key={i}
                        style={{
                            fontSize: s.muted ? FONT.min : FONT.small,
                            color: s.highlight
                                ? CLAUDE_COLOR.accent
                                : s.muted
                                    ? COLOR.textDim
                                    : COLOR.text,
                            fontWeight: s.highlight ? 600 : 400,
                            textAlign: s.muted ? 'center' : 'left',
                            padding: s.muted ? '0' : '3px 0',
                        }}
                    >
                        {s.label}
                        {s.tag && (
                            <span style={{ color: COLOR.textMuted, fontSize: FONT.min, marginLeft: 6 }}>
                                ({s.tag})
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ChatVsSlashFlow({ kind }: { kind: 'chat' | 'slash' }) {
    if (kind === 'chat') {
        return (
            <div className="mt-8 mb-12" style={{ display: 'flex', justifyContent: 'center' }}>
                <FlowColumn
                    title="일반 채팅"
                    subtitle="입력 _투명_ — 친 텍스트 = LLM 이 보는 텍스트"
                    steps={CHAT_STEPS}
                />
            </div>
        );
    }
    return (
        <div className="mt-8 mb-12" style={{ display: 'flex', justifyContent: 'center' }}>
            <FlowColumn
                title="슬래시 명령 (/commit)"
                subtitle="입력 _불투명_ — 친 텍스트 ≠ LLM 이 보는 텍스트"
                steps={SLASH_STEPS}
            />
        </div>
    );
}
