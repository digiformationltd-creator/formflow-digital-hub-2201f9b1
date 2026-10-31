import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SITE, publicPaths, privatePaths, redirects } from './seo-runtime.mjs';
const out = path.join(ROOT, 'audit/phase-06'); fs.mkdirSync(out, { recursive: true });
const write = (name, data) => fs.writeFileSync(path.join(out, name), typeof data === 'string' ? data : JSON.stringify(data, null, 2));
const csv = (name, data) => { const columns = Object.keys(data[0] || {}), q = value => '"' + String(value ?? '').replaceAll('"', '""') + '"'; write(name, [columns.map(q).join(','), ...data.map(row => columns.map(c => q(row[c])).join(','))].join('\r\n')); };
const sitemap = fs.readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8'), robots = fs.readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf8');
const paths = publicPaths(), known = new Set(paths), privateSet = new Set(privatePaths());
const crawl = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/seo-stage-04/four-mode-audit.json'), 'utf8'));
const raw = crawl.rows.filter(row => row.mode === 'raw-http');
const failures = [], privatePathsToTest = ['/admin', '/dashboard', '/auth', '/reset-password', '/client-area'];
const groups = [];
let current = { agents: [], rules: [] };
for (const line of robots.split(/\r?\n/)) {
  const text = line.replace(/#.*/, '').trim();
  if (!text) { if (current.agents.length && current.rules.length) { groups.push(current); current = { agents: [], rules: [] }; } continue; }
  const colon = text.indexOf(':'), key = text.slice(0, colon).toLowerCase(), value = text.slice(colon + 1).trim();
  if (key === 'user-agent') current.agents.push(value.toLowerCase());
  else if (key === 'allow' || key === 'disallow') current.rules.push({ allow: key === 'allow', prefix: value });
}
if (current.agents.length) groups.push(current);
function allowed(agent, pathname) {
  const exact = groups.filter(group => group.agents.some(name => name !== '*' && agent.toLowerCase().includes(name)));
  const selected = exact.length ? exact : groups.filter(group => group.agents.includes('*'));
  const matches = selected.flatMap(group => group.rules).filter(rule => rule.prefix && pathname.startsWith(rule.prefix)).sort((a, b) => b.prefix.length - a.prefix.length || Number(b.allow) - Number(a.allow));
  return matches[0]?.allow ?? true;
}
const robotsTests = [];
for (const agent of ['Googlebot', 'Bingbot', 'GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'AhrefsBot', 'SemrushBot']) {
  for (const pathname of paths) { const pass = allowed(agent, pathname); robotsTests.push({ agent, pathname, expected: 'allowed', pass }); if (!pass) failures.push(`${agent} blocks public ${pathname}`); }
  for (const pathname of privatePathsToTest) { const pass = !allowed(agent, pathname); robotsTests.push({ agent, pathname, expected: 'disallowed', pass }); if (!pass) failures.push(`${agent} private policy mismatch ${pathname}`); }
}
if (new Set(paths).size !== paths.length) failures.push('Duplicate sitemap URLs');
if (paths.some(pathname => privateSet.has(pathname) || redirects[pathname])) failures.push('Private/redirect URL in sitemap');
if (!robots.includes('Sitemap: ' + SITE + '/sitemap.xml')) failures.push('Sitemap discovery missing');
if (crawl.routes !== paths.length || raw.length !== paths.length) failures.push('Source inventory and latest local crawl differ; rerun after build');
const graph = new Map(paths.map(pathname => [pathname, new Set()])), inbound = new Map(paths.map(pathname => [pathname, 0])), links = [];
for (const row of raw) for (const link of row.links) {
  if (!link.href || /^(#|mailto:|tel:|javascript:)/i.test(link.href)) continue;
  let url; try { url = new URL(link.href, SITE + row.path); } catch { continue; }
  if (url.origin !== SITE) continue;
  const target = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
  const state = known.has(target) ? 'public' : privateSet.has(target) || target.startsWith('/admin/') ? 'private/noindex' : redirects[target] ? 'redirect' : 'UNKNOWN';
  links.push({ from: row.path, to: target, href: link.href, anchor: link.text, state });
  if (state === 'public') { graph.get(row.path)?.add(target); inbound.set(target, inbound.get(target) + 1); }
  if (state === 'UNKNOWN') failures.push(`Unknown internal link ${row.path} -> ${target}`);
}
const depth = new Map([['/', 0]]), queue = ['/'];
for (let i = 0; i < queue.length; i++) for (const next of graph.get(queue[i]) || []) if (!depth.has(next)) { depth.set(next, depth.get(queue[i]) + 1); queue.push(next); }
const inventory = paths.map(pathname => ({ path: pathname, category: pathname.startsWith('/blog/') ? 'blog' : pathname.startsWith('/insights/') ? 'insight' : 'public marketing', sitemap: true, localStatus: raw.find(row => row.path === pathname)?.status ?? 'NOT TESTED', canonical: SITE + pathname, depth: depth.get(pathname) ?? 'ORPHAN', inlinks: inbound.get(pathname) ?? 0 }));
const orphan = inventory.filter(row => row.depth === 'ORPHAN');
for (const row of orphan) failures.push('Public route not reachable from homepage: ' + row.path);
for (const [from, to] of Object.entries(redirects)) if (redirects[to] || from === to || !known.has(to)) failures.push(`Redirect chain or nonpublic target: ${from} -> ${to}`);
const result = { at: new Date().toISOString(), scope: 'LOCAL source + saved full four-mode crawl; no live recrawl/submission', sitemapRoutes: paths.length, crawledRoutes: raw.length, robotsCases: robotsTests.length, failures: [...new Set(failures)], orphanCount: orphan.length, internalLinkCount: links.length, maxDepth: Math.max(...depth.values()), live: 'NOT DEPLOYED; production/header variants and webmaster indexing NOT VERIFIED', robotsIsSecurity: false, declaredLastmodProvenance: 'Explicit source dateModified only for regenerated blog section; not an independent editorial date certification' };
write('TECHNICAL_RESULTS.json', result); write('ROBOTS_CASES.json', robotsTests);
csv('URL_INVENTORY.csv', inventory); csv('INTERNAL_LINKS.csv', links); csv('ORPHAN_PAGES.csv', orphan);
csv('CANONICAL_REDIRECT_MATRIX.csv', Object.entries(redirects).map(([from, to]) => ({ variant: from, intended: to, modelStatus: 308, chain: redirects[to] ? 'CHAIN' : 'single', liveStatus: 'NOT VERIFIED' })));
csv('FULL_CRAWL_AFTER.csv', raw.map(row => ({ path: row.path, status: row.status, canonical: row.canonicals.join(';'), robots: row.robots.join(';'), title: row.title, description: row.descriptions.join(';'), h1: row.h1.join(';'), words: row.primaryWords })));
write('PHASE_06_EXECUTIVE_SUMMARY.md', `# Phase06 — partial technical verification\n\nSource inventory ${result.sitemapRoutes}; latest saved raw crawl ${result.crawledRoutes}. Robots cases ${result.robotsCases}; unknown/orphan/redirect checks: ${result.failures.length} findings.\n\nPurane regex ne quoted-property blog records chhor diye thay. AST parser sab records read karta hai. Blog lastmod explicit dateModified se aata hai, build date se nahi. Named crawler groups ab private exclusions ko override nahi karte.\n\nProduction is NOT DEPLOYED. Host/protocol/case/query/cache/CDN production variants, field data and GSC/Bing indexing remain unverified. Do not mark the whole stage complete from these local tests.`);
write('ROBOTS_SITEMAP_VALIDATION.md', '# Robots/sitemap changes\n\nShared named/wildcard group retains public access and existing private exclusions; Ahrefs/Semrush preserve their crawl delay and private exclusions. Robots is not security and disallow is not noindex. Nothing guarantees AI inclusion. Nonstandard Host directive removed; canonical sitemap remains discoverable. Google official sources checked24October2026: https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec and https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap. Bing documentation returned a JS shell; no unverified Bing-specific assertion is made.\n\nTypeScript AST parsing handles quoted/unquoted properties, rejects missing/duplicate/future-date input and uses explicit dateModified without inventing today. Existing non-blog static lastmod still needs a substantive source-history review.');
write('INTERNAL_LINK_ORPHAN_REPORT.md', `# Link graph\n\n${links.length} internal links examined; ${orphan.length} orphan routes; maximum observed depth ${result.maxDepth}. This is saved initial HTML from every public route, not just sitemap membership. Checkout links are classified private/noindex, not redirected or removed. See INTERNAL_LINKS.csv and URL_INVENTORY.csv for anchors/depth.`);
write('TECHNICAL_SEO_DEFECT_REGISTER.md', '# Defects and scope\n\nFIXED LOCALLY: quoted blog records omitted by regex; explicit dateModified ignored; named robots groups overriding private policy.\n\nOPEN: ' + result.failures.join('; ') + '\n\nBLOCKED/NOT TESTED: actual production variants/CDN, real GSC/Bing indexing and complete access-controlled business journeys. No sitemap submission or IndexNow call performed.');
write('REGRESSION_TEST_REPORT.md', '# Regression evidence\n\nnode --test scripts/sitemap.test.mjs: 4 passing parser regression tests. node scripts/phase06-technical.mjs: see TECHNICAL_RESULTS.json and ROBOTS_CASES.json. Four-mode source/render results are in reports/seo-stage-04. Source/crawl count must agree after a new build. Node version and type/lint/unit evidence are in audit/phase-03; backend lint/native gates remain open.');
write('CHANGELOG_AND_RELEASE_PLAN.md', '# Release safety\n\nscripts/sync-sitemap.mjs, new sitemap.test.mjs, public/robots.txt and regenerated public/sitemap.xml changed. No public URLs removed; four existing source posts were added to the advertised inventory. Rollback only these scoped diffs using the pre-fix checkpoint. Rebuild, rerun all local routes and obtain explicit deployment approval before publishing. After deployment, verify host/protocol redirects, robots/sitemap and every canonical URL against the actual Vercel release.');
write('PHASE_06_SCORECARD.md', `# Honest completion status\n\nLocal findings: ${result.failures.length}; source/crawl ${paths.length}/${raw.length}; robots checks ${robotsTests.length}. No /100 score issued while production variants, indexing access, source date certification and full business flows remain open. Local crawlability does not establish search indexing or rankings.`);
console.log(JSON.stringify(result, null, 2));
if (result.failures.length) process.exitCode = 1;
