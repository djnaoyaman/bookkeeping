import json,re,pathlib
r=pathlib.Path('dist')
for p in [r/'index.html',r/'author.html',*r.glob('practice/*.html')]:
 s=p.read_text();assert '簿記は、手を動かすほど面白くなる。' in s;assert 'https://djnaoyaman.github.io/profile.html' in s
 for j in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s):json.loads(j)
assert (r/'llms-full.txt').read_text().count('\n問題: ')==56
print('Profile integration, JSON-LD, 56 questions verified')
