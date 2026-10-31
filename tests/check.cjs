const fs=require('fs'),vm=require('vm'),assert=require('assert');
const path=require('path');const dist=path.resolve(__dirname,'../dist')+'/';
function context(saved){const elements={},storage=saved||{};function el(){return {innerHTML:'',textContent:'',value:'',style:{},dataset:{},classList:{toggle(){},add(){}},querySelector(){return null},querySelectorAll(){return []},scrollIntoView(){},focus(){},showModal(){},close(){},click(){}}}const c={console,Date,JSON,Math,Set,Map,Blob,URL,setTimeout,alert(){},localStorage:{getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[],querySelector:()=>null,createElement:()=>el()},window:{scrollTo(){}}};vm.createContext(c);for(const f of ['assessment-engine.js','catalog.js','curriculum-data.js','app.js','curriculum-ui.js','study-plan.js','exercise-first.js'])vm.runInContext(fs.readFileSync(dist+f,'utf8'),c);return {c,elements,storage}}
const saved={'bk-v1':JSON.stringify({cards:{1:{step:1,wrong:0,last:true,due:Date.now()+86400000}},log:[{id:1,correct:true,date:'2026-10-22',time:1}]})};const {c,elements,storage}=context(saved);
vm.runInContext(`
if(questions.length!==56)throw Error('question migration');
if(new Set(curriculum.map(t=>t.id)).size!==curriculum.length)throw Error('duplicate curriculum ids');
if(!state.cards[1]||state.log.length!==1)throw Error('previous learning lost');
for(const [track,cat] of Object.entries(catalogs)){
 exam=track;for(const unit of cat.units){curriculumUnit=unit;curriculumExam=track;const items=targetItems();if(items.length<10)throw Error('missing unit curriculum '+track+unit);renderCurriculum();if(!$('curriculumbody').innerHTML.includes('学ぶ全体像'))throw Error('map render');if(!items.every(t=>t.source&&t.title&&t.area))throw Error('missing source');startPractice(unit);if(!queue.length||queue.some(q=>q.exam!==track))throw Error('incorrect practice track');renderQuestion();answer(queue[0].answer);renderStats();renderReview();renderDashboard();}
}
exam='uscpa';curriculumExam=exam;curriculumUnit='ISC';renderCurriculum();if(targetItems().some(t=>t.unit!=='ISC'))throw Error('mixed scope');
if(questions.some(q=>q.exam==='uscpa'&&q.level==='FAR'&&q.topic.startsWith('Goodwill')))throw Error('wrong blueprint section');
if(!questions.some(q=>q.exam==='uscpa'&&q.level==='BAR'&&q.topic.startsWith('Goodwill')))throw Error('goodwill not relocated');
exam='nissho';curriculumUnit=3;curriculumExam=exam;renderCurriculum();
if(targetItems().some(t=>/デリバティブ|税効果会計/.test(t.title)))throw Error('advanced topics leaked to grade 3');
const t=targetItems()[0];state.learning[t.id]={status:1,memo:'<script>alert(1)</script>'};save();openLesson(t.id);if($('lessonpanel').innerHTML.includes('<script>alert'))throw Error('unsafe memo output');
const selfBefore=progressSummary().checked;startPractice(3);answer(queue[0].answer);if(progressSummary().checked!==selfBefore)throw Error('quiz falsely marks scope mastered');
curriculumQuery='存在しない論点zzzz';if(filteredItems().length!==0)throw Error('search');curriculumQuery='';curriculumFilter='noexercise';if(filteredItems().some(t=>relatedQuestions(t).length))throw Error('uncovered filter');curriculumFilter='all';
exam='zenkei';curriculumExam=exam;curriculumUnit='advanced';if(!targetItems().every(t=>t.scope==='pending'))throw Error('unverified scope labelled verified');
for(const t of curriculum)for(const q of relatedQuestions(t))if(q.exam!==t.exam||q.level!==t.unit)throw Error('wrong related exercise mapping');
if(!curriculum.some(t=>t.exam==='nissho'&&t.unit===1&&t.title.includes('期中財務')))throw Error('2026 addition missing');
if(!curriculum.some(t=>t.exam==='uscpa'&&t.unit==='BAR'&&t.title.includes('Governmental funds')))throw Error('government coverage');
if(!curriculum.some(t=>t.exam==='uscpa'&&t.unit==='TCP'&&t.title.includes('Trusts')||t.exam==='uscpa'&&t.area.includes('Trusts')))throw Error('trust coverage');
`,c);
assert(JSON.parse(storage['bk-v1']).learning);context(storage);
vm.runInContext(`
exam='nissho';curriculumExam=exam;curriculumUnit=3;
if(referenceHours().min!==60||currentPlan().hours!==70)throw Error('reference midpoint');
state.plans[planKey()]={hours:100,weekly:10,deadline:'',discipline:'BAR'};
if(scheduleMetrics().weeks!==10)throw Error('planning math');
state.studyTime.push({id:'test',key:planKey(),minutes:120,phase:1,time:Date.now()});
if(scheduleMetrics().spent!==2||scheduleMetrics().weeks!==9.8)throw Error('actual hours');
const chunks=smallSteps();if(!chunks.length||chunks.some(ch=>ch.topics.length>5))throw Error('small step scope');
if(new Set(chunks.flatMap(ch=>ch.topics.map(t=>t.id))).size!==planScope().length)throw Error('lost scope');
const ch=chunks[0];ch.topics.forEach(t=>state.learning[t.id]={status:2});
state.stepEvidence[ch.id]={basicTotal:10,basicCorrect:8,basicDate:'2026-01-01',retestTotal:10,retestCorrect:8,retestDate:'2026-01-07'};
if(stepStatus(ch).complete)throw Error('6 days must not pass');
state.stepEvidence[ch.id].retestDate='2026-01-08';if(!stepStatus(ch).complete)throw Error('7-day retest');
state.stepEvidence[ch.id].basicTotal=5;state.stepEvidence[ch.id].basicCorrect=5;if(stepStatus(ch).complete)throw Error('too few questions');
if(passingScore(10,11)||passingScore(10,7)||passingScore(9,9))throw Error('invalid score accepted');
renderStudyPlan();if(!$('studyplanbody').innerHTML.includes('6つの段階'))throw Error('plan render');
openSmallStep(ch.id);if(!$('smallsteppanel').innerHTML.includes('到達条件'))throw Error('step detail');
exam='uscpa';curriculumExam=exam;curriculumUnit='FAR';state.plans[planKey()]={hours:1350,weekly:15,discipline:'ISC'};
if(new Set(planScope().map(t=>t.unit)).size!==4||planScope().some(t=>['BAR','TCP'].includes(t.unit)))throw Error('USCPA elective scope');
if(referenceHours().min!==1200||referenceHours().max!==1500)throw Error('USCPA whole plan hours');
if(planScope()[0].unit!=='FAR')throw Error('prerequisite order');
renderStudyPlan();exam='zenkei';curriculumExam=exam;curriculumUnit='advanced';if(referenceHours().min!==null||currentPlan().hours!==null)throw Error('invented Zenkei average');renderStudyPlan();
`,c);
console.log('PASS: referenced hour ranges, editable plan calculations, actual time, full-scope small steps, 7-day gate, minimum evidence counts, correct elective selection, no invented Zenkei average.');
vm.runInContext(`
if(Object.keys(numericExercises).length<20||Object.keys(journalExercises).length<5)throw Error('written exercise coverage');
if(parseExerciseNumber('２４，０００')!==24000||parseExerciseNumber('25万円')!==null||parseExerciseNumber('0')!==0||parseExerciseNumber('')!==null||parseExerciseNumber('abc')!==null)throw Error('numeric parsing');
const nq=questions.find(q=>q.id===3);for(const v of ['24,000万円','2,4,000','24000.000000001'])if(gradeWritten(nq,{value:v}).valid)throw Error('invalid numeric notation accepted');if(gradeWritten(questions.find(q=>q.id===18),{value:'25円'}).valid)throw Error('wrong denomination accepted');if(!gradeWritten(nq,{value:'24,000'}).correct||gradeWritten(nq,{value:'24001'}).correct||gradeWritten(nq,{value:''}).valid)throw Error('numeric grading');
const jq=questions.find(q=>q.id===1);if(!gradeWritten(jq,{debit:'仕入',credit:'買掛金',debitAmount:'50,000',creditAmount:'50000'}).correct)throw Error('journal grading');
if(gradeWritten(jq,{debit:'買掛金',credit:'仕入',debitAmount:'50000',creditAmount:'50000'}).correct)throw Error('reversed journal');
if(gradeWritten(jq,{debit:'仕入',credit:'買掛金',debitAmount:'50000',creditAmount:'40000'}).correct)throw Error('unbalanced journal');
exam='nissho';curriculumExam=exam;level=3;startExerciseSet(3);if(queue.length>5||queue.some(q=>q.exam!==exam||q.level!==3))throw Error('recommended scope');
startExerciseSet(3,'topic','減価償却');if(queue.length!==1||queue[0].topic!=='減価償却')throw Error('topic exercise');
const w=questions.find(q=>q.id===3);state.cards[w.id]={wrong:1,last:false,step:0,due:0};startExerciseSet(3,'wrong');if(!queue.some(q=>q.id===w.id)||queue.some(q=>!state.cards[q.id]?.wrong))throw Error('wrong-only set');
position=queue.length;renderQuestion();if(!$('questionarea').innerHTML.includes('次の5問'))throw Error('continuation flow');
`,c);
console.log('PASS: number and journal input grading, empty answer validation, five-question sessions, topic practice, wrong-only retry and continuation.');
const data=fs.readFileSync(dist+'index.html','utf8');assert(data.includes('id="curriculum"'));assert(data.indexOf('curriculum-data.js')<data.indexOf('app.js'));assert(data.indexOf('app.js')<data.indexOf('curriculum-ui.js'));
console.log('PASS: curriculum sources and unit coverage, 56-question migration, all track rendering, source verification flags, search, uncovered filter, isolated practice, self-assessment separation, memo escaping, persistence, 2026 additions.');
