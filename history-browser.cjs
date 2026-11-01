const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
fs.mkdirSync('history-shots',{recursive:true});
for(const width of [320,390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const url=route.request().url();if(url.startsWith('http://127.0.0.1:8765/'))return route.continue();if(url.startsWith('https://djnaoyaman.github.io/bookkeeping/'))return route.fulfill({response:await route.fetch({url:url.replace('https://djnaoyaman.github.io/bookkeeping/','http://127.0.0.1:8765/')})});return route.abort();});
 await page.goto('http://127.0.0.1:8765/about.html#history');
 await page.getByRole('heading',{name:'私の入口は、簿記の歴史でした。'}).waitFor();
 await page.getByText('歴史の参考資料',{exact:true}).click();
 if(await page.locator('#history a').count()!==3)throw Error('sources');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('history overflow '+width);
 await page.screenshot({path:`history-shots/history-${width}.png`,fullPage:true});
 await page.getByRole('link',{name:'問題を解く →',exact:true}).click();
 await page.locator('#practice.show').waitFor();
 if(await page.locator('.brand').innerText().then(x=>!x.includes('IL MASTRO')))throw Error('brand');
 await page.locator('button[data-view="profile"]').click();await page.locator('#profile.show').waitFor();
 await page.locator('#creator-learn').click();await page.locator('#curriculum.show').waitFor();
 await page.locator('button[data-view="home"]').click();await page.locator('#home.show').waitFor();
 await page.locator('#about').click();await page.locator('#info[open]').waitFor();await page.getByRole('button',{name:'閉じる',exact:true}).click();
 if(await page.locator('#info[open]').count())throw Error('close dialog');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('app overflow '+width);
 await page.screenshot({path:`history-shots/home-${width}.png`,fullPage:true});
 await page.getByRole('link',{name:'使い方・簿記の歴史',exact:true}).click();await page.goBack();await page.locator('#practice.show').waitFor();await page.goForward();await page.locator('#history').waitFor();
 // Drain in-flight route.fetch handlers before disposing their request context.
 await page.unrouteAll({behavior:'wait'});
 if(errors.length)throw Error(errors.join('\n')); await page.close();
}
const page=await browser.newPage({javaScriptEnabled:false});await page.goto('http://127.0.0.1:8765/about.html');await page.locator('#history').waitFor();await page.close();
await browser.close();console.log('PASS: history, 3 sources, navigation/back/forward, profile/curriculum, dialog close, no overflow at 320/390/768/1280; history works without JS.');
})();
