import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { ROOT,SITE,launchChromium,readSeo } from './seo-runtime.mjs';
import {at,save,csv,git} from './seo-evidence.mjs';
const dir='reports/seo/stage-23/',startedAt=at(),rows=[],raw=new Map();
const fetchOptions={signal:AbortSignal.timeout(15000),headers:{'User-Agent':'DigiFormationOwnerAudit/1.0 (read-only, bounded public SEO verification)'}};
const response=await fetch(SITE+'/sitemap.xml',fetchOptions),sitemap=await response.text();
if(!response.ok||!sitemap.includes('<loc>'))throw new Error('Live sitemap not available');
const urls=[...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]))].filter(u=>new URL(u).origin===SITE);
if(urls.length>250)throw new Error('Unexpected sitemap scope; inspect before expanding crawl');
save(dir+'LIVE_SITEMAP.xml',sitemap);
let consecutiveErrors=0;
for(const url of urls){
 try{
  const r=await fetch(url,{...fetchOptions,signal:AbortSignal.timeout(15000)}),html=await r.text(),dom=new JSDOM(html,{url}),d=dom.window.document;
  const main=d.querySelector('main')||d.getElementById('root'),copy=main?.cloneNode(true);copy?.querySelectorAll('script,style').forEach(n=>n.remove());
  const row={url,at:at(),mode:'raw-http',status:r.status,finalUrl:r.url,title:d.title,canonical:d.querySelector('link[rel="canonical"]')?.href||'',h1:[...d.querySelectorAll('h1')].map(n=>n.textContent.trim()),robots:d.querySelector('meta[name="robots"]')?.content||'',mainWords:(copy?.textContent||'').trim().split(/\s+/).filter(Boolean).length,mainLinks:main?.querySelectorAll('a[href]').length||0,headers:Object.fromEntries(['content-type','cache-control','x-robots-tag','strict-transport-security','x-content-type-options','content-security-policy','x-vercel-id'].map(h=>[h,r.headers.get(h)]))};
  raw.set(new URL(url).pathname,row);rows.push(row);dom.window.close();consecutiveErrors=0;
 }catch(e){rows.push({url,at:at(),mode:'raw-http',status:'FETCH_ERROR',error:e.message});if(++consecutiveErrors>=3)break;}
 await new Promise(resolve=>setTimeout(resolve,200));
 if(rows.length%20===0)console.log(`Live raw ${rows.length}/${urls.length}`);
}
save(dir+'LIVE_RAW.json',{startedAt,at:at(),scope:'Public GET only; no indexing/traffic proof',rows});
const browser=await launchChromium(),rendered=[];
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage();let errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url());return u.origin===SITE&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort();});
  for(const url of urls){
   errors=[];
   try{
    const r=await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});
    await page.waitForFunction(()=>Boolean(document.querySelector('main')?.textContent?.trim().length>250),null,{timeout:12000});
    await page.waitForTimeout(180);
    const d=await readSeo(page),p=new URL(url).pathname;
    rendered.push({url,width,at:at(),status:r.status(),title:d.title,canonical:d.canonicals,h1:d.h1,robots:d.robots,mainWords:d.primaryWords,mainLinks:await page.locator('main a[href]').count(),pageErrors:[...errors],rawWords:raw.get(p)?.mainWords});
    if(['/', '/contact','/uk-services/uk-ltd-formation','/faq'].includes(p))await page.screenshot({path:path.join(ROOT,dir,`LIVE_${p==='/'?'home':p.replaceAll('/','_')}_${width}.png`),fullPage:false});
   }catch(e){rendered.push({url,width,at:at(),status:'BROWSER_ERROR',error:e.message,pageErrors:[...errors]});}
   if(rendered.length%25===0){save(dir+'LIVE_RENDERED.json',{startedAt,at:at(),rows:rendered});console.log('Live browser '+rendered.length+'/'+urls.length*2);}
  }
  await context.close();
 }
}finally{await browser.close();}
save(dir+'LIVE_RENDERED.json',{startedAt,at:at(),scope:'Chromium emulation; external traffic and all non-GET blocked; not real devices, authentic bots or functional submission test',rows:rendered});
csv(dir+'23_LIVE_URL_CRAWL.csv',rows.map(r=>({...r,h1:JSON.stringify(r.h1),headers:JSON.stringify(r.headers)})));
save(dir+'LIVE_SUMMARY.json',{startedAt,at:at(),localHead:git('rev-parse','HEAD'),liveReleaseSHA:'NOT EXPOSED/NOT VERIFIED',liveSitemapUrls:urls.length,rawCaptures:rows.length,rawNon200:rows.filter(r=>r.status!==200).length,rawThinMain:rows.filter(r=>typeof r.mainWords==='number'&&r.mainWords<80).length,renderedCaptures:rendered.length,browserErrors:rendered.filter(r=>r.status==='BROWSER_ERROR').length,pageErrorCaptures:rendered.filter(r=>r.pageErrors?.length).length,deployment:'NOT DEPLOYED BY THIS AGENT',analytics:'ACCOUNT DATA NOT CONNECTED',indexing:'NOT VERIFIED'});
console.log('Live read-only verification finished; see LIVE_SUMMARY.json.');
