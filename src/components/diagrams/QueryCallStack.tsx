'use client';

import React from 'react';
import { FONT, COLOR, CLAUDE_COLOR } from './diagramTokens';

const MONO = 'var(--font-geist-mono), "SFMono-Regular", Menlo, monospace';

const layerStyle = (depth: number): React.CSSProperties => ({
    marginLeft: depth * 18,
    padding: '6px 12px',
    background:
        depth === 0
            ? 'rgba(255,255,255,0.04)'
            : depth === 1
                ? CLAUDE_COLOR.accentBgSoft
                : CLAUDE_COLOR.accentBg,
    border: `1px solid ${
        depth === 0 ? 'rgba(255,255,255,0.08)' : CLAUDE_COLOR.accentBorder
    }`,
    borderRadius: 6,
    fontSize: FONT.small,
    color: COLOR.text,
    fontFamily: MONO,
});

const arrowStyle: React.CSSProperties = {
    color: COLOR.textDim,
    fontSize: 14,
    fontFamily: MONO,
    textAlign: 'left',
    padding: '2px 0',
};

const ROWS: { depth: number; arrow: number; label: string; tag?: string }[] = [
    { depth: 0, arrow: 0, label: '사용자 입력' },
    { depth: 1, arrow: 0, label: 'QueryEngine.submitMessage(input)', tag: '외부 진입점 · async generator' },
    { depth: 1, arrow: 1, label: '메시지 히스토리에 추가 · 시스템 프롬프트 빌드' },
    { depth: 2, arrow: 1, label: 'query(params: QueryParams)', tag: '얇은 wrapper · lifecycle tracking' },
    { depth: 3, arrow: 2, label: 'queryLoop(params, ...)', tag: '진짜 내부 루프 · while + 상태 머신' },
    { depth: 4, arrow: 3, label: 'while True: API 호출 (스트리밍) → 도구 → continue / break' },
    { depth: 1, arrow: 0, label: '호출자(REPL)가 yield 받은 이벤트를 UI 에 반영' },
    { depth: 0, arrow: 0, label: '턴 종료' },
];

export default function QueryCallStack() {
    return (
        <div className="mt-8 mb-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 2 }}>
                query 호출 관계 — 세 계층
            </h3>
            <p style={{ color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                submitMessage → query (wrapper) → queryLoop (진짜 루프) → while
            </p>

            <div
                style={{
                    width: '100%',
                    maxWidth: 620,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}
            >
                {ROWS.map((r, i) => (
                    <div key={i} style={layerStyle(r.depth)}>
                        <div style={{ fontWeight: r.depth === 0 ? 600 : 500 }}>{r.label}</div>
                        {r.tag && (
                            <div style={{ fontSize: FONT.min, color: COLOR.textMuted, marginTop: 2 }}>
                                ← {r.tag}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
