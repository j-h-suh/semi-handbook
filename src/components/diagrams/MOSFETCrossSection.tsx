'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PartId = 'source' | 'drain' | 'gate' | 'oxide' | 'channel' | 'substrate' | 'contact' | null;

interface PartInfo {
  label: string;
  desc: string;
}

const partDescriptions: Record<Exclude<PartId, null>, PartInfo> = {
  source: {
    label: 'N+ 소스 (Source)',
    desc: '캐리어(전자)가 출발하는 N형 고농도 도핑 영역. "원천"이라는 뜻.',
  },
  drain: {
    label: 'N+ 드레인 (Drain)',
    desc: '캐리어(전자)가 도착하여 빠져나가는 N형 고농도 도핑 영역. "배수구"라는 뜻.',
  },
  gate: {
    label: '게이트 전극 (Gate)',
    desc: '전압을 인가하여 채널의 ON/OFF를 제어하는 금속 전극',
  },
  oxide: {
    label: '게이트 산화막 (Gate Oxide)',
    desc: '게이트와 채널을 절연시키는 SiO₂ 박막 (수 nm 두께)',
  },
  channel: {
    label: '반전층 / 채널 (Channel)',
    desc: '게이트 전압에 의해 캐리어(전자)가 모여 소스→드레인으로 이동하는 통로',
  },
  substrate: {
    label: 'P-type 기판 (Substrate)',
    desc: '트랜지스터가 만들어지는 P형 실리콘 기판',
  },
  contact: {
    label: '금속 접점 (Contact)',
    desc: '외부 회로와 연결되는 금속 배선 접점',
  },
};

