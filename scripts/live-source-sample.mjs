import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { ROOT, SITE, launchChromium, readSeo } from './seo-runtime.mjs';
const out = path.join(ROOT,'reports/seo/stage-10'); fs.mkdirSync(out,{recursive:true});
const browser = await launchChromium(), rows = [];
try {
  for (const [route,name] of [['/','home'],['/contact','contact'],['/uk-services/uk-ltd-formation','uk-services_uk-ltd-formation']]) {
    const source = path.join(ROOT,'.firecrawl',`live-${name}.html`);
    const document = new JSDOM(fs.readFileSync(source,'utf8')).window.document;
    const main = document.querySelector('main') || document.getElementById('root');
    const copy = main.cloneNode(true); copy.querySelectorAll('script,style').forEach(n=>n.remove());
    const raw = { at: fs.statSync(source).mtime.toISOString(), title: document.title, h1: [...document.querySelectorAll('h1')].map(n=>n.textContent.trim()), canonical: document.querySelector('link[rel="canonical"]')?.href, estimatedMainWords: copy.textContent.trim().split(/\s+/).filter(Boolean).length, mainLinks: main.querySelectorAll('a[href]').length };
    document.defaultView.close();
    const context = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}), page = await context.newPage(), errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/*', request => { const target = new URL(request.request().url()); return target.origin === SITE && ['GET','HEAD'].includes(request.request().method()) ? request.continue() : request.abort(); });
    let rendered = null, failure = null;
    try {
      await page.goto(SITE+route,{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(()=> (document.getElementById('root')?.textContent.length || 0)>500, {timeout:15000});
      const seo = await readSeo(page);
      rendered = {at:new Date().toISOString(),title:seo.title,h1:seo.h1,canonical:seo.canonicals[0],estimatedMainWords:seo.primaryWords,mainLinks:await page.locator('main a[href]').count()};
      if(route==='/') await page.screenshot({path:path.join(out,'LIVE_RENDERED_HOME_MOBILE.png'),fullPage:false});
    } catch(error) {failure=error.message;}
    rows.push({route,raw,rendered,failure,pageErrors:errors}); await context.close();
  }
} finally {await browser.close();}
const result={at:new Date().toISOString(),scope:'Three live URLs only; GET/HEAD to own origin permitted; all off-origin network and POST blocked; no messages/forms/orders submitted',rows,analytics:'NOT CONNECTED',trafficCausation:'NOT ESTABLISHED; source thinness is a technical finding, not proof of zero traffic cause'};
fs.writeFileSync(path.join(out,'LIVE_SOURCE_RENDER_COMPARISON.json'),JSON.stringify(result,null,2)); console.log(JSON.stringify(result,null,2));
