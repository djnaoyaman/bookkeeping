const assert=require('node:assert/strict'),S=require('../dist/assessment-session.js'),E=require('../dist/assessment-engine.js');
const q={id:'original-test',version:1,type:'fields',fields:[{id:'a',type:'amount',answer:0,points:2}]};
const bp={id:'test-form',version:1,scopeVersion:'test-only',durationSeconds:60};
let s=S.create(bp,[q],1000);assert.equal(S.remaining(s,1000),60);assert.equal(S.saveAnswer(s,q.id,{a:'0'},2000),true);s=JSON.parse(JSON.stringify(s));assert.equal(S.remaining(s,31000),30);let r=S.submit(s,[q],E.gradeFields,31000);assert.equal(r.earned,2);assert.equal(S.saveAnswer(s,q.id,{a:3},32000),false);assert.deepEqual(S.submit(s,[q],()=>{throw Error('Double submit');},32000),r);
s=S.create(bp,[q],1000);assert.equal(S.saveAnswer(s,q.id,{a:0},61000),false);r=S.submit(s,[q],E.gradeFields,62000);assert.equal(r.earned,0);assert.equal(r.reason,'deadline');assert.equal(r.elapsedSeconds,60);
s=S.create(bp,[q],1000);assert.throws(()=>S.submit(s,[{...q,version:2}],E.gradeFields,2000));assert.equal(s.status,'active');assert.throws(()=>S.saveAnswer(s,'other',{},2000));
console.log('PASS: assessment resume/deadline, explicit blank zero score, one-time submit, version mismatch and foreign-question guard.');

s=S.create(bp,[q],1000);assert.throws(()=>S.submit(s,[{...q,version:2},q],E.gradeFields,2000));assert.equal(s.status,'active');
assert.throws(()=>S.submit(s,[q],E.gradeFields,NaN));assert.equal(s.status,'active');assert.equal(s.result,null);assert.equal(S.submit(s,[q],E.gradeFields,2000).earned,0);
