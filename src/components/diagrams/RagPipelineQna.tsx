'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type StepId = 'query' | 'retrieve' | 'generate' | 'answer' | null;

const STEPS: Record<Exclude<StepId, null>, { label: string; sub: string; desc: string; color: string }> = {
    query:    { label: '엔지니어 질문', sub: '"Ring 패턴 원인은?"', desc: '자연어로 공정 관련 질문. 키워드 매칭이 아닌 의미적 검색(Semantic Search)으로 관련 문서를 찾음.', color: '#3b82f6' },
    retrieve: { label: '검색 (Retrieval)', sub: '벡터 DB 검색', desc: '매뉴얼, 과거 보고서, 트러블슈팅 기록을 벡터 DB(Chroma, Pinecone)에서 의미적으로 검색. 임베딩 유사도 기반.', color: '#22c55e' },
    generate: { label: 'LLM 생성', sub: '관련 문서 기반', desc: '검색된 문서 + 질문을 LLM에 전달. 할루시네이션 방지를 위해 반드시 문서 기반으로 답변 생성.', color: '#f59e0b' },
    answer:   { label: '답변 + 출처', sub: '검증 가능한 응답', desc: '"Ring 패턴은 핫플레이트 온도 불균일이 원인입니다. [보고서 #2024-0847]" — 출처 제공으로 엔지니어 검증 가능.', color: '#a855f7' },
};

const ORDER: Exclude<StepId, null>[] = ['query', 'retrieve', 'generate', 'answer'];

const SVG_W = 620;
const SVG_H = 90;
const NODE_W = 130;
const NODE_H = 52;
const GAP = 14;
const TOTAL = ORDER.length * NODE_W + (ORDER.length - 1) * GAP;
const X0 = (SVG_W - TOTAL) / 2 + NODE_W / 2;
const CY = SVG_H / 2;

export default function RagPipelineQna() {
    const [hovered, setHovered] = useState<StepId>(null);
    const isDim = (id: StepId) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                RAG 기반 공정 Q&A 파이프라인
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                질문 → 벡터 검색 → LLM 생성 → 출처 포함 답변
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 620 }}>
                    <defs>
                        <marker id="arrowRAG" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)" />
                        </marker>
                    </defs>
                    {ORDER.slice(0, -1).map((_, i) => {
                        const x1 = X0 + i * (NODE_W + GAP) + NODE_W / 2;
                        const x2 = X0 + (i + 1) * (NODE_W + GAP) - NODE_W / 2;
                        return <line key={i} x1={x1} y1={CY} x2={x2} y2={CY}
                            stroke="rgba(255,255,255,0.1)" strokeWidth={1} markerEnd="url(#arrowRAG)" />;
                    })}
                    {ORDER.map((id, i) => {
                        const cx = X0 + i * (NODE_W + GAP);
                        const info = STEPS[id];
                        const active = hovered === id;
                        return (
                            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: isDim(id) ? 0.15 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={cx - NODE_W / 2 - 4} y={CY - NODE_H / 2 - 4} width={NODE_W + 8} height={NODE_H + 8} fill="transparent" />
                                <rect x={cx - NODE_W / 2} y={CY - NODE_H / 2} width={NODE_W} height={NODE_H} rx={8}
                                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                                <text x={cx} y={CY - 6} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.small} fontWeight={600}>{info.label}</text>
                                <text x={cx} y={CY + 12} textAnchor="middle" dominantBaseline="central"
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
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STEPS[hovered].color, marginBottom: 2 }}>{STEPS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{STEPS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>각 단계를 호버하세요. RAG = 검색 + 생성. 할루시네이션 방지의 핵심.</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
