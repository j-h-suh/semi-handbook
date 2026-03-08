'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT, COLOR } from './diagramTokens';

type Problem = 'litho' | 'depo' | 'metal' | null;

const problems: Record<Exclude<Problem, null>, { label: string; sub: string; desc: string; accent: string }> = {
    litho: {
        label: '① 포토리소그래피 실패',
        sub: 'Focus Failure',
        desc: '이 울퉁불퉁한 표면 위에 다음 층의 PR을 바르고 노광하면, 초점 깊이(DOF)가 수백 nm에 불과한 최신 장비에서 단차 영역의 초점이 맞지 않아 패턴이 흐려지거나 형성되지 않는다.',
        accent: '#ef4444',
    },
    metal: {
        label: '② 배선 단선',
        sub: 'Metal Line Break',
        desc: '금속 배선을 PVD로 증착하면 단차 모서리에서 극도로 얇아지거나 아예 끊어진다(Open). 회로가 정상 동작할 수 없다.',
        accent: '#a78bfa',
    },
    depo: {
        label: '③ 증착 불균일',
        sub: 'Non-uniform Deposition',
        desc: '금속 위에 ILD(층간 절연막)를 CVD로 증착하면, 높은 곳은 얇고 낮은 곳은 두껍게 쌓여 두께가 불균일해진다. 같은 웨이퍼 위의 소자들이 서로 다른 전기적 특성을 갖게 된다.',
        accent: '#f59e0b',
    },
};

/* ─── Geometry constants ─── */
const W = 680, H = 420;
const PAD_L = 50, PAD_R = 50;
const CONTENT_W = W - PAD_L - PAD_R;

/* Cross-section Y positions (top-down) */
const TOP_MARGIN = 80;
const SUBSTRATE_H = 50;
const OXIDE_H_LOW = 50;      // oxide height on flat areas
const STEP_H = 60;           // step height (key visual element!)
const OXIDE_H_HIGH = OXIDE_H_LOW + STEP_H; // total oxide at step
const METAL_THICK = 14;
const ILD_THICK_FLAT = 35;
const ILD_THICK_STEP = 18;   // thinner on step = problem ②

/* Bottom of substrate */
const SUBSTRATE_TOP = H - 60 - SUBSTRATE_H;
const OXIDE_BASE = SUBSTRATE_TOP;              // oxide sits on substrate
const FLAT_TOP = OXIDE_BASE - OXIDE_H_LOW;     // top of flat oxide
const STEP_TOP = OXIDE_BASE - OXIDE_H_HIGH;    // top of step

/* Step positions (two steps, symmetric about center) */
const STEP_W = 100;
const STEP_GAP = 120;
const CENTER_X = W / 2;
const S1_L = CENTER_X - STEP_GAP / 2 - STEP_W;
const S1_R = CENTER_X - STEP_GAP / 2;
const S2_L = CENTER_X + STEP_GAP / 2;
const S2_R = CENTER_X + STEP_GAP / 2 + STEP_W;

/* Slope offset for realistic sidewalls */
const SLOPE = 8;

function SubstratePath() {
    return (
        <rect x={PAD_L} y={SUBSTRATE_TOP} width={CONTENT_W} height={SUBSTRATE_H}
            fill="#3b82f6" opacity={0.5} rx={2} />
    );
}

function OxidePath() {
    // Oxide layer with two raised steps (gate-like structures)
    const d = `
        M${PAD_L},${OXIDE_BASE}
        L${PAD_L},${FLAT_TOP}
        L${S1_L},${FLAT_TOP}
        L${S1_L + SLOPE},${STEP_TOP}
        L${S1_R - SLOPE},${STEP_TOP}
        L${S1_R},${FLAT_TOP}
        L${S2_L},${FLAT_TOP}
        L${S2_L + SLOPE},${STEP_TOP}
        L${S2_R - SLOPE},${STEP_TOP}
        L${S2_R},${FLAT_TOP}
        L${PAD_L + CONTENT_W},${FLAT_TOP}
        L${PAD_L + CONTENT_W},${OXIDE_BASE}
        Z`;
    return <path d={d} fill="#7c3aed" opacity={0.3} />;
}

