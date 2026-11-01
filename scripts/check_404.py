"""Validate the non-indexed recovery page without adding it to the sitemap."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'dist'
text = (D / '404.html').read_text()
assert text == (ROOT / 'src/404.html').read_text(), 'Regenerate the recovery page'

class Recovery(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1 = 0
        self.noindex = False
        self.targets = set()
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': assert a.get('lang') == 'ja'
        if tag == 'h1': self.h1 += 1
        assert tag not in ('script', 'base'), 'No scripts, redirects or base overrides'
        if tag == 'meta':
            assert a.get('http-equiv', '').lower() != 'refresh'
            if a.get('name') == 'robots': self.noindex = 'noindex' in a.get('content', '').split(',')
        for key in ('href', 'src'):
            if key not in a: continue
            link = a[key]
            if link.startswith('#'): continue
            path = urlsplit(link).path
            assert path.startswith('/bookkeeping/'), ('Must work at nested invalid URLs', link)
            local = D / path.removeprefix('/bookkeeping/')
            if local.is_dir(): local /= 'index.html'
            assert local.is_file(), link
            if tag == 'a': self.targets.add(path)

p = Recovery()
p.feed(text)
assert p.h1 == 1 and p.noindex
assert {'/bookkeeping/', '/bookkeeping/lessons/index.html'} <= p.targets
assert '404.html' not in (D / 'sitemap.xml').read_text()
print('PASS: Japanese 404, noindex, single heading, source parity, absolute valid assets/links, no redirect')
