'use strict';
// Independent reviewer derivations from all ten actual question prompts, not author tables.
const A=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const content=JSON.parse(fs.readFileSync(process.argv[2]||'content/industrial-course.json'));
const {gradeFields,gradeJournal}=require('../dist/assessment-engine.js');
const qs=content.questions.filter(x=>x.lessonId==='n2-industrial-lesson-04');
const expected={
'separate-elements-01':{wood:'materials',wages:'labor',insurance:'expenses',sales:'outside'},
'records-and-basis-01':{travel:'payment',electricity:'measured',insurance:'monthly',shortage:'incurred'},
'adjust-unpaid-prepaid-01':{expense:147000-18000+21000+12000-24000,difference:(147000-18000+21000+12000-24000)-147000},
'meter-actual-use-01':{quantity:14090-12840,'usage-charge':(14090-12840)*22,expense:(14090-12840)*22+4000},
'monthly-prepaid-insurance-01':{monthly:96000/6,used:(96000/6)*2,prepaid:96000-(96000/6)*2},
'normal-incurred-shortage-01':{quantity:160-154,expense:(160-154)*270,'new-payment':0},
'direct-indirect-expenses-01':{direct:18*1200,indirect:28000,total:18*1200+28000},
'monthly-reconciliation-01':{direct:30000,indirect:18000+144000/12+6*400,expenses:30000+18000+144000/12+6*400,payments:144000+9000,'ending-unpaid':30000+18000,'ending-prepaid':144000-144000/12}
};
const line=(side,account,amount)=>({side,account,amount});
const journal={
 'transfer-actual-expenses-01':[line('debit','仕掛品',29000),line('debit','製造間接費',46000),line('credit','経費',29000+46000)],
 'accrue-common-service-01':[line('debit','製造間接費',11000),line('credit','未払費用',11000)]
};
let positive=0,negative=0,components=0;
A.equal(qs.length,10);
for(const q of qs){const key=q.id.replace('n2-industrial-04-','');
 if(q.type==='fields'){
  const answer=expected[key];A.ok(answer);A.deepEqual(Object.keys(answer).sort(),q.fields.map(f=>f.id).sort());
  for(const f of q.fields){A.equal(f.answer,answer[f.id],q.id+' '+f.id);components++;}
  A.equal(gradeFields(q,answer).correct,true);positive++;
  for(const f of q.fields)for(const v of ['', ' ', undefined, f.type==='choice'?'unknown':answer[f.id]+1]){A.equal(gradeFields(q,{...answer,[f.id]:v}).correct,false);negative++;}
 }else{
  const answer=journal[key];A.ok(answer);A.deepEqual(q.lines.map(({side,account,amount})=>({side,account,amount})),answer);A.equal(gradeJournal(q,answer).correct,true);positive++;
  for(let i=0;i<answer.length;i++){components++;for(const field of ['side','account','amount']){const bad=structuredClone(answer);bad[i][field]=field==='side'?(answer[i].side==='debit'?'credit':'debit'):field==='account'?'材料':answer[i].amount+1;A.equal(gradeJournal(q,bad).correct,false);negative++;}}
  A.equal(gradeJournal(q,answer.slice(1)).correct,false);negative++;
 }
}
A.equal(components,33);
// Independent balance identities and four worked-example calculations.
A.equal(147000+12000+21000,138000+18000+24000);
A.equal(12500+7800,20300);
A.equal(88000-9000+14000+6000-10000,89000);A.equal(88000+6000+14000,89000+9000+10000);
A.equal((5500-4600)*18+2800,19000);A.equal(72000/6,12000);A.equal(72000-12000,60000);A.equal(19000+12000,31000);
A.equal((50-48)*500,1000);A.equal(1000+18000,19000);A.equal(20000+19000,39000);
A.equal((144000+9000)-9000-(144000-144000/12)+(30000+18000)+6*400,expected['monthly-reconciliation-01'].expenses);
const qneg=qs.find(q=>q.id.endsWith('adjust-unpaid-prepaid-01'));A.equal(gradeFields(qneg,{expense:'138,000',difference:'-9,000'}).correct,true);A.equal(gradeFields(qneg,{expense:138000,difference:9000}).correct,false);negative++;
const zero=qs.find(q=>q.id.endsWith('normal-incurred-shortage-01'));A.equal(gradeFields(zero,{quantity:6,expense:1620,'new-payment':'0'}).correct,true);A.equal(gradeFields(zero,{quantity:6,expense:1620,'new-payment':''}).correct,false);negative++;
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const lesson=content.lessons.find(l=>l.id==='n2-industrial-lesson-04');
const report={status:'PASS',positive,negative,components,workedExamples:4,questionHashes:Object.fromEntries(qs.map(q=>[q.id,digest(q)])),lessonHashes:{[lesson.id]:digest(lesson)}};
fs.writeFileSync('industrial-expenses-independent-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
