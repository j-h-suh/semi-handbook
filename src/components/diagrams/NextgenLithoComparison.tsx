'use client';

import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const METRICS = ['해상도', '스루풋', '비용효율', '패턴자유도', '양산성숙도'];

const TECH_DATA: Record<string, { values: number[]; color: string }> = {
    'EUV':     { values: [70, 90, 50, 95, 95], color: '#3b82f6' },
    'High-NA': { values: [95, 80, 30, 95, 30], color: '#f59e0b' },
    'DSA':     { values: [98, 70, 85, 20, 15], color: '#22c55e' },
    'NIL':     { values: [85, 30, 90, 60, 50], color: '#a855f7' },
};

export default function NextgenLithoComparison() {
    const [activeTech, setActiveTech] = useState<string | null>(null);

    const data = useMemo(() =>
        METRICS.map((m, i) => {
            const entry: Record<string, string | number> = { metric: m };
            Object.entries(TECH_DATA).forEach(([tech, { values }]) => { entry[tech] = values[i]; });
            return entry;
        }), []);

    return (
        <div className="mt-8 mb-12">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                차세대 리소그래피 기술 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                5개 지표: 해상도, 스루풋, 비용효율, 패턴 자유도, 양산 성숙도
            </p>
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 8 }}>
                {Object.entries(TECH_DATA).map(([tech, { color }]) => (
                    <span key={tech} style={{ fontSize: FONT.min, color: activeTech === tech ? color : COLOR.textDim, cursor: 'pointer', fontWeight: activeTech === tech ? 700 : 400 }}
                        onMouseEnter={() => setActiveTech(tech)} onMouseLeave={() => setActiveTech(null)}>
                        ● {tech}
                    </span>
                ))}
            </div>
            <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: COLOR.textDim, fontSize: FONT.min }} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small }} />
                    {Object.entries(TECH_DATA).map(([tech, { color }]) => (
                        <Radar key={tech} name={tech} dataKey={tech} stroke={color} fill={color}
                            fillOpacity={activeTech === null ? 0.08 : activeTech === tech ? 0.2 : 0.02}
                            strokeWidth={activeTech === null ? 1.5 : activeTech === tech ? 2.5 : 0.5}
                            strokeOpacity={activeTech === null ? 0.8 : activeTech === tech ? 1 : 0.15} />
                    ))}
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
