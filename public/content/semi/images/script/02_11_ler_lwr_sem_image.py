#!/usr/bin/env python3
"""Regenerate ler_lwr_sem_image.png — fix arrows, add scale bar, Korean labels."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from scipy.ndimage import gaussian_filter

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

np.random.seed(42)

# ── Simulated SEM image of line/space pattern ──
H, W = 600, 800
img = np.zeros((H, W))

# Line parameters
pitch = 160  # nm (pixel = 1nm)
cd = 60      # line width
n_lines = W // pitch + 1

# Create rough edges (LER simulation)
ler_sigma = 3.0  # nm 3sigma → ~1nm 1sigma
for i in range(n_lines):
    cx = int(i * pitch + pitch//2)
    if cx - cd//2 < 0 or cx + cd//2 >= W:
        continue
    
    # Left edge roughness
    left_roughness = gaussian_filter(np.random.randn(H) * ler_sigma/3, sigma=8)
    # Right edge roughness  
    right_roughness = gaussian_filter(np.random.randn(H) * ler_sigma/3, sigma=8)
    
    for y in range(H):
        left = int(cx - cd//2 + left_roughness[y])
        right = int(cx + cd//2 + right_roughness[y])
        left = max(0, min(W-1, left))
        right = max(0, min(W-1, right))
        img[y, left:right] = 1.0

# Add SEM-like noise
noise = np.random.randn(H, W) * 0.12
img_noisy = np.clip(img + noise, 0, 1)
img_noisy = gaussian_filter(img_noisy, sigma=0.8)

# ── Figure ──
fig, ax = plt.subplots(figsize=(14, 8))
fig.patch.set_facecolor('white')

ax.imshow(img_noisy, cmap='gray', aspect='equal', extent=[0, W, 0, H])

# ── LER annotation (red, left edge of 2nd line) ──
line_cx = int(1 * pitch + pitch//2)
edge_x = line_cx - cd//2

# Draw edge trace line (visible red)
edge_trace_y = np.arange(100, 500)
edge_trace_x = edge_x + gaussian_filter(np.random.randn(len(edge_trace_y)) * ler_sigma/3, sigma=8)
ax.plot(edge_trace_x, edge_trace_y, 'r-', linewidth=1.8, alpha=0.9)

ax.annotate('LER (선 에지 거칠기)\nLine Edge Roughness\n3σ = {:.1f} nm'.format(ler_sigma),
            xy=(edge_x, 350), xytext=(30, 530),
            fontsize=11, color='#ff1744', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='black', edgecolor='#ff1744', alpha=0.85),
            arrowprops=dict(arrowstyle='->', color='#ff1744', lw=2))

# ── LWR annotation (yellow, across one line width) ──
lwr_y = 200
lwr_left = line_cx - cd//2
lwr_right = line_cx + cd//2

ax.annotate('', xy=(lwr_right, lwr_y), xytext=(lwr_left, lwr_y),
            arrowprops=dict(arrowstyle='<->', color='#ffea00', lw=2.5))
ax.text(line_cx, lwr_y - 25,
        'LWR (선폭 거칠기)\nLine Width Roughness\nCD 변동 3σ',
        ha='center', va='top', fontsize=10, color='#ffea00', fontweight='bold',
        bbox=dict(boxstyle='round,pad=0.4', facecolor='black', edgecolor='#ffea00', alpha=0.85))

# ── Scale bar ──
sb_x, sb_y = 600, 50
sb_len = 100  # 100nm
ax.plot([sb_x, sb_x + sb_len], [sb_y, sb_y], 'w-', linewidth=3)
ax.text(sb_x + sb_len/2, sb_y + 20, f'{sb_len} nm',
        ha='center', va='bottom', fontsize=10, color='white', fontweight='bold')

# ── Dimension info ──
# Pitch annotation
p_y = 560
p_left = int(0 * pitch + pitch//2)
p_right = int(1 * pitch + pitch//2)
ax.annotate('', xy=(p_right, p_y), xytext=(p_left, p_y),
            arrowprops=dict(arrowstyle='<->', color='#00e5ff', lw=2))
ax.text((p_left + p_right)/2, p_y + 15,
        f'Pitch = {pitch} nm', ha='center', va='bottom',
        fontsize=9, color='#00e5ff', fontweight='bold')

ax.set_title('시뮬레이션 SEM 이미지: LER vs LWR\n(Simulated SEM Image: Line Edge Roughness vs Line Width Roughness)',
             fontsize=14, fontweight='bold', pad=12)
ax.set_xlabel('위치 (nm)', fontsize=11)
ax.set_ylabel('위치 (nm)', fontsize=11)

plt.tight_layout()
out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/02_11/ler_lwr_sem_image.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
