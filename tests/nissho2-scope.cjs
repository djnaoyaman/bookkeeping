const fs=require('fs'),vm=require('vm'),assert=require('assert');
const path=require('path');const dist=path.resolve(__dirname,'../dist')+'/';
function context(saved){const elements={},storage=saved||{};function el(){return {innerHTML:'',textContent:'',value:'',style:{},dataset:{},classList:{toggle(){},add(){}},querySelector(){return null},querySelectorAll(){return []},scrollIntoView(){},focus(){},showModal(){},close(){},click(){}}}const c={console,Date,JSON,Math,Set,Map,Blob,URL,setTimeout,alert(){},localStorage:{getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[],querySelector:()=>null,createElement:()=>el()},window:{scrollTo(){}}};vm.createContext(c);for(const f of ['assessment-engine.js','catalog.js','curriculum-data.js','app.js','curriculum-ui.js','study-plan.js','exercise-first.js'])vm.runInContext(fs.readFileSync(dist+f,'utf8'),c);return {c,elements,storage}}
const {c,elements,storage}=context();
vm.runInContext(`
exam='nissho';curriculumExam=exam;curriculumUnit=2;
if(targetItems().length!==226||archivedForTarget().length!==19)throw Error('scope counts');
if(targetItems().filter(t=>t.area.startsWith('商業')).length!==133||targetItems().filter(t=>t.area.startsWith('工業')).length!==93)throw Error('subject counts');
if(new Set([...curriculum.map(t=>t.id),...archivedCurriculum.map(a=>a.record.id)]).size!==1133)throw Error('ID collision');
const oldSteps=archivedStepRows();if(oldSteps.length!==58||smallSteps().length!==56)throw Error('step topology counts');
for(const [i,ch] of oldSteps.entries())state.stepEvidence[ch.id]={basicDate:'2026-10-01',basicTotal:10,basicCorrect:10,retestDate:'2026-10-10',retestTotal:10,retestCorrect:10,note:'旧記録 '+i+' </pre><img src=x>\\n日本語📚',extra:{index:i}};
const stepSnapshot=JSON.stringify(state.stepEvidence);state.plans['nissho:2']={hours:222,weekly:7};state.studyTime=[{key:'nissho:2',minutes:25,time:1}];
for(const t of targetItems())state.learning[t.id]={status:2};
if(smallSteps().some(ch=>!ch.id.startsWith('nissho:2:scope-20261101:')||stepStatus(ch).basic||stepStatus(ch).complete))throw Error('old evidence automatically reused');
if(archivedStepExportData().some((x,i)=>JSON.stringify(x.evidence)!==JSON.stringify(state.stepEvidence[oldSteps[i].id])))throw Error('step export loss');
if(archivedStepSummary('curriculum').includes('<img ')||!archivedStepSummary('curriculum').includes('&lt;img'))throw Error('step HTML injection');
renderStudyPlan();if(!$('studyplanbody').innerHTML.includes('範囲訂正前の小ステップ記録'))throw Error('step history inaccessible');
if(JSON.stringify(state.stepEvidence)!==stepSnapshot||state.plans['nissho:2'].hours!==222||state.studyTime[0].minutes!==25)throw Error('step/plan mutation');
state.learning={};
const beforeOther=JSON.stringify(state.learning),beforeLogs=JSON.stringify(state.log);
const ids=archivedForTarget().map(a=>a.record.id),memo='<script>globalThis.bad=1</script></textarea><img src=x onerror=globalThis.bad=1>\\n日本語・絵文字📚 & "引用"';
for(const id of ids)state.learning[id]={status:2,memo,updated:100,extra:{keep:'unchanged'}};
const oldArchive=JSON.stringify(state.learning);renderCurriculum();
if(progressSummary().checked!==0||progressSummary().started!==0||targetItems().some(t=>ids.includes(t.id)))throw Error('retired progress counted');
if(!$('curriculumresults').innerHTML.includes('現行2級範囲外・旧メモ保管'))throw Error('archive inaccessible');
if(ids.some(id=>!$('curriculumresults').innerHTML.includes(id)))throw Error('archive IDs missing');
for(const id of ids){openLesson(id);if(!$('lessonpanel').innerHTML.includes('&lt;script&gt;')||($('lessonpanel').innerHTML.includes('<script>')||$('lessonpanel').innerHTML.includes('<img ')))throw Error('memo injection');if(!$('lessonpanel').innerHTML.includes('現行2級範囲外'))throw Error('wrong scope label');$('archivedmemo').value=memo+'\\n追記 '+id;$('savearchivedmemo').onclick();if(state.learning[id].status!==2||state.learning[id].extra.keep!=='unchanged')throw Error('old check overwritten');}
if(globalThis.bad)throw Error('HTML executed');
const payload=archivedExportData();if(payload.archived.length!==19)throw Error('export count');for(const a of payload.archived){if(a.learning.memo!==memo+'\\n追記 '+a.record.id||a.learning.status!==2||a.learning.extra.keep!=='unchanged')throw Error('export loss');}
if(progressSummary().checked!==0||progressSummary().started!==0||JSON.stringify(state.log)!==beforeLogs)throw Error('archived save contaminated scoring');
for(const h of curriculumLabelHistory){state.learning[h.id]={status:1,memo,updated:101};openLesson(h.id);if(!$('lessonpanel').innerHTML.includes('以前の表示')||state.learning[h.id].memo!==memo)throw Error('corrected history missing');}
const five=['nissho-b7e87bf7e87f','nissho-4cc367bf9841','nissho-9b4d435557e3','nissho-b3030633885c','nissho-7983c6a8da29'];for(const id of five){if(!targetItems().some(t=>t.id===id)||state.learning[id])throw Error('new item migration');openLesson(id);}
if(!$('lessonpanel').innerHTML.includes('簡易'))throw Error('factory note missing');
const legacy=questions.filter(q=>q.exam==='nissho'&&q.level===2);if(legacy.length!==8||legacy.map(q=>q.id).join(',')!=='9,10,11,12,13,14,15,16')throw Error('legacy2 changed');
const refs=[...new Set(targetItems().flatMap(t=>t.questions||[]))].sort((a,b)=>a-b);if(refs.join(',')!=='9,10,11,12,13,14,15,16')throw Error('legacy links lost');
openLesson('unknown-retired-id');if(!$('lessonpanel').innerHTML.includes('変更していません'))throw Error('unknown ID guard');
exam='uscpa';curriculumUnit='FAR';curriculumExam=exam;if(archivedForTarget().length||sourceAudit())throw Error('wrong exam archive');
exam='nissho';curriculumUnit=3;curriculumExam=exam;if(targetItems().length!==62||archivedForTarget().length||sourceAudit())throw Error('grade3 affected');
save();
`,c);
const again=context(storage);vm.runInContext(`exam='nissho';curriculumUnit=2;curriculumExam=exam;if(archivedStepExportData().length!==58||archivedStepExportData().some((s,i)=>s.evidence.extra.index!==i)||state.plans['nissho:2'].hours!==222||state.studyTime[0].minutes!==25)throw Error('step reload loss');for(const a of archivedExportData().archived){if(!a.learning.memo.endsWith('追記 '+a.record.id)||a.learning.status!==2||a.learning.extra.keep!=='unchanged')throw Error('reload loss');}`,again.c);
console.log('PASS: 226 active/19 archived; all19 hostile-text memo edit/reload/JSON preserve; 57 label histories; five unique IDs; 8 questions and links; source limits; other grades untouched.');
// Compare every non-grade-2 topology to the exact preceding published registry.
const baselineSteps=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../content/curriculum-step-history.json'),'utf8'));
const flatten=baselineSteps.flatMap(s=>s.topics);assert.equal(flatten.length,240);
const corrected=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../content/curriculum.json'),'utf8'));
function chunks(rows,key){const g=new Map();for(const t of rows){const k=t.unit+' / '+t.area;if(!g.has(k))g.set(k,[]);g.get(k).push(t)}return [...g].flatMap(([area,ts])=>Array.from({length:Math.ceil(ts.length/5)},(_,i)=>({id:key+':'+ts[i*5].id,topics:ts.slice(i*5,i*5+5).map(t=>t.id)})));}
const prior=chunks(flatten,'nissho:2'),current=chunks(corrected.filter(t=>t.exam==='nissho'&&t.unit===2),'nissho:2');
assert.equal(prior.filter(p=>current.some(n=>n.id===p.id&&JSON.stringify(n.topics)!==JSON.stringify(p.topics))).length,6);
assert.equal(prior.filter(p=>!current.some(n=>n.id===p.id)).length,11);
for(const [exam,unit] of [['nissho',3],['nissho',1],['zenkei',3],['zenkei',2],['zenkei',1],['zenkei','上級'],['uscpa','FAR']]){
 const expected=vm.runInContext(`exam=${JSON.stringify(exam)};curriculumUnit=${JSON.stringify(unit)};curriculumExam=exam;(()=>{const groups=new Map();planScope().forEach(t=>{const k=t.unit+' / '+t.area;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(t)});return Array.from(groups).flatMap(([area,items])=>Array.from({length:Math.ceil(items.length/5)},(_,i)=>planKey()+':'+items[i*5].id));})()`,c);
 assert.deepEqual(JSON.parse(JSON.stringify(vm.runInContext('smallSteps().map(s=>s.id)',c))),JSON.parse(JSON.stringify(expected)));
}
console.log('PASS: exact 58 old topologies / 6 reused-different / 11 vanished keys preserved; 56 versioned current steps; other exam step IDs unchanged.');
