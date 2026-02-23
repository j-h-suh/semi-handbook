#!/usr/bin/env python3
"""04_03_img02: Sliding Window 재학습 시각화 SVG"""

output_path = "/Users/jenghun.suh/Library/Mobile Documents/iCloud~md~obsidian/Documents/jenghun.suh/TheBoard/semi-handbook/images/04_03/sliding_window_visualization.svg"

# Colors
TRAIN = "#4a90d9"
TEST = "#e85d5d"
DISCARDED = "#dddddd"
PM_EVENT = "#f39c12"
BG = "#ffffff"
TEXT_DARK = "#333333"
TEXT_MID = "#666666"
LABEL_BG = "#f8f9fa"

# Layout constants
W, H = 800, 500
MARGIN_LEFT = 100
MARGIN_RIGHT = 40
CHART_LEFT = MARGIN_LEFT
CHART_RIGHT = W - MARGIN_RIGHT
CHART_W = CHART_RIGHT - CHART_LEFT
MONTH_W = CHART_W / 6  # 6 months

months = ["1월", "2월", "3월", "4월", "5월", "6월"]

# Section positions
TITLE_Y = 30
EXP_TITLE_Y = 65
EXP_START_Y = 85
SLIDE_TITLE_Y = 275
SLIDE_START_Y = 295
ROW_H = 50
BAR_H = 28
LEGEND_Y = 468

def month_x(m):
    """Get x for month index (0-based)"""
    return CHART_LEFT + m * MONTH_W

def rect(x, y, w, h, fill, opacity=1.0, rx=4):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" opacity="{opacity}" rx="{rx}" ry="{rx}"/>'

def text(x, y, content, size=12, fill=TEXT_DARK, anchor="middle", weight="normal", style="normal"):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" font-style="{style}" font-family="AppleGothic, NanumGothic, sans-serif">{content}</text>'

def line(x1, y1, x2, y2, color, width=1, dash=""):
    dash_attr = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"{dash_attr}/>'

svg_parts = []

