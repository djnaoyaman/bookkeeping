const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch();fs.mkdirSync('learning-shots',{recursive:true});
for(const [width,height] of [[320,800],[390,844],[768,1024],[1280,900],[844,390]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8765/')?r.continue():r.abort());await page.goto('http://127.0.0.1:8765/');await page.locator('aside [data-view="learningcourse"]').click();
 const data=await page.evaluate(()=>globalThis.ILMASTRO_COURSE);assert.ok(data.lessons.length&&data.questions.length);
 const shot=async(name)=>{assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`overflow ${name}/${width}`);await page.screenshot({path:`learning-shots/${width}x${height}-${name}.png`,fullPage:true});};await shot('overview');
 for(const lesson of data.lessons){await page.evaluate(id=>ILMastroCourseUI.lesson(id),lesson.id);await shot(lesson.id);}
 const tested=width===390?data.questions:[data.questions[0],data.questions.find(q=>q.type==='journal'),data.questions.find(q=>q.exhibits?.length)].filter(Boolean);
 for(const q of tested){await page.evaluate(id=>ILMastroCourseUI.question(id),q.id);await page.locator('#courseanswer button[type="submit"]').click();assert.ok((await page.locator('#coursevalidation').textContent()).includes('未入力'));
  if(q.type==='fields'){for(const f of q.fields){const field=page.locator(`[data-field="${f.id}"]`);if(f.type==='choice')await field.selectOption(f.answer);else await field.fill(String(f.answer));}}
  else{for(const [i,line] of q.lines.entries()){await page.locator(`[data-row="${i}"][data-prop="side"]`).selectOption(line.side);await page.locator(`[data-row="${i}"][data-prop="account"]`).selectOption(line.account);await page.locator(`[data-row="${i}"][data-prop="amount"]`).fill(String(line.amount));}}
  await page.locator('#courseanswer button[type="submit"]').click();await page.locator('#courseresult h2').getByText('正解。').waitFor();const attempt=await page.evaluate(()=>JSON.parse(localStorage.getItem('bk-v1')).courseAttempts.at(-1));assert.equal(attempt.correct,true,q.id);assert.equal(attempt.earned,attempt.max,q.id);await shot('answered-'+q.id);
 }
 const first=data.questions[0];await page.evaluate(id=>ILMastroCourseUI.question(id),first.id);await page.locator('#coursehint summary').click();await page.locator('#coursehint[open]').waitFor();await page.locator('#courseback').click();await page.evaluate(id=>ILMastroCourseUI.question(id),first.id);await page.reload();await page.locator('aside [data-view="learningcourse"]').click();await page.evaluate(id=>ILMastroCourseUI.question(id),first.id);assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('bk-v1')).courseDraftMeta[id].hinted,first.id),true);
 await page.locator('#courseback').click();await page.locator('#courseback').click();await page.locator('#coursewrong').click();await shot('review');assert.deepEqual(errors,[]);await page.close();
}
await browser.close();console.log('PASS: course lessons/structured questions, all authored answers at mobile, five viewports, blank validation, hint persistence, lesson return and review.');})();
