#!/usr/bin/env python3
"""04_03_img01: 랜덤 분할 vs 시간 기반 분할 — R² 비교 바 차트"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np

# 한글 폰트 설정
for font_name in ['AppleGothic', 'NanumGothic']:
    try:
        fm.findfont(font_name, fallback_to_default=False)
        plt.rcParams['font.family'] = font_name
        break
    except:
        continue

plt.rcParams['axes.unicode_minus'] = False

# 데이터
splits = ["랜덤 분할\n(오프라인)", "시간 기반 분할\n(오프라인)", "실전 배포\n(온라인)"]
r2_values = [0.95, 0.85, 0.70]
colors = ["#e85d5d", "#4a90d9", "#888888"]

fig, ax = plt.subplots(figsize=(8, 5), dpi=300)

# 바 차트
bars = ax.bar(range(3), r2_values, color=colors, width=0.55, edgecolor='white', linewidth=1.5, zorder=3)

# 바 위에 R² 값 레이블
for i, (bar, val) in enumerate(zip(bars, r2_values)):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.008,
            f'R² = {val:.2f}', ha='center', va='bottom', fontsize=13, fontweight='bold',
            color=colors[i])

# 수평선: 실전 최소 요구 수준
ax.axhline(y=0.80, linestyle='--', color='#2ecc71', linewidth=1.5, zorder=2)
ax.text(2.42, 0.805, '실전 최소 요구 수준', ha='right', va='bottom', fontsize=9,
        color='#2ecc71', fontstyle='italic')

# Bracket annotation 1: 랜덤 분할의 환상 (bar 0 → bar 2)
bracket_y1 = 0.97
ax.annotate('', xy=(0, bracket_y1), xytext=(2, bracket_y1),
            arrowprops=dict(arrowstyle='<->', color='#e85d5d', lw=1.8))
ax.text(1, bracket_y1 + 0.012, '랜덤 분할의 환상 — 0.25 갭!', ha='center', va='bottom',
        fontsize=10, fontweight='bold', color='#e85d5d',
        bbox=dict(boxstyle='round,pad=0.3', facecolor='#fff0f0', edgecolor='#e85d5d', alpha=0.9))

# Bracket annotation 2: 실전 갭 (bar 1 → bar 2)
bracket_y2 = 0.88
ax.annotate('', xy=(1, bracket_y2), xytext=(2, bracket_y2),
            arrowprops=dict(arrowstyle='<->', color='#4a90d9', lw=1.5))
ax.text(1.5, bracket_y2 + 0.012, '실전 갭 0.15\n(관리 가능)', ha='center', va='bottom',
        fontsize=9, fontweight='bold', color='#4a90d9',
        bbox=dict(boxstyle='round,pad=0.3', facecolor='#f0f5ff', edgecolor='#4a90d9', alpha=0.9))

# 축 설정
ax.set_xticks(range(3))
ax.set_xticklabels(splits, fontsize=11)
ax.set_ylabel('R² (결정계수)', fontsize=12, fontweight='bold')
ax.set_xlabel('분할 방법 / 배포 단계', fontsize=12, fontweight='bold')
ax.set_ylim(0.5, 1.08)
ax.set_xlim(-0.5, 2.5)

# 격자선
ax.yaxis.grid(True, linestyle=':', alpha=0.5, zorder=0)
ax.set_axisbelow(True)

# 제목
ax.set_title('랜덤 분할 vs 시간 기반 분할 — R² 비교', fontsize=14, fontweight='bold', pad=15)

# 스타일 정리
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_alpha(0.3)
ax.spines['bottom'].set_alpha(0.3)

plt.tight_layout()

output_path = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/04_03/random_vs_time_split_r2.png"
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
print(f"Saved: {output_path}")
