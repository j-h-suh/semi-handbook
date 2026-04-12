#!/usr/bin/env python3
"""Regenerate transistor_growth.png with Bishop's feedback applied."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np

# ── Korean font setup ──
plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# ── Data ──
chips = [
    (1971, 2300,        "Intel 4004"),
    (1978, 29000,       "Intel 8086"),
    (1989, 1180000,     "Intel 486"),
    (1999, 9500000,     "Intel Pentium III"),
    (2006, 291000000,   "Intel Core 2 Duo"),
    (2012, 1400000000,  "Intel Core i7-3770"),
    (2020, 16000000000, "Apple M1"),
    (2024, 28000000000, "Apple M4 Max"),
]

years  = [c[0] for c in chips]
counts = [c[1] for c in chips]
labels = [c[2] for c in chips]

# ── Moore's Law line ──
moore_years = np.linspace(1970, 2026, 200)
moore_counts = 2300 * (2 ** ((moore_years - 1971) / 2))

# ── Figure setup ──
fig, ax = plt.subplots(figsize=(14, 8.5))
fig.patch.set_facecolor('white')
ax.set_facecolor('white')

# Moore's Law
ax.plot(moore_years, moore_counts, 'b--', linewidth=1.8, alpha=0.7,
        label="무어의 법칙 (Moore's Law, 2년마다 2배)")

# Actual data
ax.scatter(years, counts, c='red', s=80, zorder=5,
           label="실측 데이터 (Actual Data)")

# ── Label positioning (Bishop feedback #1, #3) ──
# Offsets: (dx, dy_factor) — dy_factor multiplies the count for log-scale offset
# (xytext_x, xytext_y, ha)  — absolute data coords for precise control
label_positions = {
    "Intel 4004":          (1972.5, 7000,        'left'),
    "Intel 8086":          (1980,   12000,       'left'),
    "Intel 486":           (1984,   350000,      'left'),
    "Intel Pentium III":   (2001,   25000000,    'left'),
    "Intel Core 2 Duo":   (2001,   800000000,   'left'),
    "Intel Core i7-3770": (2013.5, 3000000000,  'left'),    # FIX: near 2012 point
    "Apple M1":           (2014,   30000000000,  'left'),
    "Apple M4 Max":       (2017,   80000000000, 'left'),    # FIX: left with margin
}

for yr, cnt, lbl in chips:
    tx, ty, ha = label_positions[lbl]
    
    ax.annotate(
        lbl,
        xy=(yr, cnt),
        xytext=(tx, ty),
        fontsize=10,
        fontweight='medium',
        ha=ha,
        va='center',
        bbox=dict(boxstyle='round,pad=0.3', facecolor='#f0f0f0', edgecolor='#cccccc', alpha=0.85),
        arrowprops=dict(arrowstyle='-', color='#888888', lw=0.8),
    )

# ── Axes ──
ax.set_yscale('log')
ax.set_xlim(1968, 2028)
ax.set_ylim(1e3, 5e11)

ax.set_xlabel("연도 (Year)", fontsize=13)
ax.set_ylabel("트랜지스터 수 (Transistor Count, 로그 스케일)", fontsize=13)
ax.set_title("트랜지스터 집적도의 성장 (1971–2024)", fontsize=16, fontweight='bold', pad=15)

ax.xaxis.set_major_locator(ticker.MultipleLocator(10))
ax.grid(True, which='major', linestyle='-', alpha=0.15)
ax.grid(True, which='minor', linestyle='-', alpha=0.07)

# ── Legend (Bishop feedback #2: Korean bilingual) ──
ax.legend(loc='upper left', fontsize=11, framealpha=0.9)

plt.tight_layout()
out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/01_01/transistor_growth.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
