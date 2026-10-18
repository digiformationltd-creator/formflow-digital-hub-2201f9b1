import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
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
const browser = await chromium.launch({ headless: true, executablePath: process.env.AUDIT_CHROMIUM_PATH || undefined });
const rows = [], images = [], links = new Map(), errors = [];
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
        if (pathname === '/' || pathname === '/contact' || pathname === '/blog') {
          await page.addScriptTag({ path: path.join(root, 'node_modules/axe-core/axe.min.js') });
          const accessibility = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations);
          fs.writeFileSync(path.join(out, `axe-${pathname.replaceAll('/', '') || 'home'}.json`), JSON.stringify(accessibility, null, 2));
        }
        const raw = fs.readFileSync(path.join(dist, pathname === '/' ? 'index.html' : pathname.slice(1) + '/index.html'), 'utf8');
        const rawCanonical = raw.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
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
        rows.push({ path: pathname, http_status: response.status(), raw_canonical: rawCanonical, rendered_title: data.title, rendered_description: data.description, rendered_canonicals: data.canonicals.join('|'), rendered_h1: data.h1.join('|'), rendered_h2: data.h2, rendered_h3: data.h3, schema_count: data.schema.length, hreflang: JSON.stringify(data.hreflang), missing_alt: data.images.filter(x => x.alt === null).length, unnamed_buttons: data.buttonsWithoutNames, duplicate_ids: data.duplicateIds.join('|'), final_status: failures.length ? 'FAIL' : 'PASS', failures: failures.join('; ') });
        console.log(`${rows.length}/${urls.length} ${pathname}: ${failures.join(',') || 'PASS'}`);
      } catch (error) { rows.push({ path: pathname, final_status: 'FAIL', failures: error.message }); console.log(`${rows.length}/${urls.length} ${pathname}: FAIL ${error.message.slice(0,120)}`); }
      finally { await page.close(); }
    }));
  }
  const aliasRows = [];
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
    linkRows.push({ ...link, status: response.status, classification: redirects[pathname] ? 'OBSOLETE_ALIAS' : intentional && response.status === 200 ? 'ACTIVE' : 'MANUAL-VERIFY', notes: target.hash ? 'Anchor requires individual target review' : '' });
  }
  function csv(name, data) {
    const columns = [...new Set(data.flatMap(Object.keys))];
    const quote = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
    fs.writeFileSync(path.join(out, name), [columns.map(quote).join(','), ...data.map(row => columns.map(key => quote(row[key])).join(','))].join('\n'));
  }
  csv('FINAL_RAW_VS_RENDERED_AUDIT.csv', rows);
  csv('FINAL_RENDERED_IMAGE_ALT_AUDIT.csv', images);
  csv('FINAL_ALIAS_REDIRECT_MAP.csv', aliasRows);
  csv('FINAL_RENDERED_INTERNAL_LINKS.csv', linkRows);
  fs.writeFileSync(path.join(out, 'rendered-crawl-evidence.json'), JSON.stringify({ rows, images, links: [...links.values()], errors }, null, 2));
  console.log(JSON.stringify({ crawled: rows.length, failed: rows.filter(x => x.final_status !== 'PASS').length, runtimeErrors: errors.length }));
} finally { await browser.close(); server.close(); }
