#!/usr/bin/env node
// Generates crawlable route shells after the Vite build. The React app still
// hydrates/replaces #root at runtime, but bots and link unfurlers receive a
// route-specific title, description, canonical, hreflang, JSON-LD and H1 in
// the initial HTML response.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE = "https://www.digiformation.co.uk";
const SITEMAP = path.join(ROOT, "public", "sitemap.xml");

const PRIVATE_PREFIXES = [
  "/auth",
  "/reset-password",
  "/dashboard",
  "/admin",
  "/checkout",
  "/unsubscribe",
  "/client-area",
];

const CORE = {
  "/": ["DigiFormation — Worldwide Company Formation & Business Setup", "Form a UK Ltd or US LLC remotely with company formation, compliance, banking guidance and websites for international founders."],
  "/id-verification": ["UK Companies House ID Verification 2026 | Director & PSC Check — £20", "Official UK Companies House Identity Verification service under ECCTA 2023. Fast digital verification for UK & non-resident directors, PSCs, and officers for £20."],
  "/about": ["About DigiFormation — Worldwide Business Setup Specialists", "Meet DigiFormation: practical company formation, compliance and digital business support for founders worldwide."],
  "/contact": ["Contact DigiFormation — Talk to a Business Setup Specialist", "Contact DigiFormation for UK company formation, U.S. setup, compliance, banking guidance and website support."],
  "/packages": ["Company Formation Packages — DigiFormation", "Compare DigiFormation packages for UK LTD formation, U.S. LLC setup, compliance, banking guidance and digital services."],
  "/faq": ["Frequently Asked Questions — DigiFormation", "Answers about UK and U.S. company formation, identity verification, compliance, banking and digital services."],
  "/blog": ["DigiFormation Blog — Company Formation & Compliance Guides", "Practical, source-led guides covering company formation, compliance, banking, tax IDs and digital growth for global founders."],
  "/insights": ["DigiFormation Insights — Data-Led Formation & Compliance Research", "Research reports on company formation costs, compliance, payment providers and worldwide business setup."],
  "/software-development": ["Custom Software Development — DigiFormation", "Build secure, scalable business software, automations and dashboards with DigiFormation's product engineering team."],
  "/web-development": ["Web Development & 3D Experiences — DigiFormation", "Fast, accessible websites and interactive 3D experiences designed for trust, conversion and measurable growth."],
  "/uk-services": ["UK Company Formation & Compliance Services", "Form and maintain a UK company remotely with registered office, identity verification, UTR and annual compliance support."],
  "/uk-compliance": ["UK Company Compliance Services — DigiFormation", "Stay on top of Companies House and HMRC obligations with practical UK company compliance support."],
  "/usa-services": ["U.S. Company Formation & Compliance Services", "Launch and maintain a U.S. company remotely with LLC formation, EIN, ITIN, banking guidance and conditional BOI review."],
  "/banks-payment-solutions": ["Business Banking & Payment Solutions — DigiFormation", "Compare legitimate banking and payment-provider routes for international companies; approvals remain subject to each provider's checks."],
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function json(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function humanize(pathname) {
  const last = pathname.split("/").filter(Boolean).pop() || "DigiFormation";
  return last
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseBlogMetadata() {
  const source = fs.readFileSync(path.join(ROOT, "src", "data", "blog.ts"), "utf8");
  const result = new Map();
  const regex = /slug:\s*["']([^"']+)["'][\s\S]*?title:\s*["']([^"']+)["'][\s\S]*?excerpt:\s*["']([^"']*)["'][\s\S]*?metaTitle:\s*["']([^"']+)["'][\s\S]*?metaDescription:\s*["']([^"']*)["']/g;
  for (const match of source.matchAll(regex)) {
    result.set(`/blog/${match[1]}`, {
      title: match[4] || match[2],
      description: match[5] || match[3],
      h1: match[2],
      type: "BlogPosting",
    });
  }
  return result;
}

function parseInsightMetadata() {
  const source = fs.readFileSync(path.join(ROOT, "src", "data", "insights.ts"), "utf8");
  const result = new Map();
  const regex = /slug:\s*["']([^"']+)["'][\s\S]*?title:\s*["']([^"']+)["'][\s\S]*?metaTitle:\s*["']([^"']+)["'][\s\S]*?metaDescription:\s*["']([^"']*)["']/g;
  for (const match of source.matchAll(regex)) {
    result.set(`/insights/${match[1]}`, {
      title: match[3] || match[2],
      description: match[4],
      h1: match[2],
      type: "Article",
    });
  }
  return result;
}

function getMetadata(pathname, blogs, insights) {
  if (PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return {
      title: "DigiFormation Portal — Secure Client Area",
      description: "Secure login, dashboard and company filing portal for DigiFormation clients.",
      h1: "Client Portal",
      noindex: true,
    };
  }
  if (CORE[pathname]) {
    const [title, description] = CORE[pathname];
    return { title, description, h1: humanize(pathname), type: "WebPage" };
  }
  if (blogs.has(pathname)) return blogs.get(pathname);
  if (insights.has(pathname)) return insights.get(pathname);
  return {
    title: `${humanize(pathname)} — DigiFormation`,
    description: `DigiFormation support for ${humanize(pathname).toLowerCase()} and international business setup.`,
    h1: humanize(pathname),
    type: "WebPage",
  };
}

function sitemapPaths() {
  const xml = fs.readFileSync(SITEMAP, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname.replace(/\/$/, "") || "/");
}

function removeDynamicHead(html) {
  return html
    .replace(/\s*<title>[\s\S]*?<\/title>/i, "")
    .replace(/\s*<meta\s+name=["']description["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+name=["']robots["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+name=["']googlebot["'][^>]*>/gi, "")
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/\s*<link\s+rel=["']alternate["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "")
    .replace(/\s*<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "");
}

function buildHtml(template, pathname, metadata) {
  const canonical = `${SITE}${pathname === "/" ? "/" : pathname}`;
  const robots = metadata.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large";
  const entityGraph = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i)?.[1];
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": metadata.type || "WebPage",
      name: metadata.title,
      description: metadata.description,
      url: canonical,
      isPartOf: { "@type": "WebSite", name: "DigiFormation", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: pathname === "/" ? [] : pathname.split("/").filter(Boolean).map((part, index, parts) => ({
        "@type": "ListItem", position: index + 1, name: humanize(part), item: `${SITE}/${parts.slice(0, index + 1).join("/")}`,
      })),
    },
  ];
  if (metadata.type === "BlogPosting") schema[0].headline = metadata.h1;
  const head = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}">`,
    `<meta name="robots" content="${robots}">`,
    `<meta name="googlebot" content="${robots}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<link rel="alternate" hreflang="en" href="${escapeHtml(canonical)}">`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(canonical)}">`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}">`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}">`,
    `<meta property="og:type" content="${metadata.type === "BlogPosting" ? "article" : "website"}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta property="og:site_name" content="DigiFormation">`,
    `<meta property="og:image" content="${SITE}/favicon-512.png">`,
    `<meta property="og:image:alt" content="DigiFormation company logo">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}">`,
    `<meta name="twitter:image" content="${SITE}/favicon-512.png">`,
    ...(entityGraph ? [`<script id="ldjson-global" type="application/ld+json">${entityGraph}</script>`] : []),
    `<script id="ldjson-page" type="application/ld+json">${json(schema[0])}</script>`,
    `<script id="ldjson-breadcrumbs" type="application/ld+json">${json(schema[1])}</script>`,
  ].join("\n    ");
  const staticBody = `<main data-seo-prerender="true"><h1>${escapeHtml(metadata.h1)}</h1><p>${escapeHtml(metadata.description)}</p></main>`;
  return removeDynamicHead(template)
    .replace("</head>", `    ${head}\n  </head>`)
    .replace(/<div id="root"[^>]*>[\s\S]*?<\/div>/i, `<div id="root">${staticBody}</div>`);
}

function writeRoute(pathname, html) {
  if (pathname === "/") {
    fs.writeFileSync(path.join(DIST, "index.html"), html);
    return;
  }
  const output = path.join(DIST, pathname.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html);
}

function main() {
  if (!fs.existsSync(path.join(DIST, "index.html"))) throw new Error("dist/index.html missing; run vite build first");
  const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
  const blogs = parseBlogMetadata();
  const insights = parseInsightMetadata();
  const paths = [...new Set([...sitemapPaths(), ...PRIVATE_PREFIXES])];
  for (const pathname of paths) writeRoute(pathname, buildHtml(template, pathname, getMetadata(pathname, blogs, insights)));
  console.log(`✓ prerendered ${paths.length} route shells (${blogs.size} blog metadata records, ${insights.size} insight records)`);
}

main();
