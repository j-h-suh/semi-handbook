#!/usr/bin/env python3
"""Regenerate wafer_distortion_patterns.png — Bishop feedback applied."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import numpy as np

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# ── Wafer grid ──
N = 300
x = np.linspace(-1, 1, N)
y = np.linspace(-1, 1, N)
X, Y = np.meshgrid(x, y)
R = np.sqrt(X**2 + Y**2)
Theta = np.arctan2(Y, X)

# Wafer mask (circular)
mask = R > 1.0

# ── Distortion patterns ──
# 1. Magnification (확대): radial displacement ∝ r
magnification = R.copy()
magnification[mask] = np.nan

# 2. Rotation (회전): angular displacement component
rotation = Theta.copy()
# Normalize to [-1, 1]
rotation = rotation / np.pi
rotation[mask] = np.nan

# 3. Translation (병진): uniform gradient (x-shift)
translation = X.copy()
translation[mask] = np.nan

# 4. High-order (고차 왜곡): complex polynomial (Zernike-like)
high_order = (3 * R**4 - 2 * R**2) * np.cos(3 * Theta) + 0.5 * np.sin(5 * Theta) * R**3
high_order[mask] = np.nan

patterns = [
    (magnification, "확대 (Magnification)", "Overlay 변위 (nm)"),
    (rotation,      "회전 (Rotation)",      "Overlay 변위 (nm)"),
    (translation,   "병진 (Translation)",   "Overlay 변위 (nm)"),
    (high_order,    "고차 왜곡 (High-order)", "Overlay 변위 (nm)"),
]

# ── Plot ──
fig, axes = plt.subplots(2, 2, figsize=(13, 12))
fig.patch.set_facecolor('white')
fig.suptitle("웨이퍼 왜곡 패턴 유형 (Wafer Distortion Patterns)",
             fontsize=16, fontweight='bold', y=0.97)

cmap = 'RdYlBu_r'

for idx, (ax, (data, title, cbar_label)) in enumerate(zip(axes.flat, patterns)):
    ax.set_facecolor('#f8f8f8')
    
    # Draw wafer outline
    theta_circle = np.linspace(0, 2*np.pi, 200)
    ax.plot(np.cos(theta_circle), np.sin(theta_circle), 'k-', linewidth=1.5)
    
    # Notch at bottom
    notch_theta = np.linspace(-0.05, 0.05, 20) + (-np.pi/2)
    ax.plot(1.02*np.cos(notch_theta), 1.02*np.sin(notch_theta), 'k-', linewidth=3)
    
    # Heatmap
    im = ax.imshow(data, extent=[-1, 1, -1, 1], origin='lower',
                   cmap=cmap, aspect='equal', interpolation='bilinear')
    
    # Colorbar
    cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04, shrink=0.85)
    cbar.set_label(cbar_label, fontsize=10)
    cbar.ax.tick_params(labelsize=9)
    
    ax.set_title(title, fontsize=13, fontweight='bold', pad=10)
    ax.set_xlim(-1.15, 1.15)
    ax.set_ylim(-1.15, 1.15)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_aspect('equal')
    
    # Remove axes frame
    for spine in ax.spines.values():
        spine.set_visible(False)

plt.tight_layout(rect=[0, 0, 1, 0.94])
out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/02_08/wafer_distortion_patterns.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
