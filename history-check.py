from pathlib import Path
import json,re
root=Path(__file__).parent;d=root/'dist'
build=json.loads((root/'content/discovery-build.json').read_text());assert build['questionPages']==56
course=json.loads((root/'content/learning-course.json').read_text()) if (root/'content/learning-course.json').exists() else None
mock_pages=1 if (root/'content/mock-2026/student-form.json').exists() else 0
if mock_pages:assert (d/'mock.html').exists() and 'mock.html' in build['pages']
industrial=json.loads((root/'content/industrial-course.json').read_text()) if (root/'content/industrial-course.json').exists() else None
assert build['htmlPages']==(len(industrial['lessons']) if industrial else 0)+63+(len(course['lessons'])+1 if course else 0)+mock_pages
for p in d.rglob('*.html'):
 s=p.read_text(); assert 'Book Keeping' not in s and 'BOOK KEEPING' not in s,p
 assert 'IL MASTRO' in s and 'ILMASTRO' not in s,p
about=(d/'about.html').read_text()
for t in ['私の入口は、簿記の歴史でした。','古代メソポタミア','中世イタリア','1494','発明したわけではありません','2026-11-01','bancaditalia.it','icaew.com','nls.uk']:assert t in about,t
assert json.loads((d/'site.webmanifest').read_text())['name']=='IL MASTRO'
assert (d/'llms-full.txt').read_text().count('\n問題: ')==56
print(f"PASS: IL MASTRO across {build['htmlPages']} pages, manifest, history and primary sources; 56 legacy questions preserved.")
