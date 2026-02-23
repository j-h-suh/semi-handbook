#!/usr/bin/env python3
"""Regenerate wafer_map_pattern_types.png — Bishop feedback applied."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# ── Die grid on wafer ──
die_pitch = 0.085  # die size relative to wafer radius
wafer_r = 1.0

# Generate die centers within wafer
dies_x, dies_y = [], []
for gx in np.arange(-1.0, 1.01, die_pitch):
    for gy in np.arange(-1.0, 1.01, die_pitch):
        if np.sqrt(gx**2 + gy**2) < wafer_r - 0.02:
            dies_x.append(gx)
            dies_y.append(gy)
dies_x = np.array(dies_x)
dies_y = np.array(dies_y)
n_dies = len(dies_x)
r_dies = np.sqrt(dies_x**2 + dies_y**2)
theta_dies = np.arctan2(dies_y, dies_x)

np.random.seed(42)

def random_pattern():
    """Random scattered defects (~10% fail rate)."""
    return np.random.rand(n_dies) < 0.10

def edge_pattern():
    """Defects along wafer perimeter (외곽 둘레)."""
    return r_dies > 0.82

def cluster_pattern():
    """Localized cluster of defects."""
    cx, cy = 0.3, 0.25
    dist = np.sqrt((dies_x - cx)**2 + (dies_y - cy)**2)
    return dist < 0.25

def ring_pattern():
    """Concentric ring defect (동심원)."""
    return (r_dies > 0.40) & (r_dies < 0.62)

def repeat_pattern():
    """Repeating/systematic pattern (reticle defect)."""
    # Grid-like repetition every 3 dies
    fail = np.zeros(n_dies, dtype=bool)
    for i in range(n_dies):
        gx_idx = int(round((dies_x[i] + 1.0) / die_pitch))
        gy_idx = int(round((dies_y[i] + 1.0) / die_pitch))
        if gx_idx % 3 == 0 and gy_idx % 3 == 0:
            fail[i] = True
    return fail

patterns = [
    (random_pattern(),  "랜덤\n(Random)",     "입자 오염 등\n산발적 결함"),
    (edge_pattern(),    "외곽\n(Edge)",        "CMP·코팅 불균일\n웨이퍼 가장자리 결함"),
    (cluster_pattern(), "클러스터\n(Cluster)", "국소 장비 이상\n특정 영역 집중"),
    (ring_pattern(),    "동심원\n(Ring)",      "스핀 코팅·열처리\n반경 의존 결함"),
    (repeat_pattern(),  "반복\n(Repeat)",      "레티클 결함\n주기적 반복 패턴"),
]

# ── Plot ──
fig, axes = plt.subplots(1, 5, figsize=(18, 5.5))
fig.patch.set_facecolor('white')
fig.suptitle("웨이퍼 맵 결함 패턴 유형 (Wafer Map Defect Pattern Types)",
             fontsize=15, fontweight='bold', y=1.02)

pass_color = '#4CAF50'
fail_color = '#F44336'
die_size = 8  # marker size

for ax, (fail_mask, title, desc) in zip(axes, patterns):
    # Wafer outline
    theta_c = np.linspace(0, 2*np.pi, 200)
    ax.plot(np.cos(theta_c), np.sin(theta_c), color='#555', lw=1.5)
    
    # Notch
    notch_t = np.linspace(-0.06, 0.06, 10) - np.pi/2
    ax.plot(1.03*np.cos(notch_t), 1.03*np.sin(notch_t), color='#555', lw=2.5)
    
    # Plot dies
    pass_idx = ~fail_mask
    ax.scatter(dies_x[pass_idx], dies_y[pass_idx], s=die_size,
               c=pass_color, marker='s', linewidths=0, alpha=0.7)
    ax.scatter(dies_x[fail_mask], dies_y[fail_mask], s=die_size,
               c=fail_color, marker='s', linewidths=0, alpha=0.9)
    
    ax.set_title(title, fontsize=12, fontweight='bold', pad=8)
    ax.text(0, -1.22, desc, ha='center', va='top', fontsize=8.5, color='#666',
            style='italic', linespacing=1.3)
    
    ax.set_xlim(-1.15, 1.15)
    ax.set_ylim(-1.35, 1.15)
    ax.set_aspect('equal')
    ax.set_xticks([])
    ax.set_yticks([])
    for sp in ax.spines.values():
        sp.set_visible(False)

# ── Legend ──
legend_elements = [
    mpatches.Patch(facecolor=pass_color, edgecolor='none', label='Pass (양품)'),
    mpatches.Patch(facecolor=fail_color, edgecolor='none', label='Fail (불량)'),
]
fig.legend(handles=legend_elements, loc='lower center', ncol=2,
           fontsize=11, frameon=True, edgecolor='#ccc',
           bbox_to_anchor=(0.5, -0.04))

plt.tight_layout(rect=[0, 0.04, 1, 0.98])
out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/03_01/wafer_map_pattern_types.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
