const assert=require('node:assert/strict');
const {amount,gradeJournal,gradeFields}=require('../dist/assessment-engine.js');
assert.equal(amount('１２，３４５'),12345);assert.equal(amount('12,34'),null);assert.equal(amount('2万円'),null);assert.equal(amount(''),null);assert.equal(amount('0'),0);assert.equal(amount('12.5',2),1250);assert.equal(amount('1.001',2),null);assert.equal(amount('Infinity'),null);assert.equal(amount('9007199254740992'),null);
const spec={lines:[{side:'debit',account:'仕入',amount:10000,points:2},{side:'debit',account:'仮払消費税',amount:1000,points:1},{side:'credit',account:'買掛金',amount:11000,points:2}]};
let response=spec.lines.map(({points,...line})=>line);
assert.equal(gradeJournal(spec,response).earned,5);
assert.equal(gradeJournal(spec,response.toReversed()).earned,5);
assert.equal(gradeJournal(spec,[]).earned,0);
assert.equal(gradeJournal(spec,[...response,{side:'debit',account:'現金',amount:1}]).earned,0);
assert.equal(gradeJournal(spec,response.map(x=>({...x,side:x.side==='debit'?'credit':'debit'}))).earned,0);
assert.equal(gradeJournal(spec,[{side:'debit',account:'仕入',amount:4000},{side:'debit',account:'仕入',amount:6000},...response.slice(1)]).earned,5);
assert.equal(gradeJournal(spec,[{...response[0],amount:9000},...response.slice(1)]).earned,3);
assert.equal(gradeJournal(spec,[{...response[0],amount:''},...response.slice(1)]).valid,false);
assert.throws(()=>gradeJournal({...spec,lines:spec.lines.slice(1)},response));
assert.throws(()=>gradeJournal({...spec,lines:[...spec.lines,spec.lines[0]]},response));
const fields={fields:[{id:'cash',type:'amount',answer:0,points:2},{id:'side',type:'choice',options:['debit','credit'],answer:'credit',points:1}]};
assert.equal(gradeFields(fields,{cash:'0',side:'credit'}).earned,3);assert.equal(gradeFields(fields,{cash:'',side:'credit'}).earned,1);assert.equal(gradeFields(fields,{cash:'',side:'credit'}).valid,false);
for(let n=1;n<=300;n++){
 const s={lines:[{side:'debit',account:'現金',amount:n*100,points:1},{side:'credit',account:'資本金',amount:n*100,points:1}]};
 const ok=gradeJournal(s,s.lines);assert.equal(ok.correct,true);
 const bad=gradeJournal(s,[{...s.lines[0],amount:n*100+1},s.lines[1]]);assert.equal(bad.correct,false);assert.equal(bad.balanced,false);assert.equal(bad.earned,1);assert.ok(bad.earned<=bad.max);
}
console.log('PASS: structured journal/field grading, partial points, balance, duplicate aggregation, extras, empty/zero/precision, 300 invariant fixtures.');

assert.equal(amount('90071992547409.91',2),Number.MAX_SAFE_INTEGER);assert.equal(amount('90071992547409.92',2),null);

assert.equal(gradeJournal(spec,[null]).valid,false);assert.equal(amount('1'.repeat(10000)),null);assert.equal(gradeJournal(spec,null).valid,false);

assert.throws(()=>gradeFields({fields:[{id:'a',type:'choice',options:['','debit'],answer:'',points:1}]},{a:''}));
assert.throws(()=>gradeFields({fields:[{id:'a',type:'choice',options:[undefined,'debit'],answer:undefined,points:1}]},{}));
assert.throws(()=>gradeFields({fields:[{id:'a',type:'amount',answer:1,points:Number.MAX_SAFE_INTEGER},{id:'b',type:'amount',answer:1,points:1}]},{a:1,b:0}));
const extra=gradeJournal(spec,[...response,{side:'debit',account:'現金',amount:1}]);assert.equal(extra.components.reduce((n,c)=>n+c.earned,0),extra.earned);assert.equal(extra.reason,'unexpected-journal-entries');
assert.equal(gradeJournal(spec,[]).valid,false);assert.equal(gradeJournal(spec,[]).balanced,false);

const split=[{side:'debit',account:'仕入',amount:4000},{side:'debit',account:'仕入',amount:6000},...response.slice(1)];
assert.equal(gradeJournal(spec,split).correct,true);assert.equal(gradeJournal(spec,split).warnings.length,1);const strict=gradeJournal({...spec,inputMode:'cbt'},split);assert.equal(strict.correct,false);assert.equal(strict.earned,0);assert.equal(strict.reason,'duplicate-journal-accounts');assert.equal(gradeJournal({...spec,inputMode:'cbt'},response).correct,true);