function MetalPath() {
    const t = METAL_THICK;
    const thinEdge = 4; // thin at slope faces only
    // Outer contour (top of metal), then inner contour (bottom = oxide surface)
    // Flat sections: uniform thickness t
    // Slope faces: thickness drops to thinEdge
    const d = `
        M${PAD_L},${FLAT_TOP - t}
        L${S1_L},${FLAT_TOP - t}
        L${S1_L + SLOPE},${STEP_TOP - thinEdge}
        L${S1_L + SLOPE + 4},${STEP_TOP - t}
        L${S1_R - SLOPE - 4},${STEP_TOP - t}
        L${S1_R - SLOPE},${STEP_TOP - thinEdge}
        L${S1_R},${FLAT_TOP - t}
        L${S2_L},${FLAT_TOP - t}
        L${S2_L + SLOPE},${STEP_TOP - thinEdge}
        L${S2_L + SLOPE + 4},${STEP_TOP - t}
        L${S2_R - SLOPE - 4},${STEP_TOP - t}
        L${S2_R - SLOPE},${STEP_TOP - thinEdge}
        L${S2_R},${FLAT_TOP - t}
        L${PAD_L + CONTENT_W},${FLAT_TOP - t}
        L${PAD_L + CONTENT_W},${FLAT_TOP}
        L${S2_R},${FLAT_TOP}
        L${S2_R - SLOPE},${STEP_TOP}
        L${S2_L + SLOPE},${STEP_TOP}
        L${S2_L},${FLAT_TOP}
        L${S1_R},${FLAT_TOP}
        L${S1_R - SLOPE},${STEP_TOP}
        L${S1_L + SLOPE},${STEP_TOP}
        L${S1_L},${FLAT_TOP}
        L${PAD_L},${FLAT_TOP}
        Z`;
    return <path d={d} fill="#f59e0b" opacity={0.65} />;
}

function ILDPath() {
    const thk = ILD_THICK_FLAT;
    const thn = ILD_THICK_STEP;
    const t = METAL_THICK;
    const thinEdge = 4;

    const topFlat = FLAT_TOP - t - thk;
    const topStep = STEP_TOP - t - thn;
    const topStepEdge = STEP_TOP - thinEdge - thn;

    // Top contour (ILD surface, left→right), then
    // Bottom contour (metal top surface, right→left) to close
    const d = `
        M${PAD_L},${topFlat}
        L${S1_L},${topFlat}
        L${S1_L + SLOPE},${topStepEdge}
        L${S1_L + SLOPE + 4},${topStep}
        L${S1_R - SLOPE - 4},${topStep}
        L${S1_R - SLOPE},${topStepEdge}
        L${S1_R},${topFlat}
        L${S2_L},${topFlat}
        L${S2_L + SLOPE},${topStepEdge}
        L${S2_L + SLOPE + 4},${topStep}
        L${S2_R - SLOPE - 4},${topStep}
        L${S2_R - SLOPE},${topStepEdge}
        L${S2_R},${topFlat}
        L${PAD_L + CONTENT_W},${topFlat}
        L${PAD_L + CONTENT_W},${FLAT_TOP - t}
        L${S2_R},${FLAT_TOP - t}
        L${S2_R - SLOPE},${STEP_TOP - thinEdge}
        L${S2_R - SLOPE - 4},${STEP_TOP - t}
        L${S2_L + SLOPE + 4},${STEP_TOP - t}
        L${S2_L + SLOPE},${STEP_TOP - thinEdge}
        L${S2_L},${FLAT_TOP - t}
        L${S1_R},${FLAT_TOP - t}
        L${S1_R - SLOPE},${STEP_TOP - thinEdge}
        L${S1_R - SLOPE - 4},${STEP_TOP - t}
        L${S1_L + SLOPE + 4},${STEP_TOP - t}
        L${S1_L + SLOPE},${STEP_TOP - thinEdge}
        L${S1_L},${FLAT_TOP - t}
        L${PAD_L},${FLAT_TOP - t}
        Z`;
    return <path d={d} fill="#22c55e" opacity={0.25} />;
}

/* ─── Label layout constants ─── */
const LABEL_Y = 22;           // same Y for all 3 labels
const LABEL_SUB_Y = LABEL_Y + 16;
const LABEL_X1 = W * 0.18;    // ① left third
const LABEL_X2 = W * 0.50;    // ② center
const LABEL_X3 = W * 0.82;    // ③ right third

