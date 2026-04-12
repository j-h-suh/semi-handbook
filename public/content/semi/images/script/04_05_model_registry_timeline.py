#!/usr/bin/env python3
"""Generate Model Registry Timeline SVG for 04_05 MLOps chapter."""

output_path = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/04_05/model_registry_timeline.svg"

svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340" width="800" height="340" font-family="'Apple SD Gothic Neo', 'AppleGothic', 'NanumGothic', Arial, sans-serif">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.15"/>
    </filter>
    <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="#e85d5d"/>
    </marker>
    <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="#2ecc71"/>
    </marker>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fafbfc"/>
      <stop offset="100%" stop-color="#f0f2f5"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="340" fill="url(#bgGrad)" rx="8"/>

  <!-- Title -->
  <text x="400" y="32" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">
    Model Registry 버전 타임라인
  </text>
  <text x="400" y="50" text-anchor="middle" font-size="10" fill="#888">
    Version Timeline — Production / Staging / Archived
  </text>

  <!-- Timeline week labels -->
  <text x="80"  y="85" text-anchor="middle" font-size="9" fill="#666">1월 W1</text>
  <text x="180" y="85" text-anchor="middle" font-size="9" fill="#666">1월 W2</text>
  <text x="280" y="85" text-anchor="middle" font-size="9" fill="#666">1월 W3</text>
  <text x="380" y="85" text-anchor="middle" font-size="9" fill="#666">1월 W4</text>
  <text x="480" y="85" text-anchor="middle" font-size="9" fill="#666">2월 W1</text>
  <text x="580" y="85" text-anchor="middle" font-size="9" fill="#666">2월 W2</text>
  <text x="680" y="85" text-anchor="middle" font-size="9" fill="#666">2월 W3</text>

  <!-- Timeline axis -->
  <line x1="50" y1="95" x2="750" y2="95" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Week tick marks -->
  <line x1="80"  y1="90" x2="80"  y2="100" stroke="#333" stroke-width="1.5"/>
  <line x1="180" y1="90" x2="180" y2="100" stroke="#333" stroke-width="1.5"/>
  <line x1="280" y1="90" x2="280" y2="100" stroke="#333" stroke-width="1.5"/>
  <line x1="380" y1="90" x2="380" y2="100" stroke="#333" stroke-width="1.5"/>
  <line x1="480" y1="90" x2="480" y2="100" stroke="#333" stroke-width="1.5"/>
  <line x1="580" y1="90" x2="580" y2="100" stroke="#333" stroke-width="1.5"/>
  <line x1="680" y1="90" x2="680" y2="100" stroke="#333" stroke-width="1.5"/>

  <!-- Timeline dots at version positions -->
  <!-- v1.0 at 01-15 ≈ Jan W2 midpoint → x=180 -->
  <circle cx="180" cy="95" r="6" fill="#cccccc" stroke="#999" stroke-width="1.5"/>
  <!-- v1.1 at 01-29 ≈ Jan W4 midpoint → x=380 -->
  <circle cx="380" cy="95" r="6" fill="#cccccc" stroke="#999" stroke-width="1.5"/>
  <!-- v2.0 at 02-12 ≈ Feb W2 midpoint → x=580 -->
  <circle cx="580" cy="95" r="7" fill="#2ecc71" stroke="#27ae60" stroke-width="2"/>
  <!-- v2.1 at 02-14 ≈ Feb W2~W3 → x=640 -->
  <circle cx="660" cy="95" r="6" fill="#f39c12" stroke="#e67e22" stroke-width="1.5"/>

  <!-- ============ Version Cards ============ -->

  <!-- v1.0 Card (Archived) - above timeline -->
  <rect x="105" y="110" width="150" height="78" rx="6" fill="white" stroke="#cccccc" stroke-width="1.5" filter="url(#shadow)"/>
  <rect x="105" y="110" width="150" height="22" rx="6" fill="#cccccc"/>
  <rect x="105" y="125" width="150" height="7" fill="#cccccc"/>
  <text x="180" y="126" text-anchor="middle" font-size="11" font-weight="bold" fill="#555">v1.0</text>
  <line x1="180" y1="95" x2="180" y2="110" stroke="#cccccc" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="115" y="148" font-size="9" fill="#666">📅 01-15 배포</text>
  <text x="115" y="162" font-size="9" fill="#666">📊 R² = 0.82</text>
  <text x="115" y="176" font-size="9" fill="#666">🔄 학습: Jan W1-2</text>
  <rect x="195" y="168" width="52" height="16" rx="3" fill="#eee" stroke="#ccc" stroke-width="0.5"/>
  <text x="221" y="179" text-anchor="middle" font-size="8" fill="#999">Archived</text>

  <!-- v1.1 Card (Archived) - above timeline -->
  <rect x="305" y="110" width="150" height="78" rx="6" fill="white" stroke="#cccccc" stroke-width="1.5" filter="url(#shadow)"/>
  <rect x="305" y="110" width="150" height="22" rx="6" fill="#cccccc"/>
  <rect x="305" y="125" width="150" height="7" fill="#cccccc"/>
  <text x="380" y="126" text-anchor="middle" font-size="11" font-weight="bold" fill="#555">v1.1</text>
  <line x1="380" y1="95" x2="380" y2="110" stroke="#cccccc" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="315" y="148" font-size="9" fill="#666">📅 01-29 배포</text>
  <text x="315" y="162" font-size="9" fill="#666">📊 R² = 0.85</text>
  <text x="315" y="176" font-size="9" fill="#666">🔄 학습: Jan W1-4</text>
  <rect x="395" y="168" width="52" height="16" rx="3" fill="#eee" stroke="#ccc" stroke-width="0.5"/>
  <text x="421" y="179" text-anchor="middle" font-size="8" fill="#999">Archived</text>

  <!-- v2.0 Card (Production) - above timeline -->
  <rect x="505" y="110" width="150" height="78" rx="6" fill="white" stroke="#2ecc71" stroke-width="2" filter="url(#shadow)"/>
  <rect x="505" y="110" width="150" height="22" rx="6" fill="#2ecc71"/>
  <rect x="505" y="125" width="150" height="7" fill="#2ecc71"/>
  <text x="580" y="126" text-anchor="middle" font-size="11" font-weight="bold" fill="white">v2.0 ✅</text>
  <line x1="580" y1="95" x2="580" y2="110" stroke="#2ecc71" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="515" y="148" font-size="9" fill="#333">📅 02-12 배포</text>
  <text x="515" y="162" font-size="9" fill="#333" font-weight="bold">📊 R² = 0.88</text>
  <text x="515" y="176" font-size="9" fill="#333">🔄 학습: Jan W3~Feb W2</text>
  <rect x="595" y="168" width="52" height="16" rx="3" fill="#d5f5e3" stroke="#2ecc71" stroke-width="0.5"/>
  <text x="621" y="179" text-anchor="middle" font-size="8" fill="#27ae60" font-weight="bold">Prod</text>

  <!-- v2.1 Card (Staging) - below timeline, shifted right -->
  <rect x="585" y="210" width="155" height="78" rx="6" fill="white" stroke="#f39c12" stroke-width="1.5" filter="url(#shadow)"/>
  <rect x="585" y="210" width="155" height="22" rx="6" fill="#f39c12"/>
  <rect x="585" y="225" width="155" height="7" fill="#f39c12"/>
  <text x="662" y="226" text-anchor="middle" font-size="11" font-weight="bold" fill="white">v2.1 🔬</text>
  <line x1="660" y1="95" x2="660" y2="210" stroke="#f39c12" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="595" y="248" font-size="9" fill="#333">📅 02-14 배포</text>
  <text x="595" y="262" font-size="9" fill="#333">📊 R² = 0.87</text>
  <text x="595" y="276" font-size="9" fill="#333">🔄 학습: Feb W1-2</text>
  <rect x="680" y="268" width="52" height="16" rx="3" fill="#fef3cd" stroke="#f39c12" stroke-width="0.5"/>
  <text x="706" y="279" text-anchor="middle" font-size="8" fill="#e67e22" font-weight="bold">Staging</text>

  <!-- Rollback arrow: v2.0 → v1.1 -->
  <path d="M 530 195 C 500 220, 470 220, 455 195" fill="none" stroke="#e85d5d" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrowRed)"/>
  <text x="480" y="228" text-anchor="middle" font-size="8" fill="#e85d5d" font-weight="bold">🔙 롤백 (수 분 내)</text>
  <text x="480" y="240" text-anchor="middle" font-size="7" fill="#e85d5d">필요 시 즉시 복귀</text>

  <!-- Deploy arrow: v2.1 → Production -->
  <path d="M 640 210 C 630 200, 620 195, 615 192" fill="none" stroke="#2ecc71" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrowGreen)"/>
  <text x="658" y="202" font-size="7" fill="#2ecc71" font-weight="bold">검증 통과 시 승격</text>

  <!-- Legend -->
  <rect x="30" y="300" width="740" height="32" rx="4" fill="white" stroke="#e0e0e0" stroke-width="1" opacity="0.9"/>
  <circle cx="60" cy="316" r="5" fill="#2ecc71" stroke="#27ae60" stroke-width="1"/>
  <text x="72" y="320" font-size="9" fill="#555">Production</text>
  <circle cx="160" cy="316" r="5" fill="#f39c12" stroke="#e67e22" stroke-width="1"/>
  <text x="172" y="320" font-size="9" fill="#555">Staging (검증 중)</text>
  <circle cx="290" cy="316" r="5" fill="#cccccc" stroke="#999" stroke-width="1"/>
  <text x="302" y="320" font-size="9" fill="#555">Archived</text>
  <line x1="380" y1="316" x2="410" y2="316" stroke="#e85d5d" stroke-width="1.5" stroke-dasharray="4,2"/>
  <text x="418" y="320" font-size="9" fill="#555">롤백 경로</text>
  <line x1="490" y1="316" x2="520" y2="316" stroke="#2ecc71" stroke-width="1.5" stroke-dasharray="4,2"/>
  <text x="528" y="320" font-size="9" fill="#555">승격 경로</text>

</svg>'''

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)

import os
size = os.path.getsize(output_path)
print(f"✅ Saved: {output_path}")
print(f"   Size: {size:,} bytes")
