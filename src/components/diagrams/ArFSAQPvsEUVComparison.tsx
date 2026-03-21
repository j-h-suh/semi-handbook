'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { category: '공정 단계 수', ArF: 30, EUV: 8 },
    { category: '마스크 수', ArF: 4, EUV: 1 },
    { category: '상대 비용', ArF: 100, EUV: 85 },
];

const COLORS_ARF = '#3b82f6';
const COLORS_EUV = '#ef4444';

export default function ArFSAQPvsEUVComparison() {
    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                ArF-i SAQP vs EUV Single Patterning
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                36nm 피치 기준 — 공정 단계, 마스크, 비용 비교
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={280} maxHeight={280}>
                    <BarChart data={DATA} margin={{ top: 16, right: 30, left: 10, bottom: 8 }} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="category" tick={{ fill: COLOR.textMuted, fontSize: FONT.small }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                        <YAxis tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                        <Tooltip
                            isAnimationActive={false}
                            contentStyle={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small, color: COLOR.textMuted }}
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Legend wrapperStyle={{ fontSize: FONT.small, color: COLOR.textMuted }} />
                        <Bar dataKey="ArF" name="ArF-i SAQP" fill={COLORS_ARF} radius={[4, 4, 0, 0]} isAnimationActive={false}>
                            {DATA.map((_, i) => <Cell key={i} fill={COLORS_ARF} fillOpacity={0.7} />)}
                        </Bar>
                        <Bar dataKey="EUV" name="EUV SP" fill={COLORS_EUV} radius={[4, 4, 0, 0]} isAnimationActive={false}>
                            {DATA.map((_, i) => <Cell key={i} fill={COLORS_EUV} fillOpacity={0.7} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                    <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                        EUV 스캐너 1대 ~$400M이지만, SAQP의 30단계 공정을 8단계로 줄여 총 소유 비용(TCO) 절감.
                    </div>
                </div>
            </div>
        </div>
    );
}
