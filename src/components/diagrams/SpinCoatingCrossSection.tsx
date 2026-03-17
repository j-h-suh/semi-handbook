'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';
import * as THREE from 'three';

/* ─── 3단계 데이터 ─── */
type StepId = 1 | 2 | 3;

interface StepInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
}

const STEPS: Record<StepId, StepInfo> = {
    1: { label: '① 디스펜스', sub: 'Dispense', desc: '웨이퍼 중앙에 노즐에서 포토레지스트 용액 1~2mL 적하. 용액의 점도와 온도가 최종 막 두께에 영향.', color: '#3b82f6' },
    2: { label: '② 고속 회전', sub: 'Spin (3,000~5,000 rpm)', desc: '원심력에 의해 PR이 바깥으로 퍼지면서 여분 용액이 비산. 회전 속도·가속도·시간이 두께를 결정.', color: '#f59e0b' },
    3: { label: '③ 균일 박막 형성', sub: 'Uniform Film (80~150nm)', desc: '극도로 균일한 PR 막 완성. Edge Bead를 용매로 제거. 두께 편차가 CD 균일도에 직결.', color: '#22c55e' },
};

/* ─── 3D 웨이퍼 ─── */
function Wafer({ spinning }: { spinning: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((_, delta) => {
        if (groupRef.current && spinning) {
            groupRef.current.rotation.y += delta * 12;
        }
    });
    return (
        <group ref={groupRef}>
            {/* 웨이퍼 본체 */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[2.2, 2.2, 0.08, 64]} />
                <meshStandardMaterial color="#a1a1aa" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* 노치 마크 (회전 시각적 표시) */}
            <mesh position={[2.1, 0.04, 0]}>
                <boxGeometry args={[0.25, 0.06, 0.15]} />
                <meshStandardMaterial color="#71717a" />
            </mesh>
            {/* 웨이퍼 표면 십자 마크 (회전 감지용) */}
            <mesh position={[0, 0.045, 0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[4.0, 0.005, 0.02]} />
                <meshStandardMaterial color="#8a8a8f" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 0.045, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[4.0, 0.005, 0.02]} />
                <meshStandardMaterial color="#8a8a8f" transparent opacity={0.4} />
            </mesh>
        </group>
    );
}

/* ─── 진공 척 ─── */
function Chuck() {
    return (
        <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[1.0, 1.2, 0.3, 32]} />
            <meshStandardMaterial color="#52525b" metalness={0.4} roughness={0.6} />
        </mesh>
    );
}

/* ─── 노즐 ─── */
function Nozzle() {
    return (
        <group position={[0, 2.2, 0]}>
            {/* 노즐 바디 */}
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.08, 0.12, 1.2, 16]} />
                <meshStandardMaterial color="#71717a" metalness={0.5} roughness={0.4} />
            </mesh>
            {/* 노즐 헤드 */}
            <mesh position={[0, 0.9, 0]}>
                <cylinderGeometry args={[0.15, 0.08, 0.15, 16]} />
                <meshStandardMaterial color="#52525b" metalness={0.5} roughness={0.4} />
            </mesh>
        </group>
    );
}

/* ─── PR 방울 (디스펜스) ─── */
function PRDroplet() {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime;
            // 반복 낙하 애니메이션
            const cycle = t % 2;
            ref.current.position.y = cycle < 1.2 ? 2.0 - cycle * 1.5 : 0.2;
            ref.current.scale.setScalar(cycle < 1.2 ? 1 : 1 + (cycle - 1.2) * 0.5);
        }
    });
    return (
        <mesh ref={ref} position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#f97316" transparent opacity={0.85} />
        </mesh>
    );
}

/* ─── PR 퍼짐 (회전 중) ─── */
function PRSpreading() {
    const ref = useRef<THREE.Mesh>(null);
    const startTime = useRef<number | null>(null);
    useFrame((state) => {
        if (ref.current) {
            if (startTime.current === null) startTime.current = state.clock.elapsedTime;
            const elapsed = state.clock.elapsedTime - startTime.current;
            // ~1.5초에 걸쳐 1.0 → 1.2로 확장, 이후 고정
            const spread = Math.min(1.0 + elapsed * 0.15, 1.2);
            ref.current.scale.set(spread, 1, spread);
        }
    });
    return (
        <mesh ref={ref} position={[0, 0.06, 0]}>
            <cylinderGeometry args={[1.8, 1.5, 0.04, 64]} />
            <meshStandardMaterial color="#f97316" transparent opacity={0.5} />
        </mesh>
    );
}

