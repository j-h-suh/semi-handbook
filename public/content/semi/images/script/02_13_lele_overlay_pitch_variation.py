#!/usr/bin/env python3
"""Fix 02_13/lele_overlay_pitch_variation.png
Bishop FAIL:
1. 우측 끝 L2 바 잘림(clipping)
2. Small Space 텍스트가 바와 겹침
3. 오버레이 오차 수치(δ) 미표기
4. 전체 영문
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

fig = plt.figure(figsize=(15, 10), dpi=200)

# Parameters
cd = 14          # nm, line width (CD)
final_pitch = 36 # nm, final pitch
layer_pitch = final_pitch * 2  # 72nm per layer
delta = 5        # nm, overlay error (exaggerated slightly for visibility)
n_l1 = 5
n_l2 = 5

# Positions
# L1: 0, 72, 144, 216, 288
# L2 ideal: 36, 108, 180, 252, 324  (centered between L1)
l1_pos = [i * layer_pitch for i in range(n_l1)]
l2_pos_ideal = [final_pitch + i * layer_pitch for i in range(n_l2)]
l2_pos_error = [p + delta for p in l2_pos_ideal]

# Spaces
space_ideal = final_pitch - cd  # 36-14 = 22nm
space_large = space_ideal + delta  # 25nm
space_small = space_ideal - delta  # 19nm

# Colors
c_l1 = '#1565C0'
c_l2 = '#C62828'
c_l1_f = '#90CAF9'
c_l2_f = '#EF9A9A'

bar_h = 40  # visual height in nm units
max_x = l2_pos_error[-1] + cd + 25

# === Panel 1: Ideal LELE ===
ax1 = fig.add_axes([0.06, 0.52, 0.90, 0.38])

for x in l1_pos:
    ax1.add_patch(mpatches.Rectangle((x, 0), cd, bar_h, 
                  facecolor=c_l1, edgecolor='#0D47A1', linewidth=1))
for x in l2_pos_ideal:
    ax1.add_patch(mpatches.Rectangle((x, 0), cd, bar_h,
                  facecolor=c_l2, edgecolor='#8E0000', linewidth=1))

# Space annotation (L1[0] → L2[0])
ax1.annotate('', xy=(l2_pos_ideal[0], bar_h + 5),
             xytext=(l1_pos[0] + cd, bar_h + 5),
             arrowprops=dict(arrowstyle='<->', color='#2E7D32', lw=2))
ax1.text((l1_pos[0] + cd + l2_pos_ideal[0]) / 2, bar_h + 8,
         f'간격 = {space_ideal}nm', ha='center', va='bottom',
         fontsize=10, color='#2E7D32', fontweight='bold')

# Space annotation (L2[0] → L1[1])
ax1.annotate('', xy=(l1_pos[1], bar_h + 5),
             xytext=(l2_pos_ideal[0] + cd, bar_h + 5),
             arrowprops=dict(arrowstyle='<->', color='#2E7D32', lw=2))
ax1.text((l2_pos_ideal[0] + cd + l1_pos[1]) / 2, bar_h + 8,
         f'간격 = {space_ideal}nm', ha='center', va='bottom',
         fontsize=10, color='#2E7D32', fontweight='bold')

# Pitch annotation
ax1.annotate('', xy=(l1_pos[1], -8),
             xytext=(l1_pos[0], -8),
             arrowprops=dict(arrowstyle='<->', color='black', lw=1.5))
ax1.text((l1_pos[0] + l1_pos[1]) / 2, -12,
         f'피치 (Pitch) = {final_pitch}nm', ha='center', va='top',
         fontsize=10, fontweight='bold')

ax1.set_xlim(-10, max_x)
ax1.set_ylim(-20, bar_h + 25)
ax1.set_title('▲ 이상적 LELE (오버레이 오차 = 0) — 균일한 간격, 피치 변동 없음',
              fontsize=11, fontweight='bold', color='#1565C0', pad=5, loc='left')
ax1.axis('off')

# === Panel 2: Overlay Error ===
ax2 = fig.add_axes([0.06, 0.05, 0.90, 0.38])

for x in l1_pos:
    ax2.add_patch(mpatches.Rectangle((x, 0), cd, bar_h,
                  facecolor=c_l1_f, edgecolor='#1565C0', linewidth=1))
for x in l2_pos_error:
    ax2.add_patch(mpatches.Rectangle((x, 0), cd, bar_h,
                  facecolor=c_l2_f, edgecolor='#C62828', linewidth=1))

# Large space (L1[0] → L2[0])
ax2.annotate('', xy=(l2_pos_error[0], bar_h + 5),
             xytext=(l1_pos[0] + cd, bar_h + 5),
             arrowprops=dict(arrowstyle='<->', color='#E65100', lw=2))
ax2.text((l1_pos[0] + cd + l2_pos_error[0]) / 2, bar_h + 8,
         f'넓은 간격\n{space_large}nm', ha='center', va='bottom',
         fontsize=9.5, color='#E65100', fontweight='bold')

# Small space (L2[0] → L1[1])
ax2.annotate('', xy=(l1_pos[1], bar_h + 5),
             xytext=(l2_pos_error[0] + cd, bar_h + 5),
             arrowprops=dict(arrowstyle='<->', color='#B71C1C', lw=2))
ax2.text((l2_pos_error[0] + cd + l1_pos[1]) / 2, bar_h + 8,
         f'좁은 간격\n{space_small}nm', ha='center', va='bottom',
         fontsize=9.5, color='#B71C1C', fontweight='bold')

# Delta annotation (showing L2 shift)
# Show at L2[2] for visibility
ideal_x = l2_pos_ideal[2]
error_x = l2_pos_error[2]
ax2.annotate('', xy=(error_x + cd/2, -5),
             xytext=(ideal_x + cd/2, -5),
             arrowprops=dict(arrowstyle='->', color='#FF6F00', lw=2.5))
ax2.text((ideal_x + error_x) / 2 + cd/2, -12,
         f'δ = {delta}nm (오버레이 오차)',
         ha='center', va='top', fontsize=10, fontweight='bold', color='#FF6F00',
         bbox=dict(boxstyle='round,pad=0.4', facecolor='#FFF3E0',
                   edgecolor='#FF6F00', alpha=0.95))

# Ghost lines showing ideal L2 positions
for x in l2_pos_ideal:
    ax2.add_patch(mpatches.Rectangle((x, 0), cd, bar_h,
                  facecolor='none', edgecolor='#C62828', linewidth=0.8,
                  linestyle='--', alpha=0.4))

ax2.set_xlim(-10, max_x)
ax2.set_ylim(-22, bar_h + 25)
ax2.set_title(f'오버레이 오차 발생 시 (δ = {delta}nm)\n간격 불균일: {space_small}nm / {space_large}nm → 피치 변동 유발',
              fontsize=12, fontweight='bold', color='#C62828', pad=10)
ax2.axis('off')

# --- Legend ---
legend_elements = [
    mpatches.Patch(facecolor=c_l1, edgecolor='#0D47A1', linewidth=1,
                   label='L1 (1차 리소/에치)'),
    mpatches.Patch(facecolor=c_l2, edgecolor='#8E0000', linewidth=1,
                   label='L2 (2차 리소/에치)'),
    mpatches.Patch(facecolor='none', edgecolor='#C62828', linewidth=1,
                   linestyle='--', label='L2 이상적 위치 (점선)'),
]
fig.legend(handles=legend_elements, loc='upper right', fontsize=10,
           framealpha=0.95, edgecolor='#CCCCCC', fancybox=True,
           bbox_to_anchor=(0.97, 0.97))

fig.suptitle('LELE 오버레이 유도 피치 변동\n(LELE Overlay Induced Pitch Variation)',
             fontsize=15, fontweight='bold', color='#1A237E', y=0.98)

output_path = '/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/02_13/lele_overlay_pitch_variation.png'
fig.savefig(output_path, dpi=200, bbox_inches='tight', facecolor='white')
plt.close()
print(f"Saved: {output_path}")
print(f"Ideal space: {space_ideal}nm")
print(f"Large space: {space_large}nm, Small space: {space_small}nm")
