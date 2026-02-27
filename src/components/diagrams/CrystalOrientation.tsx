'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type OrientationId = '100' | '110' | '111' | null;

interface Orientation {
    label: string;
    desc: string;
    density: string;
    usage: string;
    color: string;
    isStandard?: boolean;
}

const orientations: Record<Exclude<OrientationId, null>, Orientation> = {
    '100': {
        label: '(100)',
        desc: '정육면체의 면 — 정면으로 자른 단면',
        density: '가장 낮음',
        usage: 'CMOS 표준 — 산화 속도가 느려 게이트 산화막 정밀 제어에 유리',
        color: '#3b82f6',
        isStandard: true,
    },
    '110': {
        label: '(110)',
        desc: '정육면체를 대각선으로 자른 단면',
        density: '중간',
        usage: '일부 PMOS 성능 최적화 연구용',
        color: '#f59e0b',
    },
    '111': {
        label: '(111)',
        desc: '꼭짓점 3개를 잇는 삼각 단면',
        density: '가장 높음',
        usage: '바이폴라(Bipolar) 소자',
        color: '#22c55e',
    },
};

const orientationOrder: Exclude<OrientationId, null>[] = ['100', '110', '111'];

/*
 * 3D-perspective unit cube with a colored cutting plane.
 * Simple isometric projection using a fixed transform.
 */
function CubeDiagram({ id, hovered }: { id: Exclude<OrientationId, null>; hovered: boolean }) {
    const o = orientations[id];
    const size = 80;
    // Isometric offsets
    const dx = 28;
    const dy = 16;

    // 8 corners of the cube in isometric projection
    // Front face: bottom-left, bottom-right, top-right, top-left
    const fl = [36, 120]; // front-left-bottom
    const fr = [36 + size, 120]; // front-right-bottom
    const frt = [36 + size, 120 - size]; // front-right-top
    const flt = [36, 120 - size]; // front-left-top
    // Back face (offset by dx, -dy)
    const bl = [fl[0] + dx, fl[1] - dy];
    const br = [fr[0] + dx, fr[1] - dy];
    const brt = [frt[0] + dx, frt[1] - dy];
    const blt = [flt[0] + dx, flt[1] - dy];

    const planeOpacity = hovered ? 0.5 : 0.3;

    return (
        <svg width={180} height={150} viewBox="0 0 180 150">
            {/* Back edges (dashed) */}
            <line x1={bl[0]} y1={bl[1]} x2={br[0]} y2={br[1]} stroke="#52525b" strokeWidth={0.8} strokeDasharray="3 2" />
            <line x1={bl[0]} y1={bl[1]} x2={blt[0]} y2={blt[1]} stroke="#52525b" strokeWidth={0.8} strokeDasharray="3 2" />
            <line x1={bl[0]} y1={bl[1]} x2={fl[0]} y2={fl[1]} stroke="#52525b" strokeWidth={0.8} strokeDasharray="3 2" />

            {/* Cutting plane */}
            {id === '100' && (
                <polygon
                    points={`${fl[0]},${fl[1]} ${flt[0]},${flt[1]} ${frt[0]},${frt[1]} ${fr[0]},${fr[1]}`}
                    fill={o.color} fillOpacity={planeOpacity}
                    stroke={o.color} strokeWidth={1.5}
                />
            )}
            {id === '110' && (
                <polygon
                    points={`${fl[0]},${fl[1]} ${flt[0]},${flt[1]} ${brt[0]},${brt[1]} ${br[0]},${br[1]}`}
                    fill={o.color} fillOpacity={planeOpacity}
                    stroke={o.color} strokeWidth={1.5}
                />
            )}
            {id === '111' && (
                <polygon
                    points={`${fr[0]},${fr[1]} ${flt[0]},${flt[1]} ${brt[0]},${brt[1]}`}
                    fill={o.color} fillOpacity={planeOpacity}
                    stroke={o.color} strokeWidth={1.5}
                />
            )}

            {/* Front face edges */}
            <line x1={fl[0]} y1={fl[1]} x2={fr[0]} y2={fr[1]} stroke="#a1a1aa" strokeWidth={1.2} />
            <line x1={fr[0]} y1={fr[1]} x2={frt[0]} y2={frt[1]} stroke="#a1a1aa" strokeWidth={1.2} />
            <line x1={frt[0]} y1={frt[1]} x2={flt[0]} y2={flt[1]} stroke="#a1a1aa" strokeWidth={1.2} />
            <line x1={flt[0]} y1={flt[1]} x2={fl[0]} y2={fl[1]} stroke="#a1a1aa" strokeWidth={1.2} />
            {/* Right face edges */}
            <line x1={fr[0]} y1={fr[1]} x2={br[0]} y2={br[1]} stroke="#a1a1aa" strokeWidth={1.2} />
            <line x1={br[0]} y1={br[1]} x2={brt[0]} y2={brt[1]} stroke="#a1a1aa" strokeWidth={1.2} />
            <line x1={brt[0]} y1={brt[1]} x2={frt[0]} y2={frt[1]} stroke="#a1a1aa" strokeWidth={1.2} />
            {/* Top face edges */}
            <line x1={flt[0]} y1={flt[1]} x2={blt[0]} y2={blt[1]} stroke="#a1a1aa" strokeWidth={1.2} />
            <line x1={blt[0]} y1={blt[1]} x2={brt[0]} y2={brt[1]} stroke="#a1a1aa" strokeWidth={1.2} />

            {/* Corner dots */}
            {[fl, fr, frt, flt, bl, br, brt, blt].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={2} fill="#d4d4d8" />
            ))}

            {/* Axis labels */}
            <text x={fr[0] + 8} y={fr[1] + 4} fill="#71717a" fontSize={9}>x</text>
            <text x={flt[0] - 8} y={flt[1] - 4} fill="#71717a" fontSize={9}>z</text>
            <text x={br[0] + 8} y={br[1] - 4} fill="#71717a" fontSize={9}>y</text>
        </svg>
    );
}

