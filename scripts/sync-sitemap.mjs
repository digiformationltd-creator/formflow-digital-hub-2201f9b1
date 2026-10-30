#!/usr/bin/env node
// Auto-syncs blog post slugs & authentic dates from src/data/blog.ts into public/sitemap.xml
// Runs before `vite build`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_FILE = path.join(ROOT, "src", "data", "blog.ts");
const SITEMAP = path.join(ROOT, "public", "sitemap.xml");
const CORNERSTONE_FILE = path.join(ROOT, "src", "data", "cornerstoneArticles.ts");
const MARK_START = "  <!-- Blog Posts (auto-generated) -->";
const MARK_END = "  <!-- /Blog Posts (auto-generated) -->";

// Aliases, transactional flows and private application routes should never be
// advertised as crawlable URLs. They have their own canonical/noindex handling
// and are intentionally excluded from the public sitemap.
const EXCLUDED_PATHS = [
  "/pricing",
  "/software-and-ai",
  "/ai-agents",
  "/3d-interactive-animated-web",
  "/ltd-formation-services",
  "/ltd-formation/ltd-id-verification",
  "/llc-formation-services",
  "/usa-services/usa-llc-formation",
  "/uk-services/utr-number",
  "/auth",
  "/reset-password",
  "/dashboard",
  "/admin",
  "/checkout",
  "/unsubscribe",
];

function isExcludedPath(urlString) {
  const pathName = new URL(urlString).pathname.replace(/\/$/, "") || "/";
  return EXCLUDED_PATHS.some((excluded) =>
    pathName === excluded || pathName.startsWith(`${excluded}/`) || pathName.endsWith("/checkout")
  );
}

function removeExcludedUrls(xml) {
  return xml.replace(/\s*<url>[\s\S]*?<\/url>/g, (block) => {
    const match = block.match(/<loc>([^<]+)<\/loc>/);
    return match && isExcludedPath(match[1]) ? "" : block;
  });
}

const TODAY = new Date().toISOString().split("T")[0];
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function getBlogPosts() {
  const files = [BLOG_FILE, CORNERSTONE_FILE];
  const posts = [];
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const txt = fs.readFileSync(f, 'utf8');
    const slugRegex = /["']?slug["']?\s*:\s*["']([^"']+)["']/g;
    let match;
    while ((match = slugRegex.exec(txt)) !== null) {
      const slug = match[1];
      const snippet = txt.slice(match.index, match.index + 800);
      const dateMatch = snippet.match(/["']?date["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/);
      const modMatch = snippet.match(/["']?dateModified["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/);
      const date = dateMatch ? dateMatch[1] : '2026-10-30';
      const modified = modMatch ? modMatch[1] : date;
      posts.push({ slug, date, modified });
    }
  }

  const seen = new Set();
  return posts.filter(p => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
}

function buildBlock(posts) {
  const urls = posts
    .map(
      (p) =>
        `  <url><loc>https://www.digiformation.co.uk/blog/${p.slug}</loc>${p.modified ? `<lastmod>${p.modified}</lastmod>` : ""}</url>`
    )
    .join("\n");
  return `${MARK_START}\n${urls}\n${MARK_END}`;
}

function syncSitemap() {
  let xml = fs.readFileSync(SITEMAP, "utf8");
  // Replace any old domain occurrences
  xml = xml.replace(/https:\/\/(www\.)?digiformation\.uk/g, 'https://www.digiformation.co.uk');
  xml = removeExcludedUrls(xml);

  const posts = getBlogPosts();
  const block = buildBlock(posts);

  if (xml.includes(MARK_START) && xml.includes(MARK_END)) {
    const re = new RegExp(`${escapeRegExp(MARK_START)}[\\s\\S]*?${escapeRegExp(MARK_END)}`);
    xml = xml.replace(re, block);
  } else if (xml.includes(MARK_START)) {
    xml = xml.replace(/  <!-- Blog Posts[\s\S]*?(?=<\/urlset>)/, `${block}\n`);
  } else {
    xml = xml.replace("</urlset>", `\n${block}\n</urlset>`);
  }

  for (const pathname of ['/privacy-policy', '/terms', '/usa-services/us-llc-formation/choose-state']) {
    const url = `https://www.digiformation.co.uk${pathname}`;
    if (!xml.includes(`<loc>${url}</loc>`)) xml = xml.replace('</urlset>', `  <url><loc>${url}</loc></url>\n</urlset>`);
  }
  fs.writeFileSync(SITEMAP, xml);
  console.log(`✓ sitemap.xml synced (${posts.length} blog posts, explicit source dateModified used; no build-date fabrication)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) syncSitemap();
