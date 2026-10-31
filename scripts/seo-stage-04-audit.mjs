import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { DIST, REPORTS, SITE, publicPaths, privatePaths, redirects, startStaticServer, launchChromium, blockExternalTraffic, readSeo, seoFailures } from './seo-runtime.mjs';

fs.mkdirSync(path.join(REPORTS, 'EVIDENCE'), { recursive: true });
const startedAt = new Date().toISOString();
const paths = publicPaths(), server = await startStaticServer(), browser = await launchChromium();
const rows = [], failures = [], journeys = [], pageErrors = [], assets = new Map();
function check(label, predicate) { if (!predicate) failures.push(label); }
function extract(html) {
  const document = new JSDOM(html).window.document;
  const contents = (selector, attr = 'content') => [...document.querySelectorAll(selector)].map(node => node.getAttribute(attr) || '');
  const primary = document.querySelector('main') || document.querySelector('article') || document.getElementById('root');
  return { title: document.title, titleCount: document.querySelectorAll('title').length, descriptions: contents('meta[name="description"]'), canonicals: contents('link[rel="canonical"]', 'href'), robots: contents('meta[name="robots"]'), googlebot: contents('meta[name="googlebot"]'), h1: [...document.querySelectorAll('h1')].map(node => node.textContent.trim().replace(/\s+/g, ' ')), hreflang: [...document.querySelectorAll('link[hreflang]')].map(node => ({ lang: node.getAttribute('hreflang'), href: node.getAttribute('href') })), schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => ({ id: node.id, json: node.textContent })), og: [...document.querySelectorAll('meta[property^="og:"]')].map(node => ({ name: node.getAttribute('property'), value: node.getAttribute('content') })), twitter: [...document.querySelectorAll('meta[name^="twitter:"]')].map(node => ({ name: node.getAttribute('name'), value: node.getAttribute('content') })), primaryWords: (primary?.textContent || '').trim().split(/\s+/).filter(Boolean).length, links: [...document.querySelectorAll('a[href]')].map(node => ({ href: node.getAttribute('href'), text: node.textContent.trim().slice(0, 100) })) };
}
function comparable(data) { return { title: data.title, descriptions: data.descriptions, canonicals: data.canonicals, robots: data.robots, h1: data.h1, hreflang: data.hreflang, schema: data.schema.map(item => JSON.parse(item.json)), og: data.og }; }
function csv(name, data) {
  const keys = Object.keys(data[0] || {}), q = value => '"' + String(typeof value === 'object' ? JSON.stringify(value) : value ?? '').replaceAll('"', '""') + '"';
  fs.writeFileSync(path.join(REPORTS, name), [keys.map(q).join(','), ...data.map(row => keys.map(key => q(row[key])).join(','))].join('\r\n'));
}
try {
  const raw = new Map();
  for (const pathname of paths) {
    const response = await fetch(server.base + pathname), html = await response.text(), data = extract(html);
    const issues = seoFailures(data, pathname);
    check('raw HTTP ' + pathname, response.status === 200); issues.forEach(issue => failures.push(`raw ${pathname}: ${issue}`));
    raw.set(pathname, data); rows.push({ mode: 'raw-http', path: pathname, status: response.status, ...data, issues });
    for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)[^"]*"/g)) assets.set(match[1], null);
  }
  for (const asset of assets.keys()) { const response = await fetch(server.base + asset, { method: 'HEAD' }); assets.set(asset, response.status); check('asset ' + asset, response.status === 200); }
  for (const [mode, options] of [['no-js', { javaScriptEnabled: false, viewport: { width: 1365, height: 900 } }], ['desktop', { viewport: { width: 1365, height: 900 } }], ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
    const context = await browser.newContext({ ...options, reducedMotion: 'reduce' });
    await Promise.all([0, 1, 2].map(async worker => {
      const page = await context.newPage(); await blockExternalTraffic(page, server.base);
      page.on('pageerror', error => pageErrors.push({ mode, path: new URL(page.url()).pathname, error: error.message }));
      for (const pathname of paths.filter((_, index) => index % 3 === worker)) {
        try {
          const response = await page.goto(server.base + pathname, { waitUntil: 'domcontentloaded' });
          if (mode !== 'no-js') await page.waitForFunction(route => document.documentElement.dataset.routeReady === route, pathname, { timeout: 15000 });
          const data = await readSeo(page), issues = seoFailures(data, pathname);
          try { assert.deepEqual(comparable(data), comparable(raw.get(pathname))); } catch { issues.push('Raw/DOM metadata or schema differs'); }
          check(mode + ' HTTP ' + pathname, response.status() === 200); issues.forEach(issue => failures.push(`${mode} ${pathname}: ${issue}`));
          rows.push({ mode, path: pathname, status: response.status(), ...data, issues });
          if (['/', '/faq', '/contact', '/software-development', '/uk-services/uk-ltd-formation', '/blog/boi-report-filing-guide-2026'].includes(pathname)) await page.screenshot({ path: path.join(REPORTS, 'EVIDENCE', `${mode}-${pathname.replace(/\W+/g, '_') || 'home'}.png`), fullPage: false });
        } catch (error) { failures.push(`${mode} ${pathname}: ${error.message}`); }
      }
      await page.close();
    }));
    await context.close(); console.log(`${mode}: ${rows.filter(row => row.mode === mode).length}/${paths.length} captured`);
  }
  for (const pathname of privatePaths()) {
    const response = await fetch(server.base + pathname), html = await response.text();
    check('private status ' + pathname, response.status === 200); check('private noindex ' + pathname, /noindex/.test(extract(html).robots.join(',')) && /noindex/.test(response.headers.get('x-robots-tag')));
  }
  for (const [from, to] of Object.entries(redirects)) {
    const response = await fetch(server.base + from, { redirect: 'manual' }); check('redirect ' + from, response.status === 308 && response.headers.get('location') === to);
  }
  for (const pathname of ['/definitely-missing-audit-page', '/blog/not-a-real-post', '/uk-services/not-a-service']) {
    const response = await fetch(server.base + pathname); check('missing HTTP ' + pathname, response.status === 404); check('missing noindex ' + pathname, /noindex/.test(extract(await response.text()).robots.join(',')));
  }
  const page = await browser.newPage({ reducedMotion: 'reduce' }); await blockExternalTraffic(page, server.base);
  await page.goto(server.base + '/blog/boi-report-filing-guide-2026'); await page.waitForFunction(() => document.documentElement.dataset.routeReady === location.pathname);
  for (const pathname of ['/contact', '/uk-services/uk-ltd-formation', '/faq', '/']) {
    const link = page.locator(`a[href="${pathname}"]`).first(); await link.evaluate(element => element.click());
    await page.waitForFunction(route => location.pathname === route && document.documentElement.dataset.routeReady === route, pathname);
    const data = await readSeo(page), issues = seoFailures(data, pathname); issues.forEach(issue => failures.push(`SPA ${pathname}: ${issue}`));
    if (pathname === '/contact') check('no stale BlogPosting on contact', !data.schema.some(item => item.json.includes('BlogPosting')));
    journeys.push({ kind: 'internal-link', path: pathname, issues });
  }
  await page.goBack(); await page.waitForFunction(() => location.pathname === '/faq' && document.documentElement.dataset.routeReady === '/faq');
  journeys.push({ kind: 'back', path: '/faq', issues: seoFailures(await readSeo(page), '/faq') });
  await page.goForward(); await page.waitForFunction(() => location.pathname === '/' && document.documentElement.dataset.routeReady === '/');
  journeys.push({ kind: 'forward', path: '/', issues: seoFailures(await readSeo(page), '/') });
  await page.close();
} catch (error) { failures.push('Audit interruption: ' + error.message); }
finally { await browser.close(); await server.close(); }
for (const error of pageErrors) failures.push(`${error.mode} ${error.path}: runtime ${error.error}`);
for (const journey of journeys) for (const issue of journey.issues) failures.push(`${journey.kind} ${journey.path}: ${issue}`);
const output = { startedAt, finishedAt: new Date().toISOString(), scope: 'LOCAL Vercel routing model, not deployed Vercel proof', routes: paths.length, expectedCaptures: paths.length * 4, captures: rows.length, failures, pageErrors, journeys, assets: Object.fromEntries(assets), rows, externalNetwork: 'Blocked; no customer/analytics writes', deployment: 'NOT DEPLOYED' };
fs.writeFileSync(path.join(REPORTS, 'four-mode-audit.json'), JSON.stringify(output, null, 2));
csv('RAW_VS_RENDERED_AUDIT.csv', rows.map(({ mode, path, status, title, descriptions, h1, canonicals, robots, primaryWords, issues }) => ({ mode, path, status, title, descriptions, h1, canonicals, robots, primaryWords, issues })));
csv('METADATA_SCHEMA_AUDIT.csv', rows.map(({ mode, path, title, descriptions, h1, canonicals, robots, hreflang, schema, og, issues }) => ({ mode, path, title, descriptions, h1, canonicals, robots, hreflang, schema, og, issues })));
csv('ROUTE_INVENTORY.csv', paths.map(path => ({ path, canonical: SITE + path, intent: 'indexable', sitemap: true, localStatus: rows.find(row => row.path === path && row.mode === 'raw-http')?.status })));
console.log(JSON.stringify({ captures: rows.length, routes: paths.length, failures: failures.length, firstFailures: failures.slice(0, 12), pageErrors: pageErrors.length }));
if (failures.length || rows.length !== paths.length * 4) process.exitCode = 1;
