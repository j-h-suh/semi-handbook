#!/usr/bin/env python3
"""Regenerate ri_distribution_threshold.png — Bishop feedback applied (v2)."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.transforms import blended_transform_factory

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# ── RI data (right-skewed, most values 0.6~0.9) ──
np.random.seed(42)
ri_data = np.random.beta(5, 1.8, size=5000)
ri_data = ri_data[ri_data > 0.05]

thresh_agg = 0.5
thresh_con = 0.7

# ── Figure ──
fig, ax = plt.subplots(figsize=(14, 7.5))
fig.patch.set_facecolor('white')

# Title (separated, no overlap)
ax.set_title('RI (Reliance Index) 분포와 임계값 설정',
             fontsize=16, fontweight='bold', pad=20)

# Background zones
ax.axvspan(0, thresh_agg, alpha=0.12, color='#f44336', zorder=0)
ax.axvspan(thresh_agg, thresh_con, alpha=0.10, color='#ff9800', zorder=0)
ax.axvspan(thresh_con, 1.0, alpha=0.10, color='#4caf50', zorder=0)

# Histogram
n, bins, patches = ax.hist(ri_data, bins=40, range=(0, 1),
                            color='#1976D2', edgecolor='#0D47A1',
                            alpha=0.85, zorder=3,
                            label='RI 분포 (웨이퍼별 빈도)')

ymax = max(n) * 1.15

# Threshold lines
ax.axvline(x=thresh_agg, color='#d32f2f', linestyle=':', linewidth=2.5, zorder=4,
           label=f'공격적 임계값 (RI ≥ {thresh_agg}) → 계측 생략 82%')
ax.axvline(x=thresh_con, color='#2e7d32', linestyle='--', linewidth=2.5, zorder=4,
           label=f'보수적 임계값 (RI ≥ {thresh_con}) → 계측 생략 65%')

# Zone labels (top of chart, inside zones)
trans = blended_transform_factory(ax.transData, ax.transAxes)
ax.text(thresh_agg/2, 0.95, '반드시 실측',
        ha='center', va='top', fontsize=12, color='#c62828', fontweight='bold',
        transform=trans)
ax.text((thresh_agg + thresh_con)/2, 0.95, '판단 필요',
        ha='center', va='top', fontsize=12, color='#e65100', fontweight='bold',
        transform=trans)
ax.text((thresh_con + 1.0)/2, 0.95, 'VM 신뢰',
        ha='center', va='top', fontsize=12, color='#2e7d32', fontweight='bold',
        transform=trans)

# Threshold annotations (inline, near the lines, no long arrows)
ax.text(thresh_agg - 0.02, ymax * 0.55,
        f'RI = {thresh_agg}\n계측 생략 82%',
        ha='right', va='center', fontsize=9, color='#d32f2f', fontweight='bold',
        bbox=dict(boxstyle='round,pad=0.3', facecolor='#ffebee', edgecolor='#d32f2f', alpha=0.9))

ax.text(thresh_con + 0.02, ymax * 0.70,
        f'RI = {thresh_con}\n계측 생략 65%',
        ha='left', va='center', fontsize=9, color='#2e7d32', fontweight='bold',
        bbox=dict(boxstyle='round,pad=0.3', facecolor='#e8f5e9', edgecolor='#2e7d32', alpha=0.9))

# Explanation box (bottom-left, separated from title)
explanation = ("RI < 임계값 → 실제 계측 수행 + 학습 데이터 추가\n"
               "RI ≥ 임계값 → VM 예측값 사용, 계측 생략\n"
               "= Active Learning 원리")
ax.text(0.02, 0.78, explanation, transform=ax.transAxes,
        fontsize=9.5, va='top', ha='left',
        bbox=dict(boxstyle='round,pad=0.5', facecolor='#fff8e1',
                  edgecolor='#f9a825', alpha=0.95),
        linespacing=1.5)

# Axes
ax.set_xlabel('Reliance Index (RI)', fontsize=13)
ax.set_ylabel('웨이퍼 수', fontsize=13)
ax.set_xlim(0, 1.0)
ax.set_ylim(0, ymax)

# Legend (proper, with all visual items)
ax.legend(loc='upper center', fontsize=9.5, framealpha=0.95,
          edgecolor='#ccc', fancybox=True, ncol=3,
          bbox_to_anchor=(0.5, -0.08))

ax.grid(axis='y', alpha=0.2, linestyle='--')
ax.set_axisbelow(True)

plt.tight_layout()
out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/03_06/ri_distribution_threshold.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
