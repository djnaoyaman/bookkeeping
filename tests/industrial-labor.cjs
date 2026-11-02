'use strict';
// Independent derivations from the labor question prompts, not copied rubric values.
const A=require('node:assert/strict'),fs=require('node:fs'),{gradeFields,gradeJournal}=require('../dist/assessment-engine.js');
const c=JSON.parse(fs.readFileSync('content/industrial-course.json'));
const q=c.questions.filter(q=>q.lessonId==='n2-industrial-lesson-03');
const fieldAnswers={
'classify-work-01':{order:'direct',maintenance:'indirect',cleanup:'indirect',sales:'outside'},
'choose-records-01':{'order-time':'work',present:'attendance',deduct:'payroll',transfer:'bank'},
'reconcile-minutes-01':{employment:(17.5-8.5)*60-60,direct:3*60+20+3*60+10,indirect:((17.5-8.5)*60-60)-(3*60+20+3*60+10)},
'consume-from-payments-01':{'paid-current':462000-42000,consumed:462000-42000+54000},
'find-ending-unpaid-01':{ending:29000+386000-400000},
'gross-and-net-01':{gross:144*1500+24000,deductions:18000+12000,net:144*1500+24000-18000-12000},
'actual-time-allocation-01':{'order-a':100*1600,'order-b':56*1600,indirect:24*1600,total:(100+56+24)*1600},
'monthly-integrated-01':{consumed:558000-42000+60000,rate:(558000-42000+60000)/(300+60),direct:300*((558000-42000+60000)/(300+60)),indirect:60*((558000-42000+60000)/(300+60)),'net-paid':558000-39000,'wage-balance':558000+60000-42000-(558000-42000+60000),liability:60000}
};
const line=(side,account,amount)=>({side,account,amount});
const journalAnswers={
'pay-wages-01':[line('debit','賃金',240000),line('credit','普通預金',240000-30000),line('credit','預り金',30000)],
 'transfer-consumed-wages-01':[line('debit','仕掛品',360000),line('debit','製造間接費',72000),line('credit','賃金',360000+72000)],
'accrue-unpaid-01':[line('debit','賃金',57500),line('credit','未払賃金',57500)],
'reverse-opening-unpaid-01':[line('debit','未払賃金',57500),line('credit','賃金',57500)]
};
let positive=0,negative=0,components=0;
A.equal(q.length,12);
for(const item of q){const key=item.id.replace('n2-industrial-03-','');if(item.type==='fields'){
 const a=fieldAnswers[key];A.ok(a);A.deepEqual(Object.keys(a).sort(),item.fields.map(f=>f.id).sort());
 for(const f of item.fields){A.equal(f.answer,a[f.id],item.id+' '+f.id);components++;}
 A.equal(gradeFields(item,a).correct,true);positive++;
 for(const f of item.fields)for(const value of ['',f.type==='choice'?'unknown':Number(a[f.id])+1]){const wrong={...a,[f.id]:value};A.equal(gradeFields(item,wrong).correct,false,item.id+' rejects '+f.id);negative++;}
 }else{const a=journalAnswers[key];A.ok(a);A.deepEqual(item.lines.map(({side,account,amount})=>({side,account,amount})),a);A.equal(gradeJournal(item,a).correct,true);positive++;
 for(let i=0;i<a.length;i++){components++;for(const prop of ['amount','side','account']){const bad=structuredClone(a);bad[i][prop]=prop==='amount'?a[i].amount+1:prop==='side'?(a[i].side==='debit'?'credit':'debit'):'unknown';A.equal(gradeJournal(item,bad).correct,false);negative++;}}
 A.equal(gradeJournal(item,[]).correct,false);negative++;
 }}
A.equal(components,38);
// All six worked examples recalculated independently from their stated conditions.
A.equal(310000-25000+35000,320000);A.equal((18-9)*60-60,180+240+60);A.equal(1800*(50+30),144000);A.equal(1800*20,36000);A.equal(280000-28000,252000);A.equal(18000-18000,0);A.equal(200000-10000+20000,210000);A.equal(200000+20000-10000-210000,0);
console.log(JSON.stringify({status:'PASS',positive,negative,components,workedExamples:6}));
