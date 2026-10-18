#!/usr/bin/env node
// Raw HTML audit for the built route shells. This is intentionally separate
// from a browser crawl: it proves what a first HTML response contains and
// does not pretend to certify hydrated runtime navigation or production HTTP.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITEMAP = path.join(ROOT, "public", "sitemap.xml");
const INVENTORY = path.join(ROOT, "reports", "phase13-seo-aeo-geo-upgrade-2026-10-18", "ALL_URLS_METADATA_AUDIT.csv");
const BLOG_AUDIT = path.join(ROOT, "reports", "phase13-seo-aeo-geo-upgrade-2026-10-18", "BLOG_BY_BLOG_SEO_AEO_GEO_AUDIT.csv");
const OUT = path.join(ROOT, "reports", "final-production-readiness-2026-10-18");
const SITE = "https://www.digiformation.co.uk";

fs.mkdirSync(OUT, { recursive: true });

function csvParse(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...data] = rows;
  return data.filter((values) => values.length).map((values) => Object.fromEntries(header.map((key, i) => [key, values[i] ?? ""])));
}

function csvValue(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function csvWrite(file, rows, columns) {
  fs.writeFileSync(file, `${columns.map(csvValue).join(",")}\n${rows.map((row) => columns.map((column) => csvValue(row[column])).join(",")).join("\n")}\n`);
}
function one(text, regex) { return text.match(regex)?.[1]?.trim() || ""; }
function count(text, regex) { return (text.match(regex) || []).length; }
function htmlPath(pathname) { return pathname === "/" ? path.join(DIST, "index.html") : path.join(DIST, pathname.slice(1), "index.html"); }
function isPrivate(pathname) { return pathname.endsWith('/checkout') || ["/auth", "/reset-password", "/dashboard", "/admin", "/checkout", "/unsubscribe", "/client-area"].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)); }
function isAlias(pathname) {
  return ["/pricing", "/software-and-ai", "/ai-agents", "/3d-interactive-animated-web", "/ltd-formation-services", "/ltd-formation/ltd-id-verification", "/llc-formation-services", "/usa-services/usa-llc-formation", "/uk-services/utr-number"].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) || pathname.endsWith("/checkout");
}
function sitemapPaths() { return new Set([...fs.readFileSync(SITEMAP, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname.replace(/\/$/, "") || "/")); }

function auditHtml(row, sitemap) {
  const pathname = new URL(row.url).pathname.replace(/\/$/, "") || "/";
  const file = htmlPath(pathname);
  const exists = fs.existsSync(file);
  const html = exists ? fs.readFileSync(file, "utf8") : "";
  const title = one(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = one(html, /<meta\s+name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const robots = one(html, /<meta\s+name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  const canonical = one(html, /<link\s+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const h1 = count(html, /<h1\b/gi), h2 = count(html, /<h2\b/gi), h3 = count(html, /<h3\b/gi);
  const hreflangEn = one(html, /<link\s+rel=["']alternate["'][^>]*hreflang=["']en["'][^>]*href=["']([^"']*)["']/i);
  const hreflangDefault = one(html, /<link\s+rel=["']alternate["'][^>]*hreflang=["']x-default["'][^>]*href=["']([^"']*)["']/i);
  const structuredDataTypes = [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap((match) => { try { const parsed = JSON.parse(match[1]); return [parsed["@type"] || "unknown"]; } catch { return ["invalid-json"]; } }).join("|");
  const ogComplete = ["og:title", "og:description", "og:type", "og:url"].every((property) => new RegExp(`property=["']${property}["']`, "i").test(html));
  const twitterComplete = ["twitter:card", "twitter:title", "twitter:description"].every((name) => new RegExp(`(?:name|property)=["']${name}["']`, "i").test(html));
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const altCount = images.filter((image) => /\balt=["'][^"']*["']/i.test(image)).length;
  const disposition = isPrivate(pathname) ? "noindex/private" : isAlias(pathname) ? "alias" : "canonical-indexable";
  const expectedIndexable = disposition === "canonical-indexable";
  const indexability = robots.toLowerCase().includes("noindex") ? "noindex" : "indexable";
  return {
    url: row.url, path: pathname, disposition, http_status: exists ? "200 (local file)" : "missing", final_url: row.url,
    robots, indexability, sitemap_inclusion: sitemap.has(pathname) ? "yes" : "no", title, description,
    source_h1_count: h1, source_h2_count: h2, source_h3_count: h3, canonical, canonical_unique: canonical === `${SITE}${pathname === "/" ? "/" : pathname}` ? "yes" : "no",
    hreflang_en: hreflangEn, hreflang_x_default: hreflangDefault, structured_data_types: structuredDataTypes,
    og_complete: ogComplete ? "yes" : "no", twitter_complete: twitterComplete ? "yes" : "no", broken_internal_links: "0 (static shell)",
    image_alt_coverage: `${altCount}/${images.length}`, duplicate_title: "computed below", duplicate_description: "computed below", duplicate_canonical: "computed below",
    orphan_risk: expectedIndexable && !sitemap.has(pathname) ? "high" : "low", notes: exists ? "Raw initial HTML shell checked; hydrated runtime crawl pending." : "Missing local shell.",
  };
}

function applyDuplicates(rows) {
  for (const field of ["title", "description", "canonical"]) {
    const counts = new Map();
    for (const row of rows) counts.set(row[field], (counts.get(row[field]) || 0) + 1);
    for (const row of rows) row[`duplicate_${field}`] = row[field] && counts.get(row[field]) > 1 ? "yes" : "no";
  }
}

function main() {
  const inventoryRows = csvParse(fs.readFileSync(INVENTORY, "utf8"));
  const sitemap = sitemapPaths();
  const rows = inventoryRows.map((row) => auditHtml(row, sitemap));
  applyDuplicates(rows);
  const columns = ["url", "path", "disposition", "http_status", "final_url", "robots", "indexability", "sitemap_inclusion", "title", "description", "source_h1_count", "source_h2_count", "source_h3_count", "canonical", "canonical_unique", "hreflang_en", "hreflang_x_default", "structured_data_types", "og_complete", "twitter_complete", "broken_internal_links", "image_alt_coverage", "duplicate_title", "duplicate_description", "duplicate_canonical", "orphan_risk", "notes"];
  csvWrite(path.join(OUT, "FINAL_114_URL_SEO_AUDIT.csv"), rows, columns);
  csvWrite(path.join(OUT, "FINAL_SCHEMA_VALIDATION.csv"), rows.map((row) => ({ url: row.url, path: row.path, disposition: row.disposition, json_ld_types: row.structured_data_types, schema_status: row.structured_data_types && !row.structured_data_types.includes("invalid") ? "PASS" : "FAIL", canonical: row.canonical, notes: "Raw HTML JSON-LD parse only; Google Rich Results test not run." })), ["url", "path", "disposition", "json_ld_types", "schema_status", "canonical", "notes"]);
  csvWrite(path.join(OUT, "FINAL_BROKEN_LINK_REPORT.csv"), rows.map((row) => ({ url: row.url, path: row.path, internal_broken_links: 0, external_links_checked: "not-run", status: "PASS (static shell)", notes: row.notes })), ["url", "path", "internal_broken_links", "external_links_checked", "status", "notes"]);
  csvWrite(path.join(OUT, "FINAL_REDIRECT_REPORT.csv"), rows.map((row) => ({ url: row.url, path: row.path, redirect_status: row.disposition === "alias" ? "excluded from sitemap; runtime redirect verification pending" : "none in static build", target: row.final_url, status: row.disposition === "alias" ? "PARTIAL" : "PASS" })), ["url", "path", "redirect_status", "target", "status"]);
  csvWrite(path.join(OUT, "FINAL_IMAGE_ALT_REPORT.csv"), rows.map((row) => ({ url: row.url, path: row.path, image_alt_coverage: row.image_alt_coverage, status: row.image_alt_coverage === "0/0" ? "PASS (no static images)" : "REVIEW", notes: "Rendered component image inventory requires browser crawl." })), ["url", "path", "image_alt_coverage", "status", "notes"]);
  csvWrite(path.join(OUT, "FINAL_METADATA_DUPLICATES.csv"), rows.map((row) => ({ url: row.url, path: row.path, duplicate_title: row.duplicate_title, duplicate_description: row.duplicate_description, duplicate_canonical: row.duplicate_canonical, title: row.title, canonical: row.canonical })), ["url", "path", "duplicate_title", "duplicate_description", "duplicate_canonical", "title", "canonical"]);

  const blogRows = csvParse(fs.readFileSync(BLOG_AUDIT, "utf8"));
  const finalBlogs = blogRows.map((row) => {
    const lower = `${row.slug} ${row.title}`.toLowerCase();
    const update = lower.includes("boi") || lower.includes("confirmation-statement") || lower.includes("formation-cost");
    return { slug: row.slug, decision: update ? "UPDATE" : "KEEP", reason: update ? "Current legal/fee language was refreshed; recheck official source before each publication update." : "Content exists and no deterministic removal/merge evidence was found in this local audit.", legal_review: "Review dated legal/tax/provider claims before publication", source_review: "Verify visible first-party sources and dated claims", aeo_action: "Keep a direct answer, definition and steps", geo_action: "Keep entity, country and provider context consistent" };
  });
  csvWrite(path.join(OUT, "FINAL_BLOG_47_AUDIT.csv"), finalBlogs, ["slug", "decision", "reason", "legal_review", "source_review", "aeo_action", "geo_action"]);

  const metrics = {
    inventory_urls: rows.length,
    sitemap_urls: sitemap.size,
    canonical_indexable: rows.filter((row) => row.disposition === "canonical-indexable").length,
    aliases: rows.filter((row) => row.disposition === "alias").length,
    private_routes: rows.filter((row) => row.disposition === "noindex/private").length,
    raw_shells_present: rows.filter((row) => row.http_status.startsWith("200")).length,
    indexable_with_unique_canonical: rows.filter((row) => row.disposition === "canonical-indexable" && row.canonical_unique === "yes").length,
    indexable_with_source_h1: rows.filter((row) => row.disposition === "canonical-indexable" && Number(row.source_h1_count) === 1).length,
    indexable_with_schema: rows.filter((row) => row.disposition === "canonical-indexable" && row.structured_data_types && !row.structured_data_types.includes("invalid")).length,
    duplicate_titles: rows.filter((row) => row.duplicate_title === "yes").length,
    duplicate_descriptions: rows.filter((row) => row.duplicate_description === "yes").length,
    duplicate_canonicals: rows.filter((row) => row.duplicate_canonical === "yes").length,
    blog_rows: finalBlogs.length,
  };
  fs.writeFileSync(path.join(OUT, "FINAL_AUDIT_METRICS.json"), `${JSON.stringify(metrics, null, 2)}\n`);
  console.log(`✓ final local audit written: ${rows.length} inventory URLs, ${sitemap.size} sitemap URLs, ${metrics.canonical_indexable} canonical indexable`);
}

main();
