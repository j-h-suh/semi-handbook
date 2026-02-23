#!/usr/bin/env python3
"""Regenerate global_cdu_wafer_heatmap.png — systematic CDU, proper masking, Korean."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

np.random.seed(42)

# ── Wafer grid (300mm = radius 150mm) ──
N = 300
x = np.linspace(-150, 150, N)
y = np.linspace(-150, 150, N)
X, Y = np.meshgrid(x, y)
R = np.sqrt(X**2 + Y**2)

# Wafer mask (300mm diameter)
mask = R > 148

# ── CDU pattern: systematic (radial + azimuthal) + noise ──
# Target CD = 21nm
target_cd = 21.0

# Systematic components:
# 1. Radial: CD increases toward edge (lens aberration / etch loading)
radial = 1.5 * (R / 150)**2

# 2. Azimuthal: slight asymmetry (scan direction effect)
theta = np.arctan2(Y, X)
azimuthal = 0.4 * np.cos(theta - np.pi/4)

# 3. Low-frequency spatial variation (slit profile)
slit = 0.3 * np.sin(2*np.pi*X/200) * np.cos(2*np.pi*Y/250)

# 4. Random noise (measurement + stochastic)
from scipy.ndimage import gaussian_filter
noise = gaussian_filter(np.random.randn(N, N) * 0.3, sigma=3)

cd_map = target_cd + radial + azimuthal + slit + noise
cd_map[mask] = np.nan

# Stats (within wafer only)
valid = cd_map[~mask]
cd_mean = np.nanmean(valid)
cd_3sigma = 3 * np.nanstd(valid)
cd_range = np.nanmax(valid) - np.nanmin(valid)

# ── Figure ──
fig, ax = plt.subplots(figsize=(10, 10))
fig.patch.set_facecolor('white')

# Heatmap
im = ax.imshow(cd_map, extent=[-150, 150, -150, 150], origin='lower',
               cmap='RdYlBu_r', interpolation='bilinear',
               vmin=target_cd - 2.5, vmax=target_cd + 3.5)

# Wafer outline
theta_c = np.linspace(0, 2*np.pi, 200)
ax.plot(148*np.cos(theta_c), 148*np.sin(theta_c), 'k-', lw=1.5)

# Notch
nt = np.linspace(-0.04, 0.04, 10) - np.pi/2
ax.plot(152*np.cos(nt), 152*np.sin(nt), 'k-', lw=3)

# Colorbar
cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04, shrink=0.85)
cbar.set_label('CD (nm)', fontsize=12)

# Stats box
stats_text = (f'Global CDU 통계\n'
              f'평균 CD: {cd_mean:.1f} nm\n'
              f'3σ: {cd_3sigma:.1f} nm\n'
              f'Range: {cd_range:.1f} nm\n'
              f'웨이퍼: 300mm')
ax.text(0.98, 0.98, stats_text, transform=ax.transAxes,
        fontsize=10, va='top', ha='right',
        bbox=dict(boxstyle='round,pad=0.5', facecolor='white', edgecolor='#999', alpha=0.95))

ax.set_title('글로벌 CDU 웨이퍼 히트맵\n(Global CDU Wafer Heatmap)',
             fontsize=15, fontweight='bold', pad=12)
ax.set_xlabel('웨이퍼 X 좌표 (mm)', fontsize=12)
ax.set_ylabel('웨이퍼 Y 좌표 (mm)', fontsize=12)
ax.set_xlim(-165, 165)
ax.set_ylim(-165, 165)
ax.set_aspect('equal')

plt.tight_layout()
out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/02_11/global_cdu_wafer_heatmap.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
