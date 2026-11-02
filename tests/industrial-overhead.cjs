'use strict';
// AUTHOR tests only. The separate independent reviewer must verify the content and hashes.
const A=require('node:assert/strict'),fs=require('node:fs');
const {gradeFields,gradeJournal}=require('../dist/assessment-engine.js');
const {validate}=require('../scripts/validate-learning-content.cjs');
const c=JSON.parse(fs.readFileSync('content/industrial-course.json')),requirements=JSON.parse(fs.readFileSync('content/curriculum.json'));
const q=c.questions.filter(x=>x.lessonId==='n2-industrial-lesson-05'),l=c.lessons.find(x=>x.id==='n2-industrial-lesson-05');
A.equal(c.lessons.length,10);A.equal(c.questions.length,122);A.equal(q.length,14);A.equal(l.sections.length,10);A.equal(l.workedExamples.length,6);A.equal(l.objectives.length,8);
A.equal(validate(c,requirements,{target:'nissho:2',publish:false}).valid,true);
const fields={
 'classify-overhead-01':{oil:'im',maintenance:'il',rent:'ie',outsourcing:'direct'},
 'trace-documents-01':{materials:'material',wages:'time',expense:'invoice',orders:'allocation'},
 'collect-actual-01':{overhead:18000+42000+30000,manufacturing:18000+42000+30000+79000,outside:10000},
 'actual-allocation-01':{rate:90000/(180+120),a:90000/(180+120)*180,b:90000/(180+120)*120,total:90000},
 'budget-types-01':{fixed:'fixed',flexible:'flexible'},
 'planned-rate-01':{rate:2400000/8000,applied:2400000/8000*700},
 'overapplied-sign-01':{variance:173000-180000,kind:'favorable'},
 'flexible-budget-01':{'fixed-rate':120000/1000,'flex-budget':120000+80*900,applied:(120000/1000+80)*900},
 'variance-components-01':{'budget-variance':198000-(120000+80*900),'capacity-variance':120000/1000*(1000-900),'total-variance':198000-(80+120000/1000)*900},
 'month-reconciliation-01':{rate:100+100000/1000,applied:(100+100000/1000)*1200,'flex-budget':100000+100*1200,'budget-variance':225000-(100000+100*1200),'capacity-variance':100000/1000*(1000-1200),'total-variance':225000-(100+100000/1000)*1200,'ending-overhead':0,'adjusted-cogs':600000+225000-(100+100000/1000)*1200}
};
const line=(side,account,amount)=>({side,account,amount});
const journals={
 'collect-journal-01':[line('debit','製造間接費',18000+42000+30000),line('credit','材料',18000),line('credit','賃金',42000),line('credit','経費',30000)],
 'apply-journal-01':[line('debit','仕掛品',54000+36000),line('credit','製造間接費',54000+36000)],
 'close-unfavorable-01':[line('debit','売上原価',198000-180000),line('credit','製造間接費',198000-180000)],
 'close-favorable-01':[line('debit','製造間接費',180000-173000),line('credit','売上原価',180000-173000)]
};
let positive=0,negative=0,components=0;
for(const item of q){
 const key=item.id.replace('n2-industrial-05-',''),answer=item.type==='fields'?fields[key]:journals[key],grade=item.type==='fields'?gradeFields:gradeJournal;
 A.ok(answer,key);const reject=a=>{A.equal(grade(item,a).correct,false,key);negative++;};
 A.equal(grade(item,answer).correct,true);positive++;
 if(item.type==='fields'){
  A.deepEqual(Object.keys(answer).sort(),item.fields.map(f=>f.id).sort());reject({});
  for(const f of item.fields){A.equal(f.answer,answer[f.id]);components++;
   if(f.type==='amount' && (f.answer<0 || f.id.includes('variance')))A.equal(f.allowNegative,true,'signed concept requests a minus-capable input');
   const wrong=f.type==='choice'?[...f.options.filter(x=>x!==answer[f.id]),'',undefined,'not-an-option']:[answer[f.id]+1,answer[f.id]-1,'',undefined,'abc','1,00','1e3',' '];
   for(const value of wrong)reject({...answer,[f.id]:value});
   const missing={...answer};delete missing[f.id];reject(missing);
  }
 }else{
  A.deepEqual(item.lines.map(({side,account,amount})=>({side,account,amount})),answer);reject([]);
  A.equal(answer.filter(x=>x.side==='debit').reduce((s,x)=>s+x.amount,0),answer.filter(x=>x.side==='credit').reduce((s,x)=>s+x.amount,0));
  for(let i=0;i<answer.length;i++){components++;
   for(const [prop,value] of [['amount',answer[i].amount+1],['amount',''],['amount',undefined],['amount','1e3'],['amount',-answer[i].amount],['account',''],['account','存在しない科目'],['side',answer[i].side==='debit'?'credit':'debit'],['side',undefined]]){const bad=structuredClone(answer);bad[i][prop]=value;reject(bad);}
   const missing=structuredClone(answer);missing.splice(i,1);reject(missing);
  }
  reject([...structuredClone(answer),line('debit','普通預金',1),line('credit','売上原価',1)]);
 }
}
A.equal(positive,14);A.equal(components,45);A.equal(c.questions.reduce((s,x)=>s+(x.fields||x.lines).length,0),477);
// Six original worked examples, including both signs and both closing directions.
const actual=15000+25000+20000,actualRate=actual/(100+200);A.equal(actualRate,200);A.equal(actualRate*100,20000);A.equal(actualRate*200,40000);A.equal(actualRate*300,actual);
const plannedRate=1440000/4800,applied=plannedRate*360;A.equal(plannedRate,300);A.equal(applied,108000);A.equal(115000-applied,7000);
function reconcile(F,N,v,H,actual){const rate=v+F/N,applied=rate*H,budget=F+v*H,budgetVariance=actual-budget,capacityVariance=F/N*(N-H);A.equal(budgetVariance+capacityVariance,actual-applied);return {rate,applied,budget,budgetVariance,capacityVariance,total:actual-applied};}
A.deepEqual(reconcile(90000,1000,60,800,142000),{rate:150,applied:120000,budget:138000,budgetVariance:4000,capacityVariance:18000,total:22000});
A.deepEqual(reconcile(80000,1000,120,1100,210000),{rate:200,applied:220000,budget:212000,budgetVariance:-2000,capacityVariance:-8000,total:-10000});
A.equal(115000-108000-7000,0);A.equal(210000+10000-220000,0);
// Both signs, neutral capacity and a deliberate mixed-sign total follow from actual-hour allocation.
for(const H of [800,1000,1200])for(const delta of [-5000,0,5000]){const x=reconcile(100000,1000,100,H,100000+100*H+delta);A.equal(x.budgetVariance,delta);A.equal(Math.sign(x.capacityVariance),Math.sign(1000-H));}
const month=q.find(x=>x.id.endsWith('month-reconciliation-01')),monthly=fields['month-reconciliation-01'];A.equal(monthly['budget-variance'],5000);A.equal(monthly['capacity-variance'],-20000);A.equal(monthly['total-variance'],-15000);A.equal(monthly['adjusted-cogs'],585000);
A.equal(gradeFields(month,{...monthly,'capacity-variance':'-20,000','ending-overhead':'0'}).correct,true);A.equal(gradeFields(month,{...monthly,'ending-overhead':''}).valid,false);A.equal(gradeFields(month,{...monthly,'capacity-variance':20000}).correct,false);
const ids=['nissho-1e5be5d36b96','nissho-d470e1613758','nissho-d7d8b7df9ef4','nissho-d4fd45dcfab9','nissho-9922ab7b123a','nissho-833d7841e757'];A.deepEqual(l.requirementIds,ids);
for(const id of ids){const row=requirements.find(x=>x.id===id);A.equal(row.exam,'nissho');A.equal(row.unit,2);A.equal(row.area,'工業簿記・原価計算 / 第八製造間接費計算');}
console.log(JSON.stringify({status:'PASS',kind:'author-tests-not-independent-review',positive,negative,components,workedExamples:6,actualHoursNotStandard:true,signedVarianceAndZero:true,twoVarianceIdentity:true,limitedScopeRows:6}));
