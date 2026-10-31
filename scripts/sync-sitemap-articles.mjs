import fs from 'fs';

const sitemapPath = 'public/sitemap.xml';
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

const slugs = [
  "complete-guide-non-resident-us-llc-formation-2026-wyoming-delaware-new-mexico-florida",
  "us-llc-vs-uk-ltd-for-global-ecommerce-amazon-walmart-ebay-shopify-compared",
  "opening-us-business-bank-account-without-visiting-america-mercury-relay-wise-payoneer",
  "amazon-fba-non-resident-playbook-entity-ein-sales-tax-bank-linking",
  "true-cost-running-us-llc-2026-state-fees-franchise-taxes-annual-reports-registered-agents",
  "itin-vs-ssn-for-non-us-residents-when-do-you-need-itin-how-to-get-one",
  "stripe-paypal-non-us-founders-prevent-bans-compliant-payment-infrastructure",
  "wyoming-llc-deep-dive-privacy-zero-state-tax-charging-order-protection",
  "best-us-state-dropshipping-print-on-demand-sales-tax-payment-gateways",
  "open-source-software-vs-expensive-saas-founders-save-5000-digibizos"
];

let addedCount = 0;
const entriesToAdd = [];

for (const slug of slugs) {
  const url = `https://www.digiformation.co.uk/blog/${slug}`;
  if (!sitemap.includes(url)) {
    entriesToAdd.push(`  <url><loc>${url}</loc><lastmod>2026-10-30</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`);
    addedCount++;
  } else {
    console.log(`Already in sitemap: ${url}`);
  }
}

if (entriesToAdd.length > 0) {
  const insertIndex = sitemap.lastIndexOf('</urlset>');
  if (insertIndex !== -1) {
    sitemap = sitemap.slice(0, insertIndex) + entriesToAdd.join('\n') + '\n' + sitemap.slice(insertIndex);
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log(`Added ${addedCount} cornerstone URLs to sitemap.xml.`);
  } else {
    console.error('Could not find </urlset> in sitemap.xml');
  }
} else {
  console.log('All cornerstone URLs already present in sitemap.xml.');
}
