#!/usr/bin/env python3
"""Regenerate mixed_pattern_decomposition.png v3 — Bishop feedback:
   (1) X축 임계값 라벨 텍스트 겹침 → 가로 바차트
   (2) 분해 웨이퍼 2개 vs CNN 분류 4개 불일치 → 4개 분해 웨이퍼
   (3) Ring 패턴 부정확 → 동심원 형태 확인
   (4) 웨이퍼 크기/다이 해상도 불일치 → 통일
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.gridspec import GridSpec
import numpy as np

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# ── Die grid ──
die_pitch = 0.06  # smaller dies for better resolution (consistent size)
dies_x, dies_y = [], []
for gx in np.arange(-1.0, 1.01, die_pitch):
    for gy in np.arange(-1.0, 1.01, die_pitch):
        if np.sqrt(gx**2 + gy**2) < 0.98:
            dies_x.append(gx)
            dies_y.append(gy)
dies_x = np.array(dies_x)
dies_y = np.array(dies_y)
n_dies = len(dies_x)
r_dies = np.sqrt(dies_x**2 + dies_y**2)

np.random.seed(42)

# 4 pattern components (matching CNN outputs)
edge_fail = r_dies > 0.82
ring_fail = (r_dies > 0.40) & (r_dies < 0.58)
random_fail = np.random.rand(n_dies) < 0.04  # sparse random
center_fail = np.sqrt(dies_x**2 + dies_y**2) < 0.18  # small center cluster

# Combined (realistic: edge + ring dominant, random scattered)
combined_fail = edge_fail | ring_fail | random_fail

pass_c, fail_c = '#4CAF50', '#F44336'
ms = 4  # consistent marker size

def draw_wafer(ax, fail_mask, title, border_color='#333'):
    theta_c = np.linspace(0, 2*np.pi, 200)
    ax.plot(np.cos(theta_c), np.sin(theta_c), color=border_color, lw=2)
    nt = np.linspace(-0.06, 0.06, 10) - np.pi/2
    ax.plot(1.03*np.cos(nt), 1.03*np.sin(nt), color=border_color, lw=2.5)
    p_idx = ~fail_mask
    ax.scatter(dies_x[p_idx], dies_y[p_idx], s=ms, c=pass_c, marker='s', linewidths=0, alpha=0.6)
    ax.scatter(dies_x[fail_mask], dies_y[fail_mask], s=ms, c=fail_c, marker='s', linewidths=0, alpha=0.9)
    ax.set_title(title, fontsize=10, fontweight='bold', pad=5)
    ax.set_xlim(-1.15, 1.15)
    ax.set_ylim(-1.15, 1.15)
    ax.set_aspect('equal')
    ax.set_xticks([]); ax.set_yticks([])
    for sp in ax.spines.values():
        sp.set_visible(False)

# ── Figure (wider to accommodate 4 decomposed wafers) ──
fig = plt.figure(figsize=(18, 8))
fig.patch.set_facecolor('white')
fig.suptitle('혼합 패턴 분해 (Mixed Pattern Decomposition via CNN)',
             fontsize=15, fontweight='bold', y=0.98)

gs = GridSpec(2, 7, figure=fig,
              width_ratios=[1.2, 0.15, 0.7, 0.7, 0.7, 0.7, 1.0],
              hspace=0.45, wspace=0.10,
              left=0.02, right=0.98, top=0.90, bottom=0.06)

# ── Combined wafer (left) ──
ax0 = fig.add_subplot(gs[:, 0])
draw_wafer(ax0, combined_fail, '300mm 웨이퍼 맵\n(혼합 패턴)')

# ── Arrow ──
ax_arr = fig.add_subplot(gs[:, 1])
ax_arr.set_xlim(0, 1); ax_arr.set_ylim(0, 1)
ax_arr.annotate('', xy=(0.9, 0.5), xytext=(0.1, 0.5),
                arrowprops=dict(arrowstyle='->', lw=2.5, color='#333'))
ax_arr.text(0.5, 0.62, 'AI\n분해', ha='center', va='bottom',
            fontsize=10, fontweight='bold', color='#1565c0')
ax_arr.set_xticks([]); ax_arr.set_yticks([])
for sp in ax_arr.spines.values(): sp.set_visible(False)

# ── 4 Decomposed wafers (top row, matching 4 CNN outputs) ──
decomp_data = [
    (edge_fail, '외곽 (Edge)', '#F44336'),
    (ring_fail, '동심원 (Ring)', '#FF9800'),
    (random_fail, '랜덤 (Random)', '#9E9E9E'),
    (center_fail, '중심 (Center)', '#E0E0E0'),
]

for i, (mask, title, color) in enumerate(decomp_data):
    ax = fig.add_subplot(gs[0, i+2])
    draw_wafer(ax, mask, title, border_color=color)

# ── Cause-Action boxes (bottom row, under each decomposed wafer) ──
causes = [
    ('원인: CMP 에지 효과\n조치: 에지 레시피 조정', '#fff3e0', '#ff9800'),
    ('원인: PEB 핫플레이트 불균일\n조치: 균일도 점검', '#fff3e0', '#ff9800'),
    ('원인: 입자 오염\n조치: 세정 공정 강화', '#f5f5f5', '#9e9e9e'),
    ('원인: 척 중심 접촉\n조치: 진공척 점검', '#f5f5f5', '#9e9e9e'),
]

for i, (text, bg, ec) in enumerate(causes):
    ax = fig.add_subplot(gs[1, i+2])
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.text(0.5, 0.5, text, ha='center', va='center', fontsize=8.5,
            bbox=dict(boxstyle='round,pad=0.4', facecolor=bg, edgecolor=ec, alpha=0.9),
            linespacing=1.4)
    ax.set_xticks([]); ax.set_yticks([])
    for sp in ax.spines.values(): sp.set_visible(False)

# ── CNN scores (right, horizontal bars) ──
ax_sc = fig.add_subplot(gs[:, 6])
scores = [
    ("외곽 (Edge)", 0.94, '#F44336'),
    ("동심원 (Ring)", 0.88, '#FF9800'),
    ("랜덤 (Random)", 0.12, '#9E9E9E'),
    ("중심 (Center)", 0.05, '#E0E0E0'),
]
y_pos = [3, 2, 1, 0]
labels = [s[0] for s in scores]
vals = [s[1] for s in scores]
colors = [s[2] for s in scores]

bars = ax_sc.barh(y_pos, vals, height=0.55, color=colors, edgecolor='#555', lw=0.5)
ax_sc.set_yticks(y_pos)
ax_sc.set_yticklabels(labels, fontsize=9.5, fontweight='bold')
ax_sc.set_xlim(0, 1.18)
ax_sc.set_xlabel('확률 (Probability)', fontsize=10)
ax_sc.set_title('Multi-label CNN\n분류 확률', fontsize=11, fontweight='bold', pad=8)
for i, v in enumerate(vals):
    ax_sc.text(v + 0.02, y_pos[i], f'{v:.2f}', va='center', fontsize=10, fontweight='bold')
ax_sc.spines['top'].set_visible(False)
ax_sc.spines['right'].set_visible(False)
ax_sc.grid(axis='x', alpha=0.2, linestyle='--')
ax_sc.axvline(x=0.5, color='#999', linestyle=':', lw=1.2, alpha=0.6)
ax_sc.text(0.52, -0.5, '임계값\n(Threshold)', fontsize=8, color='#999')

# ── Legend ──
legend_elements = [
    mpatches.Patch(facecolor=pass_c, edgecolor='none', label='Pass (양품)'),
    mpatches.Patch(facecolor=fail_c, edgecolor='none', label='Fail (불량)'),
]
fig.legend(handles=legend_elements, loc='lower left', ncol=2,
           fontsize=10, frameon=True, edgecolor='#ccc',
           bbox_to_anchor=(0.02, 0.01))

out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/03_07/mixed_pattern_decomposition.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
