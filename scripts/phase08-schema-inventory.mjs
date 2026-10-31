import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SITE } from './seo-runtime.mjs';
const out = path.join(ROOT, 'reports/schema'); fs.mkdirSync(out, { recursive: true });
const crawl = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/seo-stage-04/four-mode-audit.json')));
const write = (name, value) => fs.writeFileSync(path.join(out, name), value + '\n');
const csv = (name, rows) => { const keys = Object.keys(rows[0] || {}); const q = value => '"' + String(value ?? '').replaceAll('"','""') + '"'; write(name, [keys.map(q).join(','), ...rows.map(r => keys.map(k => q(r[k])).join(','))].join('\r\n')); };
const inventory = [], validation = [], findings = [], allTypes = new Set();
function walk(value, fn) { if (Array.isArray(value)) value.forEach(v => walk(v, fn)); else if (value && typeof value === 'object') { fn(value); Object.values(value).forEach(v => walk(v, fn)); } }
for (const row of crawl.rows.filter(r => r.mode === 'raw-http')) {
  const parsed = [], errors = [], nodes = [];
  for (const script of row.schema) { try { parsed.push(JSON.parse(script.json)); } catch (error) { errors.push(error.message); } }
  parsed.forEach(graph => walk(graph, node => { if (node['@type']) nodes.push(node); }));
  const types = [...new Set(nodes.flatMap(n => Array.isArray(n['@type']) ? n['@type'] : [n['@type']]))]; types.forEach(type => allTypes.add(type));
  const ids = nodes.filter(n => n['@id']).map(n => n['@id']);
  const duplicates = ids.filter((id,i) => ids.indexOf(id) !== i);
  const definitions = new Set(ids), refs = new Set();
  parsed.forEach(graph => walk(graph, node => { if (node['@id'] && Object.keys(node).length === 1 && node['@id'].startsWith(SITE)) refs.add(node['@id']); }));
  const unresolved = [...refs].filter(id => !definitions.has(id));
  const staging = JSON.stringify(parsed).match(/https?:\/\/(?:localhost|127\.0\.0\.1|[^/" ]+\.vercel\.app)[^" ]*/g) || [];
  const comparisons = crawl.rows.filter(r => r.path === row.path && r.mode !== 'raw-http');
  const drift = comparisons.some(r => JSON.stringify(r.schema.map(s => JSON.parse(s.json))) !== JSON.stringify(parsed));
  inventory.push({ url: SITE + row.path, canonical: row.canonicals[0], indexability: row.robots.join('; '), schemaTypes: types.join('; '), scripts: parsed.length, desired: row.path.startsWith('/blog/') ? 'Organization + WebSite + WebPage + BlogPosting; factual fields require review' : 'Organization + WebSite + WebPage; Service/Breadcrumb where visible and appropriate', eligibility: 'Schema syntax is not Google feature eligibility; external tests NOT TESTED', evidence: 'Saved four-mode crawl', owner: 'DigiFormation / editorial reviewer' });
  validation.push({ url: SITE + row.path, JSONparse: errors.length ? 'FAIL' : 'PASS', duplicateDefinedIds: duplicates.join('; '), unresolvedLocalReferences: unresolved.join('; '), stagingURLs: staging.join('; '), fourModeSchemaConsistency: drift ? 'FAIL' : 'PASS', schemaOrgValidator: 'NOT TESTED', googleRichResultsTest: 'NOT TESTED', entityIdentity: 'NEEDS VERIFICATION', visibleContentAlignment: 'NOT TESTED', actualSearchAppearance: 'NOT VERIFIED' });
  for (const [kind, items] of [['parse', errors], ['duplicate defined @id', duplicates], ['unresolved local @id reference', unresolved], ['staging URL', staging]]) if (items.length) findings.push({ route: row.path, kind, values: items.join('; '), severity: kind === 'parse' || kind === 'staging URL' ? 'high' : 'review' });
  if (drift) findings.push({ route: row.path, kind: 'four-mode schema drift', values: '', severity: 'high' });
}
csv('page_inventory.csv', inventory); csv('validation_results.csv', validation); csv('FINDINGS.csv', findings);
const summary = { at: new Date().toISOString(), crawlStartedAt: crawl.startedAt, pages: inventory.length, types: [...allTypes].sort(), findings: findings.length, scope: 'Saved LOCAL four-mode JSON-LD; no microdata/RDFa or external validator/live crawl yet', stage: 'IN PROGRESS', deployment: 'NOT DEPLOYED', identity: 'Owner supplied, authoritative registry and social profile ownership not independently verified' };
write('SCHEMA_RESULTS.json', JSON.stringify(summary, null, 2));
write('MASTER_SCHEMA_AUDIT.md', `# Schema audit — in progress\n\n${summary.pages} local canonical URLs inventoried; ${summary.types.length} schema types. ${findings.length} automated graph findings require review. JSON parsing, repeated defined IDs, unresolved local references, staging URLs and cross-mode drift are recorded individually.\n\nThis is not Schema.org semantic certification, Google rich-result eligibility or observed search appearance. Microdata/RDFa inventory, factual/visible-content alignment, primary-source entity verification and external validators remain unfinished. No overall completion score issued. Read FINDINGS.csv and validation_results.csv.`);
write('entity_graph.md', '# Entity graph review\n\nExpected stable organization identifier: ' + SITE + '/#organization. Examine definitions versus references in each page. An unresolved local reference is a review signal, not automatically invalid Schema.org. Do not invent author identities, business locations, regulatory status, social ownership, prices or ratings to fill unknown fields.');
write('implementation_changelog.md', '# Implementation\n\nShared seo.ts serializer and CorePages JSON-LD helper now escape HTML delimiters and Unicode separators before static HTML embedding. Global source graph has explicit ldjson-global ID; route reset removes outgoing graphs by ownership rather than retaining every @graph. Two regression tests cover safe round-trip HTML embedding and outgoing/global graph cleanup. Inspect latest unit/build/crawl logs before release. No entity facts fabricated or repeated @id definitions blindly removed. No source commit, PR, push or deployment. Prior metadata cleanup is phase04 work. Preserve checkpoint and user commits.\n\nPrimary guidance checked25October2026: https://developers.google.com/search/docs/appearance/structured-data/organization . Organization schema can help disambiguation; syntax does not guarantee search appearance. Companies House16994903 retrieval failed again; business identity remains owner supplied. FAQ documentation URL redirected to Search documentation updates; no FAQ rich-result promise made.');
write('QA_TEST_RESULTS.md', `# Tests\n\nCommand: node scripts/phase08-schema-inventory.mjs. Generated ${summary.at}. Input: reports/seo-stage-04/four-mode-audit.json. Outputs cover ${summary.pages} raw pages and their saved rendered comparisons. External validators and production not tested. Full lint/backend and performance gates remain separately open.`);
write('APPROVAL_AND_DEPLOYMENT.md', '# Status\n\nLocal audit only. No staging or live deployment, PR, webmaster submission, registry edit or account change. No production approval is requested until the implementation and evidence are reviewable.');
write('NEXT_STAGE_HANDOFF.md', '# Not a completed handoff\n\nStage08 source/schema facts, microdata/RDFa, semantic validators and visible-content review remain open. Stage09 prompt must be read completely before applying international SEO changes. No new countries, languages or hreflang pages should be invented.');
console.log(JSON.stringify(summary, null, 2));
