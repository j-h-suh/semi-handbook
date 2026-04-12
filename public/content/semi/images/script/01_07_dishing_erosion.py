#!/usr/bin/env python3
"""Generate CMP Dishing and Erosion SVG - 01_07_img03"""

output_path = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/01_07/dishing_erosion.svg"

COPPER = "#e8a030"
DIELECTRIC = "#e8e8e0"
IDEAL_SURFACE = "#5de85d"
ACTUAL_SURFACE = "#e85d5d"
TEXT_COLOR = "#333333"
SUBSTRATE_COLOR = "#c8ddf0"

W = 700
H = 400

svg = []
svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">')
svg.append('<defs>')
svg.append('  <style>')
svg.append(f'    text {{ font-family: "Noto Sans KR", "AppleGothic", "Malgun Gothic", sans-serif; fill: {TEXT_COLOR}; }}')
svg.append('  </style>')
svg.append('</defs>')
svg.append(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')

# Title
svg.append(f'<text x="{W/2}" y="24" text-anchor="middle" style="font-size:14px; font-weight:700;">CMP 디싱(Dishing)과 에로전(Erosion) 현상</text>')

# Layout: Top row = Ideal, Bottom row = Actual (with dishing + erosion)
# Each row has a cross-section showing Cu lines in ILD

margin_x = 50
margin_y = 45
section_w = W - 2 * margin_x
section_h = 120
gap = 40

def draw_cross_section(svg, ox, oy, w, h, label, is_ideal=True):
    """Draw a cross-section with Cu lines in ILD"""
    
    # Background substrate
    svg.append(f'<rect x="{ox}" y="{oy}" width="{w}" height="{h}" fill="{SUBSTRATE_COLOR}" stroke="#a0b8d0" stroke-width="0.5" rx="2"/>')
    
    # Surface line y
    surface_y = oy + 15
    
    # Define Cu pattern: mix of narrow dense, wide isolated
    # Left side: dense narrow Cu lines
    # Middle: wide Cu area
    # Right side: dense narrow Cu lines
    
    dense_region_w = w * 0.25
    wide_region_w = w * 0.2
    
    # Draw ILD and Cu
    # Full ILD background
    svg.append(f'<rect x="{ox}" y="{surface_y}" width="{w}" height="{h - 15}" fill="{DIELECTRIC}" stroke="none"/>')
    
    # --- Left region: isolated wide ILD with sparse Cu ---
    region1_x = ox
    region1_w = w * 0.2
    # One narrow Cu line
    cu_x = region1_x + region1_w * 0.5 - 4
    cu_w = 8
    svg.append(f'<rect x="{cu_x}" y="{surface_y}" width="{cu_w}" height="{h - 20}" fill="{COPPER}" stroke="#c08020" stroke-width="0.3"/>')
    
    # Label: sparse
    svg.append(f'<text x="{region1_x + region1_w/2}" y="{oy + h - 3}" text-anchor="middle" style="font-size:7px; fill:#888;">희소 패턴</text>')
    
    # --- Middle-left: Dense narrow Cu lines ---
    region2_x = ox + w * 0.2
    region2_w = w * 0.25
    num_dense = 7
    dense_cu_w = region2_w / (num_dense * 2)
    for i in range(num_dense):
        cx = region2_x + region2_w / (num_dense) * i + dense_cu_w * 0.5
        svg.append(f'<rect x="{cx}" y="{surface_y}" width="{dense_cu_w}" height="{h - 20}" fill="{COPPER}" stroke="#c08020" stroke-width="0.2"/>')
    
    svg.append(f'<text x="{region2_x + region2_w/2}" y="{oy + h - 3}" text-anchor="middle" style="font-size:7px; fill:#888;">밀집 패턴</text>')
    
    # --- Center: Wide Cu area ---
    region3_x = ox + w * 0.45
    region3_w = w * 0.2
    wide_cu_x = region3_x + 5
    wide_cu_w = region3_w - 10
    svg.append(f'<rect x="{wide_cu_x}" y="{surface_y}" width="{wide_cu_w}" height="{h - 20}" fill="{COPPER}" stroke="#c08020" stroke-width="0.3"/>')
    
    svg.append(f'<text x="{region3_x + region3_w/2}" y="{oy + h - 3}" text-anchor="middle" style="font-size:7px; fill:#888;">넓은 Cu</text>')
    
    # --- Right: Dense narrow Cu lines ---
    region4_x = ox + w * 0.65
    region4_w = w * 0.2
    for i in range(num_dense):
        cx = region4_x + region4_w / (num_dense) * i + dense_cu_w * 0.5
        svg.append(f'<rect x="{cx}" y="{surface_y}" width="{dense_cu_w}" height="{h - 20}" fill="{COPPER}" stroke="#c08020" stroke-width="0.2"/>')
    
    svg.append(f'<text x="{region4_x + region4_w/2}" y="{oy + h - 3}" text-anchor="middle" style="font-size:7px; fill:#888;">밀집 패턴</text>')
    
    # --- Far right: sparse ---
    region5_x = ox + w * 0.85
    region5_w = w * 0.15
    cu_x5 = region5_x + region5_w * 0.5 - 4
    svg.append(f'<rect x="{cu_x5}" y="{surface_y}" width="{cu_w}" height="{h - 20}" fill="{COPPER}" stroke="#c08020" stroke-width="0.3"/>')
    
    if is_ideal:
        # Perfect flat surface
        svg.append(f'<line x1="{ox - 5}" y1="{surface_y}" x2="{ox + w + 5}" y2="{surface_y}" stroke="{IDEAL_SURFACE}" stroke-width="2.5"/>')
        svg.append(f'<text x="{ox + w + 8}" y="{surface_y + 3}" style="font-size:8px; fill:{IDEAL_SURFACE}; font-weight:600;">이상적 평탄면</text>')
    else:
        # Non-ideal surface with dishing and erosion
        # Build path for actual surface
        # Dishing: wide Cu area dips down
        # Erosion: dense Cu+ILD regions sink overall
        
        dishing_depth = 12
        erosion_depth = 8
        
        # Surface path points
        pts = []
        pts.append(f"M{ox - 5},{surface_y}")  # start
        
        # Left sparse region - mostly flat
        pts.append(f"L{region1_x + region1_w},{surface_y}")
        
        # Dense region - erosion (overall sinking)
        pts.append(f"C{region2_x + 5},{surface_y} {region2_x + 10},{surface_y + erosion_depth} {region2_x + 15},{surface_y + erosion_depth}")
        pts.append(f"L{region2_x + region2_w - 10},{surface_y + erosion_depth}")
        pts.append(f"C{region2_x + region2_w - 5},{surface_y + erosion_depth} {region2_x + region2_w},{surface_y} {region2_x + region2_w + 5},{surface_y}")
        
        # Transition to wide Cu
        pts.append(f"L{wide_cu_x},{surface_y}")
        
        # Dishing in wide Cu area
        pts.append(f"C{wide_cu_x + 10},{surface_y} {wide_cu_x + wide_cu_w*0.3},{surface_y + dishing_depth} {wide_cu_x + wide_cu_w/2},{surface_y + dishing_depth}")
        pts.append(f"C{wide_cu_x + wide_cu_w*0.7},{surface_y + dishing_depth} {wide_cu_x + wide_cu_w - 10},{surface_y} {wide_cu_x + wide_cu_w},{surface_y}")
        
        # Transition
        pts.append(f"L{region4_x},{surface_y}")
        
        # Dense region - erosion
        pts.append(f"C{region4_x + 5},{surface_y} {region4_x + 10},{surface_y + erosion_depth} {region4_x + 15},{surface_y + erosion_depth}")
        pts.append(f"L{region4_x + region4_w - 10},{surface_y + erosion_depth}")
        pts.append(f"C{region4_x + region4_w - 5},{surface_y + erosion_depth} {region4_x + region4_w},{surface_y} {region4_x + region4_w + 5},{surface_y}")
        
        # Far right
        pts.append(f"L{ox + w + 5},{surface_y}")
        
        path_d = " ".join(pts)
        svg.append(f'<path d="{path_d}" fill="none" stroke="{ACTUAL_SURFACE}" stroke-width="2.5"/>')
        
        # Ideal surface reference (dashed)
        svg.append(f'<line x1="{ox - 5}" y1="{surface_y}" x2="{ox + w + 5}" y2="{surface_y}" stroke="{IDEAL_SURFACE}" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>')
        
        # Dishing annotation
        dish_cx = wide_cu_x + wide_cu_w / 2
        svg.append(f'<line x1="{dish_cx}" y1="{surface_y}" x2="{dish_cx}" y2="{surface_y + dishing_depth}" stroke="#c04040" stroke-width="1"/>')
        svg.append(f'<line x1="{dish_cx - 8}" y1="{surface_y}" x2="{dish_cx + 8}" y2="{surface_y}" stroke="#c04040" stroke-width="0.5"/>')
        svg.append(f'<line x1="{dish_cx - 8}" y1="{surface_y + dishing_depth}" x2="{dish_cx + 8}" y2="{surface_y + dishing_depth}" stroke="#c04040" stroke-width="0.5"/>')
        svg.append(f'<text x="{dish_cx + 12}" y="{surface_y + dishing_depth/2 + 3}" style="font-size:8px; fill:#c04040; font-weight:600;">디싱</text>')
        svg.append(f'<text x="{dish_cx + 12}" y="{surface_y + dishing_depth/2 + 12}" style="font-size:7px; fill:#c04040;">Dishing</text>')
        
        # Erosion annotation (on the left dense region)
        ero_cx = region2_x + region2_w / 2
        svg.append(f'<line x1="{ero_cx}" y1="{surface_y}" x2="{ero_cx}" y2="{surface_y + erosion_depth}" stroke="#4040c0" stroke-width="1"/>')
        svg.append(f'<line x1="{ero_cx - 8}" y1="{surface_y}" x2="{ero_cx + 8}" y2="{surface_y}" stroke="#4040c0" stroke-width="0.5"/>')
        svg.append(f'<line x1="{ero_cx - 8}" y1="{surface_y + erosion_depth}" x2="{ero_cx + 8}" y2="{surface_y + erosion_depth}" stroke="#4040c0" stroke-width="0.5"/>')
        svg.append(f'<text x="{ero_cx - 12}" y="{surface_y + erosion_depth/2 + 3}" text-anchor="end" style="font-size:8px; fill:#4040c0; font-weight:600;">에로전</text>')
        svg.append(f'<text x="{ero_cx - 12}" y="{surface_y + erosion_depth/2 + 12}" text-anchor="end" style="font-size:7px; fill:#4040c0;">Erosion</text>')
        
        # Surface labels
        svg.append(f'<text x="{ox + w + 8}" y="{surface_y + 3}" style="font-size:7px; fill:{IDEAL_SURFACE};">이상적 표면</text>')
        svg.append(f'<text x="{ox + w + 8}" y="{surface_y + 13}" style="font-size:7px; fill:{ACTUAL_SURFACE};">실제 표면</text>')
    
    # Section label
    svg.append(f'<text x="{ox}" y="{oy - 5}" style="font-size:11px; font-weight:700;">{label}</text>')


# Draw ideal section
draw_cross_section(svg, margin_x, margin_y, section_w, section_h, "① 이상적 CMP 결과 (Ideal)", is_ideal=True)

# Draw actual section
draw_cross_section(svg, margin_x, margin_y + section_h + gap, section_w, section_h, "② 실제 CMP 결과 (Actual — 디싱 + 에로전)", is_ideal=False)

# Legend at bottom
legend_y = H - 30
svg.append(f'<rect x="{margin_x}" y="{legend_y}" width="12" height="12" fill="{COPPER}" stroke="#c08020" stroke-width="0.5"/>')
svg.append(f'<text x="{margin_x + 16}" y="{legend_y + 10}" style="font-size:9px;">Cu (구리 배선)</text>')

svg.append(f'<rect x="{margin_x + 110}" y="{legend_y}" width="12" height="12" fill="{DIELECTRIC}" stroke="#c0c0b0" stroke-width="0.5"/>')
svg.append(f'<text x="{margin_x + 126}" y="{legend_y + 10}" style="font-size:9px;">ILD (절연체)</text>')

svg.append(f'<line x1="{margin_x + 230}" y1="{legend_y + 6}" x2="{margin_x + 250}" y2="{legend_y + 6}" stroke="{IDEAL_SURFACE}" stroke-width="2.5"/>')
svg.append(f'<text x="{margin_x + 254}" y="{legend_y + 10}" style="font-size:9px;">이상적 표면</text>')

svg.append(f'<line x1="{margin_x + 340}" y1="{legend_y + 6}" x2="{margin_x + 360}" y2="{legend_y + 6}" stroke="{ACTUAL_SURFACE}" stroke-width="2.5"/>')
svg.append(f'<text x="{margin_x + 364}" y="{legend_y + 10}" style="font-size:9px;">실제 표면 (디싱+에로전)</text>')

# Pattern density note
svg.append(f'<text x="{W/2}" y="{H - 8}" text-anchor="middle" style="font-size:7px; fill:#aaa;">패턴 밀도(Pattern Density)가 높을수록 에로전 심화  |  넓은 Cu 영역일수록 디싱 심화</text>')

svg.append('</svg>')

svg_content = '\n'.join(svg)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)

print(f"Generated: {output_path}")
