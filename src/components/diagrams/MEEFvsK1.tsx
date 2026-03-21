'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, ReferenceArea, Tooltip } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

const DATA = [
    { k1: 0.80, meef: 0.9 }, { k1: 0.70, meef: 1.0 }, { k1: 0.60, meef: 1.1 },
    { k1: 0.50, meef: 1.3 }, { k1: 0.45, meef: 1.6 }, { k1: 0.40, meef: 2.0 },
    { k1: 0.35, meef: 2.5 }, { k1: 0.32, meef: 3.0 }, { k1: 0.30, meef: 3.5 },
    { k1: 0.28, meef: 4.2 },
];

type HoverInfo = { k1: number; meef: number } | null;

export default function MEEFvsK1() {
    const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);

    return (
        <div className="mt-8 mb-12 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                MEEF vs k₁
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                k₁이 낮아질수록 마스크 CD 오차가 웨이퍼에서 증폭
            </p>
            <div style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={DATA} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                        onMouseMove={(e: any) => { if (e?.activePayload?.[0]) setHoverInfo(e.activePayload[0].payload); }}
                        onMouseLeave={() => setHoverInfo(null)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="k1" type="number" domain={[0.25, 0.85]} reversed
                            tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false}
                            label={{ value: 'k₁', position: 'insideBottomRight', fill: COLOR.textDim, fontSize: FONT.min, offset: -5 }}
                            ticks={[0.3, 0.4, 0.5, 0.6, 0.7, 0.8]} />
                        <YAxis domain={[0, 5]} tick={{ fill: COLOR.textDim, fontSize: FONT.min }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false}
                            label={{ value: 'MEEF', angle: -90, position: 'insideLeft', fill: COLOR.textDim, fontSize: FONT.min, dx: -4 }}
                            ticks={[0, 1, 2, 3, 4, 5]} />
                        <ReferenceLine y={1} stroke="rgba(34,197,94,0.4)" strokeDasharray="6 3"
                            label={{ value: 'MEEF = 1 (이상적)', fill: 'rgba(34,197,94,0.5)', fontSize: FONT.min, position: 'insideTopLeft' }} />
                        <ReferenceArea x1={0.25} x2={0.35} fill="rgba(239,68,68,0.06)" />
                        <Tooltip content={() => null} />
                        <Line type="monotone" dataKey="meef" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div style={{ maxWidth: 640, margin: '0 auto', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hoverInfo ? (
                        <motion.div key="hover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: hoverInfo.meef > 2 ? '#ef4444' : '#f59e0b', marginBottom: 2 }}>
                                k₁ = {hoverInfo.k1} → MEEF = {hoverInfo.meef}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                마스크 1nm CD 오차 → 웨이퍼에서 {(hoverInfo.meef / 4).toFixed(1)}~{(hoverInfo.meef).toFixed(1)}nm 오차 (M=4 기준)
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                차트를 호버하세요. k₁ &lt; 0.35 위험 영역에서 MEEF가 2 이상으로 급증하여 마스크 CD 관리가 극도로 중요해집니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
