"""Deterministic source registry, with retired IDs separate from current scope."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1]
files={'curriculumSources':'curriculum-sources.json','curriculum':'curriculum.json','archivedCurriculum':'curriculum-archive.json','curriculumLabelHistory':'curriculum-label-history.json','curriculumAudits':'curriculum-audits.json'}
data={k:json.loads((R/'content'/f).read_text()) for k,f in files.items()}
active=data['curriculum'];archived=data['archivedCurriculum'];ids=[r['id'] for r in active]+[r['record']['id'] for r in archived]
assert len(ids)==len(set(ids)), 'Active and retired IDs must remain unique'
assert all(r['status']=='outside-current-nissho2' for r in archived)
text='\n'.join('const '+key+'='+json.dumps(value,ensure_ascii=False).replace('<','\\u003c')+';' for key,value in data.items())+'\n'
(R/'dist/curriculum-data.js').write_text(text)
