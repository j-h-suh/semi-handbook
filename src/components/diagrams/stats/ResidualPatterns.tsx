'use client';

import React, { useState, useMemo } from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    ReferenceLine, Tooltip,
} from 'recharts';
import { FONT, COLOR, STATS_COLOR } from '../diagramTokens';

/* ─── 시드 기반 의사난수 ─── */
function seededRandom(seed: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
}

/* ─── 잔차 패턴 데이터 생성 ─── */
type PatternId = 'normal' | 'heteroscedastic' | 'nonlinear';

interface PatternConfig {
    id: PatternId;
    title: string;
    subtitle: string;
    description: string;
    color: string;
    generate: () => { fitted: number; residual: number }[];
}

const PATTERNS: PatternConfig[] = [
    {
        id: 'normal',
        title: '정상 패턴',
        subtitle: 'Homoscedastic — No Pattern',
        description: '잔차가 0 주변에 무작위로 흩어져 있다. 등분산성이 충족되고 선형 관계가 적절한 이상적인 형태.',
        color: STATS_COLOR.series[0],
        generate: () => {
            const pts: { fitted: number; residual: number }[] = [];
            for (let i = 0; i < 60; i++) {
                const fitted = 2 + seededRandom(i * 3 + 1) * 16;
                const residual = (seededRandom(i * 3 + 2) - 0.5) * 4;
                pts.push({ fitted: Math.round(fitted * 10) / 10, residual: Math.round(residual * 100) / 100 });
            }
            return pts;
        },
    },
    {
        id: 'heteroscedastic',
        title: '이분산 패턴',
        subtitle: 'Heteroscedastic — Funnel Shape',
        description: '예측값이 커질수록 잔차의 퍼짐도 커진다. 나팔(funnel) 모양. 가중최소제곱(WLS) 또는 로그 변환이 필요.',
        color: STATS_COLOR.series[3],
        generate: () => {
            const pts: { fitted: number; residual: number }[] = [];
            for (let i = 0; i < 60; i++) {
                const fitted = 2 + seededRandom(i * 5 + 10) * 16;
                const spread = 0.3 + fitted * 0.25;
                const residual = (seededRandom(i * 5 + 11) - 0.5) * spread * 2;
                pts.push({ fitted: Math.round(fitted * 10) / 10, residual: Math.round(residual * 100) / 100 });
            }
            return pts;
        },
    },
    {
        id: 'nonlinear',
        title: '비선형 패턴',
        subtitle: 'Nonlinear — Quadratic Residuals',
        description: '잔차에 U자 곡선 패턴이 보인다. 선형 모델이 데이터의 비선형 구조를 놓치고 있다는 신호. 다항 항 추가를 검토.',
        color: STATS_COLOR.series[2],
        generate: () => {
            const pts: { fitted: number; residual: number }[] = [];
            for (let i = 0; i < 60; i++) {
                const fitted = 2 + seededRandom(i * 7 + 20) * 16;
                const mid = 10;
                const curve = 0.08 * (fitted - mid) ** 2 - 2.5;
                const noise = (seededRandom(i * 7 + 21) - 0.5) * 1.8;
                const residual = curve + noise;
                pts.push({ fitted: Math.round(fitted * 10) / 10, residual: Math.round(residual * 100) / 100 });
            }
            return pts;
        },
    },
];

export default function ResidualPatterns() {
    const [activeTab, setActiveTab] = useState<PatternId>('normal');

    const activePattern = PATTERNS.find(p => p.id === activeTab)!;
    const data = useMemo(() => activePattern.generate(), [activePattern]);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                잔차 패턴 진단
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Residual vs Fitted — three patterns every modeler should recognize
            </p>

            {/* 탭 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                {PATTERNS.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setActiveTab(p.id)}
                        style={{
                            background: activeTab === p.id ? `${p.color}20` : 'transparent',
                            color: activeTab === p.id ? p.color : COLOR.textMuted,
                            border: `1px solid ${activeTab === p.id ? `${p.color}50` : COLOR.border}`,
                            borderRadius: 6, padding: '6px 14px',
                            fontSize: FONT.small, fontWeight: activeTab === p.id ? 600 : 400,
                            cursor: 'pointer', transition: 'all 0.2s',
                        }}
                    >
                        {p.title}
                    </button>
                ))}
            </div>

            {/* 설명 배너 */}
            <div style={{
                textAlign: 'center', padding: '8px 16px', borderRadius: 8,
                background: COLOR.cardBg, border: `1px solid ${activePattern.color}30`,
                marginBottom: 16, maxWidth: 500, margin: '0 auto 16px',
            }}>
                <p style={{ color: COLOR.text, fontSize: FONT.small, margin: 0, lineHeight: 1.5 }}>
                    {activePattern.description}
                </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                        type="number" dataKey="fitted" domain={[0, 20]}
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: '예측값 (ŷ)', position: 'bottom', offset: 2, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <YAxis
                        type="number" dataKey="residual"
                        tick={{ fontSize: FONT.min, fill: COLOR.textDim }}
                        axisLine={{ stroke: COLOR.border }} tickLine={false}
                        label={{ value: '잔차 (e)', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: FONT.min, fill: COLOR.textDim } }}
                    />
                    <Tooltip
                        content={({ payload }) => {
                            if (!payload || payload.length === 0) return null;
                            const d = payload[0]?.payload;
                            if (!d) return null;
                            return (
                                <div style={{
                                    background: COLOR.tooltipBg, border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 6, padding: '6px 10px', fontSize: FONT.min,
                                }}>
                                    <div style={{ color: COLOR.textMuted }}>ŷ = {d.fitted}</div>
                                    <div style={{ color: activePattern.color }}>e = {d.residual}</div>
                                </div>
                            );
                        }}
                    />
                    <ReferenceLine y={0} stroke={COLOR.textDim} strokeWidth={1.5} />
                    <Scatter data={data} fill={activePattern.color} fillOpacity={0.7} r={3.5} />
                </ScatterChart>
            </ResponsiveContainer>

            <p style={{ textAlign: 'center', color: COLOR.textMuted, fontSize: FONT.small, marginTop: 8 }}>
                잔차 vs 예측값 산점도. 잔차에 체계적 패턴이 없으면 모델이 적절하다는 신호.
            </p>
        </div>
    );
}
