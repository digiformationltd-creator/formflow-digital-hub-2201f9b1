import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { ROOT, startStaticServer, launchChromium, blockExternalTraffic } from './seo-runtime.mjs';
const require = createRequire(import.meta.url);
const out = path.join(ROOT, 'audits/phase-05/EVIDENCE'); fs.mkdirSync(out, { recursive: true });
const routes = ['/', '/uk-services/uk-ltd-formation', '/usa-services/us-llc-formation', '/software-development', '/blog/boi-report-filing-guide-2026', '/contact'];
const save = (name, value) => fs.writeFileSync(path.join(out, name), JSON.stringify(value, null, 2));
const server = await startStaticServer();
const browser = await launchChromium();
const mode = process.argv[2] || 'accessibility';
const label = process.argv[3] || 'baseline';
if (!['baseline', 'final'].includes(label)) throw new Error('Expected baseline or final label');
try {
  if (mode === 'accessibility') {
    const rows = [];
    for (const width of [320, 375, 390, 768, 1024, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage(); await blockExternalTraffic(page, server.base);
      for (const route of routes) {
        await page.goto(server.base + route, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => document.documentElement.dataset.routeReady === location.pathname);
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
        const result = await page.evaluate(async () => ({ axe: await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }), overflow: document.documentElement.scrollWidth > innerWidth + 1 }));
        const violations = result.axe.violations.map(item => ({ id: item.id, impact: item.impact, description: item.description, helpUrl: item.helpUrl, nodes: item.nodes.map(node => ({ target: node.target, failureSummary: node.failureSummary })) }));
        rows.push({ route, width, at: new Date().toISOString(), overflow: result.overflow, violations, passes: result.axe.passes.length, incomplete: result.axe.incomplete.length });
        save(`accessibility-${label}.json`, { scope: 'LOCAL automated axe and reflow; not manual WCAG certification', rows });
        console.log(`AXE ${width} ${route}: ${violations.length} rule violations, overflow=${result.overflow}`);
      }
      await context.close();
    }
  } else if (mode === 'performance') {
    const chromiumPath = browser.browserType().executablePath();
    await browser.close();
    const fallback = 'C:/Users/user/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe';
    const chrome = await chromeLauncher.launch({ chromePath: fs.existsSync(chromiumPath) ? chromiumPath : fallback, chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'] });
    const rows = [];
    try {
      for (const route of routes) for (const device of ['mobile', 'desktop']) for (let run = 1; run <= 3; run++) {
        const result = await lighthouse(server.base + route, { port: chrome.port, output: 'json', onlyCategories: ['performance', 'accessibility'], logLevel: 'error', maxWaitForLoad: 25000, blockedUrlPatterns: ['*supabase.co*', '*google-analytics*', '*googletagmanager*'], ...(device === 'desktop' ? { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } : {}) });
        const h = result.lhr, a = h.audits, key = `${routes.indexOf(route)}-${device}-${run}`;
        save(`lighthouse-${label}-${key}.json`, h);
        rows.push({ route, device, run, at: h.fetchTime, performance: h.categories.performance.score * 100, accessibility: h.categories.accessibility.score * 100, LCP_ms: a['largest-contentful-paint'].numericValue, CLS: a['cumulative-layout-shift'].numericValue, TBT_ms: a['total-blocking-time'].numericValue, FCP_ms: a['first-contentful-paint'].numericValue, settings: h.configSettings, warnings: h.runWarnings, runtimeError: h.runtimeError, evidence: `lighthouse-${label}-${key}.json` });
        save(`performance-${label}.json`, { scope: 'LOCAL post-SSG baseline, lab not field CWV; no before/after improvement claim', INP: 'NOT VERIFIED — field data unavailable', rows });
        console.log(`LH ${route} ${device} ${run}/3: ${rows.at(-1).performance}`);
      }
    } finally { await chrome.kill(); }
  } else throw new Error('Expected accessibility or performance');
} finally { if (browser.isConnected()) await browser.close(); await server.close(); }
