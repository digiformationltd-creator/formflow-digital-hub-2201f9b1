import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'reports/final-production-readiness-2026-10-18');
if (process.argv.includes('--all')) {
  const commands = [
    ['types', 'npm.cmd exec tsc -- --noEmit'],
    ['lint', 'npm.cmd run lint'],
    ['tests', 'npm.cmd test -- --run'],
    ['build-and-rendered', 'npm.cmd run build:verified'],
    ['seo', 'npm.cmd run test:seo'],
    ['secrets', 'node scripts/secret-scan.mjs'],
    ['dependencies', 'node scripts/dependency-security-audit.mjs'],
    ['diff', 'git diff --check'],
  ];
  const results = commands.map(([gate, command]) => {
    const result = spawnSync(command, { cwd: root, shell: true, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
    fs.writeFileSync(path.join(out, `gate-${gate}.log`), (result.stdout || '') + (result.stderr || ''));
    console.log(`${gate}: ${result.status === 0 ? 'PASS' : 'FAIL'}`);
    return { gate, exit_code: result.status, status: result.status === 0 ? 'PASS' : 'FAIL' };
  });
  fs.writeFileSync(path.join(out, 'FINAL_COMMAND_GATE.json'), JSON.stringify(results, null, 2));
  process.exit(results.some(r => r.status === 'FAIL') ? 1 : 0);
}
const redirects = JSON.parse(fs.readFileSync(new URL('redirect-map.json', import.meta.url), 'utf8'));
const paths = [...fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x => new URL(x[1]).pathname);
const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
assert.equal(new Set(paths).size, paths.length, 'Duplicate sitemap URL');
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
  const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap(x => { const value = JSON.parse(x.textContent); return Array.isArray(value) ? value : [value]; });
  assert(schemas.length, `No schema ${pathname}`);
  for (const schema of schemas) assert(schema['@type'] || schema['@graph'], `Missing type ${pathname}`);
  rawRows.push({ path: pathname, title: doc.title, description, canonical, h1: doc.querySelector('h1').textContent, status: 'PASS' });
  schemaRows.push({ path: pathname, payloads: schemas.length, types: schemas.flatMap(s => s['@graph']?.map(x => x['@type']) || s['@type']).join('|'), local_status: 'PASS', live_validation: 'LIVE VALIDATION PENDING DEPLOYMENT' });
  dom.window.close();
}
for (const [source,target] of Object.entries(redirects)) { assert(!paths.includes(source), source); assert(paths.includes(target), target); assert(!redirects[target], `Chain ${source}`); }
for (const pathname of ['/uk-services/uk-ltd-formation/checkout', '/uk-services/ltd-id-verification/checkout']) {
  const document = new JSDOM(fs.readFileSync(path.join(root, 'dist', pathname.slice(1), 'index.html'), 'utf8')).window.document;
  assert(!paths.includes(pathname), pathname);
  assert(document.querySelector('meta[name="robots"]')?.content.includes('noindex'), pathname);
  assert(document.querySelector('meta[name="googlebot"]')?.content.includes('noindex'), pathname);
  assert(!redirects[pathname], pathname);
}
const concrete = new Set([...paths, ...Object.keys(redirects), ...routePatterns.filter(p => !/[:*]/.test(p))]);
const classifications = [...concrete].sort().map(p => ({ path: p, classification: redirects[p] ? 'PERMANENT_REDIRECT' : privatePath(p) ? 'PRIVATE_TRANSACTIONAL_NOINDEX' : paths.includes(p) ? 'PUBLIC_INDEXABLE' : 'PUBLIC_ROUTE_REQUIRES_REVIEW', canonical_target: redirects[p] || p, sitemap: paths.includes(p) ? 'yes' : 'no' }));
function csv(name, rows) { const keys = [...new Set(rows.flatMap(Object.keys))], q = x => '"'+String(x ?? '').replaceAll('"','""')+'"'; fs.writeFileSync(path.join(out,name), [keys.map(q).join(','), ...rows.map(r=>keys.map(k=>q(r[k])).join(','))].join('\n')); }
csv('FINAL_URL_CLASSIFICATION.csv', classifications);
csv('FINAL_SCHEMA_VALIDATION.csv', schemaRows);
csv('FINAL_RAW_HTML_REGRESSION.csv', rawRows);
const metrics = { route_patterns: routePatterns.length, concrete_inventory: classifications.length, sitemap_urls: paths.length, raw_pass: rawRows.length, permanent_aliases: Object.keys(redirects).length, classification_counts: classifications.reduce((a,r)=>({...a,[r.classification]:(a[r.classification]||0)+1}),{}) };
const renderedFile = path.join(out, 'rendered-crawl-evidence.json');
if (fs.existsSync(renderedFile)) {
  const rendered = JSON.parse(fs.readFileSync(renderedFile, 'utf8'));
  assert.equal(rendered.rows.length, paths.length, 'Rendered inventory differs from sitemap');
  assert(rendered.rows.every(row => row.final_status === 'PASS' && row.metadata_drift !== 'YES' && !row.duplicate_ids), 'Rendered SEO/drift/ID failure');
  assert.equal(rendered.errors.length, 0, 'JavaScript runtime errors');
  assert(rendered.images.every(image => image.alt !== null), 'Missing rendered image alt');
  const navigation = JSON.parse(fs.readFileSync(path.join(out, 'spa-navigation-evidence.json'), 'utf8'));
  assert(navigation.length >= 6 && navigation.every(row => row.status === 'PASS'), 'SPA navigation regression');
  const privateRoutes = JSON.parse(fs.readFileSync(path.join(out, 'private-route-evidence.json'), 'utf8'));
  assert(privateRoutes.length === 2 && privateRoutes.every(row => row.raw_noindex && row.rendered_noindex && row.no_marketing_redirect && row.sitemap_excluded), 'Private checkout regression');
}
fs.writeFileSync(path.join(out,'FINAL_URL_SET_METRICS.json'), JSON.stringify(metrics,null,2));
console.log(JSON.stringify(metrics));