export default function CrystalOrientation() {
    const [hovered, setHovered] = useState<OrientationId>(null);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                실리콘 결정 방향 비교
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 16 }}>
                밀러 지수(Miller Index)에 따른 절단면
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                {orientationOrder.map((id) => {
                    const o = orientations[id];
                    const isActive = hovered === id;
                    const isDimmed = hovered !== null && !isActive;
                    return (
                        <motion.div
                            key={id}
                            onMouseEnter={() => setHovered(id)}
                            onMouseLeave={() => setHovered(null)}
                            animate={{ opacity: isDimmed ? 0.35 : 1 }}
                            transition={{ duration: 0.15 }}
                            style={{
                                background: isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${isActive ? o.color : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: 12,
                                padding: '12px 16px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                minWidth: 200,
                                maxWidth: 260,
                                flex: '1 1 200px',
                                position: 'relative',
                                boxShadow: isActive ? `0 0 20px ${o.color}22` : 'none',
                            }}
                        >
                            {/* Badge */}
                            <div style={{
                                background: o.color,
                                borderRadius: 6,
                                padding: '4px 12px',
                                marginBottom: 8,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                            }}>
                                <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>{o.label}</span>
                                {o.isStandard && (
                                    <span style={{
                                        background: 'rgba(255,255,255,0.25)',
                                        borderRadius: 4,
                                        padding: '1px 5px',
                                        fontSize: FONT.min,
                                        color: 'white',
                                        fontWeight: 600,
                                    }}>CMOS 표준</span>
                                )}
                            </div>

                            {/* Cube diagram */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <CubeDiagram id={id} hovered={isActive} />
                            </div>

                            {/* Tooltip on hover */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.15 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{
                                            marginTop: 8,
                                            padding: '8px 0',
                                            borderTop: '1px solid rgba(255,255,255,0.06)',
                                            textAlign: 'left',
                                        }}>
                                            <p style={{ color: COLOR.text, fontSize: FONT.small, margin: '0 0 4px', lineHeight: 1.5 }}>
                                                {o.desc}
                                            </p>
                                            <p style={{ color: COLOR.textMuted, fontSize: FONT.small, margin: '0 0 2px' }}>
                                                표면 원자 밀도: <span style={{ color: o.color, fontWeight: 600 }}>{o.density}</span>
                                            </p>
                                            <p style={{ color: COLOR.textMuted, fontSize: FONT.small, margin: 0 }}>
                                                용도: {o.usage}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Static info */}
                            {!isActive && (
                                <div style={{ marginTop: 4 }}>
                                    <p style={{ color: COLOR.textDim, fontSize: FONT.min, margin: 0 }}>
                                        원자 밀도: {o.density}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
