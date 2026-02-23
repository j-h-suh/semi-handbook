#!/usr/bin/env python3
"""Generate RC Delay vs Gate Delay matplotlib chart - 01_07_img04"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np

output_path = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/01_07/rc_delay_vs_gate_delay.png"

# Try to set Korean font
korean_fonts = ['AppleGothic', 'NanumGothic', 'Malgun Gothic']
font_set = False
for font_name in korean_fonts:
    font_paths = [f.fname for f in fm.fontManager.ttflist if font_name in f.name]
    if font_paths:
        plt.rcParams['font.family'] = font_name
        font_set = True
        print(f"Using font: {font_name}")
        break

if not font_set:
    print("Warning: Korean font not found, using default")

plt.rcParams['axes.unicode_minus'] = False

# Data
data = [
    {"node_nm": 250, "gate_delay_ps": 20, "rc_delay_ps": 5},
    {"node_nm": 180, "gate_delay_ps": 14, "rc_delay_ps": 8},
    {"node_nm": 130, "gate_delay_ps": 10, "rc_delay_ps": 12},
    {"node_nm": 90, "gate_delay_ps": 7, "rc_delay_ps": 18},
    {"node_nm": 65, "gate_delay_ps": 5, "rc_delay_ps": 25},
    {"node_nm": 45, "gate_delay_ps": 3.5, "rc_delay_ps": 35},
    {"node_nm": 28, "gate_delay_ps": 2.5, "rc_delay_ps": 50},
    {"node_nm": 14, "gate_delay_ps": 1.5, "rc_delay_ps": 70},
]

nodes = [d["node_nm"] for d in data]
gate_delays = [d["gate_delay_ps"] for d in data]
rc_delays = [d["rc_delay_ps"] for d in data]

# Create figure
fig, ax = plt.subplots(figsize=(10, 6), dpi=300)

# Plot
ax.plot(nodes, gate_delays, 'o-', color='#2878b5', linewidth=2.5, markersize=8,
        label='게이트 지연 (Gate Delay)', markerfacecolor='white', markeredgewidth=2, zorder=5)
ax.plot(nodes, rc_delays, 's-', color='#c44e52', linewidth=2.5, markersize=8,
        label='배선 RC 지연 (Interconnect RC Delay)', markerfacecolor='white', markeredgewidth=2, zorder=5)

# Fill between to show crossover
nodes_arr = np.array(nodes)
gate_arr = np.array(gate_delays)
rc_arr = np.array(rc_delays)
ax.fill_between(nodes, gate_delays, rc_delays, 
                where=[g >= r for g, r in zip(gate_delays, rc_delays)],
                alpha=0.08, color='#2878b5', interpolate=True)
ax.fill_between(nodes, gate_delays, rc_delays, 
                where=[r >= g for g, r in zip(gate_delays, rc_delays)],
                alpha=0.08, color='#c44e52', interpolate=True)

# Log scale, inverted x
ax.set_xscale('log')
ax.invert_xaxis()
ax.set_xticks(nodes)
ax.set_xticklabels([f"{n}" for n in nodes])

# Labels
ax.set_xlabel('공정 노드 (nm)', fontsize=12, fontweight='bold')
ax.set_ylabel('지연 시간 (ps)', fontsize=12, fontweight='bold')
ax.set_title('RC 지연 vs 게이트 지연 트렌드', fontsize=15, fontweight='bold', pad=15)

# Grid
ax.grid(True, alpha=0.3, linestyle='--')
ax.set_axisbelow(True)

# Legend
ax.legend(loc='upper left', fontsize=10, framealpha=0.9, edgecolor='#cccccc')

# Annotations
# Crossover point at ~130nm
ax.annotate('크로스오버\n(RC > Gate)', 
            xy=(130, 11), 
            xytext=(90, 40),
            fontsize=9, fontweight='bold', color='#666',
            ha='center',
            arrowprops=dict(arrowstyle='->', color='#888', lw=1.5),
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#ffffdd', edgecolor='#cccc88', alpha=0.9))

# Cu + Low-k adoption
ax.annotate('Cu + Low-k\n도입', 
            xy=(180, 8), 
            xytext=(250, 30),
            fontsize=9, fontweight='bold', color='#4a8a4a',
            ha='center',
            arrowprops=dict(arrowstyle='->', color='#4a8a4a', lw=1.5),
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#eeffee', edgecolor='#88cc88', alpha=0.9))

# Note
fig.text(0.98, 0.02, '※ 추정치. 정확한 값은 설계/공정에 따라 다름', 
         ha='right', va='bottom', fontsize=7, color='#aaaaaa', style='italic')

# Y-axis range
ax.set_ylim(0, 80)

plt.tight_layout()
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
plt.close()

print(f"Generated: {output_path}")
