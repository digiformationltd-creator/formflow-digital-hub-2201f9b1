// Narrow bulk mechanical rewrite: preserve the user's article copy byte-for-byte
// except known incorrect product-link origins and one verified legacy slug.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT } from './seo-runtime.mjs';
const file = path.join(ROOT, 'src/data/blog.ts');
const before = fs.readFileSync(file, 'utf8');
const replacements = [
  ['/open-source/digi-office', '/open-source/digioffice'],
  [String.raw`href=\"/open-source`, String.raw`href=\"https://www.digibizos.co.uk/open-source`],
  [String.raw`href=\"/download`, String.raw`href=\"https://www.digibizos.co.uk/download`],
  ['](/open-source', '](https://www.digibizos.co.uk/open-source'],
  ['](/download', '](https://www.digibizos.co.uk/download'],
];
let after = before;
const counts = replacements.map(([from, to]) => { const count = after.split(from).length - 1; after = after.replaceAll(from, to); return { from, to, count }; });
if (after === before) { console.log('No incorrect product link origins remain'); process.exit(0); }
const backup = path.join(ROOT, 'SEO_TRANSFORMATION/CHECKPOINTS/product-links-' + Date.now());
fs.mkdirSync(backup, { recursive: true }); fs.writeFileSync(path.join(backup, 'blog.ts'), before);
if (fs.readFileSync(file, 'utf8') !== before) throw new Error('Source changed during rewrite; no overwrite performed');
fs.writeFileSync(file, after);
fs.mkdirSync(path.join(ROOT, 'audit/phase-06'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'audit/phase-06/PRODUCT_LINK_REWRITE.json'), JSON.stringify({ at: new Date().toISOString(), beforeSha256: createHash('sha256').update(before).digest('hex'), afterSha256: createHash('sha256').update(after).digest('hex'), counts, backup, verifiedDirectory: 'https://www.digibizos.co.uk/open-source', scope: 'Link destination correction only; no verification of article software capability, commercial or comparative claims' }, null, 2));
console.log(JSON.stringify({ replacements: counts, backup }, null, 2));
