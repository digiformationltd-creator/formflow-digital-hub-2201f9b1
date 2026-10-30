#!/usr/bin/env node
// Auto-syncs blog post slugs & authentic dates from src/data/blog.ts into public/sitemap.xml
// Runs before `vite build`.
import fs from "node:fs";
import ts from "typescript";
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

const CORNERSTONE_FILE = path.join(ROOT, "src", "data", "cornerstoneArticles.ts");

export function getBlogPosts(source = fs.readFileSync(BLOG_FILE, 'utf8')) {
  const extractFromArray = (arr) => {
    const collected = [];
    for (const element of arr.elements) {
      if (ts.isSpreadElement && ts.isSpreadElement(element)) {
        continue;
      }
      if (!ts.isObjectLiteralExpression(element)) continue;
      const value = name => {
        const property = element.properties.find(p => ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === name);
        return property && ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer) ? property.initializer.text : undefined;
      };
      const slug = value('slug'), date = value('date'), modified = value('dateModified');
      if (slug && /^[a-z0-9-]+$/.test(slug) && date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        collected.push({ slug, date, modified: modified || date });
      }
    }
    return collected;
  };

  const getArrayFromSource = (fileSrc) => {
    const file = ts.createSourceFile('file.ts', fileSrc, ts.ScriptTarget.Latest, true);
    for (const statement of file.statements) if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (declaration.initializer && ts.isArrayLiteralExpression(declaration.initializer)) {
          return declaration.initializer;
        }
      }
    }
    return null;
  };

  const mainArray = getArrayFromSource(source);
  if (!mainArray) throw new Error('blogPosts literal missing; refusing sitemap rewrite');
  
  let posts = [];
  if (fs.existsSync(CORNERSTONE_FILE)) {
    const csArray = getArrayFromSource(fs.readFileSync(CORNERSTONE_FILE, 'utf8'));
    if (csArray) {
      posts = posts.concat(extractFromArray(csArray));
    }
  }
  posts = posts.concat(extractFromArray(mainArray));

  if (!posts.length || new Set(posts.map(post => post.slug)).size !== posts.length) {
    // Deduplicate by slug keeping first occurrence
    const seen = new Set();
    posts = posts.filter(p => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    });
  }
  return posts;
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
