'use strict';
const fs=require('node:fs');
function report(data){
 const objectives=data.lessons.flatMap(l=>(l.objectives||[]).map(o=>({...o,lessonId:l.id}))),questions=data.questions;
 return {kind:'declared-objective-evidence-inventory',warning:'Tags show author-declared links, not independently established mastery or exam readiness.',sourceVersion:data.scopeVersion,objectives:objectives.map(o=>({id:o.id,lessonId:o.lessonId,description:o.description,requirementIds:o.requirementIds,workedExamples:data.lessons.flatMap(l=>l.workedExamples||[]).filter(w=>w.objectiveIds?.includes(o.id)).length,stages:Object.fromEntries(['basic','application','integrated'].map(stage=>[stage,questions.filter(q=>q.stage===stage&&q.objectiveIds?.includes(o.id)).map(q=>q.id)]))})),questionCount:questions.length,familyCount:new Set(questions.map(q=>q.familyId)).size};
}
module.exports={report};
if(require.main===module){console.log(JSON.stringify(report(JSON.parse(fs.readFileSync(process.argv[2],'utf8'))),null,2));}
