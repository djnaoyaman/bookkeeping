"""Every answer field is checked in its own scope, not rescued by another field."""
from pathlib import Path
import json
from check_course_text import validate_course_text
R=Path(__file__).resolve().parents[1];course=json.loads((R/'content/learning-course.json').read_text());text=(R/'dist/llms-full.txt').read_text();base=json.loads((R/'site.config.json').read_text())['url'].rstrip('/')
validate_course_text(course,text,base)
count=0
for q in course['questions']:
 if q['type']!='fields':continue
 marker='問題ID: '+q['id']+'\n';qb=text.split(marker,1)[1].split('\n### 新教材問題:',1)[0]
 for f in q['fields']:
  fm='欄: '+f['id']+' / '+f['label']+'\n';a=qb.index(fm)+len(fm);b=qb.find('\n欄: ',a)
  if b<0:b=qb.index('\n解説: ',a)
  fb=qb[a:b];answer=next(line for line in fb.splitlines() if line.startswith('正答: '))
  variants={'replaced':fb.replace(answer,'正答: __WRONG__',1),'deleted':fb.replace(answer,'',1),'moved-to-another-field':fb.replace(answer,'',1)+'\n欄: __foreign__ / 別欄\n'+answer}
  for kind,changed in variants.items():
   mutated=marker+qb[:a]+changed+qb[b:]
   try:validate_course_text({'questions':[q],'lessons':[]},mutated,base)
   except AssertionError:count+=1
   else:raise AssertionError(('false-positive',q['id'],f['id'],kind))
print('PASS:',count,'per-field wrong-answer/deleted-answer/cross-field-movement negative probes; positive full export passed.')
