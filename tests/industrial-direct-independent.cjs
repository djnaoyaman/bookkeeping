'use strict';
// Independent chapter11 grading/negative checks. Expected answers are separately derived before keys.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const opts={};for(let i=2;i<process.argv.length;i+=2)opts[process.argv[i].slice(2)]=process.argv[i+1];
const root=path.resolve(opts.root||path.join(__dirname,'..'));
const contentPath=path.resolve(opts.content||path.join(root,'content/industrial-course.json'));
const fixturePath=path.resolve(opts.computations||path.join(root,'tests/fixtures/industrial-direct-independent-computations.json'));
const content=JSON.parse(fs.readFileSync(contentPath)),own=JSON.parse(fs.readFileSync(fixturePath));
const {gradeFields,gradeJournal}=require(path.join(root,'dist/assessment-engine.js'));
const {validate,digest}=require(path.join(root,'scripts/validate-learning-content.cjs'));
const curriculum=JSON.parse(fs.readFileSync(path.join(root,'content/curriculum.json')));
const qs=content.questions.filter(q=>q.lessonId==='n2-industrial-lesson-11'),lesson=content.lessons.find(l=>l.id==='n2-industrial-lesson-11');
let baseline=0,positive=0,negative=0,components=0;const cases=[],errors=[],responses={};
const test=(label,fn)=>{try{fn();cases.push({label,pass:true});}catch(e){errors.push({label,message:e.message});cases.push({label,pass:false});}};
const grade=(q,r)=>q.type==='journal'?gradeJournal(q,r):gradeFields(q,r);
const good=(q,r,label,spec=q)=>test(q.id+'/'+label,()=>{const g=grade(spec,r);assert.equal(g.correct,true);assert.equal(g.earned,g.max);positive++;});
const bad=(q,r,label,spec=q,field=null,invalid=false)=>test(q.id+'/'+label,()=>{const g=grade(spec,r);assert.equal(g.correct,false);assert(g.earned<g.max);if(field){const c=g.components.find(c=>c.id===field);assert.equal(c.earned,0);if(invalid)assert.equal(c.valid,false);}negative++;});
const expectedReview={"kind": "independent-computation", "reviewedBy": "Independent continuation reviewer (not chapter 11 author)", "reviewedAt": "2026-11-02T11:52:32.507991+00:00", "questionIds": ["n2-industrial-11-cost-boundaries-01", "n2-industrial-11-unit-inventory-01", "n2-industrial-11-variable-statement-01", "n2-industrial-11-absorption-statement-01", "n2-industrial-11-increase-reconciliation-01", "n2-industrial-11-decrease-fifo-01", "n2-industrial-11-equal-same-rate-01", "n2-industrial-11-equal-changed-rate-01", "n2-industrial-11-reverse-profit-01", "n2-industrial-11-reverse-ending-01", "n2-industrial-11-selling-capitalization-error-01", "n2-industrial-11-two-period-bridge-01", "n2-industrial-11-missing-opening-rate-01", "n2-industrial-11-fifo-opening-remains-01"], "questionHashes": {"n2-industrial-11-cost-boundaries-01": "e2a2f7342e30120000db20f16d77563d85069dfd20396abe6110843db9f3899e", "n2-industrial-11-unit-inventory-01": "77a3483c8ead7c21dd31fd2506f0108ca774c3d8045def6ac87e668f648437c3", "n2-industrial-11-variable-statement-01": "0b587fc8a06cf1e15fca090989f65edb17945f1efeaa756978e260871bc8e10f", "n2-industrial-11-absorption-statement-01": "a56a12e434dea09b94f471f7ff180cbcc05fa778a3575992d2bf8e185aa68dba", "n2-industrial-11-increase-reconciliation-01": "54a87743ffbc08138a1ad3521c59bc57fa6aef1d5513383533252f1c3a5ca97a", "n2-industrial-11-decrease-fifo-01": "92b1cd1a7105a654716b02ee23ed01764193c6b7e0c1f26abd249ef442e34741", "n2-industrial-11-equal-same-rate-01": "15cd21e7d05783120ec852678e61ef110e9151c7909e1b28b30545e76e62189e", "n2-industrial-11-equal-changed-rate-01": "2bb33ac095d222844f155c1f17e7e9fe16678c2c44b96597abd2451a22571b70", "n2-industrial-11-reverse-profit-01": "da3aba2bcf62a39716fb9b142a2f32cf24b70ba8d2736a2ccf21b5faa88a4fa5", "n2-industrial-11-reverse-ending-01": "cd574413b26c70de937f5f13c8b67b4695e327f040a936996abeef0ccc7bc660", "n2-industrial-11-selling-capitalization-error-01": "f40e0043f4a92bf619944d9005ebf348baab864387dfe3216b6e73d3ab0b0555", "n2-industrial-11-two-period-bridge-01": "1287c672f027548c5d8f5ecd665e2d2631644874821281f0bbcfb6668fb38207", "n2-industrial-11-missing-opening-rate-01": "da3d6c2d4dc64879a055a441083dcb99dcfa48f5fbc7ed8a33f38c7fbf7119a1", "n2-industrial-11-fifo-opening-remains-01": "dd80b7fe806e29aacb19c7fe1669d75d23d21ea802e01de61e5c14c56613445e"}, "lessonHashes": {"n2-industrial-lesson-11": "5592efe4221fecdfc57ca155211ae282ec2d7804aeb496414ef58ea976da55fc"}, "evidence": "notes/editorial/industrial-direct-costing-review-20261102.md"};
test('pinned-fixture',()=>assert.equal(crypto.createHash('sha256').update(fs.readFileSync(fixturePath)).digest('hex'),'1a5e75b87fdd278d992041ee20dfa02f76db493d672c5d03b90ba571e7797f22'));
test('real-completed-review-and-object-hashes',()=>{const records=content.reviewRecords.filter(r=>r.reviewedBy===expectedReview.reviewedBy&&r.reviewedAt===expectedReview.reviewedAt);assert.equal(records.length,1);assert.deepEqual(records[0],expectedReview);for(const q of qs)assert.equal(digest(q),expectedReview.questionHashes[q.id]);assert.equal(digest(lesson),expectedReview.lessonHashes[lesson.id]);});
for(let i=0;i<own.workedExamples.length;i++)test('example-'+i+'-reviewed-numbers',()=>{const text=lesson.workedExamples[i].answer.replaceAll('−','-'); for(const v of Object.values(own.workedExamples[i].expected))assert(text.includes(v.toLocaleString('en-US')));});
test('structure',()=>{assert.equal(qs.length,14);assert(lesson.sections.length>=10);assert.equal(lesson.workedExamples.length,6);assert.equal(lesson.objectives.length,11);});
for(const q of qs){
 const a=own.questions.find(x=>x.id===q.id).expected;assert(a);
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
 }
}
const conceptual=[
 ['cost-boundaries',{variableFactory:'absorptionOnly'},'omitsVariableFactory'],
 ['cost-boundaries',{fixedFactory:'inventory'},'defersFixedInVariableCosting'],
 ['cost-boundaries',{fixedSelling:'absorptionOnly'},'capitalizesSellingFixed'],
 ['cost-boundaries',{traceableFixed:'variable'},'confusesTraceabilityWithBehavior'],
 ['unit-inventory',{variableUnit:750},'capitalizesVariableSelling'],
 ['unit-inventory',{absorptionUnit:1016},'capitalizesFixedSelling'],
 ['variable-statement',{variableCogs:990000},'expensesUnsoldVariableProduction'],
 ['variable-statement',{periodFixed:306000},'defersFactoryFixed'],
 ['absorption-statement',{absorptionCogs:876538},'allocatesFixedOverSalesInsteadOfProduction'],
 ['increase-reconciliation',{adjustment:-75000},'reversedAdjustment'],
 ['increase-reconciliation',{absorptionProfit:190000},'omitsEndingFixed'],
 ['decrease-fifo',{beginFixed:60000},'revaluesOpeningAtCurrentRate'],
 ['decrease-fifo',{absorptionProfit:294000},'reversedAdjustment'],
 ['equal-same-rate',{reason:'always'},'quantityAloneGuarantee'],
 ['equal-changed-rate',{adjustment:0},'ignoresChangedRate'],
 ['reverse-profit',{variableProfit:159000},'inverseSignError'],
 ['reverse-ending',{endFixed:9000},'subtractsBeginningFixed'],
 ['reverse-ending',{soldUnits:420},'omitsOpeningQuantity'],
 ['selling-capitalization-error',{correctUnit:1000,correctProfit:440000},'retainsSellingCapitalization'],
 ['two-period-bridge',{period2Absorption:325000},'omitsOpeningFixedRelease'],
 ['missing-opening-rate',{uniqueProfit:'yesCurrent'},'inventsOpeningRate'],
 ['missing-opening-rate',{needed:'sellingFixed'},'asksIrrelevantCapitalization'],
 ['fifo-opening-remains',{endFixed:140000},'revaluesOldLayer'],
 ['fifo-opening-remains',{endVariable:385000},'revaluesOldVariableLayer'],
 ['fifo-opening-remains',{variableProfit:55000},'confusesAbsorptionProfit'],
 ['fifo-opening-remains',{interpretation:'cash'},'falseCashIncrease'],
 ['fifo-opening-remains',{interpretation:'recommend'},'unjustifiedOverproduction']
];
for(const [id,patch,label]of conceptual){const q=qs.find(q=>q.id===`n2-industrial-11-${id}-01`);bad(q,{...responses[q.id],...patch},'conceptual/'+label);}
test('components59',()=>assert.equal(components,59));
const scope=['nissho-dde19eab661a','nissho-744d4f6215f5'];
test('exactScope',()=>{assert.deepEqual([...lesson.requirementIds].sort(),[...scope].sort());assert(scope.every(id=>curriculum.some(r=>r.id===id&&r.unit===2&&r.exam==='nissho')));for(const q of qs)assert(q.requirementIds.every(id=>scope.includes(id)));assert(!lesson.requirementIds.includes('nissho-a047cb30d47b'));});
const schema=validate(content,curriculum,{target:'nissho:2'}),publish=validate(content,curriculum,{target:'nissho:2',publish:true});
test('schema',()=>assert.equal(schema.valid,true,schema.errors?.join('\n')));
if(opts.published!=='no')test('genuineReviewPublicationGate',()=>assert.equal(publish.valid,true,publish.errors?.join('\n')));else test('unreviewedDraftCorrectlyBlocked',()=>assert.equal(publish.valid,false));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const out={summary:{status:errors.length?'FAIL':'PASS',baselinePositive:baseline,formatPositive:positive,negativeCases:negative,conceptualNegatives:conceptual.length,components,assertions:cases.length,failures:errors.length},fixtureSha256:sha(fixturePath),contentSha256:sha(contentPath),questionHashes:Object.fromEntries(qs.map(q=>[q.id,digest(q)])),lessonHashes:{[lesson.id]:digest(lesson)},schema,publish,errors,cases};
if(opts.output)fs.writeFileSync(opts.output,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out,cases:undefined},null,2));process.exitCode=errors.length?1:0;
