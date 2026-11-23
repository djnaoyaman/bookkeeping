"""Validate the non-indexed recovery page without adding it to the sitemap."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import re

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
        self.scripts = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': assert a.get('lang') == 'ja'
        if tag == 'h1': self.h1 += 1
        assert tag != 'base', 'No base overrides'
        if tag == 'script':
            self.scripts.append(a)
            if 'src' in a:
                assert a['src'] == 'https://www.googletagmanager.com/gtag/js?id=G-837HXKXW8Q'
                assert 'async' in a and a.get('referrerpolicy') == 'no-referrer'
            return
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
assert len(p.scripts) == 2 and sum('src' in script for script in p.scripts) == 1
inline = re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', text, re.S)
assert len([script for script in inline if script.strip()]) == 1
init = next(script for script in inline if script.strip())
assert init.count("gtag('config','G-837HXKXW8Q'") == 1
assert "page_location:'https://djnaoyaman.github.io/bookkeeping/404.html'" in init
assert "page_referrer:''" in init
assert all(value not in init for value in ('location.', 'document.referrer', "gtag('event'"))
assert {'/bookkeeping/', '/bookkeeping/lessons/index.html'} <= p.targets
assert '404.html' not in (D / 'sitemap.xml').read_text()
print('PASS: Japanese 404, noindex, single heading, source parity, absolute valid assets/links, no redirect, one private GA4 initialization')
