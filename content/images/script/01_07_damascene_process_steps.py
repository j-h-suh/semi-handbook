#!/usr/bin/env python3
"""Generate Damascene Process Steps SVG - 01_07_img02"""

output_path = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/01_07/damascene_process_steps.svg"

# Colors
DIELECTRIC = "#e8e8e0"
BARRIER = "#a0a0d0"
CU_SEED = "#e8c080"
CU_BULK = "#e8a030"
SUBSTRATE = "#c8ddf0"
TEXT_COLOR = "#333333"

W = 900
H = 400

# 2x3 grid layout
cols = 3
rows = 2
cell_w = W / cols
cell_h = H / rows
pad = 15
cross_w = cell_w - 2 * pad
cross_h = cell_h - 50  # space for title

steps = [
    {
        "title_kr": "Step 1: ILD 증착",
        "title_en": "Dielectric Deposition",
        "draw": "ild_only"
    },
    {
        "title_kr": "Step 2: Via홀 + Trench 식각",
        "title_en": "Photo/Etch (Via + Trench)",
        "draw": "etched"
    },
    {
        "title_kr": "Step 3: 배리어 메탈 증착",
        "title_en": "Barrier (TaN/Ta) Deposition",
        "draw": "barrier"
    },
    {
        "title_kr": "Step 4: Cu 씨앗층 증착",
        "title_en": "Cu Seed Layer (PVD)",
        "draw": "seed"
    },
    {
        "title_kr": "Step 5: Cu 전기도금",
        "title_en": "Cu Electroplating",
        "draw": "plating"
    },
    {
        "title_kr": "Step 6: CMP 평탄화",
        "title_en": "CMP Planarization",
        "draw": "cmp"
    }
]

