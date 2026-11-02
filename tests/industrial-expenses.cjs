'use strict';
// AUTHOR tests: fresh derivations from the authored prompts, not an independent review/sign-off.
const A=require('node:assert/strict'),fs=require('node:fs'),{gradeFields,gradeJournal}=require('../dist/assessment-engine.js');
const {validate}=require('../scripts/validate-learning-content.cjs');
const c=JSON.parse(fs.readFileSync('content/industrial-course.json')),requirements=JSON.parse(fs.readFileSync('content/curriculum.json'));
const q=c.questions.filter(q=>q.lessonId==='n2-industrial-lesson-04'),l=c.lessons.find(l=>l.id==='n2-industrial-lesson-04');
A.equal(c.lessons.length,10);A.equal(c.questions.length,122);A.equal(q.length,10);A.equal(l.sections.length,8);A.equal(l.workedExamples.length,4);
A.equal(validate(c,requirements,{target:'nissho:2',publish:false}).valid,true);
const fieldAnswers={
 'separate-elements-01':{wood:'materials',wages:'labor',insurance:'expenses',sales:'outside'},
 'records-and-basis-01':{travel:'payment',electricity:'measured',insurance:'monthly',shortage:'incurred'},
 'adjust-unpaid-prepaid-01':{expense:147000+12000-24000-18000+21000,difference:12000-24000-18000+21000},
 'meter-actual-use-01':{quantity:14090-12840,'usage-charge':(14090-12840)*22,expense:(14090-12840)*22+4000},
 'monthly-prepaid-insurance-01':{monthly:96000/6,used:96000/6*2,prepaid:96000/6*4},
 'normal-incurred-shortage-01':{quantity:160-154,expense:(160-154)*270,'new-payment':0},
 'direct-indirect-expenses-01':{direct:18*1200,indirect:28000,total:18*1200+28000},
 'monthly-reconciliation-01':{direct:30000,indirect:18000+144000/12+6*400,expenses:30000+18000+144000/12+6*400,payments:144000+9000,'ending-unpaid':30000+18000,'ending-prepaid':144000-144000/12}
};
const line=(side,account,amount)=>({side,account,amount});
const journalAnswers={
 'transfer-actual-expenses-01':[line('debit','仕掛品',29000),line('debit','製造間接費',46000),line('credit','経費',29000+46000)],
 'accrue-common-service-01':[line('debit','製造間接費',11000),line('credit','未払費用',11000)]
};
let positive=0,negative=0,components=0;
for(const item of q){
 const key=item.id.replace('n2-industrial-04-',''),a=item.type==='fields'?fieldAnswers[key]:journalAnswers[key],grade=item.type==='fields'?gradeFields:gradeJournal;
 A.ok(a,item.id+' needs independently expressed author-test expectations');
 const reject=response=>{A.equal(grade(item,response).correct,false,item.id+' rejects malformed/wrong response');negative++;};
 if(item.type==='fields'){
  A.deepEqual(Object.keys(a).sort(),item.fields.map(f=>f.id).sort());
  for(const f of item.fields){A.equal(f.answer,a[f.id],item.id+' '+f.id);components++;}
  A.equal(grade(item,a).correct,true);positive++;reject({});
  for(const f of item.fields){
   const values=f.type==='choice'?[...f.options.filter(v=>v!==a[f.id]),'',undefined,'invalid-choice']:[a[f.id]+1,a[f.id]-1,'',undefined,'abc','1,00','1e3',' '];
   for(const value of values)reject({...a,[f.id]:value});
   const missing={...a};delete missing[f.id];reject(missing);
  }
 }else{
  A.deepEqual(item.lines.map(({side,account,amount})=>({side,account,amount})),a);
  A.equal(grade(item,a).correct,true);positive++;reject([]);
  for(let i=0;i<a.length;i++){
   components++;
   for(const [prop,value] of [['amount',a[i].amount+1],['amount',''],['amount',undefined],['amount','1e3'],['account',''],['account','存在しない科目'],['side',a[i].side==='debit'?'credit':'debit'],['side',undefined]]){const bad=structuredClone(a);bad[i][prop]=value;reject(bad);}
   const absent=structuredClone(a);absent.splice(i,1);reject(absent);
  }
  reject([...structuredClone(a),line('debit','現金',1),line('credit','未払金',1)]);
 }
}
A.equal(positive,10);A.equal(components,33);A.equal(c.questions.reduce((sum,q)=>sum+(q.fields||q.lines).length,0),477);
// Signed difference and a true zero are not interchangeable with blanks or missing fields.
const signed=q.find(q=>q.id.endsWith('adjust-unpaid-prepaid-01')),signedAnswers=fieldAnswers['adjust-unpaid-prepaid-01'];
A.equal(signedAnswers.difference,-9000);A.equal(gradeFields(signed,{...signedAnswers,difference:'-9,000'}).correct,true);A.equal(gradeFields(signed,{...signedAnswers,difference:'9000'}).correct,false);
const zero=q.find(q=>q.id.endsWith('normal-incurred-shortage-01')),zeroAnswers=fieldAnswers['normal-incurred-shortage-01'];
A.equal(gradeFields(zero,{...zeroAnswers,'new-payment':'0'}).correct,true);A.equal(gradeFields(zero,{...zeroAnswers,'new-payment':''}).valid,false);
// Four worked examples recalculated from the stated inputs; not copied from rubric output.
A.equal(12500+7800,20300); // Already-capitalized material freight 1800 is excluded.
const period=88000-9000+14000+6000-10000;A.equal(period,89000);A.equal(88000+6000+14000,period+9000+10000);
A.equal((5500-4600)*18+2800,19000);A.equal(72000/6,12000);A.equal(72000/6*5,60000);A.equal((5500-4600)*18+2800+72000/6,31000);
A.equal((50-48)*500,1000);A.equal(20000+(50-48)*500+18000,39000);
const integrated=fieldAnswers['monthly-reconciliation-01'];A.equal(integrated.payments-9000-integrated['ending-prepaid']+integrated['ending-unpaid']+6*400,integrated.expenses);
A.deepEqual(l.requirementIds,['nissho-affd2c95d99e','nissho-d010c3fb55a4','nissho-b3030633885c']);
for(const id of l.requirementIds){const row=requirements.find(r=>r.id===id);A.equal(row.exam,'nissho');A.equal(row.unit,2);A.equal(row.area,'工業簿記・原価計算 / 第七経費計算');}
console.log(JSON.stringify({status:'PASS',kind:'author-tests-not-independent-review',positive,negative,components,workedExamples:4,signedNegative9000:true,zeroDistinctFromBlank:true}));
