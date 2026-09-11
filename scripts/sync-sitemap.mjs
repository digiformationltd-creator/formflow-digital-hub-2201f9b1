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

const TODAY = new Date().toISOString().split("T")[0];

function getBlogPosts() {
  const tsx = fs.readFileSync(BLOG_FILE, "utf8");
  const posts = [];
  const regex = /slug:\s*["'](.*?)["'][\s\S]*?date:\s*["'](.*?)["']/g;
  for (const match of tsx.matchAll(regex)) {
    posts.push({ slug: match[1], date: match[2] || TODAY });
  }
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

  const posts = getBlogPosts();
  const block = buildBlock(posts);

  if (xml.includes(MARK_START) && xml.includes(MARK_END)) {
    const re = new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}`);
    xml = xml.replace(re, block);
  } else if (xml.includes(MARK_START)) {
    xml = xml.replace(/  <!-- Blog Posts[\s\S]*?(?=<\/urlset>)/, `${block}\n`);
  } else {
    xml = xml.replace("</urlset>", `\n${block}\n</urlset>`);
  }

  fs.writeFileSync(SITEMAP, xml);
  console.log(`✓ sitemap.xml synced (${posts.length} blog posts, authentic lastmod preserved)`);
}

syncSitemap();
