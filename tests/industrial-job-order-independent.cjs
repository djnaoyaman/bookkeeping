/* Portable reproduction of the 2026-11-02 independent chapter07 review.
 * Intended path: tests/industrial-job-order-independent.cjs
 * Fixture: tests/fixtures/industrial-job-order-independent-computations.json
 * This does not create a review record or refresh a review timestamp.
 * Run: node tests/industrial-job-order-independent.cjs [--root REPO]
 * Optional paths are resolved relative to --root (or the containing repository):
 * --content --engine --validator --curriculum --computations --output
 * Without --output, results go only to stdout; no repository file is changed.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const allowed=new Set(['root','content','engine','validator','curriculum','computations','output']),options={};
for(let i=2;i<process.argv.length;i+=2){const flag=process.argv[i],key=flag?.replace(/^--/,'');if(!flag?.startsWith('--')||!allowed.has(key)||!process.argv[i+1]||process.argv[i+1].startsWith('--'))throw Error('Expected supported --option value; see script header');if(Object.hasOwn(options,key))throw Error('Duplicate option '+flag);options[key]=process.argv[i+1];}
const repoRoot=options.root?path.resolve(options.root):path.resolve(__dirname,'..');
const resolve=(name,fallback)=>path.resolve(repoRoot,options[name]||fallback);
const contentPath=resolve('content','content/industrial-course.json'),enginePath=resolve('engine','dist/assessment-engine.js'),validatorPath=resolve('validator','scripts/validate-learning-content.cjs'),curriculumPath=resolve('curriculum','content/curriculum.json'),computationsPath=resolve('computations','tests/fixtures/industrial-job-order-independent-computations.json');
const outputPath=options.output?resolve('output',''):null;
const {gradeFields,gradeJournal}=require(enginePath),{validate,digest}=require(validatorPath);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const combined=read(contentPath),derivations=read(computationsPath),requirements=read(curriculumPath);
const chapterId='n2-industrial-lesson-07';
const content={...combined,lessons:combined.lessons.filter(l=>l.id===chapterId),questions:combined.questions.filter(q=>q.lessonId===chapterId)};
const clone=x=>structuredClone(x),cases=[],errors=[];let baselinePositive=0,formatPositive=0,negativeCount=0,components=0;
const check=(name,fn)=>{try{const r=fn();cases.push({name,pass:true,...r});}catch(e){errors.push({name,message:e.message});cases.push({name,pass:false,message:e.message});}};
const grade=(q,r)=>q.type==='journal'?gradeJournal(q,r):gradeFields(q,r);
const responses=new Map();
// Pinned copy of the genuine completed review, not a newly generated record.
const expectedReview={
  "kind": "independent-computation",
  "reviewedBy": "Independent reviewer /root/advance_remaining_site_backlogs/job_order_independent_review (not chapter07 author)",
  "reviewedAt": "2026-11-02T09:44:25Z",
  "questionIds": [
    "n2-industrial-07-purpose-01",
    "n2-industrial-07-documents-01",
    "n2-industrial-07-cost-sheet-01",
    "n2-industrial-07-two-jobs-01",
    "n2-industrial-07-job-status-01",
    "n2-industrial-07-missing-current-01",
    "n2-industrial-07-completion-journal-01",
    "n2-industrial-07-sale-cost-journal-01",
    "n2-industrial-07-unsold-completed-01",
    "n2-industrial-07-repair-specific-job-01",
    "n2-industrial-07-repair-not-double-01",
    "n2-industrial-07-multi-month-order-01",
    "n2-industrial-07-manufacturing-flow-01",
    "n2-industrial-07-completion-vs-sale-choice-01"
  ],
  "questionHashes": {
    "n2-industrial-07-purpose-01": "1c2273cebaf70b66a92e1671cffb1eb5ac9af4de6a2ca922945e15e173c939a3",
    "n2-industrial-07-documents-01": "1f1176541e45d8b0619ed458b90ff1b91ce9a2b812c6bd48dce46d292a2825d2",
    "n2-industrial-07-cost-sheet-01": "fd480c0cad5fa2f9e744a7ef2043b4ef2294fa442637b79afdaa111bd694f89f",
    "n2-industrial-07-two-jobs-01": "02986824d050a01b5fa00c9d4ae8942bef0ccdf7af158f890223487beaf02969",
    "n2-industrial-07-job-status-01": "fa4e35c8eb707a42244e3be0070bbc13710af916a8ac554cc2a5047cdf4c4e46",
    "n2-industrial-07-missing-current-01": "0fc7f65d438f292eb2bafcdff0733ea53b278ca3e1d009aed73fea8ee5ccf4a5",
    "n2-industrial-07-completion-journal-01": "96b1e477a09a90ce1383d3a7c6755a046a148f5571e22a24e8531cf0b3c5619b",
    "n2-industrial-07-sale-cost-journal-01": "10a57c5832533fc8760a6f9b614153d202750985a1b79df26838415abaebe8c9",
    "n2-industrial-07-unsold-completed-01": "8af1e5c3e812754ba91bbc7fd9f267e2f5c8cb63d4322d9159cfca8f00f77c3b",
    "n2-industrial-07-repair-specific-job-01": "abf0351e3082a7c1e00b8fcbb1f81617abc3e973b5b7b4f50b8291f0d84f107e",
    "n2-industrial-07-repair-not-double-01": "2f78ca2dc1bd8ca1b9b13314329997e2e26cc3a7d42a8fdd2e8814f5ba81b0d8",
    "n2-industrial-07-multi-month-order-01": "32490fb887666a79dabc8666537f4b44fd66e716995493ebb67721998ff31f2c",
    "n2-industrial-07-manufacturing-flow-01": "27ad0b243e5e29af150f3281e38b7fd731ff907092c355eb496137a051d7ee0d",
    "n2-industrial-07-completion-vs-sale-choice-01": "9fab5956c7cae7615167ed4863dd486996edf3edbd95236ea8fbc020da0294c4"
  },
  "lessonHashes": {
    "n2-industrial-lesson-07": "833968a53a1fccd0a76db802bd8ed8366367c091bfbf1b7ee36e52bf8a30fa58"
  },
  "evidence": "notes/editorial/industrial-job-order-review-20261102.md"
};
const expectedFixtureSha256='36bbd7119b768a43b6052f40e79aa5afec61145ab7e20f1e4d8b507948104441';

check('independent-computations-fixture-exact-hash',()=>assert.equal(sha(computationsPath),expectedFixtureSha256));
check('real-integrated-review-record-and-exact-object-hashes',()=>{
 const matches=(combined.reviewRecords||[]).filter(r=>r.kind===expectedReview.kind&&r.reviewedBy===expectedReview.reviewedBy&&r.reviewedAt===expectedReview.reviewedAt);
 assert.equal(matches.length,1,'Exactly one genuine chapter07 review record must already be attached by the owner');
 const record=matches[0];assert.deepEqual(record,expectedReview);
 assert.deepEqual(content.questions.map(q=>q.id),record.questionIds);
 for(const q of content.questions)assert.equal(digest(q),record.questionHashes[q.id],q.id+' differs from the independently reviewed object');
 assert.equal(content.lessons.length,1);assert.equal(digest(content.lessons[0]),record.lessonHashes[chapterId],'Lesson differs from the independently reviewed object');
});
check('structure-counts',()=>{assert.equal(content.lessons.length,1);assert.equal(content.lessons[0].sections.length,10);assert.equal(content.lessons[0].workedExamples.length,6);assert.equal(content.questions.length,14);});
for(const own of derivations.questions){
 const q=content.questions.find(x=>x.id===own.id);assert(q);
 const response=q.type==='journal'?Object.entries(own.solution).map(([side,line])=>({side,...line})):clone(own.solution);responses.set(q.id,response);
 check(`${q.id}/key-agrees-with-prior-independent-derivation`,()=>{
  if(q.type==='fields')assert.deepEqual(Object.fromEntries(q.fields.map(f=>[f.id,f.answer])),response);
  else assert.deepEqual(q.lines.map(({side,account,amount})=>({side,account,amount})),response);
 });
 check(`${q.id}/independent-correct-response`,()=>{const r=grade(q,response);assert.equal(r.correct,true);assert.equal(r.earned,r.max);baselinePositive++;components+=r.max;return {earned:r.earned,max:r.max};});
 const positive=(name,r,spec=q)=>check(`${q.id}/${name}`,()=>{const g=grade(spec,r);assert.equal(g.correct,true);assert.equal(g.earned,g.max);formatPositive++;});
 const negative=(name,r,spec=q,field=null,invalid=false)=>check(`${q.id}/${name}`,()=>{
  const g=grade(spec,r);assert.equal(g.correct,false);assert(g.earned<g.max);if(field){const c=g.components.find(c=>c.id===field);assert.equal(c.earned,0);if(invalid)assert.equal(c.valid,false);}negativeCount++;return {earned:g.earned,max:g.max};
 });
 negative('empty-response',q.type==='journal'?[]:{});negative('null-response',null);negative('undefined-response',undefined);
 if(q.type==='fields'){
  for(const f of q.fields){
   const expect=own.solution[f.id],alter=(value)=>({...response,[f.id]:value});
   for(const [name,value] of [['blank',''],['null',null],['undefined',undefined],['whitespace',' \t '],['array',[]],['boolean',false]])negative(`${f.id}/${name}`,alter(value),q,f.id,true);
   const missing={...response};delete missing[f.id];negative(`${f.id}/missing`,missing,q,f.id,true);
   if(f.type==='choice'){
    for(const v of f.options.filter(v=>v!==expect))negative(`${f.id}/wrong-option-${v}`,alter(v),q,f.id);
    negative(`${f.id}/outside-option`,alter('__not_a_choice__'),q,f.id,true);
   }else{
    for(const [name,value] of [['plus-one',expect+1],['minus-one',expect-1],['wrong-sign-or-one',expect===0?-1:-expect]])negative(`${f.id}/${name}`,alter(value),q,f.id);
    if(expect!==0)negative(`${f.id}/zero`,alter(0),q,f.id);
    for(const [name,value] of [['unit-appended',`${expect}円`],['scientific',`${expect}e0`],['fractional',`${expect}.0`],['malformed-grouping',`${expect},00`],['infinity',Infinity],['NaN',NaN],['overflow','9007199254740993']])negative(`${f.id}/${name}`,alter(value),q,f.id,true);
    positive(`${f.id}/numeric-string`,alter(String(expect)));
    positive(`${f.id}/grouped-string`,alter(expect.toLocaleString('en-US')));
    positive(`${f.id}/fullwidth-string`,alter(String(expect).replace(/[0-9]/g,d=>String.fromCharCode(d.charCodeAt(0)+0xfee0))));
   }
  }
 }else{
  positive('order-independent',clone(response).reverse());
  positive('grouped-amounts',response.map(l=>({...l,amount:l.amount.toLocaleString('en-US')})));
  positive('cbt-baseline',response,{...q,inputMode:'cbt'});
  for(let index=0;index<response.length;index++){
   const mutate=(key,value)=>response.map((r,i)=>i===index?{...r,[key]:value}:{...r});
   negative(`row${index}/missing`,response.filter((_,i)=>i!==index));
   for(const v of q.accounts.filter(a=>a!==response[index].account))negative(`row${index}/wrong-account-${v}`,mutate('account',v));
   for(const [name,value] of [['blank',''],['unknown','現金']])negative(`row${index}/account-${name}`,mutate('account',value));
   for(const value of ['debit','credit','',null,'other'].filter(v=>v!==response[index].side))negative(`row${index}/side-${String(value)}`,mutate('side',value));
   for(const [name,value] of [['blank',''],['null',null],['zero',0],['negative',-response[index].amount],['plus-one',response[index].amount+1],['scientific','1e5'],['unit',`${response[index].amount}円`],['fractional',`${response[index].amount}.0`],['overflow','9007199254740993']])negative(`row${index}/amount-${name}`,mutate('amount',value));
  }
  negative('reversed-sides',response.map(r=>({...r,side:r.side==='debit'?'credit':'debit'})));
  negative('extra-balanced-unrelated-pair',[...clone(response),{side:'debit',account:'現金',amount:100},{side:'credit',account:'売上',amount:100}]);
  negative('extra-permitted-account',[...clone(response),{side:'debit',account:q.accounts.find(a=>!response.some(r=>r.account===a)),amount:100}]);
  negative('extra-zero-row',[...clone(response),{side:'debit',account:'現金',amount:0}]);
  negative('extra-empty-row',[...clone(response),{}]);
  negative('extra-duplicate-full-row',[...clone(response),clone(response[0])]);
  const split=[{...response[0],amount:response[0].amount/2},{...response[0],amount:response[0].amount/2},clone(response[1])];
  positive('learning-split-same-account-is-documented-compatible',split);
  check(`${q.id}/learning-split-warning`,()=>assert(grade(q,split).warnings.length>0));
  negative('cbt-rejects-duplicate-same-account',split,{...q,inputMode:'cbt'});
 }
}
const conceptual=[
 ['job-status',{costA:42000,costC:24000,completed:66000,endingFG:42000,COGS:24000},'drops-opening-WIP'],
 ['job-status',{completed:172000,endingWIP:0},'treats-all-jobs-as-complete'],
 ['job-status',{endingFG:0,COGS:116000},'completed-equals-sold'],
 ['missing-current',{currentCost:236000,available:282000},'adds-instead-of-subtracts-opening'],
 ['cost-sheet',{overhead:30000,manufacturingCost:132000,costPerUnit:1320},'rate-times-units-not-hours'],
 ['cost-sheet',{costPerUnit:2000},'wrong-unit-denominator-hours'],
 ['two-jobs',{overheadA:60000,overheadB:60000,costA:116000,costB:144000,total:260000},'whole-factory-overhead-applied-to-both'],
 ['unsold-completed',{COGS:114000,grossProfit:66000},'completed-equals-COGS'],
 ['unsold-completed',{COGS:132000,grossProfit:48000},'drops-ending-FG'],
 ['repair-specific-job',{finalJobCost:112800,unitCost:1880},'repair-charged-twice'],
 ['repair-specific-job',{unitCost:870},'repair-order-doubles-good-quantity'],
 ['repair-specific-job',{finalJobCost:8400,unitCost:140},'original-job-cost-dropped'],
 ['repair-not-double',{completedCost:102000,repairRemaining:7000},'repair-added-after-full-transfer'],
 ['multi-month-order',{completedCost:48000},'opening-WIP-dropped'],
 ['multi-month-order',{completedCost:168000},'opening-WIP-double-counted'],
 ['manufacturing-flow',{completed:90000},'ending-FG-deducted-from-WIP-stage'],
 ['manufacturing-flow',{COGS:114000,grossProfit:66000},'completion-not-sale-flow'],
 ['completion-vs-sale-choice',{unfinished:'製品',completedUnsold:'売上原価',sold:'仕掛品'},'cost-state-misclassification']
];
for(const [short,patch,label] of conceptual){const id=`n2-industrial-07-${short}-01`,q=content.questions.find(q=>q.id===id),response={...responses.get(id),...patch};check(`${id}/conceptual/${label}`,()=>{const r=grade(q,response);assert.equal(r.correct,false);for(const key of Object.keys(patch))assert.equal(r.components.find(c=>c.id===key).earned,0);negativeCount++;return{earned:r.earned,max:r.max};});}
check('total-components',()=>assert.equal(components,51));
const schema=validate(content,requirements,{target:'nissho:2'});check('unchanged-validator-chapter-schema',()=>assert.equal(schema.valid,true));
const publication=validate(combined,requirements,{target:'nissho:2',publish:true});check('real-combined-publication-gate',()=>assert.equal(publication.valid,true,publication.errors.join('\n')));
check('chapter07-prerequisites-present-in-real-combined-course',()=>{const lessonIds=new Set(combined.lessons.map(l=>l.id));for(const l of content.lessons)for(const p of l.prerequisiteIds||[])assert(lessonIds.has(p),l.id+' missing prerequisite '+p);});
const requirementIds=['nissho-8f82b6d44a80','nissho-518843dbb4d4','nissho-f1d12ed9ccbe','nissho-ae5b20dac83f','nissho-be1b1e861f67'];
const mappedRequirements=requirements.filter(r=>requirementIds.includes(r.id));check('scope-ids-grade2-mapped',()=>{assert.equal(mappedRequirements.length,5);assert(mappedRequirements.every(r=>r.exam==='nissho'&&r.unit===2));});
check('preserved-independent-test-counts',()=>{assert.equal(baselinePositive,14);assert.equal(formatPositive,122);assert.equal(negativeCount,916);assert.equal(conceptual.length,18);assert.equal(components,51);});
const summary={status:errors.length?'FAIL':'PASS',baselinePositive,formatAndModePositive:formatPositive,negativeCases:negativeCount,conceptualNegativeCases:conceptual.length,components,priorIndependentReviewWorkedExamples:6,assertionCases:cases.length,failures:errors.length};
const out={reviewer:derivations.reviewer,method:'Portable reproduction of existing independent computations and unchanged positive/negative test logic. Uses the real combined course and pre-existing genuine review record; does not perform or claim a new manual/source review.',summary,inputHashes:{combinedContentSha256:sha(contentPath),engineSha256:sha(enginePath),validatorSha256:sha(validatorPath),computationsSha256:sha(computationsPath),scriptSha256:sha(__filename)},reviewIdentity:{reviewedBy:expectedReview.reviewedBy,reviewedAt:expectedReview.reviewedAt,evidence:expectedReview.evidence},chapterSchema:schema,combinedPublication:publication,mappedRequirements,errors,cases};
if(outputPath){const inputs=[contentPath,enginePath,validatorPath,curriculumPath,computationsPath,__filename].map(p=>path.resolve(p));if(inputs.includes(outputPath))throw Error('Refusing to overwrite an input with --output');fs.writeFileSync(outputPath,JSON.stringify(out,null,2)+'\n');}
console.log(JSON.stringify({summary,inputHashes:out.inputHashes,reviewIdentity:out.reviewIdentity,chapterSchema:schema,combinedPublication:publication,errors},null,2));
process.exitCode=errors.length?1:0;
