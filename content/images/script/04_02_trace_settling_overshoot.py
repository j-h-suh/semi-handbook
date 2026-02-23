#!/usr/bin/env python3
"""Fix trace_settling_overshoot.png
Bishop FAIL 피드백:
1. 범례에 ±2% 밴드/Rise Time/Settling Time 3항목 누락
2. Rise Time 정의 미명시 (10%→90% of setpoint)
3. 전체 영문 → 한글 병기
"""
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

# Korean font
plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# --- Generate step response (2nd order underdamped system) ---
# Parameters tuned for readable plot (rise ~0.35s, settling ~3.2s)
zeta = 0.28   # damping ratio (underdamped)
wn = 4.5      # natural frequency
setpoint = 100.0  # °C

t = np.linspace(0, 11, 4000)
wd = wn * np.sqrt(1 - zeta**2)
response = setpoint * (1 - np.exp(-zeta * wn * t) * (
    np.cos(wd * t) + (zeta / np.sqrt(1 - zeta**2)) * np.sin(wd * t)))

# Key metrics
overshoot_val = np.max(response)
overshoot_pct = (overshoot_val - setpoint) / setpoint * 100
overshoot_idx = np.argmax(response)
overshoot_time = t[overshoot_idx]

# Rise time: 10% to 90% of setpoint
rise_10_idx = np.argmax(response >= setpoint * 0.10)
rise_90_idx = np.argmax(response >= setpoint * 0.90)
t_rise_10 = t[rise_10_idx]
t_rise_90 = t[rise_90_idx]
rise_time = t_rise_90 - t_rise_10

# Settling time: last time response exits ±2% band
band_upper = setpoint * 1.02
band_lower = setpoint * 0.98
not_settled = np.where(np.abs(response - setpoint) > setpoint * 0.02)[0]
if len(not_settled) > 0:
    settling_time_val = t[not_settled[-1]]
else:
    settling_time_val = 0

print(f"Rise Time (10%→90%): {rise_time:.2f}s (t10={t_rise_10:.2f}, t90={t_rise_90:.2f})")
print(f"Overshoot: {overshoot_pct:.1f}% at t={overshoot_time:.2f}s")
print(f"Settling Time (±2%): {settling_time_val:.1f}s")

# --- Plot ---
fig, ax = plt.subplots(figsize=(14, 7.5), dpi=200)

# ±2% settling band
band_fill = ax.fill_between(t, band_lower, band_upper, 
                             color='#4CAF50', alpha=0.15, zorder=1)

# Setpoint line
setpoint_line, = ax.plot(t, np.full_like(t, setpoint), 
                          'k--', linewidth=1.8, zorder=2)

# Process variable (step response)
pv_line, = ax.plot(t, response, 'b-', linewidth=2.5, zorder=3)

# --- Rise Time visualization ---
# Horizontal reference lines at 10% and 90%
ax.hlines(y=setpoint * 0.10, xmin=0, xmax=t_rise_10 + 0.3,
          color='#888888', linestyle=':', linewidth=0.8, alpha=0.6)
ax.hlines(y=setpoint * 0.90, xmin=0, xmax=t_rise_90 + 0.3,
          color='#888888', linestyle=':', linewidth=0.8, alpha=0.6)

# Vertical green dotted lines at 10% and 90% crossing
rise_vline_10 = ax.axvline(x=t_rise_10, color='#2E7D32', linestyle=':', 
                            linewidth=1.5, alpha=0.7, zorder=2)
rise_vline_90 = ax.axvline(x=t_rise_90, color='#2E7D32', linestyle=':', 
                            linewidth=1.5, alpha=0.7, zorder=2)

# Rise time double-headed arrow
arrow_y = 22
ax.annotate('', xy=(t_rise_90, arrow_y), xytext=(t_rise_10, arrow_y),
            arrowprops=dict(arrowstyle='<->', color='#2E7D32', lw=2.0),
            zorder=4)

# Rise time label box (above arrow, shifted right to avoid y-axis)
ax.text((t_rise_10 + t_rise_90) / 2 + 0.4, arrow_y + 5, 
        f'상승 시간 (Rise Time)\n{rise_time:.2f}s',
        ha='center', va='bottom', fontsize=9.5, fontweight='bold',
        color='#2E7D32',
        bbox=dict(boxstyle='round,pad=0.4', facecolor='white', 
                  edgecolor='#2E7D32', alpha=0.95),
        zorder=5)

