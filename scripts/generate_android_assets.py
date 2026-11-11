import os
from PIL import Image, ImageDraw

ORANGE = (255, 102, 0, 255)
WHITE = (255, 255, 255, 255)
BG_OLED = (10, 10, 10, 255)
TRANSPARENT = (0, 0, 0, 0)

def draw_hn_letters(draw, cx, cy, size, stroke_w, color=WHITE):
    # Normalized 32x32 viewbox centered at cx, cy:
    # H: (7, 8) to (7, 24), crossbar (7, 16) to (13.5, 16), right stem (13.5, 8) to (13.5, 24)
    # N: (18.5, 24) to (18.5, 8), diagonal (18.5, 8) to (25, 24), right stem (25, 24) to (25, 8)
    def pt(gx, gy):
        x = cx - size / 2.0 + (gx / 32.0) * size
        y = cy - size / 2.0 + (gy / 32.0) * size
        return (x, y)

    w = max(int(stroke_w), 1)
    r = stroke_w / 2.0

    # Draw H
    p_h_tl = pt(7.0, 8.0)
    p_h_bl = pt(7.0, 24.0)
    p_h_ml = pt(7.0, 16.0)
    p_h_mr = pt(13.5, 16.0)
    p_h_tr = pt(13.5, 8.0)
    p_h_br = pt(13.5, 24.0)

    draw.line([p_h_tl, p_h_bl], fill=color, width=w)
    draw.line([p_h_ml, p_h_mr], fill=color, width=w)
    draw.line([p_h_tr, p_h_br], fill=color, width=w)

    # Draw N
    p_n_bl = pt(18.5, 24.0)
    p_n_tl = pt(18.5, 8.0)
    p_n_br = pt(25.0, 24.0)
    p_n_tr = pt(25.0, 8.0)

    draw.line([p_n_bl, p_n_tl], fill=color, width=w)
    draw.line([p_n_tl, p_n_br], fill=color, width=w)
    draw.line([p_n_br, p_n_tr], fill=color, width=w)

    # Round caps for nice finish
    for p in [p_h_tl, p_h_bl, p_h_tr, p_h_br, p_n_bl, p_n_tl, p_n_br, p_n_tr]:
        draw.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=color)

def create_launcher_icon(target_size, is_round=False):
    scale = 4
    canvas_size = target_size * scale
    img = Image.new('RGBA', (canvas_size, canvas_size), TRANSPARENT)
    draw = ImageDraw.Draw(img)

    margin = int(canvas_size * 0.05)
    box_rect = [margin, margin, canvas_size - margin, canvas_size - margin]

    if is_round:
        draw.ellipse(box_rect, fill=ORANGE)
    else:
        radius = int(canvas_size * 0.22)
        draw.rounded_rectangle(box_rect, radius=radius, fill=ORANGE)

    # Draw white HN
    letters_size = canvas_size * 0.74
    stroke_w = letters_size * (2.85 / 32.0)
    draw_hn_letters(draw, canvas_size / 2.0, canvas_size / 2.0, letters_size, stroke_w, WHITE)

    return img.resize((target_size, target_size), Image.Resampling.LANCZOS)

def create_adaptive_foreground(target_size):
    scale = 4
    canvas_size = target_size * scale
    img = Image.new('RGBA', (canvas_size, canvas_size), TRANSPARENT)
    draw = ImageDraw.Draw(img)

    # In adaptive foreground, draw inside safe area (center ~50%)
    letters_size = canvas_size * 0.50
    stroke_w = letters_size * (3.0 / 32.0)
    draw_hn_letters(draw, canvas_size / 2.0, canvas_size / 2.0, letters_size, stroke_w, WHITE)

    return img.resize((target_size, target_size), Image.Resampling.LANCZOS)

def create_splash_screen(width, height):
    img = Image.new('RGBA', (width, height), BG_OLED)
    draw = ImageDraw.Draw(img)

    min_dim = min(width, height)
    box_size = int(min_dim * 0.25)
    box_size = max(box_size, 96)
    box_size = min(box_size, 256)

    cx = width / 2.0
    cy = height / 2.0
    half = box_size / 2.0
    radius = int(box_size * 0.22)

    draw.rounded_rectangle(
        [cx - half, cy - half, cx + half, cy + half],
        radius=radius,
        fill=ORANGE
    )

    letters_size = box_size * 0.74
    stroke_w = letters_size * (2.85 / 32.0)
    draw_hn_letters(draw, cx, cy, letters_size, stroke_w, WHITE)

    return img

def main():
    res_base = 'android/app/src/main/res'
    
    # 1. Mipmap launcher icons
    mipmaps = {
        'mipmap-mdpi': (48, 108),
        'mipmap-hdpi': (72, 162),
        'mipmap-xhdpi': (96, 216),
        'mipmap-xxhdpi': (144, 324),
        'mipmap-xxxhdpi': (192, 432),
    }

    for folder, (launcher_sz, fg_sz) in mipmaps.items():
        folder_path = os.path.join(res_base, folder)
        os.makedirs(folder_path, exist_ok=True)

        # Standard icon
        icon = create_launcher_icon(launcher_sz, is_round=False)
        icon.save(os.path.join(folder_path, 'ic_launcher.png'), 'PNG')

        # Round icon
        round_icon = create_launcher_icon(launcher_sz, is_round=True)
        round_icon.save(os.path.join(folder_path, 'ic_launcher_round.png'), 'PNG')

        # Foreground
        fg_icon = create_adaptive_foreground(fg_sz)
        fg_icon.save(os.path.join(folder_path, 'ic_launcher_foreground.png'), 'PNG')

        print(f"Generated HN icons for {folder}")

    # 2. Splash drawables
    splashes = {
        'drawable': (480, 320),
        'drawable-land-mdpi': (480, 320),
        'drawable-land-hdpi': (800, 480),
        'drawable-land-xhdpi': (1280, 720),
        'drawable-land-xxhdpi': (1600, 960),
        'drawable-land-xxxhdpi': (1920, 1280),
        'drawable-port-mdpi': (320, 480),
        'drawable-port-hdpi': (480, 800),
        'drawable-port-xhdpi': (720, 1280),
        'drawable-port-xxhdpi': (960, 1600),
        'drawable-port-xxxhdpi': (1280, 1920),
    }

    for folder, (w, h) in splashes.items():
        folder_path = os.path.join(res_base, folder)
        os.makedirs(folder_path, exist_ok=True)
        splash_img = create_splash_screen(w, h)
        splash_img.save(os.path.join(folder_path, 'splash.png'), 'PNG')

    # 3. Public Web / PWA icons
    pwa512 = create_launcher_icon(512, is_round=False)
    pwa512.save('public/pwa-512x512.png', 'PNG')

    pwa192 = create_launcher_icon(192, is_round=False)
    pwa192.save('public/pwa-192x192.png', 'PNG')
    pwa192.save('public/apple-touch-icon.png', 'PNG')

    print("All HN icons and splash screens successfully generated!")

if __name__ == '__main__':
    main()
