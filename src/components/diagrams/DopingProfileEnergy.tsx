'use client';

import React from 'react';
import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { FONT, COLOR } from './diagramTokens';

/* ─── Simulated Gaussian doping profiles ─── */
interface DataPoint { depth: number; low: number; mid: number; high: number; }

function gauss(x: number, rp: number, drp: number, peak: number): number {
    return peak * Math.exp(-0.5 * ((x - rp) / drp) ** 2);
}

const data: DataPoint[] = [];
for (let d = 0; d <= 500; d += 5) {
    data.push({
        depth: d,
        low: Math.max(gauss(d, 15, 8, 1e20), 1e14),     // 1 keV — ultra-shallow
        mid: Math.max(gauss(d, 80, 35, 5e19), 1e14),     // 50 keV — medium
        high: Math.max(gauss(d, 250, 90, 1e19), 1e14),   // 500 keV — deep well
    });
}

const lineInfo: Record<string, { label: string; desc: string; color: string }> = {
    low: { label: '1 keV (초미세 접합)', desc: 'S/D 접합 — 표면 ~15nm에 고농도 주입', color: '#ef4444' },
    mid: { label: '50 keV (일반)', desc: '채널 도핑, Vt 조정 — 중간 깊이', color: '#3b82f6' },
    high: { label: '500 keV (딥 웰)', desc: 'N-well / P-well 형성 — 깊은 영역', color: '#22c55e' },
};

interface PayloadItem { name: string; value: number; color: string; }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: PayloadItem[]; label?: number }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: `1px solid ${COLOR.border}`, borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <p style={{ color: COLOR.textBright, fontWeight: 600, fontSize: FONT.cardHeader, margin: '0 0 6px' }}>
                깊이: {label} nm
            </p>
            {payload.map(p => {
                const info = lineInfo[p.name];
                return (
                    <p key={p.name} style={{ color: info.color, fontSize: FONT.small, margin: '2px 0', fontWeight: 500 }}>
                        {info.label}: <strong>{p.value.toExponential(1)}</strong> atoms/cm³
                    </p>
                );
            })}
        </div>
    );
}

const logTicks = [1e14, 1e15, 1e16, 1e17, 1e18, 1e19, 1e20];

const superDigits: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
function formatConc(v: number): string {
    const exp = Math.round(Math.log10(v));
    const sup = String(exp).split('').map(c => superDigits[c] || c).join('');
    return `10${sup}`;
}

export default function DopingProfileEnergy() {
    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                이온 주입 에너지별 도핑 프로파일
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                Doping Concentration vs Depth at Different Implant Energies
            </p>

            <ResponsiveContainer width="100%" height={380}>
                <LineChart data={data} margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="depth" type="number" ticks={Array.from({ length: 21 }, (_, i) => i * 25)}
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }} tickLine={false}
                        axisLine={{ stroke: COLOR.border }}
                        label={{ value: '깊이 (nm)', position: 'insideBottom', offset: -10, fill: COLOR.textDim, style: { fontSize: FONT.min } }}
                    />
                    <YAxis scale="log" domain={[1e14, 1e21]} ticks={logTicks} allowDataOverflow
                        tick={{ fill: COLOR.textDim, fontSize: FONT.min }} tickLine={false}
                        axisLine={{ stroke: COLOR.border }}
                        tickFormatter={formatConc}
                        label={{ value: '농도 (atoms/cm³)', angle: -90, position: 'insideLeft', fill: COLOR.textDim, style: { fontSize: FONT.min, textAnchor: 'middle' } }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend align="right" verticalAlign="top" wrapperStyle={{ fontSize: FONT.min, paddingBottom: 8 }}
                        formatter={(value: string) => (
                            <span style={{ color: COLOR.textMuted }}>{lineInfo[value]?.label ?? value}</span>
                        )}
                    />
                    <Line type="monotone" dataKey="low" name="low" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="mid" name="mid" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="high" name="high" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
