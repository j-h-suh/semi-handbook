#!/usr/bin/env python3
"""Generate BEOL metal layers SVG - 01_07_img01"""

output_path = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/01_07/beol_metal_layers.svg"

# Colors
COPPER = "#e8a030"
VIA = "#d08020"
ILD = "#e8e8e0"
TRANSISTOR = "#c8ddf0"
PAD = "#c0c0c0"
TEXT_COLOR = "#333333"
BRACKET_COLOR = "#555555"

W = 500
H = 800

# Define layers from bottom to top
# Each layer: (name_kr, name_en, height, metal_width_ratio, num_lines, is_metal, group)
# group: 'feol', 'contact', 'local', 'intermediate', 'global', 'pad'

layers = []

# FEOL (transistor)
layers.append(("트랜지스터", "FEOL / Transistors", 50, 0, 0, False, "feol"))
# Contact
layers.append(("컨택", "Contact", 15, 0.04, 8, True, "contact"))

# M1-M3 Local (thin, dense)
for i in range(1, 4):
    layers.append((f"M{i}", f"M{i}", 22, 0.06 + i*0.005, 6 - (i-1), True, "local"))

# M4-M9 Intermediate (gradually wider)
for i in range(4, 10):
    layers.append((f"M{i}", f"M{i}", 26 + (i-4)*3, 0.08 + (i-4)*0.02, 4, True, "intermediate"))

# M10-M15 Global (thick, wide)
for i in range(10, 16):
    layers.append((f"M{i}", f"M{i}", 32 + (i-10)*4, 0.15 + (i-10)*0.03, 3 - min(i-10, 1), True, "global"))

# Bond Pad
layers.append(("본드 패드", "Bond Pad", 30, 0.6, 1, True, "pad"))

# Calculate total height needed
total_layer_height = sum(l[2] for l in layers)
via_gap = 6  # gap between layers for via
total_vias = len(layers) - 1
total_needed = total_layer_height + total_vias * via_gap
margin_top = 50
margin_bottom = 30
margin_left = 120
margin_right = 100

# Scale factor
available_h = H - margin_top - margin_bottom
scale = available_h / total_needed

svg_parts = []
svg_parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">')
svg_parts.append('<defs>')
svg_parts.append('  <style>')
svg_parts.append('    @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&amp;display=swap");')
svg_parts.append(f'    text {{ font-family: "Noto Sans KR", "AppleGothic", "Malgun Gothic", sans-serif; fill: {TEXT_COLOR}; }}')
svg_parts.append('    .title {{ font-size: 14px; font-weight: 700; text-anchor: middle; }}')
svg_parts.append('    .label {{ font-size: 8px; text-anchor: end; }}')
svg_parts.append('    .label-en {{ font-size: 7px; fill: #666666; text-anchor: end; }}')
svg_parts.append('    .bracket-label {{ font-size: 9px; font-weight: 700; text-anchor: start; }}')
svg_parts.append('    .annotation {{ font-size: 7px; fill: #888888; }}')
svg_parts.append('  </style>')
svg_parts.append('  <pattern id="ild-pattern" patternUnits="userSpaceOnUse" width="6" height="6">')
svg_parts.append(f'    <rect width="6" height="6" fill="{ILD}"/>')
svg_parts.append('    <circle cx="3" cy="3" r="0.5" fill="#d8d8d0" opacity="0.5"/>')
svg_parts.append('  </pattern>')
svg_parts.append('</defs>')

