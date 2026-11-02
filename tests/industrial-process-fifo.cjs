'use strict';
// AUTHOR-only computations; never independent review evidence. Inputs manually
// transcribed from problem statements, not extracted from rubric answers.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const dir=__dirname,repo=path.resolve(path.join(dir,'..'));
const {gradeFields,gradeJournal}=require(path.join(repo,'dist/assessment-engine.js')),{validate}=require(path.join(repo,'scripts/validate-learning-content.cjs'));
const all=JSON.parse(fs.readFileSync(path.join(repo,'content/industrial-course.json'),'utf8')),content={...all,lessons:all.lessons.filter(l=>l.id==='n2-industrial-lesson-09'),questions:all.questions.filter(q=>q.lessonId==='n2-industrial-lesson-09')},requirements=JSON.parse(fs.readFileSync(path.join(repo,'content/curriculum.json'),'utf8'));
const data={};
function work(name,{B,S,C,E,b,p}){
 assert.equal(B+S,C+E,name+' physical conservation');assert(C>0&&C>=B&&B>=0&&E>=0&&S>0);assert(b>=0&&b<=100&&p>=0&&p<=100);
 const prior=B*b/100,remaining=B-prior,startedCompleted=C-B,endWork=E*p/100,materialEU=startedCompleted+E,conversionEU=remaining+startedCompleted+endWork;
 assert.equal(materialEU,S);assert.equal(conversionEU,C-prior+endWork);assert(materialEU>0&&conversionEU>0);
 const out={prior,remaining,startedCompleted,endWork,materialEU,conversionEU};for(const n of Object.values(out))assert(Number.isSafeInteger(n),name+' integer work');return out;
}
function fifo(name,x){
 const w=work(name,x);let {mb,cb,openingTotal,mc,cc}=x;
 if(openingTotal===undefined)openingTotal=mb+cb;
 const materialRate=mc/w.materialEU,conversionRate=cc/w.conversionEU,endingMaterial=x.E*materialRate,endingConversion=w.endWork*conversionRate,ending=endingMaterial+endingConversion,total=openingTotal+mc+cc,completed=total-ending;
 const completedViaCurrentWork=openingTotal+w.startedCompleted*materialRate+(x.C-w.prior)*conversionRate;
 assert.equal(completed,completedViaCurrentWork,name+' alternative completion equation');assert.equal(total,completed+ending);
 const out={...w,openingTotal,mc,cc,materialRate,conversionRate,endingMaterial,endingConversion,ending,total,completed,completedViaCurrentWork,check:total-completed-ending};
 for(const n of Object.values(out))assert(Number.isSafeInteger(n),name+' exact integer arithmetic');data[name]={inputs:x,...out};return out;
}
const q2=work('q2',{B:240,S:960,C:1000,E:200,b:25,p:60});data.q2=q2;
const q3w=work('q3',{B:180,S:720,C:780,E:120,b:40,p:50});const q3rate=64800/q3w.materialEU,q3end=120*q3rate,q3comp=12600+64800-q3end;data.q3={...q3w,rate:q3rate,ending:q3end,completed:q3comp};
const q4w=work('q4',{B:160,S:640,C:650,E:150,b:25,p:60});const q4rate=49000/q4w.conversionEU,q4end=q4w.endWork*q4rate,q4comp=4800+49000-q4end;data.q4={...q4w,rate:q4rate,ending:q4end,completed:q4comp};
const q5=fifo('q5',{B:200,S:1000,C:1000,E:200,b:40,p:50,mb:10400,cb:8000,mc:60000,cc:81600});assert(Number.isInteger(q5.completed/1000));
const q6fifoRate=81000/900,q6avgRate=(15000+81000)/(1000+200),q6fifoEnd=200*q6fifoRate,q6avgEnd=200*q6avgRate;assert.equal(300+900,1000+200);data.q6={fifoRate:q6fifoRate,averageRate:q6avgRate,fifoEnding:q6fifoEnd,averageEnding:q6avgEnd,total:15000+81000};
const q7=fifo('q7',{B:100,S:700,C:600,E:200,b:50,p:25,mb:7000,cb:6000,mc:42000,cc:66000});const q7wrongEU=600-100+200*25/100,q7wrongRate=66000/q7wrongEU,q7wrongEnd=200*q7.materialRate+200*25/100*q7wrongRate;assert.equal(q7wrongEnd,18000);assert.equal(q7.total-q7wrongEnd,103000);data.q7Wrong={conversionEU:q7wrongEU,rate:q7wrongRate,ending:q7wrongEnd};
const q8old=fifo('q8-original',{B:120,S:480,C:500,E:100,b:50,p:40,mb:6000,cb:4000,mc:28800,cc:33600});const q8=fifo('q8-corrected',{B:120,S:480,C:500,E:100,b:50,p:40,openingTotal:12400,mc:28800,cc:33600});assert.equal(q8.ending,q8old.ending);
const q9old=fifo('q9-original',{B:200,S:800,C:800,E:200,b:25,p:50,mb:12000,cb:4000,mc:48000,cc:68000});assert.equal(q9old.ending,20000);
const q9=fifo('q9-corrected',{B:200,S:800,C:800,E:200,b:50,p:50,mb:12000,cb:4000,mc:48000,cc:68000});
const q10w=work('q10',{B:180,S:820,C:900,E:100,b:50,p:40}),q10current=q10w.conversionEU*75;
const q10=fifo('q10',{B:180,S:820,C:900,E:100,b:50,p:40,mb:9000,cb:7200,mc:49200,cc:q10current});
const q11=fifo('q11',{B:150,S:650,C:700,E:100,b:40,p:50,mb:7500,cb:6000,mc:39000,cc:55200});
const q12=fifo('q12',{B:80,S:520,C:600,E:0,b:25,p:0,mb:4800,cb:2000,mc:31200,cc:40600});assert(Number.isInteger(q12.completed/600));assert.notEqual(q12.completed/600,q12.materialRate+q12.conversionRate);
const q13=fifo('q13',{B:200,S:600,C:650,E:150,b:30,p:40,openingTotal:17500,mc:36000,cc:52000});
const answers={
 'period-boundary':{openingCost:'completed',currentRate:'current',finishedUnit:'aggregate'},
 'current-work':{openingRemaining:q2.remaining,startedCompleted:q2.startedCompleted,endingConversion:q2.endWork,currentConversionEU:q2.conversionEU,currentMaterialEU:q2.materialEU},
 'start-material':{openingAdditionalMaterial:0,currentMaterialEU:q3w.materialEU,materialRate:q3rate,endingMaterial:q3end,completedMaterial:q3comp},
 'conversion-denominator':{priorConversionEU:q4w.prior,currentConversionEU:q4w.conversionEU,conversionRate:q4rate,endingConversion:q4end,completedConversion:q4comp},
 'integrated-allocation':{materialRate:q5.materialRate,conversionRate:q5.conversionRate,endingMaterial:q5.endingMaterial,endingConversion:q5.endingConversion,completedCost:q5.completed,completedUnitCost:q5.completed/1000,costCheck:q5.check},
 'method-comparison':{fifoEndingMaterial:q6fifoEnd,averageEndingMaterial:q6avgEnd,endingDifference:q6fifoEnd-q6avgEnd,fifoCompletedMaterial:15000+81000-q6fifoEnd,effect:'fifoLower'},
 'worksheet-diagnosis':{correctConversionEU:q7.conversionEU,correctConversionRate:q7.conversionRate,correctEndingCost:q7.ending,correctCompletedCost:q7.completed,endingOverstatement:q7wrongEnd-q7.ending},
 'opening-cost-correction':{conversionRate:q8.conversionRate,endingCost:q8.ending,completedCost:q8.completed,completedIncrease:q8.completed-q8old.completed},
 'opening-progress-correction':{priorConversionEU:q9.prior,currentConversionEU:q9.conversionEU,conversionRate:q9.conversionRate,endingCost:q9.ending,endingIncrease:q9.ending-q9old.ending},
 'reverse-current-cost':{currentConversionEU:q10.conversionEU,currentConversionCost:q10current,endingCost:q10.ending,completedCost:q10.completed,costCheck:q10.check},
 'completion-journal':[{side:'debit',account:'製品',amount:q11.completed},{side:'credit',account:'仕掛品',amount:q11.completed}],
 'no-ending':{currentMaterialEU:q12.materialEU,currentConversionEU:q12.conversionEU,completedCost:q12.completed,endingCost:q12.ending,completedUnitCost:q12.completed/600,costCheck:q12.check},
 'aggregate-opening-data':{endingCost:q13.ending,completedCost:q13.completed,aggregatePossible:'yes',completedMaterialPossible:'insufficient'}
};
const e1=work('example1',{B:120,S:680,C:700,E:100,b:25,p:40});data.example1=e1;
const e2w=work('example2',{B:100,S:500,C:450,E:150,b:50,p:20}),e2rate=35000/e2w.materialEU,e2end=150*e2rate,e2comp=4000+35000-e2end;data.example2={...e2w,rate:e2rate,ending:e2end,completed:e2comp};
const e3=fifo('example3',{B:240,S:760,C:800,E:200,b:50,p:40,mb:12000,cb:6000,mc:45600,cc:60800});
const e4=fifo('example4',{B:100,S:900,C:900,E:100,b:40,p:50,mb:7100,cb:4000,mc:63000,cc:72800});assert(Number.isInteger(e4.completed/900));assert.notEqual(e4.completed/900,e4.materialRate+e4.conversionRate);
const e5current=(700-160*25/100+100*50/100)*60;
const e5=fifo('example5',{B:160,S:640,C:700,E:100,b:25,p:50,mb:8000,cb:3200,mc:38400,cc:e5current});
const e6=fifo('example6',{B:100,S:400,C:400,E:100,b:60,p:40,mb:6000,cb:5400,mc:24000,cc:30400});
const workedExampleResults=[{currentMaterialEU:e1.materialEU,currentConversionEU:e1.conversionEU},{materialRate:e2rate,endingMaterial:e2end,completedMaterial:e2comp},{endingCost:e3.ending,completedCost:e3.completed,total:e3.total},{completedCost:e4.completed,completedUnitCost:e4.completed/900},{currentConversionCost:e5current,endingCost:e5.ending,completedCost:e5.completed},{debitProduct:e6.completed,creditWIP:e6.completed,endingWIP:e6.ending}];
assert.deepEqual(workedExampleResults,[{currentMaterialEU:680,currentConversionEU:710},{materialRate:70,endingMaterial:10500,completedMaterial:28500},{endingCost:18400,completedCost:106000,total:124400},{completedCost:135900,completedUnitCost:151},{currentConversionCost:42600,endingCost:9000,completedCost:83200},{debitProduct:56600,creditWIP:56600,endingWIP:9200}]);
const cases=[],errors=[];let positiveCount=0,negativeCount=0,formatPositive=0,components=0;
const clone=x=>structuredClone(x),check=(name,fn)=>{try{fn();cases.push({name,pass:true});}catch(e){errors.push({name,message:e.message});cases.push({name,pass:false,message:e.message});}};
const grade=(q,r)=>q.type==='journal'?gradeJournal(q,r):gradeFields(q,r);
for(const q of content.questions){
 const short=q.id.slice('n2-industrial-09-'.length,-3),response=answers[short];assert(response,q.id+' equation response exists');
 check(q.id+'/equation-key-match',()=>{if(q.type==='fields')assert.deepEqual(Object.fromEntries(q.fields.map(f=>[f.id,f.answer])),response);else assert.deepEqual(q.lines.map(({side,account,amount})=>({side,account,amount})),response);});
 check(q.id+'/equation-positive',()=>{const r=grade(q,response);assert(r.correct);assert.equal(r.earned,r.max);positiveCount++;components+=r.max;});
 const neg=(label,r,field=null,invalid=false,spec=q)=>check(q.id+'/'+label,()=>{const g=grade(spec,r);assert.equal(g.correct,false);assert(g.earned<g.max);if(field){const c=g.components.find(c=>c.id===field);assert.equal(c.earned,0);if(invalid)assert.equal(c.valid,false);}negativeCount++;});
 const pos=(label,r,spec=q)=>check(q.id+'/'+label,()=>{const g=grade(spec,r);assert(g.correct);assert.equal(g.earned,g.max);formatPositive++;});
 neg('empty-response',q.type==='journal'?[]:{});neg('null-response',null);neg('undefined-response',undefined);
 if(q.type==='fields')for(const f of q.fields){
  const expected=response[f.id],change=v=>({...response,[f.id]:v});
  for(const [label,v] of [['blank',''],['null',null],['undefined',undefined],['whitespace',' \t'],['boolean',false],['array',[]]])neg(f.id+'/'+label,change(v),f.id,true);
  const missing=clone(response);delete missing[f.id];neg(f.id+'/missing',missing,f.id,true);
  if(f.type==='choice'){
   for(const v of f.options.filter(v=>v!==expected))neg(f.id+'/wrong-choice-'+v,change(v),f.id);
   neg(f.id+'/unknown-choice',change('unknown'),f.id,true);
  }else{
   for(const [label,v] of [['plus-one',expected+1],['minus-one',expected-1],['sign',expected===0?-1:-expected]])neg(f.id+'/'+label,change(v),f.id);
   if(expected!==0)neg(f.id+'/zero',change(0),f.id);
   for(const [label,v] of [['units',expected+f.unit],['scientific',expected+'e0'],['fraction',expected+'.0'],['bad-group',expected+',00'],['infinite',Infinity],['NaN',NaN],['overflow','9007199254740993']])neg(f.id+'/'+label,change(v),f.id,true);
   pos(f.id+'/string',change(String(expected)));pos(f.id+'/grouped',change(expected.toLocaleString('en-US')));pos(f.id+'/fullwidth',change(String(expected).replace(/[0-9]/g,d=>String.fromCharCode(d.charCodeAt(0)+0xfee0))));
  }
 }else{
  pos('reversed-row-order',clone(response).reverse());pos('cbt-positive',response,{...q,inputMode:'cbt'});pos('grouped',response.map(l=>({...l,amount:l.amount.toLocaleString('en-US')})));
  for(let i=0;i<2;i++){
   const change=(key,v)=>response.map((r,j)=>i===j?{...r,[key]:v}:{...r});
   neg('row'+i+'/missing',response.filter((_,j)=>j!==i));
   for(const a of q.accounts.filter(a=>a!==response[i].account))neg('row'+i+'/wrong-account-'+a,change('account',a));
   neg('row'+i+'/empty-account',change('account',''));neg('row'+i+'/unknown-account',change('account','現金'));
   for(const side of ['debit','credit','',null,'other'].filter(s=>s!==response[i].side))neg('row'+i+'/side-'+side,change('side',side));
   for(const [label,v] of [['blank',''],['null',null],['zero',0],['negative',-response[i].amount],['plus-one',response[i].amount+1],['units',response[i].amount+'円'],['fraction',response[i].amount+'.0'],['scientific','1e5'],['overflow','9007199254740993']])neg('row'+i+'/amount-'+label,change('amount',v));
  }
  neg('sides-reversed',response.map(l=>({...l,side:l.side==='debit'?'credit':'debit'})));
  neg('extra-balanced-entries',[...clone(response),{side:'debit',account:'現金',amount:100},{side:'credit',account:'売上',amount:100}]);
  neg('extra-zero-row',[...clone(response),{side:'debit',account:'現金',amount:0}]);neg('extra-empty-row',[...clone(response),{}]);neg('duplicate-full-row',[...clone(response),clone(response[0])]);
  const split=[{...response[0],amount:response[0].amount/2},{...response[0],amount:response[0].amount/2},clone(response[1])];pos('learning-split-warning-compatible',split);check(q.id+'/learning-split-warning',()=>assert(grade(q,split).warnings.length>0));neg('cbt-duplicate-rejected',split,null,false,{...q,inputMode:'cbt'});
 }
}
const conceptual=[
 ['current-work',{openingRemaining:60},'prior-work-used-as-remaining'],
 ['current-work',{currentConversionEU:1120},'prior-work-not-subtracted'],
 ['current-work',{currentConversionEU:880},'opening-physical-subtracted'],
 ['current-work',{currentMaterialEU:1200},'opening-material-recharged'],
 ['start-material',{openingAdditionalMaterial:180},'additional-material-at-start-again'],
 ['start-material',{materialRate:(12600+64800)/900,endingMaterial:120*((12600+64800)/900)},'average-method-used'],
 ['start-material',{completedMaterial:780*90},'current-rate-times-all-completed'],
 ['start-material',{completedMaterial:64800-10800},'opening-material-cost-dropped'],
 ['conversion-denominator',{currentConversionEU:580},'entire-opening-quantity-removed'],
 ['conversion-denominator',{currentConversionEU:740},'opening-work-not-removed'],
 ['conversion-denominator',{completedConversion:49000-6300},'opening-conversion-cost-dropped'],
 ['integrated-allocation',{completedCost:60000+81600-20000},'both-opening-costs-dropped'],
 ['integrated-allocation',{endingMaterial:200*0.5*60},'conversion-progress-applied-to-material'],
 ['integrated-allocation',{endingConversion:200*80},'ending-conversion-at-100-percent'],
 ['integrated-allocation',{completedCost:160000},'all-cost-to-completion'],
 ['method-comparison',{fifoEndingMaterial:16000,fifoCompletedMaterial:80000},'methods-conflated'],
 ['method-comparison',{effect:'fifoHigher'},'offsetting-completion-direction-reversed'],
 ['worksheet-diagnosis',{correctConversionEU:550,correctConversionRate:120,correctEndingCost:18000,correctCompletedCost:103000,endingOverstatement:0},'wrong-but-balanced-sheet-accepted'],
 ['opening-cost-correction',{completedCost:63600,completedIncrease:0},'opening-correction-ignored'],
 ['opening-cost-correction',{endingCost:9200,completedCost:65600,completedIncrease:2000},'opening-increase-distributed-physically'],
 ['opening-progress-correction',{currentConversionEU:850,conversionRate:80,endingCost:20000,endingIncrease:0},'old-progress-rate-held'],
 ['opening-progress-correction',{currentConversionEU:700},'all-opening-physical-subtracted'],
 ['reverse-current-cost',{currentConversionCost:q10current-7200},'opening-cost-subtracted-in-reversal'],
 ['reverse-current-cost',{currentConversionCost:q10current+7200},'total-conversion-mistaken-for-current'],
 ['no-ending',{currentConversionEU:600},'zero-ending-does-not-remove-prior-work'],
 ['no-ending',{completedUnitCost:130},'current-unit-cost-sum-for-finished-unit'],
 ['no-ending',{completedCost:31200+40600},'opening-cost-dropped-at-zero-ending'],
 ['no-ending',{endingCost:''},'zero-as-blank'],
 ['aggregate-opening-data',{completedCost:36000+52000-13800},'unknown-opening-split-used-to-drop-total'],
 ['aggregate-opening-data',{aggregatePossible:'no'},'unnecessary-opening-split-required'],
 ['aggregate-opening-data',{aggregatePossible:'guess',completedMaterialPossible:'current'},'unknown-opening-split-invented']
];
for(const [short,patch,label] of conceptual){const q=content.questions.find(q=>q.id==='n2-industrial-09-'+short+'-01');check(q.id+'/'+label,()=>{const g=grade(q,{...answers[short],...patch});assert.equal(g.correct,false);for(const f of Object.keys(patch))assert.equal(g.components.find(c=>c.id===f).earned,0);negativeCount++;});}
const journalQ=content.questions.find(q=>q.type==='journal');for(const [label,n] of [['all-cost-including-ending',q11.total],['current-only',39000+55200],['ending-only',q11.ending],['opening-dropped',q11.completed-13500]])check(journalQ.id+'/'+label,()=>{const g=gradeJournal(journalQ,[{side:'debit',account:'製品',amount:n},{side:'credit',account:'仕掛品',amount:n}]);assert.equal(g.correct,false);assert.equal(g.earned,0);negativeCount++;});
check('example-results-all-safe-integers',()=>{for(const r of workedExampleResults)for(const n of Object.values(r))assert(Number.isSafeInteger(n));});
const schema=validate(content,requirements,{target:'nissho:2'}),publication=validate(content,requirements,{target:'nissho:2',publish:true});
check('schema-valid',()=>assert.equal(schema.valid,true));check('published-review-gate',()=>assert.equal(publication.valid,true,publication.errors.join('\n')));
check('genuine-record-attached-by-independent-owner',()=>{assert.equal(all.authoringStatus,'reviewed');assert.equal(all.sourceVerificationPending,false);assert.equal(all.reviewRecords.length,10);});
check('counts',()=>{assert.equal(content.lessons[0].sections.length,10);assert.equal(content.lessons[0].workedExamples.length,6);assert.equal(content.questions.length,13);assert.equal(components,61);});
check('grade2-current-scope-only',()=>{for(const id of content.lessons[0].requirementIds){const r=requirements.find(r=>r.id===id);assert.equal(r.unit,2);assert.equal(r.source,'https://www.kentei.ne.jp/wp/wp-content/uploads/2021/12/2022_kogen.pdf');}assert(content.lessons[0].requirementIds.includes('nissho-65ea4a3dac67'));});
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const summary={status:errors.length?'FAIL':'PASS',reviewRole:'author-only-not-independent',questions:content.questions.length,components,baselinePositive:positiveCount,formatAndModePositive:formatPositive,negativeCases:negativeCount,conceptualNegativeCases:conceptual.length+4,workedExamplesEquationChecked:6,assertionCases:cases.length,failures:errors.length};
const result={summary,inputHashes:{combinedSha256:sha(path.join(repo,'content/industrial-course.json')),engineSha256:sha(path.join(repo,'dist/assessment-engine.js')),validatorSha256:sha(path.join(repo,'scripts/validate-learning-content.cjs')),scriptSha256:sha(__filename)},schema,draftPublication:publication,errors,cases};
console.log(JSON.stringify({summary,inputHashes:result.inputHashes,schema,draftPublication:publication,errors},null,2));process.exitCode=errors.length?1:0;
