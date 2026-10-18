import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const redirects = JSON.parse(fs.readFileSync(new URL('redirect-map.json', import.meta.url), 'utf8'));
const configFile = new URL('vercel.json', root);
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
config.redirects = Object.entries(redirects).map(([source, destination]) => ({ source, destination, permanent: true }));
fs.writeFileSync(configFile, JSON.stringify(config, null, 2) + '\n');
// Mechanical link normalization only. Route declarations remain in place for
// client compatibility; Vercel handles direct requests with permanent redirects.
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(tsx?|json)$/.test(entry.name) && entry.name !== 'App.tsx') {
      const before = fs.readFileSync(file, 'utf8');
      let after = before;
      const sourceCorrections = {
        'https://www.gov.uk/government/collections/economic-crime-and-corporate-transparency-act-2023': 'https://www.gov.uk/government/collections/identity-verification-for-companies-house',
        'https://www.gov.uk/government/collections/companies-house-data-and-statistics': 'https://www.gov.uk/government/organisations/companies-house/about/statistics',
        'https://www.irs.gov/businesses/small-businesses-self-employed/how-to-apply-for-an-ein': 'https://www.irs.gov/businesses/employer-identification-number',
        'https://www.fincen.gov/boi/boi-frequently-asked-questions': 'https://www.fincen.gov/boi',
        'guaranteed responsiveness and Core Web Vitals compliance': 'responsive layouts and measured Core Web Vitals optimization',
        'to guarantee 60 FPS and green Core Web Vitals': 'to measure frame rates and improve Core Web Vitals on representative devices',
      };
      for (const [oldValue, newValue] of Object.entries(sourceCorrections)) after = after.replaceAll(oldValue, newValue);
      for (const [source, target] of Object.entries(redirects)) {
        after = after.replaceAll('"' + source + '"', '"' + target + '"')
          .replaceAll('\\"' + source + '\\"', '\\"' + target + '\\"');
      }
      if (after !== before) fs.writeFileSync(file, after);
    }
  }
}
walk(fileURLToPath(new URL('src/', root)));
console.log('Redirect configuration and internal links normalized:', Object.keys(redirects).length);
