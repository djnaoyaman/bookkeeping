const fs=require('fs'),vm=require('vm'),assert=require('assert');
const path=require('path');const dist=path.resolve(__dirname,'../dist')+'/';
function context(saved){const elements={},storage=saved||{};function el(){return {innerHTML:'',textContent:'',value:'',style:{},dataset:{},classList:{toggle(){},add(){}},querySelector(){return null},querySelectorAll(){return []},scrollIntoView(){},focus(){},showModal(){},close(){},click(){}}}const c={console,Date,JSON,Math,Set,Map,Blob,URL,setTimeout,alert(){},localStorage:{getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[],querySelector:()=>null,createElement:()=>el()},window:{scrollTo(){}}};vm.createContext(c);for(const f of ['assessment-engine.js','catalog.js','curriculum-data.js','app.js','curriculum-ui.js','study-plan.js','exercise-first.js'])vm.runInContext(fs.readFileSync(dist+f,'utf8'),c);return {c,elements,storage}}

const siteBase=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../site.config.json'),'utf8')).url.replace(/\/$/,'');
const {c,elements}=context();const attributes=[];const canonical={href:''};const graph={textContent:JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'WebPage',url:'https://book-keeping-practice.mossyelf3.chatgpt.site/'}]})};
c.document.head={querySelector(sel){if(sel==='link[rel="canonical"]')return canonical;if(sel==='script[type="application/ld+json"]')return graph;const m=sel.match(/meta\[(name|property)="([^"]+)"\]/);return m?attributes.find(x=>x.attrs[m[1]]===m[2])||null:null},appendChild(node){attributes.push(node)}};
c.document.createElement=()=>({attrs:{},setAttribute(k,v){this.attrs[k]=v},appendChild(){},className:'',textContent:''});
c.document.body={dataset:{discoveryRoute:'question',question:'extra-14'},classList:{toggle(){}}};const listeners={};c.document.addEventListener=(n,fn)=>listeners[n]=fn;
c.window.location=new URL(siteBase+'/practice/uscpa-e14.html?utm_source=google&utm_medium=cpc&utm_campaign=far');c.window.dataLayer=[];const gaCalls=[];c.window.gtag=(...args)=>gaCalls.push(args);const historyCalls=[];c.history={replaceState(a,b,url){historyCalls.push(url)}};c.navigator={};c.URLSearchParams=URLSearchParams;
vm.runInContext(fs.readFileSync(dist+'discovery-config.js','utf8'),c);vm.runInContext(fs.readFileSync(dist+'discovery.js','utf8'),c);
vm.runInContext(`
if(exam!=='uscpa'||queue.length!==1||queue[0].id!=='extra-14')throw Error('direct practice URL hydration');
const before=state.log.length;answer(queue[0].answer);answer(queue[0].answer);if(state.log.length!==before+1)throw Error('duplicate answer');
if(window.dataLayer.filter(x=>x.event==='practice_start').length!==1)throw Error('start measurement');
if(window.dataLayer.filter(x=>x.event==='answer_submit').length!==1)throw Error('answer measurement');
position=queue.length;renderQuestion();renderQuestion();if(window.dataLayer.filter(x=>x.event==='practice_complete').length!==1)throw Error('completion deduplication');
if(window.dataLayer.some(x=>'response' in x||'score' in x||'memo' in x))throw Error('sensitive event data');
navigate('profile');
`,c);
assert(canonical.href.endsWith('/author.html'));assert(historyCalls.at(-1).includes('utm_campaign=far'));
const link={href:siteBase+'/?exam=nissho'};listeners.click({target:{closest:()=>link}});assert(new URL(link.href).searchParams.get('utm_source')==='google');assert(new URL(link.href).searchParams.get('exam')==='nissho');
const events=gaCalls.filter(x=>x[0]==='event');
assert.strictEqual(events.filter(x=>x[1]==='page_view').length,1);
const pageview=events.find(x=>x[1]==='page_view')[2];assert(!pageview.page_location.includes('?'));assert.strictEqual(pageview.send_to,'G-837HXKXW8Q');
for(const name of ['practice_start','answer_submit','practice_complete'])assert.strictEqual(events.filter(x=>x[1]===name).length,1,name+' GA deduplication');
assert(events.some(x=>x[1]==='learning_view'&&x[2].view_name==='profile'));
listeners.change({target:{id:'examselect',value:'nissho'}});
listeners.click({target:{closest:selector=>selector==='button'?{id:'export'}:null}});
listeners.click({target:{closest:selector=>selector==='button'?{id:'repeatset'}:null}});
assert(gaCalls.some(x=>x[1]==='exam_select'&&x[2].exam==='nissho'));
assert(gaCalls.some(x=>x[1]==='learning_export'&&x[2].export_type==='learning_json'));
assert(gaCalls.some(x=>x[1]==='mistake_retry_start'));
assert(!gaCalls.some(x=>x[2]&&['response','score','memo','correct','email','user_id','search_term'].some(k=>k in x[2])));
console.log('PASS: GA4 forwarding, initial page view, retry, export, exam selection, no answer data; direct question hydration, track selection, event counts, duplicate prevention, event privacy, author canonical updates and campaign preservation.');
