'use strict';
// Author-only checks: these do not establish independent review or publication approval.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const dir=__dirname,repo=path.resolve(dir,'..');
const {gradeFields,gradeJournal}=require(path.join(repo,'dist/assessment-engine.js')),{validate}=require(path.join(repo,'scripts/validate-learning-content.cjs'));
const all=JSON.parse(fs.readFileSync(path.join(repo,'content/industrial-course.json'),'utf8')),content={...all,lessons:all.lessons.filter(l=>l.id==='n2-industrial-lesson-08'),questions:all.questions.filter(q=>q.lessonId==='n2-industrial-lesson-08')},requirements=JSON.parse(fs.readFileSync(path.join(repo,'content/curriculum.json'),'utf8'));
const data={},steps=[];
function average(name,{B,S,C,E,p,mb,mc,cb,cc}){
 assert.equal(B+S,C+E,name+' physical flow');assert(C>0);assert(E>=0);assert(p>=0&&p<=100);
 const me=C+E,ce=C+E*p/100;assert(me>0&&ce>0,name+' nonzero denominators');
 const mp=mb+mc,cp=cb+cc,mr=mp/me,cr=cp/ce,em=E*mr,ec=E*p/100*cr,cm=C*mr,ccost=C*cr,completed=cm+ccost,ending=em+ec,total=mp+cp;
 for(const v of [B,S,C,E,me,ce,mp,cp,mr,cr,em,ec,cm,ccost,completed,ending,total])assert(Number.isSafeInteger(v),name+' exact integer arithmetic');
 assert.equal(cm+em,mp);assert.equal(ccost+ec,cp);assert.equal(completed+ending,total);
 const result={input:{B,S,C,E,p,mb,mc,cb,cc},materialEU:me,conversionEU:ce,materialPool:mp,conversionPool:cp,materialRate:mr,conversionRate:cr,endingMaterial:em,endingConversion:ec,completedMaterial:cm,completedConversion:ccost,completed,ending,total,unit:mr+cr,check:total-completed-ending};
 data[name]=result;return result;
}
// Inputs are transcribed from the author prompts, not extracted from the rubric answers.
const q4=average('q4-no-opening',{B:0,S:800,C:600,E:200,p:50,mb:0,mc:40000,cb:0,cc:28000});
const q5={materialPool:12000+60000,materialEU:600+200};q5.materialRate=q5.materialPool/q5.materialEU;q5.completedMaterial=600*q5.materialRate;q5.endingMaterial=200*q5.materialRate;assert.equal(200+600,600+200);assert.notEqual((12000/200+60000/600)/2,q5.materialRate);data['q5-material-only']=q5;
const q6={conversionPool:10000+80000,conversionEU:800+200*50/100};q6.conversionRate=q6.conversionPool/q6.conversionEU;q6.completedConversion=800*q6.conversionRate;q6.endingConversion=200*50/100*q6.conversionRate;assert.equal(200+800,800+200);assert.equal(q6.completedConversion+q6.endingConversion,q6.conversionPool);data['q6-conversion-only']=q6;
const q7=average('q7-weighted',{B:200,S:800,C:750,E:250,p:40,mb:14000,mc:56000,cb:6000,cc:79000});
const q8=average('q8-error-correction',{B:0,S:600,C:400,E:200,p:50,mb:0,mc:30000,cb:0,cc:24000});const wrong8=(30000+24000)/(400+200)*200;assert.equal(wrong8,18000);
const q9old=average('q9-old-estimate',{B:0,S:1000,C:800,E:200,p:25,mb:0,mc:60000,cb:0,cc:76500});assert.equal(q9old.ending,16500);
const q9=average('q9-revised-estimate',{B:0,S:1000,C:800,E:200,p:50,mb:0,mc:60000,cb:0,cc:76500});assert.equal(q9.ending-q9old.ending,4000);
const reversePool=(900+100*60/100)*90,reverseCurrent=reversePool-8000;
const q10=average('q10-reverse-cost',{B:160,S:840,C:900,E:100,p:60,mb:9600,mc:50400,cb:8000,cc:reverseCurrent});assert.equal(q10.conversionRate,90);
const q11=average('q11-derived-journal',{B:100,S:500,C:500,E:100,p:60,mb:5000,mc:25000,cb:4000,cc:29600});
const q12=average('q12-no-ending',{B:100,S:900,C:1000,E:0,p:0,mb:7000,mc:63000,cb:3000,cc:47000});
const answers={
 'purpose':{unit:'period',allocation:'both',progress:'equivalent'},
 'physical-flow':{availableUnits:150+950,endingUnits:150+950-900,quantityCheck:150+950-900-(150+950-900)},
 'equivalent-units':{endingMaterialEU:200,endingConversionEU:200*40/100,totalMaterialEU:800+200,totalConversionEU:800+200*40/100},
 'no-opening-allocation':{materialRate:q4.materialRate,conversionRate:q4.conversionRate,completedCost:q4.completed,endingCost:q4.ending,costCheck:q4.check},
 'opening-material-pool':q5,
 'opening-conversion-denominator':{...q6,openingProgressTreatment:'included'},
 'weighted-average-integrated':{materialRate:q7.materialRate,conversionRate:q7.conversionRate,completedCost:q7.completed,endingCost:q7.ending,completedUnitCost:q7.unit,costCheck:q7.check},
 'worksheet-error':{conversionEU:q8.conversionEU,conversionRate:q8.conversionRate,correctEndingCost:q8.ending,correctCompletedCost:q8.completed,endingOverstatement:wrong8-q8.ending},
 'revised-ending-progress':{revisedConversionEU:q9.conversionEU,revisedConversionRate:q9.conversionRate,revisedEndingConversion:q9.endingConversion,revisedEndingCost:q9.ending,endingIncrease:q9.ending-q9old.ending},
 'reverse-current-conversion':{conversionPool:q10.conversionPool,currentConversion:reverseCurrent,completedCost:q10.completed,endingCost:q10.ending,costCheck:q10.check},
 'derived-completion-journal':[{side:'debit',account:'製品',amount:q11.completed},{side:'credit',account:'仕掛品',amount:q11.completed}],
 'no-ending-wip':{conversionEU:q12.conversionEU,materialRate:q12.materialRate,conversionRate:q12.conversionRate,completedCost:q12.completed,endingCost:q12.ending,costCheck:q12.check}
};
const e1={physical:0+500,materialEU:400+100,conversionEU:400+100*30/100};assert.equal(e1.physical,400+100);data['example1']=e1;
const e2=average('example2',{B:0,S:1000,C:800,E:200,p:50,mb:0,mc:50000,cb:0,cc:72000});
const e3=average('example3',{B:100,S:900,C:850,E:150,p:60,mb:6000,mc:54000,cb:4000,cc:80600});
const e4={materialPool:10000+54000,materialEU:650+150};e4.rate=e4.materialPool/e4.materialEU;e4.completed=650*e4.rate;e4.ending=150*e4.rate;assert.equal(e4.completed+e4.ending,e4.materialPool);assert.notEqual(e4.rate,(10000/200+54000/600)/2);data['example4']=e4;
const e5pool=(700+300*40/100)*75,e5current=e5pool-9000;const e5=average('example5',{B:200,S:800,C:700,E:300,p:40,mb:8000,mc:32000,cb:9000,cc:e5current});assert.equal(e5current,52500);
const e6=average('example6',{B:0,S:900,C:750,E:150,p:40,mb:0,mc:45000,cb:0,cc:72900});
assert.deepEqual([e1.materialEU,e1.conversionEU],[500,430]);assert.deepEqual([e2.completed,e2.ending],[104000,18000]);assert.deepEqual([e3.completed,e3.ending],[127500,17100]);assert.deepEqual([e4.rate,e4.completed,e4.ending],[80,52000,12000]);assert.deepEqual([e5.completed,e5.ending],[80500,21000]);assert.deepEqual([e6.completed,e6.ending],[105000,12900]);
const cases=[],errors=[];let positiveCount=0,negativeCount=0,formatPositive=0,components=0;
const clone=x=>structuredClone(x),check=(name,fn)=>{try{fn();cases.push({name,pass:true});}catch(e){errors.push({name,message:e.message});cases.push({name,pass:false,message:e.message});}};
const grade=(q,r)=>q.type==='journal'?gradeJournal(q,r):gradeFields(q,r);
for(const q of content.questions){
 const short=q.id.slice('n2-industrial-08-'.length,-3),response=answers[short];assert(response,q.id+' equation response exists');
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
 ['physical-flow',{endingUnits:80},'progress-applied-to-physical-quantity'],
 ['equivalent-units',{endingMaterialEU:80,totalMaterialEU:880},'conversion-progress-applied-to-start-material'],
 ['equivalent-units',{totalConversionEU:1000},'unfinished-conversion-treated-as-complete'],
 ['no-opening-allocation',{endingCost:9000},'both-costs-halved-by-progress'],
 ['no-opening-allocation',{completedCost:68000,endingCost:0},'all-costs-to-completion'],
 ['opening-material-pool',{materialPool:60000,materialRate:75,completedMaterial:45000,endingMaterial:15000},'opening-material-cost-dropped'],
 ['opening-material-pool',{materialRate:80,completedMaterial:48000,endingMaterial:16000},'simple-average-of-two-rates'],
 ['opening-material-pool',{materialEU:1000},'opening-quantity-double-counted'],
 ['opening-conversion-denominator',{conversionEU:850,openingProgressTreatment:'subtract'},'opening-completed-work-subtracted'],
 ['opening-conversion-denominator',{conversionPool:80000,openingProgressTreatment:'dropCost'},'opening-conversion-cost-dropped'],
 ['weighted-average-integrated',{completedCost:116250,endingCost:38750,completedUnitCost:155},'single-physical-average-for-all-costs'],
 ['weighted-average-integrated',{endingCost:42500},'ending-conversion-treated-as-100-percent'],
 ['worksheet-error',{correctEndingCost:18000,correctCompletedCost:36000,endingOverstatement:0},'erroneous-physical-worksheet-accepted'],
 ['revised-ending-progress',{revisedConversionRate:90,revisedEndingConversion:9000,revisedEndingCost:21000,endingIncrease:4500},'old-rate-held-after-progress-correction'],
 ['revised-ending-progress',{revisedEndingCost:33000,endingIncrease:16500},'doubles-entire-old-WIP'],
 ['reverse-current-conversion',{currentConversion:86400},'total-conversion-mistaken-as-current'],
 ['reverse-current-conversion',{currentConversion:94400},'opening-cost-added-in-reverse'],
 ['no-ending-wip',{completedCost:110000},'opening-cost-omitted-when-no-ending'],
 ['no-ending-wip',{conversionEU:960},'opening-completed-work-subtracted-with-no-ending'],
 ['no-ending-wip',{endingCost:''},'zero-replaced-with-blank']
];
for(const [short,patch,label] of conceptual){const q=content.questions.find(q=>q.id==='n2-industrial-08-'+short+'-01');check(q.id+'/'+label,()=>{const result=grade(q,{...answers[short],...patch});assert.equal(result.correct,false);for(const f of Object.keys(patch))assert.equal(result.components.find(c=>c.id===f).earned,0);negativeCount++;});}
const journalQ=content.questions.find(q=>q.type==='journal');for(const [label,n] of [['all-cost-including-ending',q11.total],['current-only',25000+29600],['ending-only',q11.ending]])check(journalQ.id+'/'+label,()=>{const result=gradeJournal(journalQ,[{side:'debit',account:'製品',amount:n},{side:'credit',account:'仕掛品',amount:n}]);assert.equal(result.correct,false);assert.equal(result.earned,0);negativeCount++;});
const schema=validate(content,requirements,{target:'nissho:2'}),publication=validate(content,requirements,{target:'nissho:2',publish:true});
check('schema-valid',()=>assert.equal(schema.valid,true));check('published-review-gate',()=>assert.equal(publication.valid,true,publication.errors.join('\n')));
check('genuine-record-attached-by-independent-owner',()=>{assert.equal(all.authoringStatus,'reviewed');assert.equal(all.sourceVerificationPending,false);assert.equal(all.reviewRecords.length,9);});
check('counts',()=>{assert.equal(content.lessons[0].sections.length,10);assert.equal(content.lessons[0].workedExamples.length,6);assert.equal(content.questions.length,12);assert.equal(components,55);});
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const summary={status:errors.length?'FAIL':'PASS',reviewRole:'author-only-not-independent',questions:content.questions.length,components,baselinePositive:positiveCount,formatAndModePositive:formatPositive,negativeCases:negativeCount,conceptualNegativeCases:conceptual.length+3,workedExamplesEquationChecked:6,assertionCases:cases.length,failures:errors.length};
const result={summary,inputHashes:{combinedSha256:sha(path.join(repo,'content/industrial-course.json')),engineSha256:sha(path.join(repo,'dist/assessment-engine.js')),validatorSha256:sha(path.join(repo,'scripts/validate-learning-content.cjs')),scriptSha256:sha(__filename)},schema,draftPublication:publication,errors,cases};
console.log(JSON.stringify({summary,inputHashes:result.inputHashes,schema,draftPublication:publication,errors},null,2));process.exitCode=errors.length?1:0;
