import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT, startStaticServer, launchChromium, blockExternalTraffic } from './seo-runtime.mjs';
const require = createRequire(import.meta.url);
const blogs = process.argv.includes('--blogs');
const routes = blogs ? ['/blog/how-to-register-uk-ltd-from-pakistan-2026','/blog/how-to-open-stripe-account-pakistan-2026','/blog/uk-company-id-verification-2025-2026-rule','/blog/us-llc-formation-from-pakistan-delaware-vs-wyoming'] : ['/faq', '/uk-services/utr-codes', '/uk-company-services/change-services'];
const server = await startStaticServer(), browser = await launchChromium(), rows = [];
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage(); await blockExternalTraffic(page, server.base);
    for (const route of routes) {
      await page.goto(server.base + route, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.documentElement.dataset.routeReady === location.pathname);
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const result = await page.evaluate(async () => {
        const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(n => Number(n.tagName[1]));
        const axe = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa'] } });
        return { headings, skipped: headings.some((h,i) => i && h > headings[i-1] + 1), overflow: document.documentElement.scrollWidth > innerWidth + 1, violations: axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })) };
      });
      rows.push({ route, width, ...result }); console.log(route, width, JSON.stringify(result));
    }
    await context.close();
  }
} finally { await browser.close(); await server.close(); }
const output = { at: new Date().toISOString(), scope: blogs ? 'LOCAL four changed blog pages, automated axe/reflow only; not factual certification' : 'LOCAL three changed heading templates, automated axe/reflow only; no customer submissions', rows };
fs.writeFileSync(path.join(ROOT, blogs ? 'reports/seo/stage-12/BLOG_HEADING_REGRESSION.json' : 'reports/seo07/HEADING_REGRESSION.json'), JSON.stringify(output, null, 2));
if (rows.some(r => r.skipped || r.overflow || r.violations.length)) process.exitCode = 1;
