const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{ const browser=await chromium.launch();fs.mkdirSync('profile-shots',{recursive:true});
for(const width of [320,390,1280]){const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:8765/')?route.continue():route.abort());
await page.goto('http://127.0.0.1:8765/author.html');await page.locator('#profile.show').waitFor();await page.evaluate(()=>document.fonts.ready);
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('horizontal overflow '+width);
const link=page.getByRole('link',{name:'作者について ↗'});if(await link.count()!==1)throw Error('author link');
await page.screenshot({path:`profile-shots/${width}.png`,fullPage:true});await page.locator('#creator-learn').click();await page.locator('#curriculum.show').waitFor();await page.locator('button[data-view="profile"]').click();await page.locator('#profile.show').waitFor();await page.close();}
await browser.close();})();
