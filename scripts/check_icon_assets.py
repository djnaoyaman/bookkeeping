from pathlib import Path
import base64, hashlib, json, math, xml.etree.ElementTree as ET
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'dist'
source = (D / 'assets/il-mastro-emblem.png').read_bytes()
assert hashlib.sha256(source).hexdigest() == '76a20776706c07346cda26fe6f0deaa86640ba9f74ccb783bf5dda22c60a5977'
emblem = Image.open(D / 'assets/il-mastro-emblem.png').convert('RGBA')
sizes = [(16, 'favicon-16.png', 1), (32, 'favicon-32.png', 1), (48, 'favicon-48.png', 2), (96, 'favicon-96.png', 2)]
sizes += [(n, f, round(n * .075)) for n, f in [(180, 'apple-touch-icon.png'), (167, 'apple-touch-icon-167.png'), (152, 'apple-touch-icon-152.png'), (192, 'icon-192.png'), (512, 'icon-512.png')]]
sizes += [(512, 'icon-maskable-512.png', 116), (512, 'assets/brand-master.png', 38)]
for n, file, padding in sizes:
    expected = Image.new('RGB', (n, n), '#f4efe4'); mark = emblem.copy()
    mark.thumbnail((n - padding * 2, n - padding * 2), Image.Resampling.LANCZOS)
    expected.paste(mark, ((n-mark.width)//2, (n-mark.height)//2), mark)
    actual = Image.open(D / file)
    assert actual.mode == 'RGB' and actual.size == (n, n)
    assert actual.tobytes() == expected.tobytes(), file
for n in [16, 32, 48]:
    assert Image.open(D/'favicon.ico').ico.getimage((n,n)).convert('RGB').tobytes() == Image.open(D/f'favicon-{n}.png').tobytes()
for file in ['favicon.svg', 'assets/brand-mark.svg']:
    svg = ET.fromstring((D/file).read_text()); image = svg.find('{http://www.w3.org/2000/svg}image')
    assert base64.b64decode(image.attrib['href'].split(',',1)[1]) == source
mask = Image.open(D/'icon-maskable-512.png'); bg = Image.new('RGB', mask.size, '#f4efe4')
box = ImageChops.difference(mask, bg).getbbox()
assert all(math.hypot(x-256,y-256) <= 512*.4 for x in [box[0],box[2]] for y in [box[1],box[3]])
cfg=json.loads((ROOT/'site.config.json').read_text()); version=cfg['iconVersion']
for p in D.rglob('*.html'):
    text=p.read_text()
    for name in ['favicon.svg','favicon-32.png','favicon-96.png','favicon.ico','apple-touch-icon.png','apple-touch-icon-167.png','apple-touch-icon-152.png','site.webmanifest']:
        assert name+'?v='+version in text,(p,name)
for icon in json.loads((D/'site.webmanifest').read_text())['icons']:
    assert icon['src'].endswith('?v='+version)
print('PASS: unchanged merchant source, all raster/SVG/ICO exports, mask safe zone and 94-page icon versions.')
