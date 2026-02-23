#!/usr/bin/env python3
"""Generate ResNet-18 SEM architecture SVG diagram."""

output_path = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/04_06/resnet18_sem_architecture.svg"

# Colors from spec
C_CONV = "#4a90d9"
C_RES = "#2ecc71"
C_SKIP = "#f39c12"
C_POOL = "#9b59b6"
C_FC = "#e85d5d"
C_IO = "#333333"

svg_width = 900
svg_height = 350

# Block definitions: (label_top, label_bottom, color, width, height)
blocks = [
    ("Input", "SEM 64×64×1", C_IO, 50, 80),
    ("Conv1", "7×7, 64, s2", C_CONV, 45, 90),
    ("MaxPool", "3×3, s2", C_POOL, 40, 70),
    ("ResBlock 1", "[3×3, 64]×2", C_RES, 55, 100),
    ("ResBlock 2", "[3×3, 128]×2", C_RES, 55, 110),
    ("ResBlock 3", "[3×3, 256]×2", C_RES, 55, 120),
    ("ResBlock 4", "[3×3, 512]×2", C_RES, 55, 130),
    ("GAP", "Global Avg Pool", C_POOL, 40, 60),
    ("FC", "512→Classes", C_FC, 50, 70),
    ("Output", "Softmax", C_IO, 50, 60),
]

n = len(blocks)
total_block_w = sum(b[3] for b in blocks)
gap = (svg_width - 60 - total_block_w) / (n - 1)  # margins 30 each side
start_x = 30

# Calculate positions
positions = []
cx = start_x
cy = 160  # vertical center for blocks
for label_top, label_bot, color, w, h in blocks:
    positions.append((cx, cy - h // 2, w, h))
    cx += w + gap

def rect_with_text(x, y, w, h, color, label_top, label_bot, opacity=0.85):
    """Generate SVG rect with centered text."""
    rx = 6
    lines = []
    lines.append(f'  <rect x="{x:.1f}" y="{y:.1f}" width="{w}" height="{h}" rx="{rx}" '
                 f'fill="{color}" fill-opacity="{opacity}" stroke="{color}" stroke-width="1.5"/>')
    # Top label (English)
    ty_top = y + h * 0.38
    lines.append(f'  <text x="{x + w/2:.1f}" y="{ty_top:.1f}" text-anchor="middle" '
                 f'font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="bold" fill="white">{label_top}</text>')
    # Bottom label (Korean/detail)
    ty_bot = y + h * 0.58
    lines.append(f'  <text x="{x + w/2:.1f}" y="{ty_bot:.1f}" text-anchor="middle" '
                 f'font-family="Arial, Helvetica, sans-serif" font-size="8" fill="white" opacity="0.9">{label_bot}</text>')
    return "\n".join(lines)

def arrow(x1, y1, x2, y2, color="#666", width=1.5):
    """Simple arrow line."""
    return (f'  <line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke="{color}" stroke-width="{width}" marker-end="url(#arrowhead)"/>')

def skip_connection_arc(x1, y_top, x2, color=C_SKIP):
    """Curved skip connection arc above the block."""
    mid_x = (x1 + x2) / 2
    arc_y = y_top - 30
    return (f'  <path d="M {x1:.1f},{y_top:.1f} C {x1:.1f},{arc_y:.1f} {x2:.1f},{arc_y:.1f} {x2:.1f},{y_top:.1f}" '
            f'fill="none" stroke="{color}" stroke-width="2" stroke-dasharray="5,3" '
            f'marker-end="url(#arrowhead_skip)"/>')

# Build SVG
parts = []
parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_width} {svg_height}" '
             f'width="{svg_width}" height="{svg_height}" font-family="Arial, Helvetica, sans-serif">')

# Background
parts.append(f'  <rect width="{svg_width}" height="{svg_height}" fill="#fafbfc" rx="8"/>')

# Defs: arrowheads
parts.append('''  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#666"/>
    </marker>
    <marker id="arrowhead_skip" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#f39c12"/>
    </marker>
  </defs>''')

# Title
parts.append(f'  <text x="{svg_width/2}" y="22" text-anchor="middle" font-size="14" font-weight="bold" fill="#222">ResNet-18 Architecture — SEM Defect Classification</text>')

# Draw blocks
for i, (label_top, label_bot, color, w, h) in enumerate(blocks):
    x, y, bw, bh = positions[i]
    parts.append(rect_with_text(x, y, bw, bh, color, label_top, label_bot))

# Draw arrows between blocks
for i in range(n - 1):
    x1 = positions[i][0] + positions[i][2]  # right edge
    y1 = cy
    x2 = positions[i + 1][0]  # left edge of next
    y2 = cy
    parts.append(arrow(x1, y1, x2, y2))

# Draw skip connections for ResBlocks (indices 3,4,5,6)
for i in [3, 4, 5, 6]:
    bx, by, bw, bh = positions[i]
    # Arc from left edge top to right edge top
    arc_x1 = bx + 8
    arc_x2 = bx + bw - 8
    arc_y = by
    parts.append(skip_connection_arc(arc_x1, arc_y, arc_x2))

# Skip connection label
res1_x, res1_y, res1_w, res1_h = positions[3]
parts.append(f'  <text x="{res1_x + res1_w/2:.1f}" y="{res1_y - 35:.1f}" text-anchor="middle" '
             f'font-size="8" fill="{C_SKIP}" font-weight="bold">Skip Connection</text>')

# Annotations at bottom
annotations = [
    "Skip Connection → 기울기 소실 방지, 잔차 학습",
    "SEM 64×64 → ResNet-18이면 충분 (더 깊은 모델은 오버피팅 위험)",
    "출력: 10~50개 결함 클래스 (Bridge / Break / Particle / Residue / ...)"
]

# Output class labels
ox, oy, ow, oh = positions[-1]
output_labels = ["Bridge", "Break", "Particle", "Residue", "..."]
for j, lbl in enumerate(output_labels):
    ly = oy + oh + 12 + j * 11
    parts.append(f'  <text x="{ox + ow/2:.1f}" y="{ly:.1f}" text-anchor="middle" '
                 f'font-size="7" fill="#555">{lbl}</text>')

# Annotation box at the bottom
ann_y = 265
parts.append(f'  <rect x="20" y="{ann_y}" width="{svg_width - 40}" height="75" rx="5" '
             f'fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>')
for k, ann in enumerate(annotations):
    parts.append(f'  <text x="35" y="{ann_y + 18 + k * 22}" font-size="9" fill="#444">• {ann}</text>')

# "downsample" labels for ResBlock 2,3,4
for i in [4, 5, 6]:
    bx, by, bw, bh = positions[i]
    parts.append(f'  <text x="{bx + bw/2:.1f}" y="{by + bh + 14:.1f}" text-anchor="middle" '
                 f'font-size="7" fill="#888" font-style="italic">↓ downsample</text>')

parts.append('</svg>')

svg_content = "\n".join(parts)

with open(output_path, "w", encoding="utf-8") as f:
    f.write(svg_content)

print(f"SVG saved to: {output_path}")
print(f"Size: {len(svg_content)} bytes")