# Rise time definition box (positioned to the right, clear space)
ax.annotate('정의: 설정값의 10% → 90%\n(10°C → 90°C 도달 구간)',
            xy=(t_rise_90, setpoint * 0.50),
            xytext=(t_rise_90 + 0.8, setpoint * 0.55),
            fontsize=8.5, color='#2E7D32',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#E8F5E9', 
                      edgecolor='#2E7D32', alpha=0.85),
            arrowprops=dict(arrowstyle='->', color='#2E7D32', 
                           lw=1.2, connectionstyle='arc3,rad=0.2'),
            zorder=5)

# 10%, 90% labels on left
ax.text(-0.15, setpoint * 0.10, '10%', fontsize=8, color='#555555',
        ha='right', va='center')
ax.text(-0.15, setpoint * 0.90, '90%', fontsize=8, color='#555555',
        ha='right', va='center')

# Crossing point markers
ax.plot(t_rise_10, setpoint * 0.10, 'o', color='#2E7D32', 
        markersize=6, zorder=5)
ax.plot(t_rise_90, setpoint * 0.90, 'o', color='#2E7D32', 
        markersize=6, zorder=5)

# --- Settling Time visualization ---
settle_vline = ax.axvline(x=settling_time_val, color='#7B1FA2', 
                           linestyle='-.', linewidth=2.0, zorder=2)

# Settling time annotation (positioned in lower-right area)
ax.annotate(f'정착 시간 (Settling Time)\n±2% 기준: {settling_time_val:.1f}s',
            xy=(settling_time_val, setpoint * 0.50),
            xytext=(settling_time_val + 1.2, setpoint * 0.30),
            fontsize=9.5, fontweight='bold', color='#7B1FA2',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='white', 
                      edgecolor='#7B1FA2', alpha=0.95),
            arrowprops=dict(arrowstyle='->', color='#7B1FA2', lw=1.5),
            zorder=5)

# --- Overshoot annotation ---
ax.annotate(f'오버슈트 (Overshoot)\n{overshoot_pct:.1f}%\n(Δ = {overshoot_val - setpoint:.1f}°C)',
            xy=(overshoot_time, overshoot_val),
            xytext=(overshoot_time + 1.0, overshoot_val + 8),
            fontsize=9.5, fontweight='bold', color='#C62828',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#FFEBEE', 
                      edgecolor='#C62828', alpha=0.95),
            arrowprops=dict(arrowstyle='->', color='#C62828', lw=2.0),
            zorder=5)

# Peak marker
ax.plot(overshoot_time, overshoot_val, 'o', color='#C62828', 
        markersize=8, zorder=5)

# Overshoot vertical dashed line from setpoint to peak
ax.vlines(x=overshoot_time, ymin=setpoint, ymax=overshoot_val,
          color='#C62828', linestyle='--', linewidth=1.2, alpha=0.6)

# --- Legend with ALL 5 items ---
legend_elements = [
    plt.Line2D([0], [0], color='blue', linewidth=2.5, linestyle='-',
               label='공정 변수 (Process Variable)'),
    plt.Line2D([0], [0], color='black', linewidth=1.8, linestyle='--',
               label=f'목표 설정값 (Setpoint = {setpoint:.0f}°C)'),
    mpatches.Patch(facecolor='#4CAF50', alpha=0.15, edgecolor='#4CAF50',
                   label=f'±2% 정착 범위 ({band_lower:.0f}~{band_upper:.0f}°C)'),
    plt.Line2D([0], [0], color='#2E7D32', linewidth=1.5, linestyle=':',
               label=f'상승 시간 마커 (Rise Time: {rise_time:.2f}s)'),
    plt.Line2D([0], [0], color='#7B1FA2', linewidth=2.0, linestyle='-.',
               label=f'정착 시간 마커 (Settling Time: {settling_time_val:.1f}s)'),
]

ax.legend(handles=legend_elements, loc='upper right', fontsize=9,
          framealpha=0.95, edgecolor='#CCCCCC', fancybox=True,
          borderpad=0.8)

# --- Title and axes ---
ax.set_title('트레이스 분석: 스텝 응답 특성\n(Trace Analysis: Step Response Characteristics)',
             fontsize=15, fontweight='bold', pad=15, color='#1A237E')
ax.set_xlabel('시간 (초)', fontsize=12, fontweight='bold')
ax.set_ylabel('온도 (°C)', fontsize=12, fontweight='bold')

ax.set_xlim(-0.3, 11)
ax.set_ylim(-5, 160)

ax.grid(True, alpha=0.3, linestyle='-', linewidth=0.5)
ax.set_axisbelow(True)

plt.tight_layout()

# Save
output_path = '/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/04_02/trace_settling_overshoot.png'
fig.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()

print(f"Saved: {output_path}")