# SVG header
svg_parts.append(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<defs>
  <filter id="shadow" x="-2%" y="-2%" width="104%" height="104%">
    <feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.1"/>
  </filter>
</defs>
<rect width="{W}" height="{H}" fill="{BG}"/>''')

# Main title
svg_parts.append(text(W/2, TITLE_Y, "Sliding Window 재학습 시각화", 16, TEXT_DARK, weight="bold"))
svg_parts.append(text(W/2, TITLE_Y + 18, "Expanding Window vs Sliding Window 비교", 11, TEXT_MID))

# ===== TIME AXIS LABELS (shared top) =====
for i, m in enumerate(months):
    cx = month_x(i) + MONTH_W / 2
    svg_parts.append(text(cx, EXP_START_Y - 5, m, 11, TEXT_MID, weight="bold"))
    # vertical gridlines
    svg_parts.append(line(month_x(i), EXP_START_Y, month_x(i), EXP_START_Y + 3 * ROW_H - 10, "#eeeeee", 1, "3,3"))

# PM Event marker line (3월 초 = month index 2, slightly after start)
pm_x = month_x(2) + 5
svg_parts.append(line(pm_x, EXP_START_Y - 12, pm_x, EXP_START_Y + 3 * ROW_H - 10, PM_EVENT, 2, "4,3"))
svg_parts.append(f'<polygon points="{pm_x-5},{EXP_START_Y - 12} {pm_x+5},{EXP_START_Y - 12} {pm_x},{EXP_START_Y - 4}" fill="{PM_EVENT}"/>')
svg_parts.append(text(pm_x, EXP_START_Y - 16, "PM", 9, PM_EVENT, weight="bold"))

# ===== EXPANDING WINDOW SECTION =====
svg_parts.append(text(50, EXP_TITLE_Y, "Expanding", 13, TRAIN, "middle", weight="bold"))
svg_parts.append(text(50, EXP_TITLE_Y + 14, "Window", 13, TRAIN, "middle", weight="bold"))

# Expanding rows
exp_rows = [
    # (train_start, train_end, test_start, test_end, label)
    (0, 3, 3, 4, "1회차"),
    (0, 4, 4, 5, "2회차"),
    (0, 5, 5, 6, "3회차"),
]

for row_i, (ts, te, vs, ve, label) in enumerate(exp_rows):
    y = EXP_START_Y + row_i * ROW_H
    
    # Row label
    svg_parts.append(text(CHART_LEFT - 10, y + BAR_H/2 + 4, label, 10, TEXT_MID, "end"))
    
    # Train bar
    tx = month_x(ts)
    tw = (te - ts) * MONTH_W - 2
    svg_parts.append(rect(tx, y, tw, BAR_H, TRAIN, 0.85))
    svg_parts.append(text(tx + tw/2, y + BAR_H/2 + 4, "Train", 10, "white", weight="bold"))
    
    # Test bar
    vx = month_x(vs)
    vw = (ve - vs) * MONTH_W - 2
    svg_parts.append(rect(vx, y, vw, BAR_H, TEST, 0.85))
    svg_parts.append(text(vx + vw/2, y + BAR_H/2 + 4, "Test", 10, "white", weight="bold"))

# Expanding annotation
exp_note_y = EXP_START_Y + 3 * ROW_H + 2
svg_parts.append(text(CHART_LEFT, exp_note_y, "⚠ 데이터 ↑ 하지만 오래된 데이터 오염 위험", 10, "#e67e22", "start", style="italic"))

# ===== DIVIDER =====
div_y = SLIDE_TITLE_Y - 15
svg_parts.append(line(30, div_y, W - 30, div_y, "#e0e0e0", 1))

# ===== SLIDING WINDOW SECTION =====
svg_parts.append(text(50, SLIDE_TITLE_Y, "Sliding", 13, "#2980b9", "middle", weight="bold"))
svg_parts.append(text(50, SLIDE_TITLE_Y + 14, "Window", 13, "#2980b9", "middle", weight="bold"))

# Time axis labels for sliding section
for i, m in enumerate(months):
    cx = month_x(i) + MONTH_W / 2
    svg_parts.append(text(cx, SLIDE_START_Y - 5, m, 11, TEXT_MID, weight="bold"))
    svg_parts.append(line(month_x(i), SLIDE_START_Y, month_x(i), SLIDE_START_Y + 3 * ROW_H - 10, "#eeeeee", 1, "3,3"))

# PM Event marker for sliding section
svg_parts.append(line(pm_x, SLIDE_START_Y - 12, pm_x, SLIDE_START_Y + 3 * ROW_H - 10, PM_EVENT, 2, "4,3"))
svg_parts.append(f'<polygon points="{pm_x-5},{SLIDE_START_Y - 12} {pm_x+5},{SLIDE_START_Y - 12} {pm_x},{SLIDE_START_Y - 4}" fill="{PM_EVENT}"/>')
svg_parts.append(text(pm_x, SLIDE_START_Y - 16, "PM", 9, PM_EVENT, weight="bold"))

# Sliding rows
slide_rows = [
    # (discarded_start, discarded_end, train_start, train_end, test_start, test_end, label)
    (None, None, 0, 3, 3, 4, "1회차"),
    (0, 1, 1, 4, 4, 5, "2회차"),
    (0, 2, 2, 5, 5, 6, "3회차"),
]

for row_i, (ds, de, ts, te, vs, ve, label) in enumerate(slide_rows):
    y = SLIDE_START_Y + row_i * ROW_H
    
    # Row label
    svg_parts.append(text(CHART_LEFT - 10, y + BAR_H/2 + 4, label, 10, TEXT_MID, "end"))
    
    # Discarded bar
    if ds is not None:
        dx = month_x(ds)
        dw = (de - ds) * MONTH_W - 2
        svg_parts.append(rect(dx, y, dw, BAR_H, DISCARDED, 0.7))
        # Strikethrough pattern
        for sx in range(int(dx), int(dx + dw), 8):
            svg_parts.append(line(sx, y, sx + 8, y + BAR_H, "#bbbbbb", 0.8))
    
    # Train bar
    tx = month_x(ts)
    tw = (te - ts) * MONTH_W - 2
    svg_parts.append(rect(tx, y, tw, BAR_H, TRAIN, 0.85))
    svg_parts.append(text(tx + tw/2, y + BAR_H/2 + 4, "Train", 10, "white", weight="bold"))
    
    # Test bar
    vx = month_x(vs)
    vw = (ve - vs) * MONTH_W - 2
    svg_parts.append(rect(vx, y, vw, BAR_H, TEST, 0.85))
    svg_parts.append(text(vx + vw/2, y + BAR_H/2 + 4, "Test", 10, "white", weight="bold"))

# Sliding annotation  
slide_note_y = SLIDE_START_Y + 3 * ROW_H + 2
svg_parts.append(text(CHART_LEFT, slide_note_y, "✓ PM 이후 데이터 자연 탈락 → 최근 2~4주 권장, 비정상성 대응", 10, "#27ae60", "start", style="italic"))

# ===== LEGEND =====
leg_x = CHART_LEFT
svg_parts.append(rect(leg_x, LEGEND_Y, 14, 14, TRAIN, rx=2))
svg_parts.append(text(leg_x + 20, LEGEND_Y + 12, "Train", 10, TEXT_DARK, "start"))

svg_parts.append(rect(leg_x + 80, LEGEND_Y, 14, 14, TEST, rx=2))
svg_parts.append(text(leg_x + 100, LEGEND_Y + 12, "Test", 10, TEXT_DARK, "start"))

svg_parts.append(rect(leg_x + 160, LEGEND_Y, 14, 14, DISCARDED, rx=2))
svg_parts.append(text(leg_x + 180, LEGEND_Y + 12, "폐기 (Sliding)", 10, TEXT_DARK, "start"))

svg_parts.append(line(leg_x + 290, LEGEND_Y + 7, leg_x + 310, LEGEND_Y + 7, PM_EVENT, 2, "4,3"))
svg_parts.append(text(leg_x + 316, LEGEND_Y + 12, "PM 이벤트", 10, PM_EVENT, "start"))

# Close SVG
svg_parts.append('</svg>')

svg_content = '\n'.join(svg_parts)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)

print(f"Saved: {output_path}")
