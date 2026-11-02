'use strict';
// AUTHOR-ONLY assurance, not an independent review. Inputs below are manually
// transcribed from the problem statements, never read from answer rubrics.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir=__dirname,repo=path.resolve(path.join(dir,'..'));
const {gradeFields}=require(path.join(repo,'dist/assessment-engine.js'));
const {validate}=require(path.join(repo,'scripts/validate-learning-content.cjs'));
const details={};
const div=(a,b)=>{assert(b>0);assert.equal(a%b,0,'exact integer division');return a/b};
function model(name,p,v,F,Q,max=2000){assert(p>v&&v>=0&&F>=0&&Q>=0&&Q<=max);const sales=p*Q,variable=v*Q,unit=p-v,contribution=sales-variable,profit=contribution-F;assert.equal(profit,unit*Q-F);const out={p,v,F,Q,max,sales,variable,unit,contribution,profit};details[name]=out;return out;}
function bep(x){const units=x.F/x.unit,sales=div(x.F*x.p,x.unit);assert.equal(sales-sales*x.v/x.p-x.F,0);return {units,sales};}
const a1=model('q1',1000,600,240000,800);
const a2=model('q2',1800,700+300+80,432000,800);
const a3=model('q3',1600,960,384000,div(384000,1600-960)),b3=bep(a3);
const a4=model('q4',2000,div(1440000,1200),672000,1200);assert.equal(a4.sales,2400000);assert.equal(a4.variable,1440000);
const target5=350000,quantity5=div(900000+target5,2500-1500),a5=model('q5',2500,1500,900000,quantity5);assert.equal(a5.profit,target5);
const numerator6=212000+15000,unit6=1400-870,min6=Math.ceil(numerator6/unit6),a6=model('q6-minimum',1400,870,212000,min6),a6prev=model('q6-one-less',1400,870,212000,min6-1);assert(a6.profit>=15000&&a6prev.profit<15000);assert.equal(numerator6%unit6,160);
const a7=model('q7',1250,750,600000,1600),b7=bep(a7),margin7=a7.sales-b7.sales;assert.equal(margin7*a7.unit/a7.p,a7.profit);
const candidate8=div(560000+320000,2000-1200),a8=model('q8-upper-limit',2000,1200,560000,1000,1000);assert(candidate8>a8.max);assert(a8.profit<320000);
const contribution9=3600000-2160000,fixed9=contribution9-360000,a9=model('q9',1800,div(2160000,2000),fixed9,2000);assert.equal(a9.profit,360000);
const unit10=div(480000+240000,800),p10=900+unit10,a10=model('q10',p10,900,480000,800);assert.equal(a10.profit,240000);
const a11=model('q11-wrong-sheet-sales',1500,900,360000,div(600000,1500)),b11=bep(a11);assert(a11.profit<0);
const a12=model('q12-before',2000,1200,480000,900),b12=model('q12-after',1800,1100,490000,900);
const a13=model('q13-hypothesis-A',1500,600,600000,1000),b13=model('q13-hypothesis-B',1500,900,300000,1000);assert.equal(a13.F+a13.variable,1200000);assert.equal(b13.F+b13.variable,1200000);assert.notEqual(bep(a13).sales,bep(b13).sales);
const answers={
 'assumption-boundary':{fixedAt800:a1.F,variableAt800:a1.variable,fixedPerUnit800:div(a1.F,a1.Q),beyondRange:'confirmRange'},
 'contribution-build':{unitVariable:a2.v,unitContribution:a2.unit,contributionPercent:div(a2.unit*100,a2.p),sales:a2.sales,totalContribution:a2.contribution,profit:a2.profit},
 'unit-breakeven':{unitContribution:a3.unit,breakEvenUnits:b3.units,breakEvenSales:b3.sales,profitAtBreakEven:a3.profit},
 'sales-breakeven':{variablePercent:div(a4.v*100,a4.p),contributionPercent:div(a4.unit*100,a4.p),breakEvenSales:bep(a4).sales,profit:a4.profit},
 'target-profit':{requiredContribution:a5.F+target5,targetUnits:a5.Q,targetSales:a5.sales,verifiedProfit:a5.profit},
 'whole-unit-ceiling':{minimumUnits:min6,profitAtMinimum:a6.profit,profitOneLess:a6prev.profit,salesAtMinimum:a6.sales},
 'safety-margin':{plannedSales:a7.sales,breakEvenSales:b7.sales,safetyAmount:margin7,safetyPercent:div(margin7*100,a7.sales),profit:a7.profit},
 'capacity-boundary':{algebraicCandidate:candidate8,maxProfit:a8.profit,profitShortfall:320000-a8.profit,feasibility:'notReachable'},
 'inverse-fixed':{contribution:contribution9,fixed:fixed9,breakEvenSales:bep(a9).sales},
 'inverse-price':{unitContribution:unit10,requiredPrice:p10,contributionPercent:div(unit10*100,p10),sales:a10.sales},
 'worksheet-error':{correctPercent:div(a11.unit*100,a11.p),correctBreakEvenSales:b11.sales,lossAtWrongSales:-a11.profit,cause:'variableDenominator'},
 'two-budgets':{beforeBreakEvenUnits:bep(a12).units,afterBreakEvenUnits:bep(b12).units,beforeProfit:a12.profit,afterProfit:b12.profit,profitDecrease:a12.profit-b12.profit},
 'insufficient-split':{currentProfit:1500*1000-1200000,hypothesisASales:bep(a13).sales,hypothesisBSales:bep(b13).sales,uniqueActual:'no'}
};
const e1a=model('e1-300',2000,1200,180000,300),e1b=model('e1-600',2000,1200,180000,600);
const e2=model('e2',2400,1440,768000,div(768000,2400-1440));
const e3=model('e3',2000,1300,455000,div(455000+245000,2000-1300));assert.equal(e3.profit,245000);
const e4=model('e4',1600,960,576000,div(2400000,1600)),margin4=e4.sales-bep(e4).sales;
const e5unit=div(648000+216000,1200),e5v=1800-e5unit,e5=model('e5',1800,e5v,648000,1200);assert.equal(e5.profit,216000);
const e6min=Math.ceil((325000+20000)/(1700-1050)),e6=model('e6-minimum',1700,1050,325000,e6min,600),e6prev=model('e6-one-less',1700,1050,325000,e6min-1,600);assert(e6.profit>=20000&&e6prev.profit<20000&&e6.Q<=e6.max);
const workedExampleResults=[
 {variable300:e1a.variable,fixed300:e1a.F,profit300:e1a.profit,variable600:e1b.variable,fixed600:e1b.F,profit600:e1b.profit},
 {unitContribution:e2.unit,contributionPercent:div(e2.unit*100,e2.p),breakEvenUnits:bep(e2).units,breakEvenSales:bep(e2).sales,profit:e2.profit},
 {requiredContribution:e3.contribution,targetUnits:e3.Q,targetSales:e3.sales},
 {breakEvenSales:bep(e4).sales,safetyAmount:margin4,safetyPercent:div(margin4*100,e4.sales),profit:e4.profit},
 {contribution:e5.contribution,unitContribution:e5.unit,unitVariable:e5.v},
 {minimumUnits:e6.Q,profitAtMinimum:e6.profit,profitOneLess:e6prev.profit}
];
// Only now load authored rubric, after deriving all answers above.
const all=JSON.parse(fs.readFileSync(path.join(repo,'content/industrial-course.json'),'utf8')),content={...all,lessons:all.lessons.filter(l=>l.id==='n2-industrial-lesson-10'),questions:all.questions.filter(q=>q.lessonId==='n2-industrial-lesson-10')};
const requirements=JSON.parse(fs.readFileSync(path.join(repo,'content/curriculum.json'),'utf8'));

