'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 공정 단계 ─── */
type StepId = 'hmds' | 'coat' | 'softbake' | 'align' | 'expose' | 'peb' | 'develop' | 'hardbake' | 'inspect' | null;

interface StepInfo {
    label: string;
    sub: string;
    desc: string;
    zone: 'track-pre' | 'scanner' | 'track-post';
}

const STEPS: Record<Exclude<StepId, null>, StepInfo> = {
    hmds: { label: 'HMDS', sub: '접착 촉진', desc: '웨이퍼 표면을 소수성으로 변환하여 PR 접착력 향상. 벽에 프라이머를 바르는 것과 같은 원리.', zone: 'track-pre' },
    coat: { label: 'PR 도포', sub: 'Spin Coating', desc: '3,000~5,000 rpm 고속 회전으로 80~150nm 균일 PR 막 형성. 두께 편차가 CD 균일도에 직결.', zone: 'track-pre' },
    softbake: { label: '소프트 베이크', sub: 'Soft Bake', desc: '90~110°C, 60~90초. 용매를 증발시켜 PR 막 안정화. ±0.1°C 정밀 온도 제어 필요.', zone: 'track-pre' },
    align: { label: '정렬', sub: 'Alignment', desc: '이전 층의 Alignment Mark와 현재 마스크를 광학적으로 정렬. Overlay 정확도 2nm 이하 요구.', zone: 'scanner' },
    expose: { label: '노광', sub: 'Exposure', desc: '마스크 패턴을 빛(DUV/EUV)으로 PR에 전사. Dose(에너지)와 Focus(초점)가 핵심 파라미터.', zone: 'scanner' },
    peb: { label: 'PEB', sub: 'Post-Exposure Bake', desc: '노광 후 열처리. 화학증폭형 레지스트의 산(Acid)이 촉매 반응으로 패턴을 증폭. 1°C 변화=CD 변화.', zone: 'track-post' },
    develop: { label: '현상', sub: 'Development', desc: 'TMAH 2.38% 현상액으로 노광 부분(포지티브) 또는 비노광 부분(네거티브)을 선택적 용해.', zone: 'track-post' },
    hardbake: { label: '하드 베이크', sub: 'Hard Bake', desc: '110~130°C. 남은 PR의 내식각성을 강화. 후속 식각 공정에서 보호막 역할.', zone: 'track-post' },
    inspect: { label: '검사', sub: 'ADI Inspection', desc: 'CD, Overlay, 결함을 측정. 문제 발견 시 리워크(Rework) 가능한 마지막 기회.', zone: 'track-post' },
};

const STEP_ORDER: Exclude<StepId, null>[] = ['hmds', 'coat', 'softbake', 'align', 'expose', 'peb', 'develop', 'hardbake', 'inspect'];

const ZONE_COLORS = {
    'track-pre': { border: '#f59e0b', bg: 'rgba(245,158,11,0.05)', label: 'Track — 전처리' },
    'scanner': { border: '#3b82f6', bg: 'rgba(59,130,246,0.05)', label: 'Scanner' },
    'track-post': { border: '#22c55e', bg: 'rgba(34,197,94,0.05)', label: 'Track — 후처리' },
};

function Arrow() {
    return (
        <svg width="20" height="14" viewBox="0 0 20 14" className="flex-shrink-0">
            <line x1="0" y1="7" x2="13" y2="7" stroke="#4b5563" strokeWidth="1.5" />
            <polygon points="11,2 19,7 11,12" fill="#4b5563" />
        </svg>
    );
}

function DownArrow() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0' }}>
            <svg width="14" height="20" viewBox="0 0 14 20">
                <line x1="7" y1="0" x2="7" y2="13" stroke="#4b5563" strokeWidth="1.5" />
                <polygon points="2,12 7,19 12,12" fill="#4b5563" />
            </svg>
        </div>
    );
}

export default function LithoProcessFlow() {
    const [hovered, setHovered] = useState<StepId>(null);

    const isDimmed = (id: Exclude<StepId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                포토리소그래피 공정 흐름
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                Photolithography Process Flow — Track + Scanner
            </p>

            {/* 세로 배치: 전처리 → 스캐너 → 후처리 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {(['track-pre', 'scanner', 'track-post'] as const).map((zone, zoneIdx) => {
                    const zoneInfo = ZONE_COLORS[zone];
                    const zoneSteps = STEP_ORDER.filter(s => STEPS[s].zone === zone);
                    return (
                        <React.Fragment key={zone}>
                            {zoneIdx > 0 && <DownArrow />}
                            <div style={{ border: `1px solid ${zoneInfo.border}30`, borderRadius: 10, padding: '8px 12px',
                                background: zoneInfo.bg }}>
                                <div style={{ fontSize: FONT.min, color: zoneInfo.border, fontWeight: 600, textAlign: 'center', marginBottom: 6 }}>
                                    {zoneInfo.label}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
                                    {zoneSteps.map((stepId, idx) => {
                                        const info = STEPS[stepId];
                                        const active = hovered === stepId;
                                        const dim = isDimmed(stepId);
                                        return (
                                            <React.Fragment key={stepId}>
                                                {idx > 0 && <Arrow />}
                                                <motion.div
                                                    onMouseEnter={() => setHovered(stepId)}
                                                    animate={{ opacity: dim ? 0.3 : 1, scale: active ? 1.05 : 1 }}
                                                    transition={{ duration: 0.15 }}
                                                    style={{
                                                        background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                                                        border: `1px solid ${active ? zoneInfo.border : 'rgba(255,255,255,0.08)'}`,
                                                        borderRadius: 6, padding: '5px 8px', cursor: 'pointer', textAlign: 'center',
                                                        boxShadow: active ? `0 0 8px ${zoneInfo.border}30` : 'none',
                                                    }}>
                                                    <div style={{ fontSize: FONT.min, fontWeight: 600, color: COLOR.textBright, whiteSpace: 'nowrap' }}>{info.label}</div>
                                                    <div style={{ fontSize: FONT.min - 2, color: COLOR.textDim, whiteSpace: 'nowrap' }}>{info.sub}</div>
                                                </motion.div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Tooltip */}
            <div style={{ maxWidth: 600, margin: '8px auto 0', height: 62 }}>
                <AnimatePresence mode="wait">
                    {hovered && (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: ZONE_COLORS[STEPS[hovered].zone].border, marginBottom: 2 }}>
                                {STEPS[hovered].label} — {STEPS[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {STEPS[hovered].desc}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
