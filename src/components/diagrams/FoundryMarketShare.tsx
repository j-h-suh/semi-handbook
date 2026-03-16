'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── 데이터 ─── */
interface FoundryData {
    company: string;
    share: number;
    color: string;
    desc: string;
}

const DATA: FoundryData[] = [
    { company: 'TSMC', share: 67, color: '#ef4444', desc: '전 세계 파운드리 시장의 절대 강자. 최첨단 공정(3nm 이하)에서는 점유율 90% 이상. Apple·NVIDIA·AMD·Qualcomm의 모든 칩을 제조.' },
    { company: 'Samsung', share: 11, color: '#3b82f6', desc: 'IDM이자 파운드리. GAA(3nm) 최초 양산. 자체 모바일 AP(Exynos) + 위탁 제조 병행.' },
    { company: 'SMIC', share: 6, color: '#f59e0b', desc: '중국 최대 파운드리. 미국 수출 규제 속 자체 기술로 7nm급 공정 개발 시도.' },
    { company: 'UMC', share: 5, color: '#22c55e', desc: '대만 2위 파운드리. 성숙 공정(28nm 이상)에 집중하여 안정적 수익 창출.' },
    { company: 'GlobalFoundries', share: 5, color: '#8b5cf6', desc: 'AMD에서 분사. 최첨단 경쟁 포기 후 성숙·특수 공정(RF, SiGe)에 집중.' },
    { company: '기타', share: 6, color: '#71717a', desc: 'Tower, PSMC, HuaHong 등. 특수 공정이나 지역 수요를 담당.' },
];

/* ─── Active shape for hover ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderActiveShape(props: any) {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    return (
        <g>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
                startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.95} />
            <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16}
                startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.4} />
            <text x={cx} y={cy - 10} textAnchor="middle" fill={COLOR.textBright} fontSize={FONT.cardHeader} fontWeight={700}>
                {payload.company}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill={COLOR.textMuted} fontSize={FONT.small}>
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        </g>
    );
}

export default function FoundryMarketShare() {
    const [activeIdx, setActiveIdx] = useState<number>(0); // TSMC default

    return (
        <div className="my-8 relative" onMouseLeave={() => setActiveIdx(0)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                글로벌 파운드리 시장 점유율
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Global Foundry Market Share (2025)
            </p>

            <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Pie
                        data={DATA}
                        dataKey="share"
                        nameKey="company"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={2}
                        {...{ activeIndex: activeIdx, activeShape: renderActiveShape } as any}
                        onMouseEnter={(_, idx) => setActiveIdx(idx)}
                        label={(props: any) => {
                            const { cx: lx, cy: ly, midAngle, outerRadius: or, payload } = props;
                            const RADIAN = Math.PI / 180;
                            const radius = (or || 110) + 28;
                            const ma = midAngle || 0;
                            const x = lx + radius * Math.cos(-ma * RADIAN);
                            const y = ly + radius * Math.sin(-ma * RADIAN);
                            return (
                                <text x={x} y={y} textAnchor={x > lx ? 'start' : 'end'} fill={COLOR.textMuted} fontSize={FONT.min}>
                                    {`${payload?.company ?? ''} ${payload?.share ?? ''}%`}
                                </text>
                            );
                        }}
                    >
                        {DATA.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color}
                                opacity={activeIdx !== null && activeIdx !== idx ? 0.35 : 0.85}
                                stroke="none" />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
                {DATA.map((d, idx) => (
                    <div key={d.company} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                        opacity: activeIdx !== null && activeIdx !== idx ? 0.35 : 1, transition: 'opacity 0.15s' }}
                        onMouseEnter={() => setActiveIdx(idx)} onMouseLeave={() => setActiveIdx(0)}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                        <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>{d.company} {d.share}%</span>
                    </div>
                ))}
            </div>

            {/* Tooltip */}
            <div style={{ maxWidth: 600, margin: '8px auto 0', minHeight: 44 }}>
                {activeIdx !== null && DATA[activeIdx] && (
                    <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: `1px solid rgba(255,255,255,0.06)`,
                        borderRadius: 8, padding: '8px 14px' }}>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: DATA[activeIdx].color, marginBottom: 2 }}>
                            {DATA[activeIdx].company} — {DATA[activeIdx].share}%
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
