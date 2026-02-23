#!/usr/bin/env python3
"""Regenerate meef_vs_k1.png — Bishop feedback: FAIL AREA label overlap, legend missing, x-axis spacing."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# ── Data from spec ──
k1_data = [0.80, 0.70, 0.60, 0.50, 0.45, 0.40, 0.35, 0.32, 0.30, 0.28]
meef_data = [0.9, 1.0, 1.1, 1.3, 1.6, 2.0, 2.5, 3.0, 3.5, 4.2]

# Smooth curve via interpolation
from scipy.interpolate import make_interp_spline
k1_smooth = np.linspace(0.25, 0.82, 300)
spl = make_interp_spline(k1_data[::-1], meef_data[::-1], k=3)
meef_smooth = spl(k1_smooth)

# ── Additional reference lines ──
# ArF immersion typical: k1 ~ 0.30-0.35
# EUV typical: k1 ~ 0.35-0.45
# Mature process: k1 > 0.5

fig, ax = plt.subplots(figsize=(10, 7))
fig.patch.set_facecolor('white')

# Danger zone (MEEF > 2, k1 < 0.35) — placed BEHIND the curve
ax.axvspan(0.25, 0.35, alpha=0.12, color='#FF4444', zorder=0)
ax.text(0.30, 0.65, '위험 영역\n(MEEF > 2)', fontsize=10, color='#c62828',
        ha='center', va='bottom', fontweight='bold',
        bbox=dict(boxstyle='round,pad=0.3', facecolor='#ffebee', edgecolor='#ef5350', alpha=0.9))

# Main MEEF curve
ax.plot(k1_smooth, meef_smooth, color='#d32f2f', linewidth=2.5, zorder=4,
        label='MEEF 곡선 (MEEF vs k₁)')

# Data points
ax.scatter(k1_data, meef_data, c='#d32f2f', s=50, zorder=5, edgecolors='white', linewidths=1,
           label='계산 데이터')

# MEEF = 1 reference
ax.axhline(y=1.0, color='#888', linestyle='--', linewidth=1.5, alpha=0.7, zorder=2)
ax.text(0.78, 1.05, 'MEEF = 1 (이상적: 증폭 없음)', fontsize=9, color='#666',
        ha='right', va='bottom')

# ArF immersion zone
ax.axvspan(0.28, 0.35, ymin=0, ymax=0.1, alpha=0.3, color='#4169E1')
ax.text(0.315, 0.42, 'ArF-i\n극미세', fontsize=8.5, color='#1a237e',
        ha='center', va='bottom', fontweight='bold')

# EUV zone
ax.axvspan(0.35, 0.50, ymin=0, ymax=0.1, alpha=0.3, color='#FF6347')
ax.text(0.425, 0.42, 'EUV\n미세 패턴', fontsize=8.5, color='#b71c1c',
        ha='center', va='bottom', fontweight='bold')

# Mature zone
ax.annotate('성숙 공정\nMEEF ≈ 1',
            xy=(0.70, 1.0), xytext=(0.72, 1.8),
            fontsize=10, color='#2e7d32', fontweight='bold',
            ha='center',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#e8f5e9', edgecolor='#43a047', alpha=0.9),
            arrowprops=dict(arrowstyle='->', color='#43a047', lw=1.5))

# EUV annotation
ax.annotate('EUV 미세 패턴:\nMEEF 2~4\n마스크 1nm → 웨이퍼 2~4nm',
            xy=(0.32, 3.0), xytext=(0.50, 4.0),
            fontsize=9.5, color='#c62828',
            ha='center',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#fff3e0', edgecolor='#ff9800', alpha=0.9),
            arrowprops=dict(arrowstyle='->', color='#ff9800', lw=1.5))

# k1 limit annotation
ax.annotate('k₁ → 0.25 이론 한계\nMEEF 급증 → 양산 불가',
            xy=(0.27, 4.5), xytext=(0.42, 4.8),
            fontsize=9, color='#c62828',
            ha='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#ffebee', edgecolor='#ef5350', alpha=0.9),
            arrowprops=dict(arrowstyle='->', color='#ef5350', lw=1.5))

# ── Axes ──
ax.set_xlabel('k₁ (공정 계수, Process Factor)', fontsize=13)
ax.set_ylabel('MEEF (마스크 오차 증폭 계수)', fontsize=13)
ax.set_title('MEEF vs k₁: 미세화에 따른 마스크 오차 증폭', fontsize=15, fontweight='bold', pad=12)
ax.set_xlim(0.25, 0.82)
ax.set_ylim(0.4, 5.2)
ax.invert_xaxis()  # k1 decreasing = more advanced (right to left)
ax.legend(loc='upper right', fontsize=10, framealpha=0.9)
ax.grid(alpha=0.15, linestyle='--')

# Sub-title with Rayleigh equation
ax.text(0.50, -0.10,
        'CD = k₁ × λ / NA    (k₁이 작을수록 해상도 한계에 근접)',
        fontsize=10, ha='center', va='top', color='#555',
        transform=ax.transAxes, style='italic')

plt.tight_layout()
out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/02_11/meef_vs_k1.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