svg_parts = []
svg_parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">')
svg_parts.append('<defs>')
svg_parts.append('  <style>')
svg_parts.append(f'    text {{ font-family: "Noto Sans KR", "AppleGothic", "Malgun Gothic", sans-serif; fill: {TEXT_COLOR}; }}')
svg_parts.append('  </style>')
svg_parts.append('</defs>')
svg_parts.append(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')

for idx, step in enumerate(steps):
    col = idx % cols
    row = idx // cols
    ox = col * cell_w  # origin x
    oy = row * cell_h  # origin y
    
    # Cell border
    svg_parts.append(f'<rect x="{ox+2}" y="{oy+2}" width="{cell_w-4}" height="{cell_h-4}" fill="none" stroke="#ddd" stroke-width="1" rx="4"/>')
    
    # Step number circle
    cx_num = ox + 18
    cy_num = oy + 18
    svg_parts.append(f'<circle cx="{cx_num}" cy="{cy_num}" r="10" fill="#4a7fb5" stroke="none"/>')
    svg_parts.append(f'<text x="{cx_num}" y="{cy_num+1}" text-anchor="middle" dominant-baseline="middle" style="font-size:10px; fill:white; font-weight:700;">{idx+1}</text>')
    
    # Titles
    svg_parts.append(f'<text x="{ox + 34}" y="{oy + 16}" style="font-size:10px; font-weight:700;">{step["title_kr"]}</text>')
    svg_parts.append(f'<text x="{ox + 34}" y="{oy + 28}" style="font-size:8px; fill:#888;">{step["title_en"]}</text>')
    
    # Cross-section drawing area
    dx = ox + pad
    dy = oy + 38
    dw = cross_w
    dh = cross_h - 5
    
    # Substrate (bottom layer, always present)
    sub_h = dh * 0.2
    sub_y = dy + dh - sub_h
    svg_parts.append(f'<rect x="{dx}" y="{sub_y}" width="{dw}" height="{sub_h}" fill="{SUBSTRATE}" stroke="#a0b8d0" stroke-width="0.5"/>')
    svg_parts.append(f'<text x="{dx + dw/2}" y="{sub_y + sub_h/2 + 3}" text-anchor="middle" style="font-size:7px; fill:#6090b0;">하부층 (Lower Metal)</text>')
    
    # Pre-existing metal line in substrate
    prev_metal_w = dw * 0.2
    prev_metal_h = sub_h * 0.4
    prev_metal_x = dx + dw * 0.35
    prev_metal_y = sub_y + 2
    svg_parts.append(f'<rect x="{prev_metal_x}" y="{prev_metal_y}" width="{prev_metal_w}" height="{prev_metal_h}" fill="{CU_BULK}" stroke="#c08020" stroke-width="0.3" rx="1"/>')
    
    # ILD region
    ild_h = dh * 0.6
    ild_y = sub_y - ild_h
    
    draw_type = step["draw"]
    
    # Trench and via dimensions
    trench_w = dw * 0.35
    trench_h = ild_h * 0.4
    trench_x = dx + dw * 0.25
    trench_y = ild_y
    
    via_w = dw * 0.12
    via_h = ild_h * 0.55
    via_x = dx + dw * 0.35 + prev_metal_w/2 - via_w/2
    via_y = ild_y + trench_h
    
    barrier_t = 3  # barrier thickness
    seed_t = 2  # seed thickness
    
    if draw_type == "ild_only":
        svg_parts.append(f'<rect x="{dx}" y="{ild_y}" width="{dw}" height="{ild_h}" fill="{DIELECTRIC}" stroke="#c0c0b0" stroke-width="0.5"/>')
        svg_parts.append(f'<text x="{dx + dw/2}" y="{ild_y + ild_h/2}" text-anchor="middle" style="font-size:9px; fill:#999;">ILD (Low-k 유전체)</text>')
        # Arrow showing deposition direction
        arr_x = dx + dw/2
        arr_y1 = ild_y - 12
        arr_y2 = ild_y + 5
        svg_parts.append(f'<line x1="{arr_x}" y1="{arr_y1}" x2="{arr_x}" y2="{arr_y2}" stroke="#4a7fb5" stroke-width="1.5" marker-end="url(#arrowhead)"/>')
        
    elif draw_type == "etched":
        # ILD with trench + via etched out
        # Draw ILD as background
        svg_parts.append(f'<rect x="{dx}" y="{ild_y}" width="{dw}" height="{ild_h}" fill="{DIELECTRIC}" stroke="#c0c0b0" stroke-width="0.5"/>')
        # Cut out trench (white)
        svg_parts.append(f'<rect x="{trench_x}" y="{trench_y}" width="{trench_w}" height="{trench_h}" fill="white" stroke="#c0c0b0" stroke-width="0.5"/>')
        # Cut out via (white)
        svg_parts.append(f'<rect x="{via_x}" y="{via_y}" width="{via_w}" height="{via_h}" fill="white" stroke="#c0c0b0" stroke-width="0.5"/>')
        # Labels
        svg_parts.append(f'<text x="{trench_x + trench_w/2}" y="{trench_y + trench_h/2}" text-anchor="middle" style="font-size:7px; fill:#c06040;">Trench</text>')
        svg_parts.append(f'<text x="{via_x + via_w/2}" y="{via_y + via_h/2}" text-anchor="middle" style="font-size:6px; fill:#c06040;" transform="rotate(-90,{via_x + via_w/2},{via_y + via_h/2})">Via</text>')
        
    elif draw_type == "barrier":
        svg_parts.append(f'<rect x="{dx}" y="{ild_y}" width="{dw}" height="{ild_h}" fill="{DIELECTRIC}" stroke="#c0c0b0" stroke-width="0.5"/>')
        # Trench + via openings
        svg_parts.append(f'<rect x="{trench_x}" y="{trench_y}" width="{trench_w}" height="{trench_h}" fill="white" stroke="#c0c0b0" stroke-width="0.5"/>')
        svg_parts.append(f'<rect x="{via_x}" y="{via_y}" width="{via_w}" height="{via_h}" fill="white" stroke="#c0c0b0" stroke-width="0.5"/>')
        # Barrier lining (TaN/Ta)
        # Trench barrier
        svg_parts.append(f'<rect x="{trench_x}" y="{trench_y}" width="{barrier_t}" height="{trench_h}" fill="{BARRIER}" opacity="0.8"/>')
        svg_parts.append(f'<rect x="{trench_x + trench_w - barrier_t}" y="{trench_y}" width="{barrier_t}" height="{trench_h}" fill="{BARRIER}" opacity="0.8"/>')
        svg_parts.append(f'<rect x="{trench_x}" y="{trench_y + trench_h - barrier_t}" width="{trench_w}" height="{barrier_t}" fill="{BARRIER}" opacity="0.8"/>')
        # Via barrier
        svg_parts.append(f'<rect x="{via_x}" y="{via_y}" width="{barrier_t}" height="{via_h}" fill="{BARRIER}" opacity="0.8"/>')
        svg_parts.append(f'<rect x="{via_x + via_w - barrier_t}" y="{via_y}" width="{barrier_t}" height="{via_h}" fill="{BARRIER}" opacity="0.8"/>')
        # Label
        svg_parts.append(f'<text x="{trench_x - 3}" y="{trench_y + trench_h/2}" text-anchor="end" style="font-size:6px; fill:{BARRIER};">TaN/Ta</text>')
        
    elif draw_type == "seed":
        svg_parts.append(f'<rect x="{dx}" y="{ild_y}" width="{dw}" height="{ild_h}" fill="{DIELECTRIC}" stroke="#c0c0b0" stroke-width="0.5"/>')
        svg_parts.append(f'<rect x="{trench_x}" y="{trench_y}" width="{trench_w}" height="{trench_h}" fill="white" stroke="#c0c0b0" stroke-width="0.5"/>')
        svg_parts.append(f'<rect x="{via_x}" y="{via_y}" width="{via_w}" height="{via_h}" fill="white" stroke="#c0c0b0" stroke-width="0.5"/>')
        # Barrier
        svg_parts.append(f'<rect x="{trench_x}" y="{trench_y}" width="{barrier_t}" height="{trench_h}" fill="{BARRIER}" opacity="0.8"/>')
        svg_parts.append(f'<rect x="{trench_x + trench_w - barrier_t}" y="{trench_y}" width="{barrier_t}" height="{trench_h}" fill="{BARRIER}" opacity="0.8"/>')
        svg_parts.append(f'<rect x="{trench_x}" y="{trench_y + trench_h - barrier_t}" width="{trench_w}" height="{barrier_t}" fill="{BARRIER}" opacity="0.8"/>')
        svg_parts.append(f'<rect x="{via_x}" y="{via_y}" width="{barrier_t}" height="{via_h}" fill="{BARRIER}" opacity="0.8"/>')
        svg_parts.append(f'<rect x="{via_x + via_w - barrier_t}" y="{via_y}" width="{barrier_t}" height="{via_h}" fill="{BARRIER}" opacity="0.8"/>')
        # Seed layer (thinner, on top of barrier)
        bt = barrier_t
        svg_parts.append(f'<rect x="{trench_x + bt}" y="{trench_y}" width="{seed_t}" height="{trench_h - bt}" fill="{CU_SEED}" opacity="0.9"/>')
        svg_parts.append(f'<rect x="{trench_x + trench_w - bt - seed_t}" y="{trench_y}" width="{seed_t}" height="{trench_h - bt}" fill="{CU_SEED}" opacity="0.9"/>')
        svg_parts.append(f'<rect x="{trench_x + bt}" y="{trench_y + trench_h - bt - seed_t}" width="{trench_w - 2*bt}" height="{seed_t}" fill="{CU_SEED}" opacity="0.9"/>')
        svg_parts.append(f'<rect x="{via_x + bt}" y="{via_y}" width="{seed_t}" height="{via_h}" fill="{CU_SEED}" opacity="0.9"/>')
        svg_parts.append(f'<rect x="{via_x + via_w - bt - seed_t}" y="{via_y}" width="{seed_t}" height="{via_h}" fill="{CU_SEED}" opacity="0.9"/>')
        # Top surface seed
        svg_parts.append(f'<rect x="{dx}" y="{ild_y - seed_t}" width="{dw}" height="{seed_t}" fill="{CU_SEED}" opacity="0.7"/>')
        svg_parts.append(f'<text x="{dx + dw - 5}" y="{ild_y - seed_t - 2}" text-anchor="end" style="font-size:6px; fill:#c09030;">Cu Seed</text>')
        
    elif draw_type == "plating":
        svg_parts.append(f'<rect x="{dx}" y="{ild_y}" width="{dw}" height="{ild_h}" fill="{DIELECTRIC}" stroke="#c0c0b0" stroke-width="0.5"/>')
        # Fill trench and via with Cu (with barrier lining)
        svg_parts.append(f'<rect x="{trench_x}" y="{trench_y}" width="{trench_w}" height="{trench_h}" fill="{CU_BULK}"/>')
        svg_parts.append(f'<rect x="{via_x}" y="{via_y}" width="{via_w}" height="{via_h}" fill="{CU_BULK}"/>')
        # Overburden (excess Cu on top)
        overburden_h = 12
        svg_parts.append(f'<rect x="{dx}" y="{ild_y - overburden_h}" width="{dw}" height="{overburden_h}" fill="{CU_BULK}" stroke="#c08020" stroke-width="0.5" opacity="0.85"/>')
        # Slight bump over trench
        svg_parts.append(f'<ellipse cx="{trench_x + trench_w/2}" cy="{ild_y - overburden_h}" rx="{trench_w*0.6}" ry="5" fill="{CU_BULK}" stroke="#c08020" stroke-width="0.3"/>')
        svg_parts.append(f'<text x="{dx + dw/2}" y="{ild_y - overburden_h - 5}" text-anchor="middle" style="font-size:7px; fill:#c08020;">여분 Cu (Overburden)</text>')
        
    elif draw_type == "cmp":
        svg_parts.append(f'<rect x="{dx}" y="{ild_y}" width="{dw}" height="{ild_h}" fill="{DIELECTRIC}" stroke="#c0c0b0" stroke-width="0.5"/>')
        # Cu only in trench and via
        svg_parts.append(f'<rect x="{trench_x}" y="{trench_y}" width="{trench_w}" height="{trench_h}" fill="{CU_BULK}" stroke="#c08020" stroke-width="0.3"/>')
        svg_parts.append(f'<rect x="{via_x}" y="{via_y}" width="{via_w}" height="{via_h}" fill="{CU_BULK}" stroke="#c08020" stroke-width="0.3"/>')
        # CMP surface line (flat, green)
        svg_parts.append(f'<line x1="{dx - 5}" y1="{ild_y}" x2="{dx + dw + 5}" y2="{ild_y}" stroke="#5de85d" stroke-width="2" stroke-dasharray="4,2"/>')
        svg_parts.append(f'<text x="{dx + dw + 5}" y="{ild_y - 3}" text-anchor="end" style="font-size:7px; fill:#4ab84a;">CMP 연마면</text>')
        # Labels for Cu line and via
        svg_parts.append(f'<text x="{trench_x + trench_w/2}" y="{trench_y + trench_h/2 + 3}" text-anchor="middle" style="font-size:7px; fill:white; font-weight:600;">Cu 배선</text>')
        svg_parts.append(f'<text x="{via_x + via_w/2}" y="{via_y + via_h/2}" text-anchor="middle" style="font-size:5px; fill:white;" transform="rotate(-90,{via_x+via_w/2},{via_y+via_h/2})">Via</text>')

    # Step number arrow between steps
    if idx < 5 and idx != 2:  # arrows between cells in same row
        arr_sx = ox + cell_w - 3
        arr_sy = oy + cell_h / 2
        svg_parts.append(f'<text x="{arr_sx}" y="{arr_sy}" style="font-size:14px; fill:#4a7fb5;" text-anchor="middle" dominant-baseline="middle">→</text>')

# Arrow from step 3 to step 4 (row transition)
arr_x3 = 2 * cell_w + cell_w/2
arr_y3 = cell_h - 3
svg_parts.append(f'<path d="M{arr_x3},{arr_y3} L{arr_x3},{arr_y3+5} L{pad},{arr_y3+5} L{pad},{cell_h + 15}" fill="none" stroke="#4a7fb5" stroke-width="1.5" marker-end="url(#arrowhead)"/>')

# Arrow marker definition
svg_parts.insert(2, '<defs><marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><polygon points="0 0, 6 2, 0 4" fill="#4a7fb5"/></marker></defs>')

svg_parts.append('</svg>')

svg_content = '\n'.join(svg_parts)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)

print(f"Generated: {output_path}")
