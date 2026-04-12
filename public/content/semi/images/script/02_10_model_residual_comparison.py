#!/usr/bin/env python3
"""Regenerate model_residual_comparison.png v3 — Bishop feedback:
   (1) 0.9nm 라벨 겹침 → offset 확대
   (2) Spec 표기 모호 → 명확한 문구
   (3) 바차트 색상 직관 역전 → red=bad, green=good
   (4) 주석 비교 기준 불명확 → 구체적 수치
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from scipy.ndimage import gaussian_filter

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# ── Model data ──
models = ["6par\n(선형)", "10par", "HOWA\n(고차)", "CPE\n(필드별)", "AI/ML\n(SMILE)"]
residuals_3sigma = [2.8, 2.2, 1.6, 1.2, 0.9]
spec_line = 1.5  # 3nm node overlay spec

# ── Color: red(worst) → green(best) — intuitive ──
colors_bar = ['#d32f2f', '#e65100', '#f9a825', '#66bb6a', '#2e7d32']

# ── Wafer residual heatmap data ──
N = 200
x = np.linspace(-1, 1, N)
y = np.linspace(-1, 1, N)
X, Y = np.meshgrid(x, y)
R = np.sqrt(X**2 + Y**2)
mask = R > 1.0

def make_residual_map(scale, seed):
    np.random.seed(seed)
    systematic = scale * 0.6 * (
        0.3 * np.sin(2*np.pi*X*1.5) * np.cos(2*np.pi*Y*1.2) +
        0.4 * R**2 +
        0.3 * np.cos(3*np.arctan2(Y, X)) * R
    )
    noise = scale * 0.4 * np.random.randn(N, N) * 0.5
    noise = gaussian_filter(noise, sigma=5)
    residual = np.abs(systematic + noise)
    residual[mask] = np.nan
    return residual

wafer_maps = [
    make_residual_map(3.5, 10),
    make_residual_map(2.5, 20),
    make_residual_map(1.8, 30),
    make_residual_map(1.3, 40),
    make_residual_map(0.9, 50),
]
wafer_titles = ["6par (선형)", "10par", "HOWA (고차)", "CPE (필드별)", "AI/ML (SMILE)"]

# ── Figure ──
fig = plt.figure(figsize=(16, 11))
fig.patch.set_facecolor('white')

# Top row: wafer heatmaps
gs_top = fig.add_gridspec(1, 6, left=0.04, right=0.96, top=0.95, bottom=0.56,
                           width_ratios=[1,1,1,1,1,0.06], wspace=0.15)

vmin, vmax = 0, 3.5
cmap = 'jet'

for i in range(5):
    ax = fig.add_subplot(gs_top[0, i])
    theta_c = np.linspace(0, 2*np.pi, 200)
    ax.plot(np.cos(theta_c), np.sin(theta_c), 'k-', lw=1.2)
    im = ax.imshow(wafer_maps[i], extent=[-1,1,-1,1], origin='lower',
                   cmap=cmap, vmin=vmin, vmax=vmax, interpolation='bilinear')
    ax.set_title(wafer_titles[i], fontsize=10, fontweight='bold', pad=6)
    ax.set_xlim(-1.1, 1.1); ax.set_ylim(-1.1, 1.1)
    ax.set_aspect('equal'); ax.set_xticks([]); ax.set_yticks([])
    for sp in ax.spines.values(): sp.set_visible(False)
    
    # Border color matching bar color
    circle = plt.Circle((0, 0), 1.0, fill=False, edgecolor=colors_bar[i], linewidth=2.5)
    ax.add_patch(circle)

cax = fig.add_subplot(gs_top[0, 5])
cbar = fig.colorbar(im, cax=cax)
cbar.set_label('잔차 크기 (Residual, nm)', fontsize=10)
cbar.ax.tick_params(labelsize=9)

# ── Bottom: bar chart ──
gs_bot = fig.add_gridspec(1, 1, left=0.10, right=0.88, top=0.48, bottom=0.04)
ax2 = fig.add_subplot(gs_bot[0, 0])

bars = ax2.bar(range(5), residuals_3sigma, color=colors_bar, width=0.6,
               edgecolor='#333', linewidth=0.8, zorder=3)

# Value labels (FIX: more offset for 0.9nm to avoid spec line overlap)
for i, (bar, val) in enumerate(zip(bars, residuals_3sigma)):
    offset = 0.15 if val > spec_line else -0.20  # below for sub-spec bars
    va = 'bottom' if val > spec_line else 'top'
    ax2.text(bar.get_x() + bar.get_width()/2, val + offset,
             f'{val}nm', ha='center', va=va, fontsize=12, fontweight='bold')

# Spec line (FIX: clear label)
ax2.axhline(y=spec_line, color='red', linestyle='--', linewidth=2, zorder=2)
ax2.text(4.55, spec_line + 0.05, 'Overlay Spec ≤ 1.5nm\n(3nm 노드 기준)',
         ha='right', va='bottom', fontsize=10, fontweight='bold', color='red',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='red', alpha=0.9))

# Pass/Fail indicators
for i, val in enumerate(residuals_3sigma):
    if val <= spec_line:
        ax2.text(i, 0.1, 'PASS', ha='center', fontsize=8.5, fontweight='bold',
                 color='#2e7d32', bbox=dict(boxstyle='round,pad=0.2', facecolor='#e8f5e9',
                 edgecolor='#66bb6a', alpha=0.9))

# Comparison annotation (FIX: concrete numbers)
ax2.annotate(
    'CPE → AI/ML 전환:\n잔차 1.2nm → 0.9nm (25% 감소)\nSpec 마진 0.3nm → 0.6nm (2배)',
    xy=(4, 0.9), xytext=(1.8, 0.30),
    fontsize=9.5, ha='center',
    bbox=dict(boxstyle='round,pad=0.4', facecolor='#e8f5e9', edgecolor='#2e7d32', alpha=0.9),
    arrowprops=dict(arrowstyle='->', color='#2e7d32', lw=1.5),
)

ax2.set_title('모델별 Overlay 잔차(Residual) 비교', fontsize=14, fontweight='bold', pad=12)
ax2.set_ylabel('잔차 3σ (nm)', fontsize=12)
ax2.set_xticks(range(5))
ax2.set_xticklabels([m.replace('\n', ' ') for m in models], fontsize=10)
ax2.set_ylim(0, 3.5)
ax2.grid(axis='y', alpha=0.3, linestyle='--')
ax2.set_axisbelow(True)

# Color legend note
ax2.text(0.01, 0.97, '색상: 빨간색(잔차 큼=나쁨) → 초록색(잔차 작음=좋음)',
         transform=ax2.transAxes, fontsize=8.5, va='top', color='#666', style='italic')

out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/02_10/model_residual_comparison.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
