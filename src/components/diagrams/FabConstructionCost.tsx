'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 ─── */
interface FabCostData {
    node: string;
    decade: string;
    cost: number;
    desc: string;
}

const DATA: FabCostData[] = [
    { node: '350nm', decade: '1990s', cost: 1, desc: '초기 반도체 팹. 대부분의 IDM이 자체 팹을 보유할 수 있던 시기.' },
    { node: '90nm', decade: '2000s', cost: 3, desc: '구리 배선(Cu interconnect) 도입. 팹 비용이 증가하기 시작.' },
    { node: '28nm', decade: '2010s 초', cost: 5, desc: '성숙 공정의 마지막 "sweeet spot". 현재도 IoT/자동차용으로 대량 생산.' },
    { node: '14nm', decade: '2010s 중', cost: 10, desc: 'FinFET 도입. 팹 비용이 100억 달러를 돌파하면서 소수 기업만 투자 가능.' },
    { node: '7nm', decade: '2010s 후', cost: 15, desc: 'EUV 리소그래피 부분 도입. TSMC와 Samsung만 양산 경쟁.' },
    { node: '3nm', decade: '2020s', cost: 20, desc: 'EUV 전면 도입. TSMC Arizona 2개 팹에 $40B 투자. 전 세계 3~4개 기업만 경쟁.' },
];

const BAR_COLORS = ['#6366f1', '#818cf8', '#8b5cf6', '#a78bfa', '#c084fc', '#ef4444'];

export default function FabConstructionCost() {
    const [activeIdx, setActiveIdx] = useState<number | null>(null);

    return (
        <div className="my-8 relative" onMouseLeave={() => setActiveIdx(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                팹 건설 비용 추이
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Fab Construction Cost by Process Node ($B)
            </p>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={DATA} margin={{ top: 30, right: 30, left: 10, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                        dataKey="node"
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '공정 노드', position: 'bottom', offset: 6, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        label={{ value: '비용 ($B)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                        domain={[0, 24]}
                        ticks={[0, 5, 10, 15, 20]}
                    />
                    <Bar dataKey="cost" radius={[4, 4, 0, 0]}
                        onMouseEnter={(_, idx) => setActiveIdx(idx)}
                        onMouseLeave={() => setActiveIdx(null)}>
                        {DATA.map((_, idx) => (
                            <Cell key={idx} fill={BAR_COLORS[idx]}
                                opacity={activeIdx !== null && activeIdx !== idx ? 0.25 : 0.85}
                                style={{ transition: 'opacity 0.15s' }} />
                        ))}
                        <LabelList dataKey="cost" position="top"
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={((v: number) => `$${v}B`) as any}
                            style={{ fontSize: FONT.min, fill: COLOR.textMuted, fontWeight: 600 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* 하단 시기 라벨 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
                {DATA.map((d, idx) => (
                    <div key={d.node} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                        opacity: activeIdx !== null && activeIdx !== idx ? 0.35 : 1, transition: 'opacity 0.15s' }}
                        onMouseEnter={() => setActiveIdx(idx)} onMouseLeave={() => setActiveIdx(null)}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: BAR_COLORS[idx] }} />
                        <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>{d.decade}</span>
                    </div>
                ))}
            </div>

            {/* Tooltip */}
            <div style={{ maxWidth: 600, margin: '8px auto 0', height: 72 }}>
                {activeIdx !== null && DATA[activeIdx] && (
                    <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: `1px solid rgba(255,255,255,0.06)`,
                        borderRadius: 8, padding: '8px 14px' }}>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: BAR_COLORS[activeIdx], marginBottom: 2 }}>
                            {DATA[activeIdx].node} ({DATA[activeIdx].decade}) — ${DATA[activeIdx].cost}B
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                            {DATA[activeIdx].desc}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
