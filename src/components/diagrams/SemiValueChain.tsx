'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 노드 데이터 ─── */
type NodeId = 'eda' | 'ip' | 'fabless' | 'foundry' | 'idm' | 'equipment' | 'materials' | 'software' | 'osat' | 'market' | null;

interface NodeInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const NODES: Record<Exclude<NodeId, null>, NodeInfo> = {
    eda: { label: 'EDA 도구', sub: 'Synopsys, Cadence', desc: '칩 설계 소프트웨어. 회로 설계, 시뮬레이션, 검증, 물리적 레이아웃의 전 과정을 다룬다. 시장 ~$150B이지만 없으면 현대 칩 설계가 불가능.', color: '#818cf8' },
    ip: { label: 'IP Core', sub: 'ARM, Synopsys IP', desc: '재사용 가능한 설계 블록. ARM CPU 코어, USB/PCIe 인터페이스 IP 등. 소프트웨어의 오픈소스 라이브러리와 같은 역할.', color: '#c084fc' },
    fabless: { label: 'Fabless', sub: 'Apple, NVIDIA', desc: '칩 설계·판매 전문. EDA 도구와 IP를 활용해 칩을 설계하고, GDSII 데이터를 파운드리에 전달.', color: '#3b82f6' },
    foundry: { label: 'Foundry', sub: 'TSMC', desc: '위탁 제조 전문. 장비·소재·SW 솔루션을 활용하여 팹리스의 설계를 실제 칩으로 제조.', color: '#22c55e' },
    idm: { label: 'IDM', sub: 'Intel, Samsung, TI', desc: '설계+제조+판매를 모두 자체 수행. 설계-공정 동시 최적화 가능. 메모리 반도체에서 여전히 주류.', color: '#ef4444' },
    equipment: { label: '장비', sub: 'ASML, AMAT, KLA', desc: '노광기(ASML), 증착·식각(AMAT, Lam), 검사·계측(KLA). EUV 노광기 한 대 ~$2억.', color: '#f59e0b' },
    materials: { label: '소재', sub: '포토레지스트, 웨이퍼', desc: '포토레지스트(JSR, TOK), 웨이퍼(신에쓰, SUMCO), CMP 슬러리, 특수 가스 등 수백 종의 정밀 화학 소재.', color: '#fb923c' },
    software: { label: 'AI/SW 솔루션', sub: 'SMILE 🎯', desc: '공정 제어(APC), 수율 분석, 결함 분류, 가상 계측 등. SMILE은 포토리소그래피 AI 최적화 솔루션.', color: '#22d3ee' },
    osat: { label: '패키징/테스트', sub: 'ASE, Amkor', desc: '완성 웨이퍼를 다이싱, 패키징, 최종 테스트하여 완성 칩으로 만드는 후공정 전문 기업.', color: '#a78bfa' },
    market: { label: '시장', sub: '스마트폰, 서버, 자동차', desc: '최종 소비 시장. AI 서버, 스마트폰, 자율주행, IoT 등 반도체가 필요한 모든 산업.', color: '#e4e4e7' },
};

/* ─── 레이아웃 상수 ─── */
const BW = 130;  // 박스 폭
const BH = 50;   // 박스 높이
const CX = 350;  // 중앙 x (foundry 위치)
const FDY = 110; // foundry y
const IDM_Y = FDY + BH + 20; // IDM y (foundry 아래)

// 좌측 공급 노드들 (foundry로 연결)
const LEFT_NODES: { id: Exclude<NodeId, null>; x: number; y: number }[] = [
    { id: 'eda', x: 40, y: 10 },
    { id: 'ip', x: 40, y: 80 },
    { id: 'equipment', x: 40, y: 160 },
    { id: 'materials', x: 40, y: 230 },
    { id: 'software', x: 40, y: 300 },
];

// 메인 플로우
const FLOW_NODES: { id: Exclude<NodeId, null>; x: number; y: number }[] = [
    { id: 'fabless', x: CX - BW / 2, y: 30 },
    { id: 'foundry', x: CX - BW / 2, y: FDY },
    { id: 'idm', x: CX - BW / 2, y: IDM_Y },
    { id: 'osat', x: CX + BW + 60, y: FDY + (IDM_Y - FDY) / 2 },
    { id: 'market', x: CX + 2 * (BW + 60), y: FDY + (IDM_Y - FDY) / 2 },
];

const SVG_W = CX + 2 * (BW + 60) + BW + 20;
const SVG_H = 360;

/* ─── 화살표 마커 ─── */
function Defs() {
    return (
        <defs>
            <marker id="vcArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#4b5563" />
            </marker>
            <marker id="vcArrowBlue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
            </marker>
        </defs>
    );
}

