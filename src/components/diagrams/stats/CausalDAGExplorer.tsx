'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── DAG 정의 ─── */
type NodeId = string;

interface DAGNode {
    id: NodeId;
    label: string;
    x: number;
    y: number;
}

interface DAGEdge {
    from: NodeId;
    to: NodeId;
    /** 이 edge가 하이라이트되어야 하는 노드 */
    highlightOn?: NodeId[];
}

interface DAGConfig {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    color: string;
    nodes: DAGNode[];
    edges: DAGEdge[];
    /** 호버 시 노드별 설명 */
    nodeInfo: Record<NodeId, string>;
}

const SVG_W = 280;
const SVG_H = 200;
const NODE_R = 22;

const DAGS: DAGConfig[] = [
    {
        id: 'confounding',
        title: '혼란변수 (Confounding)',
        subtitle: 'X ← Z → Y',
        description: 'Z가 X와 Y 모두에 영향을 미쳐 허위 상관을 만든다. Z를 통제해야 인과 효과를 추정할 수 있다.',
        color: STATS_COLOR.series[0],
        nodes: [
            { id: 'Z', label: 'Z', x: SVG_W / 2, y: 40 },
            { id: 'X', label: 'X', x: 60, y: 150 },
            { id: 'Y', label: 'Y', x: SVG_W - 60, y: 150 },
        ],
        edges: [
            { from: 'Z', to: 'X', highlightOn: ['Z', 'X'] },
            { from: 'Z', to: 'Y', highlightOn: ['Z', 'Y'] },
            { from: 'X', to: 'Y', highlightOn: ['X', 'Y'] },
        ],
        nodeInfo: {
            Z: '혼란변수(Confounder): X와 Y의 공통 원인. 예: 나이 → 운동량, 나이 → 건강',
            X: '처리(Treatment): 인과 효과를 알고 싶은 변수',
            Y: '결과(Outcome): 처리의 효과를 측정하는 변수',
        },
    },
    {
        id: 'selection',
        title: '선택 편향 (Collider)',
        subtitle: 'X → S ← Y',
        description: 'S가 X와 Y의 공통 결과(충돌변수)다. S로 조건부를 걸면 X와 Y 사이에 가짜 연관이 생긴다.',
        color: STATS_COLOR.series[3],
        nodes: [
            { id: 'X', label: 'X', x: 60, y: 40 },
            { id: 'Y', label: 'Y', x: SVG_W - 60, y: 40 },
            { id: 'S', label: 'S', x: SVG_W / 2, y: 150 },
        ],
        edges: [
            { from: 'X', to: 'S', highlightOn: ['X', 'S'] },
            { from: 'Y', to: 'S', highlightOn: ['Y', 'S'] },
        ],
        nodeInfo: {
            X: '원인 1: 예) 재능',
            Y: '원인 2: 예) 노력',
            S: '충돌변수(Collider): 예) 합격. S로 조건부를 걸면 재능↔노력에 가짜 음의 상관이 생긴다',
        },
    },
    {
        id: 'mediation',
        title: '매개변수 (Mediation)',
        subtitle: 'X → M → Y',
        description: 'X가 M을 통해 Y에 영향을 미친다. 직접 효과와 간접 효과를 분리할 수 있다.',
        color: STATS_COLOR.series[4],
        nodes: [
            { id: 'X', label: 'X', x: 40, y: SVG_H / 2 },
            { id: 'M', label: 'M', x: SVG_W / 2, y: SVG_H / 2 },
            { id: 'Y', label: 'Y', x: SVG_W - 40, y: SVG_H / 2 },
        ],
        edges: [
            { from: 'X', to: 'M', highlightOn: ['X', 'M'] },
            { from: 'M', to: 'Y', highlightOn: ['M', 'Y'] },
            { from: 'X', to: 'Y', highlightOn: ['X', 'Y'] },
        ],
        nodeInfo: {
            X: '처리(Treatment): 예) 교육 프로그램',
            M: '매개변수(Mediator): 예) 지식 수준. X→Y의 경로 중 간접 경로',
            Y: '결과(Outcome): 예) 업무 성과. 직접 효과(X→Y)와 간접 효과(X→M→Y)로 분해 가능',
        },
    },
];

/* ─── 화살표 마커 ─── */
function ArrowMarker({ id, color }: { id: string; color: string }) {
    return (
        <marker id={id} viewBox="0 0 10 7" refX="10" refY="3.5"
            markerWidth={8} markerHeight={6} orient="auto-start-auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
    );
}

