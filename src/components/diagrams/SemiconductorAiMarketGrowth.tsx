'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { year: 2020, market: 8 },
    { year: 2021, market: 12 },
    { year: 2022, market: 18 },
    { year: 2023, market: 25 },
    { year: 2024, market: 35 },
    { year: 2025, market: 48 },
    { year: 2026, market: 65 },
    { year: 2027, market: 85 },
    { year: 2028, market: 110 },
    { year: 2029, market: 140 },
    { year: 2030, market: 180 },
];

export default function SemiconductorAiMarketGrowth() {
    return (
        <div className="mt-8 mb-12">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                반도체 AI 시장 규모 성장 전망
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                2020~2030 예상 시장 규모 ($B) — CAGR ~35%
            </p>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={DATA} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradMarket" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="year" tick={{ fill: COLOR.textDim, fontSize: FONT.min }}
                        ticks={[2020, 2022, 2024, 2026, 2028, 2030]} />
                    <YAxis tick={{ fill: COLOR.textDim, fontSize: FONT.min }} unit="B" />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small }}
                        formatter={(v: number | undefined) => [`$${v ?? 0}B`, '시장 규모']} />
                    <Area type="monotone" dataKey="market" stroke="#f59e0b" strokeWidth={2}
                        fill="url(#gradMarket)" dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5 }} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
