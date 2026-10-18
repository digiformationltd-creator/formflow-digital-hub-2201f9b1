import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'reports/final-production-readiness-2026-10-18');
const redirects = JSON.parse(fs.readFileSync(new URL('redirect-map.json', import.meta.url), 'utf8'));
const paths = [...fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x => new URL(x[1]).pathname);
const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
const routePatterns = [...app.matchAll(/<Route path="([^"]+)"/g)].map(x => x[1]);
const privatePath = p => /(?:\/checkout$|^\/(?:auth|reset-password|dashboard|admin|checkout|unsubscribe|client-area)(?:\/|$))/.test(p);
const rawRows = [], schemaRows = [], titles = new Set(), descriptions = new Set();
for (const pathname of paths) {
  assert(!redirects[pathname] && !privatePath(pathname), `Noncanonical sitemap entry ${pathname}`);
  const html = fs.readFileSync(path.join(root, 'dist', pathname === '/' ? 'index.html' : pathname.slice(1) + '/index.html'), 'utf8');
  const dom = new JSDOM(html), doc = dom.window.document;
  const canonical = 'https://www.digiformation.co.uk' + pathname;
  assert.equal(doc.querySelectorAll('link[rel="canonical"]').length, 1, pathname);
  assert.equal(doc.querySelector('link[rel="canonical"]').href, canonical, pathname);
  assert(doc.title && !titles.has(doc.title), `Duplicate/missing raw title ${pathname}`); titles.add(doc.title);
  const description = doc.querySelector('meta[name="description"]')?.content;
  assert(description && !descriptions.has(description), `Duplicate/missing description ${pathname}`); descriptions.add(description);
  assert.equal(doc.querySelectorAll('h1').length, 1, pathname);
  assert(!/noindex/.test(doc.querySelector('meta[name="robots"]')?.content || ''), pathname);
  for (const lang of ['en', 'x-default']) assert.equal(doc.querySelector(`link[hreflang="${lang}"]`)?.href, canonical, pathname);
  const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(x => JSON.parse(x.textContent));
  assert(schemas.length, `No schema ${pathname}`);
  for (const schema of schemas) assert(schema['@type'] || schema['@graph'], `Missing type ${pathname}`);
  rawRows.push({ path: pathname, title: doc.title, description, canonical, h1: doc.querySelector('h1').textContent, status: 'PASS' });
  schemaRows.push({ path: pathname, payloads: schemas.length, types: schemas.flatMap(s => s['@graph']?.map(x => x['@type']) || s['@type']).join('|'), local_status: 'PASS', live_validation: 'LIVE VALIDATION PENDING DEPLOYMENT' });
  dom.window.close();
}
for (const [source,target] of Object.entries(redirects)) { assert(!paths.includes(source), source); assert(paths.includes(target), target); assert(!redirects[target], `Chain ${source}`); }
const concrete = new Set([...paths, ...Object.keys(redirects), ...routePatterns.filter(p => !/[:*]/.test(p))]);
const classifications = [...concrete].sort().map(p => ({ path: p, classification: redirects[p] ? 'PERMANENT_REDIRECT' : privatePath(p) ? 'PRIVATE_TRANSACTIONAL_NOINDEX' : paths.includes(p) ? 'PUBLIC_INDEXABLE' : 'PUBLIC_ROUTE_REQUIRES_REVIEW', canonical_target: redirects[p] || p, sitemap: paths.includes(p) ? 'yes' : 'no' }));
function csv(name, rows) { const keys = [...new Set(rows.flatMap(Object.keys))], q = x => '"'+String(x ?? '').replaceAll('"','""')+'"'; fs.writeFileSync(path.join(out,name), [keys.map(q).join(','), ...rows.map(r=>keys.map(k=>q(r[k])).join(','))].join('\n')); }
csv('FINAL_URL_CLASSIFICATION.csv', classifications);
csv('FINAL_SCHEMA_VALIDATION.csv', schemaRows);
csv('FINAL_RAW_HTML_REGRESSION.csv', rawRows);
const metrics = { route_patterns: routePatterns.length, concrete_inventory: classifications.length, sitemap_urls: paths.length, raw_pass: rawRows.length, permanent_aliases: Object.keys(redirects).length, classification_counts: classifications.reduce((a,r)=>({...a,[r.classification]:(a[r.classification]||0)+1}),{}) };
fs.writeFileSync(path.join(out,'FINAL_URL_SET_METRICS.json'), JSON.stringify(metrics,null,2));
console.log(JSON.stringify(metrics));
