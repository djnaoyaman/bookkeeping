/* Build only the reviewed original form; public data contains no private receipts. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),M=require(path.join(root,'dist/mock-model.js'));
const expected={"student-form.json": "c8becb1e6ad6ad69a5bf20acfebd13cdd92f422af0f1acef3b4ef41643bdb33e", "grading-form.json": "f21e6abeeb32c0fd217053034d7edda55e639fd1b86d5a94f1166efd3ebdc497", "explanations.json": "0a4497e06ddd8c98d538b4aa55f1ac1d321ba7345c05302e21252e653f574216"};
const texts={};for(const [name,digest] of Object.entries(expected)){const bytes=fs.readFileSync(path.join(root,'content/mock-2026',name));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),digest,'Reviewed form changed: '+name);texts[name]=bytes.toString('utf8');}
const form=M.bindPresentation(JSON.parse(texts['grading-form.json']),texts['student-form.json']);form.explanations=JSON.parse(texts['explanations.json']);
assert.equal(form.tasks.length,18);M.validateForm(form);assert.equal(M.gradeForm(form,{}).total,0);
const body=JSON.stringify({form}).replace(/</g,'\\u003c');assert(!/libfile_|Sentinel_|\/workspace\/|\/root\//.test(body));
fs.writeFileSync(path.join(root,'dist/mock-form-data.js'),'/* Original practice; client-side scoring is not tamper-proof. */\nwindow.ILMASTRO_MOCK_DATA='+body+';\n');
console.log('PASS: reviewed original18-task form snapshot, independent45/20/35 rubric, blank0 and private-data boundary.');
