/* Versioned local assessment lifecycle. Timing is a study aid, not secure proctoring. */
(function(root){'use strict';
function create(blueprint,questions,now=Date.now()){
 if(!Number.isSafeInteger(now)||now<0)throw Error('Invalid start time');
 if(!blueprint?.id||!blueprint.version||!blueprint.scopeVersion||!Number.isSafeInteger(blueprint.durationSeconds)||blueprint.durationSeconds<=0||blueprint.durationSeconds>86400||!Number.isSafeInteger(now+blueprint.durationSeconds*1000))throw Error('Invalid blueprint');
 if(!Array.isArray(questions)||!questions.length||questions.some(q=>!q||typeof q.id!=='string'||!q.id||!Number.isInteger(q.version)||q.version<1)||new Set(questions.map(q=>q.id)).size!==questions.length)throw Error('Invalid question set');
 return {schemaVersion:1,blueprintId:blueprint.id,blueprintVersion:blueprint.version,scopeVersion:blueprint.scopeVersion,startedAt:now,deadlineAt:now+blueprint.durationSeconds*1000,status:'active',questionVersions:questions.map(q=>({id:q.id,version:q.version})),answers:{},flagged:[],cursor:0,result:null};
}
function remaining(session,now=Date.now()){if(!Number.isSafeInteger(now)||!Number.isSafeInteger(session.deadlineAt))throw Error('Invalid timing state');return Math.max(0,Math.ceil((session.deadlineAt-now)/1000));}
function matches(session,questions){if(!Array.isArray(questions)||new Set(questions.map(q=>q.id)).size!==questions.length)return false;return session.questionVersions.every(v=>questions.some(q=>q.id===v.id&&q.version===v.version));}
function saveAnswer(session,id,response,now=Date.now()){
 if(session.status!=='active'||remaining(session,now)===0)return false;
 if(!session.questionVersions.some(q=>q.id===id))throw Error('Question outside session');
 session.answers[id]=JSON.parse(JSON.stringify(response));return true;
}
function submit(session,questions,grade,now=Date.now()){
 if(session.status!=='active')return session.result;
 const secondsRemaining=remaining(session,now);
 if(!Number.isSafeInteger(session.startedAt)||session.startedAt<0||session.deadlineAt<=session.startedAt)throw Error('Invalid stored timing');
 if(!matches(session,questions))throw Error('Content version changed: cannot rescore silently');
 const results=session.questionVersions.map(v=>{const q=questions.find(q=>q.id===v.id&&q.version===v.version);const response=session.answers[q.id];const result=grade(q,response??(q.type==='journal'?[]:{}));return {id:q.id,version:q.version,...result};});
 const max=results.reduce((n,r)=>n+r.max,0),earned=results.reduce((n,r)=>n+r.earned,0);
 if(!Number.isSafeInteger(max)||!Number.isSafeInteger(earned)||earned>max)throw Error('Invalid scoring total');
 const result={reason:secondsRemaining===0?'deadline':'submitted',elapsedSeconds:Math.min(Math.max(0,Math.round((now-session.startedAt)/1000)),Math.round((session.deadlineAt-session.startedAt)/1000)),earned,max,questions:results};session.result=result;session.submittedAt=now;session.status='submitted';return result;
}
const api=Object.freeze({create,remaining,matches,saveAnswer,submit});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ILMastroSession=api;
})(typeof globalThis!=='undefined'?globalThis:this);
