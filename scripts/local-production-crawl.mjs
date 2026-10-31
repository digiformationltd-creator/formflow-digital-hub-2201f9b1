import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const out = path.join(root, 'reports/final-production-readiness-2026-10-18');
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json')('playwright')); }
const redirects = JSON.parse(fs.readFileSync(new URL('redirect-map.json', import.meta.url), 'utf8'));
const urls = [...fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (redirects[pathname]) { res.writeHead(308, { Location: redirects[pathname] }); res.end(); return; }
  let file = path.join(dist, pathname);
  if (!file.startsWith(dist)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) file = path.join(dist, 'index.html');
  const contentType = mime[path.extname(file)] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache');
  const data = fs.readFileSync(file);
  if (/html|javascript|css|json|svg/.test(contentType) && /gzip/.test(req.headers['accept-encoding'] || '')) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    res.end(gzipSync(data));
  } else res.end(data);
});
await new Promise(resolve => server.listen(4175, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:4175';
if (process.env.AUDIT_SERVE_ONLY === '1') {
  console.log(base);
  await new Promise(() => {});
}
let executablePath = process.env.AUDIT_CHROMIUM_PATH;
if (!executablePath && !fs.existsSync(chromium.executablePath()) && process.env.LOCALAPPDATA) {
  const cache = path.join(process.env.LOCALAPPDATA, 'ms-playwright');
  if (fs.existsSync(cache)) executablePath = fs.readdirSync(cache).filter(x => x.startsWith('chromium_headless_shell-')).sort((a,b) => b.localeCompare(a, undefined, { numeric: true })).map(x => path.join(cache, x, 'chrome-headless-shell-win64/chrome-headless-shell.exe')).find(x => fs.existsSync(x));
}
const browser = await chromium.launch({ headless: true, executablePath });
const rows = [], images = [], links = new Map(), errors = [];
const snapshot = process.argv.includes('--snapshot');
const backup = path.join(root, '.audit-artifacts', 'raw-shells-' + new Date().toISOString().replaceAll(':', '-'));
try {
  for (let i = 0; i < urls.length; i += 3) {
    await Promise.all(urls.slice(i, i + 3).map(async pathname => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
      // Prevent audit visits from producing real analytics/database writes.
      await page.route('**/*', route => {
        const url = route.request().url();
        if (/supabase\.co|google-analytics|googletagmanager|facebook\.net/.test(url)) return route.abort();
        return route.continue();
      });
      page.on('pageerror', error => errors.push({ path: pathname, error: error.message }));
      try {
        const response = await page.goto(base + pathname, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForFunction(() => !document.querySelector('[data-seo-prerender]') && document.querySelector('h1'), null, { timeout: 10000 });
        await page.waitForTimeout(300);
        const data = await page.evaluate(() => ({
          title: document.title, description: document.querySelector('meta[name="description"]')?.content || '',
          canonicals: [...document.querySelectorAll('link[rel="canonical"]')].map(x => x.href),
          robots: document.querySelector('meta[name="robots"]')?.content || '',
          hreflang: [...document.querySelectorAll('link[hreflang]')].map(x => ({ lang: x.hreflang, href: x.href })),
          h1: [...document.querySelectorAll('h1')].map(x => x.textContent.trim()), h2: document.querySelectorAll('h2').length, h3: document.querySelectorAll('h3').length,
          schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map(x => x.textContent),
          images: [...document.images].map(x => ({ src: x.currentSrc || x.src, alt: x.getAttribute('alt'), loading: x.loading, complete: x.complete })),
          links: [...document.querySelectorAll('a[href]')].map(x => ({ href: x.getAttribute('href'), text: x.textContent.trim().slice(0, 100) })),
          duplicateIds: [...document.querySelectorAll('[id]')].map(x => x.id).filter((x,i,a) => a.indexOf(x) !== i),
          buttonsWithoutNames: [...document.querySelectorAll('button')].filter(x => !x.textContent.trim() && !x.getAttribute('aria-label') && !x.getAttribute('aria-labelledby')).length,
        }));
        if (['/', '/contact', '/blog', '/uk-services/uk-ltd-formation', '/usa-services/us-llc-formation', '/banks-payment-solutions/stripe', '/software-development', '/blog/boi-report-filing-guide-2026'].includes(pathname)) {
          const axeScript = await page.addScriptTag({ path: path.join(root, 'node_modules/axe-core/axe.min.js') });
          const accessibility = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations);
          fs.writeFileSync(path.join(out, `axe-${pathname.replaceAll('/', '') || 'home'}.json`), JSON.stringify(accessibility, null, 2));
          await axeScript.evaluate(script => script.remove());
          await page.keyboard.press('Tab');
          const firstFocus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim().slice(0,100), href: document.activeElement?.getAttribute('href') }));
          if (firstFocus.href === '#main-content') await page.keyboard.press('Enter');
          const mainFocused = await page.evaluate(() => document.activeElement?.id === 'main-content');
          fs.writeFileSync(path.join(out, `keyboard-${pathname.replaceAll('/', '') || 'home'}.json`), JSON.stringify({ path: pathname, firstFocus, mainFocused }, null, 2));
        }
        const routeFile = pathname === '/' ? 'index.html' : pathname.slice(1) + '/index.html';
        if (snapshot) {
          const backupFile = path.join(backup, routeFile);
          fs.mkdirSync(path.dirname(backupFile), { recursive: true });
          fs.copyFileSync(path.join(dist, routeFile), backupFile);
          fs.writeFileSync(path.join(dist, routeFile), await page.content());
        }
        const raw = fs.readFileSync(path.join(dist, routeFile), 'utf8');
        const rawCanonical = raw.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
        const rawValues = await page.evaluate(html => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          return { title: doc.title, description: doc.querySelector('meta[name="description"]')?.content || '', h1: doc.querySelector('h1')?.textContent.trim() || '' };
        }, raw);
        const expected = 'https://www.digiformation.co.uk' + pathname;
        const failures = [];
        if (response.status() !== 200) failures.push('HTTP');
        if (!data.title || !data.description || data.h1.length !== 1) failures.push('metadata/H1');
        if (data.canonicals.length !== 1 || data.canonicals[0] !== expected) failures.push('rendered canonical');
        if (rawCanonical !== expected) failures.push('raw canonical');
        if (/noindex/.test(data.robots)) failures.push('noindex');
        for (const payload of data.schema) { try { JSON.parse(payload); } catch { failures.push('JSON-LD'); } }
        for (const image of data.images) images.push({ path: pathname, ...image, status: image.alt === null ? 'FAIL' : image.alt === '' ? 'DECORATIVE/REVIEW' : 'PASS' });
        for (const link of data.links) if (link.href) links.set(link.href, { href: link.href, from: pathname, text: link.text });
        rows.push({ path: pathname, http_status: response.status(), raw_canonical: rawCanonical, raw_title: rawValues.title, raw_description: rawValues.description, raw_h1: rawValues.h1, metadata_drift: rawValues.title !== data.title || rawValues.description !== data.description || rawValues.h1 !== data.h1.join('|') ? 'YES' : 'NO', rendered_title: data.title, rendered_description: data.description, rendered_canonicals: data.canonicals.join('|'), rendered_h1: data.h1.join('|'), rendered_h2: data.h2, rendered_h3: data.h3, schema_count: data.schema.length, hreflang: JSON.stringify(data.hreflang), missing_alt: data.images.filter(x => x.alt === null).length, unnamed_buttons: data.buttonsWithoutNames, duplicate_ids: data.duplicateIds.join('|'), final_status: failures.length ? 'FAIL' : 'PASS', failures: failures.join('; ') });
        console.log(`${rows.length}/${urls.length} ${pathname}: ${failures.join(',') || 'PASS'}`);
      } catch (error) { rows.push({ path: pathname, final_status: 'FAIL', failures: error.message }); console.log(`${rows.length}/${urls.length} ${pathname}: FAIL ${error.message.slice(0,120)}`); }
      finally { await page.close(); }
    }));
  }
  const aliasRows = [];
  const navigation = await browser.newPage();
  await navigation.route('**/*', route => /supabase\.co|google-analytics|googletagmanager/.test(route.request().url()) ? route.abort() : route.continue());
  await navigation.goto(base, { waitUntil: 'domcontentloaded' });
  const navigationRows = [];
  for (const pathname of ['/blog/boi-report-filing-guide-2026', '/insights/uk-company-formation-cost-index-2026', '/contact', '/usa-services/ein-number', '/uk-services/uk-ltd-formation', '/']) {
    await navigation.evaluate(p => { history.pushState({}, '', p); dispatchEvent(new PopStateEvent('popstate')); }, pathname);
    await navigation.waitForFunction(p => document.querySelector('link[rel="canonical"]')?.getAttribute('href') === 'https://www.digiformation.co.uk' + p, pathname);
    await navigation.waitForTimeout(500);
    const result = await navigation.evaluate(p => ({ path: p, canonical: document.querySelector('link[rel="canonical"]')?.href, hreflang: [...document.querySelectorAll('link[hreflang]')].every(x => x.href === 'https://www.digiformation.co.uk' + p), article: document.getElementById('ldjson-page')?.textContent || '', ids: [...document.querySelectorAll('script[id][type="application/ld+json"]')].map(x => x.id) }), pathname);
    result.status = result.hreflang && new Set(result.ids).size === result.ids.length && (pathname.startsWith('/blog/') || !result.article.includes('BlogPosting')) ? 'PASS' : 'FAIL';
    navigationRows.push(result);
  }
  const privateRows = [];
  for (const pathname of ['/uk-services/uk-ltd-formation/checkout?jurisdiction=EW&package=Silver', '/uk-services/ltd-id-verification/checkout']) {
    await navigation.goto(base + pathname, { waitUntil: 'domcontentloaded' });
    await navigation.waitForFunction(() => document.querySelector('meta[name="robots"]')?.content.includes('noindex'));
    const raw = await (await fetch(base + pathname)).text();
    privateRows.push({ path: pathname, raw_noindex: /name="robots" content="noindex/.test(raw), rendered_noindex: true, no_marketing_redirect: navigation.url().includes(pathname.split('?')[0]), sitemap_excluded: !urls.includes(pathname.split('?')[0]) });
  }
  await navigation.close();
  fs.writeFileSync(path.join(out, 'spa-navigation-evidence.json'), JSON.stringify(navigationRows, null, 2));
  fs.writeFileSync(path.join(out, 'private-route-evidence.json'), JSON.stringify(privateRows, null, 2));
  for (const [source, target] of Object.entries(redirects)) {
    const response = await fetch(base + source, { redirect: 'manual' });
    const targetResponse = await fetch(base + target, { redirect: 'manual' });
    aliasRows.push({ old_url: source, target_url: target, previous_status: 'unverified alias', redirect_status: response.status, hops: 1, sitemap_status: urls.includes(source) ? 'FAIL' : 'excluded', internal_links_found: links.has(source) ? 1 : 0, final_status: response.status === 308 && targetResponse.status === 200 && !redirects[target] && !urls.includes(source) && !links.has(source) ? 'PASS' : 'FAIL' });
  }
  const linkRows = [];
  for (const link of links.values()) {
    if (!link.href.startsWith('/') || link.href.startsWith('//')) continue;
    const target = new URL(link.href, base);
    const response = await fetch(target, { redirect: 'manual' });
    const pathname = target.pathname;
    const intentional = urls.includes(pathname) || Object.keys(redirects).includes(pathname) || /checkout|choose-state|choose-jurisdiction|^\/auth|^\/dashboard|^\/client-area|^\/admin/.test(pathname);
    let anchorValid = true;
    if (target.hash) {
      const document = new JSDOM(await response.text()).window.document;
      const id = decodeURIComponent(target.hash.slice(1));
      anchorValid = Boolean(document.getElementById(id) || [...document.getElementsByName(id)].length);
    } else await response.body?.cancel();
    linkRows.push({ ...link, status: response.status, classification: !anchorValid ? 'BROKEN_ANCHOR' : redirects[pathname] ? 'OBSOLETE_ALIAS' : intentional && response.status === 200 ? 'ACTIVE' : 'MANUAL-VERIFY', notes: target.hash ? anchorValid ? 'Anchor exists in final static HTML' : 'Target anchor missing' : '' });
  }
  function csv(name, data) {
    const columns = [...new Set(data.flatMap(Object.keys))];
    const quote = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
    fs.writeFileSync(path.join(out, name), [columns.map(quote).join(','), ...data.map(row => columns.map(key => quote(row[key])).join(','))].join('\n'));
  }
  csv('FINAL_RAW_VS_RENDERED_AUDIT.csv', rows);
  csv('FINAL_RENDERED_IMAGE_ALT_AUDIT.csv', images);
  const originalLegacy = new Set(['/uk-services/utr-number', '/ltd-formation-services', '/ltd-formation-services/uk-ltd-formation', '/ltd-formation-services/ltd-id-verification', '/ltd-formation/ltd-id-verification', '/ltd-formation-services/registered-office-address', '/ltd-formation-services/utr-codes']);
  csv('FINAL_ALIAS_REDIRECT_MAP.csv', aliasRows.filter(row => originalLegacy.has(row.old_url)));
  csv('FINAL_ALL_REDIRECTS.csv', aliasRows);
  csv('FINAL_RENDERED_INTERNAL_LINKS.csv', linkRows);
  fs.writeFileSync(path.join(out, 'rendered-crawl-evidence.json'), JSON.stringify({ rows, images, links: [...links.values()], errors }, null, 2));
  if (snapshot) fs.writeFileSync(path.join(out, 'snapshot-backup-location.json'), JSON.stringify({ backup, pages: rows.length, timestamp: new Date().toISOString() }, null, 2));
  console.log(JSON.stringify({ crawled: rows.length, failed: rows.filter(x => x.final_status !== 'PASS').length, runtimeErrors: errors.length }));
} finally { await browser.close(); server.close(); }
