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

function getBlogPosts() {
  const tsx = fs.readFileSync(BLOG_FILE, "utf8");
  const posts = [];
  // Keep the match scoped to one object so a missing date cannot consume the
  // next post and silently truncate the sitemap.
  const regex = /\{[\s\S]*?slug:\s*["']([^"']+)["'][\s\S]*?date:\s*["'](\d{4}-\d{2}-\d{2})["'][\s\S]*?\},/g;
  for (const match of tsx.matchAll(regex)) {
    posts.push({ slug: match[1], date: match[2] || TODAY });
  }
  if (posts.length === 0) throw new Error("No dated blog posts found; refusing to rewrite sitemap.xml");
  const unique = new Set(posts.map((post) => post.slug));
  if (unique.size !== posts.length) throw new Error("Duplicate blog slug found; refusing to rewrite sitemap.xml");
  return posts;
}

function buildBlock(posts) {
  const urls = posts
    .map(
      (p) =>
        `  <url><loc>https://www.digiformation.co.uk/blog/${p.slug}</loc><lastmod>${p.date}</lastmod><changefreq>weekly</changefreq><priority>0.75</priority></url>`
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
  console.log(`✓ sitemap.xml synced (${posts.length} blog posts, authentic lastmod preserved)`);
}

syncSitemap();
