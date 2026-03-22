'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type NodeId = 'eq' | 'mes' | 'dcs' | 'fdc_db' | 'mes_db' | null;

const NODES: Record<Exclude<NodeId, null>, { label: string; sub: string; desc: string; color: string }> = {
    eq:     { label: '장비 (Equipment)', sub: 'EDA + SECS/GEM', desc: '반도체 공정 장비. SECS/GEM으로 이벤트/알람/레시피를 MES에 보고하고, EDA/Interface A로 고속 센서 Trace를 DCS에 스트리밍한다.', color: '#3b82f6' },
    mes:    { label: 'MES', sub: '공정 관리 시스템', desc: '팹의 중추 신경계. 로트 추적, 레시피 관리, 디스패칭, Hold/Release를 담당. SECS/GEM으로 이벤트 기반 데이터를 수신한다.', color: '#22c55e' },
    dcs:    { label: 'Data Collection Server', sub: '고속 센서 수집', desc: 'EDA/Interface A를 통해 공정 중 센서 데이터를 실시간 스트리밍 수집. WebSocket/gRPC 기반 연결로 Trace 데이터의 연속 전송을 담당.', color: '#f59e0b' },
    fdc_db: { label: 'FDC 데이터베이스', sub: 'Trace + Summary 저장', desc: '시계열 센서 데이터의 대용량 저장소. 고속 쓰기와 시간 범위 조회에 최적화. 팹 최대 데이터 소스(일당 수십 TB).', color: '#ef4444' },
    mes_db: { label: '공정 이력 DB', sub: 'RDBMS', desc: '로트/웨이퍼의 공정 이력, 장비 배정, 레시피 파라미터 등 구조화된 데이터 저장. Oracle, PostgreSQL 등 관계형 DB 사용.', color: '#a78bfa' },
};

/* ─── SVG 레이아웃 ─── */
const SVG_W = 660;
const SVG_H = 240;
const NODE_W = 150;
const NODE_H = 48;

/* 노드 위치 */
const POS: Record<Exclude<NodeId, null>, { x: number; y: number }> = {
    eq:     { x: 110, y: SVG_H / 2 },
    mes:    { x: 330, y: 50 },
    dcs:    { x: 330, y: SVG_H - 50 },
    mes_db: { x: 520, y: 50 },
    fdc_db: { x: 520, y: SVG_H - 50 },
};

/* 연결선 */
const EDGES: { from: Exclude<NodeId, null>; to: Exclude<NodeId, null>; label: string; color: string }[] = [
    { from: 'eq', to: 'mes', label: 'SECS/GEM', color: 'rgba(34,197,94,0.4)' },
    { from: 'eq', to: 'dcs', label: 'EDA', color: 'rgba(245,158,11,0.4)' },
    { from: 'dcs', to: 'fdc_db', label: '', color: 'rgba(239,68,68,0.3)' },
    { from: 'mes', to: 'mes_db', label: '', color: 'rgba(167,139,250,0.3)' },
];

export default function DataCollectionArch() {
    const [hovered, setHovered] = useState<NodeId>(null);
    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    const renderNode = (id: Exclude<NodeId, null>) => {
        const pos = POS[id];
        const info = NODES[id];
        const active = hovered === id;
        const dimmed = isDimmed(id);
        return (
            <motion.g key={id} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                <rect x={pos.x - NODE_W / 2 - 6} y={pos.y - NODE_H / 2 - 4} width={NODE_W + 12} height={NODE_H + 8} fill="transparent" />
                <rect x={pos.x - NODE_W / 2} y={pos.y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={10}
                    fill={active ? `${info.color}15` : 'rgba(255,255,255,0.03)'}
                    stroke={active ? `${info.color}50` : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 1.5 : 1} />
                <text x={pos.x} y={pos.y - 4} textAnchor="middle" fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={700}>{info.label}</text>
                <text x={pos.x} y={pos.y + 12} textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min}>{info.sub}</text>
            </motion.g>
        );
    };

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                데이터 수집 아키텍처
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                SECS/GEM (이벤트) + EDA/Interface A (스트리밍)
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 800 }}>
                    {/* 연결선 + 화살표 */}
                    {EDGES.map((e, i) => {
                        const f = POS[e.from], t = POS[e.to];
                        const dx = t.x - f.x, dy = t.y - f.y;
                        const len = Math.sqrt(dx * dx + dy * dy);
                        const ux = dx / len, uy = dy / len;
                        const x1 = f.x + ux * NODE_W / 2, y1 = f.y + uy * NODE_H / 2;
                        const x2 = t.x - ux * NODE_W / 2, y2 = t.y - uy * NODE_H / 2;
                        const tipX = x2, tipY = y2;
                        const bx = tipX - ux * 8, by = tipY - uy * 8;
                        const px = -uy * 4, py = ux * 4;
                        return (
                            <g key={i}>
                                <line x1={x1} y1={y1} x2={bx} y2={by} stroke={e.color} strokeWidth={1.5} />
                                <polygon points={`${tipX},${tipY} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={e.color} />
                                {e.label && (
                                    <text x={(x1 + x2) / 2 + (dy > 0 ? -8 : 8)} y={(y1 + y2) / 2}
                                        textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min} fontWeight={600}>{e.label}</text>
                                )}
                            </g>
                        );
                    })}
                    {/* 노드 */}
                    {(Object.keys(NODES) as Exclude<NodeId, null>[]).map(id => renderNode(id))}
                </svg>
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
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
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 요소를 호버하여 SECS/GEM과 EDA 기반 데이터 수집 구조를 확인하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