export default function SemiValueChain() {
    const [hovered, setHovered] = useState<NodeId>(null);

    const isDimmed = (id: Exclude<NodeId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                반도체 밸류체인 전체 그림
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Semiconductor Value Chain
            </p>

            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ maxWidth: 780, display: 'block', margin: '0 auto' }}>
                <Defs />

                {/* 좌측 → Foundry 화살표 */}
                {LEFT_NODES.map(n => (
                    <motion.line key={`arr-${n.id}`}
                        x1={n.x + BW} y1={n.y + BH / 2}
                        x2={CX - BW / 2} y2={FDY + BH / 2}
                        stroke="#4b5563" strokeWidth={1} markerEnd="url(#vcArrow)"
                        animate={{ opacity: isDimmed(n.id) && isDimmed('foundry') ? 0.15 : 0.5 }}
                        transition={{ duration: 0.15 }} />
                ))}

                {/* EDA/IP → Fabless 화살표 */}
                {['eda', 'ip'].map(id => {
                    const n = LEFT_NODES.find(l => l.id === id)!;
                    return (
                        <motion.line key={`arr-fb-${id}`}
                            x1={n.x + BW} y1={n.y + BH / 2}
                            x2={CX - BW / 2} y2={40 + BH / 2}
                            stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 3" markerEnd="url(#vcArrowBlue)"
                            animate={{ opacity: isDimmed(id as Exclude<NodeId, null>) && isDimmed('fabless') ? 0.15 : 0.4 }}
                            transition={{ duration: 0.15 }} />
                    );
                })}

                {/* Fabless → Foundry */}
                <motion.g animate={{ opacity: isDimmed('fabless') && isDimmed('foundry') ? 0.15 : 0.6 }}>
                    <line x1={CX} y1={30 + BH} x2={CX} y2={FDY} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#vcArrowBlue)" />
                    <text x={CX + 8} y={(30 + BH + FDY) / 2 + 4} fill="#3b82f6" fontSize={FONT.min - 1}>GDSII</text>
                </motion.g>

                {/* 좌측 → IDM 화살표 (Equipment, Materials, SW) */}
                {LEFT_NODES.filter(n => ['equipment', 'materials', 'software'].includes(n.id)).map(n => (
                    <motion.line key={`arr-idm-${n.id}`}
                        x1={n.x + BW} y1={n.y + BH / 2}
                        x2={CX - BW / 2} y2={IDM_Y + BH / 2}
                        stroke="#4b5563" strokeWidth={1} strokeDasharray="4 3" markerEnd="url(#vcArrow)"
                        animate={{ opacity: isDimmed(n.id) && isDimmed('idm') ? 0.15 : 0.3 }}
                        transition={{ duration: 0.15 }} />
                ))}

                {/* EDA/IP → IDM 화살표 */}
                {['eda', 'ip'].map(id => {
                    const n = LEFT_NODES.find(l => l.id === id)!;
                    return (
                        <motion.line key={`arr-idm-${id}`}
                            x1={n.x + BW} y1={n.y + BH / 2}
                            x2={CX - BW / 2} y2={IDM_Y + BH / 2}
                            stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" markerEnd="url(#vcArrow)"
                            animate={{ opacity: isDimmed(id as Exclude<NodeId, null>) && isDimmed('idm') ? 0.15 : 0.3 }}
                            transition={{ duration: 0.15 }} />
                    );
                })}

                {/* Foundry → OSAT, IDM → OSAT, OSAT → Market */}
                {[
                    { from: 'foundry', to: 'osat', label: '완성 웨이퍼' },
                    { from: 'idm', to: 'osat', label: '완성 웨이퍼' },
                    { from: 'osat', to: 'market', label: '완성 칩' },
                ].map(({ from, to, label }) => {
                    const f = FLOW_NODES.find(n => n.id === from)!;
                    const t = FLOW_NODES.find(n => n.id === to)!;
                    return (
                        <motion.g key={`${from}-${to}`}
                            animate={{ opacity: isDimmed(from as Exclude<NodeId, null>) && isDimmed(to as Exclude<NodeId, null>) ? 0.15 : 0.6 }}>
                            <line x1={f.x + BW} y1={f.y + BH / 2} x2={t.x} y2={t.y + BH / 2}
                                stroke="#4b5563" strokeWidth={1.5} markerEnd="url(#vcArrow)" />
                            {from !== 'idm' && <text x={(f.x + BW + t.x) / 2} y={f.y + BH / 2 - 8}
                                textAnchor="middle" fill={COLOR.textDim} fontSize={FONT.min - 1}>{label}</text>}
                        </motion.g>
                    );
                })}

                {/* 모든 박스 렌더링 */}
                {[...LEFT_NODES, ...FLOW_NODES].map(n => {
                    const info = NODES[n.id];
                    const isActive = hovered === n.id;
                    const dim = isDimmed(n.id);
                    return (
                        <motion.g key={n.id}
                            onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)}
                            animate={{ opacity: dim ? 0.25 : 1 }}
                            transition={{ duration: 0.15 }}
                            style={{ cursor: 'pointer' }}>
                            <rect x={n.x} y={n.y} width={BW} height={BH} rx={8}
                                fill={isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}
                                stroke={isActive ? info.color : 'rgba(255,255,255,0.1)'}
                                strokeWidth={isActive ? 2 : 1} />
                            <text x={n.x + BW / 2} y={n.y + 22} textAnchor="middle"
                                fill={info.color} fontSize={FONT.small} fontWeight={600}>
                                {info.label}
                            </text>
                            <text x={n.x + BW / 2} y={n.y + 38} textAnchor="middle"
                                fill={COLOR.textDim} fontSize={FONT.min - 1}>
                                {info.sub}
                            </text>
                        </motion.g>
                    );
                })}
            </svg>

            {/* Tooltip */}
            <div style={{ maxWidth: 600, margin: '8px auto 0', height: 72 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 16px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: NODES[hovered].color, marginBottom: 2 }}>
                                {NODES[hovered].label} — {NODES[hovered].sub}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.6 }}>
                                {NODES[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 16px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.6 }}>
                                각 노드를 호버하여 상세 설명을 확인하세요. SMILE 🎯은 파운드리의 포토리소그래피 공정에 AI 최적화를 제공합니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
