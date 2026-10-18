import fs from 'node:fs';
const out = new URL('../reports/final-production-readiness-2026-10-18/', import.meta.url);
const evidence = JSON.parse(fs.readFileSync(new URL('rendered-crawl-evidence.json', out), 'utf8'));
const links = [...new Set(evidence.links.filter(x => /^https?:/.test(x.href)).map(x => {
  const url = new URL(x.href); if (url.hostname === 'wa.me') url.search = ''; return url.href;
}))];
const rows = [];
for (let i = 0; i < links.length; i += 6) {
  await Promise.all(links.slice(i, i + 6).map(async url => {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Mozilla/5.0 DigiFormationLinkAudit/1.0' } });
      const status = response.status;
      const classification = status === 403 || status === 401 ? 'BLOCKED-BY-REMOTE' : status === 429 ? 'RATE-LIMITED' : status === 404 || status === 410 ? 'DEAD' : status >= 500 ? 'MANUAL-VERIFY' : response.redirected ? 'REDIRECTED' : status < 400 ? 'ACTIVE' : 'MANUAL-VERIFY';
      rows.push({ url, final_url: response.url, status, classification });
      await response.body?.cancel();
    } catch (error) { rows.push({ url, classification: 'MANUAL-VERIFY', error: error.message }); }
  }));
  console.log(`${rows.length}/${links.length}`);
}
const q = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
fs.writeFileSync(new URL('FINAL_EXTERNAL_LINK_REPORT.csv', out), ['url,final_url,status,classification,error', ...rows.map(row => ['url','final_url','status','classification','error'].map(k => q(row[k])).join(','))].join('\n'));
console.log(JSON.stringify(rows.reduce((a,x) => ({ ...a, [x.classification]: (a[x.classification] || 0) + 1 }), {})));
