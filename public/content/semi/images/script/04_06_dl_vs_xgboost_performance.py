#!/usr/bin/env python3
"""Generate DL vs XGBoost performance comparison grouped bar chart."""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np

# Try to set Korean font
for fontname in ['AppleGothic', 'NanumGothic', 'Malgun Gothic']:
    if any(fontname in f.name for f in fm.fontManager.ttflist):
        plt.rcParams['font.family'] = fontname
        break

plt.rcParams['axes.unicode_minus'] = False

output_path = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/04_06/dl_vs_xgboost_performance.png"

# Data
tasks = [
    "SEM 결함 분류\n(이미지)",
    "웨이퍼맵 패턴\n(이미지)",
    "CD 예측 (VM)\n(Summary 피처)",
    "FDC 이상 탐지\n(Trace)",
    "OPC 가속\n(Pixel-to-Pixel)"
]

xgboost_vals = [88, 91, 88, 85, None]  # None for OPC
dl_vals = [96, 97, 87, 92, 95]
dl_models = ["CNN\n(ResNet-18)", "CNN", "NN", "1D-CNN\n/LSTM", "U-Net"]

# Colors
c_xgb = "#4a90d9"
c_dl = "#e85d5d"

fig, ax = plt.subplots(figsize=(10, 6), dpi=300)

x = np.arange(len(tasks))
bar_width = 0.35

# XGBoost bars
xgb_plot_vals = [v if v is not None else 0 for v in xgboost_vals]
xgb_bars = ax.bar(x - bar_width/2, xgb_plot_vals, bar_width, 
                   label='XGBoost + 수동 피처', color=c_xgb, edgecolor='white', linewidth=0.5,
                   zorder=3)

# DL bars
dl_bars = ax.bar(x + bar_width/2, dl_vals, bar_width,
                  label='딥러닝 (CNN/LSTM/U-Net)', color=c_dl, edgecolor='white', linewidth=0.5,
                  zorder=3)

# Hide the OPC XGBoost bar (it's N/A)
xgb_bars[4].set_alpha(0)

# Add value labels on bars
for i, (bar, val) in enumerate(zip(xgb_bars, xgboost_vals)):
    if val is not None:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.8,
                f'{val}', ha='center', va='bottom', fontsize=9, fontweight='bold', color=c_xgb)
    else:
        ax.text(bar.get_x() + bar.get_width()/2, 5,
                'N/A', ha='center', va='bottom', fontsize=9, fontweight='bold', color='#999',
                fontstyle='italic')

for bar, val, model in zip(dl_bars, dl_vals, dl_models):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.8,
            f'{val}', ha='center', va='bottom', fontsize=9, fontweight='bold', color=c_dl)

# Annotations
# Arrow annotation for CD prediction
ax.annotate('정형 데이터에서는\nXGBoost ≥ DL',
            xy=(2 - bar_width/2, 88), xytext=(2 - 0.7, 72),
            fontsize=8, color=c_xgb, fontweight='bold',
            ha='center',
            arrowprops=dict(arrowstyle='->', color=c_xgb, lw=1.5),
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#e8f0fe', edgecolor=c_xgb, alpha=0.8))

# Arrow annotation for SEM
ax.annotate('이미지에서\nDL 압도적 우위',
            xy=(0 + bar_width/2, 96), xytext=(0 + 0.7, 75),
            fontsize=8, color=c_dl, fontweight='bold',
            ha='center',
            arrowprops=dict(arrowstyle='->', color=c_dl, lw=1.5),
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#fde8e8', edgecolor=c_dl, alpha=0.8))

# Style
ax.set_xlabel('태스크', fontsize=11, fontweight='bold', labelpad=10)
ax.set_ylabel('성능 (%, 높을수록 좋음)', fontsize=11, fontweight='bold', labelpad=10)
ax.set_title('딥러닝 vs XGBoost — 반도체 태스크별 성능 비교', fontsize=14, fontweight='bold', pad=15)
ax.set_xticks(x)
ax.set_xticklabels(tasks, fontsize=9)
ax.set_ylim(0, 108)
ax.set_yticks(range(0, 101, 10))

# Grid
ax.yaxis.grid(True, linestyle='--', alpha=0.3, zorder=0)
ax.set_axisbelow(True)

# Legend
ax.legend(fontsize=10, loc='upper left', framealpha=0.9)

# Spine cleanup
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

plt.tight_layout()
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
plt.close()

print(f"Chart saved to: {output_path}")