/* ─── 개별 DAG SVG ─── */
function DAGDiagram({ config }: { config: DAGConfig }) {
    const [hoveredNode, setHoveredNode] = useState<NodeId | null>(null);

    const markerId = `arrow-${config.id}`;
    const markerHighId = `arrow-high-${config.id}`;

    return (
        <div>
            <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}>
                <defs>
                    <ArrowMarker id={markerId} color={COLOR.textDim} />
                    <ArrowMarker id={markerHighId} color={config.color} />
                </defs>

                {/* 엣지 */}
                {config.edges.map((e, i) => {
                    const from = config.nodes.find(n => n.id === e.from)!;
                    const to = config.nodes.find(n => n.id === e.to)!;
                    const dx = to.x - from.x;
                    const dy = to.y - from.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const ux = dx / dist, uy = dy / dist;
                    const x1 = from.x + ux * (NODE_R + 2);
                    const y1 = from.y + uy * (NODE_R + 2);
                    const x2 = to.x - ux * (NODE_R + 6);
                    const y2 = to.y - uy * (NODE_R + 6);

                    const isHighlighted = hoveredNode !== null && e.highlightOn?.includes(hoveredNode);

                    return (
                        <motion.line
                            key={i}
                            x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={isHighlighted ? config.color : COLOR.textDim}
                            strokeWidth={isHighlighted ? 2.5 : 1.5}
                            markerEnd={`url(#${isHighlighted ? markerHighId : markerId})`}
                            animate={{ opacity: hoveredNode === null || isHighlighted ? 1 : 0.2 }}
                            transition={{ duration: 0.2 }}
                        />
                    );
                })}

                {/* 노드 */}
                {config.nodes.map(node => {
                    const isHovered = hoveredNode === node.id;
                    const isDimmed = hoveredNode !== null && !isHovered;

                    return (
                        <g key={node.id}
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            style={{ cursor: 'pointer' }}
                        >
                            <motion.circle
                                cx={node.x} cy={node.y} r={NODE_R}
                                fill={isHovered ? `${config.color}30` : COLOR.cardBg}
                                stroke={isHovered ? config.color : COLOR.textDim}
                                strokeWidth={isHovered ? 2.5 : 1.5}
                                animate={{ opacity: isDimmed ? 0.3 : 1 }}
                                transition={{ duration: 0.2 }}
                            />
                            <text
                                x={node.x} y={node.y + 1}
                                textAnchor="middle" dominantBaseline="central"
                                fill={isHovered ? config.color : COLOR.text}
                                fontSize={FONT.body} fontWeight={600}
                            >
                                {node.label}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* 호버 설명 */}
            <div style={{
                minHeight: 40, padding: '6px 12px', marginTop: 8,
                textAlign: 'center', fontSize: FONT.min, lineHeight: 1.5,
                color: hoveredNode ? COLOR.text : COLOR.textDim,
                background: hoveredNode ? COLOR.cardBg : 'transparent',
                borderRadius: 6,
                transition: 'all 0.2s',
            }}>
                {hoveredNode
                    ? config.nodeInfo[hoveredNode]
                    : '노드 위에 마우스를 올려보세요'}
            </div>
        </div>
    );
}

export default function CausalDAGExplorer() {
    const [activeTab, setActiveTab] = useState('confounding');
    const activeDAG = DAGS.find(d => d.id === activeTab)!;

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                인과 DAG 탐색기
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Causal DAG Explorer — three structures that shape causal reasoning
            </p>

            {/* 탭 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {DAGS.map(dag => (
                    <button
                        key={dag.id}
                        onClick={() => setActiveTab(dag.id)}
                        style={{
                            background: activeTab === dag.id ? `${dag.color}20` : 'transparent',
                            color: activeTab === dag.id ? dag.color : COLOR.textMuted,
                            border: `1px solid ${activeTab === dag.id ? `${dag.color}50` : COLOR.border}`,
                            borderRadius: 6, padding: '6px 14px',
                            fontSize: FONT.small, fontWeight: activeTab === dag.id ? 600 : 400,
                            cursor: 'pointer', transition: 'all 0.2s',
                        }}
                    >
                        {dag.title}
                    </button>
                ))}
            </div>

            {/* 설명 */}
            <div style={{
                textAlign: 'center', padding: '8px 16px', borderRadius: 8,
                background: COLOR.cardBg, border: `1px solid ${activeDAG.color}30`,
                marginBottom: 16, maxWidth: 500, margin: '0 auto 16px',
            }}>
                <p style={{ color: activeDAG.color, fontSize: FONT.small, fontWeight: 600, margin: '0 0 4px' }}>
                    {activeDAG.subtitle}
                </p>
                <p style={{ color: COLOR.text, fontSize: FONT.small, margin: 0, lineHeight: 1.5 }}>
                    {activeDAG.description}
                </p>
            </div>

            <DAGDiagram config={activeDAG} />
        </div>
    );
}
