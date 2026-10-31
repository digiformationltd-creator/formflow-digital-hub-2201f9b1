import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SITE } from './seo-runtime.mjs';
import { blogTopicFor } from '../src/data/blogTopics.ts';
import { getBlogPosts } from './sync-sitemap.mjs';
import ts from 'typescript';
const out=path.join(ROOT,'reports/seo/phase-14');fs.mkdirSync(out,{recursive:true});
const write=(name,value)=>fs.writeFileSync(path.join(out,name),value+'\n');
const csv=(name,rows)=>{const keys=Object.keys(rows[0]||{}),q=value=>'"'+String(value??'').replaceAll('"','""')+'"';write(name,[keys.map(q).join(','),...rows.map(row=>keys.map(key=>q(row[key])).join(','))].join('\r\n'));};
const before=JSON.parse(fs.readFileSync(path.join(out,'BASELINE_BUILT_CRAWL.json'))),after=JSON.parse(fs.readFileSync(path.join(ROOT,'reports/seo-stage-04/four-mode-audit.json')));
const raw=after.rows.filter(r=>r.mode==='raw-http'),known=new Set(raw.map(r=>r.path));
const source=ts.createSourceFile('blog.ts',fs.readFileSync(path.join(ROOT,'src/data/blog.ts'),'utf8'),ts.ScriptTarget.Latest,true),categories=new Map();
for(const statement of source.statements)if(ts.isVariableStatement(statement))for(const declaration of statement.declarationList.declarations)if(declaration.name.getText(source)==='blogPosts')for(const post of declaration.initializer.elements){const value=key=>post.properties.find(p=>(ts.isIdentifier(p.name)||ts.isStringLiteral(p.name))&&p.name.text===key)?.initializer.text;categories.set(value('slug'),value('category'));}
function graph(crawl){
  const rows=crawl.rows.filter(r=>r.mode==='raw-http'),paths=new Set(rows.map(r=>r.path)),edges=new Map(),inlinks=new Map(rows.map(r=>[r.path,new Set()]));
  for(const row of rows){const targets=new Set();for(const link of row.links){try{const url=new URL(link.href,SITE+row.path);if(url.origin===SITE&&paths.has(url.pathname)&&url.pathname!==row.path)targets.add(url.pathname);}catch{}}
    edges.set(row.path,targets);for(const target of targets)inlinks.get(target).add(row.path);
  }
  const depth=new Map([['/',0]]),queue=['/'];for(let i=0;i<queue.length;i++)for(const target of edges.get(queue[i])||[])if(!depth.has(target)){depth.set(target,depth.get(queue[i])+1);queue.push(target);}
  return {edges,inlinks,depth};
}
const old=graph(before),current=graph(after),failures=[];
const clusters=raw.map(row=>{
  let topic;
  if(row.path.startsWith('/blog/'))topic=blogTopicFor({slug:row.path.slice(6),category:categories.get(row.path.slice(6))||''});
  else if(row.path.startsWith('/usa-services'))topic={id:'us-formation',title:'US company services',pillar:'/usa-services/us-llc-formation',links:[]};
  else if(row.path.startsWith('/uk-compliance')||row.path.startsWith('/uk-company-services'))topic={id:'uk-compliance',title:'UK company filings',pillar:'/uk-compliance',links:[]};
  else if(row.path.startsWith('/uk-services'))topic={id:'uk-formation',title:'UK company services',pillar:'/uk-services/uk-ltd-formation',links:[]};
  else if(row.path.startsWith('/banks-payment-solutions'))topic={id:'payments',title:'Banking and payment applications',pillar:'/banks-payment-solutions',links:[]};
  else if(row.path==='/software-development')topic={id:'software',title:'Software and automation',pillar:row.path,links:[]};
  else if(row.path==='/web-development')topic={id:'web',title:'Websites and e-commerce',pillar:row.path,links:[]};
  else topic={id:'core-resources',title:'Company information and resources',pillar:row.path,links:[]};
  for(const link of topic.links)if(!known.has(link.path))failures.push('Unmapped target '+link.path);
  return {URL:SITE+row.path,cluster:topic.id,pillar:SITE+topic.pillar,topic:topic.title,intent:'Editorial classification; query demand unverified',evidence:'Current route/content category; not a country-demand dataset',plannedContextLinks:topic.links.map(l=>l.path).join('; ')};
});
csv('TOPIC_CLUSTER_MAP.csv',clusters);
csv('URL_CONTENT_INVENTORY.csv',raw.map(r=>({URL:SITE+r.path,status:r.status,canonical:r.canonicals[0],title:r.title,H1:r.h1[0],initialWords:r.primaryWords,depth:current.depth.get(r.path)??'UNREACHABLE',inlinks:current.inlinks.get(r.path).size,outlinks:current.edges.get(r.path).size,scope:'Latest local built crawl'})));
csv('INTERNAL_LINK_AUDIT_BEFORE_AFTER.csv',raw.map(r=>({path:r.path,beforeInlinks:old.inlinks.get(r.path)?.size??'NOT CAPTURED',afterInlinks:current.inlinks.get(r.path).size,beforeOutlinks:old.edges.get(r.path)?.size??'NOT CAPTURED',afterOutlinks:current.edges.get(r.path).size,beforeDepth:old.depth.get(r.path)??'UNREACHABLE',afterDepth:current.depth.get(r.path)??'UNREACHABLE',orphan:r.path!=='/'&&!current.inlinks.get(r.path).size})));
const words=text=>new Set(text.toLowerCase().match(/[a-z]{3,}/g)||[]),overlaps=[];
for(let i=0;i<raw.length;i++)for(let j=i+1;j<raw.length;j++){
  const a=words(raw[i].title),b=words(raw[j].title),intersection=[...a].filter(w=>b.has(w)).length,union=new Set([...a,...b]).size,similarity=intersection/(union||1);
  if(similarity>=0.65)overlaps.push({first:SITE+raw[i].path,second:SITE+raw[j].path,titleTokenJaccard:similarity.toFixed(3),finding:'Editorial overlap signal; not verified query cannibalization',action:'REVIEW; no merge/redirect/noindex applied',equityRisk:'GSC/backlinks unavailable'});
}
csv('CANNIBALISATION_MATRIX.csv',overlaps);
const orphanCount=raw.filter(r=>r.path!=='/'&&!current.inlinks.get(r.path).size).length;
if(orphanCount)failures.push('Public orphans: '+orphanCount);
const result={at:new Date().toISOString(),state:'PARTIAL — local relevance architecture implemented; demand/content review open',URLCount:raw.length,blogCount:getBlogPosts().length,clusters:[...new Set(clusters.map(r=>r.cluster))],beforeCrawl:before.startedAt,afterCrawl:after.startedAt,orphanCount,maxDepth:Math.max(...current.depth.values()),failures,overlapSignals:overlaps.length,live:'NOT DEPLOYED BY THIS AGENT'};
write('TOPICAL_RESULTS.json',JSON.stringify(result,null,2));
write('PHASE14_EXECUTIVE_SUMMARY.md',`# Topical linking — PARTIAL\n\n${raw.length} local URLs mapped;51 blogs use explicit editorial topic rules. Generic seven-link sales lists and unrelated fallback articles replaced with relevant canonical topic links and same-cluster related articles. No prices/eligibility promises inserted. Current orphan count${orphanCount}; maximum crawl depth${result.maxDepth}.\n\nCountry demand and query-level cannibalization are not verified. No merge, redirect, deletion or new geo page. Source changes require the latest completed build/crawl and journey evidence.`);
write('TOPICAL_TAXONOMY.md','# Taxonomy\n\nUK formation → UK formation/identity/address information; UK filings → UK compliance/code hub; US formation/BOI/EIN → US LLC/EIN; provider/banking/payment content → relevant provider/pillar; e-commerce/web/motion/performance → web development; software/open-source/AI → software development; founder story → company information. Editorial relevance is not verified legal availability or searcher-country demand.');
write('LINK_IMPLEMENTATION_PLAN.md','# Implementation\n\nBlogPost uses blogTopics.ts for1–3 justified contextual links, plus contact. Related articles share a topic and never include the current article or unrelated padding. UK versus US filing regimes are separated. Unknown future categories fall back to the blog hub pending editorial classification. Ordinary Link components render anchor hrefs. No public discovery links to private checkout. Unit tests verify all51 articles against current sitemap, unique canonical targets and regime separation.');
write('CONTENT_BRIEFS_AND_90_DAY_PLAN.md','# Conditional editorial sequence\n\nDays1–30: correct/qualify confirmed factual errors, verify actual offers/permissions and review current high-risk articles. Days31–60: improve existing service explanations, source/author accountability and relevant guide links. Days61–90: evaluate verified query/page data and user questions before drafting genuinely missing content. Owner/expert evidence and analytics gate dependent tasks; no ranking deadline guaranteed.');
write('QA_TEST_RESULTS.md','# Verification\n\nCommands: Vitest blog-topics.test.ts; full typecheck/lint/tests/build; complete four-mode crawl; phase06 technical crawl; phase14-topical-audit.mjs; topic-journey browser checks. Missing browser journey evidence is NOT TESTED. Node source-mapping checks alone are not rendered-link proof. Baseline is the last built pre-topic-module crawl, captured after source planning began; no pre-edit readiness score was issued.');
write('CHANGED_FILES_AND_ROLLBACK.md','# Changes\n\nsrc/data/blogTopics.ts, BlogPost.tsx and blog-topics.test.ts. Preserve stage13 publisher/correction links, article source edits and user commits. Revert only the topic navigation/module changes if needed; do not reset the checkout or restore an entire old blog file.');
write('OPEN_ISSUES_AND_APPROVALS.md','# Open\n\nQuery intent/demand, equity/backlinks, actual cannibalization, per-article relevance review and full production comparison remain open. No external links/outreach, domain settings, purchase, public page or deployment performed. Source authorizes independent local work; external publication still requires approval.');
write('PHASE14_READINESS_SCORECARD.md','# Rubric and limits\n\nImplementation checks: URL coverage, canonical/public link integrity, relevance rules, orphan/depth protection, related-link self exclusion, raw/rendered parity, mobile/accessibility and regression/journey checks. Report tested denominators separately from demand/claim/equity review. Rubric documentation followed the initial source patch; no invented before-score or overall100/100 is issued.');
console.log(JSON.stringify(result,null,2));if(failures.length)process.exitCode=1;
