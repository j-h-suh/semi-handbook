'use client';

import { FONT, COLOR } from './diagramTokens';

import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

// Actual data points from the original chart
const actualData = [
    { year: 1971, count: 2300, name: 'Intel 4004', note: '최초 상용 CPU' },
    { year: 1978, count: 29000, name: 'Intel 8086', note: 'x86 아키텍처의 시작' },
    { year: 1985, count: 275000, name: 'Intel 386', note: '32비트 프로세서' },
    { year: 1989, count: 1200000, name: 'Intel 486', note: '내장 캐시, FPU 탑재' },
    { year: 1997, count: 7500000, name: 'Intel Pentium III', note: 'SSE 명령어 도입' },
    { year: 2004, count: 291000000, name: 'Intel Core 2 Duo', note: '듀얼코어 시대 개막' },
    { year: 2011, count: 1400000000, name: 'Intel Core i7-3770', note: '22nm 공정' },
    { year: 2020, count: 16000000000, name: 'Apple M1', note: 'ARM 기반 5nm SoC' },
    { year: 2024, count: 28000000000, name: 'Apple M4 Max', note: '3nm 공정, 최신 칩' },
];

// Moore's Law trendline: doubles every 2 years, starting from 2300 in 1971
const mooresLawData = Array.from({ length: 28 }, (_, i) => {
    const year = 1971 + i * 2;
    if (year > 2026) return null;
    return {
        year,
        count: 2300 * Math.pow(2, (year - 1971) / 2),
    };
}).filter(Boolean);

function formatCount(value: number): string {
    if (value >= 1e10) return `${(value / 1e9).toFixed(0)}B`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return value.toString();
}

function formatCountKorean(value: number): string {
    if (value >= 1e10) return `약 ${(value / 1e8).toFixed(0)}억 개`;
    if (value >= 1e9) return `약 ${(value / 1e8).toFixed(0)}억 개`;
    if (value >= 1e6) return `약 ${(value / 1e4).toFixed(0)}만 개`;
    if (value >= 1e3) return `약 ${value.toLocaleString()}개`;
    return `${value.toLocaleString()}개`;
}

// Custom tooltip
interface TooltipPayload {
    name: string;
    note: string;
    year: number;
    count: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TooltipPayload }> }) {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    if (!data.name) return null; // Moore's Law point, no tooltip

    return (
        <div
            style={{
                background: 'rgba(24, 24, 27, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px 16px',
                maxWidth: 240,
            }}
        >
            <p style={{ color: '#22d3ee', fontWeight: 600, fontSize: FONT.cardHeader, margin: '0 0 4px' }}>
                {data.name}
            </p>
            <p style={{ color: COLOR.textMuted, fontSize: FONT.subtitle, margin: '0 0 8px' }}>
                {data.note}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <span style={{ color: COLOR.textDim, fontSize: FONT.subtitle }}>{data.year}년</span>
                <span style={{ color: '#f4f4f5', fontSize: FONT.subtitle, fontWeight: 600 }}>
                    {formatCountKorean(data.count)}
                </span>
            </div>
        </div>
    );
}

export default function TransistorGrowth() {
    return (
        <div className="my-8">
            {/* Title */}
            <h3
                style={{
                    textAlign: 'center',
                    color: '#e4e4e7',
                    fontSize: FONT.title,
                    fontWeight: 700,
                    marginBottom: 8,
                }}
            >
                트랜지스터 집적도의 성장 (1971–2024)
            </h3>

            {/* Custom Legend */}
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="28" height="12"><line x1="0" y1="6" x2="28" y2="6" stroke="#818cf8" strokeWidth="2" strokeDasharray="6 4" /></svg>
                    <span style={{ color: COLOR.textMuted, fontSize: FONT.small }}>무어의 법칙 (2년마다 2배)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#ef4444" /></svg>
                    <span style={{ color: COLOR.textMuted, fontSize: FONT.small }}>실측 데이터</span>
                </div>
            </div>

            <div style={{ width: '100%', height: 420 }}>
                <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.06)"
                        />
                        <XAxis
                            dataKey="year"
                            type="number"
                            domain={[1968, 2026]}
                            ticks={[1970, 1980, 1990, 2000, 2010, 2020]}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.small }}
                            axisLine={{ stroke: '#3f3f46' }}
                            tickLine={{ stroke: '#3f3f46' }}
                            label={{
                                value: '연도 (Year)',
                                position: 'bottom',
                                offset: 20,
                                style: { fill: COLOR.textDim, fontSize: FONT.subtitle },
                            }}
                        />
                        <YAxis
                            dataKey="count"
                            type="number"
                            scale="log"
                            domain={[1000, 1e12]}
                            ticks={[1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11]}
                            tickFormatter={formatCount}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.small }}
                            axisLine={{ stroke: '#3f3f46' }}
                            tickLine={{ stroke: '#3f3f46' }}
                            label={{
                                value: '트랜지스터 수 (로그 스케일)',
                                angle: -90,
                                position: 'insideLeft',
                                offset: -5,
                                style: { fill: COLOR.textDim, fontSize: FONT.subtitle, textAnchor: 'middle' },
                            }}
                        />

                        {/* Tooltip */}
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={false}
                            isAnimationActive={false}
                            wrapperStyle={{ transition: 'none' }}
                        />

                        {/* Legend - custom rendered outside chart */}

                        {/* Moore's Law trendline */}
                        <Scatter
                            data={mooresLawData}
                            fill="none"
                            line={{ stroke: '#818cf8', strokeWidth: 2, strokeDasharray: '6 4' }}
                            shape={() => <></>}
                            legendType="none"
                            isAnimationActive={false}
                        />

                        {/* Actual data points */}
                        <Scatter
                            data={actualData}
                            fill="#ef4444"
                            legendType="none"
                            isAnimationActive={true}
                            animationBegin={200}
                            animationDuration={800}
                            shape={(props: { cx?: number; cy?: number }) => {
                                const cx = props.cx ?? 0;
                                const cy = props.cy ?? 0;
                                return (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={6}
                                        fill="#ef4444"
                                        stroke="#ef4444"
                                        strokeWidth={0}
                                        style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                                    />
                                );
                            }}
                            activeShape={(props: { cx?: number; cy?: number }) => {
                                const cx = props.cx ?? 0;
                                const cy = props.cy ?? 0;
                                return (
                                    <g>
                                        {/* Glow ring */}
                                        <circle
                                            cx={cx}
                                            cy={cy}
                                            r={16}
                                            fill="rgba(239, 68, 68, 0.15)"
                                            stroke="none"
                                        />
                                        {/* Active dot */}
                                        <circle
                                            cx={cx}
                                            cy={cy}
                                            r={8}
                                            fill="#f87171"
                                            stroke="#fff"
                                            strokeWidth={2}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </g>
                                );
                            }}
                        />

                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
