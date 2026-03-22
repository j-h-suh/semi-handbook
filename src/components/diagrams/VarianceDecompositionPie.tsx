'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { name: 'Equipment', label: '장비 간', value: 35, color: '#3b82f6', desc: '장비 간 체계적 차이. Chamber Matching으로 대응.' },
    { name: 'Chamber', label: '챔버 간', value: 20, color: '#22c55e', desc: '같은 장비 내 챔버 차이. 소모품 상태, 벽면 코팅 차이.' },
    { name: 'Lot', label: '로트 간', value: 15, color: '#f59e0b', desc: '소재 배치 변경, 환경 변동. EWMA R2R로 보정.' },
    { name: 'Wafer', label: '웨이퍼 간', value: 12, color: '#a855f7', desc: '같은 로트 내 웨이퍼 차이. 코팅/PEB 균일도.' },
    { name: 'Field', label: '필드 내', value: 10, color: '#06b6d4', desc: '렌즈 수차, 스캔 방향 효과. Intra-field 보정.' },
    { name: 'Random', label: '잔차', value: 8, color: '#6b7280', desc: '설명되지 않는 랜덤 변동. 더 이상의 분해 불가.' },
];

export default function VarianceDecompositionPie() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                Variance Decomposition — 계층별 CD 변동 기여도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                어디에 개선을 집중할 것인가? 가장 큰 성분부터 공략
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={280} maxHeight={280}>
                    <PieChart>
                        <Pie data={DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                            dataKey="value" paddingAngle={2} isAnimationActive={false}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}>
                            {DATA.map((d, i) => (
                                <Cell key={i} fill={d.color} opacity={activeIndex !== null && activeIndex !== i ? 0.2 : 0.7}
                                    stroke="rgba(0,0,0,0.3)" strokeWidth={1} style={{ cursor: 'pointer', transition: 'opacity 0.15s' }} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            {/* Legend + tooltip */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                {DATA.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', opacity: activeIndex !== null && activeIndex !== i ? 0.3 : 1, transition: 'opacity 0.15s' }}
                        onMouseEnter={() => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                        <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>{d.label} {d.value}%</span>
                    </div>
                ))}
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', height: 44 }}>
                {activeIndex !== null ? (
                    <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                        <span style={{ fontSize: FONT.small, fontWeight: 700, color: DATA[activeIndex].color }}>{DATA[activeIndex].label}</span>
                        <span style={{ fontSize: FONT.small, color: COLOR.textMuted, marginLeft: 8 }}>{DATA[activeIndex].desc}</span>
                    </div>
                ) : (
                    <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                        <span style={{ fontSize: FONT.small, color: COLOR.textMuted }}>각 영역을 호버하세요. σ² 기여도가 큰 계층에 개선을 집중해야 합니다.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
