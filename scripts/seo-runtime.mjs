import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const DIST = path.join(ROOT, 'dist');
export const SITE = 'https://www.digiformation.co.uk';
export const REPORTS = path.join(ROOT, 'reports', 'seo-stage-04');
export const redirects = JSON.parse(fs.readFileSync(new URL('./redirect-map.json', import.meta.url), 'utf8'));
export const publicPaths = (directory = path.join(ROOT, 'public')) => [...fs.readFileSync(path.join(directory, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
export const privatePaths = () => [
  '/auth', '/reset-password', '/dashboard', '/admin', '/checkout', '/unsubscribe', '/client-area',
  '/uk-services/uk-ltd-formation/checkout', '/uk-services/ltd-id-verification/checkout',
  '/usa-services/us-llc-formation/checkout',
  ...publicPaths().filter((pathname) => /^\/banks-payment-solutions\/[^/]+$/.test(pathname)).map((pathname) => `${pathname}/checkout`),
];
export const isPrivate = (pathname) => privatePaths().includes(pathname) || pathname.startsWith('/admin/');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2' };

/** Models the explicit Vercel route contract; unknown paths never get homepage200. */
export async function startStaticServer({ renderTemplate, port = 0 } = {}) {
  const paths = new Set(publicPaths());
  const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400); res.end('Invalid URL'); return; }
    if (pathname !== '/' && pathname.endsWith('/')) { res.writeHead(308, { Location: pathname.replace(/\/+$/, '') + new URL(req.url, 'http://localhost').search }); res.end(); return; }
    if (redirects[pathname]) { res.writeHead(308, { Location: redirects[pathname] + new URL(req.url, 'http://localhost').search }); res.end(); return; }
    const filePath = path.resolve(DIST, `.${pathname}`);
    if (filePath !== DIST && !filePath.startsWith(DIST + path.sep)) { res.writeHead(403); res.end(); return; }
    let file = filePath;
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) && fs.existsSync(`${filePath}.html`)) file = `${filePath}.html`;
    let status = 200;
    let content;
    if (renderTemplate && (paths.has(pathname) || pathname === '/404')) { content = renderTemplate; if (pathname === '/404') status = 404; }
    else if (isPrivate(pathname)) file = path.join(DIST, 'app-shell.html');
    if (!content && !fs.existsSync(file)) { status = 404; file = path.join(DIST, '404.html'); }
    if (!content && !fs.existsSync(file)) { res.writeHead(404); res.end('Page not found'); return; }
    const contentType = content ? 'text/html; charset=utf-8' : mime[path.extname(file)] || 'application/octet-stream';
    res.writeHead(status, { 'Content-Type': contentType, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', ...(isPrivate(pathname) ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}) });
    res.end(content ?? fs.readFileSync(file));
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { base: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((resolve) => server.close(resolve)) };
}

export async function launchChromium() {
  const { chromium } = await import('playwright');
  let executablePath = process.env.AUDIT_CHROMIUM_PATH;
  if (!executablePath && !fs.existsSync(chromium.executablePath()) && process.env.LOCALAPPDATA) {
    const cache = path.join(process.env.LOCALAPPDATA, 'ms-playwright');
    if (fs.existsSync(cache)) executablePath = fs.readdirSync(cache).filter((name) => name.startsWith('chromium_headless_shell-')).sort((a, b) => b.localeCompare(a, undefined, { numeric: true })).map((name) => path.join(cache, name, 'chrome-headless-shell-win64/chrome-headless-shell.exe')).find((candidate) => fs.existsSync(candidate));
  }
  return chromium.launch({ headless: true, executablePath });
}

export async function blockExternalTraffic(page, base) {
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    return url.origin === base || ['data:', 'blob:'].includes(url.protocol) ? route.continue() : route.abort();
  });
}

export async function readSeo(page) {
  return page.evaluate(() => {
    const contents = (selector, attribute = 'content') => [...document.querySelectorAll(selector)].map((element) => element.getAttribute(attribute) || '');
    const main = document.querySelector('main') || document.querySelector('article') || document.getElementById('root');
    return {
      title: document.title, titleCount: document.querySelectorAll('title').length,
      descriptions: contents('meta[name="description"]'), canonicals: contents('link[rel="canonical"]', 'href'),
      robots: contents('meta[name="robots"]'), googlebot: contents('meta[name="googlebot"]'),
      h1: [...document.querySelectorAll('h1')].map((heading) => heading.textContent.trim().replace(/\s+/g, ' ')),
      hreflang: [...document.querySelectorAll('link[hreflang]')].map((element) => ({ lang: element.getAttribute('hreflang'), href: element.getAttribute('href') })),
      schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map((element) => ({ id: element.id, json: element.textContent })),
      og: [...document.querySelectorAll('meta[property^="og:"]')].map((element) => ({ name: element.getAttribute('property'), value: element.getAttribute('content') })),
      twitter: [...document.querySelectorAll('meta[name^="twitter:"]')].map((element) => ({ name: element.getAttribute('name'), value: element.getAttribute('content') })),
      primaryWords: (main?.textContent || '').trim().split(/\s+/).filter(Boolean).length,
      primaryText: (main?.textContent || '').trim().replace(/\s+/g, ' '),
      links: [...document.querySelectorAll('a[href]')].map((anchor) => ({ href: anchor.getAttribute('href'), text: anchor.textContent.trim().slice(0, 100) })),
      routeReady: document.documentElement.dataset.routeReady || '',
    };
  });
}

export function seoFailures(data, pathname, { noindex = false } = {}) {
  const failures = [];
  if (!data.title || data.titleCount !== 1) failures.push('Expected one nonempty title');
  if (data.descriptions.length !== 1 || !data.descriptions[0]) failures.push('Expected one nonempty description');
  if (data.h1.length !== 1 || !data.h1[0]) failures.push('Expected one nonempty H1');
  if (data.canonicals.length !== 1 || data.canonicals[0] !== SITE + pathname) failures.push('Canonical mismatch/duplicate');
  if (data.robots.length !== 1 || data.robots.some((value) => /noindex/i.test(value)) !== noindex) failures.push('Robots mismatch');
  if (data.hreflang.length !== 2 || !['en', 'x-default'].every((language) => data.hreflang.some((link) => link.lang === language && link.href === SITE + pathname))) failures.push('Hreflang mismatch');
  if (!noindex && data.primaryWords < 80) failures.push(`Primary content too thin (${data.primaryWords} words)`);
  for (const payload of data.schema) { try { JSON.parse(payload.json); } catch { failures.push('Invalid JSON-LD'); } }
  for (const [name, values] of [['OG', data.og], ['Twitter', data.twitter]]) if (new Set(values.map((value) => value.name)).size !== values.length) failures.push(`Duplicate ${name} metadata`);
  if (data.og.find((item) => item.name === 'og:url')?.value !== SITE + pathname) failures.push('OpenGraph URL mismatch');
  return failures;
}
