#!/usr/bin/env python3
"""Regenerate shap_waterfall_cd.png — zoomed Y, Korean, feature values, proper legend."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# ── SHAP data: (feature, shap_value, actual_value) ──
base_val = 20.0
features = [
    ("Etch_Time\n(식각 시간)",      +1.2, "45s"),
    ("Source_Power\n(소스 전력)",    -0.8, "1200W"),
    ("Gas_Flow_C4F8\n(C4F8 유량)",  +0.5, "35sccm"),
    ("Pressure\n(챔버 압력)",        -0.3, "15mT"),
    ("Wafer_Temp\n(웨이퍼 온도)",    +0.9, "60°C"),
    ("Other\n(기타)",               +0.2, "—"),
]

names = [f[0] for f in features]
shap_vals = [f[1] for f in features]
actual_vals = [f[2] for f in features]
final_val = base_val + sum(shap_vals)

# ── Build waterfall coordinates ──
cumulative = [base_val]
for sv in shap_vals:
    cumulative.append(cumulative[-1] + sv)

# ── Figure ──
fig, ax = plt.subplots(figsize=(14, 7.5))
fig.patch.set_facecolor('white')

x_labels = ['E[f(x)]\n(기준값)'] + names + ['f(x)\n(최종 예측)']
n_bars = len(x_labels)
x_pos = np.arange(n_bars)

# Base value bar
ax.bar(0, base_val, color='#9E9E9E', edgecolor='#555', width=0.6, zorder=3)
ax.text(0, base_val + 0.05, f'{base_val:.1f}nm', ha='center', va='bottom',
        fontsize=11, fontweight='bold')

# Waterfall bars
for i, sv in enumerate(shap_vals):
    bot = cumulative[i]
    color = '#4CAF50' if sv > 0 else '#F44336'
    if sv > 0:
        ax.bar(i+1, sv, bottom=bot, color=color, edgecolor='#333', width=0.6, zorder=3)
        ax.text(i+1, bot + sv + 0.05, f'+{sv}', ha='center', va='bottom',
                fontsize=10, fontweight='bold', color='#2e7d32')
    else:
        ax.bar(i+1, sv, bottom=bot, color=color, edgecolor='#333', width=0.6, zorder=3)
        ax.text(i+1, bot + sv - 0.05, f'{sv}', ha='center', va='top',
                fontsize=10, fontweight='bold', color='#c62828')
    
    # Feature actual value label
    ax.text(i+1, 18.3, f'= {actual_vals[i]}', ha='center', va='top',
            fontsize=8.5, color='#555', style='italic')
    
    # Connector line
    ax.plot([i+0.7, i+1.3], [cumulative[i+1], cumulative[i+1]],
            color='#999', linestyle=':', linewidth=0.8, zorder=2)

# Final prediction bar
ax.bar(n_bars-1, final_val, color='#1976D2', edgecolor='#555', width=0.6, zorder=3)
ax.text(n_bars-1, final_val + 0.05, f'{final_val:.1f}nm', ha='center', va='bottom',
        fontsize=11, fontweight='bold', color='#0D47A1')

ax.set_title('SHAP 워터폴 플롯: CD 예측 피처 기여도\n(SHAP Waterfall Plot: Feature Contributions to CD Prediction)',
             fontsize=14, fontweight='bold', pad=12)
ax.set_ylabel('예측 CD (nm)', fontsize=12)
ax.set_xticks(x_pos)
ax.set_xticklabels(x_labels, fontsize=9, ha='center')

# Zoomed Y range (Bishop fix #3)
ax.set_ylim(18, 23)
ax.grid(axis='y', alpha=0.2, linestyle='--')

# Legend (Bishop fix #1)
legend_elements = [
    mpatches.Patch(facecolor='#9E9E9E', edgecolor='#555', label='기준값 (Base Value, E[f(x)])'),
    mpatches.Patch(facecolor='#4CAF50', edgecolor='#333', label='CD 증가 기여 (+)'),
    mpatches.Patch(facecolor='#F44336', edgecolor='#333', label='CD 감소 기여 (-)'),
    mpatches.Patch(facecolor='#1976D2', edgecolor='#555', label='최종 예측값 (f(x))'),
]
ax.legend(handles=legend_elements, loc='upper right', fontsize=9.5, framealpha=0.95)

# Summary annotation
ax.text(0.02, 0.02,
        f'Base {base_val:.1f}nm + SHAP 합산 {sum(shap_vals):+.1f}nm = 최종 {final_val:.1f}nm',
        transform=ax.transAxes, fontsize=10, va='bottom', color='#333',
        bbox=dict(boxstyle='round,pad=0.4', facecolor='#e3f2fd', edgecolor='#1976D2', alpha=0.9))

plt.tight_layout()
out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/04_04/shap_waterfall_cd.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
