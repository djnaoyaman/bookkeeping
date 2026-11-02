'use strict';
// Independent reviewer calculations from the complete chapter06 prompts, not author test tables.
const fs=require('fs'),path=require('path'),A=require('node:assert/strict'),crypto=require('crypto');
const input=process.argv[2]||path.join(__dirname,'../content/industrial-course.json');
const engine=process.argv[3]||path.join(__dirname,'../dist/assessment-engine.js');
const output=process.argv[4]||path.join(__dirname,'../industrial-departments-independent-results.json');
const {gradeFields,gradeJournal}=require(engine),raw=fs.readFileSync(input),c=JSON.parse(raw),l=c.lessons.find(x=>x.id==='n2-industrial-lesson-06'),qs=c.questions.filter(x=>x.lessonId===l.id);
const divide=(amount,weights)=>{const total=weights.reduce((s,n)=>s+n,0);A.ok(total>0);const parts=weights.map(n=>amount*n/total);A.equal(parts.reduce((s,n)=>s+n,0),amount);return parts;};
const rent=divide(30000,[300,200,100]),rent2=divide(24000,[300,200,100]),electric=divide(18000,[900,300,600]);
const maintenance=divide(36000,[40,20]),power=divide(24000,[300,100]);
const pFinal=80000+maintenance[0]+power[0],qFinal=50000+maintenance[1]+power[1];
const expected={
 'department-roles-01':{cutting:'production',assembly:'production',maintenance:'support',sales:'outside'},
 'two-classification-axes-01':{machine:'individual',rent:'common','order-material':'direct-product'},
 'allocation-records-01':{rent:'area',maintenance:'hours',power:'meter'},
 'first-allocation-01':{p:72000+rent[0],q:48000+rent[1],s:12000+rent[2],total:72000+48000+12000+30000},
 'two-common-costs-01':{p:60000+rent2[0]+electric[0],q:36000+rent2[1]+electric[1],s:24000+rent2[2]+electric[2],total:60000+36000+24000+24000+18000},
 'direct-denominator-01':{denominator:30+60,p:36000*30/(30+60),q:36000*60/(30+60),t:0,total:36000},
 'two-support-allocation-01':{'s-to-p':maintenance[0],'s-to-q':maintenance[1],'t-to-p':power[0],'t-to-q':power[1],'final-p':pFinal,'final-q':qFinal,total:pFinal+qFinal},
 'double-count-check-01':{error:'duplicate',excess:250000-(122000+68000),'correct-total':122000+68000},
 'department-to-order-01':{'cutting-rate':150000/500,'assembly-rate':120000/800,'cutting-r':150000/500*20,'assembly-r':120000/800*40,'total-r':150000/500*20+120000/800*40},
 'support-actual-planned-01':{'actual-rate':117000/(500+400),'planned-rate':120000/1000,p:120000/1000*500,q:120000/1000*400,difference:117000-(120000/1000)*(500+400)},
 'planned-total-reconciliation-01':{'final-p':84000+150*240,'final-q':66000+150*160,'applied-s':150*(240+160),'difference-s':57000-150*(240+160),'actual-total':84000+66000+57000,'check-difference':(84000+150*240)+(66000+150*160)+(57000-150*(240+160))-(84000+66000+57000)}
};
const journal=[{side:'debit',account:'切削部門費',amount:24000},{side:'debit',account:'組立部門費',amount:12000},{side:'credit',account:'保全部門費',amount:36000}];
let positive=0,negative=0,components=0;const details=[];
const reject=(q,a)=>{A.equal((q.type==='journal'?gradeJournal:gradeFields)(q,a).correct,false,q.id);negative++;};
A.equal(qs.length,12);A.equal(l.sections.length,10);A.equal(l.workedExamples.length,6);A.deepEqual(qs.map(x=>x.id),l.questionIds);
for(const q of qs){const key=q.id.replace('n2-industrial-06-','');
 const answer=q.type==='journal'?journal:expected[key];A.ok(answer,key);
 if(q.type==='journal'){
  A.deepEqual(q.lines.map(({side,account,amount})=>({side,account,amount})),answer);A.equal(answer.reduce((n,x)=>n+(x.side==='debit'?x.amount:-x.amount),0),0);components+=answer.length;
  for(let i=0;i<answer.length;i++){
   for(const amount of ['',undefined,null,0,-answer[i].amount,answer[i].amount+1,'1e3']){const bad=structuredClone(answer);bad[i].amount=amount;reject(q,bad);}
   for(const [field,value]of [['side',answer[i].side==='debit'?'credit':'debit'],['account','仕掛品']]){const bad=structuredClone(answer);bad[i][field]=value;reject(q,bad);}
   reject(q,answer.filter((_,j)=>j!==i));
  }
  reject(q,[...answer,{side:'debit',account:'普通預金',amount:1},{side:'credit',account:'普通預金',amount:1}]);
 }else{
  A.deepEqual(Object.fromEntries(q.fields.map(x=>[x.id,x.answer])),answer,key);components+=q.fields.length;
  for(const f of q.fields){
   const values=f.type==='choice'?['',undefined,'invalid',...f.options.filter(x=>x!==answer[f.id])]:['',undefined,null,'abc','1,00','1e3',answer[f.id]+1,answer[f.id]-1,...(answer[f.id]!==0?[-answer[f.id]]:[' '])];
   for(const value of values)reject(q,{...answer,[f.id]:value});
   const absent={...answer};delete absent[f.id];reject(q,absent);
   if(typeof answer[f.id]==='number'&&answer[f.id]<0)A.equal(f.allowNegative,true);
  }
 }
 const grade=(q.type==='journal'?gradeJournal:gradeFields)(q,answer);A.equal(grade.correct,true);A.equal(grade.earned,grade.max);positive++;details.push({id:q.id,answer});
}
const get=key=>qs.find(q=>q.id==='n2-industrial-06-'+key+'-01');
// Wrong denominators can preserve the grand total, so test individual departmental answers too.
reject(get('first-allocation'),{p:72000+30000*300/500,q:48000+30000*200/500,s:12000,total:162000});
reject(get('direct-denominator'),{denominator:120,p:9000,q:18000,t:0,total:27000});
reject(get('two-support-allocation'),{...expected['two-support-allocation-01'],total:250000});
reject(get('support-actual-planned'),{...expected['support-actual-planned-01'],p:130*500,q:130*400,difference:0});
reject(get('planned-total-reconciliation'),{...expected['planned-total-reconciliation-01'],'difference-s':3000});
const last=get('planned-total-reconciliation');A.equal(gradeFields(last,{...expected['planned-total-reconciliation-01'],'difference-s':'-3,000','check-difference':'0'}).correct,true);
// All six worked examples from their own stated numbers.
const ex1Rent=divide(24000,[300,200,100]),ex1=[60000+ex1Rent[0],40000+ex1Rent[1],20000+ex1Rent[2]];A.deepEqual(ex1,[72000,48000,24000]);A.equal(ex1.reduce((s,n)=>s+n,0),144000);
const ex2S=divide(24000,[30,10]),ex2=[72000+ex2S[0],48000+ex2S[1]];A.deepEqual(ex2,[90000,54000]);A.equal(ex2.reduce((s,n)=>s+n,0),144000);
const ex3S=divide(30000,[40,20]),ex3T=divide(18000,[300,600]),ex3=[80000+ex3S[0]+ex3T[0],40000+ex3S[1]+ex3T[1]];A.deepEqual(ex3,[106000,62000]);A.equal(ex3[0]+ex3[1],80000+40000+30000+18000);
const ex4=[120000/400,90000/600,120000/400*12+90000/600*20];A.deepEqual(ex4,[300,150,6600]);
const ex5={plannedRate:96000/800,actualRate:99000/(450+300),actualP:99000/(450+300)*450,actualQ:99000/(450+300)*300,plannedP:96000/800*450,plannedQ:96000/800*300,difference:99000-96000/800*(450+300)};A.deepEqual(ex5,{plannedRate:120,actualRate:132,actualP:59400,actualQ:39600,plannedP:54000,plannedQ:36000,difference:9000});
const ex6={p:70000+54000,q:50000+36000,difference:83000-54000-36000,total:70000+50000+83000};A.deepEqual(ex6,{p:124000,q:86000,difference:-7000,total:203000});A.equal(ex6.p+ex6.q+ex6.difference,ex6.total);
A.equal(positive,12);A.equal(components,52);A.ok(!l.requirementIds.includes('nissho-f1d8ec93c3ea'),'reciprocal allocation remains unmapped');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');const report={status:'PASS',kind:'independent-review-not-author-self-check',reviewer:'/root/advance_remaining_site_backlogs',inputSha256:hash(raw),positive,negative,components,workedExamples:6,details,examples:[ex1,ex2,ex3,ex4,ex5,ex6],questionHashes:Object.fromEntries(qs.map(q=>[q.id,hash(JSON.stringify(q))])),lessonHashes:{[l.id]:hash(JSON.stringify(l))}};
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,positive,negative,components,workedExamples:6,inputSha256:report.inputSha256,lessonHashes:report.lessonHashes}));
