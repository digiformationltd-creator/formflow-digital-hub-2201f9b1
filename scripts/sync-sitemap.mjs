#!/usr/bin/env node
// Auto-syncs blog post slugs & authentic dates from src/data/blog.ts into public/sitemap.xml
// Runs before `vite build`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from 'typescript';

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

export function getBlogPosts(input) {
  const sources = input === undefined ? [BLOG_FILE,CORNERSTONE_FILE].map(file=>fs.readFileSync(file,'utf8')) : [input];
  const posts=[];
  for(const text of sources){
    const source=ts.createSourceFile('content.ts',text,ts.ScriptTarget.Latest,true);
    for(const statement of source.statements)if(ts.isVariableStatement(statement))for(const decl of statement.declarationList.declarations){
      if(!['blogPosts','cornerstoneArticles'].includes(decl.name.getText(source))||!decl.initializer||!ts.isArrayLiteralExpression(decl.initializer))continue;
      for(const item of decl.initializer.elements){
        if(ts.isSpreadElement(item)&&item.expression.getText(source)==='cornerstoneArticles'&&input===undefined)continue;
        if(!ts.isObjectLiteralExpression(item))throw new Error('Unsupported blog record/spread');
        const field=name=>{const p=item.properties.find(p=>ts.isPropertyAssignment(p)&&(ts.isIdentifier(p.name)||ts.isStringLiteral(p.name))&&p.name.text===name);if(!p)return undefined;if(!ts.isStringLiteralLike(p.initializer))throw new Error('Nonliteral blog '+name);return p.initializer.text;};
        const slug=field('slug'),date=field('date'),modified=field('dateModified');
        if(!slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error('Invalid blog slug');
        for(const value of [date,modified].filter(Boolean)){if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||new Date(value).toISOString().slice(0,10)!==value)throw new Error('Invalid blog date');if(value>TODAY)throw new Error('Blog future date');}
        if(!date)throw new Error('Missing publication date');
        if(modified&&modified<date)throw new Error('Invalid modification before publication');
        posts.push({slug,date,modified});
      }
    }
  }
  const seen=new Set();for(const post of posts){if(seen.has(post.slug))throw new Error('duplicate blog slug: '+post.slug);seen.add(post.slug);}
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
  // Imported cornerstone articles were also appended outside the managed
  // block. Rebuild all blog entries once, preserving every non-blog entry.
  xml = xml.replace(/<url\b[^>]*>[\s\S]*?<\/url>/g, entry => /<loc>https:\/\/www\.digiformation\.co\.uk\/blog\//.test(entry) ? '' : entry);

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
  const locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  if(new Set(locs).size!==locs.length)throw new Error('Duplicate sitemap URLs');
  xml=xml.replace(/\n(?:[ \t]*\n)+/g,'\n');
  fs.writeFileSync(SITEMAP, xml);
  console.log(`✓ sitemap.xml synced (${posts.length} blog posts, explicit source dateModified used; no build-date fabrication)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) syncSitemap();
