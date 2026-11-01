const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.join(__dirname, 'dist');
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  let file = path.join(root, pathname.replace(/^\/bookkeeping\//, ''));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  const found = pathname.startsWith('/bookkeeping/') && fs.existsSync(file) && fs.statSync(file).isFile();
  if (!found) file = path.join(root, '404.html');
  const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.png':'image/png','.js':'text/javascript'};
  res.writeHead(found ? 200 : 404, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'});
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {});
  try {
    fs.mkdirSync('recovery-shots', {recursive:true});
    for (const width of [320,390,768,1280]) {
      const page = await browser.newPage({viewport:{width,height:900}});
      await page.route('https://**', route => route.abort());
      const response = await page.goto(origin + '/bookkeeping/missing/nested/page');
      assert.equal(response.status(),404);
      assert.equal(await page.locator('h1').innerText(),'ページが見つかりません');
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex,follow');
      assert(await page.locator('.static-brand img').evaluate(img=>img.complete && img.naturalWidth>0));
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').innerText(),'本文へ移動');
      await page.keyboard.press('Enter');
      assert.equal(await page.locator(':focus').getAttribute('id'),'main-content');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').getAttribute('href'),'/bookkeeping/');
      assert.notEqual(await page.locator(':focus').evaluate(a=>getComputedStyle(a).outlineStyle),'none');
      // A nav anchor's more-specific color must not erase the primary label.
      const contrast = await page.locator('a.primary').evaluate(a => {
        const style = getComputedStyle(a);
        const luminance = color => color.match(/[\d.]+/g).slice(0,3).map(Number)
          .map(v => {v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;})
          .reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
        const fg = luminance(style.color), bg = luminance(style.backgroundColor);
        return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
      });
      assert(contrast >= 4.5, `Primary label contrast: ${contrast}`);
      await page.screenshot({path:`recovery-shots/${width}.png`,fullPage:true});
      for (const href of ['/bookkeeping/','/bookkeeping/lessons/index.html','/bookkeeping/about.html']) {
        const r = await page.goto(origin+href);
        assert.equal(r.status(),200);
        assert(!await page.locator('h1').innerText().then(t=>t==='ページが見つかりません'));
      }
      await page.close();
    }
    console.log('PASS: branded nested 404, 4 widths, logo, overflow, keyboard/focus and recovery destinations');
  } finally { await browser.close(); server.close(); }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
