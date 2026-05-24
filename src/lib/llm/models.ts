// Client / Server 양쪽에서 안전하게 import 가능한 모델 메타데이터.
// Server SDK 결로 의존성 없음 — 'use client' 컴포넌트에서 자유롭게 import.

export interface ModelOption {
    id: string;
    label: string;
    provider: 'anthropic' | 'google';
    description: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
    {
        id: 'claude-opus-4-7',
        label: 'Claude Opus 4.7',
        provider: 'anthropic',
        description: 'Anthropic 최상위 — 깊은 추론, 긴 본문 이해',
    },
    {
        id: 'gemini-3.5-flash',
        label: 'Gemini 3.5 Flash',
        provider: 'google',
        description: 'Google Vertex — 빠른 응답, 다국어 강세',
    },
];

export const DEFAULT_MODEL_ID = 'gemini-3.5-flash';
