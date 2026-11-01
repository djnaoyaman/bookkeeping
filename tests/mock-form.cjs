'use strict';
const A=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),M=require('../dist/mock-model.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync('dist/mock-form-data.js','utf8'),context);const form=JSON.parse(JSON.stringify(context.window.ILMASTRO_MOCK_DATA.form));
const correct=JSON.parse(fs.readFileSync('tests/fixtures/mock-correct-responses.json','utf8'));
A.deepEqual(M.gradeForm(form,correct).sections,[45,20,35]);A.equal(M.gradeForm(form,{}).total,0);
let probes=0;
for(const task of form.tasks){const response=correct[task.taskId];if(Array.isArray(response)){for(let i=0;i<response.length;i++){for(const mutate of [r=>r.splice(i,1),r=>r[i].amount='',r=>r[i].side=r[i].side==='debit'?'credit':'debit',r=>r[i].amount=String(Number(r[i].amount)+1)]){const copy=structuredClone(correct);mutate(copy[task.taskId]);A.ok(M.gradeForm(form,copy).total<100);probes++;}}}else for(const id of Object.keys(response)){for(const value of ['', 'not-an-answer']){const copy=structuredClone(correct);copy[task.taskId][id]=value;if(task.spec.fields.find(f=>f.id===id).type==='choice'&&value)A.throws(()=>M.gradeForm(form,copy));else A.ok(M.gradeForm(form,copy).total<100);probes++;}}}
for(const text of ['', 'abc','簿記と帳簿😀','x'.repeat(100000)])A.equal(M.hashText(text),crypto.createHash('sha256').update(text).digest('hex'));
const source=JSON.parse(fs.readFileSync('content/mock-2026/student-form.json','utf8'));A.deepEqual(M.readPresentation(form),source);
const saved=M.start(form,{attemptId:'test',ownerId:'tab',now:100});for(const edit of [s=>s.navigation={cursor:999,flagged:[]},s=>s.navigation={cursor:0,flagged:['unknown']},s=>s.form.presentation.studentFormText+=' ']){const s=structuredClone(saved);edit(s);A.throws(()=>M.validateStored(s));}
console.log(`PASS: original18-task form100/blank0; ${probes} field/row negatives; SHA256 and saved navigation/snapshot validation.`);
