'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const CATEGORIES: { emoji: string; title: string; count: number; fields: string }[] = [
    {
        emoji: '1️⃣',
        title: '설정 / 모델',
        count: 10,
        fields: 'settings · verbose · mainLoopModel · thinkingEnabled · …',
    },
    {
        emoji: '2️⃣',
        title: '도구 / 플러그인',
        count: 15,
        fields: 'mcp · plugins · agentDefinitions · sessionHooks · …',
    },
    {
        emoji: '3️⃣',
        title: '권한 / 안전',
        count: 5,
        fields: 'toolPermissionContext · fileHistory · workerSandboxPermissions · …',
    },
    {
        emoji: '4️⃣',
        title: '실행 상태',
        count: 20,
        fields: 'tasks · todos · agentNameRegistry · foregroundedTaskId · speculation · …',
    },
    {
        emoji: '5️⃣',
        title: 'UI / 네트워크 상태',
        count: 50,
        fields: 'footerSelection · expandedView · statusLineText · replBridge* · remoteConnectionStatus · notifications · …',
    },
];

export default function AppStateCategories() {
    return (
        <div className="mt-8 mb-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                AppState 의 5 카테고리 (~85 필드)
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                10 + 15 + 5 + 20 + 50 = 85 (3.2 의 Tool 5 카테고리와 같은 사고)
            </p>

            <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CATEGORIES.map((cat) => (
                    <div
                        key={cat.title}
                        style={{
                            border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                            background: CLAUDE_COLOR.accentBg,
                            borderRadius: 8,
                            padding: '10px 14px',
                            fontFamily: MONO,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: 8,
                                marginBottom: 4,
                            }}
                        >
                            <span style={{ fontSize: FONT.body }}>{cat.emoji}</span>
                            <span style={{ fontSize: FONT.body, fontWeight: 600, color: COLOR.textBright }}>
                                {cat.title}
                            </span>
                            <span
                                style={{
                                    marginLeft: 'auto',
                                    fontSize: FONT.small,
                                    color: CLAUDE_COLOR.accent,
                                    fontWeight: 600,
                                }}
                            >
                                {cat.count}개
                            </span>
                        </div>
                        <div style={{ fontSize: FONT.min, color: COLOR.textMuted, lineHeight: 1.6 }}>
                            {cat.fields}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
