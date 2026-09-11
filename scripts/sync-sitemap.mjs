#!/usr/bin/env node
// Auto-syncs blog post slugs from src/data/blog.ts into public/sitemap.xml
// AND refreshes <lastmod> on every <url>. Runs before `vite build`.
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

function getSlugs() {
  const tsx = fs.readFileSync(BLOG_FILE, "utf8");
  return [...tsx.matchAll(/slug:\s*["'](.*?)["']/g)].map((m) => m[1]);
}

function buildBlock(slugs) {
  const urls = slugs
    .map(
      (s) =>
        `  <url><loc>https://www.digiformation.co.uk/blog/${s}</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.75</priority></url>`
    )
    .join("\n");
  return `${MARK_START}\n${urls}\n${MARK_END}`;
}

function refreshLastmod(xml) {
  // Ensure every <url> has a <lastmod>; refresh if present.
  return xml.replace(/<url>([\s\S]*?)<\/url>/g, (full, inner) => {
    let updated = inner;
    if (/<lastmod>.*?<\/lastmod>/.test(updated)) {
      updated = updated.replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${TODAY}</lastmod>`);
    } else if (/<loc>.*?<\/loc>/.test(updated)) {
      updated = updated.replace(/(<loc>.*?<\/loc>)/, `$1<lastmod>${TODAY}</lastmod>`);
    }
    return `<url>${updated}</url>`;
  });
}

function syncSitemap() {
  let xml = fs.readFileSync(SITEMAP, "utf8");
  // Replace any old domain occurrences
  xml = xml.replace(/https:\/\/(www\.)?digiformation\.uk/g, 'https://www.digiformation.co.uk');

  const slugs = getSlugs();
  const block = buildBlock(slugs);

  if (xml.includes(MARK_START) && xml.includes(MARK_END)) {
    const re = new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}`);
    xml = xml.replace(re, block);
  } else if (xml.includes(MARK_START)) {
    xml = xml.replace(/  <!-- Blog Posts[\s\S]*?(?=<\/urlset>)/, `${block}\n`);
  } else {
    xml = xml.replace("</urlset>", `\n${block}\n</urlset>`);
  }

  xml = refreshLastmod(xml);

  fs.writeFileSync(SITEMAP, xml);
  console.log(`✓ sitemap.xml synced (${slugs.length} blog posts, domain=https://www.digiformation.co.uk, lastmod=${TODAY})`);
}

syncSitemap();
