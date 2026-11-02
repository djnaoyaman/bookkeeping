'use strict';
// Author calculations and grader testing only. NOT an independent review.
const fs=require('node:fs'),path=require('node:path'),A=require('node:assert/strict'),crypto=require('node:crypto');
const raw=fs.readFileSync(path.join(__dirname,'../content/industrial-course.json')),all=JSON.parse(raw),d={...all,lessons:all.lessons.filter(x=>x.id==='n2-industrial-lesson-07'),questions:all.questions.filter(x=>x.lessonId==='n2-industrial-lesson-07')},base=path.join(__dirname,'..');
const engine=require(path.join(base,'dist/assessment-engine.js')),curriculum=require(path.join(base,'content/curriculum.json')),{validate}=require(path.join(base,'scripts/validate-learning-content.cjs'));
const solutions=require('./fixtures/industrial-job-order-author-solutions.json');
A.equal(all.authoringStatus,'reviewed');A.equal(all.sourceVerificationPending,false);A.equal(all.reviewRecords.length,10);A.equal(d.lessons.length,1);A.equal(d.lessons[0].sections.length,10);A.equal(d.lessons[0].workedExamples.length,6);A.equal(d.questions.length,14);
let positive=0,negative=0,components=0;const details=[];
const grade=(q,a)=>(q.type==='journal'?engine.gradeJournal:engine.gradeFields)(q,a);
const reject=(q,a,label)=>{A.equal(grade(q,a).correct,false,q.id+' accepted '+label);negative++;};
for(const q of d.questions){
 const slug=q.id.replace('n2-industrial-07-','').replace(/-01$/,''),expected=solutions[slug];A.ok(expected,slug);const before=negative;
 for(const t of q.exhibits){A.ok(t.headers.length>=2);for(const r of t.rows)A.equal(r.length,t.headers.length);}
 for(const req of q.requirementIds)A.ok(curriculum.some(x=>x.id===req&&x.unit===2));
 if(q.type==='journal'){
  A.deepEqual(q.lines.map(({side,account,amount})=>({side,account,amount})),expected);A.equal(expected.reduce((n,x)=>n+(x.side==='debit'?x.amount:-x.amount),0),0);components+=expected.length;
  for(let i=0;i<expected.length;i++){
   for(const amount of ['',undefined,null,0,-expected[i].amount,expected[i].amount+1,'1e3']){const bad=structuredClone(expected);bad[i].amount=amount;reject(q,bad,'bad amount');}
   for(const [key,val]of [['side',expected[i].side==='debit'?'credit':'debit'],['account',q.accounts.find(a=>!expected.some(e=>e.account===a))]]){const bad=structuredClone(expected);bad[i][key]=val;reject(q,bad,'wrong '+key);}
   reject(q,expected.filter((_,j)=>j!==i),'missing line');
  }
  reject(q,[...expected,{side:'debit',account:'仕掛品',amount:1},{side:'credit',account:'仕掛品',amount:1}],'extra balanced lines');reject(q,[],'blank journal');
 }else{
  A.deepEqual(Object.fromEntries(q.fields.map(f=>[f.id,f.answer])),expected);components+=q.fields.length;
  for(const f of q.fields){const v=expected[f.id];const bad=f.type==='choice'?['',undefined,null,'invalid',...f.options.filter(o=>o!==v)]:['',undefined,null,' ','abc','1,00','1e3',v+1,v-1,...(v===0?[]:[-v])];for(const value of bad)reject(q,{...expected,[f.id]:value},f.id+'='+String(value));const absent={...expected};delete absent[f.id];reject(q,absent,'omitted '+f.id);}
 }
 const g=grade(q,expected);A.equal(g.correct,true);A.equal(g.earned,g.max);positive++;details.push({id:q.id,answer:expected,negative:negative-before});
}
function wrong(slug,field,value){const q=d.questions.find(q=>q.id==='n2-industrial-07-'+slug+'-01');reject(q,{...solutions[slug],[field]:value},'specific misconception');}
wrong('job-status','endingFG',116000);wrong('job-status','COGS',116000);wrong('job-status','completed',172000);wrong('missing-current','currentCost',236000);wrong('repair-specific-job','unitCost',104400/61);wrong('repair-not-double','completedCost',102000);wrong('multi-month-order','completedCost',48000);wrong('manufacturing-flow','completed',90000);wrong('manufacturing-flow','COGS',114000);
const ex1={oh:250*64,cost:48000+32000+4000+250*64,unit:(48000+32000+4000+250*64)/80};A.deepEqual(ex1,{oh:16000,cost:100000,unit:1250});
const ex2={d:20000+40000,e:50000,f:10000+30000};A.deepEqual(ex2,{d:60000,e:50000,f:40000});A.equal(ex2.d+ex2.f,100000);A.equal(ex2.d+ex2.e+ex2.f,20000+10000+40000+50000+30000);
const ex3={cogs:25000+100000-35000,profit:150000-(25000+100000-35000)};A.deepEqual(ex3,{cogs:90000,profit:60000});
const ex4={wipCredit:75000,fgDebit:75000,fgCredit:75000,cogsDebit:75000};A.equal(ex4.fgDebit-ex4.fgCredit,0);A.equal(ex4.wipCredit,ex4.cogsDebit);
const ex5={repairOH:250*20,repair:3000+4000+250*20,total:82000+3000+4000+250*20,unit:(82000+3000+4000+250*20)/50};A.deepEqual(ex5,{repairOH:5000,repair:12000,total:94000,unit:1880});
const ex6={current:44000+34000+4000+22000,completed:26000+44000+34000+4000+22000-30000,cogs:20000+26000+44000+34000+4000+22000-30000-26000};ex6.profit=160000-ex6.cogs;A.deepEqual(ex6,{current:104000,completed:100000,cogs:94000,profit:66000});
A.equal(components,51);const schema=validate(all,curriculum,{target:'nissho:2'}),gate=validate(all,curriculum,{target:'nissho:2',publish:true});A.equal(schema.valid,true,JSON.stringify(schema.errors));A.equal(gate.valid,true);
const result={status:'PASS',kind:'author-self-check-not-independent-review',sha256:crypto.createHash('sha256').update(raw).digest('hex'),utc:new Date().toISOString(),lessons:1,sections:10,workedExamples:6,questions:14,components,positive,negative,schemaValid:schema.valid,publishGateValid:gate.valid,reviewRecordsCreated:0,details,workedExampleResults:[ex1,ex2,ex3,ex4,ex5,ex6]};fs.writeFileSync(path.join(__dirname,'../industrial-job-order-author-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,details:undefined,workedExampleResults:undefined},null,2));
