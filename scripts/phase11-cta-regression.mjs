import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT, startStaticServer, launchChromium, blockExternalTraffic } from './seo-runtime.mjs';
const server = await startStaticServer(), browser = await launchChromium(), rows = [], failures = [];
const targets = [['utr','utr-number','UTR Number Registration'], ['auth-code','auth-code','Companies House Authentication Code'], ['activation-code','activation-code','HMRC Activation Code Service']];
try {
  for (const width of [390,1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage(); await blockExternalTraffic(page, server.base);
    for (const [id,slug,name] of targets) {
      try {
        await page.goto(server.base + '/uk-services/utr-codes', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => document.documentElement.dataset.routeReady === location.pathname);
        const link = page.locator(`#${id} a[href*="checkout"]`).first();
        const href = await link.getAttribute('href');
        assert.equal(new URL(href, server.base).searchParams.get('service'), slug);
        await link.click();
        await page.waitForURL(url => url.pathname === '/checkout' && url.searchParams.get('service') === slug);
        await page.waitForFunction(name => document.title.includes(name) && document.querySelector('meta[name="robots"]')?.content.includes('noindex'), name);
        assert.match(await page.locator('body').innerText(), new RegExp(name));
        rows.push({ width, card: id, href, selectedCatalogService: name, privateNoindex: true, status: 'PASS', submitted: false });
      } catch (error) { failures.push({ width, card: id, message: error.message }); }
    }
    await context.close();
  }
} finally { await browser.close(); await server.close(); }
const result = { at: new Date().toISOString(), scope: 'LOCAL non-submitting SPA card-to-checkout handoff; all external network blocked', rows, failures, paymentEmailOrderCreation: 'NOT TESTED' };
fs.mkdirSync(path.join(ROOT,'reports/seo/prompt-11'), { recursive: true });
fs.writeFileSync(path.join(ROOT,'reports/seo/prompt-11/SERVICE_CTA_REGRESSION.json'), JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2)); if (failures.length) process.exitCode = 1;
