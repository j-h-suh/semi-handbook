'use client';

import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';
import * as THREE from 'three';

type StructKey = 'planar' | 'finfet' | 'gaa' | null;

const structInfo: Record<Exclude<StructKey, null>, { label: string; sub: string; desc: string; accent: string; era: string }> = {
    planar: {
        label: 'Planar MOSFET',
        sub: 'Gate: 1면 제어',
        desc: '게이트가 채널 윗면만 제어하는 전통 구조. 22nm 이하에서 단채널 효과(Short Channel Effect)로 누설 전류가 급증하여 한계에 도달.',
        accent: '#3b82f6',
        era: '~22nm (2011)',
    },
    finfet: {
        label: 'FinFET (Tri-Gate)',
        sub: 'Gate: 3면 제어',
        desc: '채널을 지느러미(Fin) 형태로 세우고 게이트가 3면을 감싸는 구조. 2012년 인텔 22nm에서 최초 양산. 누설 전류를 획기적으로 줄여 3nm까지 사용.',
        accent: '#f59e0b',
        era: '22nm~3nm (2012~)',
    },
    gaa: {
        label: 'GAA / Nanosheet',
        sub: 'Gate: 4면 제어',
        desc: '나노시트를 게이트가 사방에서 감싸는 구조. FinFET 대비 제어력 극대화. 삼성 3nm 최초 양산, TSMC/인텔은 2nm에서 도입 예정.',
        accent: '#22c55e',
        era: '2nm~ (2025~)',
    },
};

/* ─── Colors ─── */
const GATE_COLOR = '#22c55e';
const CHANNEL_COLOR = '#3b82f6';
const SD_COLOR = '#9ca3af';
const SUB_COLOR = '#3f3f46';

/* ─── Shared Components ─── */
function Box({ position, size, color, opacity = 1 }: {
    position: [number, number, number];
    size: [number, number, number];
    color: string;
    opacity?: number;
}) {
    return (
        <RoundedBox args={size} position={position} radius={0.02} smoothness={4}>
            <meshStandardMaterial color={color} transparent opacity={opacity} />
        </RoundedBox>
    );
}

function Label3D({ position, text, color = '#ffffff', size = 0.15 }: {
    position: [number, number, number];
    text: string;
    color?: string;
    size?: number;
}) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame(({ camera }) => {
        if (ref.current) ref.current.quaternion.copy(camera.quaternion);
    });
    return (
        <Text ref={ref} position={position} fontSize={size} color={color} anchorX="center" anchorY="middle">
            {text}
        </Text>
    );
}

/* ─── Planar MOSFET ─── */
function PlanarModel() {
    return (
        <group>
            <Box position={[0, -0.15, 0]} size={[2.2, 0.3, 1.8]} color={SUB_COLOR} opacity={0.7} />
            <Box position={[-0.7, 0.15, 0]} size={[0.55, 0.3, 1.3]} color={SD_COLOR} opacity={0.6} />
            <Label3D position={[-0.7, 0.15, 0.85]} text="S" color="#a1a1aa" />
            <Box position={[0.7, 0.15, 0]} size={[0.55, 0.3, 1.3]} color={SD_COLOR} opacity={0.6} />
            <Label3D position={[0.7, 0.15, 0.85]} text="D" color="#a1a1aa" />
            {/* Channel — spans from S to D under gate */}
            <Box position={[0, 0.05, 0]} size={[1.1, 0.1, 0.7]} color={CHANNEL_COLOR} opacity={0.5} />
            <Box position={[0, 0.35, 0]} size={[0.65, 0.5, 0.7]} color={GATE_COLOR} opacity={0.7} />
            <Label3D position={[0, 0.75, 0]} text="Gate" color={GATE_COLOR} size={0.16} />
        </group>
    );
}

/* ─── FinFET ─── */
function FinFETModel() {
    return (
        <group>
            <Box position={[0, -0.15, 0]} size={[2.2, 0.3, 1.8]} color={SUB_COLOR} opacity={0.7} />
            {/* Fin (channel — narrow, tall) */}
            <Box position={[0, 0.55, 0]} size={[0.22, 1.1, 1.3]} color={CHANNEL_COLOR} opacity={0.55} />
            {/* S/D */}
            <Box position={[0, 0.25, 0.7]} size={[0.55, 0.5, 0.35]} color={SD_COLOR} opacity={0.6} />
            <Label3D position={[0, 0.25, 1.05]} text="S" color="#a1a1aa" />
            <Box position={[0, 0.25, -0.7]} size={[0.55, 0.5, 0.35]} color={SD_COLOR} opacity={0.6} />
            <Label3D position={[0, 0.25, -1.05]} text="D" color="#a1a1aa" />
            {/* Gate — wraps 3 sides, taller than fin so fin doesn't protrude */}
            <Box position={[0, 0.6, 0]} size={[0.7, 1.2, 0.55]} color={GATE_COLOR} opacity={0.4} />
            <Label3D position={[0, 1.4, 0]} text="Gate" color={GATE_COLOR} size={0.16} />
        </group>
    );
}

