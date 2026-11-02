'use strict';
// Author checks only. This is NOT an independent review or a publish approval.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
// Integration adapter: original author equations unchanged; select only chapter06 from reviewed combined input.
const source=path.join(__dirname,'../content/industrial-course.json'),raw=fs.readFileSync(source),all=JSON.parse(raw),d={...all,lessons:all.lessons.filter(x=>x.id==='n2-industrial-lesson-06'),questions:all.questions.filter(x=>x.lessonId==='n2-industrial-lesson-06')};
const root=path.resolve(__dirname,'..'),engine=require(path.join(root,'dist/assessment-engine.js'));
const {validate}=require(path.join(root,'scripts/validate-learning-content.cjs'));
const curriculum=require(path.join(root,'content/curriculum.json'));
const id=s=>'n2-industrial-06-'+s+'-01';
const direct=(cost,recipients)=>{const total=recipients.reduce((a,b)=>a+b,0);assert(total>0);return recipients.map(v=>cost*v/total)};
const f1=direct(30000,[300,200,100]),rent=direct(24000,[300,200,100]),elec=direct(18000,[900,300,600]);
const service=direct(36000,[30,60]),s=direct(36000,[40,20]),t=direct(24000,[300,100]);
const p=80000+s[0]+t[0],q=50000+s[1]+t[1];
const planned=120000/1000;
const pp=84000+150*240,qq=66000+150*160,applied=150*(240+160),difference=57000-applied,actualTotal=84000+66000+57000;
const solutions=new Map([
[id('department-roles'),{cutting:'production',assembly:'production',maintenance:'support',sales:'outside'}],
[id('two-classification-axes'),{machine:'individual',rent:'common','order-material':'direct-product'}],
[id('allocation-records'),{rent:'area',maintenance:'hours',power:'meter'}],
[id('first-allocation'),{p:72000+f1[0],q:48000+f1[1],s:12000+f1[2],total:72000+48000+12000+30000}],
[id('two-common-costs'),{p:60000+rent[0]+elec[0],q:36000+rent[1]+elec[1],s:24000+rent[2]+elec[2],total:60000+36000+24000+24000+18000}],
[id('direct-denominator'),{denominator:30+60,p:service[0],q:service[1],t:0,total:service[0]+service[1]}],
[id('two-support-allocation'),{'s-to-p':s[0],'s-to-q':s[1],'t-to-p':t[0],'t-to-q':t[1],'final-p':p,'final-q':q,total:p+q}],
[id('double-count-check'),{error:'duplicate',excess:(122000+68000+36000+24000)-190000,'correct-total':122000+68000}],
[id('department-to-order'),{'cutting-rate':150000/500,'assembly-rate':120000/800,'cutting-r':150000/500*20,'assembly-r':120000/800*40,'total-r':150000/500*20+120000/800*40}],
[id('support-transfer-journal'),[{side:'debit',account:'切削部門費',amount:24000},{side:'debit',account:'組立部門費',amount:12000},{side:'credit',account:'保全部門費',amount:24000+12000}]],
[id('support-actual-planned'),{'actual-rate':117000/(500+400),'planned-rate':planned,p:planned*500,q:planned*400,difference:117000-planned*(500+400)}],
[id('planned-total-reconciliation'),{'final-p':pp,'final-q':qq,'applied-s':applied,'difference-s':difference,'actual-total':actualTotal,'check-difference':pp+qq+difference-actualTotal}]
]);
assert.equal(all.authoringStatus,'reviewed');assert.equal(all.sourceVerificationPending,false);assert.equal(all.reviewRecords.length,8);
assert.equal(d.lessons.length,1);assert.equal(d.lessons[0].sections.length,10);assert.equal(d.lessons[0].workedExamples.length,6);
assert.equal(d.questions.length,12);assert.deepEqual([...solutions.keys()],d.lessons[0].questionIds);
assert(!d.lessons[0].requirementIds.includes('nissho-f1d8ec93c3ea'));
let positive=0,negative=0,components=0;const results=[];
function grade(q,r){return q.type==='fields'?engine.gradeFields(q,r):engine.gradeJournal(q,r)}
function fail(q,r,tag){assert.equal(grade(q,r).correct,false,q.id+' accepted '+tag);negative++}
for(const q of d.questions){
 const expected=solutions.get(q.id),before=negative;
 for(const exhibit of q.exhibits){assert(exhibit.headers.length>=2);for(const row of exhibit.rows)assert.equal(row.length,exhibit.headers.length)}
 for(const req of q.requirementIds)assert(curriculum.some(r=>r.id===req&&r.unit===2));
 if(q.type==='fields'){
  assert.deepEqual(Object.fromEntries(q.fields.map(f=>[f.id,f.answer])),expected);
  for(const f of q.fields){
   const e=expected[f.id];const wrong=f.type==='amount'?['',undefined,null,' ',NaN,'1円',e+1,e-1,...(e===0?[]:[-e])]:['',undefined,null,'invalid',...f.options.filter(v=>v!==e)];
   for(const w of wrong)fail(q,{...expected,[f.id]:w},`${f.id}=${String(w)}`);
   if(typeof e==='number'&&e<0)assert.equal(f.allowNegative,true);
  }
  components+=q.fields.length;
 }else{
  assert.deepEqual(q.lines.map(({side,account,amount})=>({side,account,amount})),expected);
  for(let i=0;i<expected.length;i++){
   for(const w of ['',undefined,null,0,-expected[i].amount,expected[i].amount+1]){const r=expected.map(x=>({...x}));r[i].amount=w;fail(q,r,'bad amount');}
   const badSide=expected.map(x=>({...x}));badSide[i].side=badSide[i].side==='debit'?'credit':'debit';fail(q,badSide,'wrong side');
   const badAccount=expected.map(x=>({...x}));badAccount[i].account='普通預金';fail(q,badAccount,'wrong account');
   fail(q,expected.filter((_,j)=>i!==j),'missing line');
  }
  fail(q,[...expected,{side:'debit',account:'普通預金',amount:10},{side:'credit',account:'普通預金',amount:10}],'extra balanced entry');
  fail(q,[],'blank journal');components+=q.lines.length;
 }
 const g=grade(q,expected);assert.equal(g.correct,true);assert.equal(g.earned,g.max);positive++;
 results.push({id:q.id,expected,components:g.components.length,negativeCases:negative-before});
}
// Specific misconceptions: wrong allocation denominator, double counting, wrong rate, unsigned residual.
function badField(slug,key,val){const q=d.questions.find(q=>q.id===id(slug));fail(q,{...solutions.get(q.id),[key]:val},'conceptual regression '+key);}
badField('direct-denominator','denominator',30+60+30);
badField('direct-denominator','p',36000*30/(30+60+30));
badField('direct-denominator','t',9000);
badField('two-support-allocation','s-to-p',36000*40/(40+20+30));
badField('two-support-allocation','t-to-p',24000*300/(300+100+200));
badField('two-support-allocation','total',190000+36000+24000);
badField('support-actual-planned','p',117000/900*500);
badField('planned-total-reconciliation','difference-s',3000);
badField('planned-total-reconciliation','actual-total',210000);
assert.equal(components,52);
// Author recomputation of every worked example.
const example1Rent=direct(24000,[300,200,100]);const example1=[60000,40000,20000].map((x,i)=>x+example1Rent[i]);assert.deepEqual(example1,[72000,48000,24000]);
const example2Support=direct(example1[2],[30,10]);const example2={cutting:example1[0]+example2Support[0],assembly:example1[1]+example2Support[1],support:0};assert.deepEqual(example2,{cutting:90000,assembly:54000,support:0});assert.equal(example2.cutting+example2.assembly,example1.reduce((a,b)=>a+b,0));
const example3S=direct(30000,[40,20]),example3T=direct(18000,[300,600]);const example3={p:80000+example3S[0]+example3T[0],q:40000+example3S[1]+example3T[1]};assert.deepEqual(example3,{p:106000,q:62000});assert.equal(example3.p+example3.q,80000+40000+30000+18000);
const example4={cuttingRate:120000/400,assemblyRate:90000/600,J:120000/400*12+90000/600*20};assert.deepEqual(example4,{cuttingRate:300,assemblyRate:150,J:6600});
const example5={plannedRate:96000/800,actualRate:99000/(450+300),actualP:99000/750*450,actualQ:99000/750*300,plannedP:96000/800*450,plannedQ:96000/800*300};example5.residual=99000-example5.plannedP-example5.plannedQ;assert.deepEqual(example5,{plannedRate:120,actualRate:132,actualP:59400,actualQ:39600,plannedP:54000,plannedQ:36000,residual:9000});
const example6={p:70000+54000,q:50000+36000,residual:83000-54000-36000};assert.deepEqual(example6,{p:124000,q:86000,residual:-7000});assert.equal(example6.p+example6.q+example6.residual,70000+50000+83000);
const schema=validate(all,curriculum,{target:'nissho:2'}),gate=validate(all,curriculum,{target:'nissho:2',publish:true});assert(schema.valid,JSON.stringify(schema.errors));assert.equal(gate.valid,true);
const sha=crypto.createHash('sha256').update(raw).digest('hex');
const report={kind:'author-check-not-independent-review',checkedAt:new Date().toISOString(),inputSha256:sha,lessons:1,sections:10,workedExamples:6,questions:12,components,positiveCases:positive,negativeCases:negative,questionResults:results,exampleResults:[example1,example2,example3,example4,example5,example6],schema,integratedPublishGate:gate,unimplementedGrade2:['nissho-f1d8ec93c3ea'],reviewRecordsCreated:0};
fs.writeFileSync(path.join(root,'industrial-departments-author-results.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sha,positive,negative,components,schemaValid:schema.valid,publishGate:gate.valid},null,2));
