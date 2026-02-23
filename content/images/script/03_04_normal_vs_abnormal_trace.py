import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

# Configuration
plt.rcParams['font.family'] = 'AppleGothic'
plt.rcParams['axes.unicode_minus'] = False
plt.rcParams['figure.dpi'] = 300

# Data
normal_time = [0, 2, 4, 5, 5.5, 6, 10, 20, 30, 40, 50, 55, 56, 57, 58, 60]
normal_power = [0, 0, 0, 50, 200, 500, 500, 500, 500, 500, 500, 500, 200, 50, 0, 0]

abnormal_time = [0, 2, 4, 5, 5.5, 6, 10, 20, 25, 25.05, 25.1, 25.5, 30, 35, 35.1, 35.15, 35.5, 40, 50, 55, 56, 57, 58, 60]
abnormal_power = [0, 0, 0, 50, 200, 500, 500, 500, 500, 120, 480, 500, 500, 500, 80, 450, 500, 500, 500, 500, 200, 50, 0, 0]

phases = [
    {"start": 0, "end": 5, "label": "Stabilization", "color": "#FADBD8"},
    {"start": 5, "end": 55, "label": "Main Etch", "color": "#D5F5E3"},
    {"start": 55, "end": 60, "label": "Purge", "color": "#D6EAF8"}
]

anomalies = [
    {"time": 25, "value": 120, "label": "Arcing\nevent ①", "color": "#E74C3C"},
    {"time": 35, "value": 80, "label": "Arcing\nevent ②", "color": "#E74C3C"}
]

# Create Figure
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(11, 8), sharex=True)

# --- Subplot 1: Normal Trace ---
ax1.plot(normal_time, normal_power, color="#3498DB", linewidth=1.5, label="Normal Trace (Golden Reference)")
ax1.set_title("정상 Trace (Golden Reference)", fontsize=14, pad=10)
ax1.set_ylabel("RF Power (W)")
ax1.grid(True, linestyle='--', alpha=0.7)

# Add Phases (Background colors and labels)
legend_patches = [] # To create a custom legend if needed, but plotting data usually handles legend
for phase in phases:
    ax1.axvspan(phase["start"], phase["end"], color=phase["color"], alpha=0.5)
    # Add phase label in the center of the region, near top
    mid_point = (phase["start"] + phase["end"]) / 2
    ax1.text(mid_point, 550, phase["label"], ha='center', va='bottom', fontsize=10, fontweight='bold', color='#555555')

# FIX: Legend location and opacity
# Using 'lower center' to avoid overlap with 'Stabilization' (top-left) and 'Purge' (top-right)
# The area under the curve (which is at 500W) is empty.
ax1.legend(loc='lower center', framealpha=1.0, facecolor='white', edgecolor='gray')
ax1.set_ylim(-50, 650) # Give some headroom for labels

# --- Subplot 2: Abnormal Trace ---
ax2.plot(abnormal_time, abnormal_power, color="#E74C3C", linewidth=1.5, label="Abnormal Trace (RF Arcing)")
ax2.set_title("이상 Trace (RF Arcing 이벤트)", fontsize=14, pad=10)
ax2.set_xlabel("시간 (초)")
ax2.set_ylabel("RF Power (W)")
ax2.grid(True, linestyle='--', alpha=0.7)
ax2.set_ylim(-50, 650) # Consistent y-axis

# Add Anomaly Markers
for anomaly in anomalies:
    ax2.plot(anomaly["time"], anomaly["value"], 'o', color=anomaly["color"], markersize=8, markeredgecolor='black')
    ax2.annotate(anomaly["label"], 
                 xy=(anomaly["time"], anomaly["value"]), 
                 xytext=(anomaly["time"], anomaly["value"] - 150),
                 arrowprops=dict(facecolor='black', arrowstyle='->'),
                 ha='center', fontsize=10, color='black',
                 bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="black", alpha=0.8))

ax2.legend(loc='upper right', framealpha=1.0, facecolor='white', edgecolor='gray')

# --- Annotation Box ---
summary_text = "Summary(평균)으로는 두 Trace의 차이가 미미\n→ Summary 기반 FDC는 이상 미탐지\n→ Trace 분석만이 순간적 이상(Transient) 포착"
plt.figtext(0.5, 0.02, summary_text, ha='center', fontsize=12, 
            bbox=dict(boxstyle="round,pad=0.5", fc="#f9f9f9", ec="#cccccc"))

plt.tight_layout(rect=[0, 0.1, 1, 1]) # Adjust layout to make room for bottom text

# Save
output_path = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/03_04/normal_vs_abnormal_trace.png"
plt.savefig(output_path, dpi=300, bbox_inches='tight')
print(f"Graph saved to: {output_path}")
