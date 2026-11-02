'use strict';
// Independent chapter10 grading/negative checks. Expected answers are separately derived before keys.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const opts={};for(let i=2;i<process.argv.length;i+=2)opts[process.argv[i].slice(2)]=process.argv[i+1];
const root=path.resolve(opts.root||path.join(__dirname,'..'));
const contentPath=path.resolve(opts.content||path.join(root,'content/industrial-course.json'));
const fixturePath=path.resolve(opts.computations||path.join(root,'tests/fixtures/industrial-cvp-independent-computations.json'));
const content=JSON.parse(fs.readFileSync(contentPath)),own=JSON.parse(fs.readFileSync(fixturePath));
const {gradeFields,gradeJournal}=require(path.join(root,'dist/assessment-engine.js'));
const {validate,digest}=require(path.join(root,'scripts/validate-learning-content.cjs'));
const curriculum=JSON.parse(fs.readFileSync(path.join(root,'content/curriculum.json')));
const qs=content.questions.filter(q=>q.lessonId==='n2-industrial-lesson-10'),lesson=content.lessons.find(l=>l.id==='n2-industrial-lesson-10');
let baseline=0,positive=0,negative=0,components=0;const cases=[],errors=[],responses={};
const test=(label,fn)=>{try{fn();cases.push({label,pass:true});}catch(e){errors.push({label,message:e.message});cases.push({label,pass:false});}};
const grade=(q,r)=>q.type==='journal'?gradeJournal(q,r):gradeFields(q,r);
const good=(q,r,label,spec=q)=>test(q.id+'/'+label,()=>{const g=grade(spec,r);assert.equal(g.correct,true);assert.equal(g.earned,g.max);positive++;});
const bad=(q,r,label,spec=q,field=null,invalid=false)=>test(q.id+'/'+label,()=>{const g=grade(spec,r);assert.equal(g.correct,false);assert(g.earned<g.max);if(field){const c=g.components.find(c=>c.id===field);assert.equal(c.earned,0);if(invalid)assert.equal(c.valid,false);}negative++;});
const expectedReview={"kind": "independent-computation", "reviewedBy": "Parent reviewer /root/advance_remaining_site_backlogs (not chapter10 author)", "reviewedAt": "2026-11-02T11:09:41Z", "questionIds": ["n2-industrial-10-assumption-boundary-01", "n2-industrial-10-contribution-build-01", "n2-industrial-10-unit-breakeven-01", "n2-industrial-10-sales-breakeven-01", "n2-industrial-10-target-profit-01", "n2-industrial-10-whole-unit-ceiling-01", "n2-industrial-10-safety-margin-01", "n2-industrial-10-capacity-boundary-01", "n2-industrial-10-inverse-fixed-01", "n2-industrial-10-inverse-price-01", "n2-industrial-10-worksheet-error-01", "n2-industrial-10-two-budgets-01", "n2-industrial-10-insufficient-split-01"], "questionHashes": {"n2-industrial-10-assumption-boundary-01": "89e1c5e8ddfc56adb938686e8638dc8cd1c4dae157a419290e6236de1c217f80", "n2-industrial-10-contribution-build-01": "08006ce4c7aba025abefe4ff233d6c137dc00175a649d3fb5d8891c72bdbd73a", "n2-industrial-10-unit-breakeven-01": "067e0aff0c9c527062ed6940d2dda50652ba87a6e16af90a162b9e87b5405a3b", "n2-industrial-10-sales-breakeven-01": "c561fb18d377c26a6355e774ce3b17bb000b93b2dd9d9cce9aefd5490d7e736e", "n2-industrial-10-target-profit-01": "2769929def2d3e3a3bbb7fa4bddebd71b454322110f832c93f0ecbb32e29a336", "n2-industrial-10-whole-unit-ceiling-01": "d219c3ed64cd8615e244bd52585e0700c96f0ffe7f406bd36b99477f5d837f77", "n2-industrial-10-safety-margin-01": "8defc78580b83aa4decf52e64990b2840e798e60d6268cd792213bc2013a5eda", "n2-industrial-10-capacity-boundary-01": "2309bea8d17cfd48fbc87790af50a6a55972d6736ee4b9357c4226bb789f5d74", "n2-industrial-10-inverse-fixed-01": "7a0b054a2e969e1352ed7fc7ace249bd3b9147a3ae5bdcd1963b9f36542feaea", "n2-industrial-10-inverse-price-01": "6d7ba8f711580523a1847fc5174c3d3412510d4b3f0314195172d8c27db16798", "n2-industrial-10-worksheet-error-01": "bd45c2e22b3b6c41ad430c97d2cca1df87a9ae88093041c8a90f6e02cc97c8a0", "n2-industrial-10-two-budgets-01": "30271bf4abc543905a57dbea80fae524b4689c9a9db5d3bf338f820be9baf469", "n2-industrial-10-insufficient-split-01": "75e51ac736cfb40ae481c9340ae2901a6f6353ffd26ffe01fdd18fd450be6cb3"}, "lessonHashes": {"n2-industrial-lesson-10": "9fb22cca772eeb5f0df028fc1246318092db23101165439b37773a7917a18849"}, "evidence": "notes/editorial/industrial-cvp-review-20261102.md"};
test('pinned-fixture',()=>assert.equal(crypto.createHash('sha256').update(fs.readFileSync(fixturePath)).digest('hex'),'9cdc144b8617a7d831a6342a79ae90f33e4c174fc911fc81c6bf0887e902febd'));
test('real-completed-review-and-object-hashes',()=>{const records=content.reviewRecords.filter(r=>r.reviewedBy===expectedReview.reviewedBy&&r.reviewedAt===expectedReview.reviewedAt);assert.equal(records.length,1);assert.deepEqual(records[0],expectedReview);for(const q of qs)assert.equal(digest(q),expectedReview.questionHashes[q.id]);assert.equal(digest(lesson),expectedReview.lessonHashes[lesson.id]);});
test('structure',()=>{assert.equal(qs.length,13);assert.equal(lesson.sections.length,10);assert.equal(lesson.workedExamples.length,6);assert.equal(lesson.objectives.length,12);});
for(const q of qs){
 const a=own.questions.find(x=>x.id===q.id).answers;assert(a);
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
 ['assumption-boundary',{fixedAt800:480000},'fixedPerUnitCarriedForward'],
 ['assumption-boundary',{variableAt800:240000},'variableTotalFrozen'],
 ['assumption-boundary',{beyondRange:'yes'},'extrapolation'],
 ['contribution-build',{unitVariable:1000,unitContribution:800},'omittedSellingVariable'],
 ['contribution-build',{totalContribution:144000},'confusesOperatingProfit'],
 ['contribution-build',{contributionPercent:67},'variableDenominator'],
 ['unit-breakeven',{breakEvenUnits:240},'dividesByPrice'],
 ['unit-breakeven',{breakEvenSales:600},'confusesUnitsAndSales'],
 ['sales-breakeven',{breakEvenSales:1120000},'variableRatioDenominator'],
 ['sales-breakeven',{breakEvenSales:16800},'percentNotDecimal'],
 ['target-profit',{targetUnits:350},'omitsFixed'],
 ['target-profit',{targetUnits:550},'subtractsProfit'],
 ['whole-unit-ceiling',{minimumUnits:428},'roundsDown'],
 ['whole-unit-ceiling',{profitAtMinimum:15000},'forcesExactTarget'],
 ['safety-margin',{safetyPercent:33},'usesBreakEvenDenominator'],
 ['safety-margin',{safetyAmount:200000},'usesProfitAsMargin'],
 ['capacity-boundary',{feasibility:'reachable'},'assumesExpansion'],
 ['capacity-boundary',{maxProfit:320000},'usesOutsideCandidate'],
 ['inverse-fixed',{fixed:1800000},'addsProfit'],
 ['inverse-price',{requiredPrice:1500},'omitsTargetProfit'],
 ['worksheet-error',{correctBreakEvenSales:600000,cause:'rounding'},'retainsWrongFormula'],
 ['worksheet-error',{lossAtWrongSales:-120000},'wrongRequestedLossSign'],
 ['two-budgets',{afterBreakEvenUnits:600},'reusesOldParameters'],
 ['two-budgets',{afterProfit:230000},'reusesOldContribution'],
 ['insufficient-split',{uniqueActual:'yesA'},'inventsActualCostStructure'],
 ['insufficient-split',{hypothesisASales:1000500},'integerizesTheoreticalSales']
];
for(const [id,patch,label]of conceptual){const q=qs.find(q=>q.id===`n2-industrial-10-${id}-01`);bad(q,{...responses[q.id],...patch},'conceptual/'+label);}
test('components55',()=>assert.equal(components,55));
const scope=['nissho-c9eaf983a9d4'];
test('exactScope',()=>{assert.deepEqual(lesson.requirementIds,scope);assert(scope.every(id=>curriculum.some(r=>r.id===id&&r.unit===2&&r.exam==='nissho')));for(const q of qs)assert(q.requirementIds.every(id=>scope.includes(id)));assert(!lesson.requirementIds.includes('nissho-56bfa517cfcb'));});
const schema=validate(content,curriculum,{target:'nissho:2'}),publish=validate(content,curriculum,{target:'nissho:2',publish:true});
test('schema',()=>assert.equal(schema.valid,true,schema.errors?.join('\n')));
if(opts.published!=='no')test('genuineReviewPublicationGate',()=>assert.equal(publish.valid,true,publish.errors?.join('\n')));else test('unreviewedDraftCorrectlyBlocked',()=>assert.equal(publish.valid,false));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const out={summary:{status:errors.length?'FAIL':'PASS',baselinePositive:baseline,formatPositive:positive,negativeCases:negative,conceptualNegatives:conceptual.length,components,assertions:cases.length,failures:errors.length},fixtureSha256:sha(fixturePath),contentSha256:sha(contentPath),questionHashes:Object.fromEntries(qs.map(q=>[q.id,digest(q)])),lessonHashes:{[lesson.id]:digest(lesson)},schema,publish,errors,cases};
if(opts.output)fs.writeFileSync(opts.output,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out,cases:undefined},null,2));process.exitCode=errors.length?1:0;
