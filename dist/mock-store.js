/* Dedicated IndexedDB records: never touches legacy/course storage. */
(function(root){'use strict';
const M=typeof module!=='undefined'&&module.exports?require('./mock-model.js'):root.ILMastroMock;
function openStore({name='ilmastro-original-mock-v1',factory=root.indexedDB,now=()=>Date.now()}={}){
 return new Promise((resolve,reject)=>{
  if(!factory)return reject(Error('storage-unavailable'));
  let settled=false;const request=factory.open(name,1),timer=setTimeout(()=>{settled=true;reject(Error('storage-blocked'));},10000);
  request.onupgradeneeded=()=>{const db=request.result;db.createObjectStore('attempts',{keyPath:'attemptId'});db.createObjectStore('meta');db.createObjectStore('quarantine',{autoIncrement:true});};
  request.onerror=()=>{clearTimeout(timer);reject(request.error||Error('storage-unavailable'));};
  request.onblocked=()=>{clearTimeout(timer);settled=true;reject(Error('storage-blocked'));};
  request.onsuccess=()=>{
   clearTimeout(timer);if(settled){request.result.close();return;}const db=request.result;db.onversionchange=()=>db.close();
   // All read/compare/write/finalize work is synchronous inside the request callback.
   // Resolution is ONLY transaction.oncomplete, never request.onsuccess.
   function transaction(work){return new Promise((ok,no)=>{let result,failure;const tx=db.transaction(['attempts','meta','quarantine'],'readwrite');const fail=e=>{failure=e;try{tx.abort();}catch{}};tx.oncomplete=()=>ok(result);tx.onabort=()=>no(failure||tx.error||Error('save-aborted'));tx.onerror=()=>{};try{work(tx,x=>{result=x;},fail);}catch(e){fail(e);}});}
   function checked(state){if(state)M.validateStored(state);return state;}
   function current(){return transaction((tx,done,fail)=>{const q=tx.objectStore('meta').get('current');q.onsuccess=()=>{if(!q.result){done(null);return;}const a=tx.objectStore('attempts').get(q.result);a.onsuccess=()=>{try{done(checked(a.result)||null);}catch(e){tx.objectStore('quarantine').add({attemptId:q.result,record:a.result,reason:String(e.message),at:now()});tx.objectStore('meta').delete('current');done({quarantined:true,reason:'保存データの整合性を確認できないため隔離しました。'});}};};});}
   function start(form,ownerId){M.validateForm(form);return transaction((tx,done,fail)=>{const q=tx.objectStore('meta').get('current');q.onsuccess=()=>{const create=()=>{try{const state=M.start(form,{attemptId:root.crypto.randomUUID(),ownerId,now:now()});state.navigation={cursor:0,flagged:[]};tx.objectStore('attempts').add(state);tx.objectStore('meta').put(state.attemptId,'current');done(state);}catch(e){fail(e);}};if(!q.result){create();return;}const previous=tx.objectStore('attempts').get(q.result);previous.onsuccess=()=>{try{checked(previous.result);if(previous.result?.status==='running')throw Error('active-attempt-exists');create();}catch(e){fail(e);}};};});}
   function change(attemptId,ownerId,revision,operation,payload={}){return transaction((tx,done,fail)=>{const q=tx.objectStore('attempts').get(attemptId);q.onsuccess=()=>{try{
    const state=checked(q.result);if(!state)throw Error('attempt-missing');const acceptedAt=now();let next;
    if(operation==='takeover')next=M.takeover(state,{revision,newOwnerId:ownerId,now:acceptedAt});
    else if(operation==='finish')next=M.finish(state,{ownerId,revision,now:acceptedAt});
    else if(operation==='save')next=M.save(state,{ownerId,revision,now:acceptedAt,taskId:payload.taskId,response:payload.response});
    else if(operation==='abandon'){if(state.ownerId!==ownerId||state.revision!==revision)throw Error('stale revision');next=M.resume(state,{now:acceptedAt});if(next.status==='running'){next.status='abandoned';next.revision++;}}
    else if(operation==='heartbeat'||operation==='navigate'){
     if(state.status!=='running')next=state;
     else {if(state.ownerId!==ownerId)throw Error('other editor');if(state.revision!==revision)throw Error('stale revision');next=M.resume(state,{now:acceptedAt});
      if(operation==='navigate'&&next.status==='running'){const {cursor,flagged}=payload;if(!Number.isSafeInteger(cursor)||cursor<0||cursor>=state.form.tasks.length||!Array.isArray(flagged)||flagged.some(id=>!state.form.tasks.some(t=>t.taskId===id))||new Set(flagged).size!==flagged.length)throw Error('invalid navigation');next.navigation={cursor,flagged};}}
    }else throw Error('unknown operation');
    // Deadline decisions used acceptedAt in this callback; delayed completion
    // cannot backdate a post-deadline answer or discard an accepted committed one.
    tx.objectStore('attempts').put(next);done(next);
   }catch(e){fail(e);}};});}
   resolve(Object.freeze({current,start,change,close:()=>db.close()}));
  };
 });
}
if(typeof module!=='undefined'&&module.exports)module.exports={openStore};else root.ILMastroMockStore={openStore};
})(typeof globalThis!=='undefined'?globalThis:this);