export default function MOSFETCrossSection() {
  const [hoveredPart, setHoveredPart] = useState<PartId>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleHover = (part: PartId) => {
    setHoveredPart(part);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
    const svg = e.currentTarget.closest('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const isActive = (part: PartId) => hoveredPart === part;
  const isDimmed = (part: PartId) => hoveredPart !== null && hoveredPart !== part;

  // Color palette for dark theme
  const colors = {
    substrate: { fill: 'rgba(100, 160, 220, 0.15)', stroke: '#4a7fb5', text: '#7ab3e0' },
    source: { fill: '#dc2626', stroke: '#991b1b', text: '#fca5a5' },
    drain: { fill: '#dc2626', stroke: '#991b1b', text: '#fca5a5' },
    gate: { fill: '#6b7280', stroke: '#4b5563', text: '#d1d5db' },
    oxide: { fill: 'rgba(253, 224, 71, 0.25)', stroke: '#ca8a04', text: '#fde047' },
    channel: { fill: 'rgba(56, 189, 248, 0.3)', stroke: '#0ea5e9', text: '#7dd3fc' },
    contact: { fill: '#52525b', stroke: '#3f3f46', text: '#a1a1aa' },
  };

  return (
    <div className="flex justify-center my-8">
      <div className="relative w-full max-w-[700px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 700 470"
          className="w-full h-auto"
          onMouseLeave={() => setHoveredPart(null)}
        >
          <defs>
            <marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
            </marker>
            <marker id="ah-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#f87171" />
            </marker>
            <marker id="ah-blue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#60a5fa" />
            </marker>
            <marker id="ah-green" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#4ade80" />
            </marker>
          </defs>

          {/* Title */}
          <text
            x="350"
            y="30"
            textAnchor="middle"
            className="fill-zinc-200 text-lg font-bold"
            style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: '18px', fontWeight: 'bold' }}
          >
            MOSFET 단면 구조도
          </text>

          {/* Main Drawing Group */}
          <g transform="translate(50, 25)">

            {/* ==================== P-type Substrate ==================== */}
            <motion.g
              onMouseEnter={() => handleHover('substrate')}
              onMouseMove={handleMouseMove}
              style={{ cursor: 'pointer' }}
              animate={{
                opacity: isDimmed('substrate') ? 0.35 : 1,
                scale: isActive('substrate') ? 1.005 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <rect
                x="60" y="240" width="480" height="120"
                fill={isActive('substrate') ? 'rgba(100, 160, 220, 0.25)' : colors.substrate.fill}
                stroke={colors.substrate.stroke}
                strokeWidth="1.5"
                rx="2"
              />
              <text x="300" y="320" textAnchor="middle" fill={colors.substrate.text}
                style={{ fontSize: '12px', fontWeight: 'bold' }}>
                P-type 기판
              </text>
              <text x="300" y="336" textAnchor="middle" fill={colors.substrate.text}
                style={{ fontSize: '9px', opacity: 0.7 }}>
                (P-type Si Substrate)
              </text>

            </motion.g>

            {/* ==================== N+ Source Region ==================== */}
            <motion.g
              onMouseEnter={() => handleHover('source')}
              onMouseMove={handleMouseMove}
              style={{ cursor: 'pointer' }}
              animate={{
                opacity: isDimmed('source') ? 0.35 : 1,
                scale: isActive('source') ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <rect
                x="100" y="200" width="120" height="70"
                fill={isActive('source') ? '#ef4444' : colors.source.fill}
                stroke={colors.source.stroke}
                strokeWidth="1.5"
                rx="2"
              />
              <text x="160" y="232" textAnchor="middle" fill="#fff"
                style={{ fontSize: '12px', fontWeight: 'bold' }}>
                N+ 소스
              </text>
              <text x="160" y="248" textAnchor="middle" fill="rgba(255,255,255,0.6)"
                style={{ fontSize: '9px' }}>
                (N+ Source)
              </text>
            </motion.g>

            {/* ==================== N+ Drain Region ==================== */}
            <motion.g
              onMouseEnter={() => handleHover('drain')}
              onMouseMove={handleMouseMove}
              style={{ cursor: 'pointer' }}
              animate={{
                opacity: isDimmed('drain') ? 0.35 : 1,
                scale: isActive('drain') ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <rect
                x="380" y="200" width="120" height="70"
                fill={isActive('drain') ? '#ef4444' : colors.drain.fill}
                stroke={colors.drain.stroke}
                strokeWidth="1.5"
                rx="2"
              />
              <text x="440" y="232" textAnchor="middle" fill="#fff"
                style={{ fontSize: '12px', fontWeight: 'bold' }}>
                N+ 드레인
              </text>
              <text x="440" y="248" textAnchor="middle" fill="rgba(255,255,255,0.6)"
                style={{ fontSize: '9px' }}>
                (N+ Drain)
              </text>
            </motion.g>

            {/* ==================== Channel Region ==================== */}
            <motion.g
              onMouseEnter={() => handleHover('channel')}
              onMouseMove={handleMouseMove}
              style={{ cursor: 'pointer' }}
              animate={{
                opacity: isDimmed('channel') ? 0.35 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <rect
                x="220" y="200" width="160" height="40"
                fill={isActive('channel') ? 'rgba(56, 189, 248, 0.5)' : colors.channel.fill}
                stroke={colors.channel.stroke}
                strokeWidth="1"
              />
              {/* Channel label with arrow */}
              <line x1="300" y1="268" x2="300" y2="242" stroke="#9ca3af" strokeWidth="1.2" markerEnd="url(#ah)" />
              <text x="300" y="280" textAnchor="middle" fill={colors.channel.text}
                style={{ fontSize: '12px', fontWeight: 'bold' }}>
                반전층 (채널)
              </text>
              <text x="300" y="293" textAnchor="middle" fill={colors.channel.text}
                style={{ fontSize: '9px', opacity: 0.7 }}>
                (Inversion Layer)
              </text>
            </motion.g>

            {/* ==================== Gate Oxide (SiO₂) ==================== */}
            <motion.g
              onMouseEnter={() => handleHover('oxide')}
              onMouseMove={handleMouseMove}
              style={{ cursor: 'pointer' }}
              animate={{
                opacity: isDimmed('oxide') ? 0.35 : 1,
                scale: isActive('oxide') ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <rect
                x="200" y="170" width="200" height="30"
                fill={isActive('oxide') ? 'rgba(253, 224, 71, 0.4)' : colors.oxide.fill}
                stroke={colors.oxide.stroke}
                strokeWidth="1.5"
                rx="1"
              />
              <text x="300" y="190" textAnchor="middle" fill={colors.oxide.text}
                style={{ fontSize: '12px', fontWeight: 'bold' }}>
                게이트 산화막
              </text>
            </motion.g>

            {/* ==================== Gate Electrode ==================== */}
            <motion.g
              onMouseEnter={() => handleHover('gate')}
              onMouseMove={handleMouseMove}
              style={{ cursor: 'pointer' }}
              animate={{
                opacity: isDimmed('gate') ? 0.35 : 1,
                scale: isActive('gate') ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <rect
                x="210" y="110" width="180" height="60"
                fill={isActive('gate') ? '#71717a' : colors.gate.fill}
                stroke={colors.gate.stroke}
                strokeWidth="1.5"
                rx="3"
              />
              {/* Metal grain texture */}
              <line x1="230" y1="125" x2="260" y2="125" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              <line x1="280" y1="135" x2="320" y2="135" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              <text x="300" y="137" textAnchor="middle" fill="#fff"
                style={{ fontSize: '12px', fontWeight: 'bold' }}>
                게이트 전극
              </text>
              <text x="300" y="153" textAnchor="middle" fill="rgba(255,255,255,0.5)"
                style={{ fontSize: '9px' }}>
                (Metal/Poly-Si)
              </text>
            </motion.g>

            {/* ==================== Metal Contacts ==================== */}
            <motion.g
              onMouseEnter={() => handleHover('contact')}
              onMouseMove={handleMouseMove}
              style={{ cursor: 'pointer' }}
              animate={{
                opacity: isDimmed('contact') ? 0.35 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {/* Source contact */}
              <rect x="140" y="170" width="40" height="30" fill={colors.contact.fill} stroke={colors.contact.stroke} strokeWidth="1" rx="1" />
              <rect x="152" y="80" width="16" height="90" fill={colors.contact.fill} stroke={colors.contact.stroke} strokeWidth="1" />
              <circle cx="160" cy="70" r="14" fill={colors.contact.fill} stroke={colors.contact.stroke} strokeWidth="1.5" />
              <text x="160" y="75" textAnchor="middle" fill="#fff"
                style={{ fontSize: '12px', fontWeight: 'bold' }}>
                S
              </text>

              {/* Drain contact */}
              <rect x="420" y="170" width="40" height="30" fill={colors.contact.fill} stroke={colors.contact.stroke} strokeWidth="1" rx="1" />
              <rect x="432" y="80" width="16" height="90" fill={colors.contact.fill} stroke={colors.contact.stroke} strokeWidth="1" />
              <circle cx="440" cy="70" r="14" fill={colors.contact.fill} stroke={colors.contact.stroke} strokeWidth="1.5" />
              <text x="440" y="75" textAnchor="middle" fill="#fff"
                style={{ fontSize: '12px', fontWeight: 'bold' }}>
                D
              </text>

              {/* Gate contact */}
              <rect x="292" y="80" width="16" height="30" fill={colors.contact.fill} stroke={colors.contact.stroke} strokeWidth="1" />
              <circle cx="300" cy="70" r="14" fill={colors.contact.fill} stroke={colors.contact.stroke} strokeWidth="1.5" />
              <text x="300" y="75" textAnchor="middle" fill="#fff"
                style={{ fontSize: '12px', fontWeight: 'bold' }}>
                G
              </text>
            </motion.g>



            {/* ==================== Arrows ==================== */}
            {/* Vg Arrow */}
            <line x1="300" y1="30" x2="300" y2="52" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#ah-red)" />
            <text x="300" y="25" textAnchor="middle" fill="#f87171"
              style={{ fontSize: '12px', fontWeight: 'bold' }}>
              Vg
            </text>

            {/* e⁻ Arrow (Source to Drain) — electron flow through channel */}
            <line x1="230" y1="213" x2="368" y2="213" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#ah-green)" />
            <text x="300" y="210" textAnchor="middle" fill="#4ade80"
              style={{ fontSize: '11px', fontWeight: 'bold' }}>
              e⁻
            </text>

            {/* Id Arrow (Drain to Source) — conventional current */}
            <line x1="370" y1="230" x2="232" y2="230" stroke="#60a5fa" strokeWidth="1.5" markerEnd="url(#ah-blue)" />
            <text x="300" y="228" textAnchor="middle" fill="#60a5fa"
              style={{ fontSize: '11px', fontWeight: 'bold' }}>
              Id
            </text>
          </g>

          {/* ==================== Legend Box ==================== */}
          <g transform="translate(100, 395)">
            <rect x="0" y="0" width="500" height="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" rx="4" />

            {/* Row 1: Color swatches — centered, 25px gap after text-end */}
            <rect x="82" y="8" width="14" height="14" fill={colors.substrate.fill} stroke={colors.substrate.stroke} strokeWidth="0.8" rx="1" />
            <text x="102" y="20" fill="#9ca3af" textAnchor="start" style={{ fontSize: '10px' }}>P-Sub</text>

            <rect x="155" y="8" width="14" height="14" fill={colors.source.fill} stroke={colors.source.stroke} strokeWidth="0.8" rx="1" />
            <text x="175" y="20" fill="#9ca3af" textAnchor="start" style={{ fontSize: '10px' }}>N+</text>

            <rect x="214" y="8" width="14" height="14" fill={colors.oxide.fill} stroke={colors.oxide.stroke} strokeWidth="0.8" rx="1" />
            <text x="234" y="20" fill="#9ca3af" textAnchor="start" style={{ fontSize: '10px' }}>Oxide</text>

            <rect x="287" y="8" width="14" height="14" fill={colors.gate.fill} stroke={colors.gate.stroke} strokeWidth="0.8" rx="1" />
            <text x="307" y="20" fill="#9ca3af" textAnchor="start" style={{ fontSize: '10px' }}>Gate</text>

            <rect x="356" y="8" width="14" height="14" fill={colors.channel.fill} stroke={colors.channel.stroke} strokeWidth="0.8" rx="1" />
            <text x="376" y="20" fill="#9ca3af" textAnchor="start" style={{ fontSize: '10px' }}>Channel</text>

            {/* Row 2: Flow arrows — centered */}
            <line x1="37" y1="38" x2="65" y2="38" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#ah-green)" />
            <text x="75" y="42" fill="#9ca3af" textAnchor="start" style={{ fontSize: '10px' }}>e⁻ 전자 흐름 (Source → Drain)</text>

            <line x1="275" y1="38" x2="303" y2="38" stroke="#60a5fa" strokeWidth="1.5" markerEnd="url(#ah-blue)" />
            <text x="313" y="42" fill="#9ca3af" textAnchor="start" style={{ fontSize: '10px' }}>Id 전류 방향 (Drain → Source)</text>
          </g>
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredPart && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute pointer-events-none z-50"
              style={{
                left: Math.min(tooltipPos.x + 16, 440),
                top: tooltipPos.y - 60,
              }}
            >
              <div className="bg-zinc-800/95 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 shadow-xl max-w-[240px]">
                <p className="text-cyan-400 font-semibold text-sm mb-1">
                  {partDescriptions[hoveredPart].label}
                </p>
                <p className="text-zinc-300 text-xs leading-relaxed">
                  {partDescriptions[hoveredPart].desc}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
