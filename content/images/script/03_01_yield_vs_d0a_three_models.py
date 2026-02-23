import matplotlib.pyplot as plt
import numpy as np
import os

# Set style first to avoid overriding font settings
try:
    plt.style.use('seaborn-v0_8-whitegrid')
except:
    plt.style.use('seaborn-whitegrid')

# Set font for Korean support
plt.rcParams['font.family'] = 'AppleGothic'
plt.rcParams['axes.unicode_minus'] = False

# Data generation
x = np.linspace(0, 3.0, 301)
# Handle x=0 for Murphy to avoid division by zero
# Murphy formula: ((1 - exp(-x)) / x)**2 * 100
# limit x->0 is 1.
murphy_y = np.zeros_like(x)
mask_nonzero = x > 1e-9
murphy_y[mask_nonzero] = ((1 - np.exp(-x[mask_nonzero])) / x[mask_nonzero])**2 * 100
murphy_y[~mask_nonzero] = 100.0

poisson_y = np.exp(-x) * 100
nb_alpha2_y = (1 + x/2)**(-2) * 100
nb_alpha5_y = (1 + x/5)**(-5) * 100

# Plot setup
plt.figure(figsize=(10, 6))

# Plot curves
plt.plot(x, poisson_y, label=r'Poisson: $Y = e^{-D_0A}$', color='#E74C3C', linestyle='-')
plt.plot(x, murphy_y, label=r'Murphy: $Y = ((1-e^{-D_0A})/(D_0A))^2$', color='#3498DB', linestyle='--')
plt.plot(x, nb_alpha2_y, label=r'Neg. Binomial ($\alpha=2$): $Y = (1+D_0A/\alpha)^{-\alpha}$', color='#2ECC71', linestyle='-.')
plt.plot(x, nb_alpha5_y, label=r'Neg. Binomial ($\alpha=5$): $Y = (1+D_0A/\alpha)^{-\alpha}$', color='#F39C12', linestyle=':')

# Annotations
# Note: Use r'$D_0$' for subscript 0 as requested
# Annotation 1
plt.annotate(r'H100 (~8.1cm², $D_0$=0.1)' + '\n' + r'$D_0A \approx 0.81$', 
             xy=(0.81, 44.5), 
             xytext=(1.2, 55),
             arrowprops=dict(facecolor='black', shrink=0.05, width=1.5, headwidth=8),
             fontsize=10,
             bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="gray", alpha=0.9))

# Annotation 2
plt.annotate(r'모바일 AP (~1cm²)' + '\n' + r'$D_0A \approx 0.1$', 
             xy=(0.1, 90.5), 
             xytext=(0.4, 80),
             arrowprops=dict(facecolor='black', shrink=0.05, width=1.5, headwidth=8),
             fontsize=10,
             bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="gray", alpha=0.9))

# Labels and Title
# Title uses LaTeX for D0 to avoid unicode glyph issues
plt.title(r'$D_0 \times A$ 대비 수율 — Poisson, Murphy, Negative Binomial 비교', fontsize=14, pad=15)
plt.xlabel(r'$D_0 \times A$ (Defect Density $\times$ Die Area)', fontsize=12)
plt.ylabel('Yield (%)', fontsize=12)

# Axes limits
plt.xlim(0, 3.0)
plt.ylim(0, 100)

# Grid
plt.grid(True, linestyle='--', alpha=0.7)

# Legend
plt.legend(fontsize=10, loc='best', frameon=True, framealpha=0.9)

# Layout
plt.tight_layout()

# Save
output_path = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/03_01/yield_vs_d0a_three_models.png"
# Create directory if not exists (already checked but good practice)
os.makedirs(os.path.dirname(output_path), exist_ok=True)

plt.savefig(output_path, dpi=300, bbox_inches='tight')
print(f"Saved to {output_path}")
