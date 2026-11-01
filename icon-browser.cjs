'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{fs.mkdirSync('icon-shots',{recursive:true});const browser=await chromium.launch();const results=[];try{
for(const width of [320,768]){
 const page=await browser.newPage({viewport:{width,height:700},deviceScaleFactor:1});
 await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8765/')?r.continue():r.abort());
 await page.goto('http://127.0.0.1:8765/');
 const links=await page.locator('link[rel="apple-touch-icon"],link[rel="icon"],link[rel="shortcut icon"]').evaluateAll(xs=>xs.map(x=>({href:x.href,sizes:x.sizes.value})));
 assert.equal(links.length,7);
 await page.setContent('<html lang="ja"><meta name="viewport" content="width=device-width"><body style="margin:16px;background:#f4efe4;color:#27251f;font-family:serif"><h1>IL MASTRO</h1><p>採用人物紋章・実寸アイコン</p>'+[['favicon-16.png',16],['favicon-32.png',32],['apple-touch-icon.png',180]].map(([name,n])=>`<figure style="margin:16px 0"><img alt="${name}" src="http://127.0.0.1:8765/${name}" width="${n}" height="${n}"><figcaption>${n} × ${n}</figcaption></figure>`).join('')+'</body></html>');
 await page.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));
 const sizes=await page.locator('img').evaluateAll(xs=>xs.map(x=>[x.naturalWidth,x.naturalHeight]));assert.deepEqual(sizes,[[16,16],[32,32],[180,180]]);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:`icon-shots/${width}-merchant-icons.png`,fullPage:true});results.push({width,sizes,headLinks:links.length});await page.close();
}fs.writeFileSync('icon-shots/result.json',JSON.stringify({status:'PASS',results,note:'Actual OS home-screen caching and Safari installation not tested.'},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
