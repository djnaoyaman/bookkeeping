from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
import json,xml.etree.ElementTree as ET,re,subprocess,sys
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';BASE=json.loads((ROOT/'site.config.json').read_text())['url'].rstrip('/');build=json.loads((ROOT/'content/discovery-build.json').read_text());canonicals=set();titles=set()
def local_absolute(url):
 path=unquote(urlparse(url).path)
 prefix=urlparse(BASE).path.rstrip('/')
 assert path==prefix or path.startswith(prefix+'/'),('outside site base',url)
 return D/path[len(prefix):].lstrip('/')
class Page(HTMLParser):
 def __init__(self):super().__init__();self.meta={};self.links=[];self.ids=[];self.h1=0;self.title=False;self.titletext='';self.json=False;self.jsontext='';self.schemas=[];self.alltext=''
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.meta[a.get('property') or a.get('name')]=a.get('content')
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href')
  if tag=='link' and a.get('rel') in ['stylesheet','icon','shortcut icon','apple-touch-icon','manifest']:self.links.append(a.get('href'))
  if tag in ['a','script','img'] and (a.get('href') or a.get('src')):self.links.append(a.get('href') or a.get('src'))
  if 'id' in a:self.ids.append(a['id'])
  if tag=='h1':self.h1+=1
  if tag=='title':self.title=True
  if tag=='script' and a.get('type')=='application/ld+json':self.json=True;self.jsontext=''
 def handle_data(self,text):
  self.alltext+=text
  if self.title:self.titletext+=text
  if self.json:self.jsontext+=text
 def handle_endtag(self,tag):
  if tag=='title':self.title=False
  if tag=='script' and self.json:self.schemas.append(json.loads(self.jsontext));self.json=False
for route in build['pages']:
 path=D/(route or 'index.html');p=Page();p.feed(path.read_text());expected=BASE+'/'+route if route else BASE+'/'
 assert p.canonical==expected,(route,'canonical');assert p.canonical not in canonicals;canonicals.add(p.canonical);assert p.titletext and p.titletext not in titles;titles.add(p.titletext)
 assert p.h1==1,(route,'H1',p.h1);assert len(p.ids)==len(set(p.ids)),(route,'duplicate ID');assert p.meta['description'];assert p.meta['og:url']==expected;assert p.meta['og:title']==p.titletext;assert p.meta['twitter:card']=='summary_large_image';assert p.meta['og:image:alt'];assert p.meta['twitter:image:alt'];assert p.schemas
 assert p.schemas[0]['@context']=='https://schema.org'
 for image_key in ['og:image','twitter:image']:
  image=local_absolute(p.meta[image_key]);assert image.is_file(),image
  im=Image.open(image);assert im.width==1200 and im.height in [600,630]
 for link in p.links:
  if not link or link.startswith(('data:','#','mailto:')):continue
  u=urlparse(link)
  if u.netloc and (u.netloc!=urlparse(BASE).netloc or not (unquote(u.path)==urlparse(BASE).path.rstrip('/') or unquote(u.path).startswith(urlparse(BASE).path.rstrip('/')+'/'))):continue
  local=local_absolute(link) if u.netloc or link.startswith('/') else path.parent/unquote(u.path)
  if local.is_dir():local=local/'index.html'
  assert local.is_file(),(route,link,local)
 if route.startswith('practice/'):
  quiz=next(x for x in p.schemas[0]['@graph'] if x['@type']=='Quiz');q=quiz['hasPart'][0];assert q['text'] in p.alltext;assert '解答と解説' in p.alltext
sitemap={x.text for x in ET.parse(D/'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')};assert sitemap==canonicals
assert 'Sitemap: '+BASE+'/sitemap.xml' in (D/'robots.txt').read_text()
for file,size in [('apple-touch-icon.png',180),('apple-touch-icon-167.png',167),('apple-touch-icon-152.png',152),('icon-192.png',192),('icon-512.png',512),('icon-maskable-512.png',512),('favicon-16.png',16),('favicon-32.png',32),('favicon-48.png',48),('favicon-96.png',96)]:
 im=Image.open(D/file);assert im.size==(size,size),(file,im.size)
for f in ['apple-touch-icon.png','icon-maskable-512.png']:assert Image.open(D/f).mode=='RGB'
assert {(16,16),(32,32),(48,48)}.issubset(Image.open(D/'favicon.ico').ico.sizes())
manifest=json.loads((D/'site.webmanifest').read_text());assert any(i['purpose']=='maskable' for i in manifest['icons'])
assert (D/'llms-full.txt').read_text().count('\n問題: ')==56
css=(D/'assets/site.css').read_text();assert '@import' not in css;cfg=json.loads((ROOT/'site.config.json').read_text());analytics=cfg.get('analytics');assert json.loads((D/'discovery-config.js').read_text().removeprefix('window.BK_DISCOVERY=').removesuffix(';\n'))['analytics']==analytics
if analytics:
 mid=analytics['measurementId']
 for route in build['pages']:
  text=(D/(route or 'index.html')).read_text();assert text.count('https://www.googletagmanager.com/gtag/js?id='+mid)==1;assert text.count("gtag('config','"+mid+"'")==1;assert 'send_page_view:false' in text
print(f'PASS: {len(canonicals)} unique static pages; titles, canonical, single H1, OGP/X Cards, JSON-LD, question content, all internal assets/links, sitemap, icon dimensions, ICO sizes, opaque Apple/maskable icons, manifest, text summaries and configured analytics tags.')

from check_course_text import validate_course_text
validate_course_text(json.loads((ROOT/'content/learning-course.json').read_text()),(D/'llms-full.txt').read_text(),BASE)
print('PASS: scoped course text includes all tables, field answers/options/units, explanations and worked examples.')
subprocess.run([sys.executable,str(ROOT/'scripts/test_course_text.py')],check=True)
