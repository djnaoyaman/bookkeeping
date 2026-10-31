const {chromium}=require('playwright');const fs=require('node:fs');
(async()=>{const browser=await chromium.launch();fs.mkdirSync('redesign-shots',{recursive:true});
for(const [width,height] of [[320,800],[390,844],[768,1024],[1280,900],[844,390]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8765/')?r.continue():r.abort());
 await page.goto('http://127.0.0.1:8765/');await page.locator('#practice.show').waitFor();await page.evaluate(()=>document.fonts.ready);
 await page.keyboard.press('Tab');if(!await page.locator('.skip-link').evaluate(e=>e===document.activeElement))throw Error('skip link focus');await page.keyboard.press('Enter');
 const check=async(name)=>{if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error(`overflow ${name} ${width}x${height}`);if(await page.locator('img').evaluateAll(es=>es.filter(e=>e.offsetParent!==null).some(e=>!e.complete||e.naturalWidth===0)))throw Error('broken image '+name);await page.screenshot({path:`redesign-shots/${width}x${height}-${name}.png`,fullPage:true});};
 await check('practice');
 for(const view of ['home','review','stats','curriculum','studyplan','profile']){await page.locator(`aside button[data-view="${view}"]`).click();await page.locator(`#${view}.show`).waitFor();await check(view);}
 await page.locator('aside button[data-view="studyplan"]').click();await page.locator('#studyminutes').fill('15');await page.locator('#timeform button').click();await page.getByText('15分',{exact:false}).last().waitFor();await page.locator('[data-delete-time]').first().click();
 await page.locator('aside button[data-view="practice"]').click();for(const exam of ['zenkei','uscpa','nissho']){await page.locator('#examselect').selectOption(exam);await check(exam);}
 await page.goto('http://127.0.0.1:8765/practice/nissho-1.html');await page.locator('#writtenanswer').waitFor();await page.locator('#writtenanswer button').click();await page.locator('#answervalidation').getByText('空欄は解答として記録しません。',{exact:false}).waitFor();await check('answer-error');
 for(const route of ['about.html','privacy.html','exams/nissho.html','exams/zenkei.html','exams/uscpa.html']){await page.goto('http://127.0.0.1:8765/'+route);await check(route.replaceAll('/','-'));}
 if(errors.length)throw Error(errors.join('\n'));await page.close();
}
await browser.close();console.log('PASS: five viewports including landscape; seven app views, exam selection, empty-answer error, study-time add/cancel, static pages, keyboard skip link, image loading, no horizontal overflow.');})();
