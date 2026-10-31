import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { blogPosts } from '../src/data/blog.ts';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'reports/final-production-readiness-2026-10-18');
const read = name => fs.existsSync(path.join(out,name)) ? JSON.parse(fs.readFileSync(path.join(out,name),'utf8')) : null;
const write = (name, content) => fs.writeFileSync(path.join(out,name), content + '\n');
const csv = (name, rows) => { const columns=[...new Set(rows.flatMap(Object.keys))],q=x=>'"'+String(x??'').replaceAll('"','""')+'"'; write(name,[columns.map(q).join(','),...rows.map(r=>columns.map(k=>q(r[k])).join(','))].join('\n')); };
function parseCsv(name) {
  const file = path.join(out,name); if(!fs.existsSync(file)) return [];
  const text=fs.readFileSync(file,'utf8'), rows=[]; let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++) { const c=text[i]; if(quoted) { if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c; }else if(c==='"')quoted=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c; }
  if(field||row.length){row.push(field);rows.push(row);} const [columns,...values]=rows;
  return values.map(values=>Object.fromEntries(columns.map((key,i)=>[key,values[i]||''])));
}
const internals=parseCsv('FINAL_RENDERED_INTERNAL_LINKS.csv'), externals=parseCsv('FINAL_EXTERNAL_LINK_REPORT.csv');
const mapStatus = { ACTIVE:'PASS', REDIRECTED:'REDIRECT', 'BLOCKED-BY-REMOTE':'BLOCKED_BY_REMOTE', 'RATE-LIMITED':'RATE_LIMITED', 'MANUAL-VERIFY':'MANUAL_VERIFY' };
csv('FINAL_BROKEN_LINK_REPORT.csv',[
  ...internals.map(r=>({type:'INTERNAL',source:r.from,url:r.href,http_status:r.status,classification:mapStatus[r.classification]||r.classification,notes:r.notes})),
  ...externals.map(r=>({type:'EXTERNAL',source:'rendered application',url:r.url,http_status:r.status,classification:mapStatus[r.classification]||r.classification,notes:r.error||r.final_url})),
]);
const lint = read('lint-current.json') || [];
const totals = lint.reduce((a,f)=>({errors:a.errors+f.errorCount,warnings:a.warnings+f.warningCount}),{errors:0,warnings:0});
const findings = lint.flatMap(f=>f.messages.map(m=>({file:path.relative(root,f.filePath),line:m.line,rule:m.ruleId||'directive',severity:m.severity===2?'error':'warning',classification:m.ruleId==='react-hooks/exhaustive-deps'?'REAL DEFECT RISK — closure review required':m.ruleId==='@typescript-eslint/no-explicit-any'?'UNRESOLVED TYPE BOUNDARY':m.ruleId==='react-refresh/only-export-components'?'INTENTIONAL MODULE STRUCTURE — requires individual review':'SAFE CLEANUP / REVIEW',message:m.message,status:'OPEN'})));
csv('FINAL_LINT_FINDINGS.csv',findings);
const changes = execFileSync('git',['diff','--name-only'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
write('FINAL_LINT_REMEDIATION.md',`# Lint remediation — 19 October 2026

Resume baseline: 378 errors, 66 warnings. Earlier pre-remediation baseline: 403 errors, 66 warnings.

Current: **${totals.errors} errors, ${totals.warnings} warnings**. Status: **FAIL — target zero errors has not been achieved**.

Fixed: incorrect AI classification of email UTMs, route head-state reset, typed attribution storage parsing, invoice-success tracking guard, PDF constructor casts while retaining availability guards, typed Lucide props, redundant regex escapes and date parsing bindings. Existing checkout hook-order fix is preserved.

No error rules were globally disabled. Remaining findings and each warning are individually listed with file, line, rule, classification and message in FINAL_LINT_FINDINGS.csv. Type boundaries in authenticated admin/CRM code and effect dependencies remain local work, not an external-account dependency.

Changed tracked files:\n${changes.map(x=>'- '+x).join('\n')}`);

const notes = [
  'Recheck 71+ director appointments against the current register; biographical assertions need owner evidence.',
  'Refresh phased identity-verification details and separate incorporation from provider eligibility.',
  'Validate Delaware/Wyoming recurring fees and tax assumptions; state choice does not guarantee a bank account.',
  'Verify supported entity and representative-country requirements; no unsupported-country workaround promise.',
  'Any-country approval headline removed; remaining provider-country and verification claims require source review.',
  'Add current provider fee tables and dates; illustrative FX comparisons are not quotes.',
  'Tax/VAT nexus and entity choice depend on facts; add IRS/HMRC and Amazon primary sources.',
  'Verify seller residency and payout policy; claims that only one route works are overbroad.',
  'Confirm Shopify third-party gateway availability by country; direct Stripe is not always selectable.',
  'EIN eligibility, responsible-party rules and processing times need IRS-specific verification.',
  'ITIN financial-access guarantee removed; remaining treaty and withholding examples require tax review.',
  'FinCEN current exemption verified; retain conditional foreign-entity analysis and source access date.',
  'VAT registration exceptions and non-established taxable-person rules require fact-specific HMRC review.',
  'Tide residency and eligibility claims require current provider guidance; registered office alone is insufficient.',
  'Wise residency, business category and fee claims need provider-country evidence.',
  'Airwallex/Wise fee and onboarding comparisons need dated provider quotes.',
  'PingPong supported marketplaces, currencies and conversion fees need official links.',
  'WorldFirst country eligibility and supplier-payment terms need official links.',
  'Mollie supported registration countries and transaction fees require provider verification.',
  'Wallester geography, card limits and pricing require provider verification.',
  'Gateway comparison needs dated fees, country eligibility and dispute-policy citations.',
  'Current Companies House fee source verified; annual filing deadline wording needs entity-specific review.',
  'Check name-change fee, resolution procedure and effective-name timing with Companies House.',
  'Rankings and approval-odds claims need a documented methodology and current provider sources.',
  'Do not imply every Shopify store needs an overseas entity; tailor eligibility to seller facts.',
  'Distinguish statutory default address from a legitimate shared registered-office service.',
  'Verify authentication-code recovery, identity-verification prerequisites and restoration route.',
  'Verify AD01 filing and identification prerequisites; distinguish administrative and court restoration.',
  'Verify phased director/PSC deadlines and accepted documents; avoid unsupported ACSP-affiliation implication.',
  'Architecture comparison lacks primary benchmarks; do not equate React SPA with automatic SEO superiority.',
  'Add current CMS documentation and explain when an existing CMS is sufficient.',
  'Commercial 3D ROI claims need evidence; avoid implying a universal performance guarantee.',
  'Unsupported conversion-loss statistic and 95+ score promise require removal or citation.',
  'Definition is useful; add a concrete interaction example and accessibility fallback guidance.',
  'Technical explanation needs current WebGL/Three.js references and lifecycle cleanup example.',
  'Mobile traffic percentage and device-performance generalizations need dated evidence.',
  'Differentiate browser API from Three.js abstraction; verify current WebGPU browser support.',
  'Conversion and return-rate claims need measurements or explicit hypothetical labeling.',
  'Agency pricing ranges are unverified; quote project scope and exclusions rather than market fact.',
  'User-preference and conversion claims need evidence; prefer task-specific interaction examples.',
  'Explain crawlable content and performance tradeoffs without promising rankings.',
  'Conversion uplift claims lack direct evidence; describe feedback behavior and reduced-motion support.',
  'TCO comparisons must show assumptions, support cost and API usage charges.',
  'Lifecycle outline is useful; add concrete acceptance and maintenance criteria.',
  'ROI figures and labor-savings examples require explicit assumptions and measurement.',
  'Agent definition should distinguish bounded automation from unrestricted autonomy; add primary technical references.',
  'Verify WhatsApp platform route and policy compliance; API and unofficial integration must not be conflated.',
];
if(notes.length!==blogPosts.length) throw new Error('Editorial note count does not match article count');
const blogRows=blogPosts.map((post,i)=>({URL:'https://www.digiformation.co.uk/blog/'+post.slug,decision:'REFRESH',major_issue:notes[i],source_verification_status:i===11||i===21?'Primary statutory source checked 2026-10-19; remaining article claims require review':'Article-specific factual verification incomplete',action_taken:i===4||i===10?'Misleading headline/intro refreshed; meaningful dateModified recorded':'Individual editorial triage recorded; existing content retained',human_review_completed:'NO',agent_editorial_triage_completed:'YES',publication_date:post.date,dateModified:post.dateModified||post.date,final_status:'PARTIAL — complete article-level factual review before sign-off'}));
csv('FINAL_BLOG_47_HUMAN_REVIEW.csv',blogRows);

const dep=read('npm-production-audit.json'), depRows=read('dependency-findings.json')||[];
write('FINAL_DEPENDENCY_SECURITY_AUDIT.md',`# Dependency security — 19 October 2026

Production audit: ${JSON.stringify(dep?.metadata?.vulnerabilities||{})}.

Before compatible remediation: 0 critical, 12 high, 3 moderate. After remediation: ${dep?.metadata?.vulnerabilities?.critical??'unknown'} critical, ${dep?.metadata?.vulnerabilities?.high??'unknown'} high, ${dep?.metadata?.vulnerabilities?.moderate??'unknown'} moderate.

Applied npm audit fix without force and with install scripts disabled. Replaced npm xlsx 0.18.5 with official SheetJS 0.20.3, following [vendor installation guidance](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/). Spreadsheet import/export is production reachable in authenticated company administration and needs runtime smoke coverage.

Residual findings:\n${depRows.map(r=>`- ${r.package}: ${r.severity}; ${r.direct?'direct':'transitive'}; ${r.reachability}; fix ${JSON.stringify(r.fix)}.`).join('\n')}

Residual graph includes Tailwind build dependencies; no browser exploit path was established by the advisory inventory alone. Tailwind major migration was not forced. Development-only Vitest/tinypool findings remain separate from production counts and must be reviewed before allowing untrusted worker configuration. Residual risk is documented, not accepted on the owner's behalf. Verdict: PARTIAL.`);

const evidence=read('rendered-crawl-evidence.json')||{rows:[],images:[],errors:[]};
const metrics=read('FINAL_URL_SET_METRICS.json')||{};
const axeFiles=fs.readdirSync(out).filter(n=>/^axe-.*\.json$/.test(n));
const axe=axeFiles.flatMap(name=>(read(name)||[]).map(v=>({file:name,id:v.id,impact:v.impact,nodes:v.nodes?.length||0})));
write('FINAL_ACCESSIBILITY_AUDIT.md',`# Accessibility — 19 October 2026

Automated axe WCAG 2 A/AA and 2.1 AA reports: ${axeFiles.length}. Violations: ${axe.length}; critical: ${axe.filter(v=>v.impact==='critical').length}.

${axe.length?axe.map(v=>`- ${v.file}: ${v.id}, ${v.impact}, ${v.nodes} nodes.`).join('\n'):'No selected-rule violations were reported in the sampled templates.'}

Keyboard focus/skip-navigation evidence is recorded in keyboard-*.json. Missing alt in rendered evidence: ${evidence.images.filter(x=>x.alt===null).length}. Duplicate IDs: ${evidence.rows.filter(r=>r.duplicate_ids).length} routes. Icon button naming and template landmarks were inspected automatically.

Verdict: PARTIAL. Modal interactions, authenticated admin forms, screen-reader output and all responsive/zoom combinations have not been fully exercised. Automated zero violations is not a complete manual accessibility sign-off.`);
const lab=read('performance-lab-metrics.json')||[];
write('FINAL_PERFORMANCE_AUDIT.md',`# LOCAL LAB METRICS — 19 October 2026

${lab.length} representative route measurements saved. Server uses gzip for text resources, immutable caching for hashed assets and no-cache HTML. Lighthouse uses local production files with analytics/database writes blocked. These are lab measurements, not field CWV or CrUX.

${lab.map(r=>`- ${r.route}: score ${Math.round(r.score*100)}, LCP ${Math.round(r.LCP_ms)}ms, CLS ${r.CLS.toFixed(3)}, TBT ${Math.round(r.TBT_ms)}ms, FCP ${Math.round(r.FCP_ms)}ms, Speed Index ${Math.round(r.speed_index_ms)}ms; JS transfer ${r.JS_transfer_bytes??'not captured'} bytes; images ${r.image_transfer_bytes??'not captured'} bytes.`).join('\n')}

Uncompressed earlier results are excluded from this verdict. Field INP/LCP/CLS requires real-user data. Results still show room for LCP/main-thread work; major visuals were preserved. Digi Biz OS is included within the software-development page, not a separate application route.`);
write('FINAL_LEGAL_COMMERCIAL_CLAIMS_AUDIT.md',`# Legal and commercial claims — 19 October 2026

Current primary sources checked: [FinCEN BOI](https://www.fincen.gov/boi), [Companies House fees](https://www.gov.uk/government/publications/companies-house-fees/companies-house-fees), [VAT registration](https://www.gov.uk/register-for-vat), [IRS ITIN](https://www.irs.gov/tin/itin/individual-taxpayer-identification-number-itin).

FinCEN confirms the current exemption for U.S.-created companies; qualifying foreign entities still require applicability analysis. Current Companies House incorporation and confirmation-statement fees were rechecked. ITIN wording now describes tax purpose and does not promise banking/provider access. The PayPal any-country approval headline was removed. Publication dates were preserved; dateModified was added only for materially revised articles.

PARTIAL: the individual article review CSV identifies unsupported provider eligibility, fee, tax, marketing/ROI and affiliation claims still requiring source-backed refresh. Current sources do not certify every assertion in the 47 articles.`);
write('FINAL_GA4_GSC_CHECKLIST.md',`# External account evidence

GA4 — BLOCKED: OWNER ACCESS REQUIRED

GSC — BLOCKED: OWNER ACCESS REQUIRED

After deployment: verify the property/domain, consent/tag loading and DebugView; submit a test successful order and a failed invoice; verify exactly one success event and none for failure; reconcile 28/90-day landing-page traffic and conversion data. In GSC inspect homepage/service/blog/insight canonical and rendered HTML, review sitemap processing, Page Indexing, clicks and impressions. Confirm field CWV only from CrUX/GSC or real-user measurements. No traffic, rankings or indexed-page counts are invented.`);
write('FINAL_SECURITY_VERIFICATION.md',`# Security verification

Read FINAL_SECURITY_SECRET_SCAN.md for current source, untracked-file and frontend-bundle results. Values are never printed. .env.example is an allowed name-only template; local .env is ignored. The scan checks privileged token patterns and decodes JWT role fields in memory to detect service-role keys.

Dependency findings are separate in FINAL_DEPENDENCY_SECURITY_AUDIT.md. Historical credential status cannot be established from current source: OWNER ACTION — ROTATION VERIFICATION. No credentials were rotated and no production access policy changed.`);
write('FINAL_DEPLOYMENT_READY_CHECKLIST.md',`# Deployment checkpoint

PRODUCTION DEPLOYED: NO

Use npm run build:verified to generate backed-up browser snapshots and run raw assertions. Plain npm run build generates preliminary shells; it is not the verified snapshot delivery command. Install Playwright Chromium in the build environment and run all command gates before publishing the resulting dist directory.

Review the working-tree diff and preserve backup paths in snapshot-backup-location.json. Run npm exec tsc -- --noEmit, npm run lint, npm test -- --run, npm run test:seo, secret scan, production dependency audit, rendered crawl and final-regression. A lint failure or article factual-review gap remains a local defect. After approval deploy through the protected workflow, verify Vercel's real redirect/static precedence, then perform GA4/GSC and Rich Results checks. GitHub push, production publishing, DNS and Cloudflare changes were not performed.`);
const gate={public_routes:evidence.rows.length,public_basic_pass:evidence.rows.filter(r=>r.final_status==='PASS').length,metadata_drift:evidence.rows.filter(r=>r.metadata_drift==='YES').length,lint_errors:totals.errors,lint_warnings:totals.warnings,js_errors:evidence.errors.length,missing_alt:evidence.images.filter(x=>x.alt===null).length,duplicate_id_routes:evidence.rows.filter(r=>r.duplicate_ids).length,blog_human_review:0,blog_editorial_triage:blogRows.length,production_critical:dep?.metadata?.vulnerabilities?.critical??null,performance_routes:lab.length,status:'CONDITIONAL PASS'};
write('FINAL_RESUME_STATUS.json',JSON.stringify(gate,null,2));
write('DIGIFORMATION_FINAL_MASTER_AUDIT.md',`# Final master audit — 19 October 2026

## Verdict: CONDITIONAL PASS

This resume used the current working checkout at baseline commit 263feb0. Source changes and evidence were preserved. No production publishing, GitHub push, DNS or Cloudflare action occurred in this run.

${JSON.stringify(gate,null,2)}

## URL reconciliation

${JSON.stringify(metrics,null,2)}

The original 105-page inventory expanded to 108 with privacy, terms and the U.S. state-comparison route. The original seven legacy aliases are isolated in FINAL_ALIAS_REDIRECT_MAP.csv; additional configured aliases are in FINAL_ALL_REDIRECTS.csv. The two original checkout paths are classified independently and require valid selection/session inputs, not marketing redirects.

## Local fixes

- Route canonical/hreflang/schema state resets across SPA navigation; insight schema uses the canonical domain.
- Email UTM classification no longer matches the AI category by substring.
- Stored attribution values are validated before use; first/last-touch dispatch has deterministic tests.
- Purchase telemetry requires a successful invoice identifier and deduplicates the transaction ID.
- Guarded PDF GState behavior preserved with a typed constructor; runtime in-memory PDF smoke test succeeded.
- Compatible dependency patches and official SheetJS upgrade applied.
- Generated HTML snapshot mutation was explicitly authorized with backups; see snapshot-backup-location.json.

## Remaining local work

${totals.errors} lint errors and ${totals.warnings} warnings remain. They were not hidden through global rule changes. Full article factual/legal/provider review remains incomplete; 47 editorial triage notes do not constitute 47 human approvals. Automated accessibility sampling is incomplete for dialogs/authenticated flows. Dependency residuals require review; no major upgrade was forced.

All final CSV/JSON artifacts preserve the distinction between basic rendered checks, raw metadata, navigation tests, current lab measurements and external production evidence. This report supersedes earlier claims that all remaining local work was complete.`);
console.log(JSON.stringify(gate));
