import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT,DIST,SITE,publicPaths } from './seo-runtime.mjs';
import { save } from './seo-evidence.mjs';
export function checkPublicHtml(html,pathname){
  const dom=new JSDOM(html),d=dom.window.document,issues=[];
  const values=s=>[...d.querySelectorAll(s)];
  if(values('title').length!==1||!d.title.trim())issues.push('title');
  if(values('h1').length!==1)issues.push('h1');
  const canonicals=values('link[rel="canonical"]');if(canonicals.length!==1||canonicals[0]?.href!==SITE+pathname)issues.push('canonical');
  const robots=values('meta[name="robots"]');if(robots.length!==1||/noindex/i.test(robots[0]?.content||''))issues.push('indexability');
  const main=d.querySelector('main')||d.getElementById('root');
  if((main?.textContent||'').trim().split(/\s+/).length<80)issues.push('full-content');
  for(const script of values('script[type="application/ld+json"]'))try{JSON.parse(script.textContent);}catch{issues.push('jsonld');}
  if(values('script[src*="googletagmanager.com"]').length)issues.push('unconsented-tag');
  dom.window.close();return issues;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const rows=publicPaths().map(p=>{const file=path.join(DIST,p==='/'?'index.html':p.slice(1)+'/index.html');return {path:p,issues:fs.existsSync(file)?checkPublicHtml(fs.readFileSync(file,'utf8'),p):['missing-export']};});
  const result={at:new Date().toISOString(),scope:'Built initial HTML; local only; independent minimal release gate',rows,failures:rows.filter(r=>r.issues.length)};
  save('reports/seo/prompt-22/QUALITY_GATE.json',result);console.log(JSON.stringify({routes:rows.length,failures:result.failures}));if(result.failures.length)process.exitCode=1;
}
