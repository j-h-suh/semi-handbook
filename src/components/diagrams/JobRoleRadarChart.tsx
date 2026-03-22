'use client';

import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import { FONT, COLOR } from './diagramTokens';

const METRICS = ['ML/DL', '데이터 엔지니어링', '도메인 지식', '시스템 설계', '커뮤니케이션'];

const ROLES: Record<string, { values: number[]; color: string }> = {
    'ML Engineer':        { values: [95, 60, 70, 50, 50], color: '#3b82f6' },
    'Data Engineer':      { values: [40, 95, 50, 80, 40], color: '#22c55e' },
    'Comp. Litho':        { values: [80, 30, 95, 40, 30], color: '#f59e0b' },
    'Process Integ.':     { values: [60, 50, 90, 70, 80], color: '#a855f7' },
    'Platform Eng.':      { values: [50, 70, 40, 95, 70], color: '#ef4444' },
};

export default function JobRoleRadarChart() {
    const [activeRole, setActiveRole] = useState<string | null>(null);

    const data = useMemo(() =>
        METRICS.map((m, i) => {
            const entry: Record<string, string | number> = { metric: m };
            Object.entries(ROLES).forEach(([role, { values }]) => { entry[role] = values[i]; });
            return entry;
        }), []);

    return (
        <div className="mt-8 mb-12">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                반도체 AI 직무별 역량 레이더
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                5개 직무 × 5개 역량: ML, 데이터, 도메인, 시스템, 커뮤니케이션
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
                {Object.entries(ROLES).map(([role, { color }]) => (
                    <span key={role} style={{ fontSize: FONT.min, color: activeRole === role ? color : COLOR.textDim, cursor: 'pointer', fontWeight: activeRole === role ? 700 : 400 }}
                        onMouseEnter={() => setActiveRole(role)} onMouseLeave={() => setActiveRole(null)}>
                        ● {role}
                    </span>
                ))}
            </div>
            <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: COLOR.textDim, fontSize: FONT.min }} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: FONT.small }} />
                    {Object.entries(ROLES).map(([role, { color }]) => (
                        <Radar key={role} name={role} dataKey={role} stroke={color} fill={color}
                            fillOpacity={activeRole === null ? 0.06 : activeRole === role ? 0.2 : 0.01}
                            strokeWidth={activeRole === null ? 1.5 : activeRole === role ? 2.5 : 0.5}
                            strokeOpacity={activeRole === null ? 0.7 : activeRole === role ? 1 : 0.1} />
                    ))}
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
