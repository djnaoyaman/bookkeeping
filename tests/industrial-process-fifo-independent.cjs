'use strict';
// Independent chapter09 grading/negative checks. Expected answers are separately derived before keys.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const opts={};for(let i=2;i<process.argv.length;i+=2)opts[process.argv[i].slice(2)]=process.argv[i+1];
const root=path.resolve(opts.root||path.join(__dirname,'..'));
const contentPath=path.resolve(opts.content||path.join(root,'content/industrial-course.json'));
const fixturePath=path.resolve(opts.computations||path.join(root,'tests/fixtures/industrial-process-fifo-independent-computations.json'));
const content=JSON.parse(fs.readFileSync(contentPath)),own=JSON.parse(fs.readFileSync(fixturePath));
const {gradeFields,gradeJournal}=require(path.join(root,'dist/assessment-engine.js'));
const {validate,digest}=require(path.join(root,'scripts/validate-learning-content.cjs'));
const curriculum=JSON.parse(fs.readFileSync(path.join(root,'content/curriculum.json')));
const qs=content.questions.filter(q=>q.lessonId==='n2-industrial-lesson-09'),lesson=content.lessons.find(l=>l.id==='n2-industrial-lesson-09');
let baseline=0,positive=0,negative=0,components=0;const cases=[],errors=[],responses={};
const test=(label,fn)=>{try{fn();cases.push({label,pass:true});}catch(e){errors.push({label,message:e.message});cases.push({label,pass:false});}};
const grade=(q,r)=>q.type==='journal'?gradeJournal(q,r):gradeFields(q,r);
const good=(q,r,label,spec=q)=>test(q.id+'/'+label,()=>{const g=grade(spec,r);assert.equal(g.correct,true);assert.equal(g.earned,g.max);positive++;});
const bad=(q,r,label,spec=q,field=null,invalid=false)=>test(q.id+'/'+label,()=>{const g=grade(spec,r);assert.equal(g.correct,false);assert(g.earned<g.max);if(field){const c=g.components.find(c=>c.id===field);assert.equal(c.earned,0);if(invalid)assert.equal(c.valid,false);}negative++;});
const expectedReview={"kind": "independent-computation", "reviewedBy": "Parent reviewer /root/advance_remaining_site_backlogs (not chapter09 author)", "reviewedAt": "2026-11-02T10:38:38Z", "questionIds": ["n2-industrial-09-period-boundary-01", "n2-industrial-09-current-work-01", "n2-industrial-09-start-material-01", "n2-industrial-09-conversion-denominator-01", "n2-industrial-09-integrated-allocation-01", "n2-industrial-09-method-comparison-01", "n2-industrial-09-worksheet-diagnosis-01", "n2-industrial-09-opening-cost-correction-01", "n2-industrial-09-opening-progress-correction-01", "n2-industrial-09-reverse-current-cost-01", "n2-industrial-09-completion-journal-01", "n2-industrial-09-no-ending-01", "n2-industrial-09-aggregate-opening-data-01"], "questionHashes": {"n2-industrial-09-period-boundary-01": "462f50299a0561b9647f835269eed1dd1b1b993cc092a3ea6242d50595b6490f", "n2-industrial-09-current-work-01": "121d1c2d11f26bac35fa9523fb1f22cf37464349318aecca7fff0e88612c2848", "n2-industrial-09-start-material-01": "c27cd645bbcab9035aa9e973922c06675e2f349775a04ef205fc4879a4d37c97", "n2-industrial-09-conversion-denominator-01": "671f75484f76528500f835a1077074927caa85a330ebef78ef55d2d78221e1fb", "n2-industrial-09-integrated-allocation-01": "cbe7eb8b619ebac878fa0e30dcc3d1177c2e01acaa5e5c444d62e578d114438c", "n2-industrial-09-method-comparison-01": "3db9d4154d56ffe2be850dccacb513b46d823e34d6c492d6c5b003db91de8368", "n2-industrial-09-worksheet-diagnosis-01": "a515818704c9dfd5617e9b7d17396b10a59433907e7972f99a63d96d1274496f", "n2-industrial-09-opening-cost-correction-01": "a92c2670ed544de44f0d878fbb463f8f47bc8e4c5285e74f6a885ba0e09784af", "n2-industrial-09-opening-progress-correction-01": "b2820b4c400d3acfd98a41482f23b1601a5b003682caf062e67178047c128e26", "n2-industrial-09-reverse-current-cost-01": "451d590bd26ad77d6b9fcdf3b97c4e3bd8fd3a4a440f3de16f0e2054ee2c0044", "n2-industrial-09-completion-journal-01": "cc7bb19453ba19304a8d64fb69f7cfadbeff73a71bffad5edc2eb0e4795c01de", "n2-industrial-09-no-ending-01": "a063798f53b680e42be5e2f4cd4ec4b2535b82489c26b7156cb9cb9eb433dd30", "n2-industrial-09-aggregate-opening-data-01": "cf6920f2736b9fc414690f5f86ee684d08804bc5e974354efcfd4fcea2b1e7aa"}, "lessonHashes": {"n2-industrial-lesson-09": "3f6ede7130c553c591aba1e2900546b1312a450303d3efad52956a5406bf4ba1"}, "evidence": "notes/editorial/industrial-process-fifo-review-20261102.md"};
test('pinned-fixture',()=>assert.equal(crypto.createHash('sha256').update(fs.readFileSync(fixturePath)).digest('hex'),'0344f94e15286f5740b1917e20915420c95a6b98a5273aaccc2caa73bf4a9dbd'));
test('real-completed-review-and-object-hashes',()=>{const records=content.reviewRecords.filter(r=>r.reviewedBy===expectedReview.reviewedBy&&r.reviewedAt===expectedReview.reviewedAt);assert.equal(records.length,1);assert.deepEqual(records[0],expectedReview);for(const q of qs)assert.equal(digest(q),expectedReview.questionHashes[q.id]);assert.equal(digest(lesson),expectedReview.lessonHashes[lesson.id]);});
test('structure',()=>{assert.equal(qs.length,13);assert.equal(lesson.sections.length,10);assert.equal(lesson.workedExamples.length,6);assert.equal(lesson.objectives.length,11);});
for(const q of qs){
 const a=own.questions[q.id].answers;assert(a);
 const r=q.type==='fields'?{...a}:a.map(x=>({...x}));responses[q.id]=r;
 test(q.id+'/independent-key-agreement',()=>assert.deepEqual(q.type==='fields'?Object.fromEntries(q.fields.map(f=>[f.id,f.answer])):q.lines.map(({side,account,amount})=>({side,account,amount})),r));
 test(q.id+'/baseline',()=>{const g=grade(q,r);assert.equal(g.correct,true);assert.equal(g.earned,g.max);components+=g.max;baseline++;});
 bad(q,q.type==='fields'?{}:[],'empty');bad(q,null,'null');bad(q,undefined,'undefined');
 if(q.type==='fields')for(const f of q.fields){
  const expected=a[f.id],alter=v=>({...r,[f.id]:v});
  for(const [k,v] of [['blank',''],['null',null],['undefined',undefined],['space',' \t '],['array',[]],['bool',false],['object',{}]])bad(q,alter(v),f.id+'/'+k,q,f.id,true);
  const omitted={...r};delete omitted[f.id];bad(q,omitted,f.id+'/omitted',q,f.id,true);
  if(f.type==='choice'){
   for(const wrong of f.options.filter(v=>v!==expected))bad(q,alter(wrong),f.id+'/wrong-'+wrong,q,f.id);
   bad(q,alter('outside'),f.id+'/unknown',q,f.id,true);
  }else{
   for(const [k,v] of [['+1',expected+1],['-1',expected-1],['wrongSign',expected?-expected:-1]])bad(q,alter(v),f.id+'/'+k,q,f.id);
   if(expected)bad(q,alter(0),f.id+'/zero',q,f.id);
   for(const [k,v] of [['scientific',expected+'e0'],['unit',expected+'円'],['fraction',expected+'.0'],['badComma',expected+',00'],['nan',NaN],['infinite',Infinity],['overflow','9007199254740993']])bad(q,alter(v),f.id+'/'+k,q,f.id,true);
   good(q,alter(String(expected)),f.id+'/numberString');good(q,alter(expected.toLocaleString('en-US')),f.id+'/grouped');good(q,alter(String(expected).replace(/[0-9]/g,d=>String.fromCharCode(d.charCodeAt(0)+0xfee0))),f.id+'/fullwidth');
  }
 }else{
  good(q,[...r].reverse(),'reversedInputOrder');good(q,r.map(l=>({...l,amount:l.amount.toLocaleString('en-US')})),'grouped');good(q,r,'cbt',{...q,inputMode:'cbt'});
  for(let i=0;i<r.length;i++){
   const change=(key,v)=>r.map((l,j)=>j===i?{...l,[key]:v}:{...l});bad(q,r.filter((l,j)=>j!==i),'line'+i+'/missing');
   for(const acc of q.accounts.filter(v=>v!==r[i].account))bad(q,change('account',acc),'line'+i+'/account'+acc);
   for(const v of ['',null,'現金'])bad(q,change('account',v),'line'+i+'/badaccount'+v);
   for(const v of ['debit','credit','',null,'other'].filter(v=>v!==r[i].side))bad(q,change('side',v),'line'+i+'/side'+v);
   for(const [k,v] of [['empty',''],['zero',0],['negative',-r[i].amount],['+1',r[i].amount+1],['null',null],['scientific','55e3'],['unit','55000円'],['fraction','55000.0'],['overflow','9007199254740993']])bad(q,change('amount',v),'line'+i+'/'+k);
  }
  bad(q,r.map(l=>({...l,side:l.side==='debit'?'credit':'debit'})),'wrongSides');bad(q,r.map(l=>({...l,amount:107700})),'transfersTotalCost');bad(q,r.map(l=>({...l,account:l.account==='製品'?'売上原価':l.account})),'saleBeforeSold');
  bad(q,[...r,{side:'debit',account:'現金',amount:1},{side:'credit',account:'売上',amount:1}],'extraBalanced');bad(q,[...r,{}],'extraEmpty');bad(q,[...r,{...r[0],amount:0}],'extraZero');bad(q,[...r,r[0]],'extraDuplicate');
  const split=[{...r[0],amount:48850},{...r[0],amount:48850},r[1]];good(q,split,'learningSplit');bad(q,split,'cbtSplit',{...q,inputMode:'cbt'});
 }
}
const conceptual=[
 ['current-work',{openingRemaining:60},'priorWorkAsRemaining'],
 ['current-work',{currentConversionEU:1120},'includesPriorWork'],
 ['start-material',{openingAdditionalMaterial:180},'redoesOpeningMaterials'],
 ['start-material',{completedMaterial:70200},'completedTimesCurrentRate'],
 ['conversion-denominator',{currentConversionEU:580},'subtractsPhysicalOpening'],
 ['conversion-denominator',{conversionRate:80},'poolsOpeningCost'],
 ['integrated-allocation',{completedCost:121600},'dropsOpeningCosts'],
 ['method-comparison',{fifoEndingMaterial:16000,effect:'same'},'usesAverageForFIFO'],
 ['worksheet-diagnosis',{correctConversionEU:550,correctConversionRate:120,correctEndingCost:18000,correctCompletedCost:103000},'retainsWrongWorksheet'],
 ['opening-cost-correction',{endingCost:11200,completedCost:63600},'addsOpeningCorrectionToEnding'],
 ['opening-progress-correction',{currentConversionEU:850,conversionRate:80,endingCost:20000,endingIncrease:0},'keepsOldProgress'],
 ['reverse-current-cost',{currentConversionCost:56550},'deductsOpeningTwice'],
 ['no-ending',{currentConversionEU:600},'forgetsOpeningWork'],
 ['no-ending',{completedUnitCost:130},'sumCurrentRates'],
 ['aggregate-opening-data',{aggregatePossible:'guess',completedMaterialPossible:'current'},'inventsOpeningBreakdown']
];
for(const [id,patch,label]of conceptual){const q=qs.find(q=>q.id===`n2-industrial-09-${id}-01`);bad(q,{...responses[q.id],...patch},'conceptual/'+label);}
test('components61',()=>assert.equal(components,61));
const scope=['nissho-edb0e12d4162','nissho-bbe75426d772','nissho-65ea4a3dac67','nissho-c5750d58af74'];
test('exactScope',()=>{assert.deepEqual(lesson.requirementIds,scope);assert(scope.every(id=>curriculum.some(r=>r.id===id&&r.unit===2&&r.exam==='nissho')));for(const q of qs)assert(q.requirementIds.every(id=>scope.includes(id)));});
const schema=validate(content,curriculum,{target:'nissho:2'}),publish=validate(content,curriculum,{target:'nissho:2',publish:true});
test('schema',()=>assert.equal(schema.valid,true,schema.errors?.join('\n')));
if(opts.published!=='no')test('genuineReviewPublicationGate',()=>assert.equal(publish.valid,true,publish.errors?.join('\n')));else test('unreviewedDraftCorrectlyBlocked',()=>assert.equal(publish.valid,false));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const out={summary:{status:errors.length?'FAIL':'PASS',baselinePositive:baseline,formatPositive:positive,negativeCases:negative,conceptualNegatives:conceptual.length,components,assertions:cases.length,failures:errors.length},fixtureSha256:sha(fixturePath),contentSha256:sha(contentPath),questionHashes:Object.fromEntries(qs.map(q=>[q.id,digest(q)])),lessonHashes:{[lesson.id]:digest(lesson)},schema,publish,errors,cases};
if(opts.output)fs.writeFileSync(opts.output,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out,cases:undefined},null,2));process.exitCode=errors.length?1:0;
