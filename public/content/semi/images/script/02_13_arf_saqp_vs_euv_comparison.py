#!/usr/bin/env python3
"""Fix 02_13/arf_saqp_vs_euv_sp_comparison.png
Bishop FAIL:
1. 비용/정확도 비교 데이터 부재
2. 범례 부재
3. 전체 영문 → 한글 병기 필요
4. 바 간격 과대, 여백 비효율
"""
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# --- Comparison data (normalized to 5-point scale for radar-like grouped bar) ---
metrics = [
    '공정 단계 수\n(Process Steps)',
    '웨이퍼당 비용\n(Cost/Wafer)',
    '오버레이 정확도\n(Overlay)',
    'CD 균일도\n(CD Uniformity)',
    '설계 자유도\n(Design Flexibility)',
    '처리량\n(Throughput, WPH)',
]

# Raw values for annotation
raw_arf = ['~8 단계', '~1.0x (상대)', '< 1nm\n(자기정렬)', '보통\n(다중 에치)', '제한적\n(1D 패턴)', '~60 WPH']
raw_euv = ['~2 단계', '~1.3x (상대)', '~1.5nm\n(스캐너 정밀도)', '우수\n(단일 노광)', '자유\n(2D 가능)', '~100 WPH']

# Scores (1-5 scale, higher = better)
# ArF SAQP: many steps(1), low cost(4), great overlay(5), moderate CDU(3), limited design(2), low throughput(2)
# EUV SP:   few steps(5), higher cost(3), good overlay(3.5), great CDU(4.5), full design(5), high throughput(4.5)
scores_arf = [1, 4, 5, 3, 2, 2]
scores_euv = [5, 3, 3.5, 4.5, 5, 4.5]

n = len(metrics)
x = np.arange(n)
bar_width = 0.35

fig, ax = plt.subplots(figsize=(14, 8), dpi=200)

bars_arf = ax.barh(x + bar_width/2, scores_arf, bar_width,
                    color='#FF8A65', edgecolor='#E64A19', linewidth=1.2,
                    label='ArF SAQP (자기정렬 4중 패터닝)', zorder=3)
bars_euv = ax.barh(x - bar_width/2, scores_euv, bar_width,
                    color='#64B5F6', edgecolor='#1565C0', linewidth=1.2,
                    label='EUV 단일 패터닝 (Single Patterning)', zorder=3)

# Add raw value annotations inside/beside bars
for i, (bar_a, bar_e) in enumerate(zip(bars_arf, bars_euv)):
    # ArF
    w_a = bar_a.get_width()
    ax.text(w_a + 0.1, bar_a.get_y() + bar_a.get_height()/2,
            raw_arf[i], va='center', ha='left', fontsize=8, color='#BF360C',
            fontweight='bold')
    # EUV
    w_e = bar_e.get_width()
    ax.text(w_e + 0.1, bar_e.get_y() + bar_e.get_height()/2,
            raw_euv[i], va='center', ha='left', fontsize=8, color='#0D47A1',
            fontweight='bold')

# Score labels inside bars
for i, (bar_a, bar_e) in enumerate(zip(bars_arf, bars_euv)):
    w_a = bar_a.get_width()
    if w_a > 1.5:
        ax.text(w_a - 0.15, bar_a.get_y() + bar_a.get_height()/2,
                f'{scores_arf[i]:.0f}', va='center', ha='right', fontsize=10,
                color='white', fontweight='bold')
    w_e = bar_e.get_width()
    if w_e > 1.5:
        ax.text(w_e - 0.15, bar_e.get_y() + bar_e.get_height()/2,
                f'{scores_euv[i]:.3g}', va='center', ha='right', fontsize=10,
                color='white', fontweight='bold')

ax.set_yticks(x)
ax.set_yticklabels(metrics, fontsize=10)
ax.set_xlabel('평가 점수 (1 = 불리, 5 = 유리)', fontsize=11, fontweight='bold')
ax.set_xlim(0, 7.5)
ax.set_ylim(-0.5, n - 0.5)

ax.set_title('ArF SAQP vs EUV 단일 패터닝 비교\n(ArF SAQP vs EUV Single Patterning Comparison)',
             fontsize=14, fontweight='bold', pad=15, color='#1A237E')

# Legend (upper right, outside of dense bar area)
ax.legend(loc='upper right', fontsize=10, framealpha=0.95,
          edgecolor='#CCCCCC', fancybox=True, borderpad=0.8)

# Summary annotation (bottom, clear area)
summary_text = (
    '핵심: ArF SAQP는 비용/오버레이 유리하나 공정 복잡 · '
    'EUV SP는 단순 공정 + 설계 자유도 우수하나 장비 비용 높음'
)
ax.text(0.5, -0.12, summary_text, transform=ax.transAxes,
        fontsize=9, va='top', ha='center', style='italic',
        color='#424242')

ax.grid(True, axis='x', alpha=0.3, linestyle='-', linewidth=0.5)
ax.set_axisbelow(True)
ax.invert_yaxis()

plt.tight_layout()

output_path = '/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/02_13/arf_saqp_vs_euv_sp_comparison.png'
fig.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {output_path}")
