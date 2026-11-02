'use strict';
// Independent chapter08 grading/negative checks. Expected answers are separately derived before keys.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const opts={};for(let i=2;i<process.argv.length;i+=2)opts[process.argv[i].slice(2)]=process.argv[i+1];
const root=path.resolve(opts.root||path.join(__dirname,'..'));
const contentPath=path.resolve(opts.content||path.join(root,'content/industrial-course.json'));
const fixturePath=path.resolve(opts.computations||path.join(root,'tests/fixtures/industrial-process-average-independent-computations.json'));
const content=JSON.parse(fs.readFileSync(contentPath)),own=JSON.parse(fs.readFileSync(fixturePath));
const {gradeFields,gradeJournal}=require(path.join(root,'dist/assessment-engine.js'));
const {validate,digest}=require(path.join(root,'scripts/validate-learning-content.cjs'));
const curriculum=JSON.parse(fs.readFileSync(path.join(root,'content/curriculum.json')));
const qs=content.questions.filter(q=>q.lessonId==='n2-industrial-lesson-08'),lesson=content.lessons.find(l=>l.id==='n2-industrial-lesson-08');
let baseline=0,positive=0,negative=0,components=0;const cases=[],errors=[],responses={};
const test=(label,fn)=>{try{fn();cases.push({label,pass:true});}catch(e){errors.push({label,message:e.message});cases.push({label,pass:false});}};
const grade=(q,r)=>q.type==='journal'?gradeJournal(q,r):gradeFields(q,r);
const good=(q,r,label,spec=q)=>test(q.id+'/'+label,()=>{const g=grade(spec,r);assert.equal(g.correct,true);assert.equal(g.earned,g.max);positive++;});
const bad=(q,r,label,spec=q,field=null,invalid=false)=>test(q.id+'/'+label,()=>{const g=grade(spec,r);assert.equal(g.correct,false);assert(g.earned<g.max);if(field){const c=g.components.find(c=>c.id===field);assert.equal(c.earned,0);if(invalid)assert.equal(c.valid,false);}negative++;});
const expectedReview={"kind": "independent-computation", "reviewedBy": "Parent reviewer /root/advance_remaining_site_backlogs (not chapter08 author)", "reviewedAt": "2026-11-02T10:12:29Z", "questionIds": ["n2-industrial-08-purpose-01", "n2-industrial-08-physical-flow-01", "n2-industrial-08-equivalent-units-01", "n2-industrial-08-no-opening-allocation-01", "n2-industrial-08-opening-material-pool-01", "n2-industrial-08-opening-conversion-denominator-01", "n2-industrial-08-weighted-average-integrated-01", "n2-industrial-08-worksheet-error-01", "n2-industrial-08-revised-ending-progress-01", "n2-industrial-08-reverse-current-conversion-01", "n2-industrial-08-derived-completion-journal-01", "n2-industrial-08-no-ending-wip-01"], "questionHashes": {"n2-industrial-08-purpose-01": "40baa30341e8c96fa5a6b34ba0a06162e2cff6a44f9847aa2ba47a82f44d2ec1", "n2-industrial-08-physical-flow-01": "0118fb635bc29dc6174e1134a12712eb124c0870013ea09373d1c3f97dd1f269", "n2-industrial-08-equivalent-units-01": "1ca2bd330f8113d85f120e04b75dc05bd09ddb2d1f221217345d0b750646bcda", "n2-industrial-08-no-opening-allocation-01": "179513f32c1d9649b48b511d1f1221786064b04bb255d0c2ab6731a08af9191a", "n2-industrial-08-opening-material-pool-01": "3d42736fab2839a2a499385f8294d0b87fc34e10eec0666dd131b11f5fe62e78", "n2-industrial-08-opening-conversion-denominator-01": "df1aadfc792c1d6a91407f3496b9dc6333a94f517ad583b3e723373f00cae93f", "n2-industrial-08-weighted-average-integrated-01": "9d4a5775d4f89003aae74c963f3c61f6edbc3d7dd03d980c09e86f548fbab701", "n2-industrial-08-worksheet-error-01": "8d2ed39d5dda02693e278964375251ef3fa20906339bc8b5016b1afbf617e789", "n2-industrial-08-revised-ending-progress-01": "07d25e516bfbf8975591bba0b057a38eb014f2f11b01d6cb0c4f60c4492c8e36", "n2-industrial-08-reverse-current-conversion-01": "51734c3373ee599539a45e7ae5b7d3375005288bd3f593465bb9fbfcdd2d62d8", "n2-industrial-08-derived-completion-journal-01": "7eaba1eb03f6b53e095a0f30b74e17b746b2989d543473b21bb4a9f5c47d8d4e", "n2-industrial-08-no-ending-wip-01": "f9520b9cc044871bad36420004f7881054a92010752c06bd432e06f24acb703d"}, "lessonHashes": {"n2-industrial-lesson-08": "cdc5019f4c39dc73efc112fc7e0604d449c4d59b5332a9c02bd2e52a68e70e39"}, "evidence": "notes/editorial/industrial-process-average-review-20261102.md"};
test('pinned-fixture',()=>assert.equal(crypto.createHash('sha256').update(fs.readFileSync(fixturePath)).digest('hex'),'75a19de334749531854c86aa072b164d64c3f2fcd7cf8193cce00459912a475f'));
test('real-completed-review-and-object-hashes',()=>{const records=content.reviewRecords.filter(r=>r.reviewedBy===expectedReview.reviewedBy&&r.reviewedAt===expectedReview.reviewedAt);assert.equal(records.length,1);assert.deepEqual(records[0],expectedReview);for(const q of qs)assert.equal(digest(q),expectedReview.questionHashes[q.id]);assert.equal(digest(lesson),expectedReview.lessonHashes[lesson.id]);});
test('structure',()=>{assert.equal(qs.length,12);assert.equal(lesson.sections.length,10);assert.equal(lesson.workedExamples.length,6);assert.equal(lesson.objectives.length,8);});
for(const q of qs){
 const a=own.questions[q.id];assert(a);
 const r=q.type==='fields'?{...a}:[{side:'debit',account:a.debitAccount,amount:a.debitAmount},{side:'credit',account:a.creditAccount,amount:a.creditAmount}];responses[q.id]=r;
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
  bad(q,r.map(l=>({...l,side:l.side==='debit'?'credit':'debit'})),'wrongSides');bad(q,r.map(l=>({...l,amount:63600})),'transfersTotalCost');bad(q,r.map(l=>({...l,account:l.account==='製品'?'売上原価':l.account})),'saleBeforeSold');
  bad(q,[...r,{side:'debit',account:'現金',amount:1},{side:'credit',account:'売上',amount:1}],'extraBalanced');bad(q,[...r,{}],'extraEmpty');bad(q,[...r,{...r[0],amount:0}],'extraZero');bad(q,[...r,r[0]],'extraDuplicate');
  const split=[{...r[0],amount:27500},{...r[0],amount:27500},r[1]];good(q,split,'learningSplit');bad(q,split,'cbtSplit',{...q,inputMode:'cbt'});
 }
}
const conceptual=[
 ['physical-flow',{endingUnits:80},'usesProgressAsPhysical'],
 ['equivalent-units',{endingMaterialEU:80,totalMaterialEU:880},'materialsWrongProgress'],
 ['equivalent-units',{totalConversionEU:1880},'addsMaterialEU'],
 ['no-opening-allocation',{completedCost:51000,endingCost:17000},'onePhysicalUnitRate'],
 ['opening-material-pool',{materialPool:60000,materialRate:75},'dropsOpeningCost'],
 ['opening-material-pool',{materialRate:80,completedMaterial:48000,endingMaterial:16000},'simpleUnweightedMean'],
 ['opening-conversion-denominator',{conversionEU:850,openingProgressTreatment:'subtract'},'FIFOIntoAverage'],
 ['opening-conversion-denominator',{conversionPool:80000,openingProgressTreatment:'dropCost'},'dropsOpeningConversion'],
 ['weighted-average-integrated',{completedCost:116250,endingCost:38750,completedUnitCost:155},'singlePhysicalRate'],
 ['worksheet-error',{correctEndingCost:18000,correctCompletedCost:36000,endingOverstatement:0},'retainsWrongWorksheet'],
 ['revised-ending-progress',{revisedConversionRate:90,revisedEndingConversion:9000,revisedEndingCost:21000,endingIncrease:4500},'keepsOldRate'],
 ['reverse-current-conversion',{currentConversion:86400},'poolAsCurrent'],
 ['reverse-current-conversion',{currentConversion:94400},'addsOpening'],
 ['no-ending-wip',{conversionEU:960},'subtractsOpeningWork'],
 ['no-ending-wip',{completedCost:110000},'dropsOpeningAtZeroEnding']
];
for(const [id,patch,label]of conceptual){const q=qs.find(q=>q.id===`n2-industrial-08-${id}-01`);bad(q,{...responses[q.id],...patch},'conceptual/'+label);}
test('components55',()=>assert.equal(components,55));
const scope=['nissho-7408bea3fd0a','nissho-edb0e12d4162','nissho-bbe75426d772','nissho-c5750d58af74'];
test('exactScope',()=>{assert.deepEqual(lesson.requirementIds,scope);assert(scope.every(id=>curriculum.some(r=>r.id===id&&r.unit===2&&r.exam==='nissho')));for(const q of qs)assert(q.requirementIds.every(id=>scope.includes(id)));});
const schema=validate(content,curriculum,{target:'nissho:2'}),publish=validate(content,curriculum,{target:'nissho:2',publish:true});
test('schema',()=>assert.equal(schema.valid,true,schema.errors?.join('\n')));
if(opts.published!=='no')test('genuineReviewPublicationGate',()=>assert.equal(publish.valid,true,publish.errors?.join('\n')));else test('unreviewedDraftCorrectlyBlocked',()=>assert.equal(publish.valid,false));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const out={summary:{status:errors.length?'FAIL':'PASS',baselinePositive:baseline,formatPositive:positive,negativeCases:negative,conceptualNegatives:conceptual.length,components,assertions:cases.length,failures:errors.length},fixtureSha256:sha(fixturePath),contentSha256:sha(contentPath),questionHashes:Object.fromEntries(qs.map(q=>[q.id,digest(q)])),lessonHashes:{[lesson.id]:digest(lesson)},schema,publish,errors,cases};
if(opts.output)fs.writeFileSync(opts.output,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({...out,cases:undefined},null,2));process.exitCode=errors.length?1:0;
