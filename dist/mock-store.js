/* Dedicated IndexedDB records: never touches legacy/course storage. */
(function(root){'use strict';
const M=typeof module!=='undefined'&&module.exports?require('./mock-model.js'):root.ILMastroMock;
function monotonicClock({wall=()=>Date.now(),elapsed=()=>performance.now()}={}){
 const anchorWall=wall(),anchorElapsed=elapsed();let lastWall=anchorWall,last=anchorWall,regressed=false;
 const read=()=>{const w=wall(),e=Math.max(0,Math.floor(elapsed()-anchorElapsed));if(w+1000<lastWall)regressed=true;lastWall=Math.max(lastWall,w);last=M.effectiveNow({wall:w,anchorWall,elapsed:e,lastObserved:last});return last;};read.regressed=()=>regressed;return read;
}
function openStore({name='ilmastro-original-mock-v1',factory=root.indexedDB,now=monotonicClock(),guardStorage=root.localStorage}={}){
 return new Promise((resolve,reject)=>{
  if(!factory||!guardStorage)return reject(Error('storage-unavailable'));
  try{guardStorage.setItem(name+':probe','1');guardStorage.removeItem(name+':probe');}catch{return reject(Error('storage-unavailable'));}
  let settled=false;const request=factory.open(name,1),timer=setTimeout(()=>{settled=true;reject(Error('storage-blocked'));},10000);
  request.onupgradeneeded=()=>{const db=request.result;db.createObjectStore('attempts',{keyPath:'attemptId'});db.createObjectStore('meta');db.createObjectStore('quarantine',{autoIncrement:true});};
  request.onerror=()=>{clearTimeout(timer);reject(request.error||Error('storage-unavailable'));};request.onblocked=()=>{clearTimeout(timer);settled=true;reject(Error('storage-blocked'));};
  request.onsuccess=()=>{
   clearTimeout(timer);if(settled){request.result.close();return;}const db=request.result;db.onversionchange=()=>db.close();
   function transaction(work){return new Promise((ok,no)=>{let result,failure;const tx=db.transaction(['attempts','meta','quarantine'],'readwrite');const fail=e=>{failure=e;try{tx.abort();}catch{}};tx.oncomplete=()=>ok(result);tx.onabort=()=>no(failure||tx.error||Error('save-aborted'));tx.onerror=()=>{};try{work(tx,x=>{result=x;},fail);}catch(e){fail(e);}});}
   const guardKey=id=>name+':pending:'+id;
   function guard(id){const value=guardStorage.getItem(guardKey(id));if(!value)return null;try{const x=JSON.parse(value);if(typeof x.token!=='string'||!x.token)throw Error();return x;}catch{throw Error('corrupt pending guard');}}
   function clearGuard(id,token){const g=guard(id);if(g&&(!token||g.token===token))guardStorage.removeItem(guardKey(id));}
   function recoverGuard(state){if(!state)return state;const g=guard(state.attemptId);if(g&&g.token===state.lastCommittedIntent){clearGuard(state.attemptId,g.token);return state;}if(g&&!state.inFlight)return {...state,inFlight:{operation:g.operation||'save',token:g.token,external:true}};return state;}
   function checked(state){if(state){M.validateStored(state);if(state.inFlight&&(!['save','finish'].includes(state.inFlight.operation)||typeof state.inFlight.token!=='string'||!state.inFlight.token))throw Error('corrupt pending write');}return state;}
   function current(){return transaction((tx,done,fail)=>{const q=tx.objectStore('meta').get('current');q.onsuccess=()=>{if(!q.result){done(null);return;}const a=tx.objectStore('attempts').get(q.result);a.onsuccess=()=>{try{if(!a.result)throw Error('dangling-current');done(recoverGuard(checked(a.result)));}catch(e){tx.objectStore('quarantine').add({attemptId:q.result,record:a.result,reason:String(e.message),at:now()});tx.objectStore('meta').delete('current');done({quarantined:true,reason:'保存データの整合性を確認できないため隔離しました。'});}};};});}
   function start(form,ownerId){M.validateForm(form);return transaction((tx,done,fail)=>{const q=tx.objectStore('meta').get('current');q.onsuccess=()=>{const create=()=>{try{const state=M.start(form,{attemptId:root.crypto.randomUUID(),ownerId,now:now()});state.navigation={cursor:0,flagged:[]};tx.objectStore('attempts').add(state);tx.objectStore('meta').put(state.attemptId,'current');done(state);}catch(e){fail(e);}};if(!q.result){create();return;}const previous=tx.objectStore('attempts').get(q.result);previous.onsuccess=()=>{try{if(!previous.result)throw Error('dangling-current');checked(previous.result);if(previous.result?.status==='running')throw Error('active-attempt-exists');create();}catch(e){fail(e);}};};});}
   function record(attemptId,fn){return transaction((tx,done,fail)=>{const q=tx.objectStore('attempts').get(attemptId);q.onsuccess=()=>{try{const state=checked(q.result);if(!state)throw Error('attempt-missing');const next=fn(state);tx.objectStore('attempts').put(next);done(next);}catch(e){fail(e);}};});}
   // A durable intent precedes an answer/finalization write. If the second
   // transaction aborts or the page closes, every tab sees inFlight and must
   // refuse takeover/scoring. It may only be explicitly abandoned.
   async function change(attemptId,ownerId,revision,operation,payload={}){
    let intent=null,guardToken=null;
    if(operation==='finish'){const observed=await transaction((tx,done,fail)=>{const q=tx.objectStore('attempts').get(attemptId);q.onsuccess=()=>{try{done(recoverGuard(checked(q.result)));}catch(e){fail(e);}};});if(observed&&['submitted','timed-out'].includes(observed.status)&&!observed.inFlight)return observed;}
    if(operation==='save'||operation==='finish'){
     if(guard(attemptId))throw Error('unresolved-save');guardToken=root.crypto.randomUUID();guardStorage.setItem(guardKey(attemptId),JSON.stringify({token:guardToken,operation,ownerId}));
     let validationFailure=false,staged;try{staged=await record(attemptId,state=>{try{if(['submitted','timed-out'].includes(state.status)){if(operation==='finish')return state;throw Error('terminal');}if(state.inFlight)throw Error('unresolved-save');if(state.status!=='running'||state.ownerId!==ownerId)throw Error('other editor');if(state.revision!==revision)throw Error('stale revision');if(operation==='save'){const task=state.form.tasks.find(t=>t.taskId===payload.taskId);if(!task)throw Error('unknown task');M.validateRaw(task,payload.response);}}catch(e){validationFailure=true;throw e;}const next=structuredClone(state);next.inFlight={operation,token:guardToken};next.revision++;return next;});}catch(e){if(validationFailure)clearGuard(attemptId,guardToken);throw e;}
     if(['submitted','timed-out'].includes(staged.status)){clearGuard(attemptId,guardToken);return staged;}intent=staged.inFlight;revision=staged.revision;
    }
    const completed=await record(attemptId,state=>{
     if(['submitted','timed-out'].includes(state.status)&&operation==='finish')return state;
     if(operation==='abandon'){if(state.revision!==revision||state.status!=='running')throw Error('stale revision');const next=structuredClone(state);next.status='abandoned';next.result=null;next.ownerId=ownerId;next.revision++;delete next.inFlight;return next;}
     const shared=guard(attemptId);if(shared&&shared.token!==intent?.token)throw Error('unresolved-save');
     if(intent){if(state.inFlight?.token!==intent.token||state.revision!==revision)throw Error('stale intent');}else if(state.inFlight)throw Error('unresolved-save');
     const clean=structuredClone(state);delete clean.inFlight;const acceptedAt=now();
     if(now.regressed?.()&&clean.status==='running'){clean.status='recovery-blocked';clean.blockReason='clock-regression';clean.revision++;if(intent)clean.lastCommittedIntent=intent.token;return clean;}
     let next;
     if(operation==='takeover')next=M.takeover(clean,{revision,newOwnerId:ownerId,now:acceptedAt});
     else if(operation==='finish')next=M.finish(clean,{ownerId,revision,now:acceptedAt});
     else if(operation==='save')next=M.save(clean,{ownerId,revision,now:acceptedAt,taskId:payload.taskId,response:payload.response});
     else if(operation==='heartbeat'||operation==='navigate'){
      if(clean.status!=='running')next=clean;
      else {if(clean.ownerId!==ownerId)throw Error('other editor');if(clean.revision!==revision)throw Error('stale revision');next=M.resume(clean,{now:acceptedAt});
       if(operation==='navigate'&&next.status==='running'){const {cursor,flagged}=payload;if(!Number.isSafeInteger(cursor)||cursor<0||cursor>=clean.form.tasks.length||!Array.isArray(flagged)||flagged.some(id=>!clean.form.tasks.some(t=>t.taskId===id))||new Set(flagged).size!==flagged.length)throw Error('invalid navigation');next.navigation={cursor,flagged};}}
     }else throw Error('unknown operation');if(intent)next.lastCommittedIntent=intent.token;return next;
    });
    if(operation==='abandon')clearGuard(attemptId);else if(intent)clearGuard(attemptId,intent.token);return completed;
   }
   resolve(Object.freeze({current,start,change,time:now,clockRegressed:()=>!!now.regressed?.(),close:()=>db.close()}));
  };
 });
}
const api={openStore,monotonicClock};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ILMastroMockStore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
