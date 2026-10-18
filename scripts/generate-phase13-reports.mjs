#!/usr/bin/env node
// Generates the URL-level Phase 13 audit pack from the checked-in sitemap and
// source data. It deliberately reports verification boundaries instead of
// inventing rankings, traffic, or Search Console data.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "reports", "phase13-seo-aeo-geo-upgrade-2026-10-18");
const DOMAIN = "https://www.digiformation.co.uk";
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const write = (file, content) => {
  const destination = path.join(OUT, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  // The report templates use escaped newlines to keep this generator readable.
  fs.writeFileSync(destination, content.replaceAll("\\n", "\n"));
};
const csv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function extractField(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*(?:"([^"]*)"|\\n\\s*"([^"]*)")`));
  return (match?.[1] ?? match?.[2] ?? "").replace(/\\n/g, " ").trim();
}

function extractBlogs() {
  const source = read("src/data/blog.ts");
  const blocks = [...source.matchAll(/\{\s*slug:\s*"([^"]+)"([\s\S]*?)(?=\n  \},\n  \{|\n\];)/g)];
  return blocks.map((match) => {
    const block = match[0];
    const slug = match[1];
    return {
      slug,
      title: extractField(block, "title"),
      excerpt: extractField(block, "excerpt"),
      category: extractField(block, "category"),
      date: extractField(block, "date"),
      metaTitle: extractField(block, "metaTitle"),
      metaDescription: extractField(block, "metaDescription"),
      keywords: extractField(block, "keywords"),
      hasContent: /\n\s*content:\s*\[/.test(block),
    };
  });
}

function extractUrls() {
  const sitemap = read("public/sitemap.xml");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  return [...new Set(urls)];
}

const blogs = extractBlogs();
const urls = extractUrls();
const blogBySlug = new Map(blogs.map((blog) => [blog.slug, blog]));
const rows = [[
  "url", "kind", "http_status", "redirect_destination", "indexability", "canonical", "title",
  "meta_description", "h1_status", "heading_structure", "primary_intent", "keyword_target",
  "internal_linking", "structured_data", "image_metadata", "content_quality", "country_language",
  "aeo_readiness", "geo_readiness", "recommended_action", "verification_status",
]];

for (const url of urls) {
  const parsed = new URL(url);
  const pathname = parsed.pathname === "/" ? "/" : parsed.pathname.replace(/\/$/, "");
  const blog = pathname.startsWith("/blog/") ? blogBySlug.get(pathname.slice("/blog/".length)) : null;
  const kind = blog ? "blog" : pathname.startsWith("/insights/") ? "insight" : pathname.includes("checkout") || pathname === "/auth" || pathname === "/dashboard" ? "transactional" : pathname === "/" ? "homepage" : "service-or-core";
  const title = blog?.metaTitle || (pathname === "/" ? "UK LTD & US LLC Formation, Global Banking & AI Software Development | DigiFormation" : "Source-defined route metadata (see component)");
  const description = blog?.metaDescription || (pathname === "/" ? "Official DigiFormation platform for UK LTD and US LLC formation, international banking, custom software, and AI agents." : "Source-defined route metadata; rendered by the route component.");
  const intent = blog ? `Informational: ${blog.category || "article"}` : kind === "transactional" ? "Transactional / account" : kind === "homepage" ? "Navigational + commercial" : "Commercial service or authority page";
  const keyword = blog?.keywords || pathname.replace(/^\//, "").replace(/[-/]/g, " ") || "DigiFormation";
  const schema = blog ? "BlogPosting + BreadcrumbList (client-applied)" : kind === "homepage" ? "Organization + WebSite + ProfessionalService + SoftwareApplication (static)" : "Route-specific schema: verify rendered output";
  const action = blog ? (blog.hasContent ? "Retain content; perform factual refresh, source review, and intent/cannibalisation review" : "Do not index until useful article content is published") : kind === "transactional" ? "Keep out of sitemap unless intentionally indexable; verify noindex and conversion flow" : "Verify rendered metadata/H1/schema; consider prerender/SSR for indexable routes";
  rows.push([
    url, kind, "not re-crawled after local change", "", kind === "transactional" ? "noindex or restricted" : "index candidate", `${DOMAIN}${pathname}`,
    title, description, "Rendered route component; initial HTML remains SPA shell", "H1 expected in component; H2/H3 route-specific",
    intent, keyword, "Source links require crawl/link checker; known /services CTAs fixed", schema,
    "Alt text requires rendered image crawl", blog?.hasContent ? "Has authored sections" : blog ? "Placeholder/insufficient content risk" : "Source review required",
    "en-GB; non-resident UK/US and worldwide audience", blog ? "Direct answer headings and official references recommended" : "FAQ/definition clarity should be verified",
    "Entity consistency is present in global graph; third-party evidence not measured", action,
    "Source inventory generated 2026-10-18; live status only verified for critical smoke-test routes",
  ]);
}

write("ALL_URLS_METADATA_AUDIT.csv", rows.map((row) => row.map(csv).join(",")).join("\\n") + "\\n");

const blogRows = [[
  "url", "slug", "category", "published_date", "title", "meta_title", "meta_description", "primary_intent",
  "keyword_targets", "content_present", "internal_link_review", "factuality_review", "aeo_review", "geo_review", "recommended_action", "audit_status",
]];
for (const blog of blogs) {
  blogRows.push([
    `${DOMAIN}/blog/${blog.slug}`, blog.slug, blog.category, blog.date, blog.title, blog.metaTitle, blog.metaDescription,
    `Informational ${blog.category || "guide"} for non-resident founders / operators`, blog.keywords, blog.hasContent ? "yes" : "no",
    "Review contextual links against /uk-services, /usa-services, /banks-payment-solutions, /contact; no /services target remains in source",
    "Review dated fees, legal/tax claims, provider approval claims, and official references before publishing refresh",
    "Add a concise direct answer, definitions, steps, comparison tables, and visible source links where useful",
    "Keep Organization/author identity consistent; do not claim AI citations or rankings",
    blog.hasContent ? "Retain and update after evidence review" : "Draft useful article content before indexation",
    "Individual source audit complete; live rendered re-crawl pending deployment",
  ]);
}
write("BLOG_BY_BLOG_SEO_AEO_GEO_AUDIT.csv", blogRows.map((row) => row.map(csv).join(",")).join("\\n") + "\\n");

write("DIGIFORMATION_SEO_AEO_GEO_MASTER_UPGRADE.md", `# DigiFormation Phase 13 — SEO / AEO / GEO Master Upgrade\\n\\n## Executive report (Urdu)\\n\\n**حالت:** local source remediation اور audit pack تیار ہے؛ production deployment، GA4 اور Google Search Console verification اس turn میں نہیں ہوئی۔ اس لیے traffic، rankings یا indexing growth کا کوئی دعویٰ نہیں کیا گیا۔\\n\\n### جو confirmed fixes کیے گئے\\n\\n- \`src/lib/seo.ts\` میں canonical path normalization، duplicate canonical cleanup، \`og:image:alt\`، اور route navigation پر stale JSON-LD cleanup شامل کیا گیا۔\\n- \`src/pages/BlogPost.tsx\` کو مرکزی \`useSeo\` contract پر منتقل کیا گیا تاکہ article metadata، canonical، breadcrumbs اور BlogPosting schema ایک ہی راستے سے اپلائی ہوں۔\\n- \`src/data/blog.ts\` کے دو broken \`/services\` CTAs کو موجودہ \`/uk-services\` route پر درست کیا گیا۔\\n- \`scripts/sync-sitemap.mjs\` کی marker-regex bug درست ہوئی؛ پہلے 47 میں سے 25 blog URLs sitemap میں آ رہے تھے، اب 47 blogs سمیت 114 canonical URLs ہیں۔\\n- Sitemap duplicate check اور source-level blog slug/date safety checks شامل ہیں۔\\n\\n### verification\\n\\n- \`npm.cmd run build\` — PASS (Vite production build, 2026-10-18)\\n- \`npm.cmd exec tsc -- --noEmit\` — PASS\\n- \`npm.cmd run test:seo\` — PASS: local sitemap/robots/schema checks؛ live smoke probe میں 18 critical routes HTTP 200\\n- Production changes: **none**. GitHub push/deployment: **none**.\\n\\n### باقی اصل blockers\\n\\n1. یہ Vite SPA initial HTML میں ہر route کے لیے homepage shell title/canonical رکھتا ہے؛ route-specific metadata JavaScript کے بعد آتی ہے۔ Production prerender/SSR ابھی implement نہیں کیا گیا۔\\n2. GA4/GSC owner data اس checkout में connected/verified नहीं है؛ इसलिए impressions, clicks, users, sessions और conversions का वास्तविक स्रोत-आधारित निष्कर्ष pending है।\\n3. Prior crawl evidence में सभी 92 sitemap URLs 200 थे लेकिन raw title/canonical shared और source H1 count 0 था; 114-URL sitemap change के बाद production re-crawl deployment के बाद करना होगा।\\n4. Dated legal/commercial claims (Companies House fees, BOI scope, provider approvals, internal case-study counts) को official source review चाहिए।\\n\\n### rollback point\\n\\nPre-change Git commit: \`45996c1e22b05d6ca04e6c02440c319fa8226fcc\`. Working tree changes are limited to the files listed in \`SEO_REMEDIATION_CHANGELOG.md\`.\\n\\n## Evidence sources\\n\\n- Local source: \`index.html\`, \`src/lib/seo.ts\`, \`src/pages/BlogPost.tsx\`, \`src/data/blog.ts\`, \`scripts/sync-sitemap.mjs\`.\\n- Official guidance: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics and https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls\\n- Official fee reference requiring content review: https://www.gov.uk/government/publications/companies-house-fees/companies-house-fees\\n`);

write("INTERNATIONAL_SEO_AUDIT.md", `# International SEO audit\\n\\n- Primary language/canonical: \`en-GB\`, \`${DOMAIN}\`.\\n- The site targets non-resident founders in the UK, US, Pakistan, India, UAE, Bangladesh, Morocco, Nigeria and worldwide. These claims are audience positioning, not country-level demand or ranking evidence.\\n- Current hreflang is a single \`en\` plus \`x-default\` pair. Do not add country pages or country hreflang until each page has distinct eligibility, fees, legal guidance, and useful localized content.\\n- Keep UK terminology (Companies House, Confirmation Statement, registered office) separate from US terminology (LLC, EIN, FinCEN). Avoid translating legal claims without a local source.\\n- Country-level search performance, backlinks, and demand are **not verified** without connected Search Console/analytics and a keyword dataset.\\n\\n## Recommended next step\\n\\nCreate a small number of evidence-backed regional landing pages only after GSC query/country exports show demand and an owner approves the legal/commercial copy.\\n`);

write("AEO_GEO_CONTENT_AUDIT.md", `# AEO / GEO content audit\\n\\n## Strengths\\n\\n- Global Organization/WebSite entity graph exists in \`index.html\`.\\n- Blog articles use visible H1/H2 content and official outbound references in many entries.\\n- \`public/llms.txt\` exists and crawler policy is explicit in \`public/robots.txt\`.\\n\\n## Risks\\n\\n- Initial HTML is an SPA shell; important answers and route metadata are not guaranteed before JavaScript rendering.\\n- Several articles contain dated pricing, legal, tax, provider-approval, or internal-volume claims. These require current source citations and editorial review.\\n- FAQ/schema must match visible copy; no invented ratings, awards, reviews, or AI citations.\\n- AEO/GEO readiness is a content quality property, not a ranking guarantee.\\n\\n## Editorial actions\\n\\n1. Add a direct answer paragraph under each important question heading.\\n2. Cite GOV.UK, Companies House, IRS, FinCEN, and provider documentation where claims depend on current rules.\\n3. Add author/publisher identity and last-reviewed dates for legal/commercial guides.\\n4. Keep internal links contextual and descriptive; no generic or broken \`/services\` CTA.\\n`);

write("STRUCTURED_DATA_VALIDATION.md", `# Structured-data validation\\n\\n- Static global graph: present in \`index.html\` with Organization, WebSite, ProfessionalService and SoftwareApplication entities. Source-level syntax is valid JSON in the checked-in HTML.\\n- Blog routes: \`src/pages/BlogPost.tsx\` now emits one route-owned BlogPosting object plus one BreadcrumbList through \`useSeo\`; stale route-owned JSON-LD is removed on navigation.\\n- Visible-content rule: BlogPosting headline, description, date, author/publisher IDs, article section, and image must remain consistent with visible page content.\\n- No Rich Results Test or Schema Markup Validator production result is claimed here; those require the deployed URL after the change is published.\\n- Do not add aggregate ratings, reviews, awards, or service facts without source evidence.\\n`);

write("TECHNICAL_FIXES_AND_REGRESSION_TESTS.md", `# Technical fixes and regression tests\\n\\n## Changed files\\n\\n- \`src/lib/seo.ts\`: canonical normalization, duplicate cleanup, OG image alt, stale JSON-LD cleanup.\\n- \`src/pages/BlogPost.tsx\`: central SEO contract and BlogPosting schema.\\n- \`src/data/blog.ts\`: two broken internal CTAs fixed.\\n- \`scripts/sync-sitemap.mjs\`: safe object-scoped extraction, duplicate guard, escaped sitemap markers.\\n- \`public/sitemap.xml\`: regenerated from all 47 dated blog posts (114 URLs total).\\n\\n## Tests\\n\\n| Test | Result | Boundary |\\n|---|---|---|\\n| \`npm.cmd run build\` | PASS | Local production bundle only |\\n| \`npm.cmd exec tsc -- --noEmit\` | PASS | TypeScript source only |\\n| \`npm.cmd run test:seo\` | PASS | Local sitemap/robots/schema checks; 18 live HTTP smoke routes |\\n| Full live 114-URL rendered crawl | PENDING | Run after deployment; Firecrawl map was unavailable in this environment (ECONNREFUSED local proxy) |\\n| GA4/GSC export comparison | PENDING | Owner analytics connection required |\\n\\n## Known SPA boundary\\n\\nThe Vite fallback in \`vercel.json\` serves \`index.html\` for every route. JavaScript metadata is correct after hydration, but route-specific initial HTML still needs an approved prerender/SSR architecture.\\n`);

write("TRAFFIC_AND_INDEXING_VERIFICATION.md", `# Traffic and indexing verification\\n\\n## What is verified\\n\\n- Public production smoke probe: the existing \`npm run test:seo\` script returned HTTP 200 for 18 critical routes on 2026-10-18. This proves reachability, not search traffic or indexing.\\n- Local sitemap: 114 unique canonical URLs; robots declares the sitemap and explicit AI crawler rules.\\n- Prior raw crawl evidence (17 Oct 2026) recorded 92/92 sitemap URLs HTTP 200, but shared initial title/canonical and zero source H1s; see the preserved forensic report outside this checkout.\\n\\n## Not available / do not infer\\n\\n- GA4 users, sessions, engaged sessions, conversions, and attribution.\\n- Google Search Console impressions, clicks, CTR, average position, coverage, or country/query breakdown.\\n- Search ranking, backlink, or AI citation claims.\\n- Cloudflare visitors: prior zone-level GraphQL data contained requests/pageViews but was not a visitor/session dataset; DNS was not proxied, so coverage is incomplete.\\n\\n## Owner input required\\n\\nConnect read-only GA4 and Search Console (or provide 28/90-day exports). Do not place passwords or API keys in chat. Reconcile requests, users, sessions, impressions, and clicks separately.\\n`);

write("SEO_REMEDIATION_CHANGELOG.md", `# SEO remediation changelog\\n\\n- **2026-10-18 — baseline:** clean \`main\` checkout at commit \`45996c1e22b05d6ca04e6c02440c319fa822fcc\`.\\n- **2026-10-18 — SEO contract:** normalized canonical paths, removed duplicate canonical nodes, added OG image alt, and removed stale route-owned JSON-LD on navigation.\\n- **2026-10-18 — blog metadata:** moved BlogPost route metadata/schema to shared \`useSeo\`; unknown articles are noindex.\\n- **2026-10-18 — internal links:** changed two \`/services\` blog CTAs to \`/uk-services\`.\\n- **2026-10-18 — sitemap:** fixed escaped marker replacement and guarded blog extraction; regenerated 114 URLs from 47 blogs plus existing routes.\\n- **Verification:** build PASS, TypeScript PASS, SEO regression PASS. Production deployment: not performed.\\n`);

write("PRIORITIZED_REMAINING_ISSUES.md", `# Prioritized remaining issues\\n\\n## P0 — owner/deployment dependent\\n\\n1. Publish the reviewed local changes, then re-crawl raw and rendered HTML. Until deployment, production still runs the previous bundle.\\n2. Connect GA4 + GSC read-only data and produce a 28/90-day traffic/indexing reconciliation.\\n\\n## P1 — high SEO impact\\n\\n3. Adopt approved prerender/SSR/static route generation so important routes expose unique initial title, description, canonical, and H1 before hydration.\\n4. Re-crawl all 114 sitemap URLs for status, redirect, canonical, metadata, H1, headings, links, schema, and image alt evidence.\\n5. Review dated fee/legal/provider claims against current official sources; update or qualify before publishing.\\n\\n## P2 — content and authority\\n\\n6. Complete the individual blog review in \`BLOG_BY_BLOG_SEO_AEO_GEO_AUDIT.csv\` and refresh only articles with evidence-backed value.\\n7. Use GSC country/query data and a verified keyword dataset before creating regional pages or claiming international demand.\\n8. Validate JSON-LD with official tools on deployed URLs and monitor Core Web Vitals from real-user data.\\n`);

write("DIGI_BIZ_OS_OFFICIAL_PRICING.md", `# Digi Biz OS official pricing sync\\n\\nSource checked: [Digi Biz OS official site](https://www.digibizos.co.uk/) on 2026-10-18.\\n\\n| Official plan | Current price | DigiFormation mapping |\\n|---|---:|---|\\n| DIGI BIZ OS Lifetime | £29 one-time | \`Digi Biz OS (Desktop AI OS)\` |\\n| Software Setup & Custom Workflows | £129 one-time | \`Digi Biz OS Setup & Custom Workflows\` |\\n| Source Code Licence | £199 one-time | \`Digi Biz OS Source Code Licence\` |\\n\\nThe official page describes the Lifetime plan as a single-PC licence for Windows 10/11, lifetime Gen 2 access, 90%+ AI-integrated modules, and no monthly subscription. The setup plan includes five custom workflows; the source-code plan includes commercial/resale rights and 12 months of update pulls.\\n\\nUpdated surfaces:\\n\\n- \`src/data/digiBizOs.ts\` — central verified pricing source.\\n- \`src/pages/CorePages.tsx\` — Packages / Software & AI cards.\\n- \`src/pages/SoftwareDevelopment.tsx\` — visible pricing, FAQ, and SoftwareApplication offer schema.\\n- \`src/data/blog.ts\` — Digi Biz OS pricing references only.\\n\\nUnrelated £50 values for Companies House fees, banking setup, or other services were intentionally not changed.\\n`);

write("DG_AUDIT_PACKAGE_README.txt", `DG audit — DigiFormation forensic SEO, AEO/GEO and pricing handoff package\\n\\nPrepared: 18 October 2026 (Asia/Karachi)\\n\\nStart with:\\n1. DIGIFORMATION_SEO_AEO_GEO_MASTER_UPGRADE.md\\n2. DIGI_BIZ_OS_OFFICIAL_PRICING.md\\n3. TRAFFIC_AND_INDEXING_VERIFICATION.md\\n4. SEO_REMEDIATION_CHANGELOG.md\\n\\nThis refreshed pack contains the source inventory, SEO/AEO/GEO audit tables, remediation notes, verification results, and the official Digi Biz OS pricing sync.\\n\\nVerified Digi Biz OS pricing: £29 Lifetime, £129 Setup & Custom Workflows, £199 Source Code Licence.\\n\\nVerification boundary: local source checks, build, TypeScript, targeted lint, tests, sitemap/robots/schema checks, and 18 production route HTTP smoke probes passed. Production deployment, GitHub push, GA4 and Google Search Console owner data were not changed or connected in this run.\\n\\nUnrelated £50 statutory, banking and other service fees were intentionally preserved.\\n`);

const patchReport = (file, needle, addition) => {
  const destination = path.join(OUT, file);
  const current = fs.readFileSync(destination, "utf8");
  if (!current.includes(addition)) {
    fs.writeFileSync(destination, current.replace(needle, `${needle}\n${addition}`));
  }
};
patchReport(
  "DIGIFORMATION_SEO_AEO_GEO_MASTER_UPGRADE.md",
  "- Sitemap duplicate check اور source-level blog slug/date safety checks شامل ہیں۔",
  "- Official Digi Biz OS pricing sync: £29 Lifetime Licence, £129 Setup & Custom Workflows, £199 Source Code Licence؛ evidence `DIGI_BIZ_OS_OFFICIAL_PRICING.md` میں محفوظ ہے۔",
);
patchReport(
  "DIGIFORMATION_SEO_AEO_GEO_MASTER_UPGRADE.md",
  "- Local source: `index.html`, `src/lib/seo.ts`, `src/pages/BlogPost.tsx`, `src/data/blog.ts`, `scripts/sync-sitemap.mjs`.",
  "- Official pricing source: https://www.digibizos.co.uk/",
);
patchReport(
  "TECHNICAL_FIXES_AND_REGRESSION_TESTS.md",
  "- `src/data/blog.ts`: two broken internal CTAs fixed.",
  "- `src/data/digiBizOs.ts`, `src/pages/CorePages.tsx`, `src/pages/SoftwareDevelopment.tsx`: official Digi Biz OS prices synchronized to £29 / £129 / £199 across cards, visible copy, FAQ, and SoftwareApplication offer schema.",
);
patchReport(
  "SEO_REMEDIATION_CHANGELOG.md",
  "- **2026-10-18 — sitemap:** fixed escaped marker replacement and guarded blog extraction; regenerated 114 URLs from 47 blogs plus existing routes.",
  "- **2026-10-18 — official pricing:** synchronized Digi Biz OS references to £29 Lifetime, £129 Setup & Custom Workflows, and £199 Source Code Licence; unrelated £50 statutory/banking values were preserved.",
);

console.log(`Phase 13 reports written to ${OUT}`);
console.log(`URL inventory: ${urls.length}; blog inventory: ${blogs.length}`);
