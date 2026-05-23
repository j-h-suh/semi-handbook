'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

export default function BashCommandSplit() {
    return (
        <div className="mt-8 mb-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                Bash 합성 명령 — 부분별 안전성 분리
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                `{'{command: "ls && git push origin main"}'}` 은 하나? 둘?
            </p>

            <div
                style={{
                    width: '100%',
                    maxWidth: 480,
                    fontFamily: MONO,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        background: 'rgba(0, 212, 164, 0.05)',
                        border: '1px solid rgba(0, 212, 164, 0.20)',
                        borderRadius: 6,
                    }}
                >
                    <span style={{ fontSize: FONT.body, fontWeight: 600, color: COLOR.textBright, minWidth: 140 }}>
                        ls
                    </span>
                    <span style={{ fontSize: FONT.small, color: COLOR.text, flex: 1 }}>읽기 작업</span>
                    <span style={{ fontSize: FONT.min, color: CLAUDE_COLOR.accent, fontWeight: 600 }}>
                        안전
                    </span>
                </div>

                <div
                    style={{
                        textAlign: 'center',
                        color: COLOR.textDim,
                        fontSize: FONT.body,
                    }}
                >
                    &amp;&amp;
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        background: 'rgba(195, 125, 13, 0.06)',
                        border: '1px solid rgba(195, 125, 13, 0.30)',
                        borderRadius: 6,
                    }}
                >
                    <span style={{ fontSize: FONT.body, fontWeight: 600, color: COLOR.textBright, minWidth: 140 }}>
                        git push origin main
                    </span>
                    <span style={{ fontSize: FONT.small, color: COLOR.text, flex: 1 }}>원격 푸시</span>
                    <span style={{ fontSize: FONT.min, color: '#c37d0d', fontWeight: 600 }}>
                        위험
                    </span>
                </div>
            </div>

            <p
                style={{
                    marginTop: 12,
                    fontSize: FONT.min,
                    color: COLOR.textMuted,
                    fontFamily: MONO,
                    textAlign: 'center',
                    maxWidth: 480,
                }}
            >
                둘. 권한 시스템은 둘 다 검사 — 통째 매칭 시 `Bash(git *)` 룰 우회 위험
            </p>
        </div>
    );
}