# Background
svg_parts.append(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')

# Title
svg_parts.append(f'<text x="{W/2}" y="28" class="title">BEOL 배선 계층 구조 (M1~M15)</text>')
svg_parts.append(f'<text x="{W/2}" y="42" style="font-size:9px; text-anchor:middle; fill:#888;">Back-End-Of-Line Metal Stack Cross-Section</text>')

# Draw layers bottom to top
draw_width = W - margin_left - margin_right
current_y = H - margin_bottom

# Track bracket positions
group_positions = {}  # group -> (top_y, bottom_y)

for idx, (name_kr, name_en, height, metal_w_ratio, num_lines, is_metal, group) in enumerate(layers):
    h_scaled = height * scale
    layer_top = current_y - h_scaled
    
    # Track group positions
    if group not in group_positions:
        group_positions[group] = [layer_top, current_y]
    else:
        group_positions[group][0] = min(group_positions[group][0], layer_top)
        group_positions[group][1] = max(group_positions[group][1], current_y)
    
    # Draw ILD background
    if group == "feol":
        svg_parts.append(f'<rect x="{margin_left}" y="{layer_top}" width="{draw_width}" height="{h_scaled}" fill="{TRANSISTOR}" stroke="#a0b8d0" stroke-width="0.5" rx="2"/>')
        # Draw some transistor symbols
        gate_w = 3
        for gi in range(8):
            gx = margin_left + 20 + gi * (draw_width - 40) / 7
            gy = layer_top + h_scaled * 0.3
            gh = h_scaled * 0.4
            svg_parts.append(f'<rect x="{gx-5}" y="{gy+gh*0.3}" width="10" height="{gh*0.4}" fill="#a0c8e8" stroke="#6090b0" stroke-width="0.3"/>')
            svg_parts.append(f'<rect x="{gx-1}" y="{gy}" width="{gate_w}" height="{gh}" fill="#e05050" stroke="#a03030" stroke-width="0.3"/>')
    elif group == "pad":
        svg_parts.append(f'<rect x="{margin_left}" y="{layer_top}" width="{draw_width}" height="{h_scaled}" fill="url(#ild-pattern)" stroke="#c0c0b0" stroke-width="0.5"/>')
        # Bond pad
        pad_w = draw_width * metal_w_ratio
        pad_x = margin_left + (draw_width - pad_w) / 2
        svg_parts.append(f'<rect x="{pad_x}" y="{layer_top + 2}" width="{pad_w}" height="{h_scaled - 4}" fill="{PAD}" stroke="#909090" stroke-width="0.5" rx="2"/>')
    else:
        svg_parts.append(f'<rect x="{margin_left}" y="{layer_top}" width="{draw_width}" height="{h_scaled}" fill="url(#ild-pattern)" stroke="#c0c0b0" stroke-width="0.3"/>')
        
        if is_metal and num_lines > 0:
            line_w = draw_width * metal_w_ratio
            spacing = draw_width / (num_lines + 1)
            for li in range(num_lines):
                lx = margin_left + spacing * (li + 1) - line_w / 2
                svg_parts.append(f'<rect x="{lx}" y="{layer_top + 1}" width="{line_w}" height="{h_scaled - 2}" fill="{COPPER}" stroke="#c08020" stroke-width="0.3" rx="0.5"/>')
    
    # Label on the left
    label_y = layer_top + h_scaled / 2
    svg_parts.append(f'<text x="{margin_left - 5}" y="{label_y}" class="label" dominant-baseline="middle">{name_kr}</text>')
    if name_en != name_kr:
        svg_parts.append(f'<text x="{margin_left - 5}" y="{label_y + 9}" class="label-en" dominant-baseline="middle">{name_en}</text>')
    
    # Draw via to next layer
    if idx < len(layers) - 1:
        via_top = layer_top - via_gap * scale
        via_h = via_gap * scale
        # Draw 2-3 vias
        next_metal_w = layers[idx+1][3]
        next_num = layers[idx+1][4]
        via_count = min(num_lines if num_lines > 0 else 2, 3)
        for vi in range(via_count):
            vx = margin_left + draw_width / (via_count + 1) * (vi + 1) - 2
            svg_parts.append(f'<rect x="{vx}" y="{via_top}" width="4" height="{via_h + 2}" fill="{VIA}" stroke="#b07018" stroke-width="0.3" rx="0.5"/>')
    
    current_y = layer_top - via_gap * scale

# Draw brackets on the right side
bracket_x = margin_left + draw_width + 8
bracket_groups = [
    ("local", "로컬 배선\nLocal (M1-M3)", "#4080c0"),
    ("intermediate", "중간 배선\nIntermediate\n(M4-M9)", "#40a060"),
    ("global", "글로벌 배선\nGlobal\n(M10-M15)", "#c06040"),
]

for group_name, label, color in bracket_groups:
    if group_name in group_positions:
        top_y, bot_y = group_positions[group_name]
        mid_y = (top_y + bot_y) / 2
        bx = bracket_x
        
        # Draw bracket
        svg_parts.append(f'<path d="M{bx},{top_y} L{bx+8},{top_y} L{bx+8},{bot_y} L{bx},{bot_y}" fill="none" stroke="{color}" stroke-width="1.5"/>')
        svg_parts.append(f'<line x1="{bx+8}" y1="{mid_y}" x2="{bx+14}" y2="{mid_y}" stroke="{color}" stroke-width="1.5"/>')
        
        # Label
        lines = label.split('\n')
        for li, line in enumerate(lines):
            svg_parts.append(f'<text x="{bx+16}" y="{mid_y - (len(lines)-1)*5 + li*10}" style="font-size:7px; fill:{color}; font-weight:600;" dominant-baseline="middle">{line}</text>')

# Width annotation at bottom
svg_parts.append(f'<text x="{W/2}" y="{H - 8}" style="font-size:7px; fill:#aaa; text-anchor:middle;">배선 폭: 로컬 ~20nm → 글로벌 수 μm  |  ILD: Low-k 유전체</text>')

svg_parts.append('</svg>')

svg_content = '\n'.join(svg_parts)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)

print(f"Generated: {output_path}")
