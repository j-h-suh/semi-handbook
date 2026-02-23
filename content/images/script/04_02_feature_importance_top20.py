#!/usr/bin/env python3
"""Regenerate feature_importance_top20.png — fix count, red label meaning, Korean."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# ── Top 20 features (exactly 20) ──
features = [
    ("Chamber_Press_Mean",     24.5, False, "챔버 압력 평균"),
    ("Temp_Zone1_Max",          8.7, True,  "온도존1 최대"),
    ("RF_Power_Forward",        8.6, False, "RF 전력 순방향"),
    ("Gas_Flow_C4F8",           7.3, False, "C4F8 가스 유량"),
    ("Temp_Zone2_Mean",         7.3, True,  "온도존2 평균"),
    ("Wafer_Bias_Voltage",      7.2, False, "웨이퍼 바이어스 전압"),
    ("Time_Step_Duration",      5.4, False, "스텝 지속 시간"),
    ("He_Backside_Pressure",    4.4, False, "He 배면 압력"),
    ("ESC_Temp",                3.9, False, "ESC 온도"),
    ("Gas_Ratio_O2_Ar",         3.6, False, "O2/Ar 가스 비율"),
    ("Plasma_Impedance",        2.5, False, "플라즈마 임피던스"),
    ("Valve_Position_A",        2.3, False, "밸브 A 위치"),
    ("Source_Power_Mean",       1.8, False, "소스 전력 평균"),
    ("Temp_Zone3_Min",          1.7, True,  "온도존3 최소"),
    ("Pressure_Stab_Time",      1.1, False, "압력 안정화 시간"),
    ("Gas_Flow_O2_Variance",    1.0, False, "O2 유량 분산"),
    ("Endpoint_Detector",       1.0, False, "엔드포인트 검출"),
    ("RF_Match_Capacitor",      1.0, False, "RF 매칭 커패시터"),
    ("Chamber_Wall_Temp",       0.6, False, "챔버 벽면 온도"),
    ("Etch_Rate_Monitor",       0.5, False, "식각률 모니터"),
]

names = [f[0] for f in features]
values = [f[1] for f in features]
is_temp = [f[2] for f in features]
kr_names = [f[3] for f in features]

# Colors: temperature-related features highlighted
colors = ['#e53935' if t else '#1E88E5' for t in is_temp]

# ── Figure ──
fig, ax = plt.subplots(figsize=(13, 10))
fig.patch.set_facecolor('white')

y_pos = np.arange(len(names))[::-1]
bars = ax.barh(y_pos, values, color=colors, edgecolor='#333', linewidth=0.4, height=0.7)

# Labels: English (Korean)
display_names = [f'{n}\n({kr})' for n, kr in zip(names, kr_names)]
ax.set_yticks(y_pos)
ax.set_yticklabels(display_names, fontsize=8.5)

# Value labels
for i, v in enumerate(values):
    ax.text(v + 0.3, y_pos[i], f'{v}%', va='center', fontsize=9, fontweight='bold')

ax.set_title('피처 중요도 상위 20 (XGBoost)\nTop 20 Feature Importance',
             fontsize=15, fontweight='bold', pad=12)
ax.set_xlabel('상대 중요도 (%)', fontsize=12)
ax.set_xlim(0, 28)
ax.grid(axis='x', alpha=0.2, linestyle='--')

# Legend explaining color
import matplotlib.patches as mpatches
legend_elements = [
    mpatches.Patch(facecolor='#1E88E5', edgecolor='#333', label='일반 피처'),
    mpatches.Patch(facecolor='#e53935', edgecolor='#333',
                   label='온도 관련 피처 (온도존 상관관계 주의)'),
]
ax.legend(handles=legend_elements, loc='lower right', fontsize=10, framealpha=0.95)

plt.tight_layout()
out = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/04_02/feature_importance_top20.png"
fig.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {out}")
