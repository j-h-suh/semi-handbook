'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const CATEGORIES: { emoji: string; title: string; count: number; fields: string[] }[] = [
    {
        emoji: '1️⃣',
        title: '정체성 (Identity)',
        count: 9,
        fields: [
            'name', 'aliases?', 'description()', 'searchHint?',
            'mcpInfo?', 'isMcp?', 'isLsp?', 'shouldDefer?', 'alwaysLoad?',
        ],
    },
    {
        emoji: '2️⃣',
        title: '스키마 (Schema)',
        count: 3,
        fields: ['inputSchema', 'inputJSONSchema?', 'outputSchema?'],
    },
    {
        emoji: '3️⃣',
        title: '실행 (Execution)',
        count: 9,
        fields: [
            'call()', 'validateInput?()', 'isEnabled()',
            'maxResultSizeChars', 'strict?', 'prompt()',
            'inputsEquivalent?()', 'backfillObservableInput?()',
            'mapToolResultToToolResultBlockParam()',
        ],
    },
    {
        emoji: '4️⃣',
        title: '권한 / 메타데이터 (Policy)',
        count: 11,
        fields: [
            'checkPermissions()', 'isConcurrencySafe()',
            'isReadOnly()', 'isDestructive?()',
            'interruptBehavior?()', 'isSearchOrReadCommand?()',
            'isOpenWorld?()', 'requiresUserInteraction?()',
            'getPath?()', 'preparePermissionMatcher?()',
            'toAutoClassifierInput()',
        ],
    },
    {
        emoji: '5️⃣',
        title: '렌더링 (UI Rendering)',
        count: 15,
        fields: [
            'userFacingName()', 'userFacingNameBackgroundColor?()',
            'isTransparentWrapper?()', 'getToolUseSummary?()',
            'getActivityDescription?()', 'renderToolUseMessage()',
            'renderToolResultMessage?()', 'renderToolUseTag?()',
            'renderToolUseProgressMessage?()',
            'renderToolUseQueuedMessage?()',
            'renderToolUseRejectedMessage?()',
            'renderToolUseErrorMessage?()', 'renderGroupedToolUse?()',
            'extractSearchText?()', 'isResultTruncated?()',
        ],
    },
];

export default function ToolInterface47Fields() {
    return (
        <div className="mt-8 mb-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                Tool 인터페이스 47 필드 = 5 카테고리
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                메서드 34 + 속성 13 = 47 (정체성 9 · 스키마 3 · 실행 9 · 권한 11 · 렌더링 15)
            </p>

            <div
                style={{
                    width: '100%',
                    maxWidth: 720,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                }}
            >
                {CATEGORIES.map((cat) => (
                    <div
                        key={cat.title}
                        style={{
                            border: `1px solid ${CLAUDE_COLOR.accentBorder}`,
                            background: CLAUDE_COLOR.accentBg,
                            borderRadius: 8,
                            padding: '12px 16px',
                            fontFamily: MONO,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: 8,
                                marginBottom: 8,
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
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '4px 8px',
                                fontSize: FONT.small,
                                color: COLOR.text,
                            }}
                        >
                            {cat.fields.map((field) => (
                                <span
                                    key={field}
                                    style={{
                                        padding: '2px 6px',
                                        background: 'rgba(255,255,255,0.04)',
                                        borderRadius: 4,
                                        fontSize: FONT.min,
                                    }}
                                >
                                    {field}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}

                <div
                    style={{
                        marginTop: 6,
                        textAlign: 'center',
                        fontSize: FONT.small,
                        color: COLOR.textMuted,
                        fontFamily: MONO,
                    }}
                >
                    합계: 9 + 3 + 9 + 11 + 15 = <span style={{ color: CLAUDE_COLOR.accent, fontWeight: 600 }}>47</span>
                </div>
            </div>
        </div>
    );
}
