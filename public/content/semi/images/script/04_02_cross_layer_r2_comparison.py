import matplotlib.pyplot as plt
import numpy as np

plt.rcParams['font.family'] = 'AppleGothic'
plt.rcParams['axes.unicode_minus'] = False

OUTPUT = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/04_02/cross_layer_r2_comparison.png"

models = ['FDC Summary\nOnly', '+ 도메인 피처', '+ Cross-Layer']
r2_values = [0.72, 0.82, 0.88]
colors = ['#4a90d9', '#2ecc71', '#e85d5d']

fig, ax = plt.subplots(figsize=(8, 5))

bars = ax.bar(range(len(models)), r2_values, color=colors, width=0.55,
              edgecolor='white', linewidth=1.5, zorder=5)

# Bar value labels
for i, (bar, val) in enumerate(zip(bars, r2_values)):
    ax.text(bar.get_x() + bar.get_width()/2, val + 0.008,
            f'R² = {val:.2f}', ha='center', va='bottom',
            fontsize=12, fontweight='bold', color=colors[i])

# Annotation arrows between bars
def draw_improvement(ax, from_idx, to_idx, text, color, y_offset=0):
    y_start = r2_values[from_idx]
    y_end = r2_values[to_idx]
    mid_x = (from_idx + to_idx) / 2
    arrow_y = max(y_start, y_end) + 0.04 + y_offset
    
    # Horizontal bracket
    ax.annotate('', xy=(from_idx, arrow_y), xytext=(to_idx, arrow_y),
                arrowprops=dict(arrowstyle='<->', color=color, lw=1.8))
    ax.text(mid_x, arrow_y + 0.012, text, ha='center', va='bottom',
            fontsize=10, fontweight='bold', color=color,
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor=color, alpha=0.9))

# +10%p between 0 and 1
draw_improvement(ax, 0, 1, '+10%p', '#2ecc71', y_offset=0)

# +6%p between 1 and 2
draw_improvement(ax, 1, 2, '+6%p', '#e85d5d', y_offset=0)

# Total +16%p between 0 and 2
draw_improvement(ax, 0, 2, '총 +16%p\n(10~30% 범위)', '#333333', y_offset=0.07)

ax.set_xticks(range(len(models)))
ax.set_xticklabels(models, fontsize=11, fontweight='bold')
ax.set_ylabel('R² (결정계수)', fontsize=12, fontweight='bold')
ax.set_title('Cross-Layer 피처 효과 — R² 비교', fontsize=14, fontweight='bold', pad=15)

ax.set_ylim(0.5, 1.08)
ax.set_xlim(-0.5, 2.5)
ax.grid(axis='y', alpha=0.3, linestyle='-')
ax.set_axisbelow(True)

# Add subtle baseline reference
ax.axhline(y=0.72, linestyle=':', color='#4a90d9', alpha=0.3, linewidth=1)

plt.tight_layout()
plt.savefig(OUTPUT, dpi=300, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {OUTPUT}")
