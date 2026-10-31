// Narrow mechanical change: only h4 tags in three already-reviewed outlines.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createHash } from 'node:crypto';
import { ROOT } from './seo-runtime.mjs';
const targetSlugs = new Set(['how-to-register-uk-ltd-from-pakistan-2026','how-to-open-stripe-account-pakistan-2026','uk-company-id-verification-2025-2026-rule']);
const file = path.join(ROOT,'src/data/blog.ts'), before = fs.readFileSync(file,'utf8');
const source = ts.createSourceFile(file,before,ts.ScriptTarget.Latest,true);
const property = (node,name) => node.properties.find(p=>ts.isPropertyAssignment(p) && p.name && (ts.isIdentifier(p.name)||ts.isStringLiteral(p.name)) && p.name.text===name);
let array;
for(const statement of source.statements) if(ts.isVariableStatement(statement)) for(const declaration of statement.declarationList.declarations) if(declaration.name.getText(source)==='blogPosts') array=declaration.initializer;
if(!array || !ts.isArrayLiteralExpression(array)) throw new Error('Expected blog literal');
const edits=[], counts=[];
for(const post of array.elements) {
  if(!ts.isObjectLiteralExpression(post)) throw new Error('Expected post object');
  const slug=property(post,'slug')?.initializer.text;
  if(!targetSlugs.has(slug)) continue;
  const content=property(post,'content')?.initializer;
  if(!content || !ts.isArrayLiteralExpression(content)) throw new Error('Expected content array');
  let changed=0;
  for(const section of content.elements) {
    if(!ts.isObjectLiteralExpression(section)) throw new Error('Expected section object');
    const body=property(section,'body')?.initializer;
    if(!body || !ts.isStringLiteralLike(body)) throw new Error('Expected literal HTML');
    const literal=body.getText(source), replacements=[...literal.matchAll(/<\/?h4(?=[\s>])/g)].length;
    if(!replacements) continue;
    edits.push({start:body.getStart(source),end:body.getEnd(),text:literal.replace(/(<\/?h)4(?=[\s>])/g,(_match,prefix)=>prefix+'3')}); changed+=replacements;
  }
  counts.push({slug,changedTags:changed});
}
if(!edits.length) {console.log('No targeted h4 tags remain'); process.exit(0);}
if(counts.length!==3) throw new Error('Expected exactly three target articles; inspect source slugs before editing');
let after=before;
for(const edit of edits.sort((a,b)=>b.start-a.start)) after=after.slice(0,edit.start)+edit.text+after.slice(edit.end);
const backup=path.join(ROOT,'SEO_TRANSFORMATION/CHECKPOINTS/blog-headings-'+Date.now());
fs.mkdirSync(backup,{recursive:true});fs.writeFileSync(path.join(backup,'blog.ts'),before);
if(fs.readFileSync(file,'utf8')!==before) throw new Error('Concurrent source change; refusing overwrite');
fs.writeFileSync(file,after);
const out=path.join(ROOT,'reports/seo/stage-12');fs.mkdirSync(out,{recursive:true});
const hash=text=>createHash('sha256').update(text).digest('hex');
fs.writeFileSync(path.join(out,'HEADING_SOURCE_CHANGE.json'),JSON.stringify({at:new Date().toISOString(),scope:'Only literal h4 tag numbers changed to h3; words, URLs, dates and other source bytes preserved',counts,beforeSHA256:hash(before),afterSHA256:hash(after),backup},null,2));
console.log(JSON.stringify(counts,null,2));