const cases=[],errors=[];let baselinePositive=0,formatPositive=0,negativeCount=0,components=0;
function check(id,fn){try{fn();cases.push({id,pass:true});}catch(e){const fail={id,pass:false,message:e.message};cases.push(fail);errors.push(fail);}}
const clone=x=>JSON.parse(JSON.stringify(x));
for(const q of content.questions){
 const short=q.id.slice('n2-industrial-10-'.length,-3),response=answers[short];assert(response,q.id);
 check(q.id+'/equation-key-match',()=>assert.deepEqual(Object.fromEntries(q.fields.map(f=>[f.id,f.answer])),response));
 check(q.id+'/positive',()=>{const g=gradeFields(q,response);assert(g.correct);assert.equal(g.earned,g.max);baselinePositive++;components+=g.max;});
 const neg=(label,r,field=null,invalid=false)=>check(q.id+'/'+label,()=>{const g=gradeFields(q,r);assert.equal(g.correct,false);assert(g.earned<g.max);if(field){const c=g.components.find(c=>c.id===field);assert.equal(c.earned,0);if(invalid)assert.equal(c.valid,false);}negativeCount++;});
 const pos=(label,r)=>check(q.id+'/'+label,()=>{const g=gradeFields(q,r);assert(g.correct);assert.equal(g.earned,g.max);formatPositive++;});
 neg('empty',{});neg('null',null);neg('undefined',undefined);
 for(const f of q.fields){
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
 }
}
const conceptual=[
 ['assumption-boundary',{fixedAt800:480000},'fixed-total-scaled-with-volume'],
 ['assumption-boundary',{fixedPerUnit800:600},'old-unit-fixed-cost-held'],
 ['assumption-boundary',{beyondRange:'yes'},'range-unlimited'],
 ['contribution-build',{unitVariable:1000,unitContribution:800},'variable-selling-cost-omitted'],
 ['contribution-build',{totalContribution:144000},'contribution-equals-profit'],
 ['contribution-build',{profit:576000},'fixed-cost-omitted'],
 ['unit-breakeven',{breakEvenUnits:240},'fixed-divided-by-price'],
 ['unit-breakeven',{breakEvenSales:600},'quantity-treated-as-sales'],
 ['unit-breakeven',{profitAtBreakEven:''},'zero-as-blank'],
 ['sales-breakeven',{breakEvenSales:1120000},'variable-ratio-denominator'],
 ['sales-breakeven',{breakEvenSales:16800},'percentage-whole-number-used'],
 ['target-profit',{targetUnits:350},'fixed-cost-omitted-from-target'],
 ['target-profit',{targetUnits:550},'target-subtracted-from-fixed'],
 ['whole-unit-ceiling',{minimumUnits:428,salesAtMinimum:599200},'minimum-rounded-down'],
 ['whole-unit-ceiling',{profitAtMinimum:15000},'target-equals-realized-after-rounding'],
 ['safety-margin',{safetyAmount:200000},'profit-as-safety-margin'],
 ['safety-margin',{safetyPercent:75},'break-even-ratio-as-safety'],
 ['safety-margin',{safetyPercent:250},'profit-denominator'],
 ['safety-margin',{profit:500000},'margin-as-profit'],
 ['capacity-boundary',{feasibility:'reachable'},'candidate-is-feasible'],
 ['capacity-boundary',{maxProfit:320000,profitShortfall:0},'out-of-range-candidate-used-as-capacity'],
 ['inverse-fixed',{fixed:1800000},'profit-added-in-reversal'],
 ['inverse-fixed',{fixed:1440000},'profit-ignored-in-reversal'],
 ['inverse-price',{requiredPrice:1500},'target-profit-omitted'],
 ['inverse-price',{requiredPrice:900},'unit-contribution-as-price'],
 ['worksheet-error',{correctPercent:60,correctBreakEvenSales:600000,lossAtWrongSales:0},'original-wrong-sheet-accepted'],
 ['worksheet-error',{lossAtWrongSales:-120000},'signed-profit-for-positive-loss'],
 ['two-budgets',{afterProfit:230000},'old-unit-contribution-reused'],
 ['two-budgets',{afterProfit:150000},'old-fixed-cost-reused'],
 ['two-budgets',{afterBreakEvenUnits:600},'old-break-even-reused'],
 ['insufficient-split',{uniqueActual:'yesA'},'hypothesis-A-invented-as-fact'],
 ['insufficient-split',{uniqueActual:'yesB'},'hypothesis-B-invented-as-fact']
];
for(const [short,patch,label] of conceptual){const q=content.questions.find(q=>q.id==='n2-industrial-10-'+short+'-01');check(q.id+'/'+label,()=>{const g=gradeFields(q,{...answers[short],...patch});assert.equal(g.correct,false);for(const field of Object.keys(patch))assert.equal(g.components.find(c=>c.id===field).earned,0);negativeCount++;});}
check('all-answer-numbers-exact-integers',()=>{for(const a of [...Object.values(answers),...workedExampleResults])for(const n of Object.values(a))if(typeof n==='number')assert(Number.isSafeInteger(n));});
// Compare every example's derived output to its author's stated answer and field specs.
for(let i=0;i<6;i++)check('example-'+(i+1)+'/derived-result-in-answer',()=>{
 const example=content.lessons[0].workedExamples[i],result=workedExampleResults[i];
 for(const n of Object.values(result))assert(example.answer.includes(n.toLocaleString('en-US')),`${n} missing from example ${i+1} answer`);
});
const schema=validate(content,requirements,{target:'nissho:2'}),publication=validate(content,requirements,{target:'nissho:2',publish:true});
check('schema-valid',()=>assert.equal(schema.valid,true));
check('publication-reviewed',()=>assert.equal(publication.valid,true,publication.errors.join('\n')));
check('review-attached-by-independent-parent',()=>{assert.equal(all.authoringStatus,'reviewed');assert.equal(all.sourceVerificationPending,false);assert.equal(all.reviewRecords.length,10);});
check('counts',()=>{assert.equal(content.lessons[0].sections.length,10);assert.equal(content.lessons[0].workedExamples.length,6);assert.equal(content.questions.length,13);assert.equal(components,55);assert.equal(new Set(content.questions.map(q=>q.familyId)).size,13);});
check('single-grade2-calculation-row-only',()=>{assert.deepEqual(content.lessons[0].requirementIds,['nissho-c9eaf983a9d4']);for(const q of content.questions)assert.deepEqual(q.requirementIds,['nissho-c9eaf983a9d4']);const r=requirements.find(r=>r.id==='nissho-c9eaf983a9d4');assert.equal(r.unit,2);assert.equal(r.page,2);assert.equal(r.title,'損益分岐分析の計算方法');});
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const summary={status:errors.length?'FAIL':'PASS',reviewRole:'author-only-not-independent',questions:13,components,baselinePositive,formatPositive,negativeCases:negativeCount,conceptualNegativeCases:conceptual.length,workedExamplesEquationChecked:6,assertionCases:cases.length,failures:errors.length,journalCases:'not applicable: chapter teaches CVP calculation, no journal rubric'};
const inputHashes={combinedSha256:sha(path.join(repo,'content/industrial-course.json')),engineSha256:sha(path.join(repo,'dist/assessment-engine.js')),validatorSha256:sha(path.join(repo,'scripts/validate-learning-content.cjs')),scriptSha256:sha(__filename)};
console.log(JSON.stringify({summary,inputHashes,schema,draftPublication:publication,errors},null,2));process.exitCode=errors.length?1:0;