/* ─── GAA / Nanosheet ─── */
function GAAModel() {
    const nsYPositions = [0.2, 0.55, 0.9];
    return (
        <group>
            <Box position={[0, -0.15, 0]} size={[2.2, 0.3, 1.8]} color={SUB_COLOR} opacity={0.7} />
            <Box position={[0, 0.55, 0.7]} size={[0.55, 0.85, 0.28]} color={SD_COLOR} opacity={0.55} />
            <Label3D position={[0, 0.55, 1.0]} text="S" color="#a1a1aa" />
            <Box position={[0, 0.55, -0.7]} size={[0.55, 0.85, 0.28]} color={SD_COLOR} opacity={0.55} />
            <Label3D position={[0, 0.55, -1.0]} text="D" color="#a1a1aa" />
            {nsYPositions.map((ny, i) => (
                <group key={i}>
                    <Box position={[0, ny, 0]} size={[0.75, 0.22, 0.55]} color={GATE_COLOR} opacity={0.4} />
                    <Box position={[0, ny, 0]} size={[0.55, 0.08, 1.3]} color={CHANNEL_COLOR} opacity={0.65} />
                </group>
            ))}
            <Label3D position={[0, 1.2, 0]} text="Gate" color={GATE_COLOR} size={0.16} />
        </group>
    );
}

/* ─── Individual 3D Viewer ─── */
function StructureViewer({ children, accentColor }: { children: React.ReactNode; accentColor: string }) {
    return (
        <div style={{ aspectRatio: '1 / 1.1', borderRadius: 10, overflow: 'hidden', background: 'rgba(0,0,0,0.25)', border: `1px solid ${accentColor}22`, boxSizing: 'border-box' }}>
            <Canvas
                camera={{ position: [3, 2.5, 3], fov: 40 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 8, 5]} intensity={0.8} />
                    <directionalLight position={[-3, 4, -2]} intensity={0.3} />
                    {children}
                    <OrbitControls
                        enablePan={false}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={3}
                        maxDistance={10}
                        minPolarAngle={0.2}
                        maxPolarAngle={Math.PI / 2}
                    />
                    <gridHelper args={[6, 12, '#333333', '#222222']} position={[0, -0.31, 0]} />
                </Suspense>
            </Canvas>
        </div>
    );
}

const structs: Exclude<StructKey, null>[] = ['planar', 'finfet', 'gaa'];
const models = [PlanarModel, FinFETModel, GAAModel];

export default function PlanarFinFETGAA() {
    const [hovered, setHovered] = useState<StructKey>(null);

    return (
        <div className="my-8">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                트랜지스터 구조의 진화
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 4 }}>
                Planar → FinFET → GAA — Gate Control Evolution
            </p>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.min, marginBottom: 12, opacity: 0.5 }}>
                🖱️ 각 그림을 드래그하여 회전
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {structs.map((s, i) => {
                    const ModelComp = models[i];
                    const dimmed = hovered !== null && hovered !== s;
                    return (
                        <div key={s}
                            onMouseEnter={() => setHovered(s)}
                            onMouseLeave={() => setHovered(null)}
                            style={{ opacity: dimmed ? 0.3 : 1, transition: 'opacity 0.2s', minWidth: 0 }}
                        >
                            <StructureViewer accentColor={structInfo[s].accent}>
                                <ModelComp />
                            </StructureViewer>
                            <div style={{ textAlign: 'center', marginTop: 6 }}>
                                <div style={{ fontSize: FONT.body, color: structInfo[s].accent, fontWeight: 600 }}>
                                    {structInfo[s].label}
                                </div>
                                <div style={{ fontSize: FONT.min, color: COLOR.textDim }}>{structInfo[s].sub}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Color legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
                {[
                    { color: GATE_COLOR, label: 'Gate' },
                    { color: CHANNEL_COLOR, label: 'Channel' },
                    { color: SD_COLOR, label: 'Source / Drain' },
                    { color: SUB_COLOR, label: 'Substrate' },
                ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: color, opacity: 0.8 }} />
                        <span style={{ fontSize: FONT.min, color: COLOR.textDim }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Tooltip area — fixed, below legend */}
            <div style={{ width: '100%', marginTop: 8, height: 62 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 16px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: structInfo[hovered].accent, marginBottom: 4 }}>
                                {structInfo[hovered].label}
                                <span style={{ fontSize: FONT.min, fontWeight: 400, color: COLOR.textDim, marginLeft: 8 }}>{structInfo[hovered].era}</span>
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{structInfo[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 16px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.6 }}>
                                💡 3D가 표시되지 않는 경우: Chrome 설정 → 시스템 → &quot;하드웨어 가속 사용&quot; 활성화 후 브라우저를 재시작하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
