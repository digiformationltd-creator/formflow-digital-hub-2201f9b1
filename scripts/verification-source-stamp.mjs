import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT } from './seo-runtime.mjs';
const files=[];
function walk(directory){for(const entry of fs.readdirSync(path.join(ROOT,directory),{withFileTypes:true})){const relative=directory+'/'+entry.name;if(entry.isDirectory())walk(relative);else if(/\.(?:tsx?|jsx?|json|sql)$/.test(entry.name))files.push(relative);}}
for(const directory of ['src','supabase/functions','supabase/migrations'])walk(directory);
for(const file of ['index.html','package.json','package-lock.json','vercel.json','eslint.config.js','public/robots.txt','public/sitemap.xml','scripts/prerender-seo.mjs','scripts/sync-sitemap.mjs','scripts/seo-runtime.mjs'])files.push(file);
const hashes=Object.fromEntries(files.sort().map(file=>[file,createHash('sha256').update(fs.readFileSync(path.join(ROOT,file))).digest('hex')]));
const start=path.join(ROOT,'audit/phase-03/VERIFICATION_SOURCE_START.json');
if(process.argv.includes('--begin')){fs.writeFileSync(start,JSON.stringify({at:new Date().toISOString(),hashes},null,2));console.log('Recorded '+files.length+' source hashes');}
else{
  const prior=JSON.parse(fs.readFileSync(start)),changed=[...new Set([...Object.keys(prior.hashes),...files])].filter(file=>prior.hashes[file]!==hashes[file]);
  const result={at:new Date().toISOString(),startedAt:prior.at,status:changed.length?'SOURCE CHANGED — REVERIFY':'PASS',sourceFiles:files.length,changed,hashes,scope:'Local required checks completed against stable source; native backend/real transactions/live release not certified'};
  fs.writeFileSync(path.join(ROOT,'audit/phase-03/FINAL_LOCAL_VERIFICATION.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({status:result.status,sourceFiles:files.length,changed},null,2));if(changed.length)process.exitCode=1;
}
