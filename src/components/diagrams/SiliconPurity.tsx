'use client';

import { FONT, COLOR } from './diagramTokens';

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
    LabelList,
} from 'recharts';

const data = [
    {
        stage: '해변 모래',
        stageSub: 'Beach Sand',
        purity: '2N',
        ppm: 10000,
        desc: '자연 상태의 모래 (SiO₂). 순도 약 99%.',
        color: '#60a5fa',
    },
    {
        stage: '야금급 Si',
        stageSub: 'MG-Si',
        purity: '2N',
        ppm: 10000,
        desc: '전기로에서 환원한 실리콘. 순도 98~99%.',
        color: '#60a5fa',
    },
    {
        stage: '트리클로로실란',
        stageSub: 'SiHCl₃ 정제',
        purity: '6N',
        ppm: 1,
        desc: '화학 정제를 거쳐 불순물을 ppb 수준까지 제거.',
        color: '#34d399',
    },
    {
        stage: '전자급 Si',
        stageSub: 'EG-Si, 11N',
        purity: '11N',
        ppm: 0.00001,
        desc: '반도체 등급. 99.999999999% 순도. 10억 개 원자 중 불순물 1개 이하.',
        color: '#f87171',
        isSemiGrade: true,
    },
];

function formatPpm(value: number): string {
    if (value >= 1) return `${value.toLocaleString()} ppm`;
    if (value >= 0.001) return `${value * 1000} ppb`;
    return `${(value * 1e6).toFixed(0)} ppt`;
}

interface TooltipPayload {
    stage: string;
    stageSub: string;
    purity: string;
    ppm: number;
    desc: string;
    isSemiGrade?: boolean;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TooltipPayload }> }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{
            background: 'rgba(24, 24, 27, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '12px 16px',
            maxWidth: 280,
        }}>
            <p style={{ color: '#22d3ee', fontWeight: 600, fontSize: FONT.cardHeader, margin: '0 0 2px' }}>
                {d.stage} ({d.stageSub})
            </p>
            <p style={{ color: '#f4f4f5', fontSize: FONT.small, margin: '0 0 6px' }}>
                순도: <strong>{d.purity}</strong> · 불순물: {formatPpm(d.ppm)}
            </p>
            <p style={{ color: COLOR.textMuted, fontSize: FONT.small, margin: 0, lineHeight: 1.4 }}>
                {d.desc}
            </p>
            {d.isSemiGrade && (
                <p style={{ color: '#f87171', fontSize: FONT.small, margin: '6px 0 0', fontWeight: 600 }}>
                    ★ 반도체 등급
                </p>
            )}
        </div>
    );
}

export default function SiliconPurity() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                실리콘 정제 단계별 순도 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 12 }}>
                Silicon Purity by Purification Stage
            </p>

            <div style={{ width: '100%', height: 400, position: 'relative' }}>
                {/* Note overlay inside chart */}
                <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 30,
                    color: '#71717a',
                    fontSize: FONT.small,
                    zIndex: 10,
                    pointerEvents: 'none',
                }}>
                    ※ 불순물 농도가 낮을수록 순도가 높음 · <span style={{ color: '#f87171' }}>■</span> 반도체 등급
                </div>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 30, right: 30, bottom: 60, left: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                            dataKey="stage"
                            tick={{ fill: COLOR.textMuted, fontSize: FONT.subtitle }}
                            axisLine={{ stroke: '#3f3f46' }}
                            tickLine={{ stroke: '#3f3f46' }}
                        />
                        <YAxis
                            type="number"
                            scale="log"
                            domain={[0.000001, 100000]}
                            ticks={[0.00001, 0.001, 0.1, 10, 1000, 100000]}
                            tickFormatter={(v: number) => {
                                if (v >= 100000) return '100K';
                                if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                                if (v >= 1) return `${v}`;
                                if (v >= 0.001) return `${v * 1000} ppb`;
                                return `${(v * 1e6).toFixed(0)} ppt`;
                            }}
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }}
                            axisLine={{ stroke: '#3f3f46' }}
                            tickLine={{ stroke: '#3f3f46' }}
                            label={{
                                value: '불순물 농도 (ppm, 로그 스케일)',
                                angle: -90,
                                position: 'insideLeft',
                                offset: -15,
                                style: { fill: COLOR.textDim, fontSize: FONT.subtitle, textAnchor: 'middle' },
                            }}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                            isAnimationActive={false}
                            wrapperStyle={{ transition: 'none' }}
                        />
                        <Bar
                            dataKey="ppm"
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={true}
                            animationDuration={800}
                        >
                            {data.map((entry, index) => (
                                <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                            ))}
                            <LabelList
                                dataKey="purity"
                                position="top"
                                style={{ fill: COLOR.textBright, fontSize: FONT.cardHeader, fontWeight: 700 }}
                                offset={8}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}
