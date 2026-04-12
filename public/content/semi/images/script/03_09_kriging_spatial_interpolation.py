#!/usr/bin/env python3
"""Regenerate kriging_spatial_interpolation.png — add variance map, Korean labels."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from scipy.interpolate import RBFInterpolator

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

np.random.seed(42)

# ── Measurement points ──
n_pts = 18
x_pts = np.random.uniform(0.5, 9.5, n_pts)
y_pts = np.random.uniform(0.5, 9.5, n_pts)
# Simulated film thickness (nm) with spatial trend
z_pts = 50 + 8*np.sin(x_pts*0.5) + 5*np.cos(y_pts*0.6) + np.random.randn(n_pts)*1.5

# ── Grid ──
gx = np.linspace(0, 10, 100)
gy = np.linspace(0, 10, 100)
GX, GY = np.meshgrid(gx, gy)
grid_pts = np.column_stack([GX.ravel(), GY.ravel()])

# ── RBF Interpolation (kriging-like) ──
pts = np.column_stack([x_pts, y_pts])
rbf = RBFInterpolator(pts, z_pts, kernel='thin_plate_spline', smoothing=1.0)
Z_pred = rbf(grid_pts).reshape(100, 100)

# ── Variance proxy (distance to nearest measurement) ──
from scipy.spatial import distance
dists = distance.cdist(grid_pts, pts)
min_dist = dists.min(axis=1).reshape(100, 100)
# Normalize to [0, 1] for variance proxy
variance = min_dist / min_dist.max()

# ── Recommended sampling (top-3 highest variance locations) ──
flat_var = variance.ravel()
top_idx = np.argsort(flat_var)[-3:]
rec_x = GX.ravel()[top_idx]
rec_y = GY.ravel()[top_idx]

# ── Figure: 2 panels ──
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
fig.patch.set_facecolor('white')
fig.suptitle('크리깅 공간 보간 및 샘플링 추천\n(Kriging Spatial Interpolation & Sampling Recommendation)',
             fontsize=15, fontweight='bold', y=1.02)

# ── Left: Predicted value map ──
im1 = ax1.contourf(GX, GY, Z_pred, levels=15, cmap='viridis')
ax1.scatter(x_pts, y_pts, c='red', s=60, edgecolors='white', linewidths=1.2,
            zorder=5, label='계측 포인트')
ax1.scatter(rec_x, rec_y, c='gold', s=120, marker='*', edgecolors='black',
            linewidths=0.8, zorder=6, label='추가 샘플링 추천')

cb1 = fig.colorbar(im1, ax=ax1, shrink=0.85)
cb1.set_label('막두께 예측값 (nm)', fontsize=11)

ax1.set_title('예측 막두께 맵', fontsize=13, fontweight='bold')
ax1.set_xlabel('웨이퍼 X 좌표 (mm)', fontsize=11)
ax1.set_ylabel('웨이퍼 Y 좌표 (mm)', fontsize=11)
ax1.set_xlim(0, 10)
ax1.set_ylim(0, 10)
ax1.set_aspect('equal')
ax1.legend(loc='upper right', fontsize=9, framealpha=0.9)
ax1.grid(alpha=0.15)

# ── Right: Kriging variance (uncertainty) map ──
im2 = ax2.contourf(GX, GY, variance, levels=15, cmap='YlOrRd')
ax2.scatter(x_pts, y_pts, c='blue', s=60, edgecolors='white', linewidths=1.2,
            zorder=5, label='계측 포인트')
ax2.scatter(rec_x, rec_y, c='gold', s=120, marker='*', edgecolors='black',
            linewidths=0.8, zorder=6, label='추가 샘플링 추천')

# High uncertainty annotations
for rx, ry in zip(rec_x, rec_y):
    ax2.annotate('높은 불확도', xy=(rx, ry), xytext=(rx-1.5, ry+1),
                 fontsize=8, color='#d32f2f', fontweight='bold',
                 arrowprops=dict(arrowstyle='->', color='#d32f2f', lw=1))

cb2 = fig.colorbar(im2, ax=ax2, shrink=0.85)
cb2.set_label('크리깅 분산 (불확도, 정규화)', fontsize=11)

ax2.set_title('크리깅 분산(불확도) 맵', fontsize=13, fontweight='bold')
ax2.set_xlabel('웨이퍼 X 좌표 (mm)', fontsize=11)
ax2.set_ylabel('웨이퍼 Y 좌표 (mm)', fontsize=11)
ax2.set_xlim(0, 10)
ax2.set_ylim(0, 10)
ax2.set_aspect('equal')
ax2.legend(loc='upper right', fontsize=9, framealpha=0.9)
ax2.grid(alpha=0.15)

plt.tight_layout()
out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/03_09/kriging_spatial_interpolation.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