export default function CMPNecessity() {
    const [hovered, setHovered] = useState<Problem>(null);

    const t = METAL_THICK;
    const thk = ILD_THICK_FLAT;
    const thn = ILD_THICK_STEP;
    const thinEdge = 4;
    const topFlat = FLAT_TOP - t - thk;
    const topStep = STEP_TOP - t - thn;

    return (
        <div className="my-8 relative" onMouseLeave={() => setHovered(null)}>
            <h3 style={{ textAlign: 'center', color: COLOR.textBright, fontSize: FONT.title, fontWeight: 700, marginBottom: 4 }}>
                CMP 없이 적층하면 발생하는 3가지 문제
            </h3>
            <p style={{ textAlign: 'center', color: COLOR.textDim, fontSize: FONT.subtitle, marginBottom: 8 }}>
                Three Critical Problems Without Planarization
            </p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 780, margin: '0 auto', display: 'block' }}>
                {/* ─── Layers ─── */}
                <SubstratePath />
                <OxidePath />

                {/* ─── Problem labels — same Y, equal spacing ─── */}
                <g onMouseEnter={() => setHovered('litho')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: hovered !== null && hovered !== 'litho' ? 0.25 : 1 }} transition={{ duration: 0.2 }}>
                        <text x={LABEL_X1} y={LABEL_Y} textAnchor="middle" fontSize={FONT.body} fill="#ef4444" fontWeight={700}>① 초점 실패</text>
                        <text x={LABEL_X1} y={LABEL_SUB_Y} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>다음 층 리소 실패</text>
                        {/* Leader line down to cross-section */}
                        <line x1={LABEL_X1} y1={LABEL_SUB_Y + 6} x2={(S1_L + S1_R) / 2} y2={topStep - 4} stroke="#ef4444" strokeWidth={1} strokeDasharray="3,2" opacity={0.4} />
                    </motion.g>
                </g>
                <g onMouseEnter={() => setHovered('metal')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: hovered !== null && hovered !== 'metal' ? 0.25 : 1 }} transition={{ duration: 0.2 }}>
                        <text x={LABEL_X2} y={LABEL_Y} textAnchor="middle" fontSize={FONT.body} fill="#a78bfa" fontWeight={700}>② 배선 단선</text>
                        <text x={LABEL_X2} y={LABEL_SUB_Y} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>모서리에서 얇아짐</text>
                        {/* Leader line down to break point */}
                        <line x1={LABEL_X2} y1={LABEL_SUB_Y + 6} x2={S2_L + SLOPE + 2} y2={STEP_TOP - thinEdge - 10} stroke="#a78bfa" strokeWidth={1} strokeDasharray="3,2" opacity={0.4} />
                    </motion.g>
                </g>
                <g onMouseEnter={() => setHovered('depo')} style={{ cursor: 'pointer' }}>
                    <motion.g animate={{ opacity: hovered !== null && hovered !== 'depo' ? 0.25 : 1 }} transition={{ duration: 0.2 }}>
                        <text x={LABEL_X3} y={LABEL_Y} textAnchor="middle" fontSize={FONT.body} fill="#f59e0b" fontWeight={700}>③ 증착 불균일</text>
                        <text x={LABEL_X3} y={LABEL_SUB_Y} textAnchor="middle" fontSize={FONT.min} fill={COLOR.textDim}>t₁ ≫ t₂</text>
                    </motion.g>
                </g>

                {/* ─── Metal layer ─── */}
                <motion.g animate={{ opacity: hovered !== null && hovered !== 'metal' ? 0.25 : 1 }} transition={{ duration: 0.2 }}>
                    <MetalPath />
                    {/* Crack indicator at step edge */}
                    <circle cx={S2_L + SLOPE + 2} cy={STEP_TOP - thinEdge} r={8} fill="none" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="3,2" />
                    <text x={S2_L + SLOPE + 2} y={STEP_TOP - thinEdge + 3} textAnchor="middle" fontSize={FONT.min} fill="#ef4444" fontWeight={700}>✕</text>
                </motion.g>

                {/* ─── ILD layer ─── */}
                <motion.g animate={{ opacity: hovered !== null && hovered !== 'depo' ? 0.25 : 1 }} transition={{ duration: 0.2 }}>
                    <ILDPath />
                    {/* t₁ arrow — thick on flat (right of S2) */}
                    <line x1={S2_R + 20} y1={topFlat} x2={S2_R + 20} y2={FLAT_TOP - t} stroke="#f59e0b" strokeWidth={1.5} />
                    <line x1={S2_R + 15} y1={topFlat} x2={S2_R + 25} y2={topFlat} stroke="#f59e0b" strokeWidth={1.5} />
                    <line x1={S2_R + 15} y1={FLAT_TOP - t} x2={S2_R + 25} y2={FLAT_TOP - t} stroke="#f59e0b" strokeWidth={1.5} />
                    <text x={S2_R + 30} y={(topFlat + FLAT_TOP - t) / 2 + 4} fontSize={FONT.min} fill="#f59e0b" fontWeight={600}>t₁</text>
                    {/* t₂ arrow — thin on step (S2 midpoint) */}
                    <line x1={(S2_L + S2_R) / 2} y1={topStep} x2={(S2_L + S2_R) / 2} y2={STEP_TOP - t} stroke="#f59e0b" strokeWidth={1.5} />
                    <line x1={(S2_L + S2_R) / 2 - 5} y1={topStep} x2={(S2_L + S2_R) / 2 + 5} y2={topStep} stroke="#f59e0b" strokeWidth={1.5} />
                    <line x1={(S2_L + S2_R) / 2 - 5} y1={STEP_TOP - t} x2={(S2_L + S2_R) / 2 + 5} y2={STEP_TOP - t} stroke="#f59e0b" strokeWidth={1.5} />
                    <text x={(S2_L + S2_R) / 2 + 12} y={(topStep + STEP_TOP - t) / 2 + 4} fontSize={FONT.min} fill="#f59e0b" fontWeight={600}>t₂</text>
                </motion.g>

                {/* ─── DOF zone overlay ─── */}
                {/* DOF is a narrow band at the ILD surface — where next layer's PR would be applied */}
                {(() => {
                    const dofH = 16; // narrow DOF band
                    const dofY = topFlat - dofH / 2; // centered on flat ILD surface
                    return (
                        <motion.g animate={{ opacity: hovered !== null && hovered !== 'litho' ? 0.15 : 0.8 }} transition={{ duration: 0.2 }}>
                            <rect x={PAD_L} y={dofY} width={CONTENT_W} height={dofH}
                                fill="rgba(34,211,238,0.06)" stroke="#22d3ee" strokeWidth={1.5} strokeDasharray="6,3" rx={4} />
                            <text x={PAD_L + CONTENT_W + 4} y={dofY + dofH / 2 + 4} fontSize={FONT.min} fill="#22d3ee" fontWeight={600}>DOF</text>
                            {/* Step ILD surface — OUTSIDE the DOF band (higher up) */}
                            <line x1={S1_L + SLOPE} y1={topStep} x2={S1_R - SLOPE} y2={topStep} stroke="#ef4444" strokeWidth={2} opacity={0.7} />
                        </motion.g>
                    );
                })()}

                {/* Step height dimension line — at ILD surface level */}
                <line x1={S1_R + 10} y1={topFlat} x2={S1_R + 10} y2={topStep} stroke="#71717a" strokeWidth={1} />
                <line x1={S1_R + 5} y1={topFlat} x2={S1_R + 15} y2={topFlat} stroke="#71717a" strokeWidth={1} />
                <line x1={S1_R + 5} y1={topStep} x2={S1_R + 15} y2={topStep} stroke="#71717a" strokeWidth={1} />
                <text x={S1_R + 20} y={(topFlat + topStep) / 2 + 4} fontSize={FONT.min} fill={COLOR.textDim}>누적 단차</text>

                {/* Substrate label */}
                <text x={W / 2} y={SUBSTRATE_TOP + SUBSTRATE_H / 2 + 5} textAnchor="middle" fontSize={FONT.body} fill="rgba(255,255,255,0.7)" fontWeight={600}>Si 기판</text>

                {/* Legend */}
                <g transform={`translate(${W / 2 - 150}, ${H - 30})`}>
                    <rect x={0} y={0} width={14} height={14} fill="#3b82f6" opacity={0.5} rx={2} />
                    <text x={18} y={11} fontSize={FONT.min} fill={COLOR.textDim}>Si</text>
                    <rect x={50} y={0} width={14} height={14} fill="#7c3aed" opacity={0.3} rx={2} />
                    <text x={68} y={11} fontSize={FONT.min} fill={COLOR.textDim}>SiO₂</text>
                    <rect x={120} y={0} width={14} height={14} fill="#f59e0b" opacity={0.65} rx={2} />
                    <text x={138} y={11} fontSize={FONT.min} fill={COLOR.textDim}>Metal</text>
                    <rect x={195} y={0} width={14} height={14} fill="#22c55e" opacity={0.2} rx={2} />
                    <text x={213} y={11} fontSize={FONT.min} fill={COLOR.textDim}>ILD (층간 절연)</text>
                </g>
            </svg>

            <AnimatePresence>
                {hovered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: COLOR.tooltipBg, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', maxWidth: 480, pointerEvents: 'none', zIndex: 10 }}>
                        <div style={{ fontSize: FONT.cardHeader, fontWeight: 700, color: problems[hovered].accent, marginBottom: 4 }}>
                            {problems[hovered].label}
                            <span style={{ fontSize: FONT.min, fontWeight: 400, color: COLOR.textDim, marginLeft: 8 }}>{problems[hovered].sub}</span>
                        </div>
                        <div style={{ fontSize: FONT.small, color: COLOR.textMuted, lineHeight: 1.5 }}>{problems[hovered].desc}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
