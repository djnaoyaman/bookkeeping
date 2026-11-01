"""Export platform sizes from the unchanged selected merchant emblem.

No drawing, typography substitution or AI regeneration: only proportional
placement on the existing paper background. Keep the source bytes untouched.
"""
from pathlib import Path
import base64
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'dist'
SOURCE = D / 'assets/il-mastro-emblem.png'
PAPER = '#f4efe4'
emblem = Image.open(SOURCE).convert('RGBA')

def platform(size, padding):
    canvas = Image.new('RGB', (size, size), PAPER)
    drawing = emblem.copy()
    drawing.thumbnail((size - 2 * padding, size - 2 * padding), Image.Resampling.LANCZOS)
    canvas.paste(drawing, ((size - drawing.width) // 2, (size - drawing.height) // 2), drawing)
    return canvas

for size in (16, 32, 48, 96):
    platform(size, 1 if size <= 32 else 2).save(D / f'favicon-{size}.png', optimize=True)
platform(48, 2).save(D / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)], append_images=[platform(16, 1), platform(32, 1)])
for size, name in [(180, 'apple-touch-icon.png'), (167, 'apple-touch-icon-167.png'), (152, 'apple-touch-icon-152.png'), (192, 'icon-192.png'), (512, 'icon-512.png')]:
    platform(size, round(size * .075)).save(D / name, optimize=True)
# Entire emblem fits within the central safe circle under common mask shapes.
platform(512, 116).save(D / 'icon-maskable-512.png', optimize=True)
platform(512, 38).save(D / 'assets/brand-master.png', optimize=True)
encoded = base64.b64encode(SOURCE.read_bytes()).decode('ascii')
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="{PAPER}"/><image x="16" y="16" width="480" height="480" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,{encoded}"/></svg>\n'
for name in ['favicon.svg', 'assets/brand-mark.svg']:
    (D / name).write_text(svg)
print('Exported selected merchant emblem at all platform sizes; original source unchanged.')