/* ─── 비산 방울들 ─── */
function EjectedDroplets() {
    const dropletsRef = useRef<THREE.Group>(null);
    const dropletData = useMemo(() => {
        const data = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            data.push({ angle, speed: 0.5 + Math.random() * 0.5, size: 0.04 + Math.random() * 0.04 });
        }
        return data;
    }, []);

    useFrame((state) => {
        if (dropletsRef.current) {
            const t = state.clock.elapsedTime;
            dropletsRef.current.children.forEach((child, i) => {
                const d = dropletData[i];
                const cycle = (t * d.speed + i * 0.3) % 1.5;
                const r = 2.2 + cycle * 1.5;
                child.position.set(
                    Math.cos(d.angle + t * 0.5) * r,
                    0.1 - cycle * 0.3,
                    Math.sin(d.angle + t * 0.5) * r
                );
                const s = Math.max(0, 1 - cycle);
                child.scale.setScalar(s);
            });
        }
    });

    return (
        <group ref={dropletsRef}>
            {dropletData.map((d, i) => (
                <mesh key={i}>
                    <sphereGeometry args={[d.size, 8, 8]} />
                    <meshStandardMaterial color="#f97316" transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    );
}

/* ─── 균일 PR 막 ─── */
function UniformFilm() {
    return (
        <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[2.18, 2.18, 0.03, 64]} />
            <meshStandardMaterial color="#f97316" transparent opacity={0.6} metalness={0.2} roughness={0.5} />
        </mesh>
    );
}

/* ─── 두께 라벨 ─── */
function ThicknessLabel() {
    return (
        <group position={[2.6, 0.06, 0]}>
            {/* 위 화살표 */}
            <mesh position={[0, 0.06, 0]}>
                <boxGeometry args={[0.3, 0.005, 0.005]} />
                <meshBasicMaterial color="#22c55e" />
            </mesh>
            {/* 아래 화살표 */}
            <mesh position={[0, -0.02, 0]}>
                <boxGeometry args={[0.3, 0.005, 0.005]} />
                <meshBasicMaterial color="#22c55e" />
            </mesh>
            {/* 세로선 */}
            <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[0.005, 0.08, 0.005]} />
                <meshBasicMaterial color="#22c55e" />
            </mesh>
        </group>
    );
}

/* ─── PR 웅덩이 (점차 커짐) ─── */
function PRPuddle() {
    const ref = useRef<THREE.Mesh>(null);
    const startTime = useRef<number | null>(null);
    useFrame((state) => {
        if (ref.current) {
            if (startTime.current === null) startTime.current = state.clock.elapsedTime;
            const elapsed = state.clock.elapsedTime - startTime.current;
            // 0 → 4초에 걸쳐 점차 커짐 (0.2 → 0.8 반경)
            const r = Math.min(0.2 + elapsed * 0.15, 0.8);
            ref.current.scale.set(r / 0.5, 1, r / 0.5);
        }
    });
    return (
        <mesh ref={ref} position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.5, 0.4, 0.05, 32]} />
            <meshStandardMaterial color="#f97316" transparent opacity={0.65} />
        </mesh>
    );
}

/* ─── 3D 씬 ─── */
function Scene({ step }: { step: StepId }) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 8, 5]} intensity={1} />
            <directionalLight position={[-3, 4, -3]} intensity={0.3} />

            <Chuck />
            <Wafer spinning={step === 2} />

            {step === 1 && (
                <>
                    <Nozzle />
                    <PRDroplet />
                    <PRPuddle />
                </>
            )}

            {step === 2 && (
                <>
                    <PRSpreading />
                    <EjectedDroplets />
                </>
            )}

            {step === 3 && (
                <UniformFilm />
            )}

            <OrbitControls
                enablePan={false}
                minDistance={4}
                maxDistance={10}
                target={[0, 0.3, 0]}
                autoRotate={step === 3}
                autoRotateSpeed={2}
            />
        </>
    );
}

/* ─── 메인 컴포넌트 ─── */
export default function SpinCoatingCrossSection() {
    const [step, setStep] = useState<StepId>(1);

    return (
        <div className="my-8 relative">
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                스핀 코팅 원리
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Spin Coating — 3D Interactive
            </p>

            {/* 3D Canvas */}
            <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)', background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f17 100%)' }}>
                <Canvas camera={{ position: [4, 3, 4], fov: 40 }}>
                    <Scene step={step} />
                </Canvas>
            </div>

            {/* 단계 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
                {([1, 2, 3] as StepId[]).map(s => {
                    const info = STEPS[s];
                    const active = step === s;
                    return (
                        <button key={s} onClick={() => setStep(s)}
                            style={{ cursor: 'pointer', padding: '6px 14px', borderRadius: 8, border: 'none',
                                background: active ? `${info.color}22` : 'rgba(255,255,255,0.03)',
                                outline: `1px solid ${active ? info.color : 'rgba(255,255,255,0.08)'}`,
                                transition: 'all 0.15s', color: active ? info.color : COLOR.textDim,
                                fontSize: FONT.small, fontWeight: active ? 700 : 400 }}>
                            {info.label}
                        </button>
                    );
                })}
            </div>

            {/* 설명 */}
            <div style={{ maxWidth: 600, margin: '8px auto 0', height: 72 }}>
                <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                        style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: STEPS[step].color, marginBottom: 2 }}>
                            {STEPS[step].label} — {STEPS[step].sub}
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                            {STEPS[step].desc}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
