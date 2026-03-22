'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

/* ─── 레이어 데이터 ─── */
type LayerId = 'source' | 'ingest' | 'storage' | 'analytics' | 'serving' | null;

interface LayerInfo {
    label: string;
    sub: string;
    desc: string;
    color: string;
    items: string[];
}

const LAYERS: Record<Exclude<LayerId, null>, LayerInfo> = {
    source:    { label: '데이터 소스', sub: '장비 · 계측 · MES', desc: '장비 센서(EDA, 수십TB/일), 계측 장비(CD/OVL, 수십GB/일), MES(로트 이력, 수GB/일), 결함 검사(이미지, 수TB/일), 전기적 테스트(Bin, 수GB/일).', color: '#3b82f6', items: ['장비(EDA)', '계측(SECS/GEM)', 'MES', '결함 검사', '테스트'] },
    ingest:    { label: '수집 레이어', sub: 'Kafka · MQTT · ETL', desc: 'Apache Kafka로 실시간 스트리밍 수집, MQTT로 장비 통신, ETL Pipeline으로 배치 수집. 실시간 + 배치 이중 경로.', color: '#ef4444', items: ['Apache Kafka', 'MQTT', 'ETL Pipeline'] },
    storage:   { label: '저장 레이어', sub: 'TSDB · Lake · RDBMS', desc: '시계열DB(InfluxDB/TimescaleDB)로 FDC Trace 고속 저장, Data Lake(S3/HDFS/Parquet)로 원시 데이터 장기 보관, RDBMS(PostgreSQL/Oracle)로 MES 메타데이터 저장.', color: '#22c55e', items: ['TimescaleDB', 'Data Lake (S3)', 'PostgreSQL'] },
    analytics: { label: '분석 레이어', sub: 'Spark · Python · Feature Store', desc: 'Apache Spark/Dask로 대규모 데이터 처리 및 ML 학습, Python(scikit-learn, PyTorch)으로 VM/FDC/APC 모델 개발, Feature Store로 피처 관리 및 재사용.', color: '#f59e0b', items: ['Spark / Dask', 'Python (ML)', 'Feature Store'] },
    serving:   { label: '서빙 · 시각화', sub: 'API · Dashboard · MLOps', desc: 'FastAPI/TensorRT로 VM/APC 실시간 추론(수 초 이내), Grafana/Custom UI로 SPC 관리도 대시보드, MLflow로 모델 버전 관리 및 재학습 파이프라인.', color: '#a78bfa', items: ['FastAPI / TensorRT', 'Grafana / UI', 'MLflow'] },
};

const LAYER_ORDER: Exclude<LayerId, null>[] = ['source', 'ingest', 'storage', 'analytics', 'serving'];

/* ─── SVG 레이아웃 ─── */
const SVG_W = 800;
const SVG_H = 200;
const LAYER_W = 130;
const LAYER_H = 160;
const LAYER_GAP = 20;
const TOTAL_W = LAYER_ORDER.length * LAYER_W + (LAYER_ORDER.length - 1) * LAYER_GAP;
const START_X = (SVG_W - TOTAL_W) / 2;
const LAYER_Y = 20;

export default function ModernDataArch() {
    const [hovered, setHovered] = useState<LayerId>(null);
    const isDimmed = (id: Exclude<LayerId, null>) => hovered !== null && hovered !== id;

    return (
        <div className="mt-8 mb-12 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                현대 반도체 팹 데이터 아키텍처
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Kafka + TSDB + Data Lake + Spark — Hybrid Architecture
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: 800 }}>
                    {/* 레이어 간 화살표 */}
                    {LAYER_ORDER.slice(0, -1).map((_, i) => {
                        const x1 = START_X + (i + 1) * LAYER_W + i * LAYER_GAP;
                        const x2 = x1 + LAYER_GAP;
                        const cy = LAYER_Y + LAYER_H / 2;
                        return (
                            <g key={`arrow-${i}`}>
                                <line x1={x1 + 2} y1={cy} x2={x2 - 8} y2={cy} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
                                <polygon points={`${x2 - 2},${cy} ${x2 - 10},${cy - 4} ${x2 - 10},${cy + 4}`} fill="rgba(255,255,255,0.2)" />
                            </g>
                        );
                    })}

                    {/* 레이어 박스 */}
                    {LAYER_ORDER.map((id, i) => {
                        const x = START_X + i * (LAYER_W + LAYER_GAP);
                        const info = LAYERS[id];
                        const active = hovered === id;
                        const dimmed = isDimmed(id);

                        return (
                            <motion.g key={id}
                                onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}
                                animate={{ opacity: dimmed ? 0.2 : 1 }} transition={{ duration: 0.15 }} style={{ cursor: 'pointer' }}>
                                <rect x={x - 4} y={LAYER_Y - 4} width={LAYER_W + 8} height={LAYER_H + 8} fill="transparent" />
                                <rect x={x} y={LAYER_Y} width={LAYER_W} height={LAYER_H} rx={10}
                                    fill={active ? `${info.color}12` : 'rgba(255,255,255,0.02)'}
                                    stroke={active ? `${info.color}40` : 'rgba(255,255,255,0.06)'} strokeWidth={active ? 1.5 : 1} />
                                {/* 타이틀 */}
                                <text x={x + LAYER_W / 2} y={LAYER_Y + 18} textAnchor="middle"
                                    fill={active ? info.color : COLOR.textMuted} fontSize={FONT.min} fontWeight={700}>{info.label}</text>
                                {/* 항목 */}
                                {info.items.map((item, j) => (
                                    <text key={j} x={x + LAYER_W / 2} y={LAYER_Y + 40 + j * 22} textAnchor="middle"
                                        fill={COLOR.textDim} fontSize={FONT.min}>{item}</text>
                                ))}
                            </motion.g>
                        );
                    })}
                </svg>
            </div>


            {/* 툴팁 */}
            <div style={{ maxWidth: 640, margin: '8px auto 0', height: 52 }}>
                <AnimatePresence mode="wait">
                    {hovered ? (
                        <motion.div key={hovered} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: LAYERS[hovered].color, marginBottom: 2 }}>{LAYERS[hovered].label}</div>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{LAYERS[hovered].desc}</div>
                        </motion.div>
                    ) : (
                        <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                            style={{ background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px' }}>
                            <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>
                                각 레이어를 호버하여 하이브리드 데이터 아키텍처의 구성 요소를 확인하세요.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
