'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFrame, Canvas } from '@react-three/fiber';
import { FONT, COLOR } from './diagramTokens';
import * as THREE from 'three';

/* ─── 요소 데이터 ─── */
type ElementId = 'mask' | 'slit' | 'lens' | 'wafer' | null;

interface ElementInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const ELEMENTS: Record<Exclude<ElementId, null>, ElementInfo> = {
    mask: { label: '마스크 스테이지', sub: '속도 v → (고속 이동)', desc: '마스크를 한 방향으로 속도 v로 이동시킨다. 노광 필드를 슬릿으로 훑어가면서 패턴을 전사. 1nm 미만의 위치 정밀도 유지.', color: '#f59e0b' },
    slit: { label: '슬릿 (노광 영역)', sub: '렌즈 중심부만 사용', desc: '좁은 슬릿 형태의 빛으로 패턴을 훑어간다. 렌즈의 중심부만 사용하므로 수차가 크게 줄어들어 고해상도 달성. 노광 필드: 26×33mm.', color: '#fbbf24' },
    lens: { label: '투영 렌즈', sub: '4:1 축소 투영', desc: '수십 장의 정밀 렌즈로 구성. NA 최대 1.35(침수). 슬릿 영역만 커버하므로 작은 렌즈로 높은 해상도 달성 가능.', color: '#3b82f6' },
    wafer: { label: '웨이퍼 스테이지', sub: '속도 v/4 ← (반대 방향)', desc: '웨이퍼를 마스크와 반대 방향으로 v/4 속도로 이동. 4:1 축소비를 유지하기 위해 정확히 1/4 속도. 0.5nm 미만 위치 정밀도.', color: '#a1a1aa' },
};

/* ─── Y 위치 (위에서 아래: 마스크 > 슬릿 > 렌즈 > 웨이퍼) ─── */
const MASK_Y = 1.5;
const SLIT_Y = 1.2;
const LENS_Y = 0.0;
const WAFER_Y = -1.4;

/* ─── 3D 컴포넌트 ─── */
function MaskPlate({ highlighted }: { highlighted: boolean }) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.8) * 1.2;
        }
    });
    return (
        <mesh ref={ref} position={[0, MASK_Y, 0]}>
            <boxGeometry args={[3.5, 0.08, 2.5]} />
            <meshStandardMaterial
                color={highlighted ? '#a1a1aa' : '#71717a'}
                emissive={highlighted ? '#ffffff' : '#000000'} emissiveIntensity={highlighted ? 0.15 : 0} />
        </mesh>
    );
}

function SlitBeam({ highlighted }: { highlighted: boolean }) {
    return (
        <>
            {/* 마스크→렌즈: 넓은 빔 */}
            <mesh position={[0, (MASK_Y + LENS_Y) / 2, 0]}>
                <boxGeometry args={[0.3, MASK_Y - LENS_Y - 0.2, 2.0]} />
                <meshStandardMaterial
                    color="#fbbf24" transparent opacity={highlighted ? 0.45 : 0.25}
                    emissive={highlighted ? '#fbbf24' : '#000000'} emissiveIntensity={highlighted ? 0.5 : 0.1} />
            </mesh>
            {/* 렌즈→웨이퍼: 축소되는 빔 */}
            <mesh position={[0, (LENS_Y + WAFER_Y) / 2, 0]}>
                <boxGeometry args={[0.12, LENS_Y - WAFER_Y - 0.2, 0.8]} />
                <meshStandardMaterial
                    color="#fbbf24" transparent opacity={highlighted ? 0.35 : 0.2}
                    emissive={highlighted ? '#fbbf24' : '#000000'} emissiveIntensity={highlighted ? 0.4 : 0.1} />
            </mesh>
        </>
    );
}

function LensGroup({ highlighted }: { highlighted: boolean }) {
    return (
        <group position={[0, LENS_Y, 0]}>
            <mesh>
                <cylinderGeometry args={[1.6, 1.6, 0.18, 32]} />
                <meshStandardMaterial
                    color={highlighted ? '#3b82f6' : '#87ceeb'} transparent opacity={highlighted ? 0.7 : 0.6}
                    emissive={highlighted ? '#3b82f6' : '#000000'} emissiveIntensity={highlighted ? 0.3 : 0} />
            </mesh>
        </group>
    );
}

function WaferPlate({ highlighted }: { highlighted: boolean }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.position.x = -Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
        }
    });
    return (
        <group ref={ref} position={[0, WAFER_Y, 0]}>
            {/* 웨이퍼 */}
            <mesh position={[0, 0.08, 0]}>
                <cylinderGeometry args={[1.8, 1.8, 0.06, 64]} />
                <meshStandardMaterial
                    color={highlighted ? '#d4d4d8' : '#a1a1aa'} metalness={0.5} roughness={0.3}
                    emissive={highlighted ? '#a1a1aa' : '#000000'} emissiveIntensity={highlighted ? 0.2 : 0} />
            </mesh>
            {/* 스테이지 (척) — 네모 */}
            <mesh position={[0, -0.18, 0]}>
                <boxGeometry args={[3.2, 0.3, 3.2]} />
                <meshStandardMaterial
                    color={highlighted ? '#71717a' : '#52525b'}
                    emissive={highlighted ? '#71717a' : '#27272a'} emissiveIntensity={highlighted ? 0.15 : 0.05} />
            </mesh>
        </group>
    );
}

function ScannerScene({ hovered }: { hovered: ElementId }) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={1} />
            <directionalLight position={[-3, 4, -3]} intensity={0.3} />

            <MaskPlate highlighted={hovered === 'mask'} />
            <SlitBeam highlighted={hovered === 'slit'} />
            <LensGroup highlighted={hovered === 'lens'} />
            <WaferPlate highlighted={hovered === 'wafer'} />
        </>
    );
}

export default function ScannerSlitScanning() {
    const [hovered, setHovered] = useState<ElementId>(null);

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                스캐너 슬릿 스캐닝 개념도
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Scanner Slit Scanning — 3D Interactive
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* 3D Canvas */}
                <div style={{ width: 380, aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)', background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f17 100%)' }}>
                    <Canvas camera={{ position: [5, 3, 5], fov: 35 }}>
                        <ScannerScene hovered={hovered} />
                    </Canvas>
                </div>

                {/* 요소 버튼 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 220 }}>
                    {(Object.keys(ELEMENTS) as Exclude<ElementId, null>[]).map(id => {
                        const info = ELEMENTS[id];
                        const active = hovered === id;
                        return (
                            <motion.div key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: active || hovered === null ? 1 : 0.3 }}
                                style={{ background: active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${active ? info.color + '40' : 'rgba(255,255,255,0.06)'}`,
                                    borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
                                <div style={{ fontSize: FONT.min, fontWeight: 600, color: active ? info.color : COLOR.textMuted }}>{info.label}</div>
                                <div style={{ fontSize: FONT.min, color: COLOR.textDim }}>{info.sub}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 하단 툴팁 */}
            <div style={{ maxWidth: 640, margin: '10px auto 0', height: 70 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 16px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: ELEMENTS[hovered].color, marginBottom: 2 }}>
                                {ELEMENTS[hovered].label}
                            </div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                {ELEMENTS[hovered].desc}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 16px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 요소를 호버하여 상세 설명을 확인하세요. 마스크와 웨이퍼가 반대 방향으로 동시 이동하며 좁은 슬릿으로 패턴을 훑어갑니다.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
