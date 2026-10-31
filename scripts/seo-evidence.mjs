import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './seo-runtime.mjs';
export const at = () => new Date().toISOString();
export const read = file => fs.readFileSync(path.join(ROOT,file),'utf8');
export const json = file => JSON.parse(read(file));
export function save(file,value) { fs.mkdirSync(path.dirname(path.join(ROOT,file)),{recursive:true}); fs.writeFileSync(path.join(ROOT,file),typeof value==='string'?value+'\n':JSON.stringify(value,null,2)+'\n'); }
export function csv(file,rows,columns=Object.keys(rows[0]||{})) { const q=v=>'"'+String(v??'').replaceAll('"','""')+'"'; save(file,[columns.map(q).join(','),...rows.map(r=>columns.map(k=>q(r[k])).join(','))].join('\r\n')); }
export const git = (...args) => execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim();
