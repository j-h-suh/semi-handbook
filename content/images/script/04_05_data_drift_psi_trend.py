#!/usr/bin/env python3
"""Generate Data Drift PSI Trend Chart for 04_05 MLOps chapter."""

import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import warnings
warnings.filterwarnings('ignore')

# Font setup
plt.rcParams['font.family'] = 'AppleGothic'
plt.rcParams['axes.unicode_minus'] = False

np.random.seed(42)
days = np.arange(1, 61)

# PEB_온도: Day1~30 stable (0.03~0.08), Day31~44 PM후 (0.12~0.15), Day45~60 레지스트 변경 후 (0.25~0.35)
peb = np.zeros(60)
peb[0:30] = np.random.uniform(0.03, 0.08, 30)
# Smooth transition after PM event
peb[30:44] = np.random.uniform(0.12, 0.15, 14)
# After resist change - gradual increase
peb[44:60] = np.linspace(0.22, 0.35, 16) + np.random.uniform(-0.02, 0.02, 16)

# RF_Power: Day1~45 stable (0.02~0.06), Day46~60 stable (0.05~0.08)
rf = np.zeros(60)
rf[0:45] = np.random.uniform(0.02, 0.06, 45)
rf[45:60] = np.random.uniform(0.05, 0.08, 15)

# Dose_실측: Day1~30 (0.04~0.07), Day31~40 (0.08~0.12), Day41~60 (0.05~0.08)
dose = np.zeros(60)
dose[0:30] = np.random.uniform(0.04, 0.07, 30)
dose[30:40] = np.random.uniform(0.08, 0.12, 10)
dose[40:60] = np.random.uniform(0.05, 0.08, 20)

# Smooth the series slightly for realism
from scipy.ndimage import uniform_filter1d
peb = uniform_filter1d(peb, size=3)
rf = uniform_filter1d(rf, size=3)
dose = uniform_filter1d(dose, size=3)

fig, ax = plt.subplots(figsize=(10, 5), dpi=300)

# Plot series
ax.plot(days, peb, color='#e85d5d', linewidth=2, label='PEB_온도', marker='o', markersize=3, zorder=5)
ax.plot(days, rf, color='#4a90d9', linewidth=2, label='RF_Power', marker='s', markersize=3, zorder=5)
ax.plot(days, dose, color='#2ecc71', linewidth=2, label='Dose_실측', marker='^', markersize=3, zorder=5)

# Threshold lines
ax.axhline(y=0.1, color='#f39c12', linestyle='--', linewidth=1.5, alpha=0.8)
ax.text(61, 0.1, '주의 (Minor Shift)', color='#f39c12', fontsize=8, va='center', fontweight='bold')

ax.axhline(y=0.2, color='#e85d5d', linestyle='-', linewidth=1.5, alpha=0.8)
ax.text(61, 0.2, '경고 — 재학습 트리거', color='#e85d5d', fontsize=8, va='center', fontweight='bold')

# Fill zones
ax.axhspan(0, 0.1, alpha=0.05, color='#2ecc71')
ax.axhspan(0.1, 0.2, alpha=0.05, color='#f39c12')
ax.axhspan(0.2, 0.4, alpha=0.05, color='#e85d5d')

# Event vertical lines and annotations
ax.axvline(x=31, color='#f39c12', linestyle=':', linewidth=1.2, alpha=0.7)
ax.annotate('PM 수행', xy=(31, 0.37), fontsize=8, color='#f39c12', fontweight='bold',
            ha='center', va='bottom',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#fff3cd', edgecolor='#f39c12', alpha=0.9))

ax.axvline(x=45, color='#e85d5d', linestyle=':', linewidth=1.2, alpha=0.7)
ax.annotate('레지스트 변경', xy=(45, 0.37), fontsize=8, color='#e85d5d', fontweight='bold',
            ha='center', va='bottom',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#fde8e8', edgecolor='#e85d5d', alpha=0.9))

ax.annotate('⚠️ 재학습 트리거!', xy=(48, peb[47]), fontsize=9, color='#e85d5d', fontweight='bold',
            ha='left', va='bottom',
            xytext=(50, 0.34),
            arrowprops=dict(arrowstyle='->', color='#e85d5d', lw=1.5),
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#fde8e8', edgecolor='#e85d5d', alpha=0.9))

# Labels and title
ax.set_xlabel('배포 후 경과일', fontsize=11, fontweight='bold')
ax.set_ylabel('PSI (Population Stability Index)', fontsize=11, fontweight='bold')
ax.set_title('Data Drift 모니터링 — PSI 추이 차트', fontsize=14, fontweight='bold', pad=15)

# Grid
ax.grid(True, alpha=0.3, linestyle='-')
ax.set_xlim(1, 60)
ax.set_ylim(0, 0.42)

# X ticks
ax.set_xticks([1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60])

# Legend
legend = ax.legend(loc='upper left', fontsize=9, framealpha=0.9, edgecolor='#cccccc')

plt.tight_layout()

output_path = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/04_05/data_drift_psi_trend.png"
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
plt.close()

import os
size = os.path.getsize(output_path)
print(f"✅ Saved: {output_path}")
print(f"   Size: {size:,} bytes")
