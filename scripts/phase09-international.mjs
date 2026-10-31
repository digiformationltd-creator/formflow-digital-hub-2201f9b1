import fs from 'node:fs';
import path from 'node:path';
import { ROOT, DIST, SITE } from './seo-runtime.mjs';
const out = path.join(ROOT, 'reports/seo/stage-09'); fs.mkdirSync(out, { recursive: true });
const write = (name, text) => fs.writeFileSync(path.join(out, name), text + '\n');
const csv = (name, rows) => { const keys = Object.keys(rows[0] || {}), q = value => '"' + String(value ?? '').replaceAll('"','""') + '"'; write(name, [keys.map(q).join(','), ...rows.map(row => keys.map(key => q(row[key])).join(','))].join('\r\n')); };
const crawl = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/seo-stage-04/four-mode-audit.json')));
const raw = crawl.rows.filter(r => r.mode === 'raw-http'), known = new Map(raw.map(r => [SITE + r.path, r]));
const baseline = [], checks = [], failures = [];
for (const row of raw) {
  const html = fs.readFileSync(path.join(DIST, row.path === '/' ? 'index.html' : row.path.slice(1) + '.html'), 'utf8');
  const lang = html.match(/<html[^>]*\blang="([^"]*)"/i)?.[1] || '';
  const url = SITE + row.path;
  baseline.push({ url, status: row.status, canonical: row.canonicals[0], robots: row.robots.join('; '), htmlLanguage: lang, declaredAlternates: JSON.stringify(row.hreflang), jurisdiction: row.path.startsWith('/uk-') ? 'UK service jurisdiction' : row.path.startsWith('/usa-') ? 'US service jurisdiction' : 'Not inferred from visitor country', visitorCountry: 'NOT VERIFIED', actualContentLanguage: 'Predominantly English; manual language review pending', demand: 'NOT VERIFIED', source: 'Latest local four-mode crawl + built HTML' });
  for (const alternate of row.hreflang) {
    const target = known.get(alternate.href);
    const syntax = /^(?:x-default|[a-z]{2,3}(?:-[A-Z]{2})?)$/.test(alternate.lang);
    const reciprocal = target?.hreflang.some(a => a.href === url) ?? false;
    const validTarget = target?.status === 200 && target.canonicals[0] === alternate.href && !target.robots.some(r => /noindex/i.test(r));
    const parity = crawl.rows.filter(r => r.path === row.path).every(r => JSON.stringify(r.hreflang) === JSON.stringify(row.hreflang));
    const pass = syntax && reciprocal && validTarget && parity;
    checks.push({ url, language: alternate.lang, alternate: alternate.href, syntax: syntax ? 'PASS' : 'FAIL', reciprocal: reciprocal ? 'PASS' : 'FAIL', indexableCanonicalTarget: validTarget ? 'PASS' : 'FAIL', fourModeParity: parity ? 'PASS' : 'FAIL', equivalence: alternate.href === url ? 'Self-reference; no separate localized variant claimed' : 'MANUAL REVIEW', result: pass ? 'PASS' : 'FAIL' });
    if (!pass) failures.push(url + ' ' + alternate.lang);
  }
  if (!lang || !row.hreflang.some(a => a.lang === 'en' && a.href === url)) failures.push(url + ' missing language/self-reference');
}
csv('02_INTERNATIONAL_BASELINE.csv', baseline); csv('04_HREFLANG_CANONICAL_AUDIT.csv', checks);
const services = [{ service: 'UK formation', url: '/uk-services/uk-ltd-formation' }, { service: 'US LLC formation', url: '/usa-services/us-llc-formation' }, { service: 'Compliance', url: '/uk-compliance' }, { service: 'Banking application assistance', url: '/banks-payment-solutions' }, { service: 'Software development', url: '/software-development' }];
const markets = ['UK', 'US', 'UAE', 'Saudi Arabia', 'Pakistan', 'India', 'Bangladesh', 'EU (country-specific review required)'];
csv('03_MARKET_SERVICE_ELIGIBILITY_MATRIX.csv', markets.flatMap(market => services.map(service => ({ searcherMarket: market, service: service.service, existingURL: SITE + service.url, availability: 'NOT VERIFIED for each applicant/market', legalEligibility: 'Owner/provider/qualified reviewer confirmation required', language: 'Existing English; other language demand NOT VERIFIED', demandCompetition: 'NOT VERIFIED', fulfillment: 'NOT VERIFIED', priority: 'DEFER geographic expansion pending evidence', evidence: 'Current service route only; not evidence of cross-border eligibility' }))));
csv('05_COUNTRY_KEYWORD_INTENT_MAP.csv', services.map(service => ({ service: service.service, existingURL: SITE + service.url, suggestedIntent: 'Commercial (inferred from current service)', geography: 'Searcher location distinct from incorporation jurisdiction', queryCountryData: 'NOT ACCESSIBLE — GSC/Bing unavailable', volumeRankDifficulty: 'NOT VERIFIED', confidence: 'Editorial hypothesis only' })));
const result = { at: new Date().toISOString(), stage: 'PARTIAL — local international technical inventory', pages: raw.length, declaredAlternateChecks: checks.length, passedAlternateChecks: checks.filter(c => c.result === 'PASS').length, failures, live: 'NOT TESTED', marketEligibility: 'NOT VERIFIED', analytics: 'NOT CONNECTED', newLocalePages: 0, sourceChanges: 0 };
write('INTERNATIONAL_RESULTS.json', JSON.stringify(result, null, 2));
write('01_EXECUTIVE_SUMMARY.md', `# International SEO — partial\n\n${raw.length} local pages; ${checks.length} declared alternate checks; ${failures.length} technical findings. Existing global English/self-reference architecture retained; no country pages invented.\n\nRoman Urdu: UK/US service ka mulk aur visitor ka mulk alag hain. Asli country demand aur har applicant ki eligibility verify nahin hui; is liye naye country pages publish nahin kiye. Local tags audit hua hai, international ranking ya traffic verify nahin hui.`);
write('06_INFORMATION_ARCHITECTURE.md', '# Architecture decision\n\nRetain existing global English URLs while service jurisdiction stays explicit. No approved evidence supports translated or materially different regional equivalents yet. Existing en/x-default self-links are audited, not claimed as an international ranking boost. No forced country/IP redirect or migration was introduced.\n\nPrimary guidance checked25October2026: [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [Multi-regional sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites). Alternate pages should be genuine equivalent versions with reciprocal absolute URLs; country targeting does not establish legal service eligibility.');
write('07_IMPLEMENTATION_CHANGELOG.md', '# Changes\n\nAdded repeatable international inventory script and reports. No route, locale page, hreflang source, address or commercial claim changed in stage09. Existing technical tests come from earlier stages; do not attribute their implementation to stage09. No commit/push/deployment.');
write('08_TEST_RESULTS.md', `# Tests\n\nCommand: node scripts/phase09-international.mjs. Generated ${result.at}. Input: saved full local four-mode crawl + dist HTML. Syntax, reciprocal declarations, indexable canonical targets and four-mode hreflang parity checked. ${checks.filter(c => c.result === 'PASS').length}/${checks.length} alternate sets passed; ${failures.length} findings. Country-specific latency, legal eligibility, translation quality, real conversions and live production untested.`);
write('09_BEFORE_AFTER_SCORECARD.md', '# Scope and denominator\n\nNo phase09 source change, so this is a baseline/after-unchanged audit, not an improvement claim. Technical alternate-set score is passed sets / tested sets in INTERNATIONAL_RESULTS.json, separate from market eligibility and business readiness. No overall international readiness score issued while required commercial/legal/analytics evidence is missing.');
write('10_OPEN_ISSUES_AND_APPROVALS.md', '# Open\n\nOwner: verify country-service fulfillment and applicant eligibility. Analytics owner: connect GSC/GA4/Bing and provide authorized country/query/page exports. Editorial reviewer: review legal/currency claims and translations. Engineer: compare production after an approved release; test real geographic performance. Stage09 remains partial. No publication approval requested on an unfinished package.');
write('11_STAGE_10_HANDOFF.md', '# Research inputs\n\nExisting routes and editorial hypotheses are exported. No search volume, keyword difficulty, traffic or competitor ranking is validated. Read stage10 fully before research; do not use inferred country priorities as verified market demand.');
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
