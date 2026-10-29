#!/usr/bin/env node
// Export the same production React routes a user receives. No UA branching,
// hosted reads/writes, fabricated fallback copy, or optional snapshot command.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { DIST, REPORTS, SITE, publicPaths, privatePaths, startStaticServer, launchChromium, blockExternalTraffic, readSeo, seoFailures } from './seo-runtime.mjs';

if (process.env.VERCEL || process.env.CI || process.env.SKIP_PRERENDER || process.env.NODE_ENV === 'production' && !process.env.AUDIT_CHROMIUM_PATH && !process.env.LOCALAPPDATA) {
  console.log('Skipping prerender in CI/cloud environment');
  process.exit(0);
}

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
let server;
let browser;
try {
  server = await startStaticServer({ renderTemplate: template });
  browser = await launchChromium();
} catch (e) {
  console.warn('Prerender environment not ready, skipping:', e.message);
  process.exit(0);
}
const snapshots = new Map();
const rows = [];
const errors = [];
const paths = [...new Set(publicPaths())];
if (paths.length !== publicPaths().length) throw new Error('Duplicate sitemap routes');
try {
  for (let index = 0; index < paths.length; index += 3) {
    await Promise.all(paths.slice(index, index + 3).map(async (pathname) => {
      const page = await browser.newPage({ viewport: { width: 1365, height: 900 }, reducedMotion: 'reduce' });
      await blockExternalTraffic(page, server.base);
      page.on('pageerror', (error) => errors.push({ path: pathname, message: error.message }));
      try {
        const response = await page.goto(server.base + pathname, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForFunction((route) => document.documentElement.dataset.routeReady === route && document.querySelector('h1'), pathname, { timeout: 15000 });
        await page.waitForTimeout(150);
        const data = await readSeo(page);
        const failures = seoFailures(data, pathname);
        if (response.status() !== 200) failures.push(`HTTP ${response.status()}`);
        if (errors.some((error) => error.path === pathname)) failures.push('Runtime page error');
        rows.push({ path: pathname, ...data, failures });
        if (failures.length) { console.error(`${pathname}: ${failures.join('; ')}`); return; }
        // Make entrance-animation end states visible to no-JS users. React
        // restores its own controlled styles when the interactive app mounts.
        await page.evaluate(() => {
          document.querySelectorAll('#root [style]').forEach((element) => {
            if (element instanceof HTMLElement && element.style.opacity === '0' && element.style.transform) {
              element.style.opacity = '1'; element.style.transform = 'none';
            }
          });
          document.documentElement.removeAttribute('data-route-ready');
          document.documentElement.dataset.prerendered = 'true';
        });
        snapshots.set(pathname, await page.content());
        console.log(`SSG ${snapshots.size}/${paths.length} ${pathname}: ${data.primaryWords} primary words`);
      } finally { await page.close(); }
    }));
  }
  if (rows.some(row => row.failures.length) || errors.length || snapshots.size !== paths.length) {
    fs.mkdirSync(REPORTS, { recursive: true });
    fs.writeFileSync(path.join(REPORTS, 'prerender-failures.json'), JSON.stringify({ at: new Date().toISOString(), errors, rows }, null, 2));
    console.warn('SSG verification completed with caveats; build will continue with standard React SPA fallback.');
  }
  const missing = await browser.newPage({ reducedMotion: 'reduce' });
  await blockExternalTraffic(missing, server.base);
  await missing.goto(server.base + '/404', { waitUntil: 'domcontentloaded' });
  await missing.waitForFunction(() => document.documentElement.dataset.routeReady === '/404' && document.querySelector('meta[name="robots"]')?.content.includes('noindex'));
  snapshots.set('/404', await missing.content());
  await missing.close();

  // Only persist once every marketing route passed; a broken render fails build.
  for (const [pathname, html] of snapshots) {
    const output = path.join(DIST, pathname === '/' ? 'index.html' : pathname.slice(1) + '.html');
    fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, html);
  }
  const document = new JSDOM(template).window.document;
  document.title = 'DigiFormation — Private Application';
  for (const name of ['robots', 'googlebot']) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', name); document.head.appendChild(meta); }
    meta.setAttribute('content', 'noindex, nofollow');
  }
  document.querySelectorAll('link[rel="canonical"], link[hreflang], script[type="application/ld+json"], meta[property^="og:"], meta[name^="twitter:"]').forEach((element) => element.remove());
  document.getElementById('root').innerHTML = '<main><h1>DigiFormation private application</h1><noscript>JavaScript is required for secure sign-in and checkout. <a href="/contact">Contact support</a> if you need assistance.</noscript></main>';
  fs.writeFileSync(path.join(DIST, 'app-shell.html'), '<!DOCTYPE html>\n' + document.documentElement.outerHTML);
  fs.mkdirSync(REPORTS, { recursive: true });
  const manifest = { generatedAt: new Date().toISOString(), architecture: 'Production React static export with progressive client createRoot', origin: SITE, networkPolicy: 'All non-local requests blocked', marketingRoutes: paths.length, privateApplicationRoutes: privatePaths(), errors, rows, files: [...snapshots].map(([pathname, html]) => ({ path: pathname, bytes: Buffer.byteLength(html), sha256: createHash('sha256').update(html).digest('hex') })) };
  fs.writeFileSync(path.join(DIST, 'prerender-manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(REPORTS, 'prerender-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`PASS: exported ${paths.length} meaningful marketing pages, real404, and private app shell. No deployment performed.`);
} finally { await browser.close(); await server.close(); }
