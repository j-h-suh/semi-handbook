#!/usr/bin/env python3
"""Fix 02_14/euv_scanner_installation_trend.png
Bishop FAIL:
1. 주석 박스에 화살표 없어 연결 대상 모호
2. High-NA 350M이 우축 범위 밖
3. ASP가 Low-NA only인지 blended인지 불명확
4. 2025 전망치 미표기(E)
5. 전체 영문
"""
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# --- Data ---
years = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025(E)']
x = np.arange(len(years))

# Cumulative installed base by company (approximate, ASML reports)
tsmc =    [2,  7, 16, 30, 52, 72, 88, 100, 110]
samsung = [1,  3,  9, 16, 24, 32, 40, 46,  52]
intel =   [0,  1,  4,  7, 10, 14, 16, 18,  20]
others =  [0,  1,  3,  5,  6,  8,  8,  8,   9]
total =   [3, 12, 32, 58, 92, 126, 152, 172, 191]

# ASP (Low-NA only, $M)
asp_lowna = [120, 130, 140, 150, 160, 175, 180, 190, 200]
# High-NA ASP ($M)
asp_highna = 350

fig, ax1 = plt.subplots(figsize=(14, 8), dpi=200)
ax2 = ax1.twinx()

bar_width = 0.65

# Stacked bars
b1 = ax1.bar(x, tsmc, bar_width, color='#E53935', edgecolor='#B71C1C',
             linewidth=0.8, label='TSMC', zorder=3)
b2 = ax1.bar(x, samsung, bar_width, bottom=tsmc, color='#1E88E5',
             edgecolor='#0D47A1', linewidth=0.8, label='Samsung', zorder=3)
bottom2 = [t + s for t, s in zip(tsmc, samsung)]
b3 = ax1.bar(x, intel, bar_width, bottom=bottom2, color='#43A047',
             edgecolor='#1B5E20', linewidth=0.8, label='Intel', zorder=3)
bottom3 = [b + i for b, i in zip(bottom2, intel)]
b4 = ax1.bar(x, others, bar_width, bottom=bottom3, color='#FDD835',
             edgecolor='#F9A825', linewidth=0.8, label='기타 (Others)', zorder=3)

# Total labels on top of bars
for i, t in enumerate(total):
    ax1.text(i, t + 2, str(t), ha='center', va='bottom', fontsize=9,
             fontweight='bold', color='#333333')

# ASP line (right axis) — Low-NA only
asp_line, = ax2.plot(x, asp_lowna, 'k--o', linewidth=2, markersize=6,
                      zorder=4, label='대당 가격 (ASP, Low-NA only)')

# High-NA ASP indicator (star marker at 2025)
ax2.plot(8, asp_highna, '*', color='#7B1FA2', markersize=15, zorder=5)
ax2.annotate(f'High-NA EUV (EXE:5000)\n~{asp_highna}M$/대\n(~3.5~5억 달러)',
             xy=(8, asp_highna), xytext=(5.5, asp_highna + 20),
             fontsize=9, fontweight='bold', color='#7B1FA2',
             bbox=dict(boxstyle='round,pad=0.4', facecolor='#F3E5F5',
                       edgecolor='#7B1FA2', alpha=0.95),
             arrowprops=dict(arrowstyle='->', color='#7B1FA2', lw=1.8,
                            connectionstyle='arc3,rad=-0.2'),
             zorder=5)

# --- Key event annotations with ARROWS ---
# TSMC N7+ mass production (2019)
ax1.annotate('TSMC N7+ 양산 시작\n(EUV 본격 도입)',
             xy=(2, total[2]), xytext=(0.3, 80),
             fontsize=9, color='#C62828',
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#FFEBEE',
                       edgecolor='#C62828', alpha=0.9),
             arrowprops=dict(arrowstyle='->', color='#C62828', lw=1.5),
             zorder=5)

# Investment scale (2024)
ax1.annotate('1대당 ~4억 달러\n총 투자 ~800억 달러 (2024 누적)',
             xy=(7, total[7]), xytext=(4.5, 145),
             fontsize=8.5, color='#0D47A1',
             bbox=dict(boxstyle='round,pad=0.3', facecolor='#E3F2FD',
                       edgecolor='#1565C0', alpha=0.9),
             arrowprops=dict(arrowstyle='->', color='#1565C0', lw=1.5),
             zorder=5)

# --- Axes ---
ax1.set_xlabel('연도', fontsize=12, fontweight='bold')
ax1.set_ylabel('누적 EUV 스캐너 설치 대수', fontsize=11, fontweight='bold',
               color='#333333')
ax2.set_ylabel('대당 가격 (백만 달러, Low-NA only)', fontsize=11,
               fontweight='bold', color='#333333')

ax1.set_xticks(x)
ax1.set_xticklabels(years, fontsize=10)
ax1.set_ylim(0, 210)
ax2.set_ylim(0, 420)  # Extended to fit High-NA ~350M

ax1.set_title('전 세계 EUV 스캐너 누적 설치 추이 (2017-2025E)\n'
              'Global EUV Scanner Cumulative Installation Trend',
              fontsize=14, fontweight='bold', pad=15, color='#1A237E')

# Combined legend
handles1, labels1 = ax1.get_legend_handles_labels()
handles2, labels2 = ax2.get_legend_handles_labels()
# Add High-NA marker to legend
highna_marker = plt.Line2D([0], [0], marker='*', color='w', markerfacecolor='#7B1FA2',
                            markersize=12, label='High-NA ASP (~350M$)')
ax1.legend(handles=handles1 + handles2 + [highna_marker],
           loc='upper left', fontsize=9, framealpha=0.95,
           edgecolor='#CCCCCC', fancybox=True, borderpad=0.8)

ax1.grid(True, axis='y', alpha=0.3, linestyle='-', linewidth=0.5)
ax1.set_axisbelow(True)

plt.tight_layout()

output_path = '/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/02_14/euv_scanner_installation_trend.png'
fig.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {output_path}")
