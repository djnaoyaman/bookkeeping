from pathlib import Path
import json,re
root=Path(__file__).parent;d=root/'dist'
assert json.loads((root/'content/discovery-build.json').read_text())['htmlPages']==63
for p in d.rglob('*.html'):
 s=p.read_text(); assert 'Book Keeping' not in s and 'BOOK KEEPING' not in s,p
 assert 'IL MASTRO' in s and 'ILMASTRO' not in s,p
about=(d/'about.html').read_text()
for t in ['私の入口は、簿記の歴史でした。','古代メソポタミア','中世イタリア','1494','発明したわけではありません','2026-11-01','bancaditalia.it','icaew.com','nls.uk']:assert t in about,t
assert json.loads((d/'site.webmanifest').read_text())['name']=='IL MASTRO'
assert (d/'llms-full.txt').read_text().count('\n問題: ')==56
print('PASS: IL MASTRO across 63 pages, manifest, short historical introduction, three sources, JST update, 56 questions.')
