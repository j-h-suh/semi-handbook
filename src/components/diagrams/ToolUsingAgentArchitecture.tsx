'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type NodeId = 'user' | 'planner' | 'sql' | 'fdc' | 'wmap' | 'rag' | 'llm' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    user:    { label: '엔지니어', sub: '자연어 질문', desc: '"오늘 수율이 떨어진 원인을 분석해줘" — 복잡한 멀티스텝 분석을 자연어로 요청.', color: '#3b82f6' },
    planner: { label: 'Planner', sub: '도구 선택/실행 순서', desc: '어떤 도구를 어떤 순서로 호출할지 자율 결정. ReAct / Chain-of-Thought 방식.', color: '#a855f7' },
    sql:     { label: 'SQL Query', sub: 'YMS/MES 조회', desc: '수율 DB, 장비 이력, 로트 정보 등 구조화된 데이터 조회. Text-to-SQL.', color: '#22c55e' },
    fdc:     { label: 'FDC 이상탐지', sub: '장비 센서 분석', desc: '3.6장의 FDC 이상 탐지 모델 호출. 관련 장비의 센서 이상 여부 확인.', color: '#f59e0b' },
    wmap:    { label: '웨이퍼맵 분류', sub: '패턴 분석', desc: '3.7장의 웨이퍼맵 분류기 호출. 불량 패턴(Edge, Ring, Zone 등) 자동 분류.', color: '#ef4444' },
    rag:     { label: 'RAG 검색', sub: '과거 사례 매칭', desc: '벡터 DB에서 유사 사례 검색. 과거 트러블슈팅 경험 활용.', color: '#06b6d4' },
    llm:     { label: 'LLM 종합', sub: '분석 보고서 생성', desc: '모든 도구의 결과를 종합하여 원인 분석 + 권고사항을 자연어 보고서로 생성.', color: '#ec4899' },
};

const SVG_W = 740;
const SVG_H = 260;
const CX = SVG_W / 2;

export default function ToolUsingAgentArchitecture() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDim = (id: NodeId) => hovered !== null && hovered !== id;

    const userX = 70; const userY = SVG_H / 2;
    const plannerX = 230; const plannerY = SVG_H / 2;
    const toolX = 440;
    const tools = [
        { id: 'sql' as const, y: 40 },
        { id: 'fdc' as const, y: 96 },
        { id: 'wmap' as const, y: 152 },
        { id: 'rag' as const, y: 208 },
    ];
    const llmX = 650; const llmY = SVG_H / 2;

    const W = 130; const H = 48;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                AI 에이전트 — Tool-Using Agent 아키텍처
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                자연어 질문 → Planner → 도구 자율 호출 → 종합 분석
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 740 }}>
                    <defs>
                        <marker id="arrowAG" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {/* user → planner */}
                    <line x1={userX + W / 2} y1={userY} x2={plannerX - W / 2} y2={plannerY}
                        stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrowAG)" />
                    {/* planner → tools */}
                    {tools.map(t => (
                        <line key={t.id} x1={plannerX + W / 2} y1={plannerY} x2={toolX - W / 2} y2={t.y}
                            stroke="rgba(255,255,255,0.08)" strokeWidth={1} markerEnd="url(#arrowAG)" />
                    ))}
                    {/* tools → llm */}
                    {tools.map(t => (
                        <line key={t.id + 'out'} x1={toolX + W / 2} y1={t.y} x2={llmX - W / 2} y2={llmY}
                            stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="3 2" markerEnd="url(#arrowAG)" />
                    ))}

                    {/* Render nodes */}
                    {([
                        { id: 'user' as const, x: userX, y: userY },
                        { id: 'planner' as const, x: plannerX, y: plannerY },
                        ...tools.map(t => ({ id: t.id, x: toolX, y: t.y })),
                        { id: 'llm' as const, x: llmX, y: llmY },
                    ]).map(({ id, x, y }) => {
                        const info = NODES[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - W / 2 - 4} y={y - H / 2 - 4} width={W + 8} height={H + 8} fill="transparent" />
                                <rect x={x - W / 2} y={y - H / 2} width={W} height={H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={x} y={y - 6} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>{info.label}</text>
                                <text x={x} y={y + 12} textAnchor="middle" dominantBaseline="central"
                                    fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', marginTop: 8, height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: NODES[hovered].color, marginBottom: 2 }}>{NODES[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{NODES[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 노드를 호버하세요. Part 3~4의 모든 ML 모델이 에이전트의 도구(Tool)가 됩니다.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
