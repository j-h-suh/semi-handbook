#!/usr/bin/env python3
"""Regenerate yield_rampup_scurve.png v3 — Bishop feedback:
   S-curve 변곡점 불명확(감쇠성장곡선에 가까움) → 더 뚜렷한 S자 형태
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# ── Proper S-curve with CLEAR inflection ──
t = np.linspace(0, 24, 500)
# Stronger sigmoid: start very low, sharp ramp, then saturate
y_min, y_max = 5, 95  # wider range = more visible S
t0 = 10  # inflection later for symmetry
k = 0.55  # steeper slope

y = y_min + (y_max - y_min) / (1 + np.exp(-k * (t - t0)))

# Inflection tangent line (derivative at t0)
slope_at_inflection = k * (y_max - y_min) / 4  # logistic derivative at midpoint
y_inflection = (y_min + y_max) / 2
tangent_t = np.linspace(t0 - 4, t0 + 4, 50)
tangent_y = y_inflection + slope_at_inflection * (tangent_t - t0)

# ── Phase boundaries ──
phase_bounds = [0, 4, 14, 20, 24]
phase_colors = ['#ffcdd2', '#c8e6c9', '#bbdefb', '#fff9c4']
phase_labels = ['초기 학습\n(R&D Qual)', '램프업\n(급속 개선)', '성숙\n(점진 개선)', '물리 한계\n(Plateau)']
phase_ranges = ['5–20%', '20–85%', '85–93%', '93%+']

# ── Figure ──
fig, ax = plt.subplots(figsize=(14, 7.5))
fig.patch.set_facecolor('white')

# Background zones
for i in range(4):
    ax.axvspan(phase_bounds[i], phase_bounds[i+1], alpha=0.22, color=phase_colors[i], zorder=0)

# Phase dividers
for b in phase_bounds[1:-1]:
    ax.axvline(x=b, color='#888', linestyle='--', lw=1, alpha=0.5)

# S-curve (thick)
ax.plot(t, y, 'k-', linewidth=3, zorder=4, label='수율 S-커브 (Yield S-Curve)')

# Tangent line at inflection (shows S-shape clearly)
ax.plot(tangent_t, tangent_y, 'r--', linewidth=1.5, alpha=0.7, zorder=3,
        label='변곡점 접선 (최대 기울기)')

# Inflection point
ax.plot(t0, y_inflection, 'ro', markersize=12, zorder=6, markeredgecolor='white', markeredgewidth=2)
ax.annotate('변곡점 (Inflection)\n최대 성장률 지점',
            xy=(t0, y_inflection), xytext=(t0 + 3.5, y_inflection - 15),
            fontsize=10.5, color='#d32f2f', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#ffebee', edgecolor='#d32f2f', alpha=0.95),
            arrowprops=dict(arrowstyle='->', color='#d32f2f', lw=2))

# AI value zone (shade the ramp-up area)
t_ai = np.linspace(5, 15, 200)
y_ai = y_min + (y_max - y_min) / (1 + np.exp(-k * (t_ai - t0)))
ax.fill_between(t_ai, 0, y_ai, alpha=0.08, color='#2e7d32', zorder=1)
ax.annotate('AI 가치가 가장 큰 구간\n(데이터 축적 + 패턴 발견)',
            xy=(9, 40), xytext=(15, 25),
            fontsize=10.5, color='#2e7d32', fontweight='bold',
            ha='center',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#e8f5e9', edgecolor='#2e7d32', alpha=0.95),
            arrowprops=dict(arrowstyle='->', color='#2e7d32', lw=1.5))

# Phase labels at bottom
from matplotlib.transforms import blended_transform_factory
trans = blended_transform_factory(ax.transData, ax.transAxes)
for i in range(4):
    cx = (phase_bounds[i] + phase_bounds[i+1]) / 2
    ax.text(cx, 0.06, f'{phase_labels[i]}\n({phase_ranges[i]})',
            ha='center', va='bottom', fontsize=9.5, fontweight='bold',
            transform=trans, linespacing=1.4,
            bbox=dict(boxstyle='round,pad=0.2', facecolor='white', alpha=0.7, edgecolor='none'))

# Key yield markers (horizontal dashed)
for yval, label in [(20, '20% (파일럿 목표)'), (85, '85% (양산 기준)'), (93, '93% (성숙)')]:
    ax.axhline(y=yval, color='#bbb', linestyle=':', lw=0.8, alpha=0.6)
    ax.text(24.2, yval, label, fontsize=8, va='center', color='#888')

ax.set_title('수율 램프업 S-커브 (Yield Ramp-up S-Curve)',
             fontsize=16, fontweight='bold', pad=15)
ax.set_xlabel('시간 (개월, Months)', fontsize=13)
ax.set_ylabel('다이 수율 (Die Yield, %)', fontsize=13)
ax.set_xlim(0, 24)
ax.set_ylim(0, 100)
ax.legend(loc='upper left', fontsize=10, framealpha=0.9)
ax.grid(alpha=0.12, linestyle='--')

plt.tight_layout()
out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/03_01/yield_rampup_scurve.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
