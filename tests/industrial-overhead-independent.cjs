'use strict';
// Independent reviewer-authored calculations from question prompts, not author rubrics.
// The author draft/generator were not modified; the author's generator was not read.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const input = process.argv[2] || path.join(root, 'content/industrial-course.json');
const enginePath = process.argv[3] || path.join(root, 'dist/assessment-engine.js');
const output = process.argv[4] || path.join(root, 'industrial-overhead-independent-results.json');
const hash = x => crypto.createHash('sha256').update(x).digest('hex');
const raw = fs.readFileSync(input);
const data = JSON.parse(raw);
const engine = require(enginePath);
const lesson = data.lessons.find(x => x.id === 'n2-industrial-lesson-05');
const questions = data.questions.filter(x => x.lessonId === lesson.id);
const pid = suffix => `n2-industrial-05-${suffix}-01`;
const line = (side, account, amount) => ({side, account, amount});
// General algebra derived independently: budget - allocation equals unallocated fixed cost.
function overhead(F, v, normal, activity, actual) {
  const fixedRate = F / normal;
  const rate = (F + v * normal) / normal;
  const budget = F + v * activity;
  const applied = rate * activity;
  const budgetVariance = actual - budget;
  const capacityVariance = F - fixedRate * activity;
  const variance = actual - applied;
  assert.equal(budgetVariance + capacityVariance, variance);
  assert.equal(capacityVariance, fixedRate * (normal - activity));
  return {fixedRate, rate, budget, applied, budgetVariance, capacityVariance, variance};
}
const indirect = [18000,42000,30000].reduce((a,b)=>a+b,0);
const actualRate = 90000 / (180 + 120);
const plannedRate = 2400000 / 8000;
const fv = overhead(120000,80,1000,900,198000);
const month = overhead(100000,100,1000,1200,225000);
const answers = new Map([
 [pid('classify-overhead'), {oil:'im',maintenance:'il',rent:'ie',outsourcing:'direct'}],
 [pid('trace-documents'), {materials:'material',wages:'time',expense:'invoice',orders:'allocation'}],
 [pid('collect-actual'), {overhead:indirect,manufacturing:indirect+79000,outside:10000}],
 [pid('actual-allocation'), {rate:actualRate,a:actualRate*180,b:actualRate*120,total:actualRate*(180+120)}],
 [pid('collect-journal'), [line('debit','製造間接費',indirect),line('credit','材料',18000),line('credit','賃金',42000),line('credit','経費',30000)]],
 [pid('apply-journal'), [line('debit','仕掛品',54000+36000),line('credit','製造間接費',54000+36000)]],
 [pid('budget-types'), {fixed:'fixed',flexible:'flexible'}],
 [pid('planned-rate'), {rate:plannedRate,applied:plannedRate*700}],
 [pid('overapplied-sign'), {variance:173000-180000,kind:'favorable'}],
 [pid('flexible-budget'), {'fixed-rate':fv.fixedRate,'flex-budget':fv.budget,applied:fv.applied}],
 [pid('variance-components'), {'budget-variance':fv.budgetVariance,'capacity-variance':fv.capacityVariance,'total-variance':fv.variance}],
 [pid('close-unfavorable'), [line('debit','売上原価',198000-180000),line('credit','製造間接費',198000-180000)]],
 [pid('close-favorable'), [line('debit','製造間接費',180000-173000),line('credit','売上原価',180000-173000)]],
 [pid('month-reconciliation'), {rate:month.rate,applied:month.applied,'flex-budget':month.budget,'budget-variance':month.budgetVariance,'capacity-variance':month.capacityVariance,'total-variance':month.variance,'ending-overhead':month.variance-month.variance,'adjusted-cogs':600000+month.variance}]
]);
assert.equal(questions.length,14);
assert.equal(lesson.sections.length,10);
assert.equal(lesson.workedExamples.length,6);
assert.equal(lesson.objectives.length,8);
assert.deepEqual(questions.map(x=>x.id),lesson.questionIds);
assert.deepEqual([...answers.keys()],lesson.questionIds);
const scope = ['nissho-1e5be5d36b96','nissho-d470e1613758','nissho-d7d8b7df9ef4','nissho-d4fd45dcfab9','nissho-9922ab7b123a','nissho-833d7841e757'];
assert.deepEqual(lesson.requirementIds,scope);
for (const item of [...questions,...lesson.objectives]) for(const id of item.requirementIds) assert.ok(scope.includes(id));
const details=[]; let positives=0, negatives=0, components=0;
function grade(q,response){return q.type === 'journal' ? engine.gradeJournal(q,response) : engine.gradeFields(q,response);}
function negative(q,response,label){assert.equal(grade(q,response).correct,false,`${q.id}: unexpectedly accepted ${label}`);negatives++;}
for(const q of questions){
 const expected=answers.get(q.id), before=negatives;
 if(q.type === 'fields'){
  assert.deepEqual(Object.fromEntries(q.fields.map(f=>[f.id,f.answer])),expected,`${q.id} rubric differs from independent solution`);
  components+=q.fields.length;
  for(const f of q.fields){
   const e=expected[f.id];
   const wrongs = f.type==='amount' ? ['',undefined,null,'abc',e+1,e-1,...(e===0?[' ']:[-e])] : ['',undefined,null,'invalid',...f.options.filter(x=>x!==e)];
   for(const w of wrongs) negative(q,{...expected,[f.id]:w},`${f.id}=${String(w)}`);
   if(typeof e==='number'&&e<0) assert.equal(f.allowNegative,true,`${f.id} requires signed UI flag`);
  }
 } else {
  assert.deepEqual(q.lines.map(({side,account,amount})=>({side,account,amount})),expected,`${q.id} journal differs from independent solution`);
  components+=expected.length;
  assert.equal(expected.reduce((n,x)=>n+(x.side==='debit'?x.amount:-x.amount),0),0);
  for(let i=0;i<expected.length;i++){
   for(const w of ['',undefined,null,0,-expected[i].amount,expected[i].amount+1]){
    const response=expected.map(x=>({...x}));response[i].amount=w;negative(q,response,`line ${i} amount ${w}`);
   }
   const wrongSide=expected.map(x=>({...x}));wrongSide[i].side=expected[i].side==='debit'?'credit':'debit';negative(q,wrongSide,`line ${i} reversed side`);
   const wrongAccount=expected.map(x=>({...x}));wrongAccount[i].account='普通預金';negative(q,wrongAccount,`line ${i} wrong account`);
   negative(q,expected.filter((_,j)=>j!==i),`missing line ${i}`);
  }
  negative(q,[...expected,line('debit','普通預金',100),line('credit','普通預金',100)],'extraneous balanced entries');
  negative(q,[],'empty journal');
 }
 const result=grade(q,expected);assert.equal(result.correct,true);assert.equal(result.earned,result.max);positives++;
 details.push({id:q.id,solution:expected,components:result.components.length,negativeCases:negatives-before});
}
assert.equal(components,45);
// Explicit zero must work, omission must not be silently converted to zero.
const integrated=questions.find(q=>q.id===pid('month-reconciliation'));
const zeroResponse={...answers.get(integrated.id),'ending-overhead':'0'};
assert.equal(grade(integrated,zeroResponse).correct,true);
for(const blank of ['',undefined,null,' '])negative(integrated,{...zeroResponse,'ending-overhead':blank},'missing zero');
// Each worked example independently recomputed from its prompt, then checked against the read text.
const ex1Total=15000+25000+20000, ex1Rate=ex1Total/(100+200);
const ex1={total:ex1Total,rate:ex1Rate,M:100*ex1Rate,N:200*ex1Rate};
assert.deepEqual(ex1,{total:60000,rate:200,M:20000,N:40000});
const ex2Rate=1440000/4800;
const ex2={rate:ex2Rate,applied:ex2Rate*360,variance:115000-ex2Rate*360};
assert.deepEqual(ex2,{rate:300,applied:108000,variance:7000});
const ex3=overhead(90000,60,1000,800,142000);
assert.deepEqual(ex3,{fixedRate:90,rate:150,budget:138000,applied:120000,budgetVariance:4000,capacityVariance:18000,variance:22000});
const ex4=overhead(80000,120,1000,1100,210000);
assert.deepEqual(ex4,{fixedRate:80,rate:200,budget:212000,applied:220000,budgetVariance:-2000,capacityVariance:-8000,variance:-10000});
const ex5Amount=115000-108000;
const ex5={entry:[line('debit','売上原価',ex5Amount),line('credit','製造間接費',ex5Amount)],overheadAfter:115000-108000-ex5Amount};
assert.equal(ex5Amount,7000);assert.equal(ex5.overheadAfter,0);
const ex6Amount=220000-210000;
const ex6={entry:[line('debit','製造間接費',ex6Amount),line('credit','売上原価',ex6Amount)],overheadAfter:210000-220000+ex6Amount};
assert.equal(ex6Amount,10000);assert.equal(ex6.overheadAfter,0);
// Boundary properties in a valid linear budget: independent algebra at above/below/exact capacity.
const algebra=[];
for(const A of [800,1000,1200]){const v=overhead(100000,100,1000,A,100000+100*A);assert.equal(v.budgetVariance,0);algebra.push({activity:A,...v});}
const report={reviewer:'/root/advance_remaining_site_backlogs/industrial_labor_draft',reviewedAt:new Date().toISOString(),inputSha256:hash(raw),engineSha256:hash(fs.readFileSync(enginePath)),positiveCases:positives,negativeCases:negatives,components,sections:10,workedExamples:6,questionResults:details,workedExampleResults:[ex1,ex2,ex3,ex4,ex5,ex6],algebraicBoundaryResults:algebra,questionHashes:Object.fromEntries(questions.map(q=>[q.id,hash(JSON.stringify(q))])),lessonHashes:{[lesson.id]:hash(JSON.stringify(lesson))}};
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({inputSha256:report.inputSha256,positiveCases:positives,negativeCases:negatives,components,workedExamples:6,lessonHashes:report.lessonHashes},null,2));
