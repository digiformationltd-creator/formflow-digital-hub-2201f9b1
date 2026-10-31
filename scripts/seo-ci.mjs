import {spawnSync} from 'node:child_process';
import {ROOT} from './seo-runtime.mjs';
import {save,at,git} from './seo-evidence.mjs';
const steps=[
 ['app-types',['node_modules/typescript/bin/tsc','-p','tsconfig.app.json','--noEmit']],
 ['node-types',['node_modules/typescript/bin/tsc','-p','tsconfig.node.json','--noEmit']],
 ['lint',['node_modules/eslint/bin/eslint.js','.']],
 ['unit',['node_modules/vitest/vitest.mjs','run']],
 ['security-offline',['scripts/security-regression.mjs']],
 ['pure-backend-types',['scripts/backend-contract-types.mjs']],
 ['sitemap-tests',['--test','scripts/sitemap.test.mjs']],
 ['negative-gates',['--test','scripts/seo-quality-gate.test.mjs']],
 ['build',null],
 ['built-gate',['scripts/seo-quality-gate.mjs']],
 ['four-modes',['scripts/seo-stage-04-audit.mjs']],
 ['technical',['scripts/phase06-technical.mjs']],
 ['geo',['scripts/phase17-geo-audit.mjs']],
 ['consent-browser',['scripts/phase20-consent-regression.mjs']],
];
const results=[];
for(const [name,args] of steps){
 console.log('CHECK '+name);
 const p=args?spawnSync(process.execPath,args,{cwd:ROOT,encoding:'utf8',maxBuffer:16*1024*1024}):spawnSync(process.platform==='win32'?'npm.cmd':'npm',['run','build'],{cwd:ROOT,shell:process.platform==='win32',encoding:'utf8',maxBuffer:16*1024*1024});
 save(`reports/seo/prompt-22/logs/${name}.log`,(p.stdout||'')+'\n'+(p.stderr||''));
 results.push({name,exit:p.status,status:p.status===0?'PASS':'FAIL',at:at()});
 save('reports/seo/prompt-22/CI_LOCAL_RUN.json',{at:at(),head:git('rev-parse','HEAD'),scope:'Local execution; not a GitHub-hosted run',results});
 if(p.status!==0){console.error('FAIL '+name);process.exit(1);}
}
console.log('All configured local CI steps passed; native backend, live deployment, field CWV and external analytics excluded and still open.');
