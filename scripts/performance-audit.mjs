import fs from 'node:fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
const out = new URL('../reports/final-production-readiness-2026-10-18/', import.meta.url);
const routes = ['/', '/uk-services/uk-ltd-formation', '/usa-services/us-llc-formation', '/banks-payment-solutions/stripe', '/software-development', '/web-development', '/blog', '/blog/boi-report-filing-guide-2026'];
const chrome = await chromeLauncher.launch({ chromePath: process.env.AUDIT_CHROMIUM_PATH, chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'] });
const rows = [];
try {
  for (const route of routes) {
    const result = await lighthouse('http://127.0.0.1:4175' + route, { port: chrome.port, output: 'json', onlyCategories: ['performance'], logLevel: 'error', blockedUrlPatterns: ['*supabase.co*','*google-analytics*','*googletagmanager*'], maxWaitForLoad: 20000 });
    const lhr = result.lhr, audits = lhr.audits;
    const row = { route, score: lhr.categories.performance.score, LCP_ms: audits['largest-contentful-paint'].numericValue, CLS: audits['cumulative-layout-shift'].numericValue, TBT_ms: audits['total-blocking-time'].numericValue, FCP_ms: audits['first-contentful-paint'].numericValue, speed_index_ms: audits['speed-index'].numericValue, warnings: lhr.runWarnings };
    rows.push(row); console.log(JSON.stringify(row));
    fs.writeFileSync(new URL(`lighthouse-${routes.indexOf(route)}.json`, out), JSON.stringify(lhr));
  }
  fs.writeFileSync(new URL('performance-lab-metrics.json', out), JSON.stringify(rows, null, 2));
} finally { await chrome.kill(); }
